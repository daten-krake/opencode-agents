import { ConfidentialClientApplication } from "@azure/msal-node"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const SECRETS_FILE = join(homedir(), ".local/share/opencode/secrets/defender-xdr.env")

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

async function main() {
  let secrets: Record<string, string>
  try {
    secrets = parseEnvFile(SECRETS_FILE)
  } catch {
    console.error("FAIL: Cannot read secrets file:", SECRETS_FILE)
    console.error("Run: ./setup-defender-xdr.sh")
    process.exit(1)
  }

  const { MS_GRAPH_TENANT_ID, MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET } = secrets
  if (!MS_GRAPH_TENANT_ID || !MS_GRAPH_CLIENT_ID || !MS_GRAPH_CLIENT_SECRET) {
    console.error("FAIL: Secrets file is missing required fields.")
    console.error("Run: ./setup-defender-xdr.sh --reconfigure")
    process.exit(1)
  }

  try {
    const app = new ConfidentialClientApplication({
      auth: {
        authority: `https://login.microsoftonline.com/${MS_GRAPH_TENANT_ID}`,
        clientId: MS_GRAPH_CLIENT_ID,
        clientSecret: MS_GRAPH_CLIENT_SECRET,
      },
    })
    const result = await app.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    })
    if (!result?.accessToken) {
      console.error("FAIL: MSAL returned no access token. Verify ThreatHunting.Read.All permission is granted and admin-consented.")
      process.exit(1)
    }
    console.error("OK: Token acquired successfully.")
    process.exit(0)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`FAIL: ${msg}`)
    console.error("Check: client secret may be expired, or app registration lacks ThreatHunting.Read.All.")
    process.exit(1)
  }
}

main()
