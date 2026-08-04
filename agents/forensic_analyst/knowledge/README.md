# Forensic Analyst — Knowledge Index

## methodology/
- `nist-sp800-86.md` — NIST SP 800-86 forensic process: Collection, Examination, Analysis, Reporting phases with tool mappings
- `chain-of-custody.md` — Evidence handling principles, hashing, documentation, tamper-proof custody forms
- `analysis-workflow.md` — Step-by-step investigation methodology: triage, deep-dive, correlation, reporting

## tools/
- `toolkit-index.md` — Master index of all forensic tools, categorized by domain, with common command patterns and safe flags

## platforms/
- `windows-artifacts.md` — Windows forensic artifacts: registry hives, EVTX, prefetch, SRUM, AmCache, $MFT, LNK, shellbags, USBSTOR, browser artifacts, VSS
- `linux-artifacts.md` — Linux forensic artifacts: syslog, journald, auditd, bash_history, /proc, cron, systemd, SSH, package logs
- `macos-artifacts.md` — macOS forensic artifacts: unified logs, plists, FSEvents, Spotlight, LaunchAgents/Daemons, quarantine, browser data

## reporting/
- `report-template.md` — YAML forensic report schema reference with field definitions and examples
