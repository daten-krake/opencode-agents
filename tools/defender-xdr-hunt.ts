import { tool } from "@opencode-ai/plugin"
import { ConfidentialClientApplication } from "@azure/msal-node"
import { readFileSync, mkdirSync, appendFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"

const GRAPH_SCOPES = ["https://graph.microsoft.com/.default"]
const GRAPH_URL = "https://graph.microsoft.com/v1.0/security/runHuntingQuery"
const SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")
const LOG_FILE = join(homedir(), ".local/share/opencode/logs/defender-xdr-hunt.log")

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

function logError(message: string) {
  try {
    mkdirSync(dirname(LOG_FILE), { recursive: true })
    appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`)
  } catch {}
}

function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    logError(`${err.name}: ${err.message}`)
    return `Request failed: ${err.name}. Check ${LOG_FILE} for details.`
  }
  logError(`Unknown error: ${String(err)}`)
  return "Unknown error occurred. Check server logs."
}

function sanitizeHttpError(status: number, rawBody: unknown): string {
  const bodyStr = JSON.stringify(rawBody)
  logError(`Graph API HTTP ${status}: ${bodyStr}`)
  return `Graph API returned HTTP ${status}. Check ${LOG_FILE} for details.`
}

async function getAccessToken(): Promise<string> {
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

  const msalApp = new ConfidentialClientApplication({
    auth: {
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientId,
      clientSecret,
    },
  })

  const result = await msalApp.acquireTokenByClientCredential({
    scopes: GRAPH_SCOPES,
  })

  if (!result?.accessToken) {
    throw new Error("MSAL returned no access token")
  }

  return result.accessToken
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
      const token = await getAccessToken()

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
      })

      if (!response.ok) {
        const status = response.status
        let errorBody: unknown = "(could not parse response body)"
        try {
          errorBody = await response.json()
        } catch {}
        return sanitizeHttpError(status, errorBody)
      }

      const data = await response.json()
      return JSON.stringify(data, null, 2)
    } catch (err) {
      return sanitizeError(err)
    }
  },
})
