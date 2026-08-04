# Forensic Toolkit Index

Master reference of all forensic tools, organized by domain, with common command patterns and safe flags.

## Disk & Filesystem

### Imaging & Acquisition
| Tool | Purpose | Common Command |
|---|---|---|
| `dc3dd` | Bit-for-bit disk imaging with integrated hashing | `dc3dd if=/dev/sdX of=image.dd hash=sha256 hash=md5 log=imaging.log` |
| `ewfacquire` | Acquire to Expert Witness Format (E01) | `ewfacquire /dev/sdX` (interactive) or `ewfacquire -t evidence /dev/sdX` |
| `ewfexport` | Convert E01 back to raw | `ewfexport -t evidence -f raw image.E01` |
| `dd` | Raw copy (fallback) | `dd if=/dev/sdX of=image.dd bs=4M status=progress conv=noerror,sync` |
| `guymager` | GUI imaging tool | `guymager` |

### Mounting
| Tool | Purpose | Common Command |
|---|---|---|
| `ewfmount` | Mount E01 as virtual raw device | `ewfmount image.E01 /mnt/ewf` |
| `affuse` | Mount AFF image via FUSE | `affuse image.aff /mnt/aff` |
| `mount` | Mount raw image read-only | `mount -o ro,noexec,loop image.dd /mnt/evidence` |
| `vshadowmount` | Mount VSS snapshots | `vshadowmount -o ro -X allow_other image.dd /mnt/vss` |

### Filesystem Analysis (Sleuth Kit)
| Tool | Purpose | Common Command |
|---|---|---|
| `mmls` | List partition layout | `mmls image.dd` |
| `fsstat` | Filesystem statistics and metadata | `fsstat -o <offset> image.dd` |
| `fls` | List files and directories | `fls -r -m / -o <offset> image.dd > bodyfile.txt` |
| `icat` | Extract file by inode | `icat -o <offset> image.dd <inode>` |
| `istat` | Display inode metadata | `istat -o <offset> image.dd <inode>` |
| `ffind` | Find files by name | `ffind -o <offset> image.dd <filename>` |
| `blkls` | Extract unallocated blocks | `blkls -o <offset> image.dd > unallocated.bin` |
| `blkcalc` | Map unallocated clusters to filesystem | `blkcalc -o <offset> image.dd` |
| `sigfind` | Find hex signatures on disk | `sigfind -o <offset> <hex_pattern> image.dd` |
| `jcat` | Extract file from journal | `jcat -o <offset> image.dd <inode>` |
| `tsk_recover` | Recover files by type to directory | `tsk_recover -o <offset> -a image.dd recovered/` |

### File Carving
| Tool | Purpose | Common Command |
|---|---|---|
| `foremost` | File carving by headers/footers | `foremost -t all -i image.dd -o carved/` |
| `scalpel` | High-performance file carving | `scalpel -c /etc/scalpel/scalpel.conf -o carved/ image.dd` |
| `bulk_extractor` | Bulk feature extraction | `bulk_extractor -o output/ image.dd` |
| `testdisk` | Partition recovery & undelete | `testdisk image.dd` |
| `photorec` | File recovery from TestDisk suite | `photorec image.dd` |
| `binwalk` | Firmware analysis & extraction | `binwalk -Me firmware.bin` |

## Memory Forensics

### Acquisition
| Tool | Purpose | Common Command |
|---|---|---|
| `LiME` | Linux kernel module for memory dump | `insmod lime.ko path=/tmp/mem.dump format=lime` |
| `avml` | Linux memory acquisition (static binary) | `avml /tmp/mem.dump` |
| `winpmem` | Windows memory acquisition | `winpmem.exe -o mem.dump` |
| `fmfdump` | Fast dump on Windows via DumpIt | Run `DumpIt.exe`, output `mem.dump` |
| `rekall` | Memory acquisition (legacy) | `rekall -f mem.dump` |

