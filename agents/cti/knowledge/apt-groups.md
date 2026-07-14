# APT Group Catalog

Reference catalog of tracked threat actor groups. Sourced from MITRE ATT&CK Groups (attack.mitre.org/groups), CISA advisories, and vendor threat intelligence reports. Use this as the lookup table when matching a customer's industry and geography to threat actors.

**Always verify current activity via live sources (see `threat-intel-sources.md`).** This catalog captures historical TTPs and targeting patterns — "currently active" status must be checked against recent advisories and reports during report generation.

## Nation-State — Russia

### APT28 (Fancy Bear / STRONTIUM / Sofacy / Forest Blizzard)
- **Origin:** Russia (GRU Unit 26165)
- **Target industries:** Government, defense, military, international organizations, think tanks, political organizations, energy, media
- **Target geographies:** NATO members, Eastern Europe, Ukraine, Georgia, Western Europe, North America
- **Initial access:** Spearphishing (T1566), credential harvesting, exploitation of public-facing apps (T1190), supply chain compromise (T1195)
- **Favored TTPs:** T1190 (exploitation of public apps), T1059.001 (PowerShell), T1059.003 (Windows Command Shell), T1003 (Credential Dumping), T1071 (Application Layer Protocol), T1566.001 (Spearphishing Attachment), T1078 (Valid Accounts), T1110 (Brute Force), T1555 (Credentials from Password Stores)
- **Associated malware:** X-Agent, Sofacy, X-Tunnel, Foozball, Zebrocy, Komplex, Goofy
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0007

### APT29 (Cozy Bear / NOBELIUM / Midnight Blizzard / The Dukes / Cloaked Ursa)
- **Origin:** Russia (SVR)
- **Target industries:** Government, foreign ministries, think tanks, healthcare (vaccine research), tech, cloud service providers, supply chain (SolarWinds), diplomatic organizations
- **Target geographies:** NATO members, Europe, North America, global (cloud-focused)
- **Initial access:** Spearphishing (T1566), supply chain compromise (T1195.002 — SolarWinds), password spray (T1110.003), consent grant abuse (T1098.003 via OAuth), token theft (T1528), exploitation of on-prem to cloud (T1078.004)
- **Favored TTPs:** T1195.002 (Compromise Software Supply Chain), T1098.003 (Additional Cloud Roles), T1528 (Steal Application Session Token), T1566 (Phishing), T1078.004 (Cloud Accounts), T1071.001 (Web Protocols), T1136.001 (Create Local Account), T1090 (Proxy), T1003 (Credential Dumping)
- **Associated malware:** SUNSPOT, SUNBURST, TEARDROP, GOLDMAX, EnvyScout, SmokeSeed, NativeZone, Bardomat
- **Notable:** SolarWinds supply chain attack (2020), Midnight Blizzard — Microsoft corporate email breach (2024), active and highly capable cloud-focused actor
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0016

### Sandworm (APT44 / IRIDIUM / Voodoo Bear / Seashell Blizzard)
- **Origin:** Russia (GRU Unit 74455)
- **Target industries:** Energy (power grid), government, defense, critical infrastructure, financial, media, transportation
- **Target geographies:** Ukraine, NATO members, Europe, North America
- **Initial access:** Spearphishing, exploitation of public-facing apps, supply chain compromise, credential theft
- **Favored TTPs:** T1486 (Data Encrypted for Impact — NotPetya, WhisperGate), T1485 (Data Destruction), T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1059.001 (PowerShell), T1543.003 (Windows Service), T1071 (Application Layer Protocol), T1498 (Network DoS), T0816 (Device Restart — OT)
- **Associated malware:** NotPetya, Industroyer/CrashOverride, WhisperGate, CaddyWiper, HermeticWiper, RagnarLocker, BlackEnergy
- **Notable:** NotPetya (2017), Ukraine power grid attacks (2015/2016), WhisperGate (2022), destructive and disruptive operations
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0034

### Gamaredon (Primitive Bear / Shuckworm / Actinium)
- **Origin:** Russia (FSB, operating from Crimea)
- **Target industries:** Government, military, defense, NGOs, media — almost exclusively Ukraine
- **Target geographies:** Ukraine (near-exclusive focus)
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1059.001 (PowerShell), T1547.001 (Registry Run Key), T1027 (Obfuscated Files), T1105 (Ingress Tool Transfer), T1071.001 (Web Protocols)
- **Associated malware:** Pterodo, Babyshark, MegaVaccine, CremCyclov
- **Notable:** High-volume, low-sophistication but persistent; targets Ukrainian organizations continuously
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0047

