# DeviceTvmBrowserExtensionsKB

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensionskb-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensionskb-table)

## Description

The `DeviceTvmBrowserExtensionsKB` table in the advanced hunting schema contains information about browser extension details and permission information used in Microsoft Defender Vulnerability Management browser extensions page.

## Columns

| Column Name | Type | Description |
|---|---|---|
| BrowserName | string | Name of the web browser with the extension |
| ExtensionId | string | Unique identifier for the browser extension |
| ExtensionName | string | Name of the extension |
| ExtensionDescription | string | Description from the publisher about the extension |
| ExtensionVersion | dynamic | Version number of the extension |
| ExtensionRisk | string | Risk level for the extension based on the permissions it has requested |
| PermissionId | string | Unique identifier for the permission |
| PermissionName | string | Name given to each permission based on what the extension is asking for |
| PermissionDescription | string | Explanation of what the permission is supposed to do |
| PermissionRisk | string | Risk level for the permission based on the type of access it would allow |
| IsPermissionRequired | string | Whether the permission is required for the extension to run, or optional |
