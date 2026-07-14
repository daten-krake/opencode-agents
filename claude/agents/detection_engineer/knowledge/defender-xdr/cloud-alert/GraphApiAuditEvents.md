# GraphApiAuditEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-graphapiauditevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-graphapiauditevents-table)

## Description

The `GraphApiAuditEvents` table in the advanced hunting schema contains information about Microsoft Entra ID API requests made to Microsoft Graph API for resources in the tenant. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `IdentityProvider` | `string` | Identity provider that authenticated the subject of the token |
| `ApiVersion` | `string` | The API version of the event |
| `ApplicationId` | `string` | Unique identifier for the application |
| `IPAddress` | `string` | The IP address of the client from where the request was made |
| `ClientRequestId` | `string` | Identifier for the client request sent; if none is available, the operation identifier is used instead |
| `EntityType` | `string` | Type of object, such as a file, a process, a device, or a user, that made the request |
| `RequestUri` | `string` | Uniform resource identifier (URI) of the request |
| `AccountObjectId` | `string` | Unique identifier for the account making the request |
| `OperationId` | `string` | Identifier for a batch of requests; the same identifier is used for all requests in a batch but if requests are non-batched, the identifier is unique per request |
| `Location` | `string` | Name of the region that served the request |
| `RequestDuration` | `string` | Duration of the request in milliseconds |
| `RequestId` | `string` | Unique identifier of the request |
| `RequestMethod` | `string` | HTTP method of the request |
| `Timestamp` | `string` | Date and time when the request was recorded |
| `ResponseStatusCode` | `string` | HTTP response status code for the request |
| `Scopes` | `string` | Scopes in token claims |
| `UniqueTokenIdentifier` | `string` | Unique identifier embedded in every access token and ID token that were issued |
| `TargetWorkload` | `string` | The target workload (for example, Microsoft.Exchange, Microsoft.SharePoint) the API call was made to |
| `ServicePrincipalId` | `string` | The identifier for the Service Principal making the request |
| `ResponseSize` | `int` | The size of the response in bytes |
