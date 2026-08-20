# Detection Factory Performance

This file tracks measured factory runs before and after the adjacent-handoff
redesign. Times are UTC. Token values come from OpenCode's `session` table;
active operation time is the sum of assistant message start/completion windows
and includes time waiting for delegated tools.

## Baseline Cloud Run

| Field | Value |
|---|---|
| Session | `ses_031fa9a16ffeotShhSqp35Dt7Z` |
| Request | Review `rules/endpoint/credential-dumping.yml` |
| Started | 2026-08-04 18:24:48 |
| Completed | 2026-08-05 05:45:34 |
| Wall time | 11h 20m 46s |
| Active controller operations | 165.1m |
| Silent stalled interval | 8h 35m 26s |
| Input tokens across factory roles | 5,910,030 |
| Output tokens across factory roles | 124,391 |
| Planner Defender XDR calls | 51 |
| Core-stage repository reads | 79 |
| Follow-up correction calls | 5 |
| Routine workflow questions | 2 |
| Additional user nudges | 2 |
| Result | `pass_with_warnings`, PR 20 |

The controller stopped after the approved repair at 2026-08-04 21:03:19 and
did not resume until the user's `finiseh ?` message at 2026-08-05 05:38:45.
Final publication took another 6m 49s.

## Baseline Stage Breakdown

| Stage | Sessions | Active operation time | Input tokens | Output tokens |
|---|---:|---:|---:|---:|
| Controller | 1 | 165.1m, includes child waits | 262,397 | 32,446 |
| Scout | 1 | 1.7m | 823,585 | 10,829 |
| Planner | 2, including failed attempt | 7.3m | 2,239,732 | 39,153 |
| Adversary adviser | 1 | 1.4m | 280,207 | 10,396 |
| Implementer and repair | 1 resumed session | 77.0m | 2,220,164 | 25,430 |
| Reviewer and re-review | 1 resumed session | 21.4m | 83,945 | 6,137 |

The run made five additional contract/evidence calls after primary stage output:
ScoutContract shape correction, DetectionPlan correction, plan YAML-only
formatting, implementation YAML-only formatting, and review evidence
clarification. The initial review prompt was 10,733 characters and included the
request, ScoutContract, complete plan, ImplementationReport, and diff context.

## Redesign Targets

| Metric | Baseline | Target | First post-change run |
|---|---:|---:|---:|
| Routine questions in default mode | 2 | 0 | 0 |
| Additional user nudges | 2 | 0 | 0 during completed execution |
| Active operation time | 165.1m | <= 82.5m | 11.4m |
| Input tokens | 5,910,030 | <= 2,955,015 | 945,832 |
| Planner XDR calls per run | 51 | <= 8 | 0 |
| Format-only correction calls | 2 | 0 | 0 |
| Broad repository discovery stages | 4 | 1 | 1 |
| Reviewer sessions reused after mutation | 1 | 0 | 0 |
| Full validation passes without repair | 3 | 2 | 2 with warnings |

## Metadata Fast-Path Target

Strict repairs to one empty top-level `id`, `owner`, or both bypass scout,
planner, implementer, adviser, validator, and XDR stages. The state tool performs
the bounded scalar edit and one tiny profile-pinned reviewer verifies a compact
actual-diff proof. The acceptance ceiling is fewer than 500,000 total tokens
across the controller and every child session, including fresh input, cache
reads, output, and reasoning tokens. A valid benchmark also requires zero
questions, zero repairs, one metadata reviewer, no full-pipeline workers, and a
normal PR.

### First Cloud Fast-Path Benchmark

