# DeviceTvmInfoGatheringKB

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogatheringkb-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvminfogatheringkb-table)

## Description

The `DeviceTvmInfoGatheringKB` table in the advanced hunting schema contains metadata for Microsoft Defender Vulnerability Management assessment events data collected in the `DeviceTvmInfoGathering` table. The `DeviceTvmInfoGatheringKB` table contains the list of various configuration and attack surface area assessments used by Defender Vulnerability Management information gathering to assess devices.

## Columns

| Column Name | Type | Description |
|---|---|---|
| IgId | string | Unique identifier for the piece of information gathered |
| FieldName | string | Name of the field where this information appears in the AdditionalFields column of the DeviceTvmInfoGathering table |
| Description | string | Description of the information gathered |
| Categories | dynamic | List of categories that the information belongs to, in JSON array format |
| DataStructure | string | The data structure of the information gathered |
