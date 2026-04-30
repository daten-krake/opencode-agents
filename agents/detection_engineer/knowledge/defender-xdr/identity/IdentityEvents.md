# IdentityEvents

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityevents-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityevents-table)

## Description

The `IdentityEvents` table in the advanced hunting schema contains information about identity events obtained from other cloud identity service providers. Use this reference to construct queries that return information from this table.

## Columns

| Column Name | Type | Description |
|---|---|---|
| `Timestamp` | `datetime` | Date and time when the record was generated |
| `ReportId` | `string` | Unique identifier for the event |
| `AccountId` | `string` | Unique identifier for the account in the source application |
| `AccountType` | `string` | Type of user account, indicating its general role like User, SystemPrincipal |
| `AccountDisplayName` | `string` | Name displayed in the address book entry for the account user. This is usually a combination of the given name, middle initial, and surname of the user. |
| `AccountUpn` | `string` | Alternate ID, email, or name for the account in the source application |
| `ActionType` | `string` | Type of activity that triggered the event in the raw format received from the source application |
| `ActionResult` | `string` | Result of the action |
| `ActionFailureReason` | `string` | Information explaining why the recorded action failed |
| `IPAddress` | `string` | IP address assigned to the device and used during related network communications |
| `UserAgent` | `string` | User agent information from the web browser or other client application |
| `TargetObjects` | `dynamic` | List of the target objects of this activity. Target object can be user, group, role, domain, application, and more. |
| `Application` | `string` | The source application where this event was received from |
| `ApplicationInstanceId` | `string` | Domain of the source application |
| `ApplicationEventId` | `string` | Raw event ID provided by the source application |
| `ApplicationSessionId` | `string` | Raw session ID provided by the source application |
| `RawEventData` | `dynamic` | Full raw event information from the source application in JSON format |
| `AdditionalFields` | `dynamic` | Additional information about the entity or event |
