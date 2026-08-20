---
name: detection-test
description: Use when testing detection YAML rules that contain testblock, testdata, expected, query, or validating exact alert counts with a testblock | query | count harness for Sentinel or Defender XDR detections.
---

# Detection Test

Use this skill to validate a detection rule's standard-schema `testblock` against its `query`.

The test contract is always:

```kql
<testblock.testdata>

<query>
| count
```

The returned count must exactly match the integer in `testblock.expected`.

## Required YAML Shape

The rule must contain:

```yaml
engine: sentinel # sentinel|defender_xdr
data_sources:
  - <TableName>
query: |-
    <detection KQL>
testblock:
  - testdata: |
      let <TableName> = datatable(<ColumnName>:<Type>, ...)
      [
          <rows>
      ];
    expected: 1
```

Repo conventions may also split setup into multiple KQL blocks. This shape is
valid and must be handled by concatenating the strings in order:

```yaml
testblock:
  - testdata:
      - |
        let <TableName1> = datatable(...)
        [
            <rows>
        ];
      - |
        let <TableName2> = datatable(...)
        [
            <rows>
        ];
    expected: 1
```

Schema rules:

- `engine` must be `sentinel` or `defender_xdr`.
- `query` must be a non-empty KQL string.
- `testblock` must be a non-empty list.
- Each `testblock` item must have `testdata` as either a multiline KQL string or a non-empty list of multiline KQL strings.
- Each `testblock` item must have `expected` as an integer.
- `testdata` must define every source table necessary for the query, normally with one `let <TableName> = datatable(...) [...] ;` statement per table in `data_sources`.
- `testdata` must be executable KQL setup, not prose, JSON, CSV, or structured data. A YAML list is valid only when every item is a KQL setup string.

If the schema is invalid, report the test as failed due to schema validation. Do not invent test data.

## Harness Construction

For each `testblock` entry, construct one independent test query:

1. Take the `testdata` multiline string exactly as KQL setup.
2. If `testdata` is a list, concatenate every KQL string in order, separated by a blank line.
3. Take the detection `query` exactly as written.
4. Strip one trailing semicolon from the detection query if present, because the final `| count` must pipe from the query.
5. Append `| count` as the final operator.
6. Do not append any operator, projection, assertion, comment, or semicolon after `| count`.

The final line must be exactly:

```kql
| count
```

Always append the final `| count`, even if the detection query already contains a `count`, `summarize`, `project`, or another terminal-looking operator.

## Execution

Run the harness for every engine through Defender XDR when the factory invokes
this skill. The rule's `engine` does not control factory test routing.

- Use the Defender XDR Advanced Hunting execution path for both
  `engine: defender_xdr` and `engine: sentinel`.
- Attempt every test; do not skip Sentinel rules based on metadata.
- A demonstrated Sentinel-only platform incompatibility is a warning, not proof
  that the Sentinel query is valid.
- Ordinary syntax errors, missing test tables, invalid columns, and incorrect
  counts remain failures.

Preferred factory command:

```bash
python3 skills/detection-test/scripts/test-detection-rules.py \
  <rule-path> \
  --execute \
  --all-via-defender \
  --sentinel-xdr-errors warn
```

Factory implementers and reviewers have no Bash permission. Invoke this command
through `detection-factory-runner` with `source_kind: factory`; resolve both the
`source` field and the script argv entry to this skill's linked
`scripts/test-detection-rules.py` path. Outside the factory, run the command
normally.

The factory runner injects Graph credentials only into this verified script.
Agents must never read credential or environment files directly. If the runner
cannot supply credentials or reach Defender XDR, report
`WARN_VALIDATION_UNAVAILABLE` and continue to static review; do not probe secret
paths or alternate commands.

Outside the factory, the script keeps `--sentinel-xdr-errors error` as the safer
default and may use a configured Log Analytics workspace when
`--all-via-defender` is omitted.

When executing through a live tenant, the synthetic `let <TableName> = datatable(...)` definitions in `testdata` must shadow the live tables. The test should not depend on live production rows. When `testdata` is a list, all setup blocks are included before the detection query in the same execution.

## Result Check

Compare the count result to `expected` as an exact integer match.

- PASS: actual count equals `expected`.
- FAIL: actual count does not equal `expected`.
- FAIL: the rule or `testblock` violates the required schema.
- NOT EXECUTED: no execution path exists for the rule engine in the current environment.
- WARN_XDR_INCOMPATIBLE: a recognizable Sentinel-only construct cannot execute
  on the Defender XDR Kusto surface. Keep this warning in the review and PR.
- WARN_VALIDATION_UNAVAILABLE: runner, credential, or telemetry infrastructure
  is unavailable. Keep the missing evidence and impact in the review and PR.

Keep the result concise. Unless the user asks for the generated KQL, report only pass/fail status per test case and the expected/actual values for failures.

Preferred output:

```text
PASS testblock[0]
```

Failure output:

```text
FAIL testblock[0]: expected 1, got 0
```

Schema failure output:

```text
FAIL schema: testblock[0].testdata must be a multiline KQL string or list of multiline KQL strings
```

Compatibility warning output:

```text
WARN_XDR_INCOMPATIBLE testblock[0]: <platform incompatibility>
```

## Guardrails

- Do not rewrite detection logic while testing.
- Do not remove exclusion scaffolding from the query.
- Do not change the detection's filters to make a test pass.
- Do not merge multiple `testblock` entries into one run; each entry is an independent test case.
- Do not use production table data as a substitute for missing `testdata`.
- Do not use `summarize count()` as the final check. The final operator must be `| count`.
- Do not add an inline assertion table after the final count. Pass/fail is evaluated outside the KQL result.
