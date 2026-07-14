# CloudAuditEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudauditevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudauditevents-table)

## Description

The `CloudAuditEvents` table in the advanced hunting schema contains information about cloud audit events for various cloud platforms protected by the organization's Microsoft Defender for Cloud. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `ReportId` | `string` | Unique identifier for the event |
| `DataSource` | `string` | Data source for the cloud audit events, can be GCP (for Google Cloud Platform), AWS (for Amazon Web Services), Azure (for Azure Resource Manager), Kubernetes Audit (for Kubernetes), or other cloud platforms |
| `ActionType` | `string` | Type of activity that triggered the event, can be: Unknown, Create, Read, Update, Delete, Other |
| `OperationName` | `string` | Audit event operation name as it appears in the record, usually includes both resource type and operation |
| `ResourceId` | `string` | Unique identifier of the cloud resource accessed |
| `IPAddress` | `string` | The client IP address used to access the cloud resource or control plane |
| `IsAnonymousProxy` | `boolean` | Indicates whether the IP address belongs to a known anonymous proxy (1) or no (0) |
| `CountryCode` | `string` | Two-letter code indicating the country where the client IP address is geolocated |
| `City` | `string` | City where the client IP address is geolocated |
| `Isp` | `string` | Internet service provider (ISP) associated with the IP address |
| `UserAgent` | `string` | User agent information from the web browser or other client application |
| `RawEventData` | `dynamic` | Full raw event information from the data source in JSON format |
| `AdditionalFields` | `dynamic` | Additional information about the audit event |

## Action Types

| ActionType | Description |
|---|---|
| Unknown | Activity type not identified |
| Create | Resource creation activity |
| Read | Resource read activity |
| Update | Resource update activity |
| Delete | Resource deletion activity |
| Other | Other activity types |
