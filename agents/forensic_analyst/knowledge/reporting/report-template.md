# Forensic Report Template

Reference schema for the YAML forensic report. Every field defined with purpose and example.

## Schema definitions

### Case metadata
```yaml
case:
  case_id: "CASE-2026-0512-001"        # Unique identifier, format: CASE-YYYY-MMDD-NNN
  analyst: "forensic_analyst"          # Name or identifier of the analyst
  start_date: "2026-05-12T14:00:00Z"  # Investigation start, ISO 8601 UTC
  end_date: "2026-05-13T17:30:00Z"    # Investigation end or "in_progress"
  classification: "Confidential"      # Classification level
  summary: ""                          # 2-3 sentence case summary
```

### Evidence sources
Each piece of evidence gets an entry:
```yaml
evidence_sources:
  - source_id: "SRC-001"
    type: disk_image                    # disk_image|memory_dump|pcap|log_set|live_system|removable_media|email_export|cloud_export
    description: "Forensic image of suspect laptop internal SSD, 512GB Samsung EVO"
    acquisition_method: "dc3dd v7.3.1 if=/dev/sdb of=image.dd hash=sha256 hash=md5 log=acq.log, Tableau T8u hardware write-blocker S/N TB-12345"
    hash_md5: "d41d8cd98f00b204e9800998ecf8427e"
    hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    hash_sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
    acquired_by: "forensic_analyst"
    acquired_date: "2026-05-12T14:30:00Z"
    file_size_bytes: 512110190592
    chain_of_custody:
      - timestamp: "2026-05-12T14:30:00Z"
        action: "acquired"
        operator: "forensic_analyst"
        hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        notes: "Acquisition via dc3dd, verified with sha256deep"
      - timestamp: "2026-05-12T14:35:00Z"
        action: "verified"
        operator: "forensic_analyst"
        hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        notes: "Hash matches acquisition hash"
```

### Tools used
```yaml
tools_used:
  - name: "dc3dd 7.3.1"
    operations:
      - "Imaged SRC-001 from /dev/sdb"
    output_file: "acq.log"
  - name: "volatility3 2.7.0"
    operations:
      - "Process tree analysis"
      - "Malfind scan for injected code"
      - "Netscan for network connections"
    output_file: "memory/volatility-output/"
```

### Findings
Each finding maps to MITRE and includes IOCs:
```yaml
findings:
  - finding_id: "F-001"
    severity: Critical              # Critical|High|Medium|Low|Informational
    status: Confirmed               # Confirmed|Probable|Possible
    category: persistence           # initial_access|execution|persistence|privilege_escalation|defense_evasion|credential_access|discovery|lateral_movement|collection|c2|exfiltration|impact|malware_presence|data_theft|policy_violation|anomaly
    artifact_source: "SRC-001"
    artifact_path: "NTUSER.DAT\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater"
    description: "Attacker established persistence via Registry Run key, launching a malicious binary at every user logon."
    technical_detail: "Key: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run. Value name: 'Updater'. Value: 'C:\\Users\\victim\\AppData\\Local\\Temp\\svchost.exe'. The binary (SHA-256: abc123...) is a Cobalt Strike beacon configured to connect to 203.0.113.100:443."
    timestamp_first_seen: "2026-05-10T03:22:15Z"
    timestamp_last_seen: "2026-05-12T07:45:00Z"  # or null if still active
    mitre_tactic: "Persistence"
    mitre_technique: "T1547.001"    # Registry Run Keys / Startup Folder
    iocs:
      - type: hash
        value: "abc123def456..."
        context: "SHA-256 of Cobalt Strike beacon dropped to Temp"
      - type: ip
        value: "203.0.113.100"
        context: "C2 server IP configured in beacon"
      - type: registry_key
        value: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater"
        context: "Persistence mechanism"
      - type: file_path
        value: "C:\\Users\\victim\\AppData\\Local\\Temp\\svchost.exe"
        context: "Malicious binary masquerading as legitimate svchost"
    tool_chain:
      - "RegRipper runkeys plugin on NTUSER.DAT"
      - "strings on svchost.exe (extracted via icat)"
      - "floss on svchost.exe for C2 config extraction"
    evidence_screenshot: ""          # optional path to screenshot
    tags:
      - stage:behavioral
      - abstraction:procedure

  - finding_id: "F-002"
    severity: High
    status: Probable
    category: lateral_movement
    artifact_source: "SRC-001"
    artifact_path: "Security.evtx Event ID 4624 Logon Type 3 from 192.168.1.50 to DC01"
    description: "Attacker likely moved laterally from workstation WS-01 (192.168.1.50) to domain controller DC01 using stolen credentials."
    technical_detail: "Security log on DC01 shows Event 4624 at 2026-05-12T05:30:00Z: Account DOMAIN\\svc_backup logged on via Network (Type 3) from source IP 192.168.1.50. This account was not previously associated with WS-01. WS-01 was also compromised (see F-001)."
    timestamp_first_seen: "2026-05-12T05:30:00Z"
    timestamp_last_seen: null
    mitre_tactic: "Lateral Movement"
    mitre_technique: "T1021.002"    # Remote Services: SMB/Windows Admin Shares (most likely)
    iocs:
      - type: ip
        value: "192.168.1.50"
        context: "Source of lateral movement — known compromised workstation"
    tool_chain:
      - "EvtxECmd parsing Security.evtx from DC01"
      - "Cross-reference with WS-01 investigation (case CASE-2026-0511-003)"
    tags:
      - stage:behavioral
      - abstraction:technique
```

