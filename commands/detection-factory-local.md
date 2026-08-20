---
description: Autonomously build one detection rule with local LM Studio agents; pass --gated for approvals.
agent: detection-factory-local
---

Load the `detection-factory-local` skill and execute it end to end with these arguments:

No mode flag means autonomous execution. `--gated` enables plan and repair
approval prompts. Autonomous execution never waits for optional validation
capabilities: it publishes a normal PR with documented warnings when the diff
is sound, or a draft PR after one unsuccessful code repair.

$ARGUMENTS
