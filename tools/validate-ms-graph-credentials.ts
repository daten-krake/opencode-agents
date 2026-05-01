import { logStep, loadCredentials, acquireToken } from "./lib/credentials"

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
