import { expect, test } from "bun:test"
import { execFileSync } from "node:child_process"
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import { tmpdir } from "node:os"
import { join } from "node:path"

import runner, { loadGraphEnvironment, redactSecrets } from "../tools/detection-factory-runner"
import stateTool from "../tools/detection-factory-state"

function context(worktree: string, agent: string) {
  return {
    agent,
    sessionID: "runner-test-session",
    messageID: "runner-test-message",
    directory: worktree,
    worktree,
    abort: new AbortController().signal,
    metadata: () => {},
    ask: () => {
      throw new Error("unexpected permission request")
    },
  } as never
}

function git(worktree: string, args: string[]) {
  return execFileSync("git", args, { cwd: worktree, encoding: "utf8" }).trim()
}

test("runner inspects diffs and executes a provenance-backed validator", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-runner-test-"))
  try {
    git(worktree, ["init", "-b", "main"])
    mkdirSync(join(worktree, "scripts"))
    mkdirSync(join(worktree, ".github", "workflows"), { recursive: true })
    writeFileSync(join(worktree, "rule.yml"), "name: baseline\n")
    writeFileSync(join(worktree, "scripts", "validate.py"), 'print("validator passed")\n')
    writeFileSync(join(worktree, ".github", "workflows", "ci.txt"), "python3 scripts/validate.py\n")
    git(worktree, ["add", "--", "rule.yml", "scripts/validate.py", ".github/workflows/ci.txt"])
    git(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = git(worktree, ["rev-parse", "HEAD"])
    writeFileSync(join(worktree, "rule.yml"), "name: changed\n")

    const inspection = await runner.execute(
      { action: "inspect_diff", base_commit: baseCommit },
      context(worktree, "detection-reviewer"),
    )
    const diff = JSON.parse(String(inspection))
    expect(diff.status).toContain("rule.yml")
    expect(diff.diff).toContain("name: changed")
    expect(diff.diff_check_exit_code).toBe(0)

    const originalGitDir = process.env.GIT_DIR
    process.env.GIT_DIR = "/nonexistent/untrusted-git-dir"
    let validation: unknown
    try {
      validation = await runner.execute(
        {
          action: "run_validation",
          argv: ["python3", "scripts/validate.py"],
          cwd: ".",
          source: ".github/workflows/ci.txt",
          source_kind: "repository",
          timeout_seconds: 30,
        },
        context(worktree, "detection-implementer"),
      )
    } finally {
      if (originalGitDir === undefined) delete process.env.GIT_DIR
      else process.env.GIT_DIR = originalGitDir
    }
    const result = JSON.parse(String(validation))
    expect(result.exit_code).toBe(0)
    expect(result.stdout).toContain("validator passed")

    writeFileSync(join(worktree, "scripts", "validate.py"), 'print("modified validator")\n')
    const modifiedValidator = await runner.execute(
      {
        action: "run_validation",
        argv: ["python3", "scripts/validate.py"],
        cwd: ".",
        source: ".github/workflows/ci.txt",
        source_kind: "repository",
      },
      context(worktree, "detection-implementer"),
    )
    expect(String(modifiedValidator)).toContain("differs from the repository baseline")

    git(worktree, ["restore", "--", "scripts/validate.py"])
    const selfCitedValidator = await runner.execute(
      {
        action: "run_validation",
        argv: ["python3", "scripts/validate.py"],
        source: "scripts/validate.py",
        source_kind: "repository",
      },
      context(worktree, "detection-implementer"),
    )
    expect(String(selfCitedValidator)).toContain("independent instruction or CI source")

    const shellCapableTool = await runner.execute(
      {
        action: "run_validation",
        argv: ["make", "--eval=x: ; id"],
        source: ".github/workflows/ci.txt",
        source_kind: "repository",
      },
      context(worktree, "detection-implementer"),
    )
    expect(String(shellCapableTool)).toContain("Executable is not allowlisted")
  } finally {
    rmSync(worktree, { recursive: true, force: true })
  }
})

test("runner rejects non-worker agents", async () => {
  const output = await runner.execute(
    { action: "inspect_diff", base_commit: "0".repeat(40) },
    context(process.cwd(), "detection-planner"),
  )
  expect(String(output)).toContain("only detection-factory implementers and reviewers")
})

test("runner requires absolute paths for trusted factory validation", async () => {
  const output = await runner.execute(
    {
      action: "run_validation",
      argv: ["python3", "skills/detection-test/scripts/test-detection-rules.py"],
      source: "skills/detection-test/scripts/test-detection-rules.py",
      source_kind: "factory",
    },
    context(process.cwd(), "detection-reviewer"),
  )
  expect(String(output)).toContain("must be an absolute path")
})

