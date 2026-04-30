# Microsoft Sentinel — Security Tables Index

Source: [Azure Monitor Tables by Category (Security)](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables-category)

This index covers the security-relevant tables a detection engineer needs for Sentinel analytics rules.

## Entra ID Tables

| Table | Description | Doc Link |
|---|---|---|
| AuditLogs | Entra ID audit activity logs — directory changes, app management, user/group operations | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/auditlogs) |
| SigninLogs | Entra ID sign-in logs — interactive user sign-ins | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/signinlogs) |
| AADNonInteractiveUserSignInLogs | Non-interactive Entra ID user sign-ins (OAuth, client credentials, etc.) | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadnoninteractiveusersigninlogs) |
| AADServicePrincipalSignInLogs | Service principal sign-in events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadserviceprincipalsigninlogs) |
| AADManagedIdentitySignInLogs | Managed identity sign-in events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadmanagedidentitysigninlogs) |
| AADProvisioningLogs | Provisioning logs from Entra ID sync and provisioning service | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadprovisioninglogs) |
| AADUserRiskEvents | Entra ID Protection user risk events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aaduserriskevents) |
| AADRiskyUsers | Entra ID Protection risky users | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadriskyusers) |
| AADRiskyServicePrincipals | Entra ID Protection risky service principals | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadriskyserviceprincipals) |
| AADServicePrincipalRiskEvents | Entra ID Protection service principal risk events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadserviceprincipalriskevents) |
| AADB2CRequestLogs | Azure AD B2C request logs | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadb2crequestlogs) |
| ADFSSignInLogs | AD FS sign-in logs | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/adfssigninlogs) |

## Microsoft 365 Tables

| Table | Description | Doc Link |
|---|---|---|
| OfficeActivity | Microsoft 365 activity logs — SharePoint, Exchange, Teams, Power BI, etc. | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/officeactivity) |
| CloudAppEvents | Defender for Cloud Apps events (also in AH; in Sentinel via M365D connector) | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/cloudappevents) |
| EnrichedMicrosoft365AuditLogs | Enriched M365 audit logs | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/enrichedmicrosoft365auditlogs) |
| CommunicationComplianceActivity | Communication compliance activity events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/communicationcomplianceactivity) |
| MicrosoftPurviewInformationProtection | Purview Information Protection events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/microsoftpurviewinformationprotection) |

## Azure Tables

| Table | Description | Doc Link |
|---|---|---|
| AzureActivity | Azure Resource Manager activity logs | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/azureactivity) |
| AzureDiagnostics | Azure diagnostic logs from various Azure services | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/azurediagnostics) |

## Windows / Linux / Network Tables

| Table | Description | Doc Link |
|---|---|---|
| SecurityEvent | Windows Security Events (from AMA agent or legacy MMA) | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/securityevent) |
| WindowsEvent | Windows Event Log events (via AMA) | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/windowsevent) |
| Syslog | Linux syslog events | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/syslog) |
| CommonSecurityLog | Common Event Format (CEF) logs from network devices, firewalls, etc. | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/commonsecuritylog) |

## Sentinel-specific Tables

| Table | Description | Doc Link |
|---|---|---|
| SecurityAlert | Sentinel security alerts | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/securityalert) |
| SecurityIncident | Sentinel security incidents | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/securityincident) |
| ThreatIntelligenceIndicator | Threat intelligence indicators | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/threatintelligenceindicator) |
| BehaviorAnalytics | UEBA behavior analytics | [MS Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/behavioranalytics) |
