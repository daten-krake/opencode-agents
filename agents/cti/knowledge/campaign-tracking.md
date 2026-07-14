# Campaign Tracking & Current Threat Landscape

Template for tracking ongoing campaigns and determining "what's active right now." Use this during report generation to weight recency — a TTP used in an active campaign last week scores higher than the same TTP used historically.

**Always verify current activity via live sources** (see `threat-intel-sources.md`). This document provides the methodology and rubric; the actual "current" threat landscape must be fetched during report generation.

---

## Recency Scoring Rubric

When scoring TTPs for the Prioritized TTP List, apply this recency weight:

| Activity Level | Evidence | Recency Weight |
|----------------|----------|----------------|
| **Actively campaigning** — named in CISA/NSA/FBI advisory in last 30 days | CISA advisory, joint government advisory, MSTIC blog with "active campaign" language | 1.0 |
| **Recently campaigning** — named in vendor report in last 90 days | MSTIC, Mandiant, CrowdStrike, Red Canary, Unit 42 blog post in last 90 days | 0.8 |
| **Active in last 12 months** — group active, TTP used, but no confirmed campaign in last 90 days | Group tracked in MITRE ATT&CK with recent activity; leak-site postings; vendor mentions in annual reports | 0.5 |
| **Historically active** — TTP attributed historically, no recent activity | MITRE ATT&CK historical attribution; old vendor reports | 0.3 |
| **Unknown / stale** — no attribution or attribution > 12 months old | Only training-data knowledge, no live source verification | 0.1 |

**Rules:**
- Always attempt to verify via live webfetch. Do not rely on training data for "current" activity.
- If you cannot verify recency via live sources, set weight to 0.1 and flag in "Gaps & Unknowns."
- Multiple sources corroborating recent activity → higher confidence in the recency weight.
- A single blog post mentioning a TTP does not equal "actively campaigning" — look for CISA advisories or multi-vendor corroboration for the highest weight.

---

## Campaign Tracking Template

During report generation, build a "Current Threat Landscape" section using this structure:

```
### Current Threat Landscape (last 90 days) — [Customer Profile]

#### Active Campaigns Relevant to This Profile
| Campaign / Actor | First Reported | Source | Relevance to Customer | Key TTPs |
|-------------------|---------------|--------|----------------------|----------|
| Midnight Blizzard — O365 consent grant abuse | 2026-04-15 | MSTIC blog, CISA AA26-107A | HIGH — customer uses O365 with permissive consent | T1098.003, T1528, T1078.004 |
| LockBit 4.0 resurgent | 2026-05-20 | CISA #StopRansomware, ransomwatch | HIGH — customer has exposed VPN (FortiOS) | T1190, T1078, T1486 |
| TeamPCP — LiteLLM supply chain | 2026-06-10 | SigmaHQ rules-emerging-threats/2026/TA/TeamPCP | MEDIUM — customer uses LiteLLM in AI infra | T1195.003 |

#### Recent CISA / NSA / FBI Advisories Matching Profile
| Advisory | Date | Actor / Threat | Matches Customer Because... |
|----------|------|----------------|------------------------------|
| AA26-107A — Midnight Blizzard O365 targeting | 2026-04-15 | APT29 / Midnight Blizzard | Customer uses O365 |
| #StopRansomware — LockBit 4.0 | 2026-05-20 | LockBit | Customer has exposed FortiOS VPN |

#### Recent Vendor Reports Matching Profile
| Report | Date | Source | Key Takeaway |
|--------|------|--------|--------------|
| "Midnight Blizzard cloud attacks" | 2026-04-15 | MSTIC | Consent grant abuse is the primary cloud initial access vector |
| Red Canary Q2 2026 Threat Report | 2026-07-01 | Red Canary | Ransomware via exposed VPN up 40% QoQ |

#### Ransomware Activity in This Sector
| Crew | Activity | Source | Targeting This Industry? |
|------|----------|--------|--------------------------|
| LockBit 4.0 | Resurgent after Cronos disruption | CISA, ransomwatch | YES — manufacturing #1 target |
| BlackCat/ALPHV | Active | ransomwatch | YES — manufacturing, healthcare |
| Akira | Active | Sophos X-Ops | YES — manufacturing via Cisco VPN |
```

---

## What "Active" Means

**Actively campaigning** — the group has:
- Published new IOCs (domains, IPs, hashes) in the last 30 days
- Been named in a CISA/NSA/FBI joint advisory in the last 30 days
- Dropped new malware variants (seen in vendor reports or sandbox submissions)
- Been attributed to a newly-disclosed breach
- Posted new victims on a ransomware leak site

