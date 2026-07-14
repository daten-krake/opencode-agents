# KQL Cheat Sheet for Real Time Intelligence

A comprehensive reference for Kusto Query Language (KQL) specifically tailored for Real Time Intelligence scenarios.

Source: [kustonaut/kql-cheat-sheet](https://github.com/kustonaut/kql-cheat-sheet)

## Table of Contents
- Basic Syntax
- Data Types
- Common Operators
- Time Functions
- Aggregations
- Joins
- Advanced Patterns
- Performance Tips
- Real Time Intelligence Specific
- Security & Threat Hunting
- Community Queries

## Basic Syntax

### Table Selection and Basic Filtering

Documentation: [`where` operator](https://docs.microsoft.com/azure/data-explorer/kusto/query/whereoperator) | [Query fundamentals](https://docs.microsoft.com/azure/data-explorer/kusto/query/tutorial)

```kql
// Basic table query
TableName

// Filter by specific condition
TableName
| where ColumnName == "value"

// Multiple conditions
TableName
| where ColumnName == "value" and TimeGenerated > ago(1h)

// Case-insensitive string comparison
TableName
| where ColumnName =~ "value"
```

### Common Projections

Documentation: [`project` operator](https://docs.microsoft.com/azure/data-explorer/kusto/query/projectoperator) | [`extend` operator](https://docs.microsoft.com/azure/data-explorer/kusto/query/extendoperator)

```kql
// Select specific columns
TableName
| project TimeGenerated, ColumnName, AnotherColumn

// Rename columns
TableName
| project Timestamp = TimeGenerated, Name = ColumnName

// Create calculated columns
TableName
| project TimeGenerated, Duration = EndTime - StartTime
```

## Data Types

| Category | Types |
|---|---|
| String | `string`, `dynamic` |
| Numeric | `int`, `long`, `real`, `decimal` |
| DateTime | `datetime`, `timespan` |
| Boolean | `bool` |
| Special | `guid` |

### String Operations

Documentation: [String operators](https://docs.microsoft.com/azure/data-explorer/kusto/query/datatypes-string-operators) | [`extract()` function](https://docs.microsoft.com/azure/data-explorer/kusto/query/extractfunction) | [`split()` function](https://docs.microsoft.com/azure/data-explorer/kusto/query/splitfunction)

```kql
// Contains (case-insensitive)
| where Message contains "error"

// Starts with
| where EventName startswith "Microsoft"

// Regular expressions
| where Message matches regex @"Error \d+"

// String extraction
| extend ErrorCode = extract(@"Error (\d+)", 1, Message)

// String splitting
| extend Parts = split(Message, ";")
```

### Numeric Operations

```kql
// Basic math
| extend Total = Quantity * Price

// Rounding
| extend RoundedValue = round(Value, 2)

// Absolute value
| extend AbsValue = abs(Value)
```

### DateTime Operations

```kql
// Current time
| extend Now = now()

// Time ago
| where TimeGenerated > ago(1h)
| where TimeGenerated > ago(7d)

// Date formatting
| extend FormattedDate = format_datetime(TimeGenerated, "yyyy-MM-dd HH:mm")

// Date parts
| extend Hour = datetime_part("hour", TimeGenerated)
| extend DayOfWeek = dayofweek(TimeGenerated)
```

## Common Operators

### Filtering

```kql
// In operator
| where EventLevel in ("Error", "Warning")

// Between
| where ResponseTime between (100 .. 500)

// Not null
| where isnotnull(ColumnName)

// Empty or null
| where isempty(ColumnName) or isnull(ColumnName)
```

### Sorting and Limiting

```kql
// Sort ascending
| sort by TimeGenerated asc

// Sort descending (default)
| sort by Count desc

// Top N records
| top 10 by Count desc

// Skip and take (pagination)
| sort by TimeGenerated desc
| serialize rn = row_number()
| where rn > 10 and rn <= 20
```

## Time Functions

### Time Ranges

Documentation: [`ago()` function](https://docs.microsoft.com/azure/data-explorer/kusto/query/agofunction) | [`bin()` function](https://docs.microsoft.com/azure/data-explorer/kusto/query/binfunction) | [Datetime/timespan arithmetic](https://docs.microsoft.com/azure/data-explorer/kusto/query/datetime-timespan-arithmetic)

```kql
// Last hour
| where TimeGenerated > ago(1h)

// Between specific times
| where TimeGenerated between (datetime(2024-01-01) .. datetime(2024-01-02))

// Time bins
| summarize Count = count() by bin(TimeGenerated, 5m)

// Start of day/week/month
| extend StartOfDay = startofday(TimeGenerated)
| extend StartOfWeek = startofweek(TimeGenerated)
| extend StartOfMonth = startofmonth(TimeGenerated)
```

## Aggregations

### Basic Aggregations

```kql
// Count all records
| summarize count()

// Count with grouping
| summarize Count = count() by EventLevel

// Multiple aggregations
| summarize 
    TotalEvents = count(),
    UniqueUsers = dcount(UserId),
    AvgDuration = avg(Duration),
    MaxDuration = max(Duration)
by EventLevel

// Percentiles
| summarize 
    P50 = percentile(Duration, 50),
    P95 = percentile(Duration, 95),
    P99 = percentile(Duration, 99)
```

### Advanced Aggregations

```kql
// Array aggregation
| summarize EventTypes = make_set(EventType) by UserId

// List with duplicates
| summarize EventList = make_list(EventType) by UserId

// String concatenation
| summarize ErrorMessages = strcat_array(make_list(Message), "; ")

// Conditional aggregation
| summarize 
    ErrorCount = countif(EventLevel == "Error"),
    WarningCount = countif(EventLevel == "Warning")
```

## Joins

Documentation: [`join` operator](https://docs.microsoft.com/azure/data-explorer/kusto/query/joinoperator) | [Join flavors](https://docs.microsoft.com/azure/data-explorer/kusto/query/joinoperator#join-flavors) | [Join best practices](https://docs.microsoft.com/azure/data-explorer/kusto/query/best-practices#joins)

### Inner Join

```kql
Table1
| join kind=inner (
    Table2
    | project UserId, UserName
) on UserId
```

### Left Join

```kql
Table1
| join kind=leftouter (
    Table2
    | project UserId, UserName
) on UserId
```

### Join with Time Window

```kql
Events
| join kind=inner (
    Metrics
    | where TimeGenerated > ago(1h)
) on $left.TimeGenerated == $right.TimeGenerated
```

## Advanced Patterns

### Window Functions

```kql
// Running total
| sort by TimeGenerated asc
| serialize RunningTotal = row_cumsum(Count)

// Previous value
| sort by TimeGenerated asc
| serialize PrevValue = prev(Count, 1)

// Rank
| sort by Count desc
| serialize Rank = row_number()
```

### Dynamic Objects

```kql
// Parse JSON
| extend ParsedData = parse_json(JsonColumn)
| extend Value = ParsedData.property

// Create dynamic object
| extend Details = pack("Count", Count, "Timestamp", TimeGenerated)

// Array operations
| mv-expand ArrayColumn
| where ArrayColumn.property == "value"
```

### Case Statements

```kql
| extend Severity = case(
    EventLevel == "Error", "High",
    EventLevel == "Warning", "Medium",
    EventLevel == "Information", "Low",
    "Unknown"
)
```

## Graph Operators & Network Analysis

Documentation: [`graph` operators](https://docs.microsoft.com/azure/data-explorer/kusto/query/graph-operators) | [`graph-match` operator](https://docs.microsoft.com/azure/data-explorer/kusto/query/graph-match-operator) | [Graph scenarios](https://docs.microsoft.com/azure/data-explorer/kusto/query/graph-scenarios)

### Basic Graph Operations

```kql
// Convert network logs to graph structure
NetworkLogs
| where TimeGenerated > ago(1h)
| project SourceIP, DestinationIP, Port, Protocol, BytesSent
| extend EdgeType = strcat(Protocol, ":", Port)
```

```kql
// Find communication patterns
let GraphData = NetworkLogs
| where TimeGenerated > ago(24h)
| project SourceIP, DestinationIP, Protocol;
GraphData
| graph-match (source)-[connection]->(destination)
  where source.SourceIP startswith "10.0"
  and destination.DestinationIP !startswith "10.0"
| project SourceInternal=source.SourceIP, 
          DestinationExternal=destination.DestinationIP,
          Protocol=connection.Protocol
| summarize Connections=count() by SourceInternal, DestinationExternal
| top 10 by Connections
```

### Multi-Hop Path Analysis

```kql
let NetworkGraph = NetworkLogs
| where TimeGenerated > ago(6h)
| project Source=SourceIP, Target=DestinationIP, Protocol, Timestamp=TimeGenerated;
NetworkGraph
| graph-match (node1)-[edge1]->(node2)-[edge2]->(node3)
  where edge1.Timestamp < edge2.Timestamp
  and datetime_diff('minute', edge2.Timestamp, edge1.Timestamp) <= 30
| project 
    Path = strcat(node1.Source, " -> ", node2.Source, " -> ", node3.Target),
    FirstHop = edge1.Protocol,
    SecondHop = edge2.Protocol,
    Duration = datetime_diff('minute', edge2.Timestamp, edge1.Timestamp)
| summarize PathCount = count() by Path, FirstHop, SecondHop
| sort by PathCount desc
```

### Lateral Movement Detection

```kql
let AuthEvents = SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID in (4624, 4625)
| project TimeGenerated, Account, Computer, LogonType, EventID;
AuthEvents
| graph-match (user)-[logon1]->(computer1), (user)-[logon2]->(computer2)
  where computer1.Computer != computer2.Computer
  and logon1.EventID == 4624 and logon2.EventID == 4624
  and datetime_diff('hour', logon2.TimeGenerated, logon1.TimeGenerated) between (0 .. 6)
| project 
    SuspiciousAccount = user.Account,
    Computer1 = computer1.Computer,
    Computer2 = computer2.Computer,
    TimeSpan = datetime_diff('minute', logon2.TimeGenerated, logon1.TimeGenerated)
| summarize 
    ComputersAccessed = dcount(Computer2),
    AccessPattern = make_list(Computer2)
by SuspiciousAccount
| where ComputersAccessed >= 3
| project SuspiciousAccount, ComputersAccessed, AccessPattern
```

### Graph Operator Cheat Sheet

| Pattern | Use Case | KQL Syntax |
|---|---|---|
| Simple Path | A connects to B | `graph-match (a)-[edge]->(b)` |
| Two-Hop Path | A -> B -> C | `graph-match (a)-[e1]->(b)-[e2]->(c)` |
| Circular Path | A -> B -> A | `graph-match (a)-[e1]->(b)-[e2]->(c) where a.id == c.id` |
| Common Neighbor | A -> C <- B | `graph-match (a)-[e1]->(c)<-[e2]-(b)` |
| Fan-out | One source, many targets | `graph-match (source)-[edge]->(target)` + `summarize by source` |
| Fan-in | Many sources, one target | `graph-match (source)-[edge]->(target)` + `summarize by target` |

## Performance Tips

### Filter Early

```kql
// Good: Filter first
TableName
| where TimeGenerated > ago(1h)
| where EventLevel == "Error"
| summarize count() by Computer

// Bad: Filter after aggregation
TableName
| summarize count() by Computer, EventLevel
| where EventLevel == "Error"
```

### Efficient Time Filtering

```kql
// Use specific time ranges
| where TimeGenerated between (ago(1h) .. now())

// Use time bins for large datasets
| summarize count() by bin(TimeGenerated, 1h)
```

### Column Selection

```kql
// Project early to reduce data
TableName
| project TimeGenerated, EventLevel, Message
| where EventLevel == "Error"
```

## Common Functions Reference

### String Functions
- `contains` — Case-insensitive substring search
- `startswith` / `endswith` — String prefix/suffix check
- `extract` — Regular expression extraction
- `split` — Split string into array
- `strlen` — String length
- `substring` — Extract substring
- `tolower` / `toupper` — Case conversion

### Math Functions
- `abs` — Absolute value
- `round` — Round to specified decimals
- `floor` / `ceiling` — Round down/up
- `sqrt` — Square root
- `pow` — Power function

### Date Functions
- `now()` — Current timestamp
- `ago()` — Time in the past
- `datetime()` — Parse datetime
- `format_datetime()` — Format timestamp
- `bin()` — Time bucketing
- `datetime_part()` — Extract date component

### Aggregation Functions
- `count()` — Count rows
- `dcount()` — Distinct count
- `sum()` — Sum values
- `avg()` — Average
- `min()` / `max()` — Minimum/maximum
- `percentile()` — Calculate percentile
- `make_set()` — Create array of unique values
- `make_list()` — Create array with duplicates

## Quick Reference Card

### Must-Know Operators
- `|` — Pipe operator (chain operations)
- `where` — Filter rows
- `project` — Select/rename columns
- `extend` — Add calculated columns
- `summarize` — Group and aggregate
- `sort` — Order results
- `top` — Get top N records
- `join` — Combine tables
- `union` — Combine similar tables
- `render` — Visualize results

### Common Patterns

```kql
// Time series analysis
| summarize count() by bin(timestamp, 1h)
| render timechart

// Top N analysis
| summarize Count = count() by Category
| top 10 by Count desc

// Percentage calculation
| summarize Total = count(), Success = countif(status == "success")
| extend SuccessRate = round(100.0 * Success / Total, 2)
```

## Security & Threat Hunting

### Common Security Tables

```kql
// Microsoft Sentinel common tables
SecurityEvent          // Windows Security Events
Syslog                 // Linux/Unix Logs  
CommonSecurityLog      // CEF formatted logs
SecurityAlert          // Security alerts
SecurityIncident       // Security incidents
ThreatIntelligenceIndicator // Threat intel data

// Microsoft 365 Defender
DeviceEvents           // Endpoint detection and response
DeviceLogonEvents      // Logon activities
DeviceNetworkEvents    // Network connections
DeviceFileEvents       // File system activities
DeviceProcessEvents    // Process execution
IdentityLogonEvents    // Identity logons
EmailEvents           // Email security events
```

### Authentication Analysis

```kql
// Failed logon attempts
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize FailedAttempts = count() by Account, Computer, IpAddress
| where FailedAttempts > 10
| sort by FailedAttempts desc

// Successful logons after failed attempts
let FailedLogons = SecurityEvent
    | where TimeGenerated > ago(1h)
    | where EventID == 4625
    | project TimeGenerated, Account, Computer, IpAddress;
let SuccessfulLogons = SecurityEvent
    | where TimeGenerated > ago(1h)
    | where EventID == 4624
    | project TimeGenerated, Account, Computer, IpAddress;
FailedLogons
| join kind=inner (SuccessfulLogons) on Account, Computer
| where TimeGenerated1 < TimeGenerated
| project Account, Computer, IpAddress, FailedTime=TimeGenerated, SuccessTime=TimeGenerated1
```

### Network Security Monitoring

```kql
// Suspicious outbound connections
DeviceNetworkEvents
| where TimeGenerated > ago(1h)
| where ActionType == "ConnectionSuccess"
| where RemotePort in (22, 3389, 5985, 5986)
| where not(RemoteIP has_any ("10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."))
| summarize count() by DeviceName, RemoteIP, RemotePort
| sort by count_ desc

// DNS queries to suspicious domains
DeviceNetworkEvents
| where TimeGenerated > ago(24h)
| where ActionType == "DnsQueryResponse"
| where RemoteUrl matches regex @".*\.(tk|ml|ga|cf)$"
| summarize count() by DeviceName, RemoteUrl
| sort by count_ desc
```

### Process Execution Analysis

```kql
// PowerShell execution with obfuscation indicators
DeviceProcessEvents
| where TimeGenerated > ago(24h)
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has_any ("-enc", "-encoded", "FromBase64String", "iex", "invoke-expression")
| project TimeGenerated, DeviceName, AccountName, ProcessCommandLine
| sort by TimeGenerated desc

// Suspicious parent-child process relationships
DeviceProcessEvents
| where TimeGenerated > ago(24h)
| where InitiatingProcessFileName in~ ("winword.exe", "excel.exe", "powerpnt.exe", "outlook.exe")
| where FileName in~ ("powershell.exe", "cmd.exe", "wscript.exe", "cscript.exe", "regsvr32.exe")
| project TimeGenerated, DeviceName, InitiatingProcessFileName, FileName, ProcessCommandLine
```

### File System Security

```kql
// Sensitive file access
DeviceFileEvents
| where TimeGenerated > ago(24h)
| where FileName has_any ("password", "credential", "secret", "private", "key")
| where ActionType in ("FileCreated", "FileModified", "FileRenamed")
| summarize count() by DeviceName, AccountName, FileName, FolderPath
| sort by count_ desc

// Executable files written to temp directories
DeviceFileEvents
| where TimeGenerated > ago(24h)
| where ActionType == "FileCreated"
| where FileName endswith ".exe"
| where FolderPath has_any ("temp", "tmp", "appdata\\local\\temp")
| project TimeGenerated, DeviceName, AccountName, FileName, FolderPath, SHA256
```

### Threat Intelligence Integration

```kql
let MaliciousIPs = ThreatIntelligenceIndicator
    | where TimeGenerated > ago(7d)
    | where isnotempty(NetworkIP)
    | project NetworkIP, Description, ThreatType;
DeviceNetworkEvents
| where TimeGenerated > ago(24h)
| join kind=inner (MaliciousIPs) on $left.RemoteIP == $right.NetworkIP
| project TimeGenerated, DeviceName, RemoteIP, Description, ThreatType, ActionType
```

### APT Hunting — Living off the Land

```kql
DeviceProcessEvents
| where TimeGenerated > ago(24h)
| where FileName in~ (
    "certutil.exe", "bitsadmin.exe", "wmic.exe", 
    "rundll32.exe", "regsvr32.exe", "mshta.exe",
    "installutil.exe", "regasm.exe", "regsvcs.exe"
)
| where ProcessCommandLine has_any (
    "http", "https", "ftp", "download", 
    "urlcache", "verifyctl", "encode", "decode"
)
| project TimeGenerated, DeviceName, AccountName, FileName, ProcessCommandLine
| sort by TimeGenerated desc
```

### Ransomware Detection

```kql
DeviceFileEvents
| where TimeGenerated > ago(1h)
| where ActionType in ("FileRenamed", "FileModified")
| where FileName has_any (".encrypt", ".locked", ".crypto", ".crypt", ".enc")
    or FileName matches regex @".*\.(jpg|pdf|doc|xls|ppt|png|gif|bmp|mp3|mp4|avi|mov|zip|rar|7z|txt|rtf)\..*"
| summarize 
    FileCount = count(),
    UniqueExtensions = dcount(FileName),
    FileTypes = make_set(FileName)
by DeviceName, AccountName, bin(TimeGenerated, 5m)
| where FileCount > 50
| sort by TimeGenerated desc
```

### LSASS Credential Access

```kql
DeviceEvents
| where TimeGenerated > ago(24h)
| where ActionType == "ProcessAccess"
| where FileName == "lsass.exe"
| where InitiatingProcessFileName !in~ ("svchost.exe", "wininit.exe", "winlogon.exe", "csrss.exe")
| summarize count() by DeviceName, InitiatingProcessFileName, InitiatingProcessCommandLine
| sort by count_ desc
```

### C2 Beaconing Detection

```kql
DeviceNetworkEvents
| where TimeGenerated > ago(24h)
| where ActionType == "ConnectionSuccess"
| summarize 
    ConnectionCount = count(),
    UniqueRemotePorts = dcount(RemotePort),
    AvgInterval = avg(prev(TimeGenerated) - TimeGenerated)
by DeviceName, RemoteIP, bin(TimeGenerated, 1h)
| where ConnectionCount > 10 and UniqueRemotePorts < 3
| where AvgInterval between (time(0.1s) .. time(30m))
| sort by ConnectionCount desc
```

### Data Exfiltration Detection

```kql
DeviceNetworkEvents
| where TimeGenerated > ago(24h)
| where ActionType == "NetworkConnection"
| where not(RemoteIP has_any ("10.", "192.168.", "172."))
| summarize TotalBytes = sum(SentBytes) by DeviceName, RemoteIP, bin(TimeGenerated, 1h)
| where TotalBytes > 100000000
| sort by TotalBytes desc
```

### Registry Persistence

```kql
DeviceRegistryEvents
| where TimeGenerated > ago(24h)
| where ActionType == "RegistryValueSet"
| where RegistryKey has_any (
    "\\Run\\", "\\RunOnce\\", "\\RunServices\\", 
    "\\Winlogon\\", "\\Explorer\\Run\\",
    "\\Image File Execution Options\\",
    "\\AppInit_DLLs", "\\ServiceDLL"
)
| project TimeGenerated, DeviceName, AccountName, RegistryKey, RegistryValueName, RegistryValueData
| sort by TimeGenerated desc
```

## Threat Hunting Resources

### Official Documentation
- [Microsoft Sentinel Hunting](https://docs.microsoft.com/azure/sentinel/hunting)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Microsoft 365 Defender Advanced Hunting](https://docs.microsoft.com/microsoft-365/security/defender/advanced-hunting-overview)

### Community Resources
- [KQL Cafe](https://kqlcafe.github.io/) — Interactive KQL learning platform
- [Azure Sentinel Notebooks](https://github.com/Azure/Azure-Sentinel-Notebooks)
- [Uncoder.io](https://uncoder.io/) — Sigma rule to KQL converter
- [Sentinel ATT&CK](https://github.com/BlueTeamSecDev/SentinelAttack)

### Training and Certification
- [SC-200 Certification](https://docs.microsoft.com/learn/certifications/security-operations-analyst/)
- [KQL Free Learning Path](https://docs.microsoft.com/learn/paths/sc-200-utilize-kql-for-azure-sentinel/)