### Analysis (Volatility 3)
| Plugin | Purpose | Common Command |
|---|---|---|
| `windows.info` | OS version, kernel, architecture | `volatility3 -f mem.dump windows.info` |
| `windows.pstree` | Process tree | `volatility3 -f mem.dump windows.pstree` |
| `windows.pslist` | Process listing | `volatility3 -f mem.dump windows.pslist` |
| `windows.psscan` | Scan for hidden/terminated processes | `volatility3 -f mem.dump windows.psscan` |
| `windows.cmdline` | Process command lines | `volatility3 -f mem.dump windows.cmdline` |
| `windows.dlllist` | Process loaded DLLs | `volatility3 -f mem.dump windows.dlllist --pid <pid>` |
| `windows.malfind` | Detect injected code / hidden PE | `volatility3 -f mem.dump windows.malfind` |
| `windows.netscan` | Network connections and sockets | `volatility3 -f mem.dump windows.netscan` |
| `windows.netstat` | Network connections (legacy) | `volatility3 -f mem.dump windows.netstat` |
| `windows.modules` | Loaded kernel modules | `volatility3 -f mem.dump windows.modules` |
| `windows.ssdt` | System Service Descriptor Table | `volatility3 -f mem.dump windows.ssdt` |
| `windows.registry.hivelist` | Registry hives in memory | `volatility3 -f mem.dump windows.registry.hivelist` |
| `windows.registry.printkey` | Print registry key from memory | `volatility3 -f mem.dump windows.registry.printkey --key "..."` |
| `windows.hashdump` | Extract password hashes (SAM) | `volatility3 -f mem.dump windows.hashdump` |
| `windows.lsadump` | Extract LSA secrets | `volatility3 -f mem.dump windows.lsadump` |
| `windows.dumpfiles` | Dump cached files from memory | `volatility3 -f mem.dump windows.dumpfiles --pid <pid>` |
| `windows.vadinfo` | Virtual Address Descriptor info | `volatility3 -f mem.dump windows.vadinfo` |
| `windows.handles` | Process handles | `volatility3 -f mem.dump windows.handles --pid <pid>` |
| `windows.envars` | Process environment variables | `volatility3 -f mem.dump windows.envars` |
| `windows.svcscan` | Scan for services | `volatility3 -f mem.dump windows.svcscan` |
| `linux.pslist` | Linux process listing | `volatility3 -f mem.dump linux.pslist` |
| `linux.check_afinfo` | Check network structs for rootkits | `volatility3 -f mem.dump linux.check_afinfo` |
| `linux.bash` | Recover bash history from memory | `volatility3 -f mem.dump linux.bash` |
| `linux.lsof` | List open files | `volatility3 -f mem.dump linux.lsof` |
| `mac.pslist` | macOS process listing | `volatility3 -f mem.dump mac.pslist` |
| `mac.netstat` | macOS network connections | `volatility3 -f mem.dump mac.netstat` |

## Network Forensics

### PCAP Analysis
| Tool | Purpose | Common Command |
|---|---|---|
| `tshark` | CLI packet analyzer (Wireshark) | `tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri` |
| `tcpdump` | Capture and read packets | `tcpdump -r capture.pcap -n -X` |
| `capinfos` | PCAP metadata and statistics | `capinfos capture.pcap` |
| `mergecap` | Merge multiple PCAP files | `mergecap -w merged.pcap file1.pcap file2.pcap` |
| `editcap` | Filter/split PCAP files | `editcap -A "2026-05-12 09:00:00" -B "2026-05-12 10:00:00" in.pcap out.pcap` |
| `argus` | Network flow analysis | `argus -r capture.pcap -w flows.argus`, `ra -r flows.argus` |
| `nfdump` | NetFlow data analysis | `nfdump -r nfcapd.file` |

### Protocol & IDS Analysis
| Tool | Purpose | Common Command |
|---|---|---|
| `zeek` | Network security monitor (formerly Bro) | `zeek -r capture.pcap` (produces conn.log, http.log, dns.log, etc.) |
| `zeek-cut` | Extract fields from zeek logs | `cat conn.log | zeek-cut id.orig_h id.resp_h service` |
| `ngrep` | Network grep — pattern match in packets | `ngrep -I capture.pcap -W byline "password" port 80` |
| `dsniff` | Password sniffer | `dsniff -r capture.pcap` |

