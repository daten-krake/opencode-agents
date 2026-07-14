# DeviceTvmSoftwareVulnerabilitiesKB

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilitieskb-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilitieskb-table)

## Description
The `DeviceTvmSoftwareVulnerabilitiesKB` table in the advanced hunting schema contains the list of vulnerabilities Microsoft Defender Vulnerability Management assesses devices for. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| CveId | string | Unique identifier assigned to the security vulnerability under the Common Vulnerabilities and Exposures (CVE) system |
| CvssScore | string | Severity score assigned to the security vulnerability under the Common Vulnerability Scoring System (CVSS) |
| IsExploitAvailable | boolean | Indicates whether exploit code for the vulnerability is publicly available |
| VulnerabilitySeverityLevel | string | Severity level assigned to the security vulnerability based on the CVSS score and dynamic factors influenced by the threat landscape |
| LastModifiedTime | datetime | Date and time the item or related metadata was last modified |
| PublishedDate | datetime | Date vulnerability was disclosed to the public |
| VulnerabilityDescription | string | Description of the vulnerability and associated risks |
| AffectedSoftware | dynamic | List of all software products affected by the vulnerability |
