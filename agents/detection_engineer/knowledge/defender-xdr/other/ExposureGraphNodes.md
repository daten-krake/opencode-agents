# ExposureGraphNodes

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphnodes-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphnodes-table)

## Description
The `ExposureGraphNodes` table in the advanced hunting schema contains organizational entities and their properties. These include entities like devices, identities, user groups, and cloud assets such as virtual machines (VMs), storage, and containers. Each node corresponds to an individual entity and encapsulates information about its characteristics, attributes, and security related insights within the organizational structure. Use this reference to construct queries that return information from this table.

This advanced hunting table is populated by records from various Microsoft Defender services, including Defender for Endpoint, Defender for Identity, Defender for Cloud, Entra ID, and others. The table also gets populated by third-party data through the various Security Exposure Management data connectors. The more security products you deploy, the richer the graph becomes with more meaningful data. If your organization hasn't deployed any service in Microsoft Defender XDR, queries that use the table aren't going to work or return any results.

## Columns

| Column Name | Type | Description |
|---|---|---|
| NodeId | string | Unique node identifier |
| NodeLabel | string | Node label |
| NodeName | string | Node display name |
| Categories | dynamic | Categories of the node in JSON format |
| NodeProperties | dynamic | Properties of the node, including insights related to the resource, such as whether the resource is exposed to the internet, or vulnerable to remote code execution. Values are JSON formatted raw data (unstructured). |
| EntityIds | dynamic | All known node identifiers in JSON format |
