# CloudPolicyEnforcementEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudpolicyenforcementevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudpolicyenforcementevents-table)

## Description

The `CloudPolicyEnforcementEvents` table in the advanced hunting schema contains policy enforcement evaluation decisions and metadata of security gating events for various cloud platforms protected by the organization's Microsoft Defender for Cloud. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the record was generated |
| `ReportId` | `string` | Unique identifier for the event |
| `DataSource` | `string` | Data source of the cloud events; possible values: Google Kubernetes Engine, Elastic Kubernetes Service, or Azure Kubernetes Service |
| `SubscriptionId` | `string` | Unique identifier assigned to the Azure subscription |
| `ActionType` | `string` | Type of activity that resulted from the policy enforcement operation; possible values: Audit, Deny, or Allow |
| `AzureResourceId` | `string` | Unique identifier of the Azure resource associated with the event |
| `AwsResourceName` | `string` | Unique identifier specific to Amazon Web Services devices, containing the Amazon resource name |
| `GcpFullResourceName` | `string` | Unique identifier specific to Google Cloud Platform devices, containing a combination of zone and ID for GCP |
| `Region` | `string` | The region associated with the Kubernetes cluster |
| `ResourceKind` | `string` | Type or kind of Kubernetes resource created or managed (for example, pod or deployment) |
| `ResourceName` | `string` | Name of the Kubernetes resource |
| `KubernetesNamespace` | `string` | The Kubernetes namespace name |
| `Reason` | `string` | Information explaining the action result |
| `AdditionalFields` | `string` | Additional information about the entity or event |

## Action Types

| ActionType | Description |
|---|---|
| Audit | Policy evaluated the operation and logged it for auditing |
| Deny | Policy evaluated the operation and blocked it |
| Allow | Policy evaluated the operation and permitted it |
