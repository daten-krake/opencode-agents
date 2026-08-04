# Linux Forensic Artifacts

## Evidence of User Activity

| Artifact | Location | Tool |
|---|---|---|
| Bash History | `~/.bash_history` | `cat`, `strings` (may be cleared, check memory) |
| Zsh History | `~/.zsh_history` | Same |
| MySQL History | `~/.mysql_history` | `cat` |
| PSQL History | `~/.psql_history` | `cat` |
| Python REPL History | `~/.python_history` | `cat` |
| Vim/Nano History | `~/.viminfo`, `~/.vimrc`, `/etc/vim/vimrc` | `cat` |
| Lastlog | `/var/log/lastlog` | `lastlog` |
| wtmp (login history) | `/var/log/wtmp` | `last -f /var/log/wtmp`, `utmpdump` |
| btmp (bad logins) | `/var/log/btmp` | `lastb -f /var/log/btmp`, `utmpdump` |
| Uptime records | `/var/log/wtmp` (reboots), `uptime`, `/proc/uptime` | `last reboot` |
| Login records | `/var/run/utmp`, `/var/log/wtmp` | `w`, `who`, `who -a`, `last` |
| Sudo usage | `/var/log/auth.log`, `/var/log/secure` | `grep sudo` |
| SU attempts | `/var/log/auth.log` | `grep "su:"` |
| SSH login attempts | `/var/log/auth.log` | `grep "sshd"` |
| Failed passwords | `/var/log/auth.log` | `grep "Failed password"`, `grep "authentication failure"` |

## Evidence of Program Execution

| Artifact | Location | Tool |
|---|---|---|
| Process accounting (pacct) | `/var/account/pacct`, `/var/log/account/pacct` | `lastcomm`, `dump-acct`, `sa` |
| Auditd EXECVE | `/var/log/audit/audit.log` | `ausearch -sc execve -i` |
| journald | Run `journalctl` from mounted image or examine `/var/log/journal/` | `journalctl --file=system.journal | grep COMM` |
| `/proc` filesystem | `/proc/<pid>/cmdline`, `/proc/<pid>/exe`, `/proc/<pid>/cwd`, `/proc/<pid>/environ` | Only from live system or memory dump |
| Core dumps | `/var/lib/systemd/coredump/`, `/var/crash/`, `/tmp/`, process cwd | `coredumpctl`, `strings`, `gdb` |
| `/tmp` & `/dev/shm` | Temporary files, scripts, binaries dropped by attackers | `file`, `strings`, `stat` for timestamps |
| Application Logs | `/var/log/apache2/`, `/var/log/nginx/`, `/var/log/mysql/`, `/var/log/postgresql/` | Application-specific log parsing |
| systemd journal | `/var/log/journal/<machine-id>/` | `journalctl --file=...` |
| Syslog | `/var/log/syslog`, `/var/log/messages` | `grep` for process strings |
| Kernel Ring Buffer | `dmesg` (live), `/var/log/dmesg`, `/var/log/kern.log` | `dmesg`, `cat` |

## Evidence of Persistence

