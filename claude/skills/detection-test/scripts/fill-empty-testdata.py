#!/usr/bin/env python3
"""Replace empty detection testdata placeholders with synthetic empty tables.

This is intentionally conservative: it creates non-production KQL setup that
shadows every declared data source with an empty datatable and keeps the
existing `expected: 0` value. It does not change detection query logic.
"""

from __future__ import annotations

from pathlib import Path
import re

import yaml


ROOT = Path(__file__).resolve().parents[1]
DETECTIONS = ROOT / "Detections" / "dev"


COMMON_COLUMNS: dict[str, str] = {
    "TimeGenerated": "datetime",
    "Timestamp": "datetime",
    "CreatedDateTime": "datetime",
    "StartTime": "datetime",
    "EndTime": "datetime",
    "StartTimeUtc": "datetime",
    "EndTimeUtc": "datetime",
    "EventStartTime": "datetime",
    "EventEndTime": "datetime",
    "ReportId": "string",
    "TenantId": "string",
    "Type": "string",
    "ActionType": "string",
    "Activity": "string",
    "ActivityDisplayName": "string",
    "OperationName": "string",
    "OperationNameValue": "string",
    "Category": "string",
    "Result": "string",
    "ResultType": "string",
    "ResultDescription": "string",
    "ResultSignature": "string",
    "IPAddress": "string",
    "IPaddress": "string",
    "IpAddress": "string",
    "IPCustomEntity": "string",
    "ClientIP": "string",
    "ClientIPAddress": "string",
    "CallerIpAddress": "string",
    "CallerIPAddress": "string",
    "InitiatingIpAddress": "string",
    "InitiatingIPAddress": "string",
    "RemoteIP": "string",
    "RemoteUrl": "string",
    "LocalIP": "string",
    "SrcIpAddr": "string",
    "DstIpAddr": "string",
    "HostIP": "string",
    "LastIpAddress": "string",
    "AccountName": "string",
    "Account": "string",
    "AccountUpn": "string",
    "AccountUPN": "string",
    "AccountUPNSuffix": "string",
    "AccountObjectId": "string",
    "AccountDisplayName": "string",
    "AccountSid": "string",
    "AccountCustomEntity": "string",
    "UserPrincipalName": "string",
    "UserDisplayName": "string",
    "UserId": "string",
    "UserType": "string",
    "TargetUserName": "string",
    "TargetUserPrincipalName": "string",
    "InitiatingProcessAccountName": "string",
    "InitiatingProcessAccountUpn": "string",
    "InitiatingProcessAccountSid": "string",
    "InitiatingUserPrincipalName": "string",
    "SubjectUserName": "string",
    "Actor": "string",
    "Caller": "string",
    "Computer": "string",
    "DeviceId": "string",
    "DeviceName": "string",
    "HostName": "string",
    "Dvc": "string",
    "DvcHostname": "string",
    "SrcHostname": "string",
    "DstHostname": "string",
    "CompromisedEntity": "string",
    "HostCustomEntity": "string",
    "FileName": "string",
    "FolderPath": "string",
    "ProcessName": "string",
    "ProcessCommandLine": "string",
    "CommandLine": "string",
    "InitiatingProcessFileName": "string",
    "InitiatingProcessFolderPath": "string",
    "InitiatingProcessCommandLine": "string",
    "InitiatingProcessParentFileName": "string",
    "InitiatingProcessParentCommandLine": "string",
    "ParentProcessName": "string",
    "ParentProcessCommandLine": "string",
    "ActingProcessName": "string",
    "ActingProcessCommandLine": "string",
    "ActorUsername": "string",
    "SrcProcessName": "string",
    "ProcessCustomEntity": "string",
    "SHA1": "string",
    "SHA256": "string",
    "MD5": "string",
    "InitiatingProcessSHA1": "string",
    "InitiatingProcessSHA256": "string",
    "InitiatingProcessMD5": "string",
    "Url": "string",
    "URL": "string",
    "MaliciousURL": "string",
    "UrlCustomEntity": "string",
    "CorrelationId": "string",
    "CorrelationID": "string",
    "SessionId": "string",
    "RequestId": "string",
    "OriginalRequestId": "string",
    "AppDisplayName": "string",
    "Application": "string",
    "ResourceDisplayName": "string",
    "ResourceId": "string",
    "_ResourceId": "string",
    "ResourceGroup": "string",
    "ResourceProvider": "string",
    "ResourceProviderValue": "string",
    "Resource": "string",
    "ResourceId1": "string",
    "_ResourceId1": "string",
    "RemotePort": "int",
    "LocalPort": "int",
    "SrcPortNumber": "int",
    "DstPortNumber": "int",
    "EventID": "int",
    "EventId": "int",
    "ProcessId": "long",
    "InitiatingProcessId": "long",
    "InitiatingProcessParentId": "long",
    "InitiatingProcessParentProcessId": "long",
    "ParentProcessId": "long",
    "Count": "long",
    "EventCount": "long",
    "FailedLogonCount": "long",
    "SuccessLogonCount": "long",
    "AdditionalFields": "dynamic",
    "Entities": "dynamic",
    "TargetResources": "dynamic",
    "InitiatedBy": "dynamic",
    "ModifiedProperties": "dynamic",
    "AdditionalDetails": "dynamic",
    "Parameters": "dynamic",
    "ExtendedProperties": "dynamic",
    "Properties": "dynamic",
    "Authorization": "dynamic",
    "RawEventData": "dynamic",
    "DeviceDetail": "dynamic",
    "LocationDetails": "dynamic",
    "Status": "dynamic",
    "AuthenticationDetails": "dynamic",
    "AuthenticationMethodsUsed": "dynamic",
    "MfaDetail": "dynamic",
    "ConditionalAccessPolicies": "dynamic",
    "IPAddresses": "dynamic",
}


