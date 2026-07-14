# DeviceTvmSoftwareEvidenceBeta

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareevidencebeta-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareevidencebeta-table)

## Description

The `DeviceTvmSoftwareEvidenceBeta` table in the advanced hunting schema contains data from Microsoft Defender Vulnerability Management related to the software evidence section. This table allows you to view evidence of where a specific software was detected on a device. You can use this table, for example, to identify the file paths of specific software.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| SoftwareVendor | string | Name of the software publisher |
| SoftwareName | string | Name of the software product |
| SoftwareVersion | string | Version number of the software product |
| RegistryPaths | dynamic | Registry paths where evidence indicating the existence of the software on a device was detected |
| DiskPaths | dynamic | Disk paths where file-level evidence indicating the existence of the software on a device was detected |
| LastSeenTime | string | Date and time when the device was last seen by this service |
