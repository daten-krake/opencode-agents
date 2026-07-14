# CloudStorageAggregatedEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudstorageaggregatedevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudstorageaggregatedevents-table)

## Description

The `CloudStorageAggregatedEvents` table in the advanced hunting schema contains information about storage activity and related events. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `DataAggregationStartTime` | `datetime` | The start time during which the data was aggregated |
| `DataAggregationEndTime` | `datetime` | The end time during which the data was aggregated |
| `DataSource` | `string` | The source of the aggregated logs |
| `SubscriptionId` | `string` | Unique identifier assigned to the Azure subscription |
| `ResourceGroup` | `string` | Name of the resource group where the storage account resides |
| `StorageAccount` | `string` | The identifier for the storage account |
| `StorageContainer` | `string` | The identifier for the storage container |
| `StorageFileShare` | `string` | The identifier for the storage file share |
| `ServiceType` | `string` | Specifies the type of storage service (for example, Blob, ADLS Gen2, Files.REST, Files.SMB) |
| `IpAddress` | `string` | The IP addresses from which the storage was accessed |
| `UserAgentHeader` | `string` | Details of the user agent accessing the storage (for example, browser or application) |
| `OperationNamesList` | `object` | A list of storage operations performed (for example, CreateContainer, DeleteContainer) |
| `AuthenticationType` | `string` | The authentication method used to access the storage (for example, AccountKey, SAS, Oauth) |
| `AccountObjectId` | `string` | The unique identifier of the object is making the storage access |
| `AccountTenantId` | `long` | The unique identifier of the Azure tenant |
| `AccountApplicationId` | `string` | The application ID associated with the storage access |
| `AccountUpn` | `string` | The user principal name of the accessing user |
| `AccountType` | `long` | The account type used |
| `OperationsCount` | `int` | The total number of storage operations performed |
| `SuccessfulOperationsCount` | `int` | The count of successful storage operations |
| `FailedOperationsCount` | `int` | The count of failed storage operations |
| `FirstEventTimestamp` | `datetime` | The timestamp of the first observed operation in the aggregation period |
| `LastEventTimestamp` | `datetime` | The timestamp of the last observed operation in the aggregation period |
| `TotalResponseLength` | `int` | The total response length of all GET operations during the aggregation period |
| `SuccessfulReadOperations` | `int` | The count of successful read operations |
| `DistinctGetOperations` | `int` | The count of distinct GET operations performed |
| `AnonymousSuccessfulOperations` | `int` | The count of successful anonymous operations |
| `HasAnonymousResourceNotFoundFailures` | `bool` | Indicates whether anonymous resource not found failures occurred |
| `CountryName` | `string` | The name of the country from where the storage was accessed |
| `CityName` | `string` | The name of the city from where the storage was accessed |
| `ProvinceName` | `string` | The name of the province or state from where the storage was accessed |
| `ClientSystemServiceName` | `string` | The name of the system service is in the data center |
| `ClientCloudPlatformName` | `string` | The name of the cloud platform where the data center is located |
| `IsTorExitNode` | `bool` | Indicates whether the IP address is a Tor exit node |
| `IsKnownSuspiciousIp` | `bool` | Indicates whether the IP address is known to be suspicious |
| `IsPrivateIp` | `bool` | Indicates whether the IP address is private |
| `SuspiciousUserAgentName` | `string` | The name of the suspicious user agent accessing the storage |
| `HashReputationMd5List` | `object` | A list of MD5 hash reputations for the accessed resources |
| `AzureResourceId` | `string` | The Azure Resource ID of the storage account |
| `Location` | `string` | The location of the storage account (region) |
| `Timestamp` | `datetime` | Indicate the time when the record was generated |
| `ReportId` | `string` | GUID to identify the record in the specific table |
| `ActionType` | `string` | Type of action (aggregated logs) |
| `AdditionalFields` | `dynamic` | Additional information about the event in JSON array format |
