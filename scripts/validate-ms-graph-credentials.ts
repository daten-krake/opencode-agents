import { readFileSync, mkdirSync, appendFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, dirname } from "node:path"

const SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")
const LOG_FILE = join(homedir(), ".local/share/opencode/logs/defender-xdr-hunt.log")
const TOKEN_TIMEOUT_MS = 30_000

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

async function main() {
  logStep("=== credential validation start ===")

  logStep("[1/3] Reading credentials...")
  let cred
  try {
    cred = loadCredentials()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`FAIL: ${msg}`)
    process.exit(1)
  }
  logStep("[1/3] Credentials loaded")

  logStep("[2/3] Acquiring access token...")
  try {
    await acquireToken(cred)
    logStep("[2/3] Token acquired")
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`FAIL: ${msg}`)
    console.error("Check: client secret may be expired, or app registration lacks ThreatHunting.Read.All.")
    process.exit(1)
  }

  logStep("[3/3] Validation complete")
  console.error("OK: Token acquired successfully.")
  process.exit(0)
}

main()
