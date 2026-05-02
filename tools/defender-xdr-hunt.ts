import { tool } from "@opencode-ai/plugin"
import { readFileSync, mkdirSync, appendFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"

const SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")
const LOG_FILE = join(homedir(), ".local/share/opencode/logs/defender-xdr-hunt.log")
const TOKEN_TIMEOUT_MS = 30_000
const QUERY_TIMEOUT_MS = 300_000
const GRAPH_URL = "https://graph.microsoft.com/v1.0/security/runHuntingQuery"

function logStep(message: string) {
  try {
    mkdirSync(dirname(LOG_FILE), { recursive: true })
    appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`)
  } catch {}
}

function parseEnvFile(path: string): Record<string, string> {
  const content = readFileSync(path, "utf-8")
  const result: Record<string, string> = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "")
  }
  return result
}

function loadCredentials() {
  let secrets: Record<string, string>
  try {
    secrets = parseEnvFile(SECRETS_FILE)
  } catch {
    throw new Error(
      `Credential file not found at ${SECRETS_FILE}. ` +
      "Run setup-defender-xdr.sh to configure credentials."
    )
  }

  const tenantId = secrets.MS_GRAPH_TENANT_ID
  const clientId = secrets.MS_GRAPH_CLIENT_ID
  const clientSecret = secrets.MS_GRAPH_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      `Credential file at ${SECRETS_FILE} is missing required fields. ` +
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
    let detail = ""
    try {
      detail = JSON.stringify(await response.json())
    } catch {}
    logStep(`Token endpoint error (HTTP ${response.status}): ${detail}`)
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

export default tool({
  description:
    "Run an advanced hunting query against Microsoft Defender XDR via the Microsoft Graph API. " +
    "Credentials are read from ~/.local/share/opencode/secrets/defender-xdr.env. " +
    "Run setup-defender-xdr.sh to configure credentials.",
  args: {
    query: tool.schema.string().describe("KQL query to execute via runHuntingQuery"),
    timespan: tool.schema
      .string()
      .optional()
      .describe(
        "ISO 8601 time range (e.g. P7D, P30D, 2024-03-01T00:00:00Z/2024-03-15T00:00:00Z). Defaults to 30 days."
      ),
  },
  async execute(args) {
    try {
      logStep("=== query start ===")

      logStep("[1/4] Reading credentials...")
      const cred = loadCredentials()
      logStep("[1/4] Credentials loaded")

      logStep("[2/4] Acquiring access token...")
      const token = await acquireToken(cred)
      logStep("[2/4] Token acquired")

      logStep("[3/4] Running query against Graph API...")
      const body: Record<string, string> = { Query: args.query }
      if (args.timespan) {
        body.Timespan = args.timespan
      }

      const response = await fetch(GRAPH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
      })

      if (!response.ok) {
        const status = response.status
        let errorBody: unknown = null
        try {
          errorBody = await response.json()
        } catch {}
        logStep(`[3/4] Graph API HTTP ${status}: ${JSON.stringify(errorBody)}`)
        return `Graph API returned HTTP ${status}. Check ${LOG_FILE} for details.`
      }

      const data = await response.json()
      const resultCount = Array.isArray(data.results) ? data.results.length : "?"
      logStep(`[3/4] Query returned ${resultCount} rows`)

      logStep("[4/4] Done")
      return JSON.stringify(data, null, 2)
    } catch (err) {
      return sanitizeForLLM(err)
    }
  },
})
