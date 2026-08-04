# Analysis Workflow — Step-by-Step Investigation

This is the practical sequence for a full forensic investigation. Adapt based on evidence type and scope, but follow the general structure.

## Phase 0: Setup and scoping

1. Confirm case scope: what are you investigating? (data theft, malware infection, intrusion, policy violation, etc.)
2. Inventory received evidence: disk images, memory dumps, pcaps, log exports, live system access
3. Verify all hashes match chain of custody records. Stop and flag if any don't.
4. Create working directory structure:
   ```
   case-YYYY-MM-DD-CASEID/
   ├── evidence/           # Read-only, original copies
   ├── working/            # Temporary working copies if needed
   ├── carved/             # File carving output
   ├── exports/            # Extracted files, registry hives, logs
   ├── timeline/           # Timeline analysis output
   ├── memory/             # Memory analysis output
   ├── network/            # Network analysis output
   ├── reports/            # Draft and final reports
   └── CHAIN_OF_CUSTODY.log
   ```
5. Log case start, evidence received, initial hashes verified.

## Phase 1: Triage — quick wins

Goal: Identify obvious indicators, scope the incident, prioritize deep analysis.

1. **Mount read-only** (if disk image) and get filesystem stats: `fsstat image.dd`, `mmls image.dd`
2. **Extract volatile system files** to flat copies: registry hives, EVTX logs, prefetch, scheduled tasks, cron/launchd configs
3. **Run bulk_extractor** for quick IOC extraction: URLs, email addresses, credit card patterns, IP addresses
4. **Check persistence mechanisms**:
   - Windows: Run/RunOnce keys, services, scheduled tasks, WMI, startup folders
   - Linux: cron, systemd, `~/.bashrc`, `~/.profile`, SSH authorized_keys
   - macOS: LaunchAgents, LaunchDaemons, login hooks
5. **Check user accounts**: who exists, who logged in recently, any new accounts, privileged group changes
6. **List recently modified files**: `find /mnt/evidence -type f -mtime -30` for 30-day window
7. **Flag anything obviously malicious**: known malware hashes, suspicious filenames, double extensions, hidden directories
8. **Quick IOC extraction**: compile early indicators for detection engineering

## Phase 2: Deep analysis

Goal: Build a complete picture of the incident.

### Timeline construction
1. Extract all timestamps: `log2timeline.py --parsers win7,win8,webhist,lnk,prefetch timeline.plaso image.dd`
2. Generate CSV: `psort.py -o l2tcsv -w timeline.csv timeline.plaso`
3. MACB analysis: focus on gaps, impossible sequences, anti-forensic indicators
4. Filter to incident window: what happened in the critical hours?

### File system deep dive
1. Map $MFT entries (Windows): `fls -r -m / image.dd > bodyfile.txt`, focus on $STANDARD_INFORMATION vs $FILE_NAME timestamp discrepancies (timestomping)
2. Enumerate ADS (Alternate Data Streams): `fls -r image.dd | grep ":"` 
3. Check $Recycle.Bin for deleted evidence
4. Enumerate VSS copies: `vshadowinfo image.dd`, mount and compare versions
5. Search unallocated space: `blkls image.dd | strings` for residual data
6. For Linux/macOS: examine `lost+found`, `/.Trashes`, extended attributes

### Memory analysis (if dump available)
1. Process tree: `volatility3 -f memory.dump windows.pstree` — look for unusual parent-child relationships
2. Injected code: `volatility3 -f memory.dump windows.malfind` — VAD tags, RWX pages, PE headers in unexpected locations
3. Command lines: `volatility3 -f memory.dump windows.cmdline` — what was actually executed
4. Network connections: `volatility3 -f memory.dump windows.netscan` — established connections, listening ports
5. Registry in memory: `volatility3 -f memory.dump windows.registry.hivelist` — compare with on-disk hives
6. Credentials: `volatility3 -f memory.dump windows.hashdump` / `windows.lsadump` (only with authorization)
7. Processes hiding from the OS: psxview, psscan vs pslist discrepancies
8. Kernel modules: loaded drivers, hooks, rootkit indicators

