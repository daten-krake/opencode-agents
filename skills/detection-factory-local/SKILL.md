---
name: detection-factory-local
description: Use when creating one detection rule with the local-only software-factory profile, using LM Studio models for autonomous adjacent-handoff scouting, planning, implementation, review, repair, and PR publication. Use --gated for approvals.
---

# Detection Factory Local

Use this immutable role and model map, then load `detection-factory-core` and
execute its state machine:

```yaml
profile: local
controller: detection-factory-local
scout: detection-scout-local
planner: detection-planner-local
implementer: detection-implementer-local
reviewer: detection-reviewer-local
metadata_reviewer: detection-metadata-reviewer-local
advisers:
  cti: detection-cti-local
  adversary: detection-adversary-local
  purple: detection-purple-local
models:
  controller: lmstudio/qwen/qwen3.6-35b-a3b
  scout: lmstudio/qwen3.5-4b
  planner: lmstudio/qwen/qwen3.6-35b-a3b
  implementer: lmstudio/qwen/qwen3.6-35b-a3b
  reviewer: lmstudio/zai-org/glm-4.7-flash
  metadata_reviewer: lmstudio/zai-org/glm-4.7-flash
  advisers: lmstudio/qwen/qwen3.6-35b-a3b
```

Default to autonomous execution. `--gated` is the only interactive workflow
mode. Route a strict empty `id` or `owner` candidate through
`detection-factory-metadata`; load `detection-factory-core` only for an
ineligible pre-mutation fallback.

## Local Model Preflight

Query `http://192.168.200.219:1234/api/v0/models`, the LM Studio server
configured for the `lmstudio` provider. Use the exact allowed curl command with
no pipeline or redirection. Do not use OpenCode's cached model catalog. For a
metadata fast-path candidate, require only these IDs to report `state: loaded`:

- `qwen/qwen3.6-35b-a3b`
- `zai-org/glm-4.7-flash`

Before a full-pipeline run or fallback, require all these exact IDs:

- `qwen3.5-4b`
- `qwen/qwen3.6-35b-a3b`
- `zai-org/glm-4.7-flash`

Stop and tell the user which model must be loaded if any requirement fails. Do
not trigger JIT loading, select a downloaded-but-unloaded model, substitute a
cloud model, or silently downgrade review to Qwen.

All LLM inference in this workflow must use the local role map. Defender XDR,
web research, GitHub issue access, Git push, and PR creation remain network
operations and are not LLM inference.
