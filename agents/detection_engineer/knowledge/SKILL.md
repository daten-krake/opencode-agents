---
name: detection-engineering
description: Use for planning, implementing, testing, or reviewing Microsoft Sentinel and Defender XDR detection rules, KQL, ATT&CK mappings, capability abstraction, rule YAML, entity mappings, exclusions, and testblocks.
---

# Detection Engineering

Use this skill as the shared domain contract for every detection-factory role.
Repository-local instructions, schemas, validators, and neighboring rules take
precedence over this fallback contract. Never force this schema onto a repository
that defines a different one.

## Reference Workflow

Factory roles must respect handoff boundaries:

- The scout performs broad repository discovery once.
- A planner with a `ScoutContract` trusts cited repository evidence and reads
  only exact cited paths or exact paths named by material gaps.
- An implementer reads only contract-allowed files and cited supporting sources;
  it does not rediscover design or validator provenance.
- A reviewer independently reads the actual diff and cited authoritative
  instructions/schema, but does not receive or reread the full factory history.
- A threat adviser receives only `AdviserRequest` and does not explore the
  target repository.

When no factory handoff supplies repository evidence, use this standalone
workflow before designing or changing a query:

1. Read the target repository's instructions and rule schema.
2. Read the nearest valid rules for naming, layout, metadata, and tests.
3. Select the engine and target tables.
4. Read `defender-xdr/schema-index.md` or `sentinel/schema-index.md`.
5. Read every relevant per-table reference file before using columns.
6. Read `kql/platform-diff.md` before using platform-specific syntax.
7. Use live schema probes only when static references are insufficient.

The files in this skill directory are reference material, not agents. Load only
the files relevant to the current rule.

## Detection Method

Apply capability abstraction before writing KQL:

1. `tool`: a specific binary, hash, string, domain, or other artifact.
2. `procedure`: a particular command, API sequence, or actor workflow.
3. `technique`: the observable behavior independent of one procedure.
4. `function`: the underlying OS, identity, or cloud operation the attacker must
   perform.

Detect at the lowest resilient layer exposed by the available telemetry. Do not
claim a function-level analytic when the query only matches a tool name. Record
the selected layer as `abstraction:<layer>` and justify it in
`technical_description`.

Classify maturity separately:

- `indicator`: static IOC matching.
- `behavioral`: procedure or technique behavior.
- `analytic`: technique or function-level logic resilient to procedure changes.

Use the `maturity` field. Do not emit legacy `stage:*` tags.

## ATT&CK Mapping

- Use the tightest supported technique or sub-technique.
- Include only tactics and techniques the query actually detects.
- Distinguish attacker relevance from detection coverage. A related technique is
  not automatically detected.
- Verify uncertain mappings against primary ATT&CK sources.

## KQL Rules

- Never invent tables, columns, action types, operation names, or functions.
- Keep Defender XDR Advanced Hunting and Sentinel Log Analytics semantics
  separate.
- `ingestion_time()` guidance applies only where the target Sentinel table and
  rule design support it. Never use it in Defender XDR Advanced Hunting.
- Filter early and project late.
- Prefer term-indexed `has`, `has_any`, and `hasprefix` when semantics permit.
- Bound `mv-expand`, `mv-apply`, joins, and aggregation cardinality.
- Avoid `search *`, `union *`, and unbounded broad scans.
- Correlation windows must fit inside `query_period`.
- Project every column referenced by entity mappings or exclusion guards.

## Fallback Rule Contract

Use this only when the target repository does not define its own schema:

```yaml
id: ""
name: ""
severity: Medium
fp_rate: Medium
false_positives: |
  <concrete legitimate workflows and triage guidance>
state: dev
maturity: behavioral
owner: ""
engine: defender_xdr
description: |
  <attack narrative and security impact>
data_sources: []
tags:
  - abstraction:procedure
os_family: []
permission_required: ""
mitre:
  - tactics: []
    techniques: []
entity_mapping: []
technical_description: |
  <detected operation, abstraction choice, and evasion resistance>
considerations: |
  <connectors, licensing, data quality, and tuning>
blindspots: |
  <specific procedures or telemetry gaps not covered>
response_plan: |
  1. <triage>
  2. <containment>
  3. <investigation pivot>
query: |-
  <KQL>
query_frequency: PT1H
query_period: P1D
references: []
testblock:
  - testdata: |
      let SourceTable = datatable(Timestamp:datetime, Example:string)
      [
          datetime(2026-01-01T00:00:00Z), "malicious"
      ];
    expected: 1
  - testdata: |
      let SourceTable = datatable(Timestamp:datetime, Example:string)
      [
          datetime(2026-01-01T00:00:00Z), "benign"
      ];
    expected: 0
exclusions:
  - entity_type: IP
    values: []
  - entity_type: Account
    values: []
  - entity_type: Host
    values: []
  - entity_type: FileHash
    values: []
  - entity_type: Process
    values: []
  - entity_type: URL
    values: []
```

Fallback field rules:

- `name` is descriptive Snake_Case.
- `state` is `dev`, `flight`, or `prod`.
- `maturity` is `indicator`, `behavioral`, or `analytic`.
- `engine` is `sentinel` or `defender_xdr`.
- `data_sources` contains exact queried table names.
- `query_frequency` must not exceed `query_period`.
- `field_mapping` is singular when used by the repository schema.
- `false_positives` and `blindspots` must be concrete and non-empty.
- New rules require at least one positive test and one negative test.
- Add boundary tests for thresholds, time windows, joins, or exclusions when
  applicable.

## Exclusion Scaffolding

When the target repository uses the fallback exclusion contract, declare these
arrays at the top of the query:

```kql
let exclusion_IP = dynamic([]);
let exclusion_Account = dynamic([]);
let exclusion_Host = dynamic([]);
let exclusion_FileHash = dynamic([]);
let exclusion_Process = dynamic([]);
let exclusion_URL = dynamic([]);
```

Add guards only for entity columns present in the final result:

| Entity | Result column |
|---|---|
| IP | `RemoteIP` |
| Account | `AccountUpn` |
| Host | `DeviceName` |
| FileHash | `SHA1` |
| Process | `FileName` |
| URL | `Url` |

## Test Contract

Load `detection-test` whenever validating rule testblocks. Each case is an
independent harness:

```kql
<testblock.testdata>

<query>
| count
```

The returned count must exactly equal `expected`. Synthetic table definitions
must shadow every source table used by the query. Do not weaken detection logic
to make tests pass.

The factory attempts every harness through Defender XDR, regardless of the
rule's `engine`. A demonstrated Sentinel-only incompatibility may be reported as
`WARN_XDR_INCOMPATIBLE`; schema errors, ordinary syntax errors, incomplete test
data, and incorrect counts remain failures.

## Readiness Standard

A rule is ready only when:

- Repository schema and naming checks pass.
- KQL tables, columns, and platform semantics are evidenced.
- ATT&CK and abstraction claims match the implemented behavior.
- Positive, negative, and applicable boundary tests pass.
- Entity mappings reference projected columns.
- False positives, blind spots, response actions, and deployment dependencies
  are actionable.
- Query cost and cardinality are bounded.
- The final diff contains only the planned rule and its required tests or
  metadata.