### Useful tshark display filters
```
http.request                              # All HTTP requests
dns.qry.name ~ "malicious.com"           # DNS queries matching domain
ip.src == 192.168.1.100                  # Packets from specific IP
tcp.flags.syn == 1 && tcp.flags.ack == 0 # SYN packets (scan detection)
tcp.port == 445                          # SMB traffic
http.request.uri ~ "/upload"             # Upload endpoints
tls.handshake.extensions_server_name     # TLS SNI (domain in HTTPS)
frame.time >= "2026-05-12 09:00:00"      # Time-based filtering
```

### Useful tcpdump filters
```
host 192.168.1.100
port 443
net 192.168.1.0/24
tcp[tcpflags] & (tcp-syn) != 0
greater 1000                              # packets larger than 1000 bytes
```

## Registry Analysis (Windows)

| Tool | Purpose | Common Command |
|---|---|---|
| `RegRipper` | GUI/CLI registry artifact extraction | `RegRipper -r NTUSER.DAT -p userassist` |
| `rip.pl` | CLI front-end for RegRipper | `rip.pl -r SOFTWARE -p samparse` |
| RegRipper plugins | Individual plugins | `userassist`, `shellbags`, `recentdocs`, `lastloggedon`, `networklist`, `usbstor`, `runkeys`, `services`, `typedurls`, `comdlg32`, `appcompatcache`, `bam`, `dam`, `muicache` |
| `python-registry` | Python library for registry parsing | `from Registry import Registry; reg = Registry.Registry("NTUSER.DAT")` |
| `Registry Explorer` | GUI registry viewer | `RegistryExplorer.exe` (Windows) |
| `yarp` | Yet Another Registry Parser (python) | `yarp.py -i SOFTWARE -o parsed/` |

Key hive locations (Windows):
- `C:\Windows\System32\config\SYSTEM`
- `C:\Windows\System32\config\SAM`
- `C:\Windows\System32\config\SECURITY`
- `C:\Windows\System32\config\SOFTWARE`
- `C:\Windows\System32\config\DEFAULT`
- `C:\Users\<user>\NTUSER.DAT`
- `C:\Users\<user>\AppData\Local\Microsoft\Windows\UsrClass.dat`
- `C:\Windows\AppCompat\Programs\AmCache.hve`

## Timeline Analysis

| Tool | Purpose | Common Command |
|---|---|---|
| `log2timeline.py` | Extract timestamps from evidence | `log2timeline.py --parsers win7,win8,webhist,lnk,prefetch timeline.plaso image.dd` |
| `psteal.py` | Combined log2timeline + psort | `psteal.py --parsers win7 timeline.plaso image.dd` |
| `psort.py` | Filter/examine plaso storage | `psort.py -o l2tcsv -w timeline.csv timeline.plaso` |
| `pinfo.py` | plaso storage info | `pinfo.py timeline.plaso` |
| `mactime` | MACB timeline from bodyfile | `mactime -b bodyfile.csv -d` |
| `timesketch` | Web-based collaborative timeline (server) | Deploy via Docker; import plaso files |

Output formats for psort:
- `l2tcsv` — CSV timeline
- `json_line` — JSON Lines
- `opensearch` — Elasticsearch
- `kml` — Google Earth KML
- `dynamic` — HTML report
- `sqlite` — SQLite database

## Hashing & Integrity

| Tool | Purpose | Common Command |
|---|---|---|
| `md5deep` | Recursive MD5 hashing | `md5deep -r /evidence > hashes.md5` |
| `sha1deep` | Recursive SHA-1 hashing | `sha1deep -r /evidence > hashes.sha1` |
| `sha256deep` | Recursive SHA-256 hashing | `sha256deep -r /evidence > hashes.sha256` |
| `hashdeep` | Recursive multi-hash + comparison | `hashdeep -r /evidence > hashes.txt`; `hashdeep -r -k hashes.txt /evidence` (audit) |
| `ssdeep` | Fuzzy / context-triggered hashing | `ssdeep -r -b /evidence` |
| `sdhash` | Similarity digest hashing | `sdhash -r /evidence > sdhashes.sdbf` |
| `nsrllookup` | Query NSRL hash database | `nsrllookup sha256 <hash>` |

## File & Binary Analysis

