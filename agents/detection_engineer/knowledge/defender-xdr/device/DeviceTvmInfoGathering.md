# DeviceTvmInfoGathering

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogathering-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogathering-table)

## Description

The `DeviceTvmInfoGathering` table in the advanced hunting schema contains Microsoft Defender Vulnerability Management assessment events including the status of various configurations and attack surface area states of devices. You can use this table to hunt for assessment events related to mitigation for zero-days, posture assessment for emerging threats supporting threat analytics mitigation status reports, enabled TLS protocol versions on servers, and more.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Date and time when the record was generated |
| LastSeenTime | datetime | Date and time when the service last saw the device |
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| OSPlatform | string | Platform of the operating system running on the device. This indicates specific operating systems, including variations within the same family, such as Windows 10 and Windows 7. |
| AdditionalFields | dynamic | Additional information about the entity or event |
