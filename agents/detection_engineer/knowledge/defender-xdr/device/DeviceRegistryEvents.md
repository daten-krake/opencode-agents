# DeviceRegistryEvents

Source: [advanced-hunting-deviceregistryevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceregistryevents-table)

## Description
The `DeviceRegistryEvents` table in the advanced hunting schema contains information about the creation and modification of registry entries. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the event was recorded |
| `DeviceId` | `string` | Unique identifier for the device in the service |
| `DeviceName` | `string` | Fully qualified domain name (FQDN) of the device |
| `ActionType` | `string` | Type of activity that triggered the event |
| `RegistryKey` | `string` | Registry key that the recorded action was applied to |
| `RegistryValueType` | `string` | Data type, such as binary or string, of the registry value that the recorded action was applied to |
| `RegistryValueName` | `string` | Name of the registry value that the recorded action was applied to |
| `RegistryValueData` | `string` | Data of the registry value that the recorded action was applied to |
| `PreviousRegistryKey` | `string` | Original registry key of the registry value before it was modified |
| `PreviousRegistryValueName` | `string` | Original name of the registry value before it was modified |
| `PreviousRegistryValueData` | `string` | Original data of the registry value before it was modified |
| `InitiatingProcessAccountDomain` | `string` | Domain of the account that ran the process responsible for the event |
| `InitiatingProcessAccountName` | `string` | User name of the account that ran the process responsible for the event; if the device is registered in Microsoft Entra ID, the Entra ID user name of the account that ran the process responsible for the event might be shown instead |
| `InitiatingProcessAccountSid` | `string` | Security Identifier (SID) of the account that ran the process responsible for the event |
| `InitiatingProcessAccountUpn` | `string` | User principal name (UPN) of the account that ran the process responsible for the event; if the device is registered in Microsoft Entra ID, the Entra ID UPN of the account that ran the process responsible for the event might be shown instead |
| `InitiatingProcessAccountObjectId` | `string` | Microsoft Entra object ID of the user account that ran the process responsible for the event |
| `InitiatingProcessSHA1` | `string` | SHA-1 of the process (image file) that initiated the event |
| `InitiatingProcessSHA256` | `string` | SHA-256 of the process (image file) that initiated the event. This field is usually not populated — use the SHA1 column when available. |
| `InitiatingProcessMD5` | `string` | MD5 hash of the process (image file) that initiated the event |
| `InitiatingProcessFileName` | `string` | Name of the process file that initiated the event; if unavailable, the name of the process that initiated the event might be shown instead |
| `InitiatingProcessFileSize` | `long` | Size of the file that ran the process responsible for the event |
| `InitiatingProcessVersionInfoCompanyName` | `string` | Company name from the version information of the process (image file) responsible for the event |
| `InitiatingProcessVersionInfoProductName` | `string` | Product name from the version information of the process (image file) responsible for the event |
| `InitiatingProcessVersionInfoProductVersion` | `string` | Product version from the version information of the process (image file) responsible for the event |
| `InitiatingProcessVersionInfoInternalFileName` | `string` | Internal file name from the version information of the process (image file) responsible for the event |
| `InitiatingProcessVersionInfoOriginalFileName` | `string` | Original file name from the version information of the process (image file) responsible for the event |
| `InitiatingProcessVersionInfoFileDescription` | `string` | Description from the version information of the process (image file) responsible for the event |
| `InitiatingProcessId` | `long` | Process ID (PID) of the process that initiated the event |
| `InitiatingProcessCommandLine` | `string` | Command line used to run the process that initiated the event |
| `InitiatingProcessCreationTime` | `datetime` | Date and time when the process that initiated the event was started |
| `InitiatingProcessFolderPath` | `string` | Folder containing the process (image file) that initiated the event |
| `InitiatingProcessParentId` | `long` | Process ID (PID) of the parent process that spawned the process responsible for the event |
| `InitiatingProcessParentFileName` | `string` | Name of the parent process that spawned the process responsible for the event |
| `InitiatingProcessParentCreationTime` | `datetime` | Date and time when the parent of the process responsible for the event was started |
| `InitiatingProcessIntegrityLevel` | `string` | Integrity level of the process that initiated the event. Windows assigns integrity levels to processes based on certain characteristics, such as if they were launched from an internet download. These integrity levels influence permissions to resources. |
| `InitiatingProcessTokenElevation` | `string` | Token type indicating the presence or absence of User Access Control (UAC) privilege elevation applied to the process that initiated the event |
| `ReportId` | `long` | Event identifier based on a repeating counter. To identify unique events, this column must be used in conjunction with the DeviceName and Timestamp columns. |
| `AppGuardContainerId` | `string` | Identifier for the virtualized container used by Application Guard to isolate browser activity |
| `InitiatingProcessSessionId` | `long` | Windows session ID of the initiating process |
| `IsInitiatingProcessRemoteSession` | `bool` | Indicates whether the initiating process was run under a remote desktop protocol (RDP) session (true) or locally (false) |
| `InitiatingProcessRemoteSessionDeviceName` | `string` | Device name of the remote device from which the initiating process's RDP session was initiated |
| `InitiatingProcessRemoteSessionIP` | `string` | IP address of the remote device from which the initiating process's RDP session was initiated |
| `ProcessUniqueId` | `string` | Unique identifier of the process; this is equal to the Process Start Key in Windows devices |
| `InitiatingProcessUniqueId` | `string` | Unique identifier of the initiating process; this is equal to the Process Start Key in Windows devices |
