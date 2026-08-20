import { expect, test } from "bun:test"
import { chmodSync, mkdtempSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { pathToFileURL } from "node:url"

import stateTool from "../tools/detection-factory-state"
import { consumeFactoryPlannerBudget, loadCredentials } from "../tools/defender-xdr-hunt"

const STATE_ROOT = "/tmp/opencode/detection-factory"

function context() {
  return {
    agent: "detection-factory-cloud",
    sessionID: "budget-test-session",
    messageID: "budget-test-message",
    directory: process.cwd(),
    worktree: process.cwd(),
    abort: new AbortController().signal,
    metadata: () => {},
    ask: () => {
      throw new Error("unexpected permission request")
    },
  } as never
}

function cleanState(runId: string) {
  for (const name of readdirSync(STATE_ROOT)) {
    if (name.startsWith(runId)) unlinkSync(join(STATE_ROOT, name))
  }
}

test("planner XDR budget persists for the factory run", async () => {
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: plan\n`,
      },
      context(),
    )

    for (let expected = 1; expected <= 8; expected += 1) {
      const result = consumeFactoryPlannerBudget("detection-planner", runId)
      expect(result.error).toBeNull()
      expect(result.used).toBe(expected)
    }
    const exhausted = consumeFactoryPlannerBudget("detection-planner", runId)
    expect(exhausted.error).toContain("per run")
    expect(exhausted.used).toBe(8)
  } finally {
    cleanState(runId)
  }
})

test("planner XDR budget is atomic across concurrent processes", async () => {
  const runId = `20990101T000000Z-${randomUUID().replaceAll("-", "").slice(0, 12)}`
  try {
    await stateTool.execute(
      {
        action: "write",
        kind: "checkpoint",
        run_id: runId,
        content: `contract_version: 1\nrun_id: ${runId}\nstage: plan\n`,
      },
      context(),
    )

    const moduleUrl = pathToFileURL(join(process.cwd(), "tools", "defender-xdr-hunt.ts")).href
    const script = [
      `import { consumeFactoryPlannerBudget } from ${JSON.stringify(moduleUrl)}`,
      `process.stdout.write(JSON.stringify(consumeFactoryPlannerBudget("detection-planner", ${JSON.stringify(runId)})))`,
    ].join(";")
    const children = Array.from({ length: 16 }, () =>
      Bun.spawn(["bun", "-e", script], { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" }),
    )
    const results = await Promise.all(
      children.map(async (child) => {
        const [stdout, stderr, exitCode] = await Promise.all([
          new Response(child.stdout).text(),
          new Response(child.stderr).text(),
          child.exited,
        ])
        expect(exitCode, stderr).toBe(0)
        return JSON.parse(stdout) as { error: string | null; used: number }
      }),
    )

    expect(results.filter((result) => result.error === null)).toHaveLength(8)
    expect(results.filter((result) => result.error?.includes("exhausted"))).toHaveLength(8)
    const exhausted = consumeFactoryPlannerBudget("detection-planner", runId)
    expect(exhausted.error).toContain("per run")
    expect(exhausted.used).toBe(8)
  } finally {
    cleanState(runId)
  }
})

test("Defender credential loading requires an owned regular file", () => {
  const directory = mkdtempSync(join(tmpdir(), "defender-xdr-credentials-test-"))
  const path = join(directory, "defender-xdr.env")
  const link = join(directory, "linked.env")
  try {
    writeFileSync(
      path,
      [
        "MS_GRAPH_TENANT_ID=test-tenant",
        "MS_GRAPH_CLIENT_ID=test-client",
        "MS_GRAPH_CLIENT_SECRET=test-secret",
        "",
      ].join("\n"),
      { mode: 0o600 },
    )
    expect(loadCredentials(path)).toEqual({
      tenantId: "test-tenant",
      clientId: "test-client",
      clientSecret: "test-secret",
    })

    chmodSync(path, 0o644)
    expect(() => loadCredentials(path)).toThrow("Credential file not found")
    chmodSync(path, 0o600)

    symlinkSync(path, link)
    expect(() => loadCredentials(link)).toThrow("Credential file not found")
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
