# IdentityInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityinfo-table)

## Description

The `IdentityInfo` table in the advanced hunting schema contains information about user accounts obtained from various services, including Microsoft Entra ID. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | The date and time that the line was written to the database. This is used when there are multiple lines for each identity, such as when a change is detected, or if 24 hours have passed since the last database line was added. |
| `ReportId` | `string` | Unique identifier for the event |
| `AccountObjectId` | `string` | Unique identifier for the account in Microsoft Entra ID |
| `AccountUpn` | `string` | User principal name (UPN) of the account |
| `OnPremSid` | `string` | On-premises security identifier (SID) of the account |
| `AccountDisplayName` | `string` | Name of the account user displayed in the address book. Typically a combination of a given or first name, a middle initial, and a last name or surname. |
| `AccountName` | `string` | User name of the account |
| `AccountDomain` | `string` | Domain of the account |
| `CriticalityLevel` | `int` | The criticality score of the account |
| `Type` | `string` | Type of identity; possible values: User, ServiceAccount |
| `DistinguishedName` | `string` | The user's distinguished name |
| `CloudSid` | `string` | Cloud security identifier of the account |
| `GivenName` | `string` | Given name or first name of the account user |
| `Surname` | `string` | Surname, family name, or last name of the account user |
| `Department` | `string` | Name of the department that the account user belongs to |
| `JobTitle` | `string` | Job title of the account user |
| `EmailAddress` | `string` | SMTP address of the account |
| `SipProxyAddress` | `string` | Voice over IP (VOIP) session initiation protocol (SIP) address of the account |
| `Address` | `string` | Address of the account user |
| `City` | `string` | City where the account user is located |
| `Country` | `string` | Country/Region where the account user is located |
| `IsAccountEnabled` | `boolean` | Indicates whether the account is enabled or not |
| `Manager` | `string` | The listed manager of the account user |
| `Phone` | `string` | The listed phone number of the account user |
| `CreatedDateTime` | `datetime` | Date and time when the account user was created |
| `ChangeSource` | `string` | Identifies which identity provider or process triggered the addition of the new row. For example, the `System-UserPersistence` value is used for any rows added by an automated process. |
| `BlastRadius` | `string` | A calculation based on the position of the user in the org tree and the user's Microsoft Entra roles and permissions; possible values: Low, Medium, High |
| `CompanyName` | `string` | Name of the company for which the user works |
| `DeletedDateTime` | `datetime` | Date and time when the user account was deleted |
| `EmployeeId` | `string` | Employee identifier assigned to the user by the organization |
| `OtherMailAddresses` | `dynamic` | Additional email addresses of the user account |
| `RiskLevel` | `string` | Microsoft Entra ID risk level of the user account; possible values: Low, Medium, High |
| `RiskLevelDetails` | `string` | Details regarding the Microsoft Entra ID risk level |
| `State` | `string` | State where the sign-in occurred, if available |
| `Tags` | `dynamic` | Tags assigned to the account user by Defender for Identity |
| `AssignedRoles` | `dynamic` | For identities from Microsoft Entra-only, the roles assigned to the account user |
| `PrivilegedEntraPimRoles` | `dynamic` | A snapshot of privileged role assignment schedules and eligibility schedules for the account as maintained by Microsoft Entra Privileged Identity Management (excluding activated assignments) |
| `TenantId` | `string` | Unique identifier representing your organization's instance of Microsoft Entra ID |
| `SourceSystem` | `string` | The source system for the record |
| `OnPremObjectId` | `string` | Active Directory object ID of the user |
| `TenantMembershipType` | `string` | User type in Microsoft Entra ID; possible values: Guest, Member |
| `RiskStatus` | `string` | Status of the user's risk; possible values: None, ConfirmedSafe, Remediated, Dismissed, AtRisk, ConfirmedCompromised, UnknownFutureValue |
| `UserAccountControl` | `string` | Security attributes of the user account in the Active Directory domain |
| `IdentityEnvironment` | `string` | Environment where the identity is used; possible values: CloudOnly, Hybrid, On-premises |
| `SourceProviders` | `dynamic` | Source providers of the accounts for the identity; possible values: ActiveDirectory, EntraID, Okta |
| `GroupMembership` | `dynamic` | Microsoft Entra ID groups where the user account is a member |