| Tool | Purpose | Common Command |
|---|---|---|
| `exiftool` | Metadata extraction from any file | `exiftool -r /evidence > metadata.txt` |
| `strings` | Extract ASCII/Unicode strings | `strings -n 8 -t d file.bin` |
| `floss` | Extract obfuscated strings (FireEye) | `floss file.exe` or `floss -n 6 file.exe` |
| `file` | Identify file type by magic bytes | `file file.bin` |
| `yara` | Pattern matching against rules | `yara -r rules/ /evidence` |
| `clamav` | Antivirus scanning (CLI) | `clamscan -r /evidence` |
| `readelf` | ELF binary analysis | `readelf -a file.bin` |
| `objdump` | Object file disassembly | `objdump -d -M intel file.exe` |
| `pecheck` | PE file structure analysis | `pecheck file.exe` |
| `peframe` | PE static analysis (strings, APIs, sections) | `peframe file.exe` |
| `oletools` | OLE/MS Office file analysis | `olevba file.doc`, `oledump.py file.xls` |
| `pdf-parser` | PDF structure analysis | `pdf-parser.py file.pdf` |
| `zipdump` | ZIP archive analysis | `zipdump.py file.zip` |
| `sigcheck` | File digital signature verification (Windows) | `sigcheck -a -h file.exe` |

## Log Analysis

### Windows EVTX
| Tool | Purpose | Common Command |
|---|---|---|
| `EvtxECmd` | Eric Zimmerman's EVTX parser | `EvtxCmd.exe -f Security.evtx --csv output/` |
| `python-evtx` | Python EVTX parser | `python-evet.py Security.evtx` |
| `chainsaw` | Sigma rule matching against EVTX | `chainsaw hunt Security.evtx -s sigma/rules/` |
| `hayabusa` | Fast EVTX timeline + Sigma | `hayabusa csv-timeline -d Logs/ -o timeline.csv` |
| Event Log Explorer | GUI viewer (Windows) | `EventLogExplorer.exe` |

### Linux / Unix Logs
| Tool | Purpose | Common Command |
|---|---|---|
| `journalctl` | Query systemd journal | `journalctl --file=system.journal --since "2026-05-12"` |
| `ausearch` | Search auditd logs | `ausearch -i -ts 05/12/2026 '09:00:00'` |
| `aureport` | Auditd report generation | `aureport -x --summary` (executable summary) |
| `last` | Login history | `last -f /var/log/wtmp` |
| `lastb` | Failed login history | `lastb -f /var/log/btmp` |
| `utmpdump` | Dump wtmp/btmp in text | `utmpdump /var/log/wtmp` |

### macOS Logs
| Tool | Purpose | Common Command |
|---|---|---|
| `log` | Apple Unified Logging query | `log show --predicate 'process == "mdworker"' --last 1h` |
| `plutil` | Property list manipulation | `plutil -p file.plist` |
| `defaults` | Read/write macOS defaults | `defaults read /path/to/plist` |

## Database Forensics

| Tool | Purpose | Common Command |
|---|---|---|
| `sqlite3` | SQLite database querying | `sqlite3 database.sqlite ".schema"`, `.dump`, `SELECT * FROM table` |
| `sqlitebrowser` | GUI SQLite browser | `sqlitebrowser database.sqlite` |
| `esedbexport` | Export Windows ESE database | `esedbexport -t /tmp/output database.edb` |

## Anti-Forensic Detection

Signs to look for:
- **Timestomping**: $STANDARD_INFORMATION vs $FILE_NAME timestamp mismatch (>2 min)
- **Log clearing**: EVTX 1102 (Security log cleared), gaps in log sequence numbers
- **Encrypted/obfuscated data**: high-entropy file regions (use `binwalk -E`)
- **Hollowed processes**: memory-only executables, VAD with RWX and no backing file
- **Hidden ADS**: alternate data streams on critical files
- **Registry key deletion**: hive slack space analysis, transaction log replay
- **MFT entry reuse**: sequence number anomalies, orphaned FILE_NAME attributes

## Tool Version Verification

Always record versions. Useful commands:
- `dc3dd --version`
- `ewfacquire -V`
- `foremost -V`
- `volatility3 --version`
- `tshark --version`
- `zeek --version`
- `plaso/log2timeline.py --version` or `pip show plaso`
- `ssdeep -V`
- `yara --version`
- `exiftool -ver`
