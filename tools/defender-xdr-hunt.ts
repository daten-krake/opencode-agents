import { tool } from "@opencode-ai/plugin"
import {
  logStep,
  loadCredentials,
  acquireToken,
  GRAPH_URL,
  QUERY_TIMEOUT_MS,
  sanitizeForLLM,
  LOG_FILE,
} from "./lib/credentials"

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
