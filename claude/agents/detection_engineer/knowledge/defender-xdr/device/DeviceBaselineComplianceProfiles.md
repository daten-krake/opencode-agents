# DeviceBaselineComplianceProfiles

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceprofiles-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceprofiles-table)

## Description

The `DeviceBaselineComplianceProfiles` table in the advanced hunting schema contains baseline profiles used for monitoring device baseline compliance. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| ProfileId | string | Unique identifier for the profile |
| ProfileName | string | Display name of the profile |
| ProfileDescription | string | Optional description providing additional information related to the profile |
| OSPlatform | dynamic | Platform of the operating system running on the device. This indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10 and Windows 7. |
| OSVersion | string | Version of the operating system running on the device |
| BaseBenchmark | string | Industry benchmark on top of which the profile was created |
| BenchmarkVersion | string | Version of the industry benchmark on top of which the profile was created |
| BenchmarkProfileLevel | string | Benchmark compliance level set for the profile |
| Status | boolean | Indicator of the profile status - can be Enabled or Disabled |
| CreatedBy | string | Identity of the user account who created the profile |
| CreatedOn | datetime | Date and time when the profile was created |
| LastUpdatedBy | string | Identity of the user account who last updated the profile |
| LastUpdatedOn | datetime | Date and time when the profile was last updated |
