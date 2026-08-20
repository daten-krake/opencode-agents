# Detection Engineer — Knowledge Base

Reference material exposed by the `detection-engineering` skill. All content is sourced from Microsoft Learn, MITRE ATT&CK, and community resources.

## Directory

### KQL (`kql/`)
- [**cheat-sheet.md**](kql/cheat-sheet.md) — Full KQL cheat sheet (operators, functions, patterns, security queries)
- [**platform-diff.md**](kql/platform-diff.md) — Sentinel-only vs Defender XDR-only constructs and limitations

### Defender XDR Advanced Hunting (`defender-xdr/`)
- [**schema-index.md**](defender-xdr/schema-index.md) — All 62 AH tables with descriptions and doc links

#### Device Tables (`defender-xdr/device/`)
- DeviceProcessEvents.md, DeviceNetworkEvents.md, DeviceFileEvents.md, DeviceRegistryEvents.md, DeviceImageLoadEvents.md, DeviceLogonEvents.md, DeviceEvents.md, DeviceInfo.md, DeviceFileCertificateInfo.md, DeviceNetworkInfo.md
- DeviceBaselineComplianceAssessment.md, DeviceBaselineComplianceAssessmentKB.md, DeviceBaselineComplianceProfiles.md
- DeviceTvmBrowserExtensions.md, DeviceTvmBrowserExtensionsKB.md, DeviceTvmCertificateInfo.md, DeviceTvmHardwareFirmware.md, DeviceTvmInfoGathering.md, DeviceTvmInfoGatheringKB.md, DeviceTvmSecureConfigurationAssessment.md, DeviceTvmSecureConfigurationAssessmentKB.md, DeviceTvmSoftwareEvidenceBeta.md, DeviceTvmSoftwareInventory.md, DeviceTvmSoftwareVulnerabilities.md, DeviceTvmSoftwareVulnerabilitiesKB.md

#### Identity Tables (`defender-xdr/identity/`)
- IdentityLogonEvents.md, IdentityQueryEvents.md, IdentityDirectoryEvents.md, IdentityInfo.md, IdentityAccountInfo.md, IdentityEvents.md

#### Email Tables (`defender-xdr/email/`)
- EmailEvents.md, EmailAttachmentInfo.md, EmailUrlInfo.md, EmailPostDeliveryEvents.md, UrlClickEvents.md, CampaignInfo.md

#### Cloud & Alert Tables (`defender-xdr/cloud-alert/`)
- CloudAppEvents.md, AADSignInEventsBeta.md, AADSpnSignInEventsBeta.md, EntraIdSignInEvents.md, EntraIdSpnSignInEvents.md, AlertInfo.md, AlertEvidence.md, GraphApiAuditEvents.md, OAuthAppInfo.md, CloudAuditEvents.md, CloudDnsEvents.md, CloudPolicyEnforcementEvents.md, CloudProcessEvents.md, CloudStorageAggregatedEvents.md

#### Other Tables (`defender-xdr/other/`)
- AIAgentsInfo.md, BehaviorEntities.md, BehaviorInfo.md, DataSecurityBehaviors.md, DataSecurityEvents.md, DisruptionAndResponseEvents.md, ExposureGraphEdges.md, ExposureGraphNodes.md, FileMaliciousContentInfo.md, MessageEvents.md, MessagePostDeliveryEvents.md, MessageUrlInfo.md

### Microsoft Sentinel (`sentinel/`)
- [**schema-index.md**](sentinel/schema-index.md) — Security-relevant Log Analytics tables with descriptions and doc links

#### Entra ID Tables (`sentinel/entra-id/`)
- AuditLogs.md, SigninLogs.md, AADNonInteractiveUserSignInLogs.md, AADServicePrincipalSignInLogs.md, AADManagedIdentitySignInLogs.md, AADProvisioningLogs.md, AADUserRiskEvents.md, AADRiskyUsers.md, AADRiskyServicePrincipals.md, AADServicePrincipalRiskEvents.md, AADB2CRequestLogs.md, ADFSSignInLogs.md, AADGraphActivityLogs.md

#### Microsoft 365 Tables (`sentinel/microsoft365/`)
- OfficeActivity.md, CloudAppEvents.md, EnrichedMicrosoft365AuditLogs.md, CommunicationComplianceActivity.md, MicrosoftPurviewInformationProtection.md

#### Azure Tables (`sentinel/azure/`)
- AzureActivity.md, AzureDiagnostics.md

#### Windows / Linux Tables (`sentinel/windows/`)
- SecurityEvent.md, WindowsEvent.md, Syslog.md, CommonSecurityLog.md

#### Sentinel-specific (`sentinel/`)
- SecurityAlert.md, SecurityIncident.md, ThreatIntelligenceIndicator.md, BehaviorAnalytics.md

### Methodology (`methodology/`)
- [**capability-abstraction.md**](methodology/capability-abstraction.md) — SpecterOps-style 4-layer abstraction pyramid (Tool → Procedure → Technique → Function)
- [**stage-model.md**](methodology/stage-model.md) — Indicator / Behavioral / Analytic detection spectrum
- [**mitre-tactics.md**](methodology/mitre-tactics.md) — MITRE ATT&CK Enterprise matrix tactics quick reference

## How Factory Roles Use This Knowledge

Planner, implementer, and reviewer roles load the `detection-engineering` skill and read only the references needed for the current rule:

1. Maps the attack to MITRE ATT&CK using `methodology/mitre-tactics.md`
2. Identifies the capability abstraction layer using `methodology/capability-abstraction.md`
3. Picks platform (AH vs Sentinel) using `kql/platform-diff.md`
4. Looks up target tables in `defender-xdr/schema-index.md` or `sentinel/schema-index.md`
5. Verifies exact column names/types from the per-table reference files
6. Writes the KQL query using patterns from `kql/cheat-sheet.md`
7. Emits the YAML rule document

## Source URLs

- Defender XDR Tables: https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables
- Sentinel Tables: https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables-category
- KQL Cheat Sheet: https://github.com/kustonaut/kql-cheat-sheet
- MITRE ATT&CK: https://attack.mitre.org/
