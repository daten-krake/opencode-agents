# IdentityDirectoryEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitydirectoryevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitydirectoryevents-table)

## Description

The `IdentityDirectoryEvents` table in the advanced hunting schema contains events involving an on-premises domain controller running Active Directory (AD). This table captures various identity-related events, like password changes, password expiration, and user principal name (UPN) changes. It also captures system events on the domain controller, like scheduling of tasks and PowerShell activity. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `ActionType` | `string` | Type of activity that triggered the event. See the in-portal schema reference for details |
| `Application` | `string` | Application that performed the recorded action |
| `TargetAccountUpn` | `string` | User principal name (UPN) of the account that the recorded action was applied to |
| `TargetAccountDisplayName` | `string` | Display name of the account that the recorded action was applied to |
| `TargetDeviceName` | `string` | Fully qualified domain name (FQDN) of the device that the recorded action was applied to |
| `DestinationDeviceName` | `string` | Name of the device running the server application that processed the recorded action |
| `DestinationIPAddress` | `string` | IP address of the device running the server application that processed the recorded action |
| `DestinationPort` | `int` | Destination port of the activity |
| `Protocol` | `string` | Protocol used during the communication |
| `AccountName` | `string` | User name of the account |
| `AccountDomain` | `string` | Domain of the account |
| `AccountUpn` | `string` | User principal name (UPN) of the account |
| `AccountSid` | `string` | Security Identifier (SID) of the account |
| `AccountObjectId` | `string` | Unique identifier for the account in Microsoft Entra ID |
| `AccountDisplayName` | `string` | Name of the account user displayed in the address book. Typically a combination of a given or first name, a middle initial, and a last name or surname. |
| `DeviceName` | `string` | Fully qualified domain name (FQDN) of the device |
| `IPAddress` | `string` | IP address assigned to the device during communication |
| `Port` | `int` | TCP port used during communication |
| `Location` | `string` | City, country/region, or other geographic location associated with the event |
| `ISP` | `string` | Internet service provider associated with the IP address |
| `ReportId` | `string` | Unique identifier for the event |
| `AdditionalFields` | `dynamic` | Additional information about the entity or event |
