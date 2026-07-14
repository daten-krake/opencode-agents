# IdentityQueryEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityqueryevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityqueryevents-table)

## Description

The `IdentityQueryEvents` table in the advanced hunting schema contains information about queries performed against Active Directory objects, such as users, groups, devices, and domains. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `ActionType` | `string` | Type of activity that triggered the event. See the in-portal schema reference for details |
| `Application` | `string` | Application that performed the recorded action |
| `QueryType` | `string` | Type of query, such as QueryGroup, QueryUser, or EnumerateUsers |
| `QueryTarget` | `string` | Name of user, group, device, domain, or any other entity type being queried |
| `Query` | `string` | String used to run the query |
| `Protocol` | `string` | Protocol used during the communication |
| `AccountName` | `string` | User name of the account |
| `AccountDomain` | `string` | Domain of the account |
| `AccountUpn` | `string` | User principal name (UPN) of the account |
| `AccountSid` | `string` | Security Identifier (SID) of the account |
| `AccountObjectId` | `string` | Unique identifier for the account in Microsoft Entra ID |
| `AccountDisplayName` | `string` | Name of the account user displayed in the address book. Typically a combination of a given or first name, a middle initial, and a last name or surname. |
| `DeviceName` | `string` | Fully qualified domain name (FQDN) of the device |
| `IPAddress` | `string` | IP address assigned to the endpoint and used during related network communications |
| `Port` | `int` | TCP port used during communication |
| `DestinationDeviceName` | `string` | Name of the device running the server application that processed the recorded action |
| `DestinationIPAddress` | `string` | IP address of the device running the server application that processed the recorded action |
| `DestinationPort` | `int` | Destination port of related network communications |
| `TargetDeviceName` | `string` | Fully qualified domain name (FQDN) of the device that the recorded action was applied to |
| `TargetAccountUpn` | `string` | User principal name (UPN) of the account that the recorded action was applied to |
| `TargetAccountDisplayName` | `string` | Display name of the account that the recorded action was applied to |
| `Location` | `string` | City, country/region, or other geographic location associated with the event |
| `ReportId` | `string` | Unique identifier for the event |
| `AdditionalFields` | `dynamic` | Additional information about the entity or event |
