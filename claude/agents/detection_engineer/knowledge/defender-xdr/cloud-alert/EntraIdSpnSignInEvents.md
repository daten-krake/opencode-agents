# EntraIdSpnSignInEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-entraidspnsigninevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-entraidspnsigninevents-table)

## Description

The `EntraIdSpnSignInEvents` table in the advanced hunting schema contains information about Microsoft Entra service principal and managed identity sign-ins. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the record was generated |
| `Application` | `string` | Application that performed the recorded action |
| `ApplicationId` | `string` | Unique identifier for the application |
| `IsManagedIdentity` | `boolean` | Indicates whether the sign-in was initiated by a managed identity |
| `ErrorCode` | `int` | Contains the error code if a sign-in error occurs. To find a description of a specific error code, visit https://aka.ms/AADsigninsErrorCodes. |
| `CorrelationId` | `string` | Unique identifier of the sign-in event |
| `ServicePrincipalName` | `string` | Name of the service principal that initiated the sign-in |
| `ServicePrincipalId` | `string` | Unique identifier of the service principal that initiated the sign-in |
| `ResourceDisplayName` | `string` | Display name of the resource accessed. The display name can contain any character. |
| `ResourceId` | `string` | Unique identifier of the resource accessed |
| `ResourceTenantId` | `string` | Unique identifier of the tenant of the resource accessed |
| `IPAddress` | `string` | IP address assigned to the endpoint and used during related network communications |
| `Country` | `string` | Two-letter code indicating the country/region where the client IP address is geolocated |
| `State` | `string` | State where the sign-in occurred, if available |
| `City` | `string` | City where the account user is located |
| `Latitude` | `string` | The north to south coordinates of the sign-in location |
| `Longitude` | `string` | The east to west coordinates of the sign-in location |
| `RequestId` | `string` | Unique identifier of the request |
| `ReportId` | `string` | Unique identifier for the event |
