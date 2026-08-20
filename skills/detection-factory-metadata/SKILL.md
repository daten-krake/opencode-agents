---
name: detection-factory-metadata
description: Use only through a detection-factory profile for fast, independently reviewed repairs to empty top-level detection-rule id and owner metadata without changing query or test logic.
---

# Detection Factory Metadata Fast Path

Produce one normal PR for a strictly bounded metadata repair without invoking a
scout, planner, implementer, adviser, validator, or XDR query. Load the full
`detection-factory-core` workflow only after a pre-mutation eligibility failure.

## Candidate Routing

Treat a request as a fast-path candidate only when it names exactly one existing
`.yaml` or `.yml` path and asks only to fill an empty top-level `id`, `owner`, or
both. An exact owner may be supplied by the request. An unspecified owner must
come from the base commit's root `.detection-factory.json` with this exact shape:

```json
{"metadata":{"canonicalOwner":"detection-team@company.com"}}
```

Any request for query, test, schema, formatting, classification, ATT&CK,
description, exclusion, or other rule changes is not a candidate. Ambiguous
paths, fields, or owner values are not candidates. Do not inspect repository
content in the controller.

## Contracts

The controller sends the reviewer exactly one `MetadataImplementationHandoff`:

```yaml
contract:
  type: MetadataImplementationHandoff
  version: 1
  run_id: ""
  handoff_id: "<run_id>:metadata-implementation"
  parent_handoff_id: "<run_id>:intake"
approval_mode: auto | gated
intent:
  request: ""
  issue: null
repository:
  root: ""
  remote: ""
  base_branch: ""
  base_commit: ""
  work_branch: ""
  target_path: ""
  changed_paths: []
  diff_fingerprint: ""
  paths_sha256: ""
metadata:
  requested_fields: []
  values: {}
  owner_resolution: null
proof: {}
publication:
  request: ""
  issue: null
  files: []
  stage_models: {}
```

The reviewer returns exactly one `MetadataReviewHandoff` with handoff ID
`<run_id>:review-metadata`, the implementation handoff as parent, copied
repository and publication fields, verdict `pass` or `blocked`, the compact
runner evidence, and findings. It may return `pass` only when the runner reports
`valid: true`, the independently calculated fingerprint equals the handoff, and
the actual values equal the requested values.

## Execution

1. Parse `--gated`; default to autonomous mode and never call `question` in
   autonomous mode.
2. Verify Git repository identity, clean status, base/default branch and commit,
   origin, `gh auth status`, and GitHub repository access. Do not run XDR or
   repository discovery.
3. Create the standard run ID and a compact intake checkpoint before any
   mutation. Include top-level `contract_version: 1`, request, repository,
   profile, mode, model map, and `stage: metadata_probe`.
4. Call `detection-factory-state` `probe_metadata` with the base commit, exact
   target path, requested fields, and only an exact request owner when present.
5. If the probe returns `eligible: false`, record its reason, rewrite the
   checkpoint to the full workflow's `stage: intake` shape, and load
   `detection-factory-core` from a still-clean base worktree. Do not create a
   branch or attempt to repair eligibility.
6. In gated mode, show the exact eligible path, fields, and resolved owner and
   request approval. In auto mode continue immediately.
7. Create `detection/metadata-<sanitized-file-stem>` from the recorded base,
   appending the short run identifier if that branch exists.
8. Move the checkpoint to `stage: metadata_prepare`, then call `prepare_metadata`
   with the same arguments and expected branch. It atomically generates a unique
   UUID v4 when requested and returns authoritative values, hashes, paths, and
   diff fingerprint.
9. Build one compact `MetadataImplementationHandoff` from the request and state
   output. Invoke only the profile's metadata reviewer in a fresh session.
10. A malformed reviewer contract permits one tool-less correction with only the
    handoff, invalid response, and validation errors. A provider failure permits
    one fresh retry of the same reviewer. Never switch models.
11. Stop without staging or publication when review is unavailable or blocked.
    Record the blocked reason and dirty work branch in the checkpoint and report
    them to the user. Do not repair, revert, delete the branch, or fall back after
    mutation; preserving the exact failed diff avoids overwriting concurrent
    work and keeps it available for manual inspection.
12. Call state `fingerprint` and require exact branch, path, and fingerprint
    equality with the review handoff.
13. In gated mode request publication approval. In auto mode continue.
14. Write a concise PR body through state kind `pr`. Include request, changed
    metadata, owner source, unchanged non-metadata/query/testblock hashes,
    independent reviewer model, elapsed time, and available token totals. XDR is
    not applicable because query and test logic are byte-proof unchanged.
15. Move the checkpoint to `stage: publish` with
    `publish_contract_type: MetadataReviewHandoff`, review handoff ID, verdict,
    branch, base commit, fingerprint, and the state-provided paths SHA-256.
16. Use `stage_reviewed`, then use `commit_reviewed` with one concise message and
    the complete review binding. Record its verified commit ID, push current
    `HEAD` without force, and create a normal PR from the state-managed body
    file. Never merge automatically.
17. Mark the checkpoint complete and return the PR URL.

## Invariants

- The state tool, not an LLM, performs the only file mutation.
- The reviewer receives one predecessor handoff and reads no repository files.
- The reviewer calls `inspect_metadata_diff` exactly once and no other action.
- Only approved scalar spans may differ; all remaining bytes, query, and
  testblock hashes must match independently.
- An unchanged reviewed diff is not validated again.
- Auto mode has zero questions, permission waits, repairs, and full-pipeline
  role calls.
- Never call `todowrite`; checkpoints are the sole progress record. If a staged
  summary is needed, the allowed forms are `git diff --stat --cached`,
  `git diff --name-only --cached`, and `git diff --check --cached`. Do not try
  the equivalent `git diff --cached ...` ordering.
