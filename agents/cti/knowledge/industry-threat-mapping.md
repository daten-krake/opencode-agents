# Industry / Sector → Threat Actor Mapping

Maps customer industry/sector to threat actors that historically target it. Use this to go from "customer is a German manufacturer using O365 + Azure + on-prem AD" to "which threat actors target this profile?"

Each industry entry lists: primary nation-state actors (espionage), financially-motivated actors (crime/ransomware), and the **why** — what these actors want from this industry (IP, PII, financial data, disruption, supply chain pivot).

**Always cross-reference with `apt-groups.md` for full TTP details and `campaign-tracking.md` for current activity.** This mapping is historical targeting — recency must be verified.

---

## Manufacturing

**Nation-state (espionage / IP theft):**
- **APT41** — IP theft from manufacturing supply chain; targets component designs, production processes
- **APT28** — industrial espionage against Western manufacturers; defense-adjacent manufacturing
- **Mustang Panda** — European manufacturing targets, especially automotive/industrial equipment
- **Turla** — defense manufacturing and aerospace components
- **APT40** — naval/maritime manufacturing

**Ransomware (financial):**
- **LockBit** — #1 manufacturing target globally; exploits exposed Citrix, FortiOS, RDP
- **BlackCat/ALPHV** — manufacturing OT/IT convergence targets; affiliate with Scattered Spider for initial access
- **Black Basta** — manufacturing via QakBot phishing; double extortion
- **Akira** — manufacturing via Cisco VPN exploitation
- **Play** — manufacturing via FortiOS and Exchange exploitation
- **Royal/BlackSuit** — manufacturing via phishing and exposed services

**Why:** IP theft (designs, formulas, processes), supply chain pivot (compromised manufacturer → downstream customers), OT disruption (production line downtime = revenue loss), financial extortion (high willingness to pay for production data recovery).

**Common TTPs to prioritize:** T1190 (exploit public-facing apps — VPN, Citrix, FortiOS), T1566 (phishing), T1003.001 (LSASS dump), T1486 (encrypt for impact), T0816/T0817 (OT-specific if ICS/SCADA present).

---

## Healthcare

**Nation-state (espionage / research):**
- **APT29** — vaccine and biomedical research theft; hospital networks as espionage targets
- **APT35** — healthcare policy research, biomedicine, COVID-19 research
- **APT41** — biomedical IP theft
- **Lazarus Group** — biomedical research, pharmaceutical IP (COVID vaccine)
- **Kimsuky** — healthcare policy and research institutions

**Ransomware (financial):**
- **LockBit** — hospitals, clinics, health insurance; high willingness to pay due to patient safety
- **BlackCat/ALPHV** — hospital networks; patient care disruption forces payment
- **Black Basta** — healthcare systems, regional hospital networks
- **Akira** — healthcare systems
- **Rhysida** — healthcare targets explicitly; double extortion
- **Medusa** — healthcare and hospital networks
- **Qilin** — London hospitals (Synnovis breach 2024); NHS supplier targeting

**Why:** Patient data (PHI/PII — high black-market value), biomedical research IP (vaccine formulas, drug trials, clinical data), disruption leverage (patient safety forces payment), insurance fraud enablers, supply chain pivot (hospital → connected clinics, pharmacies, labs).

**Common TTPs to prioritize:** T1566 (phishing — most common initial access), T1190 (exploit public-facing apps — patient portals, exposed RDP), T1078 (valid accounts — stolen credentials from info-stealers), T1003.001 (LSASS dump), T1486 (encrypt for impact), T1567 (exfiltration over web service — double extortion), T1490 (inhibit system recovery — backup destruction).

---

## Financial Services (Banking, Insurance, Investment)

**Nation-state (espionage / disruptive):**
- **APT38 / Lazarus** — SWIFT heists, bank network intrusion, central bank targeting
- **APT33** — financial sector as disruptive target
- **APT34** — Middle East financial institutions
- **APT41** — financial sector IP + access to trading systems
- **APT35** — financial policy and think tanks adjacent to banking
- **MuddyWater** — Middle East financial institutions

**Financially-motivated (crime):**
- **FIN4** — insider credential theft for market-moving information
- **FIN6** — POS systems for card data
- **FIN7** — restaurants, hospitality (food/bev) for card data
- **FIN8** — healthcare-adjacent financial operations
- **FIN11 / TA505** — Clop operator; financial extortion via data theft
- **FIN13** — Mexican financial institutions
- **LockBit** — banks, insurance, investment firms
- **BlackCat/ALPHV** — financial sector; high-profile bank and insurance targets
- **Black Basta** — financial sector
- **Scattered Spider** — social engineering against bank helpdesks; SIM swaps, MFA fatigue; targets financial institutions for cash-out

