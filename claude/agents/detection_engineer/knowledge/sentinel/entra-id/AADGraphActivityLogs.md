# AADGraphActivityLogs

Source: https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/aadgraphactivitylogs

## Description
AAD Graph Activity Logs provide details of legacy API requests made to Azure Active Directory Graph for resources in the tenant.

## Columns

| Column Name | Type | Description |
|---|---|---|
| AADTenantId | string | The identifier of the tenant where the request was made. |
| ActorType | string | The type of actor making the request (e.g., User, Application). |
| ApiVersion | string | The API version of the operation. |
| AppId | string | The identifier of the application making the request. |
| _BilledSize | real | The record size in bytes |
| CallerIpAddress | string | The IP address of the caller making the request. |
| Category | string | The log category, e.g., AzureADGraphActivityLogs. |
| ClientAuthMethod | string | The authentication method used by the client. |
| DeviceId | string | The identifier of the device used in the request. |
| DurationMs | int | The duration of the request in milliseconds. |
| IdentityProvider | string | The identity provider used during authentication. |
| _IsBillable | string | Specifies whether ingesting the data is billable. When _IsBillable is `false` ingestion isn't billed to your Azure account |
| Level | string | The severity level of the event (e.g., Informational). |
| Location | string | The name of the region that served the request. |
| OperationName | string | The name of the operation performed on the resource. |
| RequestId | string | The identifier representing the request. |
| RequestMethod | string | The HTTP method used (e.g., GET, POST). |
| RequestUri | string | The URI of the request sent to the AAD Graph API. |
| _ResourceId | string | A unique identifier for the resource that the record is associated with |
| ResponseSizeBytes | int | The size of the response returned to the caller, in bytes. |
| ResponseStatusCode | int | The HTTP status code returned in the response. |
| ResultSignature | string | The HTTP response status or outcome of the operation. |
| Roles | string | The roles assigned in the token claims. |
| Scopes | string | The scopes included in the token claims. |
| ServicePrincipalId | string | The identifier of the service principal making the request. |
| SessionId | string | The session identifier from the request context. |
| SignInActivityId | string | The identifier representing the sign-in activity. |
| SourceSystem | string | The type of agent the event was collected by. For example, `OpsManager` for Windows agent, either direct connect or Operations Manager, `Linux` for all Linux agents, or `Azure` for Azure Diagnostics |
| _SubscriptionId | string | A unique identifier for the subscription that the record is associated with |
| TenantId | string | The Log Analytics workspace ID |
| TimeGenerated | datetime | The date and time the request was received. |
| TimeRequested | datetime | The timestamp when the request was made. |
| TokenIssuedAt | datetime | The timestamp when the token was issued. |
| Type | string | The name of the table |
| UserAgent | string | The user agent string provided by the client. |
| UserId | string | The identifier of the user making the request. |
| Wids | string | The WIDs from the token claims. |
