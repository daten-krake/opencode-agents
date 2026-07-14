# Detection Rule Repositories — SigmaHQ + Elastic

Reference guide for searching existing detection rules in the two primary community repositories. The CTI agent uses this during the "Existing detection lookup" step to find rules the detection_engineer can port or adapt.

---

## SigmaHQ (github.com/SigmaHQ/sigma)

**What:** 3000+ detection rules in Sigma YAML format. Generic, vendor-agnostic, MITRE ATT&CK tagged. Convertible to KQL, Splunk SPL, EQL, and 25+ other SIEM/EDR query languages via sigma-cli or sigconverter.io.

**License:** Detection Rule License (DRL) 1.1 — free to use, modify, and distribute with attribution.

**Repo:** https://github.com/SigmaHQ/sigma

### Directory Structure

```
sigma/
├── rules/                          # Generic, threat-agnostic detections (behavioral)
│   ├── application/                # Application-specific (Citrix, Exchange, etc.)
│   ├── category/                   # Category-based (firewall, antivirus, etc.)
│   ├── cloud/                      # Cloud platform rules
│   │   ├── azure/                  # Azure / Entra ID detections
│   │   ├── aws/                    # AWS detections
│   │   ├── gcp/                    # GCP detections
│   │   └── m365/                   # Microsoft 365 detections
│   ├── identity/                   # Identity provider rules (Okta, Auth0, etc.)
│   ├── linux/                      # Linux OS rules
│   ├── macos/                      # macOS OS rules
│   ├── network/                   # Network device rules (firewall, IPS, etc.)
│   ├── web/                        # Web server / web app rules
│   └── windows/                   # Windows OS rules
│       ├── builtin/               # Windows built-in event sources
│       │   ├── security/          # Security Event log (EID 4624, 4688, etc.)
│       │   ├── system/             # System Event log
│       │   ├── powershell/         # PowerShell operational log
│       │   └── sysmon/             # Sysmon event sources
│       ├── process_creation/       # Process creation (EID 4688 / Sysmon EID 1)
│       ├── file_event/             # File events (Sysmon EID 11)
│       ├── registry_event/         # Registry events (Sysmon EID 12/13/14)
│       ├── network_connection/     # Network connections (Sysmon EID 3)
│       ├── dns_query/              # DNS queries (Sysmon EID 22)
│       ├── driver_load/            # Driver loads (Sysmon EID 6)
│       ├── image_load/             # Image loads (Sysmon EID 7)
│       └── wmi/                    # WMI events
├── rules-emerging-threats/         # Threat-specific (APTs, malware, CVEs) — gold for CTI
│   ├── 2026/
│   │   ├── Exploits/               # CVE-specific rules (CVE-2023-4966, etc.)
│   │   │   └── CVE-2023-27997/     # Per-CVE folders
│   │   ├── Malware/                # Malware-family-specific rules
│   │   │   └── LockBit/
│   │   └── TA/                     # Threat-actor-specific rules — KEY FOR CTI
│   │       └── TeamPCP/             # Per-actor folders
│   ├── 2025/
│   ├── 2024/
│   └── ... (back to 2010)
├── rules-threat-hunting/           # Broader hunting queries (not alerts)
├── rules-compliance/               # Compliance rules (CIS, NIST, ISO 27001)
├── rules-placeholder/              # Placeholder rules (resolved at conversion time)
└── rules-dfir/                     # DFIR-focused rules
```

### Sigma Rule Format (YAML)

```yaml
title: LSASS Memory Dump Creation
id: 12345678-1234-1234-1234-123456789012
status: stable
description: Detects creation of LSASS memory dump files
references:
    - https://attack.mitre.org/techniques/T1003/001/
author: Florian Roth
date: 2026/01/15
modified: 2026/06/20
tags:
    - attack.credential_access
    - attack.t1003.001
logsource:
    product: windows
    category: file_event
detection:
    selection:
        TargetFilename|contains:
            - lsass.dmp
            - lsass_dump
            - lsass.dmp
    condition: selection
falsepositives:
    - Legitimate administrative tools (procdump with -ma)
level: high
```

