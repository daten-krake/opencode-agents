# Threat Intelligence Sources

Directory of authoritative threat intelligence sources. Use `webfetch` against these URLs during report generation to verify current activity and pull the latest threat landscape.

**Rules:**
- Always cite the source URL in the report. No source = no claim.
- Prefer primary sources (CISA, MSTIC, Mandiant) over secondary aggregation.
- Weight recency: a CISA advisory from last week beats a vendor blog from six months ago.
- Cross-reference: if one source claims a TTP, check if MITRE ATT&CK or another vendor corroborates.

---

## Government / National-CERT Advisories (Primary)

### CISA Cybersecurity Advisories
- **URL:** https://www.cisa.gov/news-events/cybersecurity-advisories
- **What it's good for:** Authoritative advisories on active campaigns, vulnerability exploitation, APT activity. CISA advisories are the US government's official statement that a threat is active. Often include IOCs, TTP mappings, and mitigation guidance.
- **Search:** Filter by "Alert", "Advisory", "Analysis Report" types. Use the site's search or webfetch the main page and scan recent entries.
- **Notable series:** AA (Analysis Alert), AA-suffixed joint advisories (with FBI/NSA/MS-ISAC), MAR (Malware Analysis Report).

### NSA Cybersecurity Advisories
- **URL:** https://www.nsa.gov/Press-Room/Cybersecurity-Advisories-Alerts/
- **What it's good for:** NSA-specific advisories on nation-state activity, often co-authored with CISA/FBI. Technical depth on exploitation techniques.
- **Notable:** Joint CISA-NSA-FBI advisories on APT actors (APT28, APT29, Sandworm, etc.)

### FBI Cyber Division / IC3
- **URL:** https://www.ic3.gov/ and https://www.fbi.gov/investigate/cyber
- **What it's good for:** Flash reports (private sector sharing), PINs (Private Industry Notifications), FBI-specific advisories. Often co-authored with CISA/NSA.

### NCSC (UK National Cyber Security Centre)
- **URL:** https://www.ncsc.gov.uk/section/keep-up-to-date/threat-reports
- **What it's good for:** UK-perspective advisories, often on Russia/China/Iran actors targeting UK organizations. Technical guidance on specific threats.

### BSI (German Federal Office for Information Security)
- **URL:** https://www.bsi.bund.de/EN/Service-Navi/Abonnements/Cyber-Security-Lage/cyber-security_lage_node.html (German language)
- **What it's good for:** German-perspective advisories, particularly on threats targeting German industry and critical infrastructure.

### JPCERT/CC (Japan)
- **URL:** https://www.jpcert.or.jp/english/
- **What it's good for:** Japan-perspective advisories, East Asia threat actors (APT41, APT28, Lazarus).

### ACSC (Australian Cyber Security Centre)
- **URL:** https://www.cyber.gov.au/about-us/advisories
- **What it's good for:** Australia-perspective advisories, Asia-Pacific threat actors.

---

## Vendor Threat Intelligence (Primary)

