import { expect, test } from "bun:test"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

import stateTool from "../tools/detection-factory-state"

const STATE_ROOT = "/tmp/opencode/detection-factory"

function context(worktree: string, agent = "detection-factory-cloud") {
  return {
    agent,
    sessionID: "test-session",
    messageID: "test-message",
    directory: worktree,
    worktree,
    abort: new AbortController().signal,
    metadata: () => {},
    ask: () => {
      throw new Error("unexpected permission request")
    },
  } as never
}

function run(worktree: string, args: string[]) {
  return execFileSync("git", args, { cwd: worktree, encoding: "utf8" }).trim()
}

function cleanState(runId: string) {
  for (const name of readdirSync(STATE_ROOT)) {
    if (name.startsWith(runId)) unlinkSync(join(STATE_ROOT, name))
  }
}

test("state tool fingerprints and stages only the reviewed diff", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-state-test-"))
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    run(worktree, ["init", "-b", "main"])
    writeFileSync(join(worktree, ".gitattributes"), "*.yml text eol=lf\n")
    writeFileSync(join(worktree, "rule.yml"), "name: baseline\n")
    run(worktree, ["add", "--", ".gitattributes", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = run(worktree, ["rev-parse", "HEAD"])

    const initialCheckpoint = [
      "contract_version: 1",
      `run_id: ${runId}`,
      "stage: implement",
      "work_branch: main",
      "",
    ].join("\n")
    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: initialCheckpoint },
      context(worktree),
    )

    writeFileSync(join(worktree, "rule.yml"), "name: changed\r\n")
    writeFileSync(join(worktree, "new-rule.yml"), "name: new\n")
    const fingerprintOutput = await stateTool.execute(
      { action: "fingerprint", run_id: runId, base_commit: baseCommit },
      context(worktree),
    )
    const fingerprint = JSON.parse(String(fingerprintOutput))
    expect(fingerprint.changed_paths).toEqual(["new-rule.yml", "rule.yml"])
    expect(fingerprint.branch).toBe("main")

    writeFileSync(join(worktree, "rule.yml"), "name: tampered\r\n")
    const mutatedOutput = await stateTool.execute(
      {
        action: "fingerprint",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
      },
      context(worktree),
    )
    expect(JSON.parse(String(mutatedOutput)).fingerprint_matches).toBe(false)
    writeFileSync(join(worktree, "rule.yml"), "name: changed\r\n")

    const publishCheckpoint = [
      "contract_version: 1",
      `run_id: ${runId}`,
      "stage: publish",
      "publish_contract_type: ReviewHandoff",
      `publish_review_handoff_id: ${runId}:review-0`,
      "publish_verdict: pass",
      "publish_work_branch: main",
      `publish_base_commit: ${baseCommit}`,
      `publish_diff_fingerprint: ${fingerprint.fingerprint}`,
      `publish_paths_sha256: ${fingerprint.paths_sha256}`,
      "",
    ].join("\n")
    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: publishCheckpoint },
      context(worktree),
    )

    const wrongReview = await stateTool.execute(
      {
        action: "stage_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-1`,
      },
      context(worktree),
    )
    expect(String(wrongReview)).toContain("not bound to the expected ReviewHandoff")

    const indentedSpoof = publishCheckpoint.replace(
      "publish_work_branch: main",
      "publish_work_branch: wrong-branch\n  publish_work_branch: main",
    )
    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: indentedSpoof },
      context(worktree),
    )
    const spoofedStage = await stateTool.execute(
      {
        action: "stage_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
      },
      context(worktree),
    )
    expect(String(spoofedStage)).toContain("not bound to the expected work branch")

    const duplicateBinding = publishCheckpoint.replace(
      `publish_diff_fingerprint: ${fingerprint.fingerprint}`,
      `publish_diff_fingerprint: ${fingerprint.fingerprint}\npublish_diff_fingerprint: ${fingerprint.fingerprint}`,
    )
    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: duplicateBinding },
      context(worktree),
    )
    const duplicateStage = await stateTool.execute(
      {
        action: "stage_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
      },
      context(worktree),
    )
    expect(String(duplicateStage)).toContain("exactly one top-level publish_diff_fingerprint")

    const blockedMetadataCheckpoint = publishCheckpoint
      .replace("publish_contract_type: ReviewHandoff", "publish_contract_type: MetadataReviewHandoff")
      .replace("publish_verdict: pass", "publish_verdict: blocked")
    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: blockedMetadataCheckpoint },
      context(worktree),
    )
    const blockedMetadataStage = await stateTool.execute(
      {
        action: "stage_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
      },
      context(worktree),
    )
    expect(String(blockedMetadataStage)).toContain("does not contain a publishable review verdict")

    await stateTool.execute(
      { action: "write", kind: "checkpoint", run_id: runId, content: publishCheckpoint },
      context(worktree),
    )

    const stageOutput = await stateTool.execute(
      {
        action: "stage_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
      },
      context(worktree),
    )
    expect(JSON.parse(String(stageOutput)).staged).toBe(true)
    expect(run(worktree, ["diff", "--cached", "--name-only"]).split("\n").sort()).toEqual([
      "new-rule.yml",
      "rule.yml",
    ])

    const afterStage = await stateTool.execute(
      {
        action: "fingerprint",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
      },
      context(worktree),
    )
    const after = JSON.parse(String(afterStage))
    expect(after.fingerprint_matches).toBe(true)
    expect(after.paths_match).toBe(true)
    expect(after.branch_matches).toBe(true)

    const commitOutput = await stateTool.execute(
      {
        action: "commit_reviewed",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
        commit_message: "reviewed change",
      },
      context(worktree),
    )
    expect(JSON.parse(String(commitOutput)).verified).toBe(true)
    const verifiedCommit = await stateTool.execute(
      {
        action: "verify_commit",
        run_id: runId,
        base_commit: baseCommit,
        expected_fingerprint: fingerprint.fingerprint,
        expected_paths: fingerprint.changed_paths,
        expected_branch: "main",
        review_handoff_id: `${runId}:review-0`,
      },
      context(worktree),
    )
    expect(JSON.parse(String(verifiedCommit)).verified).toBe(true)
    const committedDrift = await stateTool.execute(
      { action: "fingerprint", run_id: runId, base_commit: baseCommit },
      context(worktree),
    )
    expect(String(committedDrift)).toContain("does not equal the reviewed base commit")
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    cleanState(runId)
  }
})

