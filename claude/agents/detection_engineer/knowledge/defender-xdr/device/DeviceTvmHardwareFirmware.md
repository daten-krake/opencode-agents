# DeviceTvmHardwareFirmware

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmhardwarefirmware-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmhardwarefirmware-table)

## Description

The `DeviceTvmHardwareFirmware` table in the advanced hunting schema contains hardware and firmware information of devices as checked by Microsoft Defender Vulnerability Management. The information includes the system model, processor, and BIOS, among others.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| ComponentType | string | Type of hardware or firmware component |
| Manufacturer | string | Manufacturer of hardware or firmware component |
| ComponentName | string | Name of hardware or firmware component |
| ComponentFamily | string | Component family or class, a grouping of components that have similar features or characteristics as determined by the manufacturer |
| ComponentVersion | string | Component version (for example, BIOS version) |
| AdditionalFields | dynamic | Additional information about the components in JSON array format |