TABLE_COLUMNS: dict[str, dict[str, str]] = {
    "AADManagedIdentitySignInLogs": {
        "ServicePrincipalId": "string",
        "ServicePrincipalName": "string",
        "ResourceIdentity": "string",
        "ManagedIdentityId": "string",
    },
    "AADNonInteractiveUserSignInLogs": {},
    "AADServicePrincipalSignInLogs": {
        "ServicePrincipalId": "string",
        "ServicePrincipalName": "string",
        "AppId": "string",
    },
    "AuditLogs": {
        "AADOperationType": "string",
        "LoggedByService": "string",
        "Identity": "string",
        "Id": "string",
    },
    "AzureActivity": {
        "ActivityStatus": "string",
        "ActivityStatusValue": "string",
        "Caller": "string",
        "Claims": "dynamic",
        "HTTPMethod": "string",
        "OperationId": "string",
        "ResourceId": "string",
        "ResourceGroup": "string",
        "ResourceProviderValue": "string",
        "SubscriptionId": "string",
    },
    "BehaviorAnalytics": {
        "UsersInsights": "dynamic",
        "DevicesInsights": "dynamic",
        "ActivityInsights": "dynamic",
    },
    "DeviceEvents": {},
    "DeviceFileCertificateInfo": {
        "CertificateSerialNumber": "string",
        "CertificateThumbprint": "string",
        "IsTrusted": "bool",
        "Signer": "string",
    },
    "DeviceFileEvents": {
        "FileOriginUrl": "string",
        "FileOriginIP": "string",
        "FileSize": "long",
        "PreviousFolderPath": "string",
    },
    "DeviceImageLoadEvents": {},
    "DeviceInfo": {
        "LoggedOnUsers": "dynamic",
        "MachineGroup": "string",
        "OnboardingStatus": "string",
        "OSPlatform": "string",
    },
    "DeviceNetworkEvents": {
        "LocalIPType": "string",
        "RemoteIPType": "string",
        "Protocol": "string",
        "RemoteUrl": "string",
    },
    "DeviceNetworkInfo": {
        "ConnectedNetworks": "dynamic",
        "NetworkAdapterStatus": "string",
    },
    "DeviceProcessEvents": {
        "ProcessVersionInfoCompanyName": "string",
        "ProcessVersionInfoOriginalFileName": "string",
        "ProcessIntegrityLevel": "string",
    },
    "DeviceRegistryEvents": {
        "RegistryKey": "string",
        "RegistryValueName": "string",
        "RegistryValueData": "string",
        "PreviousRegistryValueData": "string",
    },
    "IdentityInfo": {
        "AccountDisplayName": "string",
        "AccountDomain": "string",
        "AccountObjectId": "string",
        "AssignedRoles": "dynamic",
        "GroupMembership": "dynamic",
        "IsAccountEnabled": "bool",
    },
    "IdentityQueryEvents": {
        "Application": "string",
        "DestinationDeviceName": "string",
        "Protocol": "string",
        "Query": "string",
        "QueryTarget": "string",
        "QueryType": "string",
    },
    "OfficeActivity": {
        "ClientIP": "string",
        "OfficeObjectId": "string",
        "OfficeWorkload": "string",
        "OrganizationId": "string",
        "RecordType": "string",
        "UserKey": "string",
        "UserId": "string",
        "Workload": "string",
    },
    "SecurityAlert": {
        "AlertName": "string",
        "AlertSeverity": "string",
        "AlertType": "string",
        "Description": "string",
        "DisplayName": "string",
        "ProviderName": "string",
        "SystemAlertId": "string",
        "VendorName": "string",
    },
    "SecurityEvent": {
        "EventData": "string",
        "EventSourceName": "string",
        "LogonType": "int",
        "TargetAccount": "string",
        "TargetUserName": "string",
        "TargetSid": "string",
        "SubjectAccount": "string",
        "SubjectUserSid": "string",
        "ObjectName": "string",
        "ObjectType": "string",
        "AccessMask": "string",
        "AccessList": "string",
    },
    "SigninLogs": {
        "AuthenticationProtocol": "string",
        "AuthenticationRequirement": "string",
        "Browser": "string",
        "ClientAppUsed": "string",
        "ConditionalAccessStatus": "string",
        "Location": "string",
        "RiskDetail": "string",
        "RiskEventTypes": "string",
        "RiskLevelDuringSignIn": "string",
        "RiskState": "string",
        "UserAgent": "string",
    },
    "Syslog": {
        "Computer": "string",
        "Facility": "string",
        "HostIP": "string",
        "HostName": "string",
        "ProcessID": "int",
        "ProcessName": "string",
        "SeverityLevel": "string",
        "SyslogMessage": "string",
    },
    "WindowsEvent": {
        "EventData": "dynamic",
        "Provider": "string",
        "RenderedDescription": "string",
    },
    "_Im_ProcessCreate": {
        "ActingProcessName": "string",
        "ActingProcessCommandLine": "string",
        "ActorUsername": "string",
        "CommandLine": "string",
        "Dvc": "string",
        "ParentProcessName": "string",
        "ParentProcessCommandLine": "string",
        "Process": "string",
    },
    "_Im_NetworkSession": {
        "Dvc": "string",
        "EventResult": "string",
        "NetworkProtocol": "string",
        "SrcIpAddr": "string",
        "DstIpAddr": "string",
        "DstPortNumber": "int",
        "SrcPortNumber": "int",
        "SrcHostname": "string",
        "DstHostname": "string",
        "SrcUsername": "string",
        "DstUsername": "string",
    },
}