### Microsoft Threat Intelligence (MSTIC)
- **URL:** https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/
- **What it's good for:** MSTIC tracks all major actors with Microsoft-specific telemetry (O365, Azure, Windows, Defender). Authoritative on cloud/identity threats (APT29, APT35, Scattered Spider, DEV groups). MSTIC is the primary source for Microsoft ecosystem threats.
- **Notable:** "Microsoft Threat Intelligence" blog series, MSTIC threat actor encyclopedia (https://www.microsoft.com/en-us/security/business/security-insider/).

### Microsoft DCU (Digital Crimes Unit)
- **URL:** https://www.microsoft.com/en-us/security/blog/topic/digital-crimes-unit/
- **What it's good for:** Cybercrime tracking, botnet takedowns, tech support scam operations. Complements MSTIC's APT focus.

### Mandiant / Google Threat Intelligence
- **URL:** https://www.mandiant.com/resources/blog
- **What it's good for:** Mandiant is the gold standard for APT attribution and campaign analysis. Their APT1 report (2013) set the standard for public attribution. Strong on China (APT41/Winnti), Russia (APT28/29), and ransomware (FIN groups).
- **Notable:** UNC (Uncategorized) tracking — Mandiant assigns UNC IDs to emerging actors before formal attribution.

### CrowdStrike
- **URL:** https://www.crowdstrike.com/blog/
- **What it's good for:** CrowdStrike uses animal-themed actor names (BEAR = Russia, PANDA = China, KITTEN = Iran, SPIDER = eCrime, JACKAL = hacktivist). Their reports are authoritative on eCrime (SPIDER groups) and bear/panda tracking.
- **Notable:** Active Adversary Reports (quarterly), Global Threat Report (annual), CrowdStrike OverWatch reports.

### Red Canary
- **URL:** https://redcanary.com/blog/
- **What it's good for:** Red Canary's Quarterly Threat Reports are data-driven — based on their detection telemetry across customers. Excellent for "what's actually being detected in production environments right now" vs "what's being blogged about." Strong on ransomware, eCrime, and tradecraft trends.
- **Notable:** Year in Review report (annual), Quarterly Threat Report (quarterly).

### Recorded Future / Insikt Group
- **URL:** https://www.recordedfuture.com/research
- **What it's good for:** Insikt Group does geopolitical-informed threat intelligence — they connect cyber activity to geopolitical events (Russia-Ukraine, China-Taiwan, Iran-Middle East). Good for strategic threat landscape context.
- **Notable:** Insikt Group publications, Recorded Future Intelligence Cloud.

### Palo Alto Networks / Unit 42
- **URL:** https://unit42.paloaltonetworks.com/
- **What it's good for:** Unit 42 does deep technical analysis of malware and campaigns. Strong on China (APT41), Iran (APT34/35), and ransomware. Their malware reverse engineering is top-tier.
- **Notable:** Unit 42 Threat Report (annual), detailed malware analysis reports.

### Sophos X-Ops
- **URL:** https://www.sophos.com/en-us/security-advisories and https://news.sophos.com/en-us/
- **What it's good for:** Sophos X-Ops does deep investigation reports on ransomware crews (LockBit, BlackCat, Akira) and initial-access brokers. Strong on the operational details of ransomware-as-a-service operations.
- **Notable:** Active Adversary Playbooks, Sophos X-Ops investigations.

### Elastic Security Labs
- **URL:** https://www.elastic.co/security-labs
- **What it's good for:** Elastic Security Labs publishes research on APT activity, ransomware, and detection engineering. Their research is often paired with Elastic detection rules (see `detection-rule-repos.md`). Strong on detection methodology.
- **Notable:** Detection Engineering Behavior Maturity Model (DEBMM), research-to-rule pipeline.

### Cisco Talos
- **URL:** https://blog.talosintelligence.com/
- **What it's good for:** Cisco Talos covers malware, vulnerabilities, and threat actor activity. Strong on network-level threats, email security, and Cisco-specific exploitation (AnyConnect, ASA, Catalyst).
- **Notable:** Talos Year in Review, monthly threat roundups.

### SentinelLabs
- **URL:** https://www.sentinelone.com/labs/
- **What it's good for:** SentinelLabs does deep technical research on malware, APTs, and evasion techniques. Strong on kernel-level analysis, rootkits, and complex malware.

### Trend Micro Research
- **URL:** https://www.trendmicro.com/en_us/research.html
- **What it's good for:** Trend Micro covers APTs, ransomware, and regional threats. Strong on Asia-Pacific actors (China, North Korea, Southeast Asia).

### Kaspersky
- **URL:** https://securelist.com/
- **What it's good for:** Kaspersky's SecureList is technically deep, particularly on Russia-aligned actors, Stuxnet/Flame/duqu lineage, and complex malware. Note: some Western organizations restrict use of Kaspersky products/research due to geopolitical concerns — cross-reference with Western vendors.

### ESET Research
- **URL:** https://www.welivesecurity.com/
- **What it's good for:** ESET's WeLiveSecurity covers APTs, ransomware, and regional threats. Strong on Eastern European actors.

### Check Point Research
- **URL:** https://research.checkpoint.com/
- **What it's good for:** Check Point Research covers global threats, particularly Middle East, Asia-Pacific, and Africa. Strong on regional campaigns.

---

## MITRE ATT&CK (Authoritative Reference)

### MITRE ATT&CK Enterprise Matrix
- **URL:** https://attack.mitre.org/matrices/enterprise/
- **What it's good for:** The authoritative reference for tactics, techniques, and sub-techniques. Always cite MITRE for technique IDs and descriptions.

### MITRE ATT&CK Groups
- **URL:** https://attack.mitre.org/groups/
- **What it's good for:** The authoritative list of tracked APT groups. Each group page lists known aliases, target industries, TTPs, and associated malware. Always verify group attributions against this source.

### MITRE ATT&CK Software
- **URL:** https://attack.mitre.org/software/
- **What it's good for:** Reference for malware families, their associated groups, and the techniques they implement.

### MITRE ATT&CK Navigator
- **URL:** https://mitre-attack.github.io/attack-navigator/
- **What it's good for:** Visualizing technique coverage across the ATT&CK matrix. Useful for showing the detection_engineer what techniques a threat actor uses.

---

## Threat Intel Aggregators / Platforms

### AlienVault OTX (Open Threat Exchange)
- **URL:** https://otx.alienvault.com/
- **What it's good for:** Community-contributed threat intel pulses. Good for IOC enrichment and recent campaign indicators. Quality varies — verify before using.

### MISP (Malware Information Sharing Platform)
- **URL:** https://www.misp-project.org/
- **What it's good for:** Open-source threat intel sharing platform. Many ISACs and CERTs share via MISP. Not a source itself, but a distribution mechanism.

### VirusTotal
- **URL:** https://www.virustotal.com/
- **What it's good for:** File hash, domain, IP lookups. Community comments on samples often reference campaigns and TTPs. Note: requires API key for bulk lookups.

### ANY.RUN (Interactive Malware Sandbox)
- **URL:** https://any.run/
- **What it's good for:** Public malware sandbox submissions with TTP extraction. Good for verifying what a specific malware sample does.

### bazaar.abuse.ch (MalwareBazaar)
- **URL:** https://bazaar.abuse.ch/
- **What it's good for:** Malware sample repository. Good for finding samples associated with named campaigns.

### urlscan.io
- **URL:** https://urlscan.io/
- **What it's good for:** Public scan results of URLs — useful for OSINT on phishing infrastructure and C2.

### Shodan
- **URL:** https://www.shodan.io/
- **What it's good for:** Internet-connected device/service enumeration. See `osint-attack-surface.md` for usage in customer exposure research.

### Censys
- **URL:** https://search.censys.io/
- **What it's good for:** Internet-wide scanning data, certificate transparency, service enumeration. Complement to Shodan.

---

## Ransomware-Specific Sources

### Ransomwatch / Ransomlook
- **URL:** https://ransomwatch.telemetry.linuxpenguin.xyz/ and https://www.ransomlook.io/
- **What it's good for:** Tracking ransomware leak-site postings. Shows which crews are active, which industries they're hitting, and which organizations have been named on leak sites.

### NoMoreRansom
- **URL:** https://www.nomoreransom.org/
- **What it's good for:** Decryptor availability, ransomware family identification.

### CISA Stop Ransomware
- **URL:** https://www.cisa.gov/stopransomware
- **What it's good for:** CISA's ransomware-specific advisory hub. #StopRansomware advisories often include specific crew TTPs.

---

## Source Selection Rules

**For "currently active" verification:**
1. Check CISA advisories first (authoritative, US government)
2. Cross-reference with MSTIC (Microsoft ecosystem), Mandiant (APT attribution), CrowdStrike (eCrime)
3. Check ransomwatch/ransomlook for ransomware crew activity
4. Check vendor blogs for recent campaign reports

**For TTP attribution:**
1. MITRE ATT&CK Groups page is the authoritative reference
2. Cross-reference with vendor reports (Mandiant, MSTIC, CrowdStrike)
3. If only one vendor attributes a TTP, note "single-source attribution"

**For industry-specific threat landscape:**
1. Red Canary Quarterly Threat Report — what's being detected across industries
2. CISA advisories — official US government view
3. Vendor annual reports (CrowdStrike Global Threat Report, Mandiant M-Trends, Microsoft Digital Defense Report)
4. Industry-specific ISACs (FS-ISAC for finance, H-ISAC for healthcare, etc.)

**For ransomware:**
1. CISA #StopRansomware advisories
2. Ransomwatch/ransomlook for leak-site activity
3. Vendor investigations (Sophos X-Ops, Mandiant, CrowdStrike)

**For nation-state:**
1. CISA-NSA-FBI joint advisories
2. MSTIC reports
3. Mandiant reports
4. NCSC (UK) advisories
5. Vendor attribution reports (Cross-reference MITRE ATT&CK Groups)