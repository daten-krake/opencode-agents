# DeviceTvmBrowserExtensions

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensions-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmbrowserextensions-table)

## Description

Each row in the `DeviceTvmBrowserExtensions` table contains information about browser extension installations found on devices from Microsoft Defender Vulnerability Management.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| BrowserName | string | Name of the web browser with the extension |
| ExtensionId | string | Unique identifier for the browser extension |
| ExtensionName | string | Name of the extension |
| ExtensionDescription | string | Description from the publisher about the extension |
| ExtensionVersion | string | Version number of the extension |
| ExtensionRisk | string | Risk level for the extension based on the permissions it has requested |
| ExtensionVendor | string | Name of the vendor offering the extension |
| IsActivated | string | Whether the extension is turned on or off on the devices |
| InstallationTime | datetime | Date and time when the browser extension was first installed |