**Why:** Direct financial theft (SWIFT, ATM, trading system access), card data (POS), customer data (PII for fraud), market-moving information (insider trading), disruption (payment systems, clearing houses), insurance claim fraud.

**Common TTPs to prioritize:** T1566 (phishing — whaling, BEC), T1190 (exploit public-facing apps — online banking, mobile banking APIs), T1078 (valid accounts — privileged banking roles), T1098 (account manipulation — creation of fraudulent accounts for cash-out), T1003 (credential dumping), T1539 (steal session cookie — session hijacking of banking portals), T1621 (MFA fatigue), T1556.006 (multi-factor authentication — bypass/manipulation).

---

## Government / Public Sector

**Nation-state (espionage / disruptive):**
- **APT28** — foreign ministries, defense ministries, political organizations (NATO members)
- **APT29** — foreign ministries, diplomatic networks, government cloud (O365/Azure)
- **Sandworm / APT44** — destructive attacks on government infrastructure
- **APT32** — Southeast Asian government and diaspora
- **APT35** — government policy, think tanks, diplomatic
- **Mustang Panda** — European government entities; USB worm propagation
- **Kimsuky** — government, diplomacy, nuclear policy
- **Gamaredon** — Ukrainian government (near-exclusive)
- **Turla** — diplomatic networks, foreign ministries
- **MuddyWater** — Middle East government

**Ransomware:**
- **LockBit** — local/municipal governments; underfunded IT = easy target
- **BlackCat/ALPHV** — government agencies
- **Play** — government networks via FortiOS
- **Royal/BlackSuit** — government

**Why:** Classified/diplomatic information, policy positions, intelligence collection, diplomatic cables, citizen data (PII/PHI databases), disruption of government services, influence operations, supply chain pivot (government contractor → classified networks).

**Common TTPs to prioritize:** T1566 (phishing — all variants, especially credential harvesting via fake login portals), T1190 (exploit public-facing apps — government portals, web apps), T1078 (valid accounts — compromised official accounts), T1110.003 (password spray — O365/Entra ID), T1098.003 (consent grant abuse — Entra ID), T1528 (steal application session token — OAuth), T1071 (application layer protocol — C2), T1486/T1485 (destructive impact — Sandworm-style).

---

## Energy / Utilities / Critical Infrastructure

**Nation-state (espionage / disruptive):**
- **Sandworm / APT44** — Ukraine power grid (Industroyer/CrashOverride), destructive OT attacks
- **APT33** — energy (petrochemical, oil/gas), Shamoon wiper
- **APT29** — energy sector espionage
- **APT41** — energy sector IP + access to OT networks
- **Turla** — energy sector (historic — Dragonfly/Energetic Bear overlaps)
- **Dragonfly / Energetic Bear (Berserk Bear / Crounch Yeti / Iron Liberty)** — energy sector, Europe and North America; ICS targeting

**Ransomware (OT-aware):**
- **LockBit** — energy companies
- **BlackCat/ALPHV** — Colonial Pipeline-adjacent targets; OT-aware affiliates
- **Black Basta** — energy utilities

**Why:** Disruption of power/gas/water (population impact, economic damage), OT/ICS access (rare and valuable), energy market intelligence, supply chain pivot (energy → all downstream industries), geopolitical leverage.

**Common TTPs to prioritize:** T1190 (exploit public-facing apps — SCADA, HMI exposed to internet), T0816/T0817 (OT-specific — device restart, device shutdown), T0890 (OT exploitation for control), T1486/T1485 (destructive impact — wipers, Industroyer), T1071 (C2 over ICS protocols), T0866 (exploitation of remote services — OT), T1003 (credential dumping for pivot to OT network).

---

## Technology / Software / SaaS

**Nation-state (espionage / supply chain):**
- **APT41** — tech sector supply chain compromise (Winnti); software vendor targeting for downstream access
- **APT29** — cloud service provider targeting (SolarWinds); SaaS supply chain
- **Lazarus Group** — crypto exchanges, blockchain companies; tech for financial theft
- **APT35** — SaaS abuse (OAuth consent grant), cloud service targeting
- **APT28** — tech sector for supply chain pivot

**Ransomware:**
- **LockBit** — SaaS companies, managed service providers (MSPs); supply chain pivot to customers
- **BlackCat/ALPHV** — SaaS companies
- **Scattered Spider** — SaaS and cloud companies; social engineering against helpdesk

**Why:** Source code theft, supply chain pivot (compromised SaaS → all customers), customer data (SaaS holds data for many tenants), API keys and credentials (cloud resource access), developer credentials (GitHub, GitLab, CI/CD pipeline access), crypto wallet theft (blockchain companies).