**Key fields for port evaluation:**
- `logsource.product` — what platform (windows, linux, macos, azure, aws, etc.)
- `logsource.category` — what event type (process_creation, file_event, network_connection, etc.) — this maps to the SIEM/EDR data source
- `detection` — the actual query logic (selection/condition pattern)
- `tags` — MITRE ATT&CK tags (`attack.t1003.001`)
- `falsepositives` — known FP scenarios (use for the detection_engineer's `false_positives` field)
- `level` — Sigma severity (informational/low/medium/high/critical)

### How to Search SigmaHQ

**By MITRE technique ID:**
- GitHub code search: webfetch `https://github.com/search?q=repo%3ASigmaHQ%2Fsigma+attack.t1003.001&type=code`
- Or browse: webfetch `https://github.com/SigmaHQ/sigma/search?q=attack.t1003.001`
- This finds all Sigma rules tagged with that technique

**By threat actor name:**
- Browse the `rules-emerging-threats/<year>/TA/` folder
- webfetch `https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/TA` to see actor folders for the current year
- Actor folder names use various conventions (e.g., `TeamPCP`, `APT29`, `Lazarus`)

**By malware family:**
- Browse `rules-emerging-threats/<year>/Malware/`
- webfetch `https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/Malware` for current year

**By CVE:**
- Browse `rules-emerging-threats/<year>/Exploits/`
- webfetch `https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/Exploits` for current year

**By platform (Windows/Linux/macOS/Cloud):**
- Browse `rules/windows/`, `rules/linux/`, `rules/cloud/azure/`, etc.
- webfetch `https://github.com/SigmaHQ/sigma/tree/master/rules/windows` for Windows rules

**By keyword:**
- GitHub code search: webfetch `https://github.com/search?q=repo%3ASigmaHQ%2Fsigma+lsass&type=code`

**Phoenix (Sigma rule search platform):**
- URL: https://sigma.nasbench.dev/
- Search Sigma rules mapped to MITRE ATT&CK
- Useful for finding rules by technique ID or actor across the entire repo

### Reading a Sigma Rule (raw file)

To read the raw YAML of a Sigma rule:
- Raw GitHub URL pattern: `https://raw.githubusercontent.com/SigmaHQ/sigma/master/<path-to-rule.yml>`
- Example: `https://raw.githubusercontent.com/SigmaHQ/sigma/master/rules/windows/process_creation/proc_creation_win_susp_vssadmin_delete_shadows.yml`
- webfetch this URL to read the rule content

### Sigma → KQL Conversion

**Sigma CLI (command-line, not via webfetch):**
- Repo: https://github.com/SigmaHQ/sigma-cli
- Install: `pip install sigma-cli`
- Convert: `sigma convert -t kibana-qb rule.yml` (or `-t sentinel`, `-t splunk`, `-t elastic-eql`)
- The CTI agent cannot run this — mention it as a tool for the operator/detection_engineer to use.

**sigconverter.io (web-based):**
- URL: https://sigconverter.io
- Paste a Sigma rule, select target format (KQL, Splunk, EQL, etc.)
- The CTI agent can webfetch sigconverter.io but it's a POST-based service — better to recommend the detection_engineer use it directly.

**Manual port guidance (what to put in the report):**
- Sigma `logsource: product: windows, category: process_creation` → Defender XDR `DeviceProcessEvents`
- Sigma `logsource: product: windows, category: file_event` → Defender XDR `DeviceFileEvents`
- Sigma `logsource: product: windows, category: network_connection` → Defender XDR `DeviceNetworkEvents`
- Sigma `logsource: product: windows, category: registry_event` → Defender XDR `DeviceRegistryEvents`
- Sigma `logsource: product: windows, category: image_load` → Defender XDR `DeviceImageLoadEvents`
- Sigma `logsource: product: windows, category: dns_query` → Defender XDR `DeviceNetworkEvents` (RemoteUrl contains DNS)
- Sigma `logsource: product: azure, category: audit` → Sentinel `AuditLogs`
- Sigma `logsource: product: azure, category: signin` → Sentinel `SigninLogs`

---

## Elastic Detection Rules (github.com/elastic/detection-rules)

**What:** Detection rules for Elastic Security in TOML format. MITRE ATT&CK tagged. Includes behavioral detections, ML rules, threat intel indicator matching, and building block rules.

**License:** Elastic License v2 — free to use within Elastic Security; check license terms for porting to non-Elastic platforms.

**Repo:** https://github.com/elastic/detection-rules

### Directory Structure

```
detection-rules/
├── rules/                           # Main detection rules
│   ├── windows/                     # Windows OS rules
│   ├── linux/                       # Linux OS rules
│   ├── macos/                       # macOS OS rules
│   ├── cross-platform/              # Multi-OS rules
│   ├── integrations/                # Integration-specific rules
│   │   ├── aws/                     # AWS rules
│   │   ├── azure/                   # Azure / Entra ID rules
│   │   ├── gcp/                     # GCP rules
│   │   ├── o365/                    # Microsoft 365 rules
│   │   ├── google_workspace/        # Google Workspace rules
│   │   ├── okta/                    # Okta rules
│   │   ├── endpoint/                # Elastic Endpoint Security rules
│   │   └── cyberarkpas/             # CyberArk PAS rules
│   ├── network/                     # Network data source rules
│   ├── ml/                          # Machine learning-based rules
│   ├── threat_intel/                # Threat intel indicator matching rules
│   │   ├── threat_intel_indicator_match_address.toml
│   │   ├── threat_intel_indicator_match_email.toml
│   │   ├── threat_intel_indicator_match_hash.toml
│   │   ├── threat_intel_indicator_match_registry.toml
│   │   ├── threat_intel_indicator_match_url.toml
│   │   └── threat_intel_rapid7_threat_command.toml
│   ├── promotions/                  # Rules promoting external alerts
│   └── _deprecated/                 # Deprecated rules
├── rules_building_block/            # Building block rules (composable)
├── hunting/                         # Threat hunting queries
├── detection_rules/                 # Python module for rule parsing/validation
├── PHILOSOPHY.md                    # Rule development philosophy (read this)
└── CLI.md                           # CLI guide for the Python tooling
```

### Elastic Rule Format (TOML)

```toml
[metadata]
creation_date = "2026/01/15"
maturity = "production"
updated_date = "2026/06/20"
min_stack_comments = "New rule"
min_stack_version = "8.5.0"

[rule]
author = ["Elastic"]
description = """
Detects the creation of an LSASS memory dump file, which may indicate
credential dumping activity.
"""
false_positives = [
    "Legitimate administrative tools creating LSASS dumps for troubleshooting",
]
from = "now-9m"
index = ["winlogbeat-*", "logs-windows.*"]
language = "kuery"
license = "Elastic License v2"
name = "Credential Dumping via LSASS Memory"
note = """Investigation guide for LSASS memory dump detection..."""
references = [
    "https://attack.mitre.org/techniques/T1003/001/",
]
risk_score = 73
rule_id = "12345678-1234-1234-1234-123456789012"
severity = "high"
tags = ["Domain: Endpoint", "OS: Windows", "Tactic: Credential Access", "Technique: T1003.001"]
threat = [
    [[tactic]]
    id = "TA0006"
    name = "Credential Access"
    reference = "https://attack.mitre.org/tactics/TA0006/"
    [[technique]]
    id = "T1003.001"
    name = "LSASS Memory"
    reference = "https://attack.mitre.org/techniques/T1003/001/"
]
type = "query"

query = '''
event.action:"File Create" and file.name:(*lsass* or *.dmp) and process.name:(procdump.exe or taskmgr.exe)
'''
```

**Key fields for port evaluation:**
- `[rule].language` — `kuery` (KQL — Elastic's Kibana Query Language, different from Microsoft KQL), `eql` (Event Query Language), `lucene`, or `sql`
- `[rule].index` — what Elasticsearch index the rule queries (`winlogbeat-*`, `logs-windows.*`, `logs-azure.*`, etc.)
- `[rule].query` — the actual query
- `[rule].threat` — MITRE ATT&CK mapping (tactic + technique)
- `[rule].false_positives` — known FP scenarios
- `[rule].severity` / `[rule].risk_score` — severity and risk
- `[metadata].maturity` — `production`, `development`, `experimental`

### How to Search Elastic Detection Rules

**By MITRE technique ID:**
- GitHub code search: webfetch `https://github.com/search?q=repo%3Aelastic%2Fdetection-rules+T1003.001&type=code`
- Or browse: webfetch `https://github.com/elastic/detection-rules/search?q=T1003.001`

**By platform:**
- Browse `rules/windows/`, `rules/integrations/azure/`, `rules/integrations/o365/`, etc.
- webfetch `https://github.com/elastic/detection-rules/tree/main/rules/windows`

**By keyword:**
- GitHub code search: webfetch `https://github.com/search?q=repo%3Aelastic%2Fdetection-rules+lsass&type=code`

**By threat intel:**
- Browse `rules/threat_intel/` — indicator matching rules (hash, IP, domain, URL, email, registry)
- webfetch `https://github.com/elastic/detection-rules/tree/main/rules/threat_intel`

**By ML:**
- Browse `rules/ml/` — ML-based anomaly detection rules

**By hunting:**
- Browse `hunting/` — threat hunting queries (not alerts, but investigation starting points)

### Reading an Elastic Rule (raw file)

To read the raw TOML of an Elastic rule:
- Raw GitHub URL pattern: `https://raw.githubusercontent.com/elastic/detection-rules/main/<path-to-rule.toml>`
- Example: `https://raw.githubusercontent.com/elastic/detection-rules/main/rules/windows/credential_dumping_via_lsass_memory.toml`
- webfetch this URL to read the rule content

### Elastic → Microsoft KQL Conversion

**Elastic Kuery (Kibana Query Language) ≠ Microsoft KQL.** They are different languages despite similar names.

**Elastic EQL ≠ Microsoft KQL.** EQL is event-sequence-oriented; Microsoft KQL is pipeline-oriented.

**Manual port guidance (what to put in the report):**

| Elastic Query Element | Microsoft KQL Equivalent |
|----------------------|--------------------------|
| `event.action:"File Create"` | `ActionType == "FileCreated"` (DeviceFileEvents) |
| `file.name:(*lsass* or *.dmp)` | `FileName contains "lsass" or FileName endswith ".dmp"` |
| `process.name:(procdump.exe or taskmgr.exe)` | `InitiatingProcessFileName in~ ("procdump.exe", "taskmgr.exe")` |
| `index = ["winlogbeat-*", "logs-windows.*"]` | Defender XDR: `DeviceProcessEvents`, `DeviceFileEvents`; Sentinel: `SecurityEvent`, `WindowsEvent` |
| `from = "now-9m"` | `query_period = PT9M` (Sentinel) |
| EQL `sequence` / `join` | KQL `join kind=inner` or `serialize` + temporal logic |
| EQL `where` / `filter` | KQL `where` / `filter` |

**Elastic index → Microsoft table mapping:**
- `winlogbeat-*` / `logs-windows.*` → Defender XDR `DeviceProcessEvents`, `DeviceFileEvents`, `DeviceNetworkEvents`, etc. (endpoint) or Sentinel `SecurityEvent`, `WindowsEvent` (if Sysmon/WinEvent forwarded)
- `logs-azure.*` / `logs-azure.auditlogs-*` → Sentinel `AuditLogs`
- `logs-azure.signinlogs-*` → Sentinel `SigninLogs`
- `logs-o365.*` → Sentinel `OfficeActivity` or Defender XDR `CloudAppEvents`
- `logs-aws.*` → Sentinel `AWSCloudTrail` (via AWS connector)
- `logs-google_workspace.*` → Sentinel `GWorkspaceActivityAdmin` (via GWorkspace connector)

---

## Lookup Workflow (per TTP)

For each prioritized TTP, follow this workflow:

### Step 1: Search SigmaHQ by MITRE technique ID

webfetch GitHub code search:
```
https://github.com/search?q=repo%3ASigmaHQ%2Fsigma+attack.t1003.001&type=code
```

Or browse the technique-tagged rules. Note the rule paths and types.

### Step 2: Search Elastic by MITRE technique ID

webfetch GitHub code search:
```
https://github.com/search?q=repo%3Aelastic%2Fdetection-rules+T1003.001&type=code
```

### Step 3: Check for threat-actor-specific Sigma rules

If a matched threat actor is identified (e.g., APT29), check for actor-specific rules:
```
https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/TA
```

Look for the actor's folder (note: folder names vary — may use the group name, alias, or UNC designation).

### Step 4: Check for malware-specific Sigma rules

If the threat actor uses known malware (e.g., LockBit ransomware), check:
```
https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/Malware
```

### Step 5: Check for CVE-specific Sigma rules

If the TTP involves exploitation of a known CVE (e.g., CVE-2023-27997), check:
```
https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats/2026/Exploits
```

### Step 6: Read the most promising rules

For each rule found, webfetch the raw file to read the full content:
```
https://raw.githubusercontent.com/SigmaHQ/sigma/master/<path-to-rule.yml>
https://raw.githubusercontent.com/elastic/detection-rules/main/<path-to-rule.toml>
```

### Step 7: Evaluate portability

For each rule, determine:
- **Rule type:** behavioral (port-worthy) or indicator (IOC sweep, reference only)
- **Log source:** what does the rule assume? (Sysmon EID, WinEvent, Azure audit, etc.)
- **Port target:** Sentinel KQL or Defender XDR KQL — based on the log source and the customer's platform
- **Adaptation effort:** Low (direct mapping), Medium (schema/log source translation), High (significant query rewrite), Reference only (can't port, use as inspiration)
- **Notes:** what specifically needs to change (log source mapping, query language translation, FP considerations)

### Step 8: Include in the report

Add each found rule to the "Recommended Existing Detections" table with all fields filled.

If no rule is found for a TTP, state "No existing community rule found" and recommend the detection_engineer build from scratch (goes in "Recommended Detections to Build").

---

## Evaluation Rules

### Behavioral vs Indicator

- **Behavioral rules** (port-worthy): detect a technique or procedure regardless of specific tool/IOC. Examples: "process accessing LSASS memory", "bulk file modification with encryption patterns", "OAuth app consent grant with admin scopes". These align with the detection_engineer's capability-abstraction pyramid at the technique/procedure layer. Port these.

- **Indicator rules** (IOC sweep, reference only): detect specific hashes, IPs, domains, known-bad strings. Examples: "known LockBit hash", "APT29 C2 domain". These are at the tool/IOC layer of the pyramid (brittle). Include as IOC sweep detections but recommend the detection_engineer also write a behavioral version.

### Log Source Mapping

Sigma and Elastic rules assume specific log sources. Map these to the customer's platform:

| Sigma logsource | Elastic index | Defender XDR table | Sentinel table |
|----------------|---------------|--------------------|-----------------| 
| `product: windows, category: process_creation` | `winlogbeat-*`, `logs-windows.*` | `DeviceProcessEvents` | `SecurityEvent` (EID 4688) or `WindowsEvent` |
| `product: windows, category: file_event` | `winlogbeat-*`, `logs-windows.*` | `DeviceFileEvents` | `SecurityEvent` (EID 4663) or Sysmon EID 11 |
| `product: windows, category: network_connection` | `winlogbeat-*`, `logs-windows.*` | `DeviceNetworkEvents` | `SecurityEvent` (EID 5156) or Sysmon EID 3 |
| `product: windows, category: registry_event` | `winlogbeat-*`, `logs-windows.*` | `DeviceRegistryEvents` | `SecurityEvent` (EID 4657) or Sysmon EID 12/13/14 |
| `product: windows, category: image_load` | `winlogbeat-*`, `logs-windows.*` | `DeviceImageLoadEvents` | Sysmon EID 7 |
| `product: windows, category: dns_query` | `winlogbeat-*`, `logs-windows.*` | `DeviceNetworkEvents` (RemoteUrl) | Sysmon EID 22 |
| `product: windows, category: pipe_created` | `winlogbeat-*`, `logs-windows.*` | `DeviceEvents` (Named pipe events) | Sysmon EID 17/18 |
| `product: azure, category: audit` | `logs-azure.auditlogs-*` | `CloudAppEvents` (limited) | `AuditLogs` |
| `product: azure, category: signin` | `logs-azure.signinlogs-*` | `AADSignInEventsBeta` | `SigninLogs` |
| `product: azure, category: activedirectory` | `logs-azure.activedirectory-*` | `CloudAppEvents` | `AuditLogs` (Entra ID) |
| `product: o365, category: audit` | `logs-o365.*` | `CloudAppEvents` | `OfficeActivity` |
| `product: aws` | `logs-aws.*` | N/A (use Sentinel) | `AWSCloudTrail` |
| `product: gcp` | `logs-gcp.*` | N/A | `GCPAuditLogs` |
| `product: okta` | `logs-okta.*` | N/A | `Okta_CL` |
| `product: google_workspace` | `logs-google_workspace.*` | N/A | `GWorkspaceActivityAdmin` |

### Adaptation Effort Assessment

- **Low** — Direct mapping. The rule's log source maps cleanly to a Defender XDR or Sentinel table, and the query logic (field names, operators) translates directly. Example: Sigma rule filtering on `CommandLine|contains: "vssadmin delete shadows"` → Defender XDR `DeviceProcessEvents | where ProcessCommandLine contains "vssadmin delete shadows"`.

- **Medium** — Schema/log source translation required. The rule's log source doesn't map directly (e.g., Sigma uses Sysmon EID 10 for LSASS access; Defender XDR uses `DeviceEvents` with `ActionType == "ProcessAccessEvent"`). Query logic needs field-name translation. Example: Sigma `SourceImage|endswith: "lsass.exe"` → Defender XDR `InitiatingProcessFileName == "lsass.exe"` but the event type is different.

- **High** — Significant query rewrite. The rule uses a query language feature that doesn't exist in KQL (EQL sequences, Elastic aggregations, Sigma modifiers). The logic needs to be re-expressed in KQL's pipeline model. Example: Elastic EQL `sequence [file where ...] [process where ...]` → KQL `join kind=inner` with temporal `where Timestamp between (...)`.

- **Reference only** — Can't port directly. The rule assumes a log source the customer doesn't have (e.g., Sigma rule using Sysmon when the customer only has Defender XDR), or the rule is an IOC sweep that's too brittle to be worth porting. Include as inspiration for the detection_engineer but don't recommend direct porting.

---

## Cross-Reference Notes

- **SigmaHQ and Elastic overlap:** Many techniques have rules in both repos. Include both in the report — the detection_engineer can choose which to port based on the query quality and adaptation effort.
- **SigmaHQ is broader:** 3000+ rules vs Elastic's ~1000+. SigmaHQ covers more techniques but quality varies. Elastic rules are more curated but Elastic-specific.
- **Elastic PHILOSOPHY.md** is worth reading (https://github.com/elastic/detection-rules/blob/main/PHILOSOPHY.md) — it documents their approach to detection engineering, which aligns with the detection_engineer's capability-abstraction methodology.
- **SigmaHQ rules-emerging-threats is the CTI gold mine:** Actor-specific rules in `TA/` folders and CVE-specific rules in `Exploits/` folders are directly relevant to the Threat Prioritization Report. Always check the current year's folder during report generation.