test("runner loads and redacts Graph credentials without returning their values", () => {
  const directory = mkdtempSync(join(tmpdir(), "detection-factory-credentials-test-"))
  const path = join(directory, "defender-xdr.env")
  try {
    writeFileSync(
      path,
      [
        "MS_GRAPH_TENANT_ID=test-tenant",
        "MS_GRAPH_CLIENT_ID=test-client",
        "MS_GRAPH_CLIENT_SECRET=test-secret-value",
        "",
      ].join("\n"),
      { mode: 0o600 },
    )
    const environment = loadGraphEnvironment(path)
    expect(environment.MS_GRAPH_TENANT_ID).toBe("test-tenant")
    expect(environment.MS_GRAPH_CLIENT_ID).toBe("test-client")
    expect(environment.MS_GRAPH_CLIENT_SECRET).toBe("test-secret-value")

    chmodSync(path, 0o644)
    expect(() => loadGraphEnvironment(path)).toThrow("permissions must deny group and other access")
    chmodSync(path, 0o600)

    const output = redactSecrets(
      "tenant=test-tenant client=test-client secret=test-secret-value",
      Object.values(environment),
    )
    expect(output).toBe("tenant=[REDACTED] client=[REDACTED] secret=[REDACTED]")
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test("metadata reviewer independently verifies scalar-only diff and fingerprint", async () => {
  const worktree = mkdtempSync(join(tmpdir(), "detection-factory-metadata-runner-test-"))
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    git(worktree, ["init", "-b", "main"])
    writeFileSync(
      join(worktree, ".detection-factory.json"),
      '{"metadata":{"canonicalOwner":"detection-team@company.com"}}\n',
    )
    writeFileSync(
      join(worktree, "rule.yaml"),
      [
        'id: ""',
        "name: Metadata_Runner_Test",
        'owner: ""',
        "query: |-",
        "  DeviceProcessEvents",
        '  | where FileName == "cmd.exe"',
        "testblock:",
        "  - testdata: |",
        "      let DeviceProcessEvents = datatable(FileName:string)[];",
        "    expected: 0",
        "",
      ].join("\n"),
    )
    git(worktree, ["add", "--", ".detection-factory.json", "rule.yaml"])
    git(worktree, ["-c", "user.name=Factory Test", "-c", "user.email=factory@example.invalid", "commit", "-m", "baseline"])
    const baseCommit = git(worktree, ["rev-parse", "HEAD"])
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: metadata_prepare\n`,
      },
      context(worktree, "detection-factory-cloud"),
    )
    git(worktree, ["switch", "-c", "detection/metadata-runner"])
    const prepared = JSON.parse(
      String(
        await stateTool.execute(
          {
            action: "prepare_metadata",
            run_id: runId,
            base_commit: baseCommit,
            target_path: "rule.yaml",
            requested_fields: ["id", "owner"],
            expected_branch: "detection/metadata-runner",
          },
          context(worktree, "detection-factory-cloud"),
        ),
      ),
    )

    const reviewArgs = {
      action: "inspect_metadata_diff" as const,
      base_commit: baseCommit,
      target_path: "rule.yaml",
      requested_fields: ["id", "owner"] as Array<"id" | "owner">,
      expected_id: prepared.values.id,
      expected_owner: prepared.values.owner,
      expected_policy_sha256: prepared.owner_resolution.sha256,
      expected_fingerprint: prepared.fingerprint,
    }
    const inspection = JSON.parse(
      String(await runner.execute(reviewArgs, context(worktree, "detection-metadata-reviewer"))),
    )
    expect(inspection.valid).toBe(true)
    expect(inspection.fingerprint_matches).toBe(true)
    expect(inspection.changed_paths).toEqual(["rule.yaml"])
    expect(inspection.proof.base_non_metadata_sha256).toBe(prepared.proof.base_non_metadata_sha256)
    expect(inspection.proof.base_query_sha256).toBe(inspection.proof.result_query_sha256)

    const wrongPolicy = await runner.execute(
      { ...reviewArgs, expected_policy_sha256: "0".repeat(64) },
      context(worktree, "detection-metadata-reviewer"),
    )
    expect(String(wrongPolicy)).toContain("not bound to the expected repository policy")

    const preparedRule = readFileSync(join(worktree, "rule.yaml"), "utf8")
    writeFileSync(
      join(worktree, "rule.yaml"),
      preparedRule.replace('FileName == "cmd.exe"', 'FileName == "powershell.exe"'),
    )
    const tampered = JSON.parse(
      String(await runner.execute(reviewArgs, context(worktree, "detection-metadata-reviewer"))),
    )
    expect(tampered.valid).toBe(false)
    expect(tampered.proof.base_query_sha256).not.toBe(tampered.proof.result_query_sha256)

    writeFileSync(join(worktree, "rule.yaml"), preparedRule)
    writeFileSync(join(worktree, "unexpected.txt"), "scope drift\n")
    const extraPath = await runner.execute(reviewArgs, context(worktree, "detection-metadata-reviewer"))
    expect(String(extraPath)).toContain("exactly one changed path")

    const wrongRole = await runner.execute(reviewArgs, context(worktree, "detection-reviewer"))
    expect(String(wrongRole)).toContain("only profile-pinned metadata reviewers")
    const broadAction = await runner.execute(
      { action: "inspect_diff", base_commit: baseCommit },
      context(worktree, "detection-metadata-reviewer"),
    )
    expect(String(broadAction)).toContain("only detection-factory implementers and reviewers")
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    const stateRoot = "/tmp/opencode/detection-factory"
    for (const name of readdirSync(stateRoot)) {
      if (name.startsWith(runId)) rmSync(join(stateRoot, name), { force: true })
    }
  }
})