**Recently active** — the group has:
- Been named in a vendor blog post in the last 90 days
- Had IOCs shared in threat intel communities (OTX, MISP) in the last 90 days
- Been attributed to campaigns disclosed in the last 90 days

**Active in last 12 months** — the group has:
- Been active (per above definitions) within the last 12 months
- No confirmed campaign in the last 90 days, but the group is known to be operational
- Historical TTPs remain relevant (the group hasn't disbanded or been disrupted)

**Historically active** — the group has:
- Used these TTPs historically (per MITRE ATT&CK)
- No recent activity (12+ months)
- May have been disrupted, disbanded, or gone quiet
- TTPs may still be relevant if the group resurges or if other actors adopt them

---

## Distinguishing Campaigns from Isolated Activity

Not every mention of a TTP equals a "campaign." Apply this filter:

**Campaign indicators (weight high):**
- Multiple victims in same industry/region within a short timeframe
- CISA/NSA/FBI advisory explicitly calling it a "campaign"
- Vendor report using "campaign" language with IOCs and TTP mapping
- Ransomware leak-site postings increasing for a specific crew

**Isolated activity indicators (weight lower):**
- Single incident mention in a vendor blog
- Sandbox submission without campaign context
- Historical attribution with no recent corroboration
- Training-data knowledge only, no live verification

---

## Seasonal / Cyclical Threats

Some threats are cyclical and should be weighted higher during their active periods:

- **Tax season (Q1-Q2 in most countries):** BEC and tax fraud scams (T1566, T1078)
- **Holiday shopping season (Nov-Dec):** Retail ransomware, e-commerce exploitation (T1486, T1190)
- **Back-to-school (Aug-Sep):** Education sector ransomware (T1486)
- **Election cycles:** Government and political organization targeting (T1566, T1078)
- **Geopolitical events:** Nation-state activity spikes around conflicts, elections, trade disputes
- **Patch Tuesday + 30 days:** CVE exploitation increases as patches are reverse-engineered (T1190)

Note these in the report if the customer's profile intersects with a seasonal threat period.

---

## Ransomware Crew Activity Tracking

Ransomware crews are the most dynamic part of the threat landscape. Track them via:

1. **Ransomwatch / Ransomlook** — public leak-site trackers showing which crews are posting victims and in which industries
2. **CISA #StopRansomware advisories** — official US government view on active ransomware threats
3. **Vendor investigations** — Sophos X-Ops, Mandiant, CrowdStrike publish detailed investigations on ransomware crew operations
4. **Disruption events** — Operation Cronos (LockBit, 2024), FBI BlackCat takedown (2023) — these disrupt crews but they often resurge. Note disruption date and assess resurgance.

**Crew lifecycle:**
- **Active** — posting victims, new variants, CISA advisories
- **Disrupted** — law enforcement action, but may resurge (LockBit post-Cronos, BlackCat post-FBI)
- **Fragmented** — crew splits (Conti → Black Basta, Royal, Akira)
- **Retired / rebranded** — crew disappears, often rebrands under new name (DarkSide → BlackMatter → BlackCat)

---

## Verification Workflow

During report generation, follow this workflow to verify current activity:

1. **CISA advisories** — webfetch https://www.cisa.gov/news-events/cybersecurity-advisories and scan for recent advisories matching the customer's profile (industry, tech stack, threat actors)
2. **MSTIC blog** — webfetch https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/ and scan for recent posts matching the profile
3. **Mandiant blog** — webfetch https://www.mandiant.com/resources/blog and scan recent posts
4. **CrowdStrike blog** — webfetch https://www.crowdstrike.com/blog/ and scan recent posts
5. **Red Canary** — webfetch https://redcanary.com/blog/ and check for Quarterly Threat Report or recent posts
6. **Ransomwatch / Ransomlook** — webfetch and check for ransomware crew activity in the customer's industry
7. **SigmaHQ rules-emerging-threats** — webfetch https://github.com/SigmaHQ/sigma/tree/master/rules-emerging-threats and check the current year's folder for recent APT-specific rule additions (indicates active campaigns)

**If a source is inaccessible via webfetch:**
- Note it in "Gaps & Unknowns"
- Do not fabricate findings from that source
- Try alternative sources for the same information

**If no recent activity is found for a matched threat actor:**
- Set recency weight to 0.3 (historically active)
- Note "no recent activity verified via live sources" in the report
- Still include the actor's TTPs if industry match and exposure match are high — historical TTPs are still valid detections to build