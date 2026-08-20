---
name: detection-review
description: Use when independently reviewing a detection-rule diff, KQL logic, ATT&CK mapping, test evidence, false positives, blind spots, repository compliance, or deciding whether a detection factory run may publish.
---

# Detection Review

Review independently from exactly one `ImplementationHandoff`. Read the actual
current diff and only the authoritative repository instructions, schema, and
validators cited by that handoff. Do not request separate request, issue,
ScoutContract, DetectionPlan, implementation chat, or pasted diff. Do not accept
the implementer's summary as evidence and do not edit files.

Load `detection-engineering` before reviewing domain correctness. Run the
provenance-backed repository validation commands and `detection-test` workflow
yourself through `detection-factory-runner`; Bash is denied. Bind every verdict
to the independently observed diff fingerprint.

## Gates

1. Repository fit: path, naming, YAML shape, lifecycle state, and cited
   neighboring conventions match.
2. Detection hypothesis: the query actually detects the claimed attacker
   operation in the immutable review basis.
3. Capability abstraction: the selected layer is justified and not overstated.
4. ATT&CK: tactics and techniques are precise and supported by query behavior.
5. Platform: tables, columns, functions, and time semantics match the engine.
6. KQL: filters are selective, correlations are bounded, joins are sound, and
   result columns are stable.
7. Operational metadata: entities, false positives, blind spots, deployment
   dependencies, and response actions are concrete.
8. Tests: positive and negative cases pass; applicable boundaries are tested.
9. Live validation: bounded evidence supports the claims made from it.
10. Diff scope: only approved files changed and no unrelated work was overwritten.
11. Scheduling: frequency does not exceed period and windows fit the lookback.
12. Data sources: declared tables match query inputs and synthetic definitions.
13. Exclusions: required arrays and guards reference projected result columns.

## Severity

- `blocker`: unsafe, invalid, fabricated, or fundamentally fails the request.
- `major`: likely missed detection, material false-positive issue, broken test,
  wrong platform behavior, or incomplete acceptance criterion.
- `minor`: real quality issue that does not invalidate the rule.
- `suggestion`: optional improvement with a clear benefit.

Only blocker and major findings require repair. Do not manufacture findings to
justify a loop. Never invoke an implementer; the controller owns repair routing.
Runner, command provenance, credential, telemetry, throttling exhaustion, and
optional validator availability gaps are infrastructure warnings, not blocker
or major findings, when static review finds the detection diff sound. Return
`pass_with_warnings`, identify every check that did not execute, and preserve
the resulting uncertainty in publication risks. Actual syntax errors, schema
errors, wrong test counts, scope drift, and unsafe detection logic remain
repairable findings.

## ReviewHandoff

Return one YAML document carrying forward the immutable review basis and
publication summary:

```yaml
contract:
  type: ReviewHandoff
  version: 1
  run_id: ""
  handoff_id: "<run_id>:review-<pass>"
  parent_handoff_id: "<run_id>:implementation-handoff-<pass>"
repository:
  root: ""
  base_commit: ""
  work_branch: ""
  changed_paths: []
  diff_fingerprint: ""
review_basis:
  hypothesis: ""
  acceptance_criteria: []
  allowed_paths: []
  required_tests: []
authoritative_sources: []
validation_commands: []
verdict: pass | pass_with_warnings | repair | blocked
summary: ""
findings:
  - id: ""
    severity: blocker | major | minor | suggestion
    where: "path:line or rule section"
    problem: ""
    impact: ""
    required_change: ""
validation:
  repository_checks: []
  testblocks: []
  live_xdr: []
warnings: []
repair:
  required: false
  pass_number: 0
  starting_diff_fingerprint: ""
  allowed_paths: []
  finding_ids: []
  changes: []
  acceptance_checks: []
repair_history: []
publication:
  request: ""
  issue: null
  hypothesis: ""
  classification: {}
  engine: ""
  files: []
  false_positive_risks: []
  blindspots: []
  exact_checks: []
  test_results: []
  xdr_evidence: []
  repair_history: []
  remaining_risks: []
  stage_models: {}
```

Copy `review_basis`, `authoritative_sources`, and `validation_commands`
unchanged. Append the current outcome to top-level `repair_history`. In
`publication`, preserve request, issue, hypothesis, classification, engine,
files, false-positive risks, blind spots, and stage models unchanged; populate
exact checks, test results, and sanitized XDR evidence from this review; copy the
complete updated top-level repair history; and append newly identified remaining
risks to those already supplied.
This makes a checkpointed ReviewHandoff self-contained for repair or
publication.

Use `pass_with_warnings` for a valid rule with documented non-blocking limits.
Use `WARN_XDR_INCOMPATIBLE` only when a Sentinel-specific construct is shown to
be the reason a synthetic harness cannot run through Defender XDR. Do not use it
to hide syntax errors, incomplete test data, or incorrect counts.

After one unsuccessful detection-code repair pass, return `blocked`. The factory
publishes a draft PR rather than presenting the rule as review-ready. Never
request repair for an infrastructure warning.
