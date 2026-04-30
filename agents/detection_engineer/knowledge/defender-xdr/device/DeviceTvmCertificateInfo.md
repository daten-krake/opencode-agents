# DeviceTvmCertificateInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmcertificateinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicetvmcertificateinfo-table)

## Description

The `DeviceTvmCertificateInfo` table in the advanced hunting schema contains data from Microsoft Defender Vulnerability Management related to certificate information for devices in the organization. Use this reference to construct queries that return information from the table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| DeviceId | string | Unique identifier for the device in the service |
| Thumbprint | string | Unique identifier for the certificate |
| Path | string | The location of the certificate |
| SerialNumber | string | Unique identifier for the certificate within a certificate authority's systems |
| IssuedTo | dynamic | Entity that a certificate belongs to; can be a device, an individual, or an organization |
| IssuedBy | dynamic | Entity that verified the information and signed the certificate |
| FriendlyName | string | Easy-to-understand version of a certificate's title |
| SignatureAlgorithm | string | Hashing algorithm and encryption algorithm used |
| KeySize | string | Size of the key used in the signature algorithm |
| ExpirationDate | string | The date and time beyond which the certificate is no longer valid |
| IssueDate | string | The earliest date and time when the certificate became valid |
| SubjectType | string | Indicates if the holder of the certificate is a CA or end entity |
| KeyUsage | string | The valid cryptographic uses of the certificate's public key |
| ExtendedKeyUsage | string | Other valid uses for the certificate |