### Turla (Snake / Venomous Bear / KRYPTON / Secret Blizzard)
- **Origin:** Russia (FSB)
- **Target industries:** Government, diplomacy, defense, energy, education, research, media
- **Target geographies:** Central Asia, Eastern Europe, Western Europe, Middle East, global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1071.001 (Web Protocols), T1105 (Ingress Tool Transfer), T1059.001 (PowerShell), T1573 (Encrypted Channel), T1078 (Valid Accounts), T1027 (Obfuscated Files), T1505.003 (Web Shell)
- **Associated malware:** Snake (rootkit), Carbon, ComRAT, Kazuar, KopiLuwak, LightNeuron, Mosquito, Gazer
- **Notable:** Satellite internet hijacking for C2, Snake malware disclosure by NSA/FBI/CISA (2023)
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0010

## Nation-State — China

### APT41 (BARIUM / Double Dragon / Winnti / Wicked Panda)
- **Origin:** China (state-sponsored + financially motivated)
- **Target industries:** Gaming, tech, telecom, healthcare, media, manufacturing, supply chain, government, defense, education
- **Target geographies:** Global, with focus on Southeast Asia, East Asia, North America, Europe
- **Initial access:** Supply chain compromise (T1195), exploitation of public-facing apps (T1190), spearphishing (T1566), credential theft (T1003, T1552)
- **Favored TTPs:** T1195.002 (Compromise Software Supply Chain), T1195.001 (Compromise Software Dependencies), T1190 (Exploit Public-Facing Application), T1059.001 (PowerShell), T1003 (Credential Dumping), T1071.001 (Web Protocols), T1105 (Ingress Tool Transfer), T1572 (Non-Standard Port), T1505.003 (Web Shell), T1059.004 (Unix Shell)
- **Associated malware:** Winnti, PlugX, Cobalt Strike, ShadowPad, Spyder, Korplug, MSGMash, StealthyTray
- **Notable:** Dual mission — state espionage + financially motivated attacks (gaming industry, ransomware deployment). Supply chain attacks via software vendors. ShadowPad widely shared among Chinese actors.
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0096

### APT1 (Comment Crew / Comment Panda)
- **Origin:** China (PLA Unit 61398)
- **Target industries:** IT, aerospace, manufacturing, energy, telecom, media, government, defense
- **Target geographies:** Primarily North America, Europe, East Asia
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1059.001 (PowerShell), T1190 (Exploit Public-Facing Application), T1003 (Credential Dumping), T1505.003 (Web Shell), T1071.004 (DNS), T1105 (Ingress Tool Transfer)
- **Associated malware:** AURIGA, GETMAIL, MANDIANT, SEASALT, BISCUIT, HUCPACK, KURTO
- **Notable:** Mandiant APT1 report (2013), first public PLA attribution
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0006

### Mustang Panda (Bronze President / Earth Preta / Stately Taurus / Camaro Dragon / RedDelta)
- **Origin:** China
- **Target industries:** Government, NGOs, international organizations, think tanks, religious groups, telecom, education
- **Target geographies:** Europe, Southeast Asia, Asia-Pacific, Africa, South America
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link), T1204.002 (User Execution: File), T1059.001 (PowerShell), T1547.001 (Registry Run Key), T1105 (Ingress Tool Transfer), T1027 (Obfuscated Files), T1071.001 (Web Protocols), T1059.005 (Visual Basic)
- **Associated malware:** PlugX, Korplug, TONESHELL, PUBLOAD, Reaver, China Chopper, Covenant
- **Notable:** Heavily targets European government entities; USB-based worm propagation (T1091); active and prolific
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0129

### Earth Berberoka (Gambling Puppet / Poker Panda)
- **Origin:** China
- **Target industries:** Gambling, gaming, financial
- **Target geographies:** Southeast Asia, East Asia
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1190 (Exploit Public-Facing Application), T1059.005 (Visual Basic), T1505.003 (Web Shell), T1105 (Ingress Tool Transfer)
- **Associated malware:** SprySOCK, LinuxSpy
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G1025

