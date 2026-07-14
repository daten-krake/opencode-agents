# CloudProcessEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudprocessevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudprocessevents-table)

## Description

The `CloudProcessEvents` table in the advanced hunting schema contains information about process events in multicloud hosted environments such as Azure Kubernetes Service, Amazon Elastic Kubernetes Service, and Google Kubernetes Engine as protected by the organization's Microsoft Defender for Cloud. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `AzureResourceId` | `string` | Unique identifier of the Azure resource associated with the process |
| `AwsResourceName` | `string` | Unique identifier specific to Amazon Web Services devices, containing the Amazon resource name |
| `GcpFullResourceName` | `string` | Unique identifier specific to Google Cloud Platform devices, containing a combination of zone and ID for GCP |
| `ContainerImageName` | `string` | The container image name or ID, if it exists |
| `KubernetesNamespace` | `string` | The Kubernetes namespace name |
| `KubernetesPodName` | `string` | The Kubernetes pod name |
| `KubernetesResource` | `string` | Identifier value that includes namespace, resource type and name |
| `ContainerName` | `string` | Name of the container in Kubernetes or another runtime environment |
| `ContainerId` | `string` | The container identifier in Kubernetes or another runtime environment |
| `ActionType` | `string` | Type of activity that triggered the event. See the in-portal schema reference for details. |
| `FileName` | `string` | Name of the file that the recorded action was applied to |
| `FolderPath` | `string` | Folder containing the file that the recorded action was applied to |
| `ProcessId` | `long` | Process ID (PID) of the newly created process |
| `ProcessName` | `string` | The name of the process |
| `ParentProcessName` | `string` | The name of the parent process |
| `ParentProcessId` | `string` | The process ID (PID) of the parent process |
| `ProcessCommandLine` | `string` | Command line used to create the new process |
| `ProcessCreationTime` | `datetime` | Date and time the process was created |
| `ProcessCurrentWorkingDirectory` | `string` | Current working directory of the running process |
| `AccountName` | `string` | User name of the account |
| `LogonId` | `long` | Identifier for a logon session. This identifier is unique on the same pod or container between restarts. |
| `InitiatingProcessId` | `string` | Process ID (PID) of the process that initiated the event |
| `AdditionalFields` | `string` | Additional information about the event in JSON array format |
