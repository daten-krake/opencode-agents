# CTI Agent — Knowledge Base

Reference material for the `cti` subagent. All content sourced from MITRE ATT&CK Groups, CISA advisories, vendor threat intel publications, and public OSINT methodology documentation.

## Directory

### APT Groups (`apt-groups.md`)
- APT group catalog — name, aliases, origin, target industries/geographies, favored TTPs, MITRE technique mappings. Sourced from MITRE ATT&CK Groups (attack.mitre.org/groups).

### Industry Threat Mapping (`industry-threat-mapping.md`)
- Industry/sector → threat actor mapping. Drives "branch matching" — which APTs and ransomware crews target finance, healthcare, manufacturing, government, energy, tech, retail, legal, education, telecom, media, defense, NGO.

### Threat Intel Sources (`threat-intel-sources.md`)
- Directory of authoritative threat intelligence sources: CISA, NSA/FBI joint advisories, MSRC/MSTIC, Mandiant, CrowdStrike, Red Canary, Recorded Future, Microsoft DCU, Palo Alto Unit 42, Sophos X-Ops, Elastic Security Labs — with URLs and what each source is good for.

### OSINT Attack Surface (`osint-attack-surface.md`)
- OSINT methodology for customer exposure research: subdomain enumeration, certificate transparency, Shodan/Censys, leaked credentials, tech-stack fingerprinting, GitHub exposure, DNS records — with the exact queries/URLs for each source.

### Campaign Tracking (`campaign-tracking.md`)
- Template for tracking ongoing campaigns and the current threat landscape — how to structure "what's active right now" so the report reflects recency, not just static APT knowledge. Recency scoring rubric.

### Detection Rule Repos (`detection-rule-repos.md`)
- Reference guide to SigmaHQ (github.com/SigmaHQ/sigma) and Elastic detection-rules (github.com/elastic/detection-rules): directory structure, rule formats (Sigma YAML, Elastic TOML), how to search by MITRE technique / threat actor / platform, conversion paths to KQL (Sentinel/Defender XDR), and the webfetch URL patterns for searching each repo.

### Threat Prioritization Report Template (`threat-prioritization-report-template.md`)
- The output template — the exact structure the agent produces for detection_engineer consumption.

## How the Agent Uses This Knowledge

The `cti` agent is loaded with this knowledge folder at invocation. When producing a Threat Prioritization Report:

1. Maps the customer's industry to threat actors using `industry-threat-mapping.md`
2. Looks up each threat actor's TTPs and MITRE mappings in `apt-groups.md`
3. Researches the customer's public attack surface using methods in `osint-attack-surface.md`
4. Pulls current threat landscape from sources listed in `threat-intel-sources.md`
5. Scores recency using the rubric in `campaign-tracking.md`
6. Searches SigmaHQ and Elastic for existing detections using patterns in `detection-rule-repos.md`
7. Emits the report using the template in `threat-prioritization-report-template.md`

## Source URLs

- MITRE ATT&CK Groups: https://attack.mitre.org/groups/
- CISA Cybersecurity Advisories: https://www.cisa.gov/news-events/cybersecurity-advisories
- SigmaHQ: https://github.com/SigmaHQ/sigma
- Elastic Detection Rules: https://github.com/elastic/detection-rules
- Sigma Rule Search (Phoenix): https://sigma.nasbench.dev/
- Sigma CLI (conversion): https://github.com/SigmaHQ/sigma-cli
- sigconverter.io (web-based conversion): https://sigconverter.io