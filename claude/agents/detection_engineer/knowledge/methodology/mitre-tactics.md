# MITRE ATT&CK Enterprise Matrix — Tactics Quick Reference

Source: [MITRE ATT&CK](https://attack.mitre.org/)

## Enterprise Tactics

| ID | Tactic | Description |
|---|---|---|
| TA0001 | Initial Access | Techniques that use various entry vectors to gain their initial foothold within a network |
| TA0002 | Execution | Techniques that result in adversary-controlled code running on a local or remote system |
| TA0003 | Persistence | Techniques that adversaries use to keep access to systems across restarts, changed credentials, and other interruptions |
| TA0004 | Privilege Escalation | Techniques that adversaries use to gain higher-level permissions on a system or network |
| TA0005 | Defense Evasion | Techniques that adversaries use to avoid detection throughout their compromise |
| TA0006 | Credential Access | Techniques for stealing credentials like account names and passwords |
| TA0007 | Discovery | Techniques an adversary uses to gain knowledge about the system and internal network |
| TA0008 | Lateral Movement | Techniques that adversaries use to enter and control remote systems on a network |
| TA0009 | Collection | Techniques adversaries use to gather information relevant to their goal |
| TA0011 | Command and Control | Techniques that adversaries use to communicate with systems under their control within a victim network |
| TA0010 | Exfiltration | Techniques that adversaries use to steal data from the network |
| TA0040 | Impact | Techniques that adversaries use to disrupt availability or compromise integrity by manipulating business and operational processes |

## Common Sub-Technique Conventions

- Sub-techniques are identified as `T####.###` (e.g., `T1098.003` for Additional Cloud Roles)
- Always prefer sub-techniques when they fit more precisely than the parent technique
- A bare `T1098` means Account Manipulation; `T1098.003` means specifically "Additional Cloud Roles"
- A detection may legitimately span multiple tactics — e.g., Persistence + Privilege Escalation

## Tagging Rules

- Tag every rule with the tightest-fitting tactic(s) and technique(s)
- Do not tag techniques the rule does not actually detect — "related" ≠ "detected"
- Knowledge of the Enterprise matrix is assumed; use exact IDs only
- Cloud and Identity sub-matrices are included — use Entra ID / Azure-specific techniques as appropriate

## Key Technique Families (commonly used in detection engineering)

### Credential Access (TA0006)
- T1003: OS Credential Dumping
- T1003.001: LSASS Memory
- T1003.002: SAM
- T1552: Unsecured Credentials
- T1558: Steal or Forge Kerberos Tickets

### Privilege Escalation (TA0004)
- T1068: Exploitation for Privilege Escalation
- T1078: Valid Accounts
- T1098: Account Manipulation
- T1098.003: Additional Cloud Roles

### Defense Evasion (TA0005)
- T1055: Process Injection
- T1055.001: DLL Injection
- T1055.012: Process Hollowing
- T1070: Indicator Removal
- T1218: Signed Binary Proxy Execution
- T1562: Impair Defenses

### Persistence (TA0003)
- T1543: Create or Modify System Process
- T1547: Boot or Logon Autostart Execution
- T1547.001: Registry Run Keys / Startup Folder

### Lateral Movement (TA0008)
- T1021: Remote Services
- T1021.002: SMB/Windows Admin Shares
- T1550: Use Alternate Authentication Material

### Execution (TA0002)
- T1059: Command and Scripting Interpreter
- T1059.001: PowerShell
- T1059.003: Windows Command Shell
- T1204: User Execution

### Command and Control (TA0011)
- T1071: Application Layer Protocol
- T1090: Proxy
- T1573: Encrypted Channel

### Discovery (TA0007)
- T1016: System Network Configuration Discovery
- T1018: Remote System Discovery
- T1087: Account Discovery
- T1087.002: Domain Account

### Collection (TA0009)
- T1005: Data from Local System
- T1114: Email Collection
- T1530: Data from Cloud Storage

### Exfiltration (TA0010)
- T1048: Exfiltration Over Alternative Protocol
- T1567: Exfiltration Over Web Service
