# DeviceTvmSoftwareInventory

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareinventory-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwareinventory-table)

## Description
The `DeviceTvmSoftwareInventory` table in the advanced hunting schema contains the Microsoft Defender Vulnerability Management inventory of software currently installed on devices in your network, including end of support information. You can, for instance, hunt for events involving devices that are installed with a currently vulnerable software version. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| OSPlatform | string | Platform of the operating system running on the device. This indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10, and Windows 7. |
| OSVersion | string | Version of the operating system running on the device |
| OSArchitecture | string | Architecture of the operating system running on the device |
| SoftwareVendor | string | Name of the software vendor |
| SoftwareName | string | Name of the software product |
| SoftwareVersion | string | Version number of the software product |
| EndOfSupportStatus | string | Indicates the lifecycle stage of the software product relative to its specified end-of-support (EOS) or end-of-life (EOL) date |
| EndOfSupportDate | datetime | End-of-support (EOS) or end-of-life (EOL) date of the software product |
| ProductCodeCpe | string | The standard Common Platform Enumeration (CPE) name of the software product version or 'not available' where there's no CPE |