**Common TTPs to prioritize:** T1195 (supply chain compromise — software dependencies, CI/CD), T1078.004 (cloud accounts — SaaS tenant compromise), T1098.003 (additional cloud roles — OAuth consent grant), T1528 (steal application session token), T1552.001 (credentials in files — hardcoded secrets in repos), T1059.004 (Unix shell — CI/CD runners), T1071.001 (web protocols — API C2), T1213 (data from information repositories — SaaS data exfil).

---

## Retail / E-Commerce / Hospitality

**Financially-motivated (crime):**
- **FIN6** — POS systems for card data
- **FIN7** — restaurants, hospitality, food/bev
- **FIN8** — hospitality
- **LockBit** — retail chains
- **BlackCat/ALPHV** — retail
- **Black Basta** — retail
- **Scattered Spider** — hospitality (casino/hotel targeting; MGM Resorts, Caesars)

**Why:** Card data (POS — high black-market value), customer PII, loyalty program data, disruption (holiday shopping season = high willingness to pay), gift card fraud, refund fraud.

**Common TTPs to prioritize:** T1190 (exploit public-facing apps — e-commerce platforms, payment gateways), T1566 (phishing), T1078 (valid accounts — admin accounts on POS/e-commerce platforms), T1003 (credential dumping), T1486 (encrypt for impact), T1059 (command and scripting), T1105 (ingress tool transfer).

---

## Education / Research / Academia

**Nation-state (espionage):**
- **APT35** — academic institutions for policy research, biomedical, nuclear
- **Kimsuky** — think tanks, research institutes, nuclear policy
- **APT43** — think tanks, policy research
- **APT41** — university research, tech transfer
- **APT29** — university research (vaccine, biomedicine)
- **Lazarus Group** — cryptocurrency research, blockchain, academic credentials
- **MuddyWater** — academic and research institutions

**Ransomware:**
- **LockBit** — universities (underfunded IT, large attack surface)
- **BlackCat/ALPHV** — universities
- **Rhysida** — education sector explicitly
- **Medusa** — education

**Why:** Research data (IP — biotech, defense, energy), credential harvesting (academic credentials for pivot to government/industry partners), student PII, student loan fraud, crypto wallet theft (researchers in blockchain).

**Common TTPs to prioritize:** T1566 (phishing — academic lures, conference invitations), T1110.003 (password spray — weak university password policies), T1078 (valid accounts — student/staff), T1003 (credential dumping), T1539 (steal session cookie — SSO/SSO compromise), T1213 (data from information repositories — research databases).

---

## Defense / Aerospace / Military

**Nation-state (espionage):**
- **APT28** — defense ministries, military, defense contractors
- **APT29** — defense supply chain
- **APT41** — aerospace, defense manufacturing
- **APT33** — aerospace (espionage + disruptive)
- **Turla** — defense, diplomacy
- **Lazarus Group** — aerospace defense technology
- **Sandworm** — defense infrastructure disruption

**Why:** Classified defense information, weapons designs, military capabilities, supply chain pivot (defense contractor → classified programs), military dispositions, intelligence collection for geopolitical advantage.

**Common TTPs to prioritize:** T1566 (phishing — targeted, high-craft), T1190 (exploit public-facing apps — contractor portals), T1078 (valid accounts — cleared personnel), T1003 (credential dumping), T1213 (data from information repositories — classified networks), T1071 (C2 — covert channels), T1573 (encrypted channel — C2), T1105 (ingress tool transfer — stealthy).

---

## Legal / Professional Services

**Ransomware:**
- **LockBit** — law firms (client data = high leverage)
- **BlackCat/ALPHV** — law firms, accounting firms
- **Black Basta** — professional services
- **Play** — professional services
- **Royal/BlackSuit** — law firms

**Nation-state:**
- **APT41** — law firms for client intelligence
- **APT29** — law firms adjacent to government clients
- **FamousSparrow** — law firms

**Why:** Client confidential data (M&A, litigation, IP — high extortion leverage), attorney-client privileged communications, client financial data, client credentials (pivot to client networks).

**Common TTPs to prioritize:** T1566 (phishing), T1190 (exploit public-facing apps — document management systems), T1078 (valid accounts), T1003 (credential dumping), T1486 (encrypt for impact), T1567 (exfiltration over web service — client data theft).

---

## Telecommunications

**Nation-state (espionage):**
- **APT41** — telecom for surveillance and intelligence collection
- **APT28** — telecom for traffic interception
- **APT29** — telecom infrastructure
- **APT34** — Middle East telecom
- **Turla** — telecom for C2 infrastructure (satellite internet hijacking)

**Ransomware:**
- **LockBit** — telecom providers
- **BlackCat/ALPHV** — telecom

