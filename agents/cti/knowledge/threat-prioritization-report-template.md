# Threat Prioritization Report Template

This is the exact structure the CTI agent produces. Every report follows this template. Sections are not optional — if a section has no findings, state "No findings" and explain why.

---

## Template

```markdown
## Threat Prioritization Report: [Customer Name / Industry / Geography]

### Customer Profile
- **Organization:** [name, if known]
- **Industry / sector:** [manufacturing, healthcare, finance, government, etc.]
- **Geographic footprint:** [regions of operation]
- **Tech stack:**
  - Cloud provider: [Azure, AWS, GCP, on-prem, hybrid]
  - Email provider: [O365, Google Workspace, on-prem Exchange]
  - Identity provider: [Entra ID, on-prem AD, hybrid, Okta]
  - EDR: [Defender for Endpoint, CrowdStrike, SentinelOne, unknown]
  - OS fleet: [Windows, Linux, macOS, mixed]
  - SIEM: [Sentinel, Splunk, Elastic, unknown]
- **Public exposure summary:** [1-2 sentence summary of key OSINT findings]
- **Report date:** [date]
- **OSINT research date:** [date]
- **Sources consulted:** [list of live sources fetched during report generation]

### Public Attack Surface Findings

| Asset / Finding | Type | Source | Date Accessed | Risk Level | Details |
|-----------------|------|--------|---------------|------------|---------|
| vpn.example.com:443 (FortiOS 7.0) | Exposed VPN appliance | Shodan, crt.sh | 2026-07-14 | CRITICAL | FortiOS CVE-2023-27997 vulnerable; actively exploited by Play, LockBit |
| dev.example.com (Jenkins 2.350) | Exposed CI/CD | crt.sh, Shodan | 2026-07-14 | HIGH | Jenkins exposed; T1195 supply chain target; outdated version |
| 3 employee emails in breaches | Leaked credentials | HaveIBeenPwned | 2026-07-14 | MEDIUM | Credential reuse risk (T1078); info-stealer-linked |
| O365 tenant confirmed | Email/identity | DNS MX, TXT (MS=) | 2026-07-14 | MEDIUM | APT29, APT35, Scattered Spider target profile |
| WordPress 6.0 (outdated) | Web framework | Website fetch | 2026-07-14 | MEDIUM | CVE-driven exploitation (T1190); v6.0 has known CVEs |
| No DMARC record | Email security | DNS TXT | 2026-07-14 | LOW | Email spoofing risk (T1566.002); no DMARC enforcement |
| GitHub org: example-com | Source exposure | GitHub search | 2026-07-14 | LOW | Public Terraform repo reveals cloud architecture; no secrets found in quick scan |

**OSINT coverage notes:** [What was checked, what was not accessible, what needs operator follow-up]

### Matched Threat Actors

| Group | Aliases | Origin | Targets This Industry? | Active Campaigns? | Relevance Score (0.0–1.0) | Why Matched |
|-------|---------|--------|------------------------|--------------------|--------------------------|--------------|
| APT29 | Cozy Bear, NOBELIUM, Midnight Blizzard | Russia | YES — govt + cloud supply chain | YES — O365 consent grant abuse (CISA AA26-107A, 2026-04) | 0.92 | Customer uses O365; active campaign via consent grant abuse (T1098.003) |
| LockBit | LockBit Supp | Russia (RaaS) | YES — manufacturing #1 target | YES — LockBit 4.0 resurgent (CISA #StopRansomware, 2026-05) | 0.88 | Customer is manufacturer with exposed FortiOS VPN (T1190) |
| Play | PlayCrypt | unclear | YES — manufacturing | YES — active (ransomwatch) | 0.82 | Customer has FortiOS (Play's primary initial access vector) |
| Scattered Spider | 0KSPU, STAC#5881 | unclear | YES — tech, O365 | YES — active (MSTIC, 2026-06) | 0.75 | Customer uses O365; Scattered Spider social-engineers helpdesk for MFA reset |
| FIN7 | Carbanak | Russia/E. Europe | YES — manufacturing (historical) | Recently active (Mandiant, 2026-Q1) | 0.60 | Manufacturing target; but no direct exposure match |

### Current Threat Landscape (last 90 days)

#### Active Campaigns Relevant to This Profile
| Campaign / Actor | First Reported | Source | Relevance to Customer | Key TTPs |
|-------------------|---------------|--------|----------------------|----------|
| Midnight Blizzard O365 consent grant abuse | 2026-04-15 | MSTIC, CISA AA26-107A | HIGH — customer uses O365 | T1098.003, T1528, T1078.004 |
| LockBit 4.0 resurgent | 2026-05-20 | CISA #StopRansomware | HIGH — exposed FortiOS VPN | T1190, T1078, T1486, T1490 |
| Play FortiOS exploitation | 2026-06-10 | CISA, vendor reports | HIGH — exposed FortiOS | T1190, T1486, T1567 |

#### Recent Advisories Matching Profile
| Advisory | Date | Actor / Threat | Matches Customer Because... |
|----------|------|----------------|------------------------------|
| AA26-107A — Midnight Blizzard O365 targeting | 2026-04-15 | APT29 | Customer uses O365 |
| #StopRansomware — LockBit 4.0 | 2026-05-20 | LockBit | Customer has exposed FortiOS VPN |
| #StopRansomware — Play FortiOS CVE-2023-27997 | 2026-06-10 | Play | Customer has FortiOS 7.0 (vulnerable) |

#### Ransomware Activity in This Sector (manufacturing)
| Crew | Activity Status | Source | Targeting This Industry? |
|------|-----------------|--------|--------------------------|
| LockBit 4.0 | Active — resurgent post-Cronos | CISA, ransomwatch | YES — manufacturing #1 |
| Play | Active | ransomwatch | YES — manufacturing |
| Akira | Active | Sophos X-Ops | YES — manufacturing via Cisco VPN |
| Black Basta | Active | ransomwatch | YES — manufacturing |

### Prioritized TTP List

| Priority | Score | TTP | MITRE ID | Threat Actor(s) | Why Relevant | Suggested Abstraction Layer | Recommended Engine |
|----------|-------|-----|----------|------------------|--------------|-----------------------------|---------------------|
| CRITICAL | 0.91 | Exploit Public-Facing Application (FortiOS CVE) | T1190 | Play, LockBit | Customer has vulnerable FortiOS exposed; actively exploited | Technique | Defender XDR (DeviceNetworkEvents) |
| CRITICAL | 0.88 | Additional Cloud Roles (consent grant) | T1098.003 | APT29 / Midnight Blizzard | Customer uses O365; active campaign via OAuth consent grant | Function | Sentinel (AuditLogs) |
| CRITICAL | 0.86 | Data Encrypted for Impact | T1486 | LockBit, Play, Akira | Manufacturing #1 target; all active crews encrypt | Technique | Defender XDR (DeviceEvents) |
| HIGH | 0.78 | Valid Accounts (cloud) | T1078.004 | APT29, Scattered Spider | O365 in use; credential theft via phishing/info-stealers | Function | Sentinel (SigninLogs, AuditLogs) |
| HIGH | 0.74 | Inhibit System Recovery | T1490 | LockBit, Play | Active crews delete backups; vssadmin, wbadmin | Procedure | Defender XDR (DeviceProcessEvents) |
| HIGH | 0.72 | Credential Dumping (LSASS) | T1003.001 | LockBit, Black Basta, FIN7 | Windows endpoints; ransomware crews dump LSASS | Technique | Defender XDR (DeviceProcessEvents, DeviceEvents) |
| MEDIUM | 0.61 | Phishing (spearphishing link) | T1566.002 | APT29, APT35 | O365 users; no DMARC (email spoofing) | Technique | Defender XDR (EmailEvents) |
| MEDIUM | 0.55 | Ingress Tool Transfer | T1105 | LockBit, Play | All active crews download tools post-access | Procedure | Defender XDR (DeviceNetworkEvents, DeviceFileEvents) |

### Recommended Existing Detections (SigmaHQ + Elastic)

| Priority | TTP | MITRE ID | Source Repo | Rule Path | Rule Type | Port To | Adaptation Effort | Notes |
|----------|-----|----------|-------------|-----------|-----------|---------|-------------------|-------|
| CRITICAL | LSASS Dump | T1003.001 | SigmaHQ | rules/windows/credential_access/proc_creation_win_lsass_dump_generic.yml | behavioral | KQL (Defender XDR) | Medium — Sigma uses Sysmon EID 10; adapt to DeviceProcessEvents/DeviceEvents | Multiple variants available; pick behavioral over IOC |
| CRITICAL | LSASS Dump | T1003.001 | Elastic | rules/windows/credential_access_credential_dumping_lsass_memory_access.toml | behavioral | KQL (Defender XDR) | Medium — EQL query; translate filter logic to KQL | Elastic rule is EQL sequence; needs KQL join/sequence equivalent |
| CRITICAL | Consent Grant Abuse | T1098.003 | SigmaHQ | rules/cloud/azure/azure_add_app_role_assignment.yml | behavioral | KQL (Sentinel) | Low — direct mapping to AuditLogs OperationName | Sigma rule uses Azure audit log; Sentinel AuditLogs has same OperationName |
| CRITICAL | Data Encrypted for Impact | T1486 | SigmaHQ | rules/windows/builtin/security/win_alert_ransomware.yml | behavioral | KQL (Defender XDR) | Medium — Sigma uses WinEvent 4663/4656; adapt to DeviceEvents | Ransomware-specific; combine with file extension monitoring |
| CRITICAL | Data Encrypted for Impact | T1486 | Elastic | rules/windows/impact_windows_ransomware_activity.toml | behavioral | KQL (Defender XDR) | Medium — Elastic uses EQL; translate to KQL | Includes file rename/extension pattern detection |
| HIGH | Inhibit System Recovery | T1490 | SigmaHQ | rules/windows/process_creation/proc_creation_win_susp_vssadmin_delete_shadows.yml | behavioral | KQL (Defender XDR) | Low — direct process command-line match | vssadmin delete shadows / wbadmin delete catalog |
| HIGH | Inhibit System Recovery | T1490 | Elastic | rules/windows/impact_vssadmin_delete_shadows.toml | behavioral | KQL (Defender XDR) | Low — direct match | Elastic rule is simpler; Sigma rule has more variants |
| HIGH | Valid Accounts (cloud sign-in) | T1078.004 | SigmaHQ | rules/cloud/azure/azure_signin_susp_signin_location.yml | behavioral | KQL (Sentinel) | Low — map to SigninLogs | Sigma uses Azure signin log; Sentinel SigninLogs is equivalent |
| MEDIUM | Phishing link | T1566.002 | SigmaHQ | rules/windows/builtin/security/win_susp_spearphishing.yml | indicator | KQL (Defender XDR) | High — Sigma uses EID 4624/4625; Defender has EmailEvents | Reference only — use EmailEvents, not Security Event |
| HIGH | FortiOS exploitation | T1190 | SigmaHQ | rules-emerging-threats/2026/Exploits/CVE-2023-27997/ | indicator | KQL (Defender XDR) | Reference only — network-level; use DeviceNetworkEvents | CVE-specific Sigma rules; IOC sweep for known exploit signatures |

### Recommended Detections to Build (ordered)

For TTPs with no existing community coverage or where existing rules need significant adaptation:

1. **[CRITICAL] FortiOS CVE-2023-27997 exploitation detection (T1190)** — No existing Sigma/Elastic rule for this specific CVE on the endpoint side. Build a Defender XDR detection: `DeviceNetworkEvents` for connections to the FortiOS appliance followed by suspicious process creation on the appliance (if EDR covers it), or network-level detection via Sentinel `CommonSecurityLog` for FortiOS exploit signatures. Abstraction layer: procedure (FortiOS-specific exploit pattern).

2. **[CRITICAL] O365 consent grant abuse — new app registration with admin consent (T1098.003)** — Sigma rule exists but is generic. Build a Sentinel detection: `AuditLogs` where `OperationName == "Consent to application"` and `ActionIntValue` has admin-level scope (`RoleManagement.ReadWrite.Directory`, `Mail.Read`, `Files.Read.All`), correlated with first-seen app registration. Abstraction layer: function (OAuth consent grant operation).

3. **[HIGH] Backup deletion via wbadmin/vssadmin (T1490)** — Sigma and Elastic rules exist but are simple process-name matches. Build a Defender XDR detection: `DeviceProcessEvents` where `FileName in~ ("vssadmin.exe", "wbadmin.exe", "bcdedit.exe")` and `ProcessCommandLine has "delete"` or `has "recoveryenabled"`. Abstraction layer: technique (backup deletion behavior regardless of tool).

### Gaps & Unknowns

#### OSINT Limitations
- **Shodan access:** Full Shodan results require a paid account; only summary data accessible via free webfetch. Recommend operator run full Shodan queries with API access.
- **Leaked credentials:** Could not query DeHashed (requires account). HaveIBeenPwned only confirms breach membership, not specific credentials. Recommend operator run full Hudson Rock / DeHashed queries.
- **Internal infrastructure:** OSINT only covers public-facing infrastructure. Internal AD, GPOs, EDR configuration, existing detections — unknown. Recommend operator provide internal context for a complete picture.

#### Threat Actor Uncertainty
- **FIN7 recent activity:** Could not verify via live sources whether FIN7 is actively campaigning in 2026. Training-data knowledge suggests recent activity but unverified. Set recency weight to 0.3 (historically active).
- **Scattered Spider current targets:** Scattered Spider is a loosely-affiliated group; individual members are arrested but the group persists. Current targeting profile is based on MSTIC report from 2026-06, but activity level may have changed.

#### What Needs Internal Context
- **Existing detection coverage:** The prioritized TTP list assumes no existing detections. If the customer already has detections for T1003.001, T1490, etc., those drop in priority. Recommend operator provide existing detection inventory for accurate prioritization.
- **Crown jewel mapping:** Crown-jewel adjacency scoring assumed domain admin, production databases, and source code as crown jewels. If the customer has different crown jewels (e.g., OT/ICS, patient data), the scoring changes.
- **Asset inventory:** The OSINT findings are based on public exposure. Internal assets not exposed to the internet are invisible to this report. Recommend operator provide asset inventory for complete attack-surface mapping.
```

