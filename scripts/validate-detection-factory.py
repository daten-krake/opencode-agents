#!/usr/bin/env python3
"""Validate detection-factory profiles, agents, contracts, tools, and links."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys

import yaml


ROOT = Path(__file__).resolve().parents[1]
GLOBAL_CONFIG = Path.home() / ".config" / "opencode" / "opencode.json"

AGENTS = {
    "detection-factory-cloud": ("primary", "openai/gpt-5.6-sol", 96),
    "detection-factory-local": ("primary", "lmstudio/qwen/qwen3.6-35b-a3b", 96),
    "detection-scout": ("subagent", "ollama-cloud/deepseek-v4-flash:0731", 20),
    "detection-scout-local": ("subagent", "lmstudio/qwen3.5-4b", 20),
    "detection-planner": ("subagent", "ollama-cloud/glm-5.2", 28),
    "detection-planner-local": ("subagent", "lmstudio/qwen/qwen3.6-35b-a3b", 28),
    "detection-implementer": ("subagent", "ollama-cloud/deepseek-v4-flash:0731", 36),
    "detection-implementer-local": ("subagent", "lmstudio/qwen/qwen3.6-35b-a3b", 36),
    "detection-reviewer": ("subagent", "openai/gpt-5.6-sol", 32),
    "detection-reviewer-auto": ("subagent", "openai/gpt-5.6-sol", 32),
    "detection-reviewer-local": ("subagent", "lmstudio/zai-org/glm-4.7-flash", 32),
    "detection-reviewer-local-auto": ("subagent", "lmstudio/zai-org/glm-4.7-flash", 32),
    "detection-metadata-reviewer": ("subagent", "openai/gpt-5.6-sol", 4),
    "detection-metadata-reviewer-local": ("subagent", "lmstudio/zai-org/glm-4.7-flash", 4),
    "detection-cti": ("subagent", "ollama-cloud/deepseek-v4-pro", 20),
    "detection-cti-local": ("subagent", "lmstudio/qwen/qwen3.6-35b-a3b", 20),
    "detection-adversary": ("subagent", "ollama-cloud/deepseek-v4-pro", 20),
    "detection-adversary-local": ("subagent", "lmstudio/qwen/qwen3.6-35b-a3b", 20),
    "detection-purple": ("subagent", "ollama-cloud/deepseek-v4-pro", 20),
    "detection-purple-local": ("subagent", "lmstudio/qwen/qwen3.6-35b-a3b", 20),
}

SKILLS = {
    "detection-factory": ROOT / "skills" / "detection-factory" / "SKILL.md",
    "detection-factory-core": ROOT / "skills" / "detection-factory-core" / "SKILL.md",
    "detection-factory-local": ROOT / "skills" / "detection-factory-local" / "SKILL.md",
    "detection-factory-metadata": ROOT / "skills" / "detection-factory-metadata" / "SKILL.md",
    "detection-engineering": ROOT / "agents" / "detection_engineer" / "knowledge" / "SKILL.md",
    "detection-review": ROOT / "skills" / "detection-review" / "SKILL.md",
    "threat-informed-detection": ROOT / "agents" / "cti" / "knowledge" / "SKILL.md",
    "detection-test": ROOT / "skills" / "detection-test" / "SKILL.md",
    "defender-xdr-hunt": ROOT / "skills" / "defender-xdr-hunt" / "SKILL.md",
}

TOOLS = {
    "defender-xdr-hunt.ts": ROOT / "tools" / "defender-xdr-hunt.ts",
    "detection-factory-runner.ts": ROOT / "tools" / "detection-factory-runner.ts",
    "detection-factory-state.ts": ROOT / "tools" / "detection-factory-state.ts",
}

COMMANDS = {
    "detection-factory": "detection-factory-cloud",
    "detection-factory-local": "detection-factory-local",
}

PROFILE_MAPS = {
    "cloud": {
        "path": ROOT / "skills" / "detection-factory" / "SKILL.md",
        "map": {
            "profile": "cloud",
            "controller": "detection-factory-cloud",
            "scout": "detection-scout",
            "planner": "detection-planner",
            "implementer": "detection-implementer",
            "reviewer": "detection-reviewer",
            "metadata_reviewer": "detection-metadata-reviewer",
            "advisers": {
                "cti": "detection-cti",
                "adversary": "detection-adversary",
                "purple": "detection-purple",
            },
            "models": {
                "controller": "openai/gpt-5.6-sol",
                "scout": "ollama-cloud/deepseek-v4-flash:0731",
                "planner": "ollama-cloud/glm-5.2",
                "implementer": "ollama-cloud/deepseek-v4-flash:0731",
                "reviewer": "openai/gpt-5.6-sol",
                "metadata_reviewer": "openai/gpt-5.6-sol",
                "advisers": "ollama-cloud/deepseek-v4-pro",
            },
        },
    },
    "local": {
        "path": ROOT / "skills" / "detection-factory-local" / "SKILL.md",
        "map": {
            "profile": "local",
            "controller": "detection-factory-local",
            "scout": "detection-scout-local",
            "planner": "detection-planner-local",
            "implementer": "detection-implementer-local",
            "reviewer": "detection-reviewer-local",
            "metadata_reviewer": "detection-metadata-reviewer-local",
            "advisers": {
                "cti": "detection-cti-local",
                "adversary": "detection-adversary-local",
                "purple": "detection-purple-local",
            },
            "models": {
                "controller": "lmstudio/qwen/qwen3.6-35b-a3b",
                "scout": "lmstudio/qwen3.5-4b",
                "planner": "lmstudio/qwen/qwen3.6-35b-a3b",
                "implementer": "lmstudio/qwen/qwen3.6-35b-a3b",
                "reviewer": "lmstudio/zai-org/glm-4.7-flash",
                "metadata_reviewer": "lmstudio/zai-org/glm-4.7-flash",
                "advisers": "lmstudio/qwen/qwen3.6-35b-a3b",
            },
        },
    },
}

CONTROLLER_TASKS = {
    "detection-factory-cloud": {
        "detection-scout",
        "detection-planner",
        "detection-implementer",
        "detection-reviewer",
        "detection-metadata-reviewer",
    },
    "detection-factory-local": {
        "detection-scout-local",
        "detection-planner-local",
        "detection-implementer-local",
        "detection-reviewer-local",
        "detection-metadata-reviewer-local",
    },
}

PLANNER_TASKS = {
    "detection-planner": {"detection-cti", "detection-adversary", "detection-purple"},
    "detection-planner-local": {
        "detection-cti-local",
        "detection-adversary-local",
        "detection-purple-local",
    },
}

HANDOFF_INPUTS = {
    "detection-scout": "IntakeContract",
    "detection-scout-local": "IntakeContract",
    "detection-reviewer": "ImplementationHandoff",
    "detection-reviewer-local": "ImplementationHandoff",
    "detection-reviewer-auto": "ImplementationHandoff",
    "detection-reviewer-local-auto": "ImplementationHandoff",
    "detection-metadata-reviewer": "MetadataImplementationHandoff",
    "detection-metadata-reviewer-local": "MetadataImplementationHandoff",
    "detection-cti": "AdviserRequest",
    "detection-cti-local": "AdviserRequest",
    "detection-adversary": "AdviserRequest",
    "detection-adversary-local": "AdviserRequest",
    "detection-purple": "AdviserRequest",
    "detection-purple-local": "AdviserRequest",
}

REVIEWERS = {
    "detection-reviewer",
    "detection-reviewer-auto",
    "detection-reviewer-local",
    "detection-reviewer-local-auto",
    "detection-metadata-reviewer",
    "detection-metadata-reviewer-local",
}

RUNNER_AGENTS = REVIEWERS | {
    "detection-implementer",
    "detection-implementer-local",
}

ADVISERS = {
    "detection-cti",
    "detection-cti-local",
    "detection-adversary",
    "detection-adversary-local",
    "detection-purple",
    "detection-purple-local",
}


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def frontmatter(path: Path) -> dict:
    content = text(path)
    if not content.startswith("---\n"):
        raise ValueError("missing opening frontmatter delimiter")
    try:
        raw = content.split("---\n", 2)[1]
    except IndexError as exc:
        raise ValueError("missing closing frontmatter delimiter") from exc
    value = yaml.safe_load(raw)
    if not isinstance(value, dict):
        raise ValueError("frontmatter must be a mapping")
    return value


def first_yaml_block(path: Path) -> dict:
    match = re.search(r"```yaml\n(.*?)\n```", text(path), flags=re.DOTALL)
    if not match:
        raise ValueError("missing fenced YAML mapping")
    value = yaml.safe_load(match.group(1))
    if not isinstance(value, dict):
        raise ValueError("first fenced YAML block must be a mapping")
    return value


def allowed_tasks(config: dict) -> set[str]:
    value = config.get("permission", {}).get("task")
    if not isinstance(value, dict):
        return set()
    return {name for name, action in value.items() if action == "allow"}


def validate_links() -> list[str]:
    errors: list[str] = []
    global_root = Path.home() / ".config" / "opencode"

    expected: dict[Path, Path] = {}
    for name in AGENTS:
        expected[global_root / "agents" / f"{name}.md"] = ROOT / "agents" / name / f"{name}.md"
    for name, source in SKILLS.items():
        expected[global_root / "skills" / name] = source.parent
    for name in COMMANDS:
        expected[global_root / "commands" / f"{name}.md"] = ROOT / "commands" / f"{name}.md"
    for name, source in TOOLS.items():
        expected[global_root / "tools" / name] = source

    for destination, source in expected.items():
        if not destination.is_symlink():
            errors.append(f"missing managed symlink: {destination}")
            continue
        if destination.resolve() != source.resolve():
            errors.append(f"wrong symlink target: {destination} -> {destination.resolve()}")
    return errors


def validate(check_links: bool = False) -> list[str]:
    errors: list[str] = []
    agent_configs: dict[str, dict] = {}

    for name, (mode, model, steps) in AGENTS.items():
        path = ROOT / "agents" / name / f"{name}.md"
        if not path.exists():
            errors.append(f"missing agent: {path.relative_to(ROOT)}")
            continue
        try:
            config = frontmatter(path)
        except Exception as exc:  # noqa: BLE001 - aggregate validation failures.
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
            continue
        if config.get("mode") != mode:
            errors.append(f"{name}: expected mode {mode}, got {config.get('mode')}")
        if config.get("model") != model:
            errors.append(f"{name}: expected model {model}, got {config.get('model')}")
        if config.get("steps") != steps:
            errors.append(f"{name}: expected steps {steps}, got {config.get('steps')}")
        if "tools" in config:
            errors.append(f"{name}: deprecated tools frontmatter is not allowed")
        if not isinstance(config.get("permission"), dict):
            errors.append(f"{name}: explicit permission mapping is required")
        agent_configs[name] = config

    for name, expected in CONTROLLER_TASKS.items():
        config = agent_configs.get(name, {})
        if allowed_tasks(config) != expected:
            errors.append(f"{name}: task allowlist must be exactly {sorted(expected)}")
        permissions = config.get("permission", {})
        for capability in ("read", "edit", "glob", "grep", "list"):
            if permissions.get(capability) != "deny":
                errors.append(f"{name}: controller {capability} permission must be deny")
        if permissions.get("detection-factory-state") != "allow":
            errors.append(f"{name}: detection-factory-state must be allowed")
        if permissions.get("defender-xdr-hunt") != "allow":
            errors.append(f"{name}: bounded XDR preflight must be allowed")
        if permissions.get("detection-factory-runner") != "deny":
            errors.append(f"{name}: controllers must not execute worker validation commands")
        if permissions.get("todowrite") != "deny":
            errors.append(f"{name}: controllers must use checkpoints instead of todo turns")
        bash = permissions.get("bash", {})
        if not isinstance(bash, dict):
            errors.append(f"{name}: controller bash permission must be a mapping")
        else:
            for forbidden in (
                "git add -- *",
                "git commit -m *",
                "git diff*",
                "sha256sum /tmp/opencode/detection-factory/*",
            ):
                if bash.get(forbidden) == "allow":
                    errors.append(f"{name}: unsafe broad command remains allowed: {forbidden}")
            if bash.get("git push -u origin HEAD") != "allow":
                errors.append(f"{name}: push must be constrained to current HEAD")
            for clock_command in ("date -u +%Y%m%dT%H%M%SZ", "date -u +%Y-%m-%dT%H:%M:%SZ"):
                if bash.get(clock_command) != "allow":
                    errors.append(f"{name}: deterministic UTC clock command must be allowed: {clock_command}")
            issue_view = "gh issue view * --json number,title,body,labels,assignees,milestone,createdAt,url"
            if bash.get(issue_view) != "allow":
                errors.append(f"{name}: issue detail fields must use the fixed allowlist")

    for name, expected in PLANNER_TASKS.items():
        if allowed_tasks(agent_configs.get(name, {})) != expected:
            errors.append(f"{name}: adviser allowlist must be exactly {sorted(expected)}")

    for name in REVIEWERS:
        config = agent_configs.get(name, {})
        if config.get("permission", {}).get("task") != "deny":
            errors.append(f"{name}: reviewer task permission must be deny")
        if name.endswith("-auto") and config.get("hidden") is not True:
            errors.append(f"{name}: compatibility alias must be hidden")

    for name in ADVISERS:
        permissions = agent_configs.get(name, {}).get("permission", {})
        for capability in ("glob", "grep", "list"):
            if permissions.get(capability) != "deny":
                errors.append(f"{name}: adviser {capability} permission must be deny")

    for name, config in agent_configs.items():
        if name in CONTROLLER_TASKS:
            continue
        if config.get("permission", {}).get("detection-factory-state") != "deny":
            errors.append(f"{name}: only controllers may use detection-factory-state")

    for name, config in agent_configs.items():
        permissions = config.get("permission", {})
        if permissions.get("external_directory") != "deny":
            errors.append(f"{name}: external_directory must be denied to prevent autonomous permission waits")
        expected = "allow" if name in RUNNER_AGENTS else "deny"
        if permissions.get("detection-factory-runner") != expected:
            errors.append(f"{name}: detection-factory-runner permission must be {expected}")
        if name in RUNNER_AGENTS and permissions.get("bash") != "deny":
            errors.append(f"{name}: autonomous workers must use the runner with bash denied")
        if name in RUNNER_AGENTS and permissions.get("defender-xdr-hunt") != "deny":
            errors.append(f"{name}: workers must use runner-mediated XDR instead of the direct tool")
        if name in RUNNER_AGENTS and permissions.get("todowrite") != "deny":
            errors.append(f"{name}: single-contract workers must not spend turns on todo state")
        read_permission = permissions.get("read")
        if read_permission != "deny":
            if not isinstance(read_permission, dict) or read_permission.get("*") != "allow":
                errors.append(f"{name}: readable roles must use an explicit default-allow read mapping")
            for pattern in ("**/.git/**", "**/.env", "**/.env.*"):
                if not isinstance(read_permission, dict) or read_permission.get(pattern) != "deny":
                    errors.append(f"{name}: read permission must deny sensitive pattern {pattern}")
        if name in {"detection-implementer", "detection-implementer-local"}:
            edit = permissions.get("edit", {})
            if not isinstance(edit, dict) or edit.get("*") != "deny":
                errors.append(f"{name}: implementation edits must default deny")
            for pattern in ("**/*.yml", "**/*.yaml", "**/*.kql"):
                if not isinstance(edit, dict) or edit.get(pattern) != "allow":
                    errors.append(f"{name}: missing rule-file edit allowlist {pattern}")
            if not isinstance(edit, dict) or edit.get("**/.steward-state.json") != "allow":
                errors.append(f"{name}: steward audit state must be explicitly editable")

    for name, expected_contract in HANDOFF_INPUTS.items():
        prompt = text(ROOT / "agents" / name / f"{name}.md")
        if not re.search(rf"Consume\s+exactly\s+one\s+`{expected_contract}`", prompt):
            errors.append(f"{name}: must consume exactly one {expected_contract}")

    for name in ("detection-planner", "detection-planner-local"):
        prompt = text(ROOT / "agents" / name / f"{name}.md")
        if "exactly one `ScoutContract`" not in prompt or "exactly one `PlanRevisionContract`" not in prompt:
            errors.append(f"{name}: planner must accept only ScoutContract or PlanRevisionContract")

    for name in ("detection-implementer", "detection-implementer-local"):
        prompt = text(ROOT / "agents" / name / f"{name}.md")
        if "Consume exactly one" not in prompt or "`ApprovedPlanContract`" not in prompt or "`RepairContract`" not in prompt:
            errors.append(f"{name}: must accept only ApprovedPlanContract or RepairContract")

    for name, (_, model, _) in AGENTS.items():
        if name.endswith("-local") or "-local-auto" in name:
            if not model.startswith("lmstudio/"):
                errors.append(f"{name}: local role uses non-local model {model}")

    for profile, spec in PROFILE_MAPS.items():
        try:
            actual = first_yaml_block(spec["path"])
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{spec['path'].relative_to(ROOT)}: {exc}")
            continue
        if actual != spec["map"]:
            errors.append(f"{profile} profile role/model map does not match the immutable contract")
        serialized = json.dumps(actual)
        if "reviewer_auto" in serialized or "reviewer_gated" in serialized:
            errors.append(f"{profile} profile must use one independent reviewer")

    for name, path in SKILLS.items():
        if not path.exists():
            errors.append(f"missing skill: {path.relative_to(ROOT)}")
            continue
        try:
            config = frontmatter(path)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
            continue
        if config.get("name") != name:
            errors.append(f"{path.relative_to(ROOT)}: expected skill name {name}")
        if not config.get("description"):
            errors.append(f"{path.relative_to(ROOT)}: skill description is required")

    for name, path in TOOLS.items():
        if not path.exists():
            errors.append(f"missing tool: tools/{name}")

    state_tool = text(ROOT / "tools" / "detection-factory-state.ts")
    if "detection-factory-cloud" not in state_tool or "detection-factory-local" not in state_tool:
        errors.append("detection-factory-state: tool must enforce the controller allowlist")
    if (
        "stage_reviewed" not in state_tool
        or "commit_reviewed" not in state_tool
        or "verify_commit" not in state_tool
        or "worktreeFingerprint" not in state_tool
        or "probe_metadata" not in state_tool
        or "prepare_metadata" not in state_tool
    ):
        errors.append("detection-factory-state: reviewed diff verification and staging are required")

    runner_tool = text(ROOT / "tools" / "detection-factory-runner.ts")
    if (
        "shell: false" not in runner_tool
        or "run_validation" not in runner_tool
        or "inspect_diff" not in runner_tool
        or "inspect_metadata_diff" not in runner_tool
    ):
        errors.append("detection-factory-runner: constrained diff and validation operations are required")
    if 'EXECUTABLES = new Set(["python3"])' not in runner_tool or "SAFE_GIT_ENV" not in runner_tool:
        errors.append("detection-factory-runner: Python-only execution and sanitized Git environment are required")

    for name, agent in COMMANDS.items():
        path = ROOT / "commands" / f"{name}.md"
        if not path.exists():
            errors.append(f"missing command: {path.relative_to(ROOT)}")
            continue
        try:
            config = frontmatter(path)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
            continue
        if config.get("agent") != agent:
            errors.append(f"{name}: expected command agent {agent}")
        command_text = text(path)
        if "autonomous execution" not in command_text or "--gated" not in command_text:
            errors.append(f"{name}: command must document autonomous default and --gated")

    core = text(ROOT / "skills" / "detection-factory-core" / "SKILL.md")
    required_core_phrases = (
        "Default mode is `auto`",
        "Every delegated stage receives exactly one immediate-predecessor handoff",
        "Planner XDR use never exceeds eight calls",
        "invoke a fresh reviewer session",
        "Do not perform a third full validator or XDR run",
        "max_repair_passes: 1",
        "WARN_VALIDATION_UNAVAILABLE",
        "zero permission waits",
        "detection-factory-state",
    )
    for phrase in required_core_phrases:
        if phrase not in core:
            errors.append(f"detection-factory-core: missing invariant: {phrase}")
    for forbidden in ("reviewer_gated", "reviewer_auto", "Default mode is `gated`"):
        if forbidden in core:
            errors.append(f"detection-factory-core: obsolete workflow reference: {forbidden}")

    metadata_fast_path = text(ROOT / "skills" / "detection-factory-metadata" / "SKILL.md")
    for phrase in (
        "Load the full",
        "pre-mutation eligibility failure",
        "inspect_metadata_diff",
        "MetadataImplementationHandoff",
        "MetadataReviewHandoff",
        "zero questions, permission waits, repairs, and full-pipeline",
    ):
        if phrase not in metadata_fast_path:
            errors.append(f"detection-factory-metadata: missing invariant: {phrase}")

    hunt_tool = text(ROOT / "tools" / "defender-xdr-hunt.ts")
    if "FACTORY_PLANNER_QUERY_LIMIT = 8" not in hunt_tool:
        errors.append("defender-xdr-hunt: factory planner query budget must be 8")
    if "-planner-xdr-${slot}.slot" not in hunt_tool or 'openSync(path, "wx"' not in hunt_tool:
        errors.append("defender-xdr-hunt: planner query budget slots must be claimed atomically")

    stats = ROOT / "DETECTION_FACTORY_STATS.md"
    if not stats.exists():
        errors.append("missing DETECTION_FACTORY_STATS.md")
    elif "5,910,030" not in text(stats) or "165.1m" not in text(stats):
        errors.append("DETECTION_FACTORY_STATS.md: baseline measurements are missing")

    stage_model = ROOT / "agents" / "detection_engineer" / "knowledge" / "methodology" / "stage-model.md"
    if re.search(r"`stage:(?:indicator|behavioral|analytic)`", text(stage_model)):
        errors.append("stage-model.md still contains a legacy stage tag")

    if GLOBAL_CONFIG.exists():
        try:
            config = json.loads(text(GLOBAL_CONFIG))
            models = config["provider"]["lmstudio"]["models"]
            if "zai-org/glm-4.7-flash" not in models:
                errors.append("global config does not register zai-org/glm-4.7-flash")
            if config.get("subagent_depth", 1) < 3:
                errors.append("global subagent_depth must be at least 3")
            cloud_timeouts = config["provider"]["ollama-cloud"]["options"]
            expected_timeouts = {"timeout": 600000, "headerTimeout": 60000, "chunkTimeout": 120000}
            for name, expected in expected_timeouts.items():
                if cloud_timeouts.get(name) != expected:
                    errors.append(f"global ollama-cloud {name} must be {expected}")
        except (KeyError, json.JSONDecodeError) as exc:
            errors.append(f"invalid global OpenCode config: {exc}")

    if check_links:
        errors.extend(validate_links())

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-links", action="store_true", help="Verify deployed global symlinks")
    args = parser.parse_args()

    errors = validate(check_links=args.check_links)
    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1
    print(
        "PASS detection factory wiring "
        f"({len(AGENTS)} agents, {len(SKILLS)} skills, {len(COMMANDS)} commands, {len(TOOLS)} tools)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