DYNAMIC_HINTS = {
    "AdditionalFields",
    "AdditionalDetails",
    "AuthenticationDetails",
    "Authorization",
    "ConditionalAccessPolicies",
    "DeviceDetail",
    "Entities",
    "ExtendedProperties",
    "IPAddresses",
    "InitiatedBy",
    "LocationDetails",
    "MfaDetail",
    "ModifiedProperties",
    "Parameters",
    "Properties",
    "RawEventData",
    "Status",
    "TargetResources",
}


KEYWORDS = {
    "and",
    "ago",
    "array_length",
    "asc",
    "between",
    "by",
    "column_ifexists",
    "contains",
    "count",
    "countif",
    "datatable",
    "datetime",
    "desc",
    "distinct",
    "dynamic",
    "extend",
    "has",
    "has_all",
    "has_any",
    "in",
    "in~",
    "int",
    "isnotempty",
    "isempty",
    "join",
    "kind",
    "let",
    "long",
    "make_set",
    "materialize",
    "mv-expand",
    "not",
    "or",
    "parse",
    "parse_json",
    "project",
    "project-away",
    "summarize",
    "string",
    "todynamic",
    "tolower",
    "tostring",
    "union",
    "where",
}


TESTBLOCK_PLACEHOLDER_RE = re.compile(
    r"(?ms)^testblock:\n[ \t]*- testdata: \[\]\n[ \t]*expected: 0"
)
LET_NAME_RE = re.compile(r"\blet\s+([A-Za-z_][A-Za-z0-9_]*)\s*=")
COLUMN_IFEXISTS_RE = re.compile(r"column_ifexists\(\s*['\"]([A-Za-z_][A-Za-z0-9_]*)['\"]")
TOKEN_RE = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")