### APT-C-36 (Blind Eagle)
- **Origin:** South America (Colombia-based)
- **Target industries:** Government, financial, energy, critical infrastructure
- **Target geographies:** South America (Colombia, Ecuador, Chile, Panama)
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1059.001 (PowerShell), T1059.005 (Visual Basic), T1547.001 (Registry Run Key), T1105 (Ingress Tool Transfer), T1071.001 (Web Protocols)
- **Associated malware:** PCHandler, QuasarRAT, AsyncRAT, NjRAT, LimeRAT
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0116

## Nation-State — Iran

### APT33 (Elfin / Refined Kitten / Peach Sandstorm)
- **Origin:** Iran
- **Target industries:** Aerospace, energy, petrochemical, aviation, defense, government
- **Target geographies:** United States, Saudi Arabia, South Korea, Israel, Europe
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link), T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1059.001 (PowerShell), T1003 (Credential Dumping), T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery), T1543.003 (Windows Service)
- **Associated malware:** Shamoon (disruptive wiper), PowPow, Poshspy, Drokbot, Aluminum, Friedex
- **Notable:** Shamoon destructive attacks against Saudi Aramco (2012), aviation sector targeting
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0064

### APT34 (OilRig / Helix Kitten / Peach Sandstorm)
- **Origin:** Iran
- **Target industries:** Financial, energy, government, telecom, healthcare, defense, aviation
- **Target geographies:** Middle East, United States, Europe, global
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1078 (Valid Accounts), T1190 (Exploit Public-Facing Application), T1059.001 (PowerShell), T1071.001 (Web Protocols), T1105 (Ingress Tool Transfer), T1003 (Credential Dumping), T1552.001 (Credentials in Files), T1098 (Account Manipulation)
- **Associated malware:** QUADAGENT, Karkoff, Glimpface, Poison Frog, Bond Upside, Foxman, ALMA Communicator
- **Notable:** Tool leak (2019) exposed their operational toolkit to the public, leading to widespread detection
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0049

### APT35 (Charming Kitten / Phosphorus / Mint Sandstorm)
- **Origin:** Iran (IRGC)
- **Target industries:** Government, academia, media, think tanks, defense, healthcare (policy), diplomatic, human rights, energy
- **Target geographies:** United States, Europe, Middle East, global
- **Initial access:** Spearphishing, password spray (T1110.003), credential harvesting via fake login portals, MFA fatigue (T1621)
- **Favored TTPs:** T1566.002 (Spearphishing Link), T1566.001 (Spearphishing Attachment), T1110.003 (Password Spraying), T1621 (Multi-Factor Authentication Request Generation), T1078 (Valid Accounts), T1059.001 (PowerShell), T1003 (Credential Dumping), T1098 (Account Manipulation), T1190 (Exploit Public-Facing Application)
- **Associated malware:** PowerStar, CharmPower, BellaCiao, PowerLess, CharmPower, Phineas Phisher tools, HYPERSTACK, Plankton, GORJOL
- **Notable:** Fake login portals for credential theft, MFA fatigue attacks, academic and think tank targeting, hybrid espionage + influence operations
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0059

### APT-C-35 / Tortoiseshell (Immortal Kitten)
- **Origin:** Iran
- **Target industries:** IT, government, defense, technology, engineering, financial, travel
- **Target geographies:** Middle East, global
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1059 (Command and Scripting Interpreter), T1505.003 (Web Shell), T1105 (Ingress Tool Transfer), T1003 (Credential Dumping), T1078 (Valid Accounts)
- **Associated malware:** CapraRAT, BellaCiao, GORJOL, Plankton
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0138

## Nation-State — North Korea

### Lazarus Group (APT38 / Hidden Cobra / Guardian of Peace / ZINC / Diamond Sleet / Kimsuky overlaps)
- **Origin:** North Korea
- **Target industries:** Financial (SWIFT heists), defense, aerospace, government, media, cryptocurrency, energy, telecom, tech, cryptocurrency exchanges
- **Target geographies:** Global, with focus on South Korea, Japan, United States, Europe, Southeast Asia
- **Favored TTPs:** T1566.002 (Spearphishing Link), T1566.001 (Spearphishing Attachment), T1190 (Exploit Public-Facing Application), T1204 (User Execution), T1059 (Command and Scripting), T1003 (Credential Dumping), T1071 (Application Layer Protocol), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service), T1078 (Valid Accounts)
- **Associated malware:** AppleJeus, RATANKBA, Manuscrypt, Wassonry, BLINDINGCAN, MISTPEN, DROPDATE, ZetaNile
- **Notable:** Sony Pictures hack (2014), Bangladesh Bank SWIFT heist (2016), WannaCry (2017), cryptocurrency exchange targeting, blockchain job lures, fake cryptocurrency companies
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0032

