# DeviceBaselineComplianceAssessment

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessment-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessment-table)

## Description

The `DeviceBaselineComplianceAssessment` table in the advanced hunting schema contains baseline compliance assessment snapshot, which indicates the status of various security configurations related to baseline profiles on devices.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| OSPlatform | string | Platform of the operating system running on the device. This indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10 and Windows 7. |
| OSVersion | string | Version of the operating system running on the device |
| ConfigurationId | string | Unique identifier for a specific configuration |
| ProfileId | string | Unique identifier for the profile |
| IsCompliant | nullable bool | Indicates whether the device that initiated the event is compliant or not |
| IsApplicable | boolean | Indicates whether the configuration or policy is applicable |
| Source | dynamic | The registry path or other location used to determine the current device setting |
| RecommendedValue | dynamic | Set of expected values for the current device setting to be compliant |
| CurrentValue | dynamic | Set of detected values found on the device |
| IsExempt | boolean | Indicates whether the device is exempt from having the baseline configuration |
