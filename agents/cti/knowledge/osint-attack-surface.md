# OSINT Attack-Surface Research Methodology

Methods for researching a customer's public attack surface. All sources are **passive and public** — no active scanning, no port scanning, no exploitation. Every finding must cite its source URL.

Use `webfetch` against the URLs below during report generation. Document every finding with: source URL, date accessed, specific exposure, and risk level (Critical/High/Medium/Low).

---

## Subdomain Enumeration

### Certificate Transparency Logs (crt.sh)
- **URL:** https://crt.sh/?q=%.domain.com&output=json
- **Method:** webfetch the URL with the customer's domain (replace `domain.com`)
- **What you get:** Every TLS certificate ever issued for any subdomain of the customer's domain, including wildcard certs. Reveals internal/hidden subdomains (vpn., admin., dev., staging., api., etc.)
- **Risk mapping:**
  - `vpn.` / `remote.` — VPN portal exposed (T1190 exploitation target, T1110 brute force target)
  - `admin.` / `manage.` / `internal.` — admin panels (T1190 target)
  - `dev.` / `staging.` / `test.` — dev/staging environments (often less secured, T1190 target)
  - `api.` — API endpoints (T1190 target, T1059.004 if API has RCE)
  - `mail.` / `autodiscover.` — email infrastructure
  - `git.` / `gitlab.` / `jenkins.` — CI/CD infrastructure (T1195 supply chain target)
  - `s3.` / `blob.` — cloud storage

**crt.sh query examples:**
```
https://crt.sh/?q=%.example.com&output=json
```

### SecurityTrails
- **URL:** https://securitytrails.com/domain/example.com/dns
- **What you get:** Historical DNS records, subdomain enumeration, associated IPs. Free tier has limited queries.
- **Method:** webfetch the domain page; parse the subdomain list.

### DNSDumpster
- **URL:** https://dnsdumpster.com/
- **What you get:** DNS recon — subdomains, MX records, TXT records, NS records. Free, no registration.
- **Method:** webfetch; the site returns a visual map and table of DNS records.

### Amass / Subfinder (reference only — not via webfetch)
- These are command-line tools the user could run separately. The CTI agent does not run bash. Mention these as "additional enumeration tools for the operator to run" if the webfetch-based methods yield thin results.

---

## Exposed Services / Shodan / Censys

