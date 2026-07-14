# CloudDnsEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-clouddnsevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-clouddnsevents-table)

## Description

The `CloudDnsEvents` table in the advanced hunting schema contains information about DNS activity events from cloud infrastructure environments. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `ReportId` | `string` | Unique identifier for the event |
| `ActionType` | `string` | Type of activity that triggered the event |
| `AzureResourceId` | `string` | Unique identifier of the Azure resource associated with the process |
| `AwsResourceName` | `string` | Unique identifier specific to Amazon Web Services devices, containing the Amazon resource name |
| `GcpFullResourceName` | `string` | Unique identifier specific to Google Cloud Platform devices, containing a combination of zone and ID for GCP |
| `KubernetesResource` | `string` | Unique identifier for the Kubernetes resource that includes the namespace, resource type and name |
| `KubernetesNamespace` | `string` | The Kubernetes namespace name |
| `KubernetesPodName` | `string` | The Kubernetes pod name |
| `ContainerName` | `string` | Name of the container in Kubernetes or another runtime environment |
| `ContainerId` | `string` | The container identifier in Kubernetes or another runtime environment |
| `ImageName` | `string` | Container image name or ID |
| `ProcessName` | `string` | The name of the process that initiated the DNS query |
| `ProcessId` | `long` | Process ID that initiated the DNS query |
| `DnsEventType` | `string` | Type of event associated with DNS operation (for example, query) |
| `DnsEventSubType` | `string` | Either request or response |
| `DnsQuery` | `string` | The domain that needs to be resolved |
| `DnsQueryTypeName` | `string` | The DNS resource record type name as defined by the Internet Assigned Numbers Authority (IANA) |
| `DnsResponseCodeName` | `string` | The DNS response code name as defined by the Internet Assigned Numbers Authority (IANA) |
| `DnsNetworkDuration` | `long` | The DNS request duration in milliseconds |
| `TransactionIdHex` | `string` | The DNS unique hex transaction ID |
| `AdditionalFields` | `dynamic` | Additional information about the entity or event |
