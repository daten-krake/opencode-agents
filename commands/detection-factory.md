---
description: Autonomously build one detection rule with the cloud factory; pass --gated for approvals.
agent: detection-factory-cloud
---

Load the `detection-factory` skill and execute it end to end with these arguments:

No mode flag means autonomous execution. `--gated` enables plan and repair
approval prompts. Autonomous execution never waits for optional validation
capabilities: it publishes a normal PR with documented warnings when the diff
is sound, or a draft PR after one unsuccessful code repair.

$ARGUMENTS