### Shodan
- **URL:** https://www.shodan.io/
- **Method:** webfetch `https://www.shodan.io/search?query=hostname:example.com` (requires free account for full results; the search page returns summary info without login)
- **What you get:** Internet-connected services on the customer's IP space — open ports, service banners, software versions, SSL cert info.
- **Search queries:**
  - `hostname:example.com` — all services associated with the customer's domain
  - `org:"Customer Name"` — search by organization name (if registered)
  - `net:CIDR` — search by IP range (if customer's IP space is known)
  - `port:3389 hostname:example.com` — exposed RDP
  - `port:22 hostname:example.com` — exposed SSH
  - `port:443 hostname:example.com` — exposed HTTPS (filter for interesting services)
  - `product:"Apache" hostname:example.com` — specific software
  - `vuln:CVE-2023-4966 hostname:example.com` — known-vulnerable services (Shodan tags vulnerable services)

**Risk mapping:**
- Exposed RDP (3389) → T1110 brute force, T1078 valid accounts (LockBit, BlackCat target)
- Exposed SSH (22) → T1110, T1078 (ransomware crews, cryptominers)
- Exposed VPN appliances (Pulse Secure, FortiOS, Citrix) → T1190 CVE exploitation (APT5, ransomware crews)
- Exposed Exchange OWA → T1190 (ProxyShell, ProxyLogon — APT28, ransomware)
- Exposed databases (SQL Server 1433, MongoDB 27017, Elasticsearch 9200, Redis 6379) → T1190, T1003 (direct data access)
- Exposed Jenkins/CI/CD → T1195 supply chain compromise
- Exposed Docker/K8s API → container escape, cryptominer, ransomware

### Censys
- **URL:** https://search.censys.io/
- **Method:** webfetch `https://search.censys.io/search?resource=hosts&q=example.com` (free account for full results)
- **What you get:** Similar to Shodan — internet-wide scanning data, service banners, certificates. Complement to Shodan; sometimes finds services Shodan misses.

---

## TLS Certificates

### crt.sh (Certificate Transparency)
- **URL:** https://crt.sh/?q=example.com&output=json
- **What you get:** All certificates issued for the customer's domain, including:
  - Subdomains covered (SAN entries)
  - Issuer (Let's Encrypt = automated/cheap, DigiCert/Entrust = paid/enterprise)
  - Validity dates (shows how recently the cert was issued — recent certs on new subdomains = new infrastructure)
  - Wildcard certs (`*.example.com` — covers all subdomains)

**Risk mapping:**
- Wildcard certs on internal subdomains → reveals infrastructure the customer may not have intended to expose publicly
- Recent cert on a previously-unknown subdomain → new service, possibly less hardened
- Self-signed certs → internal PKI, possibly misconfigured
- Expired certs → service neglect, possibly abandoned infrastructure (still exposed, still exploitable)

### Censys Certificates
- **URL:** https://search.censys.io/certificates
- **What you get:** Certificate search across all issued certificates. Complement to crt.sh.

---

## Leaked Credentials / Breach Data

### Hudson Rock (Infostealer intelligence)
- **URL:** https://rockeak.com/ (and their public breach search)
- **What you get:** Infostealer logs showing credentials stolen from customer employees. Hudson Rock publishes aggregate data on stealer infections.
- **Method:** webfetch their public pages; search for the customer's domain in their stealer log data.

### DeHashed / HaveIBeenPwned (public breach databases)
- **URL:** https://haveibeenpwned.com/ (public API for breach notification)
- **URL:** https://www.dehashed.com/ (requires account; CTI agent can reference but not directly query without credentials)
- **What you get:** Email addresses of customer employees that have appeared in known data breaches.
- **Risk mapping:**
  - Employee email in a breach → password reuse risk (T1078 valid accounts via credential stuffing)
  - Multiple employees in breaches → higher risk of credential reuse
  - Breach of a service where the employee used corporate email → credential reuse into corporate accounts if SSO is used

### Public Pastes / GitHub Gists
- **URL:** https://gist.github.com/search?q=example.com
- **What you get:** Public GitHub Gists containing the customer's domain — may include leaked configs, credentials, internal documentation.
- **Method:** webfetch GitHub Gist search.

---

## Tech-Stack Fingerprinting

### Website Analysis
- **URL:** https://the customer's website
- **Method:** webfetch the customer's main website and key subdomains; analyze HTTP headers, meta tags, JavaScript references.
- **What you look for:**
  - **Server header:** Apache, nginx, IIS, Cloudflare (CDN)
  - **X-Powered-By:** PHP, ASP.NET, Express, etc.
  - **Set-Cookie:** session cookie names reveal framework (JSESSIONID = Java, ASP.NET_SessionId = .NET, PHPSESSID = PHP)
  - **Meta generator:** WordPress, Drupal, Joomla, SharePoint
  - **JavaScript references:** jQuery, React, Vue, Angular — reveals frontend stack
  - **CDN:** Cloudflare, Akamai, Fastly, Azure CDN — reveals CDN provider
  - **HSTS / CSP headers:** reveals security posture (presence = better, absence = worse)

### Wappalyzer-style analysis
- **URL:** https://www.wappalyzer.com/ (reference — CTI agent does the analysis manually via webfetch)
- **Method:** Fetch the customer's website, parse headers and HTML, identify frameworks.

### BuiltWith
- **URL:** https://builtwith.com/example.com
- **What you get:** Tech stack analysis of the customer's website — frameworks, analytics, hosting, CDN, email provider, advertising.
- **Method:** webfetch the BuiltWith page for the customer's domain.

**Risk mapping:**
- WordPress / Drupal / Joomla → CVE-driven exploitation (T1190) if not patched
- SharePoint / Exchange OWA → CVE exploitation (ProxyShell, ProxyLogon)
- ASP.NET → known CVEs in older versions
- Cloudflare CDN → CDN hides origin IP, but if origin is exposed elsewhere, bypass is possible
- O365 email (MX points to Microsoft) → O365 targeting (APT29, APT35, Scattered Spider)
- Google Workspace email → Workspace targeting (APT41)

---

## GitHub / Source Code Exposure

### GitHub Code Search
- **URL:** https://github.com/search?q=example.com&type=code
- **What you get:** Public GitHub code containing the customer's domain — may include:
  - Hardcoded API keys, passwords, connection strings (T1552.001)
  - Internal documentation leaked to public repos
  - Source code for internal tools
  - Configuration files (docker-compose.yml, .env, config.json) with sensitive data
- **Method:** webfetch GitHub code search results for the customer's domain. Also search for the customer's org name on GitHub.

### GitHub Repository Search
- **URL:** https://github.com/search?q=org:example-com&type=repositories (replace with the customer's GitHub org)
- **What you get:** Public repositories owned by the customer — may include:
  - Source code (if the customer is a software company)
  - Infrastructure-as-code (Terraform, Ansible) — reveals cloud infrastructure
  - Documentation (README, wiki) — reveals internal architecture
  - CI/CD configs (.github/workflows) — reveals build pipeline (T1195 target)

### Gitleaks / TruffleHog (reference only — not via webfetch)
- These are secret-scanning tools the user could run against cloned repos. Mention as "additional secret scanning for the operator to run" if GitHub code search yields results.

**Risk mapping:**
- Hardcoded secrets in public repos → T1552.001, direct access to customer infrastructure
- Infrastructure-as-code in public repos → reveals cloud architecture (attack surface mapping)
- CI/CD configs → T1195 supply chain compromise target
- Internal documentation → reveals architecture, dependencies, weaknesses

---

## DNS Records

### Public DNS Lookups
- **URL:** Use webfetch against public DNS lookup tools:
  - https://dns.google/resolve?name=example.com&type=ALL (Google DNS API)
  - https://1.1.1.1/dns-query?name=example.com&type=ALL (Cloudflare DNS API)
- **What you get:** All DNS records for the customer's domain:
  - **A** — IPv4 address (where the website is hosted)
  - **AAAA** — IPv6 address
  - **MX** — mail server (O365 = `.mail.protection.outlook.com`, Google = `.googlemail.com`, on-prem = custom)
  - **TXT** — SPF, DKIM, DMARC (email security posture), verification records (reveals SaaS services used — `google-site-verification`, `MS=`, `atlassian-domain-verification`, etc.)
  - **NS** — name servers (Azure DNS = `.azure-dns.com`, Cloudflare = `.cloudflare.com`, AWS Route53 = `.awsdns-*`)
  - **CNAME** — aliases (reveals CDN, SaaS services)
  - **SOA** — start of authority

**Risk mapping:**
- MX → email provider (O365, Google, on-prem Exchange)
- TXT with `v=spf1` → email security posture (absence of SPF = email spoofing risk)
- TXT with `MS=` → O365 tenant verification (confirms O365 usage)
- TXT with `google-site-verification` → Google Workspace usage
- TXT with `atlassian-domain-verification` → Atlassian/Jira/Confluence usage
- TXT with `_dmarc` → DMARC policy (absence = no email auth enforcement)
- NS → DNS provider (Cloudflare, Azure DNS, AWS Route53)

### SPF/DMARC Analysis
- Absence of SPF (`v=spf1`) → email spoofing risk (T1566.002 spearphishing via spoofed domain)
- SPF with `~all` (softfail) → weak enforcement
- SPF with `-all` (hardfail) → strong enforcement
- Absence of DMARC → no policy enforcement
- DMARC with `p=none` → monitoring only, no enforcement
- DMARC with `p=quarantine` or `p=reject` → enforced

---

## Cloud Service Identification

### Azure / O365
- MX records pointing to `*.mail.protection.outlook.com` → O365
- TXT with `MS=ms12345678` → O365 tenant
- CNAME to `*.azureedge.net` / `*.cloudapp.azure.com` → Azure hosting
- NS to `*.azure-dns.com` → Azure DNS
- **Risk:** O365 → APT29 (consent grant abuse, token theft), APT35 (phishing), Scattered Spider (social engineering)

### AWS
- NS to `*.awsdns-*` → Route53
- S3 bucket URLs (if discoverable) → `*.s3.amazonaws.com`
- CloudFront → `*.cloudfront.net`
- **Risk:** AWS → misconfigured S3 buckets (T1530/T1613), IAM credential theft (T1528)

### Google Cloud / Workspace
- MX to `*.googlemail.com` → Google Workspace
- TXT with `google-site-verification=` → Workspace
- App Engine → `*.appspot.com`
- Cloud Storage → `*.storage.googleapis.com`
- **Risk:** Google Workspace → APT41 (China, Workspace targeting)

### Cloudflare
- NS to `*.cloudflare.com` → Cloudflare DNS/CDN
- Server header: `cloudflare`
- **Risk:** Cloudflare hides origin IP; if origin is discoverable via other OSINT (crt.sh + Shodan cross-reference), CDN protection is bypassable

---

## Attack Surface Summary Table (output format)

After completing OSINT research, summarize findings in this format for the report:

```
| Asset / Finding | Type | Source | Risk Level | Details |
|-----------------|------|--------|------------|---------|
| vpn.example.com:443 (FortiOS) | Exposed VPN | Shodan, crt.sh | CRITICAL | FortiOS CVE-2023-27997 vulnerable; APT5, LockBit, Play target |
| dev.example.com (Jenkins) | Exposed CI/CD | crt.sh, Shodan | HIGH | Jenkins exposed; T1195 supply chain target |
| admin.example.com | Admin panel | crt.sh, Shodan | HIGH | Unknown service; T1190 target |
| 3 employee emails in breaches | Leaked creds | HaveIBeenPwned | MEDIUM | Credential reuse risk (T1078) |
| O365 tenant confirmed | Email/identity | DNS MX, TXT | MEDIUM | APT29, APT35, Scattered Spider target profile |
| WordPress 6.0 (outdated) | Web framework | Website fetch | MEDIUM | CVE-driven exploitation (T1190) |
| No DMARC record | Email security | DNS TXT | LOW | Email spoofing risk (T1566.002) |
| GitHub org has public Terraform repo | Source exposure | GitHub search | LOW | Reveals cloud architecture (no secrets found in quick scan) |
```

## OSINT Ground Rules

1. **Passive only.** No active scanning, no port scanning, no exploitation, no credential stuffing. Only public, passive sources.
2. **Cite every source.** Every finding includes the source URL and the date accessed. No source = no finding.
3. **No fabrication.** If crt.sh returns nothing, say "no certificates found." Do not invent findings.
4. **Distinguish confirmed from likely.** A finding verified via multiple sources is "confirmed." A single-source finding is "likely, needs verification."
5. **Risk level is contextual.** Exposed RDP is CRITICAL for a hospital (patient safety), MEDIUM for a small marketing firm (no crown jewels). Always tie risk to the customer's industry and crown jewels.
6. **Note what you couldn't check.** If you couldn't access Shodan (no account), say so. If you couldn't find the customer's GitHub org, say so. Gaps are findings too.
7. **Respect scope.** Only research the customer's own infrastructure. Do not research partners, customers, or third parties unless explicitly asked.