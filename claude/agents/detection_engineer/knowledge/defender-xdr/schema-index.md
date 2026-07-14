# Defender XDR Advanced Hunting Schema — Table Index

Source: [Advanced Hunting Schema Tables](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables)

All 62 tables in the Microsoft Defender XDR advanced hunting schema.

## Device Tables

| Table | Description | Doc Link |
|---|---|---|
| DeviceProcessEvents | Process creation and related events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceprocessevents-table) |
| DeviceNetworkEvents | Network connection and related events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicenetworkevents-table) |
| DeviceFileEvents | File creation, modification, and other file system events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicefileevents-table) |
| DeviceRegistryEvents | Creation and modification of registry entries | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceregistryevents-table) |
| DeviceImageLoadEvents | DLL loading events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceimageloadevents-table) |
| DeviceLogonEvents | Sign-ins and other authentication events on devices | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicelogonevents-table) |
| DeviceEvents | Multiple event types, including events triggered by security controls such as Microsoft Defender Antivirus and exploit protection | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceevents-table) |
| DeviceInfo | Machine information, including OS information | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceinfo-table) |
| DeviceFileCertificateInfo | Certificate information of signed files obtained from certificate verification events on endpoints | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicefilecertificateinfo-table) |
| DeviceNetworkInfo | Network properties of devices, including physical adapters, IP and MAC addresses, as well as connected networks and domains | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicenetworkinfo-table) |
| DeviceBaselineComplianceAssessment (Preview) | Baseline compliance assessment snapshot | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessment-table) |
| DeviceBaselineComplianceAssessmentKB (Preview) | Knowledge base of security configurations used by baseline compliance | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessmentkb-table) |
| DeviceBaselineComplianceProfiles (Preview) | Baseline profiles used for monitoring device baseline compliance | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceprofiles-table) |
| DeviceTvmBrowserExtensions (Preview) | Browser extension installations found on devices | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensions-table) |
| DeviceTvmBrowserExtensionsKB (Preview) | Browser extension details and permission information | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensionskb-table) |
| DeviceTvmCertificateInfo (Preview) | Certificate information for devices | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmcertificateinfo-table) |
| DeviceTvmHardwareFirmware | Hardware and firmware information of devices | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmhardwarefirmware-table) |
| DeviceTvmInfoGathering | Vulnerability Management assessment events including configuration and attack surface area states | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogathering-table) |
| DeviceTvmInfoGatheringKB | Metadata for assessment events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogatheringkb-table) |
| DeviceTvmSecureConfigurationAssessment | Vulnerability Management assessment events for security configurations | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessment-table) |
| DeviceTvmSecureConfigurationAssessmentKB | Knowledge base of security configurations with standards mappings | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessmentkb-table) |
| DeviceTvmSoftwareEvidenceBeta | Evidence info about where specific software was detected on a device | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareevidencebeta-table) |
| DeviceTvmSoftwareInventory | Inventory of software installed on devices, including version information and end-of-support status | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareinventory-table) |
| DeviceTvmSoftwareVulnerabilities | Software vulnerabilities found on devices and available security updates | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilities-table) |
| DeviceTvmSoftwareVulnerabilitiesKB | Knowledge base of publicly disclosed vulnerabilities | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilitieskb-table) |

## Identity Tables

| Table | Description | Doc Link |
|---|---|---|
| IdentityLogonEvents | Authentication events on Active Directory and Microsoft online services | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitylogonevents-table) |
| IdentityQueryEvents | Queries for Active Directory objects, such as users, groups, devices, and domains | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityqueryevents-table) |
| IdentityDirectoryEvents | Events involving an on-premises domain controller running Active Directory (AD) | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitydirectoryevents-table) |
| IdentityInfo | Account information from various sources, including Microsoft Entra ID | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityinfo-table) |
| IdentityAccountInfo | Account information from various sources, including Microsoft Entra ID. Also includes identity ownership info. | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityaccountinfo-table) |
| IdentityEvents (Preview) | Information about identity events obtained from other cloud identity service providers | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityevents-table) |

## Email Tables

