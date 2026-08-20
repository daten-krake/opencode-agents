#!/usr/bin/env python3
"""Validate and execute detection rule testblocks.

The harness follows the repository detection-test contract:

    <testblock.testdata>

    <query>
    | count

When --execute is used, queries are submitted to Microsoft Graph Advanced
Hunting using MS_GRAPH_* credentials from the environment or from opencode's
Defender credential file.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import yaml


ROOT = Path.cwd()
DEFAULT_DETECTIONS = ROOT / "Detections" / "dev"
DEFAULT_SECRETS = Path.home() / ".local" / "share" / "opencode" / "secrets" / "defender-xdr.env"
GRAPH_SCOPE = "https://graph.microsoft.com/.default"
TOKEN_URL = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
HUNT_URL = "https://graph.microsoft.com/v1.0/security/runHuntingQuery"

XDR_UNSUPPORTED_MARKERS = (
    "_getwatchlist",
    "externaldata",
    "workspace(",
    "adx(",
    "ingestion_time",
)

XDR_UNSUPPORTED_SIGNALS = (
    "failed to resolve",
    "could not be resolved",
    "not supported",
    "not allowed",
    "unknown function",
    "does not refer to any known",
)

EXCLUSION_ENTITY_TYPES = ("IP", "Account", "Host", "FileHash", "Process", "URL")

DURATION_RE = re.compile(
    r"^P(?:(?P<weeks>\d+(?:\.\d+)?)W)?(?:(?P<days>\d+(?:\.\d+)?)D)?"
    r"(?:T(?:(?P<hours>\d+(?:\.\d+)?)H)?(?:(?P<minutes>\d+(?:\.\d+)?)M)?"
    r"(?:(?P<seconds>\d+(?:\.\d+)?)S)?)?$"
)


class QueryHTTPError(RuntimeError):
    def __init__(self, status: int, body: str, retry_after: str | None = None) -> None:
        self.status = status
        self.body = body
        self.retry_after = retry_after
        super().__init__(f"HTTP {status}: {error_message(body)}")


def error_message(body: str) -> str:
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        return body
    error = payload.get("error")
    if isinstance(error, dict):
        message = error.get("message")
        if isinstance(message, str):
            return message
    return body


def retry_delay_seconds(exc: QueryHTTPError) -> int:
    if exc.retry_after:
        try:
            return max(1, int(float(exc.retry_after)))
        except ValueError:
            pass
    match = re.search(r"again in (\d+) seconds", exc.body)
    if match:
        return max(1, int(match.group(1)))
    return 60


def is_xdr_incompatibility_error(exc: QueryHTTPError) -> bool:
    """Return true only for recognizable Sentinel-only XDR incompatibilities."""
    text = error_message(exc.body).lower()
    for marker in XDR_UNSUPPORTED_MARKERS:
        marker_index = text.find(marker)
        if marker_index == -1:
            continue
        window = text[max(0, marker_index - 160) : marker_index + len(marker) + 160]
        if any(signal in window for signal in XDR_UNSUPPORTED_SIGNALS):
            return True
    return False


def duration_seconds(value: object) -> float | None:
    if not isinstance(value, str):
        return None
    match = DURATION_RE.fullmatch(value)
    if not match or not any(match.groupdict().values()):
        return None
    values = {name: float(raw or 0) for name, raw in match.groupdict().items()}
    return (
        values["weeks"] * 604800
        + values["days"] * 86400
        + values["hours"] * 3600
        + values["minutes"] * 60
        + values["seconds"]
    )


class RuleResult:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.engine = "unknown"
        self.status = "NOT RUN"
        self.details: list[str] = []


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip().removeprefix("export ").strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def graph_token() -> str:
    tenant = os.environ.get("MS_GRAPH_TENANT_ID")
    client_id = os.environ.get("MS_GRAPH_CLIENT_ID")
    client_secret = os.environ.get("MS_GRAPH_CLIENT_SECRET")
    if not all((tenant, client_id, client_secret)):
        load_env_file(DEFAULT_SECRETS)
        tenant = os.environ.get("MS_GRAPH_TENANT_ID")
        client_id = os.environ.get("MS_GRAPH_CLIENT_ID")
        client_secret = os.environ.get("MS_GRAPH_CLIENT_SECRET")
    missing = [
        name
        for name, value in [
            ("MS_GRAPH_TENANT_ID", tenant),
            ("MS_GRAPH_CLIENT_ID", client_id),
            ("MS_GRAPH_CLIENT_SECRET", client_secret),
        ]
        if not value
    ]
    if missing:
        raise RuntimeError("missing Graph credentials: " + ", ".join(missing))

    body = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": GRAPH_SCOPE,
            "grant_type": "client_credentials",
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        TOKEN_URL.format(tenant=tenant),
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload["access_token"]


def run_hunting_query(token: str, query: str, timespan: str) -> dict:
    data = json.dumps({"Query": query, "Timespan": timespan}).encode("utf-8")
    request = urllib.request.Request(
        HUNT_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=620) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise QueryHTTPError(exc.code, body, exc.headers.get("Retry-After")) from exc


def run_log_analytics_query(workspace_id: str, query: str, timespan: str) -> list[dict]:
    command = [
        "az",
        "monitor",
        "log-analytics",
        "query",
        "-w",
        workspace_id,
        "--analytics-query",
        query,
        "--timespan",
        timespan,
        "-o",
        "json",
    ]
    completed = subprocess.run(command, check=False, capture_output=True, text=True, timeout=620)
    if completed.returncode != 0:
        stderr = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(stderr)
    return json.loads(completed.stdout)


def normalize_testdata(testdata: object) -> tuple[str | None, str | None]:
    if isinstance(testdata, str):
        if not testdata.strip():
            return None, "testdata must not be empty"
        return testdata.rstrip() + "\n", None
    if isinstance(testdata, list):
        if not testdata:
            return None, "testdata must be a multiline KQL string or non-empty list of multiline KQL strings"
        parts: list[str] = []
        for index, item in enumerate(testdata):
            if not isinstance(item, str) or not item.strip():
                return None, f"testdata[{index}] must be a non-empty multiline KQL string"
            parts.append(item.rstrip())
        return "\n\n".join(parts) + "\n", None
    return None, "testdata must be a multiline KQL string or list of multiline KQL strings"


def strip_one_trailing_semicolon(query: str) -> str:
    stripped = query.rstrip()
    if stripped.endswith(";"):
        stripped = stripped[:-1].rstrip()
    return stripped


def build_harness(rule: dict, block: dict) -> tuple[str | None, str | None]:
    query = rule.get("query")
    if not isinstance(query, str) or not query.strip():
        return None, "query must be a non-empty KQL string"
    testdata, error = normalize_testdata(block.get("testdata"))
    if error:
        return None, error
    return f"{testdata}\n{strip_one_trailing_semicolon(query)}\n| count", None


def validate_rule(rule: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(rule, dict):
        return ["rule YAML must be a mapping"]
    if rule.get("engine") not in {"sentinel", "defender_xdr"}:
        errors.append("engine must be sentinel or defender_xdr")
    if not isinstance(rule.get("query"), str) or not rule.get("query", "").strip():
        errors.append("query must be a non-empty KQL string")
    query = rule.get("query", "") if isinstance(rule.get("query"), str) else ""

    frequency = duration_seconds(rule.get("query_frequency"))
    period = duration_seconds(rule.get("query_period"))
    if "query_frequency" in rule and frequency is None:
        errors.append("query_frequency must be a supported ISO 8601 duration")
    if "query_period" in rule and period is None:
        errors.append("query_period must be a supported ISO 8601 duration")
    if frequency is not None and period is not None and frequency > period:
        errors.append("query_frequency must not exceed query_period")

    data_sources = rule.get("data_sources")
    if (
        not isinstance(data_sources, list)
        or not data_sources
        or not all(isinstance(table, str) and table.strip() for table in data_sources)
    ):
        errors.append("data_sources must be a non-empty list of table names")

    if "exclusions" in rule:
        for entity in EXCLUSION_ENTITY_TYPES:
            if not re.search(rf"(?m)^\s*let\s+exclusion_{entity}\s*=", query):
                errors.append(f"query must declare exclusion_{entity}")

        mapped_entities = {
            mapping.get("entity_type")
            for mapping in rule.get("entity_mapping", [])
            if isinstance(mapping, dict)
        } if isinstance(rule.get("entity_mapping"), list) else set()
        for entity in mapped_entities.intersection(EXCLUSION_ENTITY_TYPES):
            if not re.search(
                rf"(?is)\|\s*where\s+not\s*\([^)]*exclusion_{entity}[^)]*\)", query
            ):
                errors.append(f"query must apply exclusion_{entity} for mapped entity {entity}")

    testblock = rule.get("testblock")
    if not isinstance(testblock, list) or not testblock:
        errors.append("testblock must be a non-empty list")
        return errors
    for index, block in enumerate(testblock):
        if not isinstance(block, dict):
            errors.append(f"testblock[{index}] must be a mapping")
            continue
        if not isinstance(block.get("expected"), int):
            errors.append(f"testblock[{index}].expected must be an integer")
        _, error = normalize_testdata(block.get("testdata"))
        if error:
            errors.append(f"testblock[{index}].{error}")
            continue
        if isinstance(data_sources, list):
            normalized, _ = normalize_testdata(block.get("testdata"))
            assert normalized is not None
            for table in data_sources:
                if isinstance(table, str) and not re.search(
                    rf"(?m)^\s*let\s+{re.escape(table)}\s*=", normalized
                ):
                    errors.append(f"testblock[{index}] must define data source {table}")
    return errors


def count_from_response(payload: dict) -> int:
    results = payload.get("results") or payload.get("Results") or []
    if not results:
        raise RuntimeError("query returned no count row")
    row = results[0]
    if "Count" in row:
        return int(row["Count"])
    if "count" in row:
        return int(row["count"])
    if len(row) == 1:
        return int(next(iter(row.values())))
    raise RuntimeError("count column not found in response row")


def count_from_log_analytics(rows: list[dict]) -> int:
    if not rows:
        raise RuntimeError("query returned no count row")
    row = rows[0]
    if "Count" in row:
        return int(row["Count"])
    if "count" in row:
        return int(row["count"])
    if len(row) == 1:
        return int(next(iter(row.values())))
    raise RuntimeError("count column not found in response row")


def iter_rule_paths(paths: list[str]) -> list[Path]:
    if not paths:
        return sorted(DEFAULT_DETECTIONS.glob("*.yaml"), key=lambda p: p.as_posix().lower())
    rule_paths: list[Path] = []
    for raw_path in paths:
        path = Path(raw_path)
        if path.is_dir():
            rule_paths.extend(sorted(path.glob("*.yaml"), key=lambda p: p.as_posix().lower()))
        else:
            rule_paths.append(path)
    return rule_paths


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and execute detection rule testblocks")
    parser.add_argument("paths", nargs="*", help="Rule files or directories. Defaults to Detections/dev")
    parser.add_argument("--execute", action="store_true", help="Execute test harnesses through Defender XDR Advanced Hunting")
    parser.add_argument("--timespan", default="P30D", help="Graph hunting query timespan")
    parser.add_argument("--sentinel-workspace", default=os.environ.get("LOG_ANALYTICS_WORKSPACE_ID"), help="Log Analytics workspace ID for sentinel rules")
    parser.add_argument("--all-via-defender", action="store_true", help="Execute sentinel and defender_xdr rules through Defender XDR Advanced Hunting")
    parser.add_argument(
        "--sentinel-xdr-errors",
        choices=["error", "warn"],
        default="error",
        help="Classify recognizable Sentinel-only XDR incompatibilities as errors or warnings",
    )
    parser.add_argument("--engine", choices=["sentinel", "defender_xdr"], help="Only test one engine")
    parser.add_argument("--limit", type=int, help="Limit number of rule files processed")
    parser.add_argument("--start", type=int, default=0, help="Skip this many sorted rule files before processing")
    parser.add_argument("--delay", type=float, default=0.0, help="Sleep this many seconds after each executed query")
    parser.add_argument("--retries", type=int, default=2, help="Retries for HTTP 429 throttling responses")
    parser.add_argument("--harness-dir", type=Path, help="Write generated KQL harnesses to this directory")
    args = parser.parse_args()

    needs_graph = args.execute and (args.all_via_defender or args.engine != "sentinel")
    token = graph_token() if needs_graph else ""
    paths = iter_rule_paths(args.paths)
    if args.start:
        paths = paths[args.start :]
    if args.limit is not None:
        paths = paths[: args.limit]

    summary = {
        "PASS": 0,
        "FAIL": 0,
        "FAIL schema": 0,
        "ERROR": 0,
        "WARN_XDR_INCOMPATIBLE": 0,
        "NOT EXECUTED": 0,
    }
    if args.harness_dir:
        args.harness_dir.mkdir(parents=True, exist_ok=True)

    for path in paths:
        result = RuleResult(path)
        try:
            rule = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001 - report exact file failures and continue.
            print(f"FAIL schema {path}: YAML parse error: {exc}")
            summary["FAIL schema"] += 1
            continue

        if isinstance(rule, dict):
            result.engine = str(rule.get("engine", "unknown"))
        if args.engine and result.engine != args.engine:
            continue

        errors = validate_rule(rule)
        if errors:
            print(f"FAIL schema {path}: " + "; ".join(errors))
            summary["FAIL schema"] += 1
            continue

        assert isinstance(rule, dict)
        blocks = rule["testblock"]
        for index, block in enumerate(blocks):
            harness, error = build_harness(rule, block)
            if error:
                print(f"FAIL schema {path} testblock[{index}]: {error}")
                summary["FAIL schema"] += 1
                continue
            assert harness is not None
            if args.harness_dir:
                harness_path = args.harness_dir / f"{path.stem}.testblock-{index}.kql"
                harness_path.write_text(harness + "\n", encoding="utf-8")
            if not args.execute:
                print(f"NOT EXECUTED {path} testblock[{index}]", flush=True)
                summary["NOT EXECUTED"] += 1
                continue
            expected = block["expected"]
            started = time.time()
            try:
                for attempt in range(args.retries + 1):
                    try:
                        if result.engine == "sentinel" and not args.all_via_defender:
                            if not args.sentinel_workspace:
                                print(f"NOT EXECUTED {path} testblock[{index}]: no Sentinel workspace configured", flush=True)
                                summary["NOT EXECUTED"] += 1
                                actual = None
                                break
                            actual = count_from_log_analytics(run_log_analytics_query(args.sentinel_workspace, harness, args.timespan))
                        else:
                            actual = count_from_response(run_hunting_query(token, harness, args.timespan))
                        break
                    except QueryHTTPError as exc:
                        if exc.status != 429 or attempt >= args.retries:
                            raise
                        wait_seconds = retry_delay_seconds(exc) + 1
                        print(f"RETRY {path} testblock[{index}]: HTTP 429, sleeping {wait_seconds}s", flush=True)
                        time.sleep(wait_seconds)
                else:
                    actual = None
                if actual is None:
                    continue
            except QueryHTTPError as exc:
                if (
                    result.engine == "sentinel"
                    and args.all_via_defender
                    and args.sentinel_xdr_errors == "warn"
                    and is_xdr_incompatibility_error(exc)
                ):
                    print(
                        f"WARN_XDR_INCOMPATIBLE {path} testblock[{index}]: "
                        f"{error_message(exc.body)}",
                        flush=True,
                    )
                    summary["WARN_XDR_INCOMPATIBLE"] += 1
                else:
                    print(f"ERROR {path} testblock[{index}]: {exc}", flush=True)
                    summary["ERROR"] += 1
                if args.delay > 0:
                    time.sleep(args.delay)
                continue
            except Exception as exc:  # noqa: BLE001 - keep batch testing alive.
                print(f"ERROR {path} testblock[{index}]: {exc}", flush=True)
                summary["ERROR"] += 1
                if args.delay > 0:
                    time.sleep(args.delay)
                continue
            if args.delay > 0:
                time.sleep(args.delay)
            elapsed = time.time() - started
            if actual == expected:
                print(f"PASS {path} testblock[{index}] expected={expected} actual={actual} elapsed={elapsed:.1f}s", flush=True)
                summary["PASS"] += 1
            else:
                print(f"FAIL {path} testblock[{index}]: expected {expected}, got {actual} elapsed={elapsed:.1f}s", flush=True)
                summary["FAIL"] += 1

    print("SUMMARY " + json.dumps(summary, sort_keys=True), flush=True)
    return 1 if summary["FAIL"] or summary["FAIL schema"] or summary["ERROR"] else 0


if __name__ == "__main__":
    sys.exit(main())
