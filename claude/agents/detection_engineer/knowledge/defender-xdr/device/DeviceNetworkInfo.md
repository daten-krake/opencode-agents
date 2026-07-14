# DeviceNetworkInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicenetworkinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicenetworkinfo-table)

## Description

The `DeviceNetworkInfo` table in the advanced hunting schema contains information about networking configuration of machines, including network adapters, IP and MAC addresses, and connected networks or domains. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Date and time when the event was recorded |
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| NetworkAdapterName | string | Name of the network adapter |
| MacAddress | string | MAC address of the network adapter |
| NetworkAdapterType | string | Network adapter type. For the possible values, refer to this enumeration. |
| NetworkAdapterStatus | string | Operational status of the network adapter. For the possible values, refer to this enumeration. |
| TunnelType | string | Tunneling protocol, if the interface is used for this purpose, for example 6to4, Teredo, ISATAP, PPTP, SSTP, and SSH |
| ConnectedNetworks | string | Networks that the adapter is connected to. Each JSON element in the array contains the network name, category (public, private or domain), a description, and a flag indicating if it's connected publicly to the internet. |
| DnsAddresses | string | DNS server addresses in JSON array format |
| IPv4Dhcp | string | IPv4 address of DHCP server |
| IPv6Dhcp | string | IPv6 address of DHCP server |
| DefaultGateways | string | Default gateway addresses in JSON array format |
| IPAddresses | string | JSON array containing all the IP addresses assigned to the adapter, along with their respective subnet prefix and IP address space, such as public, private, or link-local |
| ReportId | long | Event identifier based on a repeating counter. To identify unique events, this column must be used in conjunction with the DeviceName and Timestamp columns. |
| NetworkAdapterVendor | string | Name of the manufacturer or vendor of the network adapter |
| OnboardingStatus | string | Indicates whether the device is currently onboarded to Microsoft Defender for Endpoint or if the device is not supported |
| NetworkAdapterDnsSuffix | string | Domain suffix assigned to the device's network adapter, indicating the network environment the network adapter is connected to |
