# opencode-agents

Global OpenCode agents, skills, tools, and commands, including a two-profile
software factory for Microsoft Sentinel and Defender XDR detections.

## Detection Factory

One factory run produces one detection rule and hands it over as a pull request.
Each role receives only its immediate predecessor's compact contract:

```text
intake -> scout handoff -> plan handoff -> implementation handoff -> review handoff -> PR
```

Use the cloud profile:

```text
/detection-factory Detect suspicious OAuth application credential additions
```

Use only local LM Studio models:

```text
/detection-factory-local Detect suspicious OAuth application credential additions
```

The default is autonomous: eligible-issue selection, unblocked plan acceptance,
and one bounded in-scope repair proceed without routine questions. Add
`--gated` for plan and repair approvals. `--auto` remains an accepted alias for
the default. Both modes stop on missing prerequisites, destructive ambiguity,
scope changes, or an unrecoverable blocker.

When no request follows the command, the controller reads open GitHub issues in
the current repository. Autonomous mode selects by priority, milestone, and
age; gated mode asks among the best eligible candidates.

A request that names one existing rule and asks only to fill an empty top-level
`id`, `owner`, or both uses a compact metadata fast path. A trusted state tool
performs the scalar-only edit and a tiny profile-pinned reviewer independently
verifies the actual diff, values, and fingerprint. It does not invoke the scout,
planner, implementer, advisers, validators, or XDR. An unspecified owner requires
this exact tracked root policy in the recorded base commit:

```json
{"metadata":{"canonicalOwner":"detection-team@company.com"}}
```

Missing or ambiguous policy and any non-metadata request fall back before
mutation to the full workflow. Query and testblock content must be byte-proof
unchanged; otherwise publication is blocked.

The scout performs the only broad repository discovery pass. Planners use at
most eight Defender XDR calls per run, implementers receive only an approved plan or
repair contract, and each changed diff receives a fresh independent review.
Baseline and post-change measurements are tracked in
[DETECTION_FACTORY_STATS.md](DETECTION_FACTORY_STATS.md).

## Model Profiles

| Stage | Cloud | Local only |
|---|---|---|
| Controller | `openai/gpt-5.6-sol` | `lmstudio/qwen/qwen3.6-35b-a3b` |
| Scout | `ollama-cloud/deepseek-v4-flash:0731` | `lmstudio/qwen3.5-4b` |
| Planner | `ollama-cloud/glm-5.2` | `lmstudio/qwen/qwen3.6-35b-a3b` |
| Implementer/fixer | `ollama-cloud/deepseek-v4-flash:0731` | `lmstudio/qwen/qwen3.6-35b-a3b` |
| Reviewer | `openai/gpt-5.6-sol` | `lmstudio/zai-org/glm-4.7-flash` |
| Metadata reviewer | `openai/gpt-5.6-sol` | `lmstudio/zai-org/glm-4.7-flash` |
| Threat advisers | `ollama-cloud/deepseek-v4-pro` | `lmstudio/qwen/qwen3.6-35b-a3b` |

The local command queries LM Studio's `/api/v0/models` endpoint before work. A
metadata candidate requires only its controller and metadata reviewer models;
the full workflow requires all three local models. It never substitutes a cloud
model or silently changes the reviewer.

## Quality Gates

- Target-repository schemas and neighboring rules override fallback conventions.
- New rules include positive and negative tests, plus applicable boundary tests.
- Every synthetic harness is attempted through Defender XDR regardless of
  `engine`.
- Recognizable Sentinel-only XDR incompatibility is retained as a warning;
  ordinary syntax, schema, and count failures require repair.
- Runner, credential, telemetry, and optional validator availability gaps are
  published as warnings instead of blocking autonomous completion.
- The reviewer never edits or invokes a fixer. The controller routes no more
  than one actionable code repair and starts a fresh reviewer after mutation.
- An unchanged independently reviewed diff is not fully validated a third time
  during publication.
- Passing and statically sound warning runs create normal PRs. A confirmed code
  defect remaining after one repair creates a draft PR with the full result.
- The PR body is the only durable factory handoff artifact.

## Structure

```text
agents/       Model-pinned primary and subagent roles
commands/     Deterministic cloud/local entry points
skills/       Workflow, review, testing, and hunting instructions
tools/        Custom OpenCode tools
scripts/      Configuration and factory validators
```

Large detection and CTI reference trees remain next to their legacy agents in
the repository, but `link-agents.sh` deploys them as skills. Their Markdown
files are therefore available as references without becoming hundreds of
accidental subagents.

## Install

```bash
python3 -m pip install -r requirements.txt
./link-agents.sh
python3 scripts/validate-detection-factory.py --check-links
```

Then quit and restart OpenCode. Agent, skill, command, tool, and configuration
changes are loaded only at startup.

For Defender XDR credentials and the live-hunting tool, see [GUIDE.md](GUIDE.md).
