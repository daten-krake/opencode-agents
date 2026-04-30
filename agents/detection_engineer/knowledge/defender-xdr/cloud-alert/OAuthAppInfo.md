# OAuthAppInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-oauthappinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-oauthappinfo-table)

## Description

The `OAuthAppInfo` table in the advanced hunting schema contains information about Microsoft 365-connected OAuth applications in the organization that are registered with Microsoft Entra ID and available in the Microsoft Defender for Cloud Apps app governance capability. The `OAuthAppInfo` table might not include all the app or service principal-related properties that are available on Entra ID. It also doesn't include data related to Microsoft first-party apps or apps without any OAuth consents.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `ReportId` | `string` | Unique identifier for the record |
| `Timestamp` | `datetime` | Date and time when the record was created |
| `OAuthAppId` | `string` | The unique identifier for the app as assigned by Microsoft Entra ID |
| `ServicePrincipalId` | `string` | The unique identifier for the service principal instance of the application in the tenant |
| `AppName` | `string` | The application's display name as exposed by the associated service principal |
| `AddedOnTime` | `datetime` | Date and time when the application was registered |
| `LastModifiedTime` | `datetime` | Timestamp when the app was last modified |
| `AppStatus` | `string` | Status of the app; can be: Enabled, DisabledByMicrosoft, DisabledByAppGovernancePolicy, DisabledByUser, Deleted |
| `VerifiedPublisher` | `dynamic` | Specifies details about the verified publisher of the application which this service principal represents. Includes: DisplayName, VerifiedPublisherId, AddedDateTime |
| `PrivilegeLevel` | `string` | The privilege level of the app based on the highest classified permission granted to the app |
| `Permissions` | `dynamic` | Contains an array of permission objects; each includes PermissionName, TargetAppId, TargetAppDisplayName, PermissionType, PrivilegeLevel, UsageStatus |
| `ConsentedUsersCount` | `integer` | Count of users who have consented to the app; only available when the app isn't admin consented |
| `IsAdminConsented` | `boolean` | Value is True if a user has provided admin consent to the app on behalf of all the users in the org, otherwise False |
| `AppOrigin` | `string` | Specifies whether the app is internal to the organization or registered in an external tenant |
| `LastUsedTime` | `datetime` | Date and time when the app last signed in. Tracking of this data goes back to June, 2022 |
| `AppOwnerTenantId` | `string` | Specifies the ID of the tenant where the app was registered |