def strip_strings_and_comments(query: str) -> str:
    query = re.sub(r"//.*", " ", query)
    query = re.sub(r"@?'(?:''|[^'])*'", " ", query)
    query = re.sub(r'@?"(?:""|[^"])*"', " ", query)
    return query


def infer_type(name: str) -> str:
    if name in DYNAMIC_HINTS:
        return "dynamic"
    lowered = name.lower()
    if lowered.startswith("is") or lowered.startswith("has") or lowered in {"accountenabled", "enabled"}:
        return "bool"
    if "time" in lowered or "date" in lowered or lowered.endswith("timestamp"):
        return "datetime"
    if "port" in lowered or lowered.endswith("id") and "correlation" not in lowered and "session" not in lowered:
        if any(text in lowered for text in ["device", "account", "tenant", "object", "app", "user", "resource"]):
            return "string"
        return "long"
    if any(text in lowered for text in ["count", "number", "total", "size", "score", "duration", "threshold", "bytes"]):
        return "long"
    return "string"


def yaml_data_sources(rule: dict) -> list[str]:
    data_sources = rule.get("data_sources") or []
    if isinstance(data_sources, str):
        return [data_sources]
    if not isinstance(data_sources, list):
        return []
    return [str(item) for item in data_sources if str(item).strip()]


def entity_columns(rule: dict) -> set[str]:
    columns: set[str] = set()
    for mapping in rule.get("entity_mapping") or []:
        if not isinstance(mapping, dict):
            continue
        for field in mapping.get("field_mapping") or []:
            if not isinstance(field, dict):
                continue
            column = field.get("column_name")
            if isinstance(column, str) and re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", column):
                columns.add(column)
    return columns


def query_columns(query: str, data_sources: list[str]) -> set[str]:
    stripped = strip_strings_and_comments(query)
    lets = set(LET_NAME_RE.findall(stripped))
    columns = set(COLUMN_IFEXISTS_RE.findall(query))
    for token in TOKEN_RE.findall(stripped):
        if token in lets or token in data_sources or token.lower() in KEYWORDS:
            continue
        if token[0].isupper() or token.startswith("_"):
            columns.add(token)
    return columns


def columns_for_table(table: str, rule: dict) -> dict[str, str]:
    columns = dict(COMMON_COLUMNS)
    columns.update(TABLE_COLUMNS.get(table, {}))
    query = rule.get("query") or ""
    for column in sorted(entity_columns(rule) | query_columns(query, yaml_data_sources(rule))):
        columns.setdefault(column, infer_type(column))
    return dict(sorted(columns.items(), key=lambda item: item[0].lower()))


def render_datatable(table: str, columns: dict[str, str]) -> str:
    schema = ", ".join(f"{name}:{kind}" for name, kind in columns.items())
    if table == "_Im_NetworkSession":
        return (
            f"let {table} = (starttime:datetime = datetime(null), endtime:datetime = datetime(null), "
            f"dstportnumber:int = int(null)) {{ datatable({schema})[] }};"
        )
    return f"let {table} = datatable({schema})[];"


def render_testblock(rule: dict) -> str:
    data_sources = yaml_data_sources(rule)
    if not data_sources:
        data_sources = ["EmptyTestData"]
    lines = ["testblock:", "  - testdata:", "      - |"]
    for table in data_sources:
        lines.append("        " + render_datatable(table, columns_for_table(table, rule)))
    lines.append("    expected: 0")
    return "\n".join(lines)


def main() -> int:
    changed = 0
    for path in sorted(DETECTIONS.glob("*.yaml"), key=lambda p: p.as_posix().lower()):
        text = path.read_text(encoding="utf-8")
        if "testdata: []" not in text:
            continue
        rule = yaml.safe_load(text)
        if not isinstance(rule, dict):
            continue
        testblock = rule.get("testblock")
        if not isinstance(testblock, list) or not testblock:
            continue
        if testblock[0].get("testdata") != [] or testblock[0].get("expected") != 0:
            continue
        replacement = render_testblock(rule)
        new_text, count = TESTBLOCK_PLACEHOLDER_RE.subn(replacement, text, count=1)
        if count != 1:
            raise RuntimeError(f"could not replace placeholder in {path}")
        path.write_text(new_text, encoding="utf-8")
        changed += 1
        print(path)
    print(f"updated {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