### Kimsuky (Thallium / Velvet Chollima)
- **Origin:** North Korea
- **Target industries:** Government, academia (think tanks, research institutes), diplomacy, defense, nuclear policy, media
- **Target geographies:** South Korea, Japan, United States, Europe
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link), T1110 (Brute Force), T1078 (Valid Accounts), T1059.001 (PowerShell), T1003 (Credential Dumping), T1119 (Automated Collection), T1567 (Exfiltration Over Web Service)
- **Associated malware:** BabyShark, ApplessAlpha, GOLDMALLET, FlowerPower, GREASE, SmokeScreen
- **Notable:** Academic and policy-focused espionage; impersonates journalists, researchers, government officials
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0094

### APT43 (Springtail / Kimsuky overlap)
- **Origin:** North Korea
- **Target industries:** Think tanks, policy research, academic, government, NGOs
- **Favored TTPs:** T1566.002 (Spearphishing Link), T1110.002 (Password Cracking), T1078 (Valid Accounts), T1059 (Command and Scripting), T1539 (Steal Session Cookie), T1003 (Credential Dumping)
- **Associated malware:** BabyShark, Konni, pbeb
- **Notable:** Social engineering via fake research sites and think tank impersonation
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G1022

## Nation-State — Other

### APT32 (OceanLotus / SeaLotus / Canvas Cyclone / ElastedPanda)
- **Origin:** Vietnam
- **Target industries:** Government, media, NGOs, dissident groups, manufacturing, hospitality, consumer goods
- **Target geographies:** Southeast Asia (Vietnam, Philippines, Laos, Cambodia), global (dissident monitoring)
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link), T1190 (Exploit Public-Facing Application), T1059 (Command and Scripting), T1105 (Ingress Tool Transfer), T1505.003 (Web Shell), T1027 (Obfuscated Files), T1071.001 (Web Protocols), T1543.002 (Systemd Service)
- **Associated malware:** Denis, Backdoor.APT32.Denis, PHOREAL, RFS, SOUNDBITE, KOMPROGO
- **Notable:** Targets Vietnamese diaspora and Southeast Asian governments; macOS and Linux tooling alongside Windows
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0050

### Sidewinder (T-APT-04 / RattleSnake / HardyCAT)
- **Origin:** India (suspected)
- **Target industries:** Government, military, defense, diplomatic, energy, education
- **Target geographies:** Pakistan, China, Sri Lanka, Nepal, Afghanistan, South Asia
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1204.002 (User Execution: File), T1059.001 (PowerShell), T1071.001 (Web Protocols), T1105 (Ingress Tool Transfer), T1218 (System Binary Proxy Execution), T1547.001 (Registry Run Key)
- **Associated malware:** WarZone RAT, njRAT, ReverseTCP, CR8130, Prikormka
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0121

### MuddyWater (MERCURY / Seedworm / Static Kitten / Mango Sandstorm)
- **Origin:** Iran
- **Target industries:** Government, telecom, energy, defense, academia, financial, media, IT
- **Target geographies:** Middle East (Israel, Saudi Arabia, UAE, Jordan, Iraq), South Asia, global
- **Favored TTPs:** T1566 (Phishing), T1059.001 (PowerShell), T1059.005 (Visual Basic), T1547.001 (Registry Run Key), T1105 (Ingress Tool Transfer), T1071.001 (Web Protocols), T1003 (Credential Dumping), T1078 (Valid Accounts), T1490 (Inhibit System Recovery), T1486 (Data Encrypted for Impact)
- **Associated malware:** POWERSTATS, MuddyFork, PhonyCrow, STATICBOOST, Slough, Slang, Stocking, SHIMDAS
- **Notable:** Linked to Iranian intelligence; targets regional rivals; sometimes deploys ransomware as cover for espionage (Log4Shell exploitation)
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0069

