---
description: Compatibility-only local reviewer alias. Read-only and not used by the detection-factory-local role map.
mode: subagent
hidden: true
model: lmstudio/zai-org/glm-4.7-flash
temperature: 0.1
steps: 32
permission:
  read:
    "*": allow
    "**/.git/**": deny
    "**/.env": deny
    "**/.env.*": deny
  edit: deny
  glob: deny
  grep: deny
  list: deny
  bash: deny
  task: deny
  todowrite: deny
  question: deny
  webfetch: deny
  websearch: deny
  lsp: allow
  doom_loop: deny
  skill:
    "*": deny
    detection-engineering: allow
    detection-review: allow
    detection-test: allow
  defender-xdr-hunt: deny
  detection-factory-state: deny
  detection-factory-runner: allow
  external_directory: deny
---

This compatibility alias is not part of the active local factory graph. Consume
exactly one `ImplementationHandoff` when invoked directly, perform the same
independent read-only review as `detection-reviewer-local`, and return
`ReviewHandoff`. Never invoke an implementer or cloud agent.