| Artifact | Location | Tool |
|---|---|---|
| Cron jobs | `/etc/crontab`, `/var/spool/cron/crontabs/<user>`, `/etc/cron.d/`, `/etc/cron.hourly/`, `/etc/cron.daily/`, `/etc/cron.weekly/`, `/etc/cron.monthly/` | Audit all cron files; check file creation timestamps |
| systemd services | `/etc/systemd/system/`, `/lib/systemd/system/`, `~/.config/systemd/user/` | `systemctl list-unit-files` (live), manual `.service` file inspection |
| systemd timers | `/etc/systemd/system/*.timer`, `/lib/systemd/system/*.timer` | Same as services |
| Shell configs | `~/.bashrc`, `~/.bash_profile`, `~/.profile`, `~/.zshrc`, `/etc/profile`, `/etc/bash.bashrc` | Check for appended commands, aliases, sourced scripts |
| SSH authorized keys | `~/.ssh/authorized_keys`, `~/.ssh/authorized_keys2`, `/etc/ssh/authorized_keys` | Check for unexpected keys, check key file timestamps |
| SSH config | `~/.ssh/config`, `/etc/ssh/ssh_config`, `/etc/ssh/sshd_config` | Check for ProxyCommand, RemoteForward, PermitRootLogin |
| LD_PRELOAD | `/etc/ld.so.preload` | Check for suspicious libraries |
| Kernel modules | `/etc/modules`, `/etc/modules-load.d/`, `/lib/modules/<kernel>/` | `lsmod` (live), check module timestamps and hashes |
| rc.local | `/etc/rc.local`, `/etc/init.d/` (SysV init scripts) | Check for appended commands or scripts |
| XDG Autostart | `~/.config/autostart/`, `/etc/xdg/autostart/` (`.desktop` files) | Manual inspection of `.desktop` files |
| MOTD / Issue | `/etc/update-motd.d/`, `/etc/issue`, `/etc/motd` | Check for modifications |
| at jobs | `/var/spool/cron/atjobs/`, `/var/spool/at/` | `atq` (live), manual file inspection |

## Evidence of Network Activity

| Artifact | Location | Tool |
|---|---|---|
| ARP Table | `/proc/net/arp` (live), ARP entries in memory dump | `arp -a` (live), Volatility |
| Routing Table | `/proc/net/route`, `/proc/net/ipv6_route` | `route -n`, `ip route` |
| TCP/UDP Connections | `/proc/net/tcp`, `/proc/net/tcp6`, `/proc/net/udp`, `/proc/net/udp6` | `ss -tulnp`, `netstat -tulnp` |
| DNS Config | `/etc/resolv.conf`, `/etc/hosts`, `/etc/nsswitch.conf` | Check for modified entries, rogue DNS servers |
| Network Interfaces | `/etc/network/interfaces`, `/etc/sysconfig/network-scripts/`, `/etc/netplan/` | Check for unexpected interfaces, promiscuous mode |
| iptables Rules | `/etc/iptables/`, `iptables-save` output | `iptables -L -n -v` (live) |
| nftables Rules | `/etc/nftables.conf`, `/etc/nftables/` | `nft list ruleset` (live) |
| SSH known_hosts | `~/.ssh/known_hosts`, `/etc/ssh/ssh_known_hosts` | Shows hosts the user/system has connected to |
| Host Firewall Logs | `/var/log/ufw.log`, `/var/log/firewalld` | `grep` for DROP/REJECT, unusual outbound attempts |
| Netflow / IPFIX | `/var/log/flow/` (if nfdump/nfcapd) | `nfdump` |
| TCP wrappers | `/etc/hosts.allow`, `/etc/hosts.deny` | Check for backdoor entries |
| Pcap files | Look for `.pcap`, `.pcapng`, `.cap` anywhere on disk | Unusual location? Exfiltration prep? |

## Evidence of File & Data Access

| Artifact | Location | Tool |
|---|---|---|
| Recently accessed files | `find /home -type f -atime -7` (access time, 7 days) | `find` with `-atime`, `-mtime`, `-ctime` |
| File timestamps | All files | `stat file`, `debugfs -R "stat <inode>" /dev/sdX` (bypass filesystem caching of atime if noatime is mounted) |
| inotify / fanotify | Auditd logs if configured | `ausearch -sc open` |
| FUSE mounts | `/proc/mounts`, `/etc/fstab` | Check for unexpected FUSE mounts (encfs, sshfs, rclone) |
| Encrypted volumes | `cryptsetup luksDump /dev/sdX`, `/etc/crypttab` | Identify encrypted volumes, attempt LUKS header extraction |
| Symbolic links | Symlinks pointing to sensitive data, attacker data staging | `find / -type l -ls` |
| `locate` db | `/var/lib/mlocate/mlocate.db`, `/var/lib/plocate/` | `locate` on mounted image (may reveal filenames from deleted files if db was updated before deletion) |
| Deleted files | `/proc/<pid>/fd/<n>` (deleted), `debugfs` + `lsdel` on ext filesystems | Sleuth Kit `fls` with `-d` flag |

