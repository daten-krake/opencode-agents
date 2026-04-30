# DeviceTvmSoftwareVulnerabilities

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilities-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmsoftwarevulnerabilities-table)

## Description
The `DeviceTvmSoftwareVulnerabilities` table in the advanced hunting schema contains the Microsoft Defender Vulnerability Management list of vulnerabilities in installed software products. This table also includes operating system information, CVE IDs, and vulnerability severity information. You can use this table, for example, to hunt for events involving devices that have severe vulnerabilities in their software. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| OSPlatform | string | Platform of the operating system running on the device. Indicates specific operating systems, including variations within the same family, such as Windows 11, Windows 10, and Windows 7. |
| OSVersion | string | Version of the operating system running on the device |
| OSArchitecture | string | Architecture of the operating system running on the device |
| SoftwareVendor | string | Name of the software publisher |
| SoftwareName | string | Name of the software product |
| SoftwareVersion | string | Version number of the software product |
| CveId | string | Unique identifier assigned to the security vulnerability under the Common Vulnerabilities and Exposures (CVE) system |
| VulnerabilitySeverityLevel | string | Severity level assigned to the security vulnerability based on the CVSS score and dynamic factors influenced by the threat landscape |
| RecommendedSecurityUpdate | string | Name or description of the security update provided by the software publisher to address the vulnerability |
| RecommendedSecurityUpdateId | string | Identifier of the applicable security updates or identifier for the corresponding guidance or knowledge base (KB) articles |
| CveTags | dynamic | Array of tags relevant to the CVE; example: ZeroDay, NoSecurityUpdate |