| Metric | Result |
|---|---:|
| Session tree | `ses_02740d2ccffecvVHElKTQsbc0g` plus one reviewer child |
| Wall time | 263.5s (4.4m) |
| Fresh input | 61,724 |
| Cache reads | 408,064 |
| Output | 8,462 |
| Reasoning | 856 |
| Cache writes | 0 |
| Total including cache | **479,106** |
| Questions / repairs / XDR | 0 / 0 / 0 |
| Full-pipeline role calls | 0 |
| Pull request | [24](https://github.com/daten-krake/detection_and_response/pull/24) |

The first run met the 500,000-token ceiling by 20,894 tokens. It also exposed
six standalone controller todo turns and one denied staged-diff argument-order
turn. Controllers now deny `todowrite`, use checkpoints as their sole progress
record, and document the allowed staged-diff forms, providing additional margin
for subsequent runs.

## Run Ledger

Add one row after each controlled cloud or local benchmark. Do not record raw
tenant results, credentials, user content, or unnecessary PII.

| Date | Profile | Session | Outcome | Wall | Active | Input tokens | Questions | Planner XDR | Repairs | Notes |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 2026-08-04 | cloud baseline | `ses_031fa9a16ffeotShhSqp35Dt7Z` | pass with warnings | 680.8m | 165.1m | 5,910,030 | 2 | 51 | 1 | Stalled 515.4m after repair |
| 2026-08-06 | cloud post-change | `ses_0278f91e1ffeU1cbisbtnjsPLw` | pass with warnings | 11.4m | 11.4m | 945,832 | 0 | 0 | 0 | PR 23; one scout, one review, normal PR |
| 2026-08-06 | cloud metadata fast path | `ses_02740d2ccffecvVHElKTQsbc0g` | pass | 4.4m | 4.4m | 61,724 | 0 | 0 | 0 | PR 24; 479,106 total including cache; one metadata reviewer only |

The completed run resumed the checkpoint created by
`ses_027cb334bffe4l9Q44orfp4WpG`. That earlier process was terminated after a
60-minute zero-token Ollama Cloud scout request. Provider request, header, and
stream-chunk timeouts were added before the successful resume. The interrupted
attempt used 15,778 input and 1,556 output tokens in its controller; its scout
produced no tokens or tools.

## Redesign Validation

| Date | Check | Result |
|---|---|---|
| 2026-08-05 | Static factory wiring and deployed symlinks | Pass: 18 agents, 10 skills, 2 commands, 3 tools |
| 2026-08-05 | Python unit suite | Pass: 39 tests |
| 2026-08-05 | Bun state/budget/runner tests | Pass: 6 tests, 59 assertions |
| 2026-08-05 | TypeScript tool bundles | Pass: state, runner, and XDR tools |
| 2026-08-05 | Effective OpenCode agent inspection | Pass: controller, scout, planner, implementer, cloud/local reviewers |
| 2026-08-05 | Independent security and architecture re-review | Pass: no remaining blocker, high, or major findings |
| 2026-08-06 | Python unit suite | Pass: 43 tests |
| 2026-08-06 | Bun state/budget/runner tests | Pass: 9 tests, 66 assertions |
| 2026-08-06 | Cloud runtime benchmark | Pass with warnings: normal PR 23 in 11.4m, no repair or questions |
| 2026-08-06 | Metadata fast-path tests | Pass: 45 Python tests; 13 Bun tests, 108 assertions; state/runner safety and binding |
| 2026-08-06 | Cloud metadata benchmark | Pass: normal PR 24 in 4.4m, 479,106 total tokens including cache |

These checks verify wiring, contracts, permissions, atomic persistent query
budgeting, Git-object diff fingerprinting, and reviewed-path staging. The
2026-08-06 cloud row is the first runtime benchmark after the adjacent-handoff
and autonomous-warning changes. A controlled post-change local row is still
pending.

## Measurement Notes

Use `opencode db` read-only queries to collect session and child-session values.
Count workflow questions from controller parts where `type=tool` and
`tool=question`. Count XDR calls from planner child parts where
`tool=defender-xdr-hunt`. A post-change comparison is valid only for one-rule
runs with equivalent validation and publication requirements.
