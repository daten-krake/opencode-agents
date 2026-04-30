# BehaviorInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-behaviorinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-behaviorinfo-table)

## Description
The `BehaviorInfo` table in the advanced hunting schema contains information about behaviors from Microsoft Defender for Cloud Apps and User and Entity Behavior Analytics (UEBA). Use this reference to construct queries that return information from this table.

**Behaviors** are a type of data in Microsoft Defender XDR based on one or more raw events. Behaviors provide contextual insight into events and can, but not necessarily, indicate malicious activity.

This advanced hunting table is populated by records from both Defender for Cloud Apps and UEBA. If your organization doesn't deploy these services in Microsoft Defender XDR, queries that use the table won't work or return any results.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Date and time when the record was generated |
| BehaviorId | string | Unique identifier for the behavior |
| Title | string | Title of the behavior |
| Description | string | Description of the behavior |
| Categories | string | Type of threat indicator or breach activity identified by the behavior, as defined by the MITRE ATT&CK framework |
| AttackTechniques | string | MITRE ATT&CK techniques associated with the activity that triggered the behavior |
| ServiceSource | string | Product or service that identified the behavior |
| DetectionSource | string | Detection technology or sensor that identified the notable component or activity |
| DataSources | string | Products or services that provided information for the behavior |
| DeviceId | string | Unique identifier for the device in the service |
| AccountUpn | string | User principal name (UPN) of the account |
| AccountObjectId | string | Unique identifier for the account in Microsoft Entra ID |
| StartTime | datetime | Date and time of the first activity related to the behavior |
| EndTime | datetime | Date and time of the last activity related to the behavior |
| AdditionalFields | string | Additional information about the behavior |
| ActionType | string | Type of behavior |

## Action Types (if applicable)

No specific ActionType enumeration values were listed on the MS Learn page. The `ActionType` column contains the type of behavior.
