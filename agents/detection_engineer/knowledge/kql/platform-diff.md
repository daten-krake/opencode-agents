# KQL Platform Differences: Sentinel vs Defender XDR

## Sentinel-only (Log Analytics workspace)

### Functions
- `_GetWatchlist("WatchlistName")` — read data from a Sentinel watchlist
- `externaldata()` — read data from external sources (Azure Blob, HTTP endpoint) stored in the Sentinel workspace
- `_IsBilledByUsage()` — check if a table is billed by data volume
- `_BilledSize` — estimated billable data size

### Operators
- `datatable` — define inline data tables (works in both but less common in AH)
- `print` — single-row output (works in both but less common in AH)

### Configuration
- Query period via `ingestion_time()` for scheduled analytics rules
- Alert rule templates with entity mapping in ARM/Bicep/portal
- Incident creation logic tied to analytics rules

### Tables unique to Sentinel
All tables in the `sentinel/` knowledge folder (entra-id, microsoft365, azure, windows subdirectories) are Sentinel-specific tables that do not exist in Defender XDR Advanced Hunting.

## Defender XDR-only (Advanced Hunting)

### Constructs
- `Device*` tables — endpoint telemetry unique to Defender for Endpoint integration
- `Identity*` tables — on-premises identity telemetry via Defender for Identity
- `Email*` tables — MDO email telemetry
- `CloudAppEvents` — Defender for Cloud Apps telemetry (also available in Sentinel via connector)

### Limitations
- No `externaldata()` — cannot reference external sources from AH
- No watchlists in AH
- Time window limited to 30 days of data retention
- Max query result set: 10,000 rows (vs Sentinel: up to 30,000 rows)

## Shared (both platforms)

### Common constructs
- All standard KQL operators: `where`, `project`, `extend`, `summarize`, `join`, `union`, `sort`, `top`, `take`, `mv-expand`, `mv-apply`, `parse`, `parse-where`
- All standard aggregation functions: `count()`, `dcount()`, `sum()`, `avg()`, `min()`, `max()`, `percentile()`, `make_set()`, `make_list()`
- All string operators: `contains`, `has`, `hasprefix`, `startswith`, `endswith`, `matches regex`
- Time functions: `ago()`, `bin()`, `datetime_diff()`, `startofday()`, etc.

### Data types
Same across both: `string`, `int`, `long`, `real`, `decimal`, `datetime`, `timespan`, `bool`, `guid`, `dynamic`

### Key differences to watch for
| Aspect | Sentinel | Defender XDR AH |
|---|---|---|
| Time field | `TimeGenerated` | `Timestamp` (most Device* tables) |
| Retention | Configurable (30-730+ days) | Fixed 30 days |
| Query timeout | 10 minutes | 10 minutes |
| Cross-workspace | `workspace()` | Not available |
| Watchlists | `_GetWatchlist()` | Not available |
| External data | `externaldata()` | Not available |
| Scheduled rules | Native with entity mapping | Custom detection rules |
