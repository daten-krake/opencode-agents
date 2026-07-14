# IdentityLogonEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitylogonevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitylogonevents-table)

## Description

The `IdentityLogonEvents` table in the advanced hunting schema contains information about authentication activities made through your on-premises Active Directory captured by Microsoft Defender for Identity and authentication activities related to Microsoft online services captured by Microsoft Defender for Cloud Apps. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `ActionType` | `string` | Type of activity that triggered the event. See the in-portal schema reference for details |
| `Application` | `string` | Application that performed the recorded action |
| `LogonType` | `string` | Type of logon session. For more information, see Supported logon types. |
| `Protocol` | `string` | Network protocol used |
| `FailureReason` | `string` | Information explaining why the recorded action failed |
| `AccountName` | `string` | User name of the account |
| `AccountDomain` | `string` | Domain of the account |
| `AccountUpn` | `string` | User principal name (UPN) of the account |
| `AccountSid` | `string` | Security Identifier (SID) of the account |
| `AccountObjectId` | `string` | Unique identifier for the account in Microsoft Entra ID |
| `AccountDisplayName` | `string` | Name of the account user displayed in the address book. Typically a combination of a given or first name, a middle initial, and a last name or surname. |
| `DeviceName` | `string` | Fully qualified domain name (FQDN) of the device |
| `DeviceType` | `string` | Type of device based on purpose and functionality, such as network device, workstation, server, mobile, gaming console, or printer |
| `OSPlatform` | `string` | Platform of the operating system running on the device. This indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10, and Windows 7. |
| `IPAddress` | `string` | IP address assigned to the endpoint and used during related network communications |
| `Port` | `int` | TCP port used during communication |
| `DestinationDeviceName` | `string` | Name of the device running the server application that processed the recorded action |
| `DestinationIPAddress` | `string` | IP address of the device running the server application that processed the recorded action |
| `DestinationPort` | `int` | Destination port of related network communications |
| `TargetDeviceName` | `string` | Fully qualified domain name (FQDN) of the device that the recorded action was applied to |
| `TargetAccountDisplayName` | `string` | Display name of the account that the recorded action was applied to |
| `Location` | `string` | City, country/region, or other geographic location associated with the event |
| `Isp` | `string` | Internet service provider (ISP) associated with the endpoint IP address |
| `ReportId` | `string` | Unique identifier for the event |
| `AdditionalFields` | `dynamic` | Additional information about the entity or event |

## Supported Logon Types

| Logon Type | Monitored Activity | Description |
|---|---|---|
| 2 | Credentials Validation | Domain-account authentication event using the NTLM and Kerberos authentication methods. |
| 2 | Interactive Logon | User gained network access by entering a username and password (authentication method Kerberos or NTLM). |
| 2 | Interactive Logon with Certificate | User gained network access by using a certificate. |
| 2 | VPN Connection | User connected by VPN - Authentication using RADIUS protocol. |
| 3 | Resource Access | User accessed a resource using Kerberos or NTLM authentication. |
| 3 | Delegated Resource Access | User accessed a resource using Kerberos delegation. |
| 8 | LDAP Cleartext | User authenticated using LDAP with a clear-text password (Simple authentication). |
| 10 | Remote Desktop | User performed an RDP session to a remote computer using Kerberos authentication. |
| — | Failed Logon | Domain-account failed authentication attempt (via NTLM and Kerberos) due to the following: account was disabled/expired/locked/used an untrusted certificate or due to invalid logon hours/old password/expired password/wrong password. |
| — | Failed Logon with Certificate | Domain-account failed authentication attempt (via Kerberos) due to the following: account was disabled/expired/locked/used an untrusted certificate or due to invalid logon hours/old password/expired password/wrong password. |
