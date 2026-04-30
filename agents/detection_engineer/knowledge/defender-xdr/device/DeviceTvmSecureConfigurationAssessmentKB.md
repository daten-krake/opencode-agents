# DeviceTvmSecureConfigurationAssessmentKB

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessmentkb-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsecureconfigurationassessmentkb-table)

## Description

The `DeviceTvmSecureConfigurationAssessmentKB` table in the advanced hunting schema contains information about the various secure configurations checked by Microsoft Defender Vulnerability Management. It also includes risk information, related industry benchmarks, and applicable MITRE ATT&CK techniques and tactics.

## Columns

| Column Name | Type | Description |
|---|---|---|
| ConfigurationId | string | Unique identifier for a specific configuration |
| ConfigurationImpact | real | Rated impact of the configuration to the overall configuration score (1-10) |
| ConfigurationName | string | Display name of the configuration |
| ConfigurationDescription | string | Description of the configuration |
| RiskDescription | string | Description of the associated risk |
| ConfigurationCategory | string | Category or grouping to which the configuration belongs: Application, OS, Network, Accounts, Security controls |
| ConfigurationSubcategory | string | Subcategory or subgrouping to which the configuration belongs. In many cases, this describes specific capabilities or features. |
| ConfigurationBenchmarks | dynamic | List of industry benchmarks recommending the same or similar configuration |
| Tags | dynamic | Labels representing various attributes used to identify or categorize a security configuration |
| RemediationOptions | string | Recommended actions to reduce or address any associated risks |
