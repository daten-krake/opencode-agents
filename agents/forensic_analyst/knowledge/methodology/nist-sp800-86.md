# NIST SP 800-86 — Forensic Process

The NIST Guide to Integrating Forensic Techniques into Incident Response defines four phases. Every investigation flows through them.

## Phase 1: Collection

Goal: Acquire digital evidence in a forensically sound manner, preserving integrity.

Principles:
- Identify evidence sources and document their state
- Establish chain of custody before collection begins
- Collect in order of volatility:
  1. Registers, cache (CPU)
  2. RAM (routing table, ARP cache, process table, kernel stats)
  3. Temporary filesystems (/tmp, swap)
  4. Disk / persistent storage
  5. Remote logging and monitoring data
  6. Physical configuration, network topology, archival media
- Use write-blockers for any direct device access
- Image the entire device or logical volume, not selected files
- Generate cryptographic hashes during acquisition
- Document: date, time, operator, tool name + version, source + destination, hashes

Tools (Linux environment):
- `dc3dd if=/dev/sdX of=image.dd hash=sha256 hash=md5 log=acquisition.log` — bit-for-bit imaging with integrated hashing
- `ewfacquire /dev/sdX` — Expert Witness Format (E01) with compression and built-in hash verification
- `guymager` — GUI alternative for E01/DD imaging
- `LiME` (Linux Memory Extractor) / `avml` — live memory acquisition
- `dd if=/dev/sdX of=image.dd bs=4M status=progress conv=noerror,sync` — fallback imaging (include hash separately)

## Phase 2: Examination

Goal: Extract and assess relevant data from collected evidence using forensic tools.

Principles:
- Always work on a copy or mounted image
- Use read-only mounts
- De-duplicate against known-good hash databases (NSRL)
- Identify known-bad files via malware hash sets
- Extract and categorize files by type, not just extension
- Carve deleted, hidden, and unallocated data
- Decrypt encrypted content where legally authorized

Tools:
- Filesystem parsing: `fls`, `icat`, `istat`, `fsstat`, `mmls`, `ffind` (Sleuth Kit)
- Mounting: `ewfmount image.E01 /mnt/ewf`, `mount -o ro,noexec,loop image.dd /mnt/evidence`
- File carving: `foremost -t all -i image.dd`, `bulk_extractor -o output/ image.dd`, `scalpel -c scalpel.conf image.dd`
- Embedded extraction: `binwalk -Me firmware.bin`
- Hash lookups: check SHA-256 against NSRL Reference Data Set (RDS)
- Malware detection: `yara rules.yar /evidence`, `clamav /mnt/evidence`

## Phase 3: Analysis

Goal: Derive conclusions from the examined data. This is where you answer the investigative questions.

Analysis types:
- **Temporal analysis** — Build a timeline: what happened, in what order, by what account
- **Relational analysis** — Connect entities: user → process → file → network connection → remote host
- **Functional analysis** — Determine what a program or script does, what data it accesses
- **Comparative analysis** — Compare against known samples, baselines, or previous incidents

Tools:
- Timeline: `log2timeline.py timeline.plaso image.dd` → `psort.py -o l2tcsv -w timeline.csv timeline.plaso` → `mactime -b bodyfile.csv`
- Memory: `volatility3 -f memory.dump windows.psscan` / `windows.netscan` / `windows.cmdline` / `windows.malfind`
- Network: `tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri`
- Registry: `RegRipper -r NTUSER.DAT -p userassist` / `rip.pl -r SYSTEM -p services`
- Log correlation: cross-reference timestamps across EVTX, syslog, application logs

Correlation rules:
- Match process creation timestamps to file creation/modification timestamps
- Match network connections to the processes that opened them
- Trace account activity across multiple hosts
- Follow data from creation → staging → archiving → exfiltration
- Look for gaps: missing logs, unexpected timestamps, anti-forensic indicators

## Phase 4: Reporting

Goal: Produce a clear, actionable report that stands up to scrutiny.

Report requirements:
- Executive summary for non-technical stakeholders
- Technical findings with evidence references
- IOC table for detection engineering / threat intel
- Timeline of events
- Containment and remediation recommendations
- Unanswered questions and limitations
- Evidence handling log and chain of custody
- Tool list with versions

Format: YAML (machine-readable) + Markdown (human-readable)
