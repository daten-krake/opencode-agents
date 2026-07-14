# ExposureGraphEdges

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphedges-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-exposuregraphedges-table)

## Description
The `ExposureGraphEdges` table in the advanced hunting schema provides visibility into relationships between entities and assets in the enterprise exposure graph. This visibility can help uncover critical organizational assets and explore entity relationships and attack paths. Use this reference to construct queries that return information from this table.

This advanced hunting table is populated by records from various Microsoft Defender services, including Defender for Endpoint, Defender for Identity, Defender for Cloud, Entra ID, and others. The table also gets populated by third-party data through the various Security Exposure Management data connectors. The more security products you deploy, the richer the graph becomes with more meaningful data. If your organization hasn't deployed any service in Microsoft Defender XDR, queries that use the table aren't going to work or return any results.

## Columns

| Column Name | Type | Description |
|---|---|---|
| EdgeId | string | Unique identifier for the relationship/edge |
| EdgeLabel | string | The edge label like "routes traffic to" |
| SourceNodeId | string | Node ID of the edge's source |
| SourceNodeName | string | Source node display name |
| SourceNodeLabel | string | Source node label |
| SourceNodeCategories | dynamic | Categories list of the source node in JSON format |
| TargetNodeId | string | Node ID of the edge's target |
| TargetNodeName | string | Display name of the target node |
| TargetNodeLabel | string | Target node label |
| TargetNodeCategories | dynamic | The categories list of the target node in JSON format |
| EdgeProperties | dynamic | Optional data relevant for the relationship between the nodes in JSON format |