### FamousSparrow (Sparrow / VORTEX)
- **Origin:** China (suspected)
- **Target industries:** Government, NGOs, hotels, law firms, international organizations, research, telecom
- **Target geographies:** Europe, Americas, Asia, Africa, Middle East
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1505.003 (Web Shell), T1059.003 (Windows Command Shell), T1547.001 (Registry Run Key), T1105 (Ingress Tool Transfer), T1071.001 (Web Protocols)
- **Associated malware:** DRAT, Sharpfly, Sparrow, Shimmer
- **Notable:** Targeted hotels — possibly for surveillance of guests; used in campaigns against global organizations
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0119

### Earth Berberoka (Gambling Puppet / Poker Panda)
- **Origin:** China
- **Target industries:** Gambling, gaming, financial
- **Target geographies:** Southeast Asia, East Asia
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1190 (Exploit Public-Facing Application), T1059.005 (Visual Basic), T1505.003 (Web Shell), T1105 (Ingress Tool Transfer)
- **Associated malware:** SprySOCK, LinuxSpy
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G1025

## Financially Motivated — Crime Groups

### FIN7 (Carbanak / ITG14 / ITM002 / Storm-0875)
- **Origin:** Russia / Eastern Europe
- **Target industries:** Restaurants, hospitality, retail, food/beverage, financial, healthcare
- **Target geographies:** United States, Europe, global
- **Initial access:** Spearphishing, drive-by compromise, exploitation of public-facing apps, credential theft
- **Favored TTPs:** T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link), T1204 (User Execution), T1059.001 (PowerShell), T1059.005 (Visual Basic), T1105 (Ingress Tool Transfer), T1003 (Credential Dumping), T1547.001 (Registry Run Key), T1547.009 (Authentication Agent), T1098 (Account Manipulation), T1486 (Data Encrypted for Impact)
- **Associated malware:** Carbanak, Vortigaunt, Sality, Rezul, Pilot, Plok, JIFPOWERM, VDROPSHIP, Anubis, ILOVEYOU
- **Notable:** High-volume, financially-motivated; targeted POS systems for card data; evolved into ransomware (REvil, Darkside, LockBit affiliations)
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0046

### FIN6
- **Origin:** Russia / Eastern Europe
- **Target industries:** Retail, e-commerce, financial, POS-targeted businesses
- **Target geographies:** United States, Europe
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1486 (Data Encrypted for Impact), T1105 (Ingress Tool Transfer), T1021 (Remote Services), T1071 (Application Layer Protocol)
- **Associated malware:** FrameworkPOS, Grabit, Vskimmer, Trinity, Rdasrv
- **Notable:** Compromised POS systems at major retailers (Home Depot, Staples); card data exfiltration via DNS
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0037

### FIN8
- **Origin:** Russia / Eastern Europe
- **Target industries:** Healthcare, hospitality, financial, retail
- **Target geographies:** United States, Europe
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1105 (Ingress Tool Transfer)
- **Associated malware:** PoSlurp, BADHATCH, SardonicRAT, KGH_FOLDER, AGNLAND, Shellsync, RTM
- **Notable:** POS-focused, evolved into broader intrusions; healthcare focus in recent activity
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0061

### FIN11
- **Origin:** Russia / Eastern Europe
- **Target industries:** Retail, healthcare, financial, manufacturing, logistics
- **Target geographies:** United States, Europe, global
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1486 (Data Encrypted for Impact), T1489 (Disk Wipe), T1657 (Financial Theft), T1059 (Command and Scripting), T1105 (Ingress Tool Transfer), T1071 (Application Layer Protocol), T1547 (Boot or Logon Autostart Execution)
- **Associated malware:** Clop (ransomware), BATLODER, JSLOW
- **Notable:** Clop operator; Accellion/GoAnywhere/MOVEit data-theft extortion campaigns
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0129

### FIN13
- **Origin:** Mexico (suspected)
- **Target industries:** Financial, retail, hospitality, manufacturing
- **Target geographies:** Mexico, Latin America
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1003 (Credential Dumping), T1059.003 (Windows Command Shell), T1547.001 (Registry Run Key), T1543.003 (Windows Service), T1105 (Ingress Tool Transfer), T1071 (Application Layer Protocol)
- **Associated malware:** Anubis (backdoor), Nettwin, VSK
- **Notable:** Focus on Mexican financial institutions
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0111

### FIN4
- **Origin:** Unclear
- **Target industries:** Pharmaceutical, healthcare, biotechnology, financial, investment, market research
- **Target geographies:** United States, global
- **Favored TTPs:** T1566 (Phishing), T1110 (Brute Force), T1078 (Valid Accounts), T1539 (Steal Session Cookie), T1552.001 (Credentials in Files), T1087 (Account Discovery), T1550 (Use Alternate Auth Material)
- **Notable:** Steals credentials via fake login portals; targets pharmaceutical and financial insiders for market-moving information
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0015

