# AlertInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-alertinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-alertinfo-table)

## Description

The `AlertInfo` table in the advanced hunting schema contains information about alerts from Microsoft Defender for Endpoint, Microsoft Defender for Office 365, Microsoft Defender for Cloud Apps, and Microsoft Defender for Identity. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the record was generated |
| `AlertId` | `string` | Unique identifier for the alert |
| `Title` | `string` | Title of the alert |
| `Category` | `string` | Type of threat indicator or breach activity identified by the alert |
| `Severity` | `string` | Indicates the potential impact (high, medium, or low) of the threat indicator or breach activity identified by the alert |
| `ServiceSource` | `string` | Product or service that provided the alert information |
| `DetectionSource` | `string` | Detection technology or sensor that identified the notable component or activity |
| `AttackTechniques` | `string` | MITRE ATT&CK techniques associated with the activity that triggered the alert |
