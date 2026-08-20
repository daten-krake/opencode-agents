---
name: detection-factory
description: Use when creating one detection rule through the cloud software-factory profile with autonomous issue intake, adjacent stage handoffs, XDR testing, independent review, bounded repair, and PR publication. Use --gated for approvals.
---

# Detection Factory Cloud

Use this immutable role and model map, then load `detection-factory-core` and
execute its state machine:

```yaml
profile: cloud
controller: detection-factory-cloud
scout: detection-scout
planner: detection-planner
implementer: detection-implementer
reviewer: detection-reviewer
metadata_reviewer: detection-metadata-reviewer
advisers:
  cti: detection-cti
  adversary: detection-adversary
  purple: detection-purple
models:
  controller: openai/gpt-5.6-sol
  scout: ollama-cloud/deepseek-v4-flash:0731
  planner: ollama-cloud/glm-5.2
  implementer: ollama-cloud/deepseek-v4-flash:0731
  reviewer: openai/gpt-5.6-sol
  metadata_reviewer: openai/gpt-5.6-sol
  advisers: ollama-cloud/deepseek-v4-pro
```

Default to autonomous execution. `--gated` is the only interactive workflow
mode. Route a strict empty `id` or `owner` candidate through
`detection-factory-metadata`; load `detection-factory-core` only for an
ineligible pre-mutation fallback. Never invoke a local role from this profile.