### Timeline
Chronological events extracted from all sources:
```yaml
timeline:
  - event_id: "T-001"
    timestamp: "2026-05-10T03:20:00Z"
    source: "SRC-001"
    source_detail: "$MFT entry 45823"
    event_type: file_created
    description: "Malicious binary svchost.exe written to C:\\Users\\victim\\AppData\\Local\\Temp\\"
    artifact: "C:\\Users\\victim\\AppData\\Local\\Temp\\svchost.exe"
    user: "DOMAIN\\victim"
    host: "WS-01"
    mitre_technique: "T1105"          # Ingress Tool Transfer
    related_finding: "F-001"
    
  - event_id: "T-002"
    timestamp: "2026-05-10T03:22:15Z"
    source: "SRC-001"
    source_detail: "NTUSER.DAT Registry LastWrite time"
    event_type: registry_write
    description: "Run key set for persistence"
    artifact: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater"
    user: "DOMAIN\\victim"
    host: "WS-01"
    mitre_technique: "T1547.001"
    related_finding: "F-001"
```

### IOC table (summary for export)
```yaml
ioc_summary:
  - ioc_id: "IOC-001"
    type: hash
    value: "abc123def456..."
    context: "Cobalt Strike beacon (SHA-256)"
    findings: ["F-001"]
    first_seen: "2026-05-10T03:20:00Z"
    
  - ioc_id: "IOC-002"
    type: ip
    value: "203.0.113.100"
    context: "C2 server"
    findings: ["F-001"]
    first_seen: "2026-05-10T03:22:15Z"
```

### Containment recommendations
```yaml
containment_recommendations:
  - recommendation_id: "R-001"
    priority: 1                       # 1 = do first, 2 = next, etc.
    action: "Isolate WS-01 from the network immediately. Block at switch port or disable NIC."
    rationale: "WS-01 hosts active C2 beacon and may be used for further lateral movement."
    finding_reference: "F-001"
    impact: "User will lose network access. Coordinate with business owner."
    
  - recommendation_id: "R-002"
    priority: 2
    action: "Reset passwords for all accounts that authenticated to WS-01 between 2026-05-10 and present. Force password change for DOMAIN\\victim."
    rationale: "Credentials may have been harvested from this system. See F-001 for beacon capability."
    finding_reference: "F-001"

  - recommendation_id: "R-003"
    priority: 3
    action: "Block outbound traffic to 203.0.113.100:443 at perimeter firewall."
    rationale: "Known C2 destination. Prevent beacon communication and potential data exfiltration."
    finding_reference: "F-001"
    ioc: "IOC-002"
```

### Unanswered questions
```yaml
unanswered_questions:
  - "How did the attacker initially compromise WS-01? Phishing email, drive-by download, or exploitation of a vulnerable service? The initial access vector was not evident from disk forensics alone."
  - "Was data exfiltrated from WS-01? The C2 beacon supported file transfer, but no clear exfiltration staging area was found. Network logs from the perimeter (not provided) would clarify."
  - "Are there other compromised hosts? The lateral movement to DC01 was identified (F-002), but other targets may exist."
  - "What is the full scope of credential compromise? A Kerberos ticket log analysis (4768/4769 events) across the domain is needed."
```

### Limitations
```yaml
investigative_limitations:
  - "Memory dump was not available for WS-01. Fileless malware or process injection artifacts may have been missed."
  - "Network perimeter logs (firewall, proxy) were not provided. Exfiltration assessment is incomplete."
  - "Encrypted volumes could not be decrypted without user credentials or recovery keys."
  - "VSS snapshots older than 7 days were not available; historical file versions beyond that window were unrecoverable."
  - "Investigation was conducted under time pressure (live incident). Some secondary artifacts were deferred for later analysis."
  - "macOS and Linux artifacts are limited to what was collected; no live analysis was possible on powered-off systems."
```

### References
```yaml
references:
  - url: "https://attack.mitre.org/techniques/T1547/001/"
    description: "MITRE ATT&CK — Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder"
  - url: "https://www.cisa.gov/sites/default/files/2024-03/aa24-xyz-cobalt-strike-tlpclear.pdf"
    description: "CISA Advisory on Cobalt Strike defense and detection"
```
