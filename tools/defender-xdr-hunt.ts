import { tool } from "@opencode-ai/plugin"
import {
  appendFileSync,
  chmodSync,
  closeSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
} from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"
import { createHash } from "node:crypto"

const SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")
const LOG_FILE = join(homedir(), ".local/share/opencode/logs/defender-xdr-hunt.log")
const TOKEN_TIMEOUT_MS = 60_000
const QUERY_TIMEOUT_MS = 600_000
const GRAPH_URL = "https://graph.microsoft.com/v1.0/security/runHuntingQuery"
const MAX_RETURN_ROWS = 500
const QUERY_RETRIES = 2
const FACTORY_PLANNER_QUERY_LIMIT = 8
const FACTORY_STATE_ROOT = "/tmp/opencode/detection-factory"
const FACTORY_RUN_ID = /^\d{8}T\d{6}Z-[a-z0-9][a-z0-9-]{0,80}$/

const factoryPlannerAgents = new Set(["detection-planner", "detection-planner-local"])

type QueryPurpose = "schema" | "cardinality" | "sample" | "test" | "investigation"

function assertOwnedRegularFile(path: string) {
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Unsafe factory budget file: ${path}`)
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) {
    throw new Error(`Factory budget file is not owned by the current user: ${path}`)
  }
}

export function consumeFactoryPlannerBudget(agent: string, runId?: string): { error: string | null; used: number | null } {
  if (!factoryPlannerAgents.has(agent)) return { error: null, used: null }
  if (!runId || !FACTORY_RUN_ID.test(runId)) {
    return { error: "Factory planners must supply the valid run_id from ScoutContract.", used: null }
  }

  try {
    const root = lstatSync(FACTORY_STATE_ROOT)
    if (root.isSymbolicLink() || !root.isDirectory()) throw new Error("Unsafe factory state root")
    if (typeof process.getuid === "function" && root.uid !== process.getuid()) {
      throw new Error("Factory state root is not owned by the current user")
    }
    assertOwnedRegularFile(join(FACTORY_STATE_ROOT, `${runId}.yaml`))

    for (let slot = 1; slot <= FACTORY_PLANNER_QUERY_LIMIT; slot += 1) {
      const path = join(FACTORY_STATE_ROOT, `${runId}-planner-xdr-${slot}.slot`)
      try {
        const descriptor = openSync(path, "wx", 0o600)
        closeSync(descriptor)
        return { error: null, used: slot }
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error
        assertOwnedRegularFile(path)
      }
    }
    return {
      error: `Planner query budget exhausted (${FACTORY_PLANNER_QUERY_LIMIT} per run). Batch evidence or return a blocker.`,
      used: FACTORY_PLANNER_QUERY_LIMIT,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown planner budget error"
    return { error: `Planner query budget unavailable: ${message}`, used: null }
  }
}

function logStep(message: string) {
  try {
    mkdirSync(dirname(LOG_FILE), { recursive: true, mode: 0o700 })
    chmodSync(dirname(LOG_FILE), 0o700)
    appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, { mode: 0o600 })
    chmodSync(LOG_FILE, 0o600)
  } catch {}
}

function parseEnvFile(path: string): Record<string, string> {
  const content = readFileSync(path, "utf-8")
  const result: Record<string, string> = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, "")
    const raw = trimmed.slice(eq + 1).trim()
    const value =
      (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
        ? raw.slice(1, -1)
        : raw
    result[key] = value
  }
  return result
}

function validCredential(value: string | undefined): value is string {
  return Boolean(value && !value.includes("\0") && !value.includes("\n") && !value.includes("\r"))
}

export function loadCredentials(path = SECRETS_FILE) {
  let secrets: Record<string, string>
  try {
    const stat = lstatSync(path)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("Credential source is not a regular file")
    if (typeof process.getuid === "function" && stat.uid !== process.getuid()) {
      throw new Error("Credential source is not owned by the current user")
    }
    if ((stat.mode & 0o077) !== 0) {
      throw new Error("Credential source permissions must deny group and other access")
    }
    secrets = parseEnvFile(path)
  } catch {
    throw new Error(
      `Credential file not found at ${path}. ` +
      "Run setup-defender-xdr.sh to configure credentials."
    )
  }

  const tenantId = secrets.MS_GRAPH_TENANT_ID
  const clientId = secrets.MS_GRAPH_CLIENT_ID
  const clientSecret = secrets.MS_GRAPH_CLIENT_SECRET

  if (!validCredential(tenantId) || !validCredential(clientId) || !validCredential(clientSecret)) {
    throw new Error(
      `Credential file at ${path} is missing valid required fields. ` +
      "Run setup-defender-xdr.sh --reconfigure to update credentials."
    )
  }

  return { tenantId, clientId, clientSecret }
}

async function acquireToken(cred: { tenantId: string; clientId: string; clientSecret: string }) {
  const url = `https://login.microsoftonline.com/${cred.tenantId}/oauth2/v2.0/token`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: cred.clientId,
      client_secret: cred.clientSecret,
      scope: "https://graph.microsoft.com/.default",
    }),
    signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS),
  })

  if (!response.ok) {
    let errorCode = "unknown"
    try {
      const body = await response.json()
      if (body && typeof body === "object" && typeof body.error === "string") {
        errorCode = body.error.replace(/[^a-z0-9_.-]/gi, "").slice(0, 80) || "unknown"
      }
    } catch {}
    logStep(`Token endpoint error (HTTP ${response.status}, code=${errorCode})`)
    throw new Error(`Token endpoint returned HTTP ${response.status}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error("Token endpoint returned no access_token")
  }

  return data.access_token
}

function sanitizeForLLM(err: unknown): string {
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  logStep(`ERROR ${msg}`)
  return `Request failed: ${err instanceof Error ? err.name : "Unknown error"}. Check ${LOG_FILE} for details.`
}

function graphErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return ""
  const error = (body as { error?: unknown }).error
  if (!error || typeof error !== "object") return ""
  const message = (error as { message?: unknown }).message
  if (typeof message !== "string") return ""
  return message.replace(/[\r\n\t]+/g, " ").slice(0, 500)
}

function defaultTimespan(purpose: QueryPurpose): string {
  if (purpose === "investigation") return "P30D"
  if (purpose === "cardinality" || purpose === "sample") return "P7D"
  return "P1D"
}

function validateTimespan(timespan: string): string | null {
  const hours = timespan.match(/^PT(\d+)H$/)
  if (hours) {
    const value = Number(hours[1])
    return value >= 1 && value <= 720 ? null : "Timespan must be between PT1H and P30D."
  }
  const days = timespan.match(/^P(\d+)D$/)
  if (days) {
    const value = Number(days[1])
    return value >= 1 && value <= 30 ? null : "Timespan must be between PT1H and P30D."
  }
  return "Timespan must use PT<n>H or P<n>D with a maximum of 30 days."
}

function validatePurpose(query: string, purpose: QueryPurpose): string | null {
  const normalized = query.toLowerCase()
  const limitMatch = normalized.match(/\|\s*(?:take|limit)\s+(\d+)/g)
  const limits = (limitMatch ?? []).map((value) => Number(value.match(/\d+/)?.[0] ?? 0))

  if (purpose === "schema" && (!limits.length || Math.max(...limits) > 10)) {
    return "Schema queries require a take/limit of 10 rows or fewer."
  }
  if (purpose === "sample" && (!limits.length || Math.max(...limits) > 100)) {
    return "Sample queries require a take/limit of 100 rows or fewer."
  }
  if (purpose === "cardinality" && !/\|\s*(summarize|count)\b/.test(normalized)) {
    return "Cardinality queries must end in count or summarize output."
  }
  if (purpose === "test" && !/\|\s*count\s*;?\s*(?:\/\/[^\r\n]*)?\s*$/.test(normalized)) {
    return "Test queries must end with | count."
  }
  return null
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After")
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds, 1), 120) * 1000
  }
  return Math.min(2 ** attempt * 5, 60) * 1000
}

async function runQuery(token: string, body: Record<string, string>): Promise<Response> {
  for (let attempt = 0; attempt <= QUERY_RETRIES; attempt += 1) {
    const response = await fetch(GRAPH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    })

    if (response.status !== 429 || attempt === QUERY_RETRIES) return response

    const delay = retryDelayMs(response, attempt)
    logStep(`[3/4] Graph API throttled; retry ${attempt + 1}/${QUERY_RETRIES} in ${delay / 1000}s`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  throw new Error("Query retry loop ended unexpectedly")
}

export default tool({
  description:
    "Run an advanced hunting query against Microsoft Defender XDR via the Microsoft Graph API. " +
    "Credentials are read from ~/.local/share/opencode/secrets/defender-xdr.env. " +
    "Run setup-defender-xdr.sh to configure credentials.",
  args: {
    query: tool.schema.string().describe("KQL query to execute via runHuntingQuery"),
    purpose: tool.schema
      .enum(["schema", "cardinality", "sample", "test", "investigation"])
      .optional()
      .describe("Query purpose used to enforce factory safety bounds. Defaults to investigation."),
    timespan: tool.schema
      .string()
      .optional()
      .describe(
        "ISO 8601 time range. Defaults to P1D/P7D by bounded purpose and P30D for investigation."
      ),
    run_id: tool.schema
      .string()
      .optional()
      .describe("Detection-factory run ID. Required for factory planner roles and used for the per-run query budget."),
  },
  async execute(args, context) {
    try {
      const purpose = (args.purpose ?? "investigation") as QueryPurpose
      const validationError = validatePurpose(args.query, purpose)
      if (validationError) return `Query rejected: ${validationError}`

      const timespan = args.timespan ?? defaultTimespan(purpose)
      const timespanError = validateTimespan(timespan)
      if (timespanError) return `Query rejected: ${timespanError}`

      const factoryBudget = consumeFactoryPlannerBudget(context.agent, args.run_id)
      if (factoryBudget.error) return `Query rejected: ${factoryBudget.error}`

      const queryHash = createHash("sha256").update(args.query).digest("hex").slice(0, 16)
      logStep("=== query start ===")
      logStep(
        `agent=${context.agent} session=${context.sessionID} run=${args.run_id ?? "none"} purpose=${purpose} ` +
        `timespan=${timespan} query_sha256=${queryHash}`
      )

      logStep("[1/4] Reading credentials...")
      const cred = loadCredentials()
      logStep("[1/4] Credentials loaded")

      logStep("[2/4] Acquiring access token...")
      const token = await acquireToken(cred)
      logStep("[2/4] Token acquired")

      logStep("[3/4] Running query against Graph API...")
      const body: Record<string, string> = { Query: args.query, Timespan: timespan }

      const response = await runQuery(token, body)

      if (!response.ok) {
        const status = response.status
        let errorBody: unknown = null
        try {
          errorBody = await response.json()
        } catch {}
        logStep(`[3/4] Graph API HTTP ${status}: ${JSON.stringify(errorBody)}`)
        const detail = graphErrorMessage(errorBody)
        return `Graph API returned HTTP ${status}${detail ? `: ${detail}` : ""}. Check ${LOG_FILE} for details.`
      }

      const data = await response.json()
      if (factoryBudget.used !== null) {
        data.factoryPlannerBudget = {
          used: factoryBudget.used,
          limit: FACTORY_PLANNER_QUERY_LIMIT,
        }
      }
      const resultCount = Array.isArray(data.results) ? data.results.length : "?"
      logStep(`[3/4] Query returned ${resultCount} rows`)

      if (Array.isArray(data.results) && data.results.length > MAX_RETURN_ROWS) {
        data.results = data.results.slice(0, MAX_RETURN_ROWS)
        data.truncated = true
        data.originalResultCount = resultCount
        logStep(`[3/4] Response truncated to ${MAX_RETURN_ROWS} rows for model context safety`)
      }

      logStep("[4/4] Done")
      return JSON.stringify(data, null, 2)
    } catch (err) {
      return sanitizeForLLM(err)
    }
  },
})