**Why:** Subscriber data (PII, call records), traffic interception (surveillance of targets), infrastructure access (pivot to government/enterprise customers served by telecom), BSS/OSS disruption (billing, service provisioning), 5G infrastructure access.

**Common TTPs to prioritize:** T1190 (exploit public-facing apps — BSS/OSS portals), T1078 (valid accounts — admin on telecom infrastructure), T1003 (credential dumping), T1556 (modify auth process — for subscriber impersonation), T1486 (encrypt for impact), T1499 (endpoint DoS — service disruption).

---

## Media / Journalism / Publishing

**Nation-state (espionage / influence):**
- **APT28** — media organizations for narrative monitoring
- **APT29** — media adjacent to government
- **Lazarus Group** — Sony Pictures hack (2014)
- **APT33** — media (disruptive)
- **APT35** — media for influence operations and narrative monitoring

**Ransomware:**
- **LockBit** — publishing, media companies

**Why:** Source identities (journalists' sources), unpublished stories (pre-publication intelligence), narrative monitoring (influence operations), subscriber data (PII), disruption (censorship via ransomware).

**Common TTPs to prioritize:** T1566 (phishing — journalist lures, fake source contact), T1078 (valid accounts — journalist/CMO accounts), T1003 (credential dumping), T1539 (steal session cookie — CMS session hijacking), T1486 (encrypt for impact).

---

## NGO / Non-Profit / International Organizations

**Nation-state (espionage):**
- **Mustang Panda** — NGOs (religious, human rights, Tibet/Uyghur-adjacent)
- **APT32** — NGOs critical of Vietnamese government, diaspora
- **APT35** — NGOs and human rights organizations
- **Kimsuky** — NGOs adjacent to North Korea policy
- **Gamaredon** — Ukrainian NGOs

**Ransomware:**
- **LockBit** — NGOs (underfunded IT)
- **Rhysida** — NGOs

**Why:** Donor lists (intelligence on who funds what), beneficiary data (dissidents, refugees), internal communications (strategy, advocacy plans), disruption of advocacy work, influence operations.

**Common TTPs to prioritize:** T1566 (phishing — impersonation of beneficiaries, donors, partner organizations), T1078 (valid accounts — staff accounts with weak security), T1110 (brute force — weak password policies), T1003 (credential dumping), T1486 (encrypt for impact).

---

## Cryptocurrency / Blockchain / FinTech

**Nation-state:**
- **Lazarus Group** — crypto exchanges for direct theft (North Korea sanctions evasion); fake crypto companies as lures
- **APT43** — crypto for revenue generation (North Korea)
- **Kimsuky** — crypto research

**Financially-motivated:**
- **Scattered Spider** — crypto exchanges; social engineering
- **Various ransomware crews** — crypto for payment (all)

**Why:** Direct theft of cryptocurrency (North Korea — state-sanctioned theft for sanctions evasion), private keys (wallet access), exchange customer data, trading algorithms, DeFi smart contract exploits, crypto payment infrastructure (ransomware crews).

**Common TTPs to prioritize:** T1566 (phishing — fake crypto company job offers, investment lures), T1190 (exploit public-facing apps — exchange APIs, wallet services), T1078 (valid accounts — exchange admin), T1552.001 (credentials in files — private keys in code/configs), T1059.004 (Unix shell — smart contract exploitation), T1213 (data from information repositories — wallet seed phrases).

---

## Cross-Industry Notes

**Ransomware crews are opportunistic:** LockBit, BlackCat, Akira, Black Basta, Play target virtually any industry with weak exposure. The industry matters less than the exposure. If the customer has exposed RDP, exposed VPN, or leaked credentials, they are a target regardless of industry.

**Initial-access brokers (IABs):** Sell access to multiple ransomware crews. The same exposed-vulnerability compromise can be sold to LockBit, BlackCat, or Akira. Treat IAB-compromised access as a gateway to any ransomware crew.

**Supply chain is industry-agnostic:** Any customer that is a supplier to a larger organization is a supply chain pivot target. A small manufacturer supplying defense contractors is a target for APT28/APT41. A small SaaS serving banks is a target for Lazarus/APT29.

**Size matters:** Mid-size and small organizations are more likely targets of opportunity for ransomware crews (weaker security). Enterprise organizations are more likely targets for nation-state actors (specific IP, specific intelligence).

**Geography modulates industry:** A German manufacturer is a target for APT28 (Russia) and Mustang Panda (China). A Japanese manufacturer is a target for APT41 (China) and APT38/Lazarus (North Korea). A Middle Eastern energy company is a target for APT33 (Iran) and APT34 (Iran). Always cross-reference industry with geography.