### TA505 (FIN11 overlaps / Hive0129 / Clop operator)
- **Origin:** Russia / Eastern Europe
- **Target industries:** Retail, financial, manufacturing, healthcare, education, hospitality
- **Target geographies:** Global
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1486 (Data Encrypted for Impact), T1059 (Command and Scripting), T1547 (Boot or Logon Autostart Execution), T1071 (Application Layer Protocol), T1105 (Ingress Tool Transfer), T1204 (User Execution)
- **Associated malware:** Clop, Dridex, Locky, Jaff, Bart, Necronis, FlawedAmmyy, ServHelper, DarkCrypt
- **Notable:** Operator of Clop; moved from spam-based ransomware to exploitation of managed file transfer (Accellion, GoAnywhere, MOVEit)
- **MITRE ATT&CK:** https://attack.mitre.org/groups/G0088

## Ransomware Crews (tracked as named groups)

### LockBit (LockBit Supp / Conti-derived)
- **Origin:** Russia (affiliate-based)
- **Target industries:** Manufacturing, healthcare, government, education, financial, retail, IT services, legal, construction, transportation
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application — Citrix, FortiOS, Exchange), T1566 (Phishing), T1078 (Valid Accounts), T1110 (Brute Force), T1059 (Command and Scripting), T1003 (Credential Dumping — LSASS via comsvcs.dll, procdump), T1547 (Boot or Logon Autostart Execution), T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery), T1567 (Exfiltration Over Web Service)
- **Associated malware:** LockBit 2.0/3.0/Black, StealBit (exfiltration tool)
- **Notable:** RaaS model; targeted Citrix Bleed (CVE-2023-4966), FortiOS CVEs; disrupted by Operation Cronos (2024) but resurfaced as LockBit 4.0

### BlackCat / ALPHV (Noberus / Scattered Spider overlap)
- **Origin:** Russia / Eastern Europe
- **Target industries:** Healthcare, government, education, manufacturing, financial, retail, energy, legal, oil/gas
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting — PowerShell, batch), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery), T1567 (Exfiltration Over Web Service), T1499 (Endpoint DoS), T1557 (Adversary-in-the-Middle)
- **Associated malware:** BlackCat/ALPHV (Rust-based), MimiKatz, Cobalt Strike, Rclone, MELOX, Impacket
- **Notable:** First major Rust-based ransomware; affiliate with Scattered Spider for initial access (social engineering); oil/gas sector (Colonial Pipeline-adjacent targets); FBI disrupted (2023) but resurfaced

### Akira
- **Origin:** Russia / Eastern Europe
- **Target industries:** Healthcare, education, manufacturing, financial, government, professional services, hospitality
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application — Cisco VPN), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service)
- **Associated malware:** Akira (C++/assembly-based), MegaSync, Rclone, Cobalt Strike, AnyDesk, Ngrok
- **Notable:** Targets Cisco VPN flaws (CVE-2023-20269, zero-days), leverages stolen credentials; smaller but active

### Black Basta
- **Origin:** Russia (former Conti members)
- **Target industries:** Healthcare, manufacturing, financial, government, education, retail, professional services, utilities
- **Target geographies:** Global, with US/UK/Europe focus
- **Favored TTPs:** T1566 (Phishing — Qakbot), T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service)
- **Associated malware:** QakBot/Qbot, Cobalt Strike, SystemBC, ProLock, Black Basta ransomware
- **Notable:** Conti successors; initial access via QakBot phishing; uses double extortion

### Play / PlayCrypt
- **Origin:** Unclear
- **Target industries:** Manufacturing, IT, government, finance, healthcare, logistics, legal
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application — FortiOS, Exchange ProxyShell), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1486 (Data Encrypted for Impact), T1490 (Inhibit System Recovery)
- **Associated malware:** PlayCrypt ransomware
- **Notable:** Targets FortiOS (CVE-2023-27997), RDP, Exchange; fileless techniques

### Royal / BlackSuit
- **Origin:** Unclear (suspected Conti affiliation)
- **Target industries:** Manufacturing, healthcare, government, education, financial, retail, IT, legal
- **Target geographies:** Global, US focus
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service), T1211 (Exploitation for Defense Evasion)
- **Associated malware:** Royal, BlackSuit (evolution), Cobalt Strike, PsExec
- **Notable:** Partial C/C++ ransomware; rebranded as BlackSuit