### Network forensics (if pcap available)
1. Protocol hierarchy: `tshark -r capture.pcap -q -z io,phs`
2. DNS queries: `tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name -e dns.a`
3. HTTP/S requests: `tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri -e ip.dst`
4. Identify C2: beaconing analysis — regular intervals, consistent byte sizes, unusual ports
5. Data exfiltration: large outbound flows, FTP/HTTP PUT, cloud storage connections
6. Lateral movement: SMB (445), RDP (3389), SSH (22), WinRM (5985/5986) between internal hosts
7. Follow TCP streams: `tshark -r capture.pcap -q -z follow,tcp,ascii,<stream_id>`
8. Zeek logs: `conn.log` for flow records, `http.log` for web, `dns.log` for queries, `files.log` for transferred files

### Registry analysis (Windows)
1. System hive (SYSTEM): ComputerName, services, mounted devices, USBSTOR, network interfaces
2. SAM + SECURITY: user accounts, group memberships, password policy
3. SOFTWARE: installed applications by install date, browser versions
4. NTUSER.DAT per user:
   - UserAssist: GUI program execution frequency
   - RecentDocs: recently accessed documents by extension
   - Run/RunOnce: persistence
   - TypedURLs / TypedPaths: browser bar history
   - Shellbags: folder access even after deletion
   - ComDlg32: file open/save dialog history
5. AmCache.hve: program execution with SHA1 hashes
6. BAM/DAM (Background Activity Moderator): process execution with last execution time

### Log correlation
1. Windows EVTX:
   - Security: 4624 (logon), 4625 (failed logon), 4634 (logoff), 4672 (admin logon), 4688 (process creation), 4697 (service install), 4720/4722/4728 (account/group changes)
   - System: 7034/7035/7036 (service changes), 7045 (new service installed)
   - PowerShell: 4103/4104 (script block logging)
   - Sysmon: 1 (process creation), 3 (network connection), 7 (image loaded), 11 (file creation), 13 (registry write)
2. Linux: auth.log, syslog, auditd, journald — cross-reference with known incident timestamps
3. macOS: unified logs filtered by subsystem, process, time range

## Phase 3: Malware triage

If a suspicious binary is identified:
1. Hash it: `sha256deep file.exe` — check against VirusTotal, MalwareBazaar, internal threat intel
2. File type identification: `file file.exe`, `exiftool file.exe`
3. String extraction: `strings -n 8 file.exe`, `floss file.exe` (for obfuscated/stack strings)
4. PE analysis: `pecheck file.exe` — sections, imports, exports, compile timestamp
5. Signature scan: `yara -r rules/ file.exe` against malware YARA rules
6. Disassembly triage: `objdump -d file.exe` (quick), or `radare2`/`rizin` for deeper analysis
7. If sandbox available, submit for dynamic analysis. If not, flag for reverse engineering.

## Phase 4: Build the narrative

1. Start from the **initial access** — what happened first?
2. Follow the **execution chain** — what ran, in what order, under what context?
3. Identify **persistence** — how did the attacker stay?
4. Map **lateral movement** — which systems were touched?
5. Find the **objective** — data stolen? ransomware deployed? backdoors planted?
6. Identify **gaps** — what don't you know, and why?
7. Cross-reference every finding with MITRE ATT&CK

## Phase 5: Produce deliverables

1. Write YAML report (machine-readable schema)
2. Write Markdown summary (human-readable)
3. Export IOC table (CSV or JSON for detection engineering)
4. Export timeline (CSV for investigation review)
5. Archive evidence directory with final hashes and complete custody log

## When under time pressure (live IR)

Skip to:
1. Memory acquisition (volatile, highest priority)
2. Network state capture (netstat/ss, ARP table, listening ports)
3. Running process list + command lines
4. Persistence check (quick Run keys, cron, services scan)
5. Triage triage triage — flag, contain, then deep-dive on the back end
6. Produce an interim report with what's known now; follow with a full report later