| Table | Description | Doc Link |
|---|---|---|
| EmailEvents | Microsoft 365 email events, including email delivery and blocking events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-emailevents-table) |
| EmailAttachmentInfo | Information about files attached to emails | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-emailattachmentinfo-table) |
| EmailUrlInfo | Information about URLs on emails | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-emailurlinfo-table) |
| EmailPostDeliveryEvents | Security events that occur post-delivery | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-emailpostdeliveryevents-table) |
| UrlClickEvents | Safe Links clicks from email messages, Teams, and Office 365 apps | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-urlclickevents-table) |
| CampaignInfo (Preview) | Email campaigns identified by Microsoft Defender for Office 365 | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-campaigninfo-table) |

## Cloud & Alert Tables

| Table | Description | Doc Link |
|---|---|---|
| CloudAppEvents | Events involving accounts and objects in Office 365 and other cloud apps and services | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudappevents-table) |
| AADSignInEventsBeta | Microsoft Entra interactive and non-interactive sign-ins | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-aadsignineventsbeta-table) |
| AADSpnSignInEventsBeta | Microsoft Entra service principal and managed identity sign-ins | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-aadspnsignineventsbeta-table) |
| EntraIdSignInEvents | Microsoft Entra interactive and non-interactive sign-ins | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-entraidsigninevents-table) |
| EntraIdSpnSignInEvents | Microsoft Entra service principal and managed identity sign-ins | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-entraidspnsigninevents-table) |
| AlertInfo | Alerts from Defender for Endpoint, Office 365, Cloud Apps, and Identity | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-alertinfo-table) |
| AlertEvidence | Files, IP addresses, URLs, users, or devices associated with alerts | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-alertevidence-table) |
| GraphApiAuditEvents | Microsoft Entra ID API requests made to Microsoft Graph API | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-graphapiauditevents-table) |
| OAuthAppInfo (Preview) | Microsoft 365-connected OAuth applications registered with Microsoft Entra ID | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-oauthappinfo-table) |
| CloudAuditEvents (Preview) | Cloud audit events for various cloud platforms protected by Microsoft Defender for Cloud | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudauditevents-table) |
| CloudDnsEvents (Preview) | DNS activity events from cloud infrastructure environments | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-clouddnsevents-table) |
| CloudPolicyEnforcementEvents (Preview) | Policy enforcement evaluation decisions | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudpolicyenforcementevents-table) |
| CloudProcessEvents (Preview) | Cloud process events for various cloud platforms | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudprocessevents-table) |
| CloudStorageAggregatedEvents (Preview) | Cloud storage activity and related events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudstorageaggregatedevents-table) |

## Other Tables

| Table | Description | Doc Link |
|---|---|---|
| AIAgentsInfo (Preview) | Information about AI agents created with Microsoft Copilot Studio | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-aiagentsinfo-table) |
| BehaviorEntities (Preview) | Entities involved in a behavior in Defender for Cloud Apps and UEBA | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-behaviorentities-table) |
| BehaviorInfo (Preview) | Behaviors from Defender for Cloud Apps and UEBA | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-behaviorinfo-table) |
| DataSecurityBehaviors (Preview) | Insights about potentially suspicious user behaviors violating policies | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-datasecuritybehaviors-table) |
| DataSecurityEvents (Preview) | Information about user activities violating policies | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-datasecurityevents-table) |
| DisruptionAndResponseEvents (Preview) | Automatic attack disruption events | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-disruptionandresponseevents-table) |
| ExposureGraphEdges | Microsoft Security Exposure Management exposure graph edge information | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphedges-table) |
| ExposureGraphNodes | Microsoft Security Exposure Management exposure graph node information | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphnodes-table) |
| FileMaliciousContentInfo (Preview) | Files processed by Defender for Office 365 in SharePoint, OneDrive, and Teams | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-filemaliciouscontentinfo-table) |
| MessageEvents | Messages sent and received within your organization at the time of delivery | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-messageevents-table) |
| MessagePostDeliveryEvents | Security events that occurred after delivery of a Microsoft Teams message | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-messagepostdeliveryevents-table) |
| MessageUrlInfo | URLs sent through Microsoft Teams messages in your organization | [MS Learn](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-messageurlinfo-table) |