---

## Section Rules

### Customer Profile
- State every field. If unknown, say "unknown" and flag in Gaps & Unknowns.
- Tech stack drives threat actor matching — be specific (O365 vs on-prem Exchange changes the threat profile significantly).
- Public exposure summary is 1-2 sentences — the detailed findings go in the next section.

### Public Attack Surface Findings
- Every finding cites a source URL and access date.
- Risk level is contextual to the customer's industry (exposed RDP is CRITICAL for a hospital, MEDIUM for a marketing firm).
- Distinguish confirmed (multi-source) from likely (single-source, needs verification).
- If no findings: state "No public exposure findings" and explain what was checked.

### Matched Threat Actors
- Relevance score is a 0.0–1.0 float, not a band.
- "Why matched" must reference specific customer attributes (industry, tech stack, exposure), not just "targets this industry."
- Include actors that don't match well (low score) and explain why — this shows thoroughness and helps the operator understand what was considered and rejected.

### Current Threat Landscape
- Must be based on live source verification, not training data alone.
- If a source was inaccessible, note it.
- Recency is the key differentiator — weight active campaigns over historical activity.

### Prioritized TTP List
- Every TTP has a score and a priority band (CRITICAL/HIGH/MEDIUM/LOW).
- Ordered by score, highest first.
- MITRE ID is the tightest sub-technique (T1003.001, not T1003).
- Suggested abstraction layer aligns with the detection_engineer's capability-abstraction pyramid (tool/procedure/technique/function).
- Recommended engine is Sentinel or Defender XDR, with reasoning.

### Recommended Existing Detections
- Every prioritized TTP gets a lookup. If no rule found, state "No existing community rule found" in the row.
- Rule path is the exact file path in the repo (so the detection_engineer can webfetch the raw rule).
- Adaptation effort: Low (direct mapping), Medium (schema/log source translation), High (significant query rewrite), Reference only (can't port, use as inspiration).
- Include both SigmaHQ and Elastic results if both have relevant rules.

### Recommended Detections to Build
- Only for TTPs with no existing community coverage or where existing rules need significant adaptation.
- Each entry: priority, TTP, MITRE ID, rationale, suggested data source, abstraction layer.
- This is input to the detection_engineer — they will produce the actual YAML rules.

### Gaps & Unknowns
- Be honest about what OSINT couldn't determine.
- Be honest about what threat actor activity couldn't be verified.
- List what internal context would improve the report (asset inventory, existing detections, crown jewel mapping).
- This is not a weakness — it's intellectual honesty that makes the report trustworthy.