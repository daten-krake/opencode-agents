# DeviceFileCertificateInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicefilecertificateinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-devicefilecertificateinfo-table)

## Description

The `DeviceFileCertificateInfo` table in the advanced hunting schema contains information about file signing certificates. This table uses data obtained from certificate verification activities regularly performed on files on endpoints.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Date and time when the record was generated |
| DeviceId | string | Unique identifier for the device in the service |
| DeviceName | string | Fully qualified domain name (FQDN) of the device |
| SHA1 | string | SHA-1 of the file that the recorded action was applied to |
| IsSigned | bool | Indicates whether the file is signed |
| SignatureType | string | Indicates whether signature information was read as embedded content in the file itself or read from an external catalog file |
| Signer | string | Information about the signer of the file |
| SignerHash | string | Unique hash value identifying the signer |
| Issuer | string | Information about the issuing certificate authority (CA) |
| IssuerHash | string | Unique hash value identifying issuing certificate authority (CA) |
| CertificateSerialNumber | string | Identifier for the certificate that is unique to the issuing certificate authority (CA) |
| CrlDistributionPointUrls | string | JSON array listing the URLs of network shares that contain certificates and certificate revocation lists (CRLs) |
| CertificateCreationTime | datetime | Date and time the certificate was created |
| CertificateExpirationTime | datetime | Date and time the certificate is set to expire |
| CertificateCountersignatureTime | datetime | Date and time the certificate was countersigned |
| IsTrusted | bool | Indicates whether the file is trusted based on the results of the WinVerifyTrust function, which checks for unknown root certificate information, invalid signatures, revoked certificates, and other questionable attributes |
| IsRootSignerMicrosoft | boolean | Indicates whether the signer of the root certificate is Microsoft and if the file is included in Windows operating system |
| ReportId | long | Event identifier based on a repeating counter. To identify unique events, this column must be used in conjunction with the DeviceName and Timestamp columns. |