## Evidence of System Changes

| Artifact | Location | Tool |
|---|---|---|
| Package installs (Debian) | `/var/log/dpkg.log`, `/var/log/apt/history.log`, `/var/log/apt/term.log` | `grep "install "` |
| Package installs (RHEL) | `/var/log/yum.log`, `/var/log/dnf.log`, `/var/log/dnf.rpm.log` | `grep "Installed"` |
| System time changes | `date` + clock drift, `/var/log/syslog` for NTP sync events | Timeline gaps, abnormal file timestamps |
| Kernel version | `/proc/version`, `/boot/`, `uname -a` | Verify expected kernel version and modules |
| LSM status | `/sys/kernel/security/` | Check if SELinux/AppArmor is enforcing or permissive |
| SELinux audit | `/var/log/audit/audit.log` with AVC denials | `ausearch -m avc -ts recent` |
| AppArmor | `/var/log/syslog`, `/var/log/kern.log` for apparmor messages | `apparmor_status` (live) |
| GRUB config | `/boot/grub/grub.cfg`, `/etc/default/grub` | Check for kernel command line modifications |
| SSH host keys | `/etc/ssh/ssh_host_*` | Modified host keys = potential MITM |

## Evidence of Data Staging & Exfiltration

| Artifact | Location | Tool |
|---|---|---|
| Archive files | `*.tar`, `*.tar.gz`, `*.tgz`, `*.zip`, `*.7z`, `*.rar`, `*.bz2` | Check file creation timestamps, file lists inside archives |
| Large directories | `/tmp/`, `/dev/shm/`, `/var/tmp/`, `/home/<user>/` | `du -sh /tmp/*` for unusually large dirs |
| Web server upload dirs | `/var/www/html/uploads/`, `/tmp/` | Check for webshells and data staged for exfiltration |
| Cloud sync | `rclone`, `aws-cli`, `gcloud`, `azcli` config files and execution logs | `~/.config/rclone/`, `~/.aws/`, bash history |
| FTP transfer logs | `/var/log/vsftpd.log`, `/var/log/proftpd/`, `~/.netrc` | Check for outbound FTP connections |
| Curl/Wget usage | Bash history | `grep -E "(curl|wget).*-o|--output"` |

## Anti-Forensic Indicators

| Signal | What to check |
|---|---|
| Cleared bash history | Empty or truncated `.bash_history` file, `HISTFILE` unset, `HISTSIZE=0`, `history -c` in bash history itself |
| Log tampering | Deleted/modified logs, truncated files, log entries out of sequence, missing log types for a period |
| Timestomping | Timestamps before the Unix epoch, futuristic dates, ctime vs mtime mismatch (touch -t), debugfs timestamp manipulation |
| Hidden processes | Processes visible in /proc but not in ps output (kernel-level hiding), LKM rootkits |
| Encrypted data | High-entropy files in `/tmp/` or user directories |
| Secure deletion | `shred`, `wipe`, `srm` in bash history; `blkls` + `strings` to find residual data in unallocated blocks |
| Modified time config | `timedatectl`, `/etc/localtime`, `/etc/timezone` changes around incident timeframe |

## Live Response — Order of Volatility

When collecting from a live Linux system, collect in this order:
1. **Memory dump** — `LiME` kernel module, `avml`, or `dd if=/dev/fmem` (if fmem loaded)
2. **Network state** — `ss -tulnp > netstate.txt`, `arp -a > arp.txt`, `ip route > routes.txt`, `/proc/net/*` copies
3. **Running processes** — `ps auxwwf > processes.txt`, `/proc/<pid>/cmdline` copies
4. **Logged in users** — `w`, `who`, `last`, `/var/run/utmp`
5. **Open files** — `lsof > openfiles.txt`, `/proc/<pid>/fd/` enumeration
6. **Kernel modules** — `lsmod > modules.txt`, `/proc/modules`
7. **Mounted filesystems** — `mount > mounts.txt`, `/proc/mounts`
8. **Disk image** — After volatile data, acquire image with `dc3dd`
