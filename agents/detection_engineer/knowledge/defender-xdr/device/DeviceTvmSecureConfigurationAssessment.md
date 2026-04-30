# DeviceTvmSecureConfigurationAssessment

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessment-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessment-table)

## Description

Each row in the `DeviceTvmSecureConfigurationAssessment` table contains an assessment event for a specific security configuration from Microsoft Defender Vulnerability Management. Use this reference to check the latest assessment results and determine whether devices are compliant.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| OSPlatform | string | Platform of the operating system running on the device. Indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10, and Windows 7. |
| Timestamp | datetime | Date and time when the record was generated |
| ConfigurationId | string | Unique identifier for a specific configuration |
| ConfigurationCategory | string | Category or grouping to which the configuration belongs: Application, OS, Network, Accounts, Security controls |
| ConfigurationSubcategory | string | Subcategory or subgrouping to which the configuration belongs. In many cases, string describes specific capabilities or features. |
| ConfigurationImpact | real | Rated impact of the configuration to the overall configuration score (1-10) |
| IsCompliant | boolean | Indicates whether the configuration or policy is properly configured |
| IsApplicable | boolean | Indicates whether the configuration or policy applies to the device |
| Context | dynamic | Additional contextual information about the configuration or policy |
| IsExpectedUserImpact | boolean | Indicates whether there will be user impact if the configuration or policy is applied |
