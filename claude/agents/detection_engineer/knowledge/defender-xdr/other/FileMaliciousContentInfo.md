# FileMaliciousContentInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-filemaliciouscontentinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-filemaliciouscontentinfo-table)

## Description
The `FileMaliciousContentInfo` table in the advanced hunting schema contains information about files that were processed by Microsoft Defender for Office 365 in SharePoint Online, OneDrive, and Microsoft Teams. Use this reference to construct queries that return information from this table.

This advanced hunting table is populated by records from Defender for Office 365. If your organization didn't deploy the service in Microsoft Defender XDR, queries that use the table aren't going to work or return any results.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Date and time when the event was generated |
| Workload | string | Information about the workload from which the URL originated from |
| FileName | string | Name of the file that the recorded action was applied to |
| FolderPath | string | Path of the folder containing the file that the recorded action was applied to |
| FileSize | long | Size of the file in bytes |
| SHA256 | string | SHA-256 of the file that the recorded action was applied to |
| FileOwnerDisplayName | string | Account recorded as owner of the file |
| FileOwnerUpn | string | Account recorded as owner of the file |
| DocumentId | string | Unique identifier of the file |
| ThreatTypes | dynamic | Verdict from the email filtering stack on whether the email contains malware, phishing, or other threats |
| ThreatNames | string | Detection name for malware or other threats found |
| DetectionMethods | string | Methods used to detect malware, phishing, or other threats found in the email |
| LastModifyingAccountUpn | string | Account that last modified this file |
| LastModifiedTime | datetime | Date and time the item or related metadata was last modified |
| FileCreationTime | datetime | Timestamp of the file creation |
| ReportId | string | Unique identifier for the event |
