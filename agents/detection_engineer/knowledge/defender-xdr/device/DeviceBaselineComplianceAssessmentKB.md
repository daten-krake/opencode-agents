# DeviceBaselineComplianceAssessmentKB

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessmentkb-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicebaselinecomplianceassessmentkb-table)

## Description

The `DeviceBaselineComplianceAssessmentKB` table in the advanced hunting schema contains information about various security configurations used by baseline compliance to assess devices.

## Columns

| Column Name | Type | Description |
|---|---|---|
| ConfigurationId | string | Unique identifier for a specific configuration |
| ConfigurationName | string | Display name of the configuration |
| ConfigurationDescription | string | Description of the configuration |
| ConfigurationRationale | string | Description of any associated risks and rationale behind the configuration |
| ConfigurationCategory | string | Category or grouping to which the configuration belongs |
| BenchmarkProfileLevels | dynamic | List of benchmark compliance levels for which the configuration is applicable |
| CCEReference | string | Unique Common Configuration Enumeration (CCE) identifier for the configuration |
| RemediationOptions | string | Recommended actions to reduce or address any associated risks |
| ConfigurationBenchmark | string | Industry benchmark recommending the configuration |
| Source | dynamic | The registry path or other location used to determine the current device setting |
| RecommendedValue | dynamic | Set of expected values for the current device setting to be compliant |