test("state tool rejects non-controller agents", async () => {
  const output = await stateTool.execute({ action: "list" }, context(process.cwd(), "detection-planner"))
  expect(String(output)).toContain("only a detection-factory controller")
})

test("state tool atomically prepares only empty metadata and preserves rule logic", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-metadata-state-test-"))
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    run(worktree, ["init", "-b", "main"])
    const rule = [
      'id: ""',
      "name: Metadata_Test",
      "owner: ''",
      "query: |-",
      "  DeviceProcessEvents",
      '  | where FileName == "cmd.exe"',
      "testblock:",
      "  - testdata: |",
      "      let DeviceProcessEvents = datatable(FileName:string)[];",
      "    expected: 0",
      "",
    ].join("\r\n")
    writeFileSync(
      join(worktree, ".detection-factory.json"),
      '{"metadata":{"canonicalOwner":"detection-team@company.com"}}\n',
    )
    writeFileSync(join(worktree, "rule.yml"), rule)
    run(worktree, ["add", "--", ".detection-factory.json", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = run(worktree, ["rev-parse", "HEAD"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_probe\n`,
      },
      context(worktree),
    )

    const probeOutput = await stateTool.execute(
      {
        action: "probe_metadata",
        run_id: runId,
        base_commit: baseCommit,
        target_path: "rule.yml",
        requested_fields: ["id", "owner"],
      },
      context(worktree),
    )
    const probe = JSON.parse(String(probeOutput))
    expect(probe.eligible).toBe(true)
    expect(probe.owner_resolution.owner).toBe("detection-team@company.com")

    run(worktree, ["switch", "-c", "detection/metadata-rule"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_prepare\n`,
      },
      context(worktree),
    )
    const preparedOutput = await stateTool.execute(
      {
        action: "prepare_metadata",
        run_id: runId,
        base_commit: baseCommit,
        target_path: "rule.yml",
        requested_fields: ["id", "owner"],
        expected_branch: "detection/metadata-rule",
      },
      context(worktree),
    )
    const prepared = JSON.parse(String(preparedOutput))
    expect(prepared.prepared).toBe(true)
    expect(prepared.values.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(prepared.values.owner).toBe("detection-team@company.com")
    expect(prepared.changed_paths).toEqual(["rule.yml"])
    expect(prepared.proof.non_metadata_unchanged).toBe(true)
    expect(prepared.proof.query_unchanged).toBe(true)
    expect(prepared.proof.testblock_unchanged).toBe(true)

    const result = readFileSync(join(worktree, "rule.yml"), "utf8")
    expect(result).toContain(`id: "${prepared.values.id}"\r\n`)
    expect(result).toContain("owner: 'detection-team@company.com'\r\n")
    expect(result).toContain('  | where FileName == "cmd.exe"\r\n')
    expect(result.replaceAll("\r\n", "")).not.toContain("\n")
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    cleanState(runId)
  }
})

test("metadata probe falls back without policy and rejects duplicate top-level keys", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-metadata-probe-test-"))
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    run(worktree, ["init", "-b", "main"])
    writeFileSync(
      join(worktree, "rule.yml"),
      [
        'id: ""',
        'id: ""',
        'owner: ""',
        "query: |-",
        "  DeviceProcessEvents",
        "testblock:",
        "  - testdata: |",
        "      let DeviceProcessEvents = datatable(FileName:string)[];",
        "    expected: 0",
        "",
      ].join("\n"),
    )
    run(worktree, ["add", "--", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = run(worktree, ["rev-parse", "HEAD"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_probe\n`,
      },
      context(worktree),
    )

    const duplicate = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "probe_metadata",
            run_id: runId,
            base_commit: baseCommit,
            target_path: "rule.yml",
            requested_fields: ["id"],
          },
          context(worktree),
        ),
      ),
    )
    expect(duplicate.eligible).toBe(false)
    expect(duplicate.reason).toContain("exactly one top-level id")

    writeFileSync(
      join(worktree, "rule.yml"),
      readFileSync(join(worktree, "rule.yml"), "utf8").replace('id: ""\nid: ""\n', 'id: ""\n'),
    )
    run(worktree, ["add", "--", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "unique id"])
    const newBase = run(worktree, ["rev-parse", "HEAD"])
    const missingPolicy = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "probe_metadata",
            run_id: runId,
            base_commit: newBase,
            target_path: "rule.yml",
            requested_fields: ["owner"],
          },
          context(worktree),
        ),
      ),
    )
    expect(missingPolicy.eligible).toBe(false)
    expect(missingPolicy.reason).toContain(".detection-factory.json")
    expect(run(worktree, ["status", "--porcelain"])).toBe("")

    run(worktree, ["switch", "-c", "detection/metadata-id-only"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_prepare\n`,
      },
      context(worktree),
    )
    const idOnly = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "prepare_metadata",
            run_id: runId,
            base_commit: newBase,
            target_path: "rule.yml",
            requested_fields: ["id"],
            expected_branch: "detection/metadata-id-only",
          },
          context(worktree),
        ),
      ),
    )
    expect(idOnly.prepared).toBe(true)
    expect(idOnly.values.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(idOnly.values.owner).toBeUndefined()
    expect(readFileSync(join(worktree, "rule.yml"), "utf8")).toContain('owner: ""')

    run(worktree, ["add", "--", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "prepared id"])
    const populatedBase = run(worktree, ["rev-parse", "HEAD"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_probe\n`,
      },
      context(worktree),
    )
    const populated = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "probe_metadata",
            run_id: runId,
            base_commit: populatedBase,
            target_path: "rule.yml",
            requested_fields: ["id"],
          },
          context(worktree),
        ),
      ),
    )
    expect(populated.eligible).toBe(false)
    expect(populated.reason).toContain("id field is not empty")
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    cleanState(runId)
  }
})

test("metadata owner may be bound to an exact value in the request", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-explicit-owner-test-"))
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  const requestText = "Set only the empty owner in rule.yml to analyst@company.com"
  try {
    run(worktree, ["init", "-b", "main"])
    writeFileSync(
      join(worktree, "rule.yml"),
      [
        'id: "existing-id"',
        'owner: ""',
        "query: |-",
        "  DeviceProcessEvents",
        "testblock:",
        "  - testdata: |",
        "      let DeviceProcessEvents = datatable(FileName:string)[];",
        "    expected: 0",
        "",
      ].join("\n"),
    )
    run(worktree, ["add", "--", "rule.yml"])
    run(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = run(worktree, ["rev-parse", "HEAD"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_probe\n`,
      },
      context(worktree),
    )
    const probe = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "probe_metadata",
            run_id: runId,
            base_commit: baseCommit,
            target_path: "rule.yml",
            requested_fields: ["owner"],
            owner_value: "analyst@company.com",
            request_text: requestText,
          },
          context(worktree),
        ),
      ),
    )
    expect(probe.eligible).toBe(true)
    expect(probe.owner_resolution.source).toBe("request")

    run(worktree, ["switch", "-c", "detection/metadata-explicit-owner"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_prepare\n`,
      },
      context(worktree),
    )
    const prepared = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "prepare_metadata",
            run_id: runId,
            base_commit: baseCommit,
            target_path: "rule.yml",
            requested_fields: ["owner"],
            owner_value: "analyst@company.com",
            request_text: requestText,
            expected_branch: "detection/metadata-explicit-owner",
          },
          context(worktree),
        ),
      ),
    )
    expect(prepared.values.owner).toBe("analyst@company.com")
    expect(prepared.owner_resolution.source).toBe("request")
    expect(readFileSync(join(worktree, "rule.yml"), "utf8")).toContain('id: "existing-id"')
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    cleanState(runId)
  }
})
