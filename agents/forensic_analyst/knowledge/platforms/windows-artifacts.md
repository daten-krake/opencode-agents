# Windows Forensic Artifacts

Categorized by investigative question. Based on SANS FOR500 "Evidence of..." framework.

## Evidence of Program Execution

| Artifact | Location | Tool |
|---|---|---|
| Prefetch | `C:\Windows\Prefetch\*.pf` | `PECmd.exe -d Prefetch/`, `prefetch-parser` |
| AmCache | `C:\Windows\AppCompat\Programs\AmCache.hve` | `AmcacheParser.exe -f AmCache.hve --csv output/` |
| AppCompatCache (ShimCache) | SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache | `AppCompatCacheParser.exe -f SYSTEM --csv output/` |
| BAM (Background Activity Moderator) | SYSTEM\CurrentControlSet\Services\bam\State\UserSettings\* | `BamParser.exe` or RegRipper `bam` plugin |
| DAM (Desktop Activity Moderator) | SYSTEM\CurrentControlSet\Services\dam\State\UserSettings\* | Same as BAM tools |
| UserAssist | NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist | RegRipper `userassist` plugin |
| RecentApps | NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Search\RecentApps | Registry Explorer |
| MUI Cache | UsrClass.dat\Local Settings\Software\Microsoft\Windows\Shell\MuiCache | `MUICacheParser.exe` |
| Jump Lists | `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations\*.automaticDestinations-ms` | `JLECmd.exe -d JumpLists/` |
| Scheduled Tasks | `C:\Windows\System32\Tasks\` (XML) + `C:\Windows\Tasks\` | Manual XML parsing, `TaskParser.exe` |
| Services | SYSTEM\CurrentControlSet\Services | RegRipper `services` plugin |
| SRUM | `C:\Windows\System32\sru\SRUDB.dat` (ESE database) | `SrumECmd.exe -f SRUDB.dat` |
| WMI Repository | `C:\Windows\System32\wbem\Repository\OBJECTS.DATA` | `wmi-parser.py`, `flare-wmi` |
| LastVisitedMRU | NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\LastVisitedPidlMRU | RegRipper `comdlg32` plugin |
| OpenSaveMRU | NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU | RegRipper `comdlg32` plugin |

## Evidence of File & Folder Access

| Artifact | Location | Tool |
|---|---|---|
| Shellbags | NTUSER.DAT\Software\Microsoft\Windows\Shell\BagMRU + UsrClass.dat | `ShellBagsExplorer.exe`, `SBECmd.exe` |
| LNK Files | `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Recent\*.lnk` | `LECmd.exe -d Recent/` |
| Jump Lists | See above | `JLECmd.exe` |
| RecentDocs | NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs | RegRipper `recentdocs` plugin |
| Office File MRU | NTUSER.DAT\Software\Microsoft\Office\<version>\<app>\File MRU | Manual registry parsing |
| Windows Search DB | `C:\ProgramData\Microsoft\Search\Data\Applications\Windows\Windows.edb` | `esedbexport` then search |
| Thumbnail Cache | `C:\Users\<user>\AppData\Local\Microsoft\Windows\Explorer\thumbcache_*.db` | `ThumbcacheParser.exe` |
| $MFT (Master File Table) | Root of NTFS volume | `MFTECmd.exe -f \$MFT` |
| USN Journal | `\$Extend\$UsnJrnl:$J` | `MFTECmd.exe` with USN journal parsing |
| $LogFile | `\$Extend\$LogFile` | `LogFileParser.exe` |

## Evidence of Account Usage

| Artifact | Location | Tool |
|---|---|---|
| SAM Hive | `C:\Windows\System32\config\SAM` | RegRipper `samparse`, `samdump2` |
| SECURITY Hive | `C:\Windows\System32\config\SECURITY` | RegRipper (Service Keys, cached domain creds) |
| Logon Sessions | EVTX Security: 4624 (Success), 4625 (Failed), 4634 (Logoff), 4647 (User-initiated logoff), 4776 (NTLM validation) | EvtxECmd, Event Log Explorer |
| Special Logons | 4672 (admin logon = privileges assigned), 4964 (special groups assigned to new logon) | EvtxECmd |
| Logon Type Codes | 2=Interactive, 3=Network, 4=Batch, 5=Service, 7=Unlock, 8=NetworkCleartext, 9=NewCredentials, 10=RemoteInteractive, 11=CachedInteractive | Cross-reference with 4624 |
| Last Known Username | SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\DefaultUserName | Registry Explorer |
| ProfileList | SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList (maps SIDs to usernames) | Registry Explorer |
| RDP Sessions | EVTX Terminal Services: 21 (local), 25 (remote) | EvtxECmd |
| User profiles | `C:\Users\<user>\NTUSER.DAT` (last write time = last logoff) | fsstat/fls timestamps |

## Evidence of External Device Usage

| Artifact | Location | Tool |
|---|---|---|
| USBSTOR | SYSTEM\CurrentControlSet\Enum\USBSTOR\<deviceID> | RegRipper `usbstor` plugin, USBDeviceForensics |
| MountedDevices | SYSTEM\MountedDevices | RegRipper `mntdev` plugin |
| Portable Devices | SOFTWARE\Microsoft\Windows Portable Devices\Devices | Registry Explorer |
| Driver Install Events | `C:\Windows\INF\setupapi.dev.log` | grep/parse for USB VID/PID |
| Device Metadata | SOFTWARE\Microsoft\Windows\CurrentVersion\Device Metadata\* | Registry Explorer |
| EMDMgmt | SOFTWARE\Microsoft\Windows NT\CurrentVersion\EMDMgmt (ReadyBoost devices) | Registry Explorer |
| Shortcut to external | LNK files pointing to removable drives (check LNK VolumeID vs system drives) | `LECmd.exe` |

## Evidence of Persistence

| Artifact | Location | Tool |
|---|---|---|
| Run Keys | SOFTWARE\MS\Windows\CurrentVersion\Run (+ RunOnce, RunServices) | RegRipper `runkeys` |
| User Run Keys | NTUSER.DAT\...\Run, NTUSER.DAT\...\RunOnce | RegRipper `runkeys` |
| Scheduled Tasks | `C:\Windows\System32\Tasks\` XML | `TaskParser.exe`, manual XML review |
| Services | SYSTEM\CurrentControlSet\Services | RegRipper `services` plugin |
| Startup Folder | `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` | Directory listing |
| WMI Subscriptions | WMI Repository OBJECTS.DATA | `wmi-parser.py`, `flare-wmi` |
| Winlogon Notify | SOFTWARE\MS\Windows NT\CurrentVersion\Winlogon\Notify | Registry Explorer |
| Shell Extensions | HKLM and HKCU Shell Extensions, Approved Shell Extensions | RegRipper |
| AppInit_DLLs | SOFTWARE\MS\Windows NT\CurrentVersion\Windows\AppInit_DLLs | Registry Explorer |
| BootExecute | SYSTEM\CurrentControlSet\Control\Session Manager\BootExecute | RegRipper |
| Image File Execution Options | SOFTWARE\MS\Windows NT\CurrentVersion\Image File Execution Options | Registry Explorer |
| DLL Hijack paths | Known DLLs, path search order | Manual cross-reference of DLL loads with known-good paths |
| LSA Providers | SYSTEM\CurrentControlSet\Control\Lsa (Authentication Packages, Notification Packages, Security Packages) | RegRipper |
| Print Monitors | SYSTEM\CurrentControlSet\Control\Print\Monitors | Registry Explorer |
| Network Providers | SYSTEM\CurrentControlSet\Control\NetworkProvider\Order | RegRipper |

## Evidence of Browser Activity

| Artifact | Location | Tool |
|---|---|---|
| Chrome History | `C:\Users\<user>\AppData\Local\Google\Chrome\User Data\Default\History` | `sqlite3 History` — tables: urls, visits, downloads |
| Edge History | `C:\Users\<user>\AppData\Local\Microsoft\Edge\User Data\Default\History` | Same SQLite parsing |
| Firefox History | `C:\Users\<user>\AppData\Roaming\Mozilla\Firefox\Profiles\<profile>\places.sqlite` | `sqlite3 places.sqlite` — moz_places, moz_historyvisits |
| Chromium Cache | `C:\Users\<user>\AppData\Local\<browser>\User Data\Default\Cache\Cache_Data\` | `chrome-cache-parser` |
| Typed URLs | NTUSER.DAT\Software\Microsoft\Internet Explorer\TypedURLs | RegRipper `typedurls` plugin |
| IE History | NTUSER.DAT\Software\Microsoft\Internet Explorer\TypedURLs (and index.dat files in IE cache) | RegRipper, `pasco` |

## Evidence of Network Activity

| Artifact | Location | Tool |
|---|---|---|
| NetworkList | SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkList | RegRipper `networklist`, `NetworkListParser.exe` |
| SRUM Network Data | `C:\Windows\System32\sru\SRUDB.dat` | `SrumECmd.exe` |
| RDP Client Cache | `C:\Users\<user>\AppData\Local\Microsoft\Terminal Server Client\Cache\*.bmc` | `bmc-tools` |
| RDP Connections | NTUSER.DAT\Software\Microsoft\Terminal Server Client\Servers + Default | RegRipper |
| SMB Mappings | NTUSER.DAT\Network\<drive_letter> (mapped drives) | Registry Explorer |
| ARP Cache | ARP table (volatile, from memory dump) | Volatility, tshark ARP packets |
| DNS Cache | `ipconfig /displaydns` (live), DNS cache service | Memory dump, `dns-cache-parser` |
| netsh traces | `C:\Windows\System32\LogFiles\WMI\NetTrace*.etl` | `etl2pcapng.exe` |

## Evidence of File Deletion & Anti-Forensics

| Artifact | Location | Tool |
|---|---|---|
| $Recycle.Bin | `C:\$Recycle.Bin\<SID>\*` (files prefixed with `$I` and `$R`) | `RBCmd.exe -d \$Recycle.Bin` |
| $MFT unallocated | Unallocated MFT entries | `MFTECmd.exe` (flags incomplete/allocated) |
| USN Journal deleted | USN Journal DELETE flags | `MFTECmd.exe` |
| MFT slack space | Residual data in fixed-size MFT entries | Manual carving |
| VSS (Volume Shadow Copies) | `vssadmin list shadows` (live), `vshadowinfo image.dd` | `vshadowmount`, `vshadowinfo` |
| File system journal | NTFS $LogFile | `LogFileParser.exe` |
| Transaction logs | NTFS \$Extend\$RmMetadata | `TxfParser.exe` |
| Event log clearing | EVTX 1102 (Security log cleared), 104 (System log cleared) | EvtxECmd |
| USN Journal gap | Missing sequence numbers or large time gaps | Timeline analysis |
| Timestomp detection | $STANDARD_INFO vs $FILE_NAME timestamp delta > 2 minutes | `MFTECmd.exe`, then compare SI vs FN columns |
| Alternate Data Streams | `dir /r` or `fls | grep ":"` | `fls` ADS parsing |
| SDelete artifacts | Zeroed clusters, renamed files with Z-prefixed names, $LogFile patterns | Manual carving, signature scan |

## Evidence of Credential Access

| Artifact | Location | Tool |
|---|---|---|
| LSASS Access | EVTX Sysmon 10 (ProcessAccess to lsass.exe), 4656 (handle request) | EvtxECmd |
| SAM Dump | SYSTEM + SAM hive offline | `samdump2`, `secretsdump.py` |
| DPAPI | User's Master Keys + Credential/Domain vaults | `DPAPIPckg`, `mimikatz dpapi` offline |
| Service Account Logons | EVTX 4624 with Logon Type 5 (Service) | EvtxECmd |
| WDigest / Credential Guard | LSASS memory for clear-text credentials (pre-CredentialGuard) | Volatility `mimikatz` plugin |
| Cached Domain Credentials | SECURITY hive Cached credentials (mscash2) | `secretsdump.py` |
| Browser Saved Passwords | Chrome Login Data SQLite, Firefox logins.json | `sqlite3 Login Data`, `firefox_decrypt` |

## Key Event IDs (EVTX)

### Security Log
| Event ID | Description |
|---|---|
| 1102 | Audit log cleared |
| 4616 | System time changed |
| 4624 | Successful logon |
| 4625 | Failed logon |
| 4634 | Logoff |
| 4647 | User-initiated logoff |
| 4648 | Logon using explicit credentials (RunAs) |
| 4672 | Special privileges assigned to new logon |
| 4688 | Process creation (with command line if enabled) |
| 4697 | Service installed on system |
| 4698 | Scheduled task created |
| 4699 | Scheduled task deleted |
| 4700 | Scheduled task enabled |
| 4702 | Scheduled task updated |
| 4720 | User account created |
| 4722 | User account enabled |
| 4724 | Password reset attempt |
| 4725 | User account disabled |
| 4728 | Member added to global security group |
| 4732 | Member added to local security group |
| 4738 | User account changed |
| 4740 | User account locked out |
| 4768 | Kerberos TGT requested |
| 4769 | Kerberos service ticket requested |
| 4770 | Kerberos service ticket renewed |
| 4771 | Kerberos pre-authentication failed |
| 4776 | NTLM credential validation |
| 4778 | Session reconnected (RDP) |
| 4779 | Session disconnected (RDP) |
| 4798 | User's local group membership enumerated |
| 4799 | Security-enabled local group membership enumerated |
| 5140 | Network share accessed |
| 5145 | Network share object access (detailed) |
| 5156 | Windows Filtering Platform connection |
| 5158 | WFP bind to local port |

### System Log
| Event ID | Description |
|---|---|
| 7034 | Service crashed unexpectedly |
| 7035 | Service sent start/stop control |
| 7036 | Service state changed |
| 7040 | Service start type changed |
| 7045 | New service installed |
| 1001 | BugCheck (system crash) |

### Sysmon Log (if installed)
| Event ID | Description |
|---|---|
| 1 | Process creation |
| 2 | Process changed a file creation time |
| 3 | Network connection |
| 4 | Sysmon service state changed (tampering) |
| 5 | Process terminated |
| 6 | Driver loaded |
| 7 | Image (DLL) loaded |
| 8 | CreateRemoteThread |
| 9 | RawAccessRead (direct disk access) |
| 10 | ProcessAccess |
| 11 | FileCreate |
| 12 | RegistryEvent (Object create/delete) |
| 13 | RegistryEvent (Value set) |
| 14 | RegistryEvent (Key and value rename) |
| 15 | FileCreateStreamHash |
| 16 | Sysmon config change (tampering) |
| 17 | PipeEvent (Created) |
| 18 | PipeEvent (Connected) |
| 19 | WmiEvent (WmiEventFilter activity) |
| 20 | WmiEvent (WmiEventConsumer activity) |
| 21 | WmiEvent (WmiEventConsumerToFilter activity) |
| 22 | DNSEvent |
| 23 | FileDelete (with archival) |
| 24 | ClipboardChange |
| 25 | ProcessTampering |
| 26 | FileDeleteDetected |
| 27 | FileBlockExecutable |
| 28 | FileBlockShredding |
| 29 | FileExecutableDetected |
| 255 | Error |
