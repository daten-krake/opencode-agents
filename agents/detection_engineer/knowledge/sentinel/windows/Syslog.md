# Syslog

Source: https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/syslog

## Description
Syslog events on Linux computers using the Log Analytics agent.

## Columns

| Column Name | Type | Description |
|---|---|---|
| _BilledSize | real | The record size in bytes |
| CollectorHostName | string | Name of the system on which the collector agent is installed. |
| Computer | string | Computer from which the event originated. |
| EventTime | datetime | Date and time that the event was generated. |
| Facility | string | The part of the system that generated the message. |
| HostIP | string | IP address of the system from which the message originated. Depending on network configuration/topology, this may have a blank or placeholder value, especially when the message originates from a remote device. |
| HostName | string | Name of the system from which the message originated. |
| _IsBillable | string | Specifies whether ingesting the data is billable. When _IsBillable is `false` ingestion isn't billed to your Azure account |
| ProcessID | int | ID of the process that generated the message. |
| ProcessName | string | Name of the process that generated the message. |
| _ResourceId | string | A unique identifier for the resource that the record is associated with |
| SeverityLevel | string | Severity level of the event. |
| SourceSystem | string | The type of agent the event was collected by. For example, `OpsManager` for Windows agent, either direct connect or Operations Manager, `Linux` for all Linux agents, or `Azure` for Azure Diagnostics |
| _SubscriptionId | string | A unique identifier for the subscription that the record is associated with |
| SyslogMessage | string | Text of the message. |
| TimeGenerated | datetime | Date and time the record was created. |
| Type | string | The name of the table |