### Qilin (Agenda)
- **Origin:** Russia (suspected)
- **Target industries:** Healthcare, manufacturing, government, financial, education, IT, retail
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service)
- **Associated malware:** Qilin/Agenda (Rust/Go-based), Cobalt Strike
- **Notable:** RaaS; targeted London hospitals (2023) — Synnovis breach; Rust/Go variants for cross-platform

### Medusa
- **Origin:** Unclear
- **Target industries:** Healthcare, education, manufacturing, government, financial, IT
- **Target geographies:** Global
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1059 (Command and Scripting), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service), T1490 (Inhibit System Recovery)
- **Associated malware:** Medusa, MedusaLocker
- **Notable:** RaaS with data leak site; public extortion

### BianLian
- **Origin:** Unclear
- **Target industries:** Healthcare, manufacturing, government, financial, education, legal, professional services
- **Target geographies:** Global
- **Favored TTPs:** T1190 (Exploit Public-Facing Application — Exchange, ProxyShell), T1078 (Valid Accounts), T1059 (Command and Scripting), T1003 (Credential Dumping), T1547 (Boot or Logon Autostart Execution), T1567 (Exfiltration Over Web Service)
- **Associated malware:** BianLian (Go-based backdoor), Impacket, Cobalt Strike
- **Notable:** Originally encrypting ransomware; pivoted to pure extortion (no encryption) after Avast released free decryptor

### Rhysida
- **Origin:** Unclear
- **Target industries:** Healthcare, education, government, manufacturing, energy, media
- **Target geographies:** Global, Middle East focus
- **Favored TTPs:** T1566 (Phishing), T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts), T1059 (Command and Scripting), T1486 (Data Encrypted for Impact), T1567 (Exfiltration Over Web Service)
- **Associated malware:** Rhysida (C++-based), Cobalt Strike, PowerShell
- **Notable:** Targets healthcare and education; double extortion

## Hacktivist

### Anonymous Sudan
- **Origin:** Sudan / unclear
- **Target industries:** Government, financial, telecom, critical infrastructure, religious organizations
- **Target geographies:** Western Europe, Israel, Nordic countries, global
- **Favored TTPs:** T1498 (Network Denial of Service), T1499 (Endpoint Denial of Service), T1566 (Phishing), T1078 (Valid Accounts), T1059 (Command and Scripting), T1190 (Exploit Public-Facing Application)
- **Associated malware:** SkidBot, generic DDoS tools
- **Notable:** DDoS-focused; claimed attacks on Scandinavian Airlines, Israeli government; possible Russian-aligned

### Killnet
- **Origin:** Russia / pro-Russian
- **Target industries:** Government, critical infrastructure, transportation, financial, media
- **Target geographies:** Ukraine, NATO members, Europe, United States
- **Favored TTPs:** T1498 (Network Denial of Service), T1499 (Endpoint Denial of Service)
- **Associated malware:** Generic DDoS botnets
- **Notable:** Pro-Russian hacktivist DDoS group; targets Ukraine-supporting countries

## Tracking Notes

**Key considerations when using this catalog:**
- Groups overlap: APT29/NOBELIUM/Midnight Blizzard are the same actor. FIN11/TA505 share Clop. Conti fragmented into multiple crews (Royal/BlackSuit, Black Basta, Akira). Check aliases.
- Groups evolve: ransomware crews frequently rebrand or split. Check recent advisories for current names.
- Groups share TTPs: multiple Chinese actors use PlugX and ShadowPad. Multiple ransomware crews use Cobalt Strike + comsvcs.dll for LSASS. Shared TTPs mean detection coverage overlaps.
- Groups share infrastructure: affiliate-based RaaS means initial-access brokers (IABs) sell to multiple crews. The same initial access vector (e.g., exposed VPN) can lead to LockBit, BlackCat, Akira, etc.
- "Currently active" must be verified against live sources — this catalog captures historical targeting, not real-time activity.

**For current activity, check during report generation:**
- CISA advisories: https://www.cisa.gov/news-events/cybersecurity-advisories
- MSTIC blog: https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/
- Mandiant blog: https://www.mandiant.com/resources/blog
- See `threat-intel-sources.md` for the full source list.