# macOS Forensic Artifacts

## Evidence of User Activity

| Artifact | Location | Tool |
|---|---|---|
| Bash History | `~/.bash_history` | `cat`, `strings` |
| Zsh History | `~/.zsh_history` (default shell since Catalina) | `cat`, `strings` |
| Bash Sessions | `~/.bash_sessions/` (terminal session history) | Directory enumeration, `strings` on session files |
| Sudo usage | Unified logs: `log show --predicate 'process == "sudo"'` | `log show` |
| Login Records | `/var/log/asl/` (Apple System Log, deprecated but still present pre-Ventura) | `syslog` on ASL files |
| Login window | Unified log | `log show --predicate 'subsystem == "com.apple.loginwindow"'` |
| Last logins | `last` command, `/var/run/utmpx` | `last`, `lastb` (failed attempts) |
| Screen Time | `~/Library/Application Support/Knowledge/knowledgeC.db` (usage data) | `sqlite3` |
| Siri/Analytics | `~/Library/Application Support/com.apple.TCC/` (privacy DB) | `sqlite3` |

## Evidence of Program Execution

| Artifact | Location | Tool |
|---|---|---|
| Unified Logs | `/private/var/db/diagnostics/`, `/private/var/db/uuidtext/` | `log show --predicate 'eventType == execEvent'` on mounted image (complex), `mac_apt` |
| Process Accounting | Not enabled by default | Check `/var/account/pacct` |
| Application State | `~/Library/Saved Application State/*.savedState/` (windows.json files) | `plutil -p windows.json` |
| Dock Items | `~/Library/Preferences/com.apple.dock.plist` — persistent-apps | `plutil -p`, `defaults read` |
| LaunchServices | `~/Library/Preferences/com.apple.LaunchServices.plist`, `~/Library/Preferences/com.apple.LaunchServices.QuarantineEventsV2` | `plutil`, `sqlite3` (QuarantineEventsV2 is SQLite) |
| Core Dumps | `/cores/` | `strings`, `gdb`, `lldb` |
| App-specific logs | `~/Library/Logs/`, `/Library/Logs/`, `~/Library/Containers/<bundle>/Data/Library/Logs/` | Manual log parsing |
| Startup items history | `log show --predicate 'subsystem == "com.apple.backgroundtaskmanagementagent"'` | Unified logs |
| XProtect / MRT | Built-in macOS anti-malware; logs in unified logs | `log show --predicate 'subsystem contains "XProtect" OR subsystem contains "MRT"'` |
| Gatekeeper | `/private/var/db/gkopaque.bundle/`, quarantine events | Unified logs, quarantine database |

## Evidence of Persistence

| Artifact | Location | Tool |
|---|---|---|
| Launch Agents (user) | `~/Library/LaunchAgents/*.plist` | `plutil -p`, `readlink` (for symlinks) |
| Launch Daemons (system) | `/Library/LaunchDaemons/*.plist` | Same |
| Launch Daemons (hidden) | `/System/Library/LaunchDaemons/*.plist` | Check modification timestamps on Apple-signed daemons |
| Overrides | `/private/var/db/com.apple.xpc.launchd/disabled.*.plist` | `plutil -p` — shows disabled services |
| Cron | `crontab -l` (live), `/private/var/at/tabs/<user>` | `crontab` |
| Login Items | `~/Library/Application Support/com.apple.backgroundtaskmanagementagent/backgrounditems.btm` | Binary plist; `plutil` or custom parsing |
| Login/Logout Hooks | `sudo defaults read com.apple.loginwindow LoginHook` / `LogoutHook` | `defaults read` |
| Shell Configs | `~/.bashrc`, `~/.bash_profile`, `~/.profile`, `~/.zshrc`, `~/.zprofile`, `/etc/profile`, `/etc/zprofile` | Manual review |
| SSH Authorized Keys | `~/.ssh/authorized_keys` | Check for unexpected keys and timestamps |
| Kernel Extensions | `/Library/Extensions/`, `/System/Library/Extensions/` | `kextstat` (live), `kmutil showloaded` (live), check kext timestamps |
| System Extensions (post-Catalina) | `/Applications/<app>/Contents/Library/SystemExtensions/` | `systemextensionsctl list` (live) |
| Periodic scripts | `/etc/periodic/daily/`, `/etc/periodic/weekly/`, `/etc/periodic/monthly/` | Manual script review |
| StartupItems | `/Library/StartupItems/`, `/System/Library/StartupItems/` (legacy) | Directory listing |
| Emond (Event Monitor Daemon) | `/etc/emond.d/rules/` | `plutil -p` on `.plist` rules — can trigger on events |
| Re-opened apps | `~/Library/Preferences/ByHost/com.apple.loginwindow.<UUID>.plist` (TALAppsToRelaunchAtLogin) | `plutil` |

## Evidence of File & Folder Access

| Artifact | Location | Tool |
|---|---|---|
| FSEvents Database | `.fseventsd/` at root of each volume (tracks all filesystem changes, ~30 days retention) | `FSEventsParser`, `mac_apt` FSEVENTS plugin |
| Spotlight Index | `.Spotlight-V100/` at root of each volume | `mdfind` (live), `mdls` (live), offline parsing via `mac_apt` |
| Quarantine Database | `~/Library/Preferences/com.apple.LaunchServices.QuarantineEventsV2` (SQLite) | `sqlite3` — tracks every file downloaded/created, source URL, date |
| Recent Items | `~/Library/Preferences/com.apple.recentitems.plist` | `plutil -p` |
| Recent Servers | `~/Library/Preferences/com.apple.sidebarlists.plist` | `plutil -p` |
| Finder Go To Folder | `~/Library/Preferences/com.apple.finder.plist` (FXGoToField) | `plutil -p` |
| QuickLook | `~/Library/Caches/com.apple.quicklook.cache` | QuickLook thumbnail cache |
| Trash | `~/.Trash/` | File listing |
| DS_Store | `~/.DS_Store`, and per-folder `.DS_Store` files (view settings, folder position) | `ds_store` parser |
| Extended Attributes | `xattr -l file` | `xattr` on mounted images |
| File Tags / Labels | `~/Library/SyncedPreferences/com.apple.finder.plist` | `plutil`, `mdls` (kMDItemUserTags) |

## Evidence of Network Activity

| Artifact | Location | Tool |
|---|---|---|
| Network Preferences | `/Library/Preferences/SystemConfiguration/preferences.plist` | `plutil -p` — configured interfaces, DNS, proxies |
| Network Interfaces | `/Library/Preferences/SystemConfiguration/NetworkInterfaces.plist` | `plutil -p` |
| Known Wi-Fi Networks | `/Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist` | `plutil -p` |
| DHCP Leases | `/private/var/db/dhcpclient/leases/` | `plutil -p` on `.plist` lease files |
| Firewall Rules | `/Library/Preferences/com.apple.alf.plist` (Application Level Firewall) | `plutil -p`, `/usr/libexec/ApplicationFirewall/socketfilterfw --listapps` (live) |
| pf (Packet Filter) | `/etc/pf.conf`, `/etc/pf.anchors/` | Check for custom rules |
| SSH known_hosts | `~/.ssh/known_hosts` | `cat` — shows hosts user connected to |
| VPN Configurations | `/Library/Preferences/com.apple.networkextension.plist`, profiles | `plutil`, `profiles -L` |
| DNS Cache | `sudo dscacheutil -cachedump -entries Host` (live, limited) | `dscacheutil` |
| mDNSResponder | Unified logs | `log show --predicate 'process == "mDNSResponder"'` |
| Network Extensions | `/Library/SystemExtensions/` | System extension listing |
| Browser history | See browser sections in windows-artifacts (same SQLite structure for Chrome/Firefox) | `sqlite3` |
| RDP Client | Microsoft Remote Desktop: `~/Library/Containers/com.microsoft.rdc.macos/Data/Library/Application Support/com.microsoft.rdc.macos/` | XML config files |

## Evidence of External Device Usage

| Artifact | Location | Tool |
|---|---|---|
| USB/Thunderbolt devices | `/Library/Preferences/SystemConfiguration/com.apple.usb.plist` (vendor/product IDs), unified logs | `plutil`, `log show --predicate 'subsystem == "com.apple.iokit"'` |
| Disk Arbitration | `/var/log/asl/` or unified logs for volume mount/unmount events | `log show --predicate 'process == "diskarbitrationd"'` |
| Mount History | `mtab` entries, fstab, `/var/db/volinfo.database` | `cat /etc/fstab`, check volinfo |
| `.TemporaryItems` | Hidden directory on mounted external drives | File listing |
| Volume UUID mappings | `/var/db/volinfo.database` | Text parsing |

## Evidence of File Deletion & Anti-Forensics

| Artifact | Location | Tool |
|---|---|---|
| Trash | `~/.Trash/`, `/Users/<user>/.Trash/` | File listing with `ls -la` |
| Secure Empty Trash | May have used `srm`, `rm -P` | Bash history, check for secure deletion tools |
| Unified log clearing | `log erase` command in bash history, or missing time periods in unified logs | `log stats --file system_logs.logarchive` |
| TCC Database tampering | `~/Library/Application Support/com.apple.TCC/TCC.db` (privacy permissions) | `sqlite3` — check modification timestamps and permission grants |
| Time Machine | Backups contain historical file versions | `tmutil listbackups` (live), examine `/Volumes/<TM Volume>/Backups.backupdb/` |
| APFS Snapshots | `tmutil listlocalsnapshots /` (live) | `diskutil apfs listSnapshots <mountpoint>` |
| Firmware password | Check for EFI firmware password | `firmwarepasswd -check` (live) |

## Key Unified Log Predicates

The Apple Unified Log is the primary forensic source on modern macOS. Query with `log show`:

```
# All events in last hour
log show --last 1h

# Specific process
log show --predicate 'process == "sudo"'

# Specific subsystem
log show --predicate 'subsystem == "com.apple.ssh"' --last 24h

# Event type filter
log show --predicate 'eventType == logEvent' --info

# Process creation events
log show --predicate 'eventMessage contains "exec"' --info --last 24h

# Login/logout events
log show --predicate 'process == "loginwindow" OR process == "logind"'

# Network changes
log show --predicate 'subsystem == "com.apple.network"' --last 24h

# Gatekeeper/XProtect events
log show --predicate 'subsystem contains "XProtect" OR sender contains "Gatekeeper"' --last 7d

# File quarantine
log show --predicate 'process == "syspolicyd" OR process == "quarantine"' --last 24h

# Export to file for offline analysis
log show --predicate 'process == "bash" OR process == "zsh"' --style json --output logs.json
```

## Key Property List Files

Common `.plist` files to parse with `plutil -p` or `defaults read`:

| Plist | Content |
|---|---|
| `com.apple.loginwindow.plist` | Login hooks, auto-login user |
| `com.apple.dock.plist` | Persistent apps in Dock |
| `com.apple.finder.plist` | Finder preferences, sidebar items |
| `com.apple.systempreferences.plist` | System Preferences panes accessed |
| `com.apple.Terminal.plist` | Terminal settings, startup command |
| `com.apple.sidebarlists.plist` | Finder sidebar items (volumes, servers) |
| `com.apple.recentitems.plist` | Recent applications, documents, servers |
| `com.apple.LaunchServices.QuarantineEventsV2` | File download/creation quarantine records |

## Live Response — Order of Volatility (macOS)

When collecting from a live macOS system:
1. **Memory dump** — `macmemory`, `osxpmem`
2. **Unified log export** — `log collect --last 7d --output /tmp/logs.logarchive`
3. **Network state** — `netstat -an`, `lsof -i`, `arp -a`, `ndp -an` (IPv6)
4. **Running processes** — `ps auxwwf`, `lsof`
5. **Logged in users** — `w`, `who`, `last`
6. **System extensions / kexts** — `kextstat`, `systemextensionsctl list`
7. **Disk image** — `dc3dd` (may require booting from external media or Recovery Mode for system disk)
