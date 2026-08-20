---
name: defender-xdr-hunt
description: Run live advanced hunting queries against Microsoft Defender XDR via the Microsoft Graph API. Use this when you need data validation, cardinality estimation, FP checks, column verification, or iterating on query results against the live tenant.
---

## What I do

I am a skill that teaches you how to use the `defender-xdr-hunt` custom tool to run live KQL queries against Microsoft Defender XDR Advanced Hunting via the Graph API.

## When to use me vs. the static knowledge files

| Situation | Use |
|-----------|-----|
| Need to know what columns a table has | Load `detection-engineering` and read its `defender-xdr/` references |
| Need to validate a column name or type | Use this skill — hit the live API with `| limit 1` |
| Estimating data volume or cardinality for a rule | Use this skill — `| summarize count()` |
| Checking real false positive rates before deploying a rule | Use this skill — run the candidate query, inspect results |
| Need exact schema definition (types, descriptions) | `detection-engineering` reference files |
| Iterating on a query — does it return what I expect? | Use this skill — start small, scale up |

## Purposes and Bounds

Set a purpose on every factory query:

- `schema`: table/column probe with `take` or `limit` no greater than 10.
- `cardinality`: aggregate-only count or summarize query.
- `sample`: projected false-positive sample with `take` or `limit` no greater
  than 100.
- `test`: synthetic harness ending in `| count`.
- `investigation`: explicitly requested human investigation outside the factory.

Start schema and sample queries with `P1D`; expand to at most `P7D` only when
needed. Test harnesses use synthetic datatables and return one count row.

## API constraints

- **Timeout**: 10 minutes per query
- **Row limit**: 200,000 rows max
- **Model return limit**: the custom tool returns at most 500 rows and marks
  larger responses as truncated
- **Ingestion latency**: 15–30 minutes for device events; email/identity can be longer
- **Permission required**: `ThreatHunting.Read.All` (application permission, configured in Entra ID)
- **Default timespan**: purpose-specific in the tool; investigation defaults to
  30 days for backward compatibility

## Query construction for live API

The live API uses the **exact same KQL** you write for the Defender XDR Advanced Hunting portal:

- Column names are **PascalCase** — `Timestamp`, `DeviceName`, `InitiatingProcessFileName`
- Filter early on indexed columns: `Timestamp`, `DeviceId`, `DeviceName`
- Use `has` / `has_any` over `contains` where possible
- Never use `search *` or `union *` — these time out immediately
- Always start with a small result set when exploring: `| limit 10`

## Result structure

The API returns:

```
{
  "schema": [
    { "name": "Timestamp", "type": "DateTime" },
    { "name": "FileName", "type": "String" }
  ],
  "results": [
    { "Timestamp": "2024-03-26T09:39:50.7688641Z", "FileName": "cmd.exe" }
  ]
}
```

The `schema` array tells you exactly what columns were returned and their types. The `results` array contains row objects with **PascalCase** property names matching the schema.

## Iteration pattern

1. **Validate the table** — `DeviceProcessEvents | limit 1` to verify the table exists and see column names
2. **Check volume** — `DeviceProcessEvents | where Timestamp > ago(1h) | summarize count()` to estimate cardinality
3. **Refine filters** — Add your `where` clauses, verify they return sensible results
4. **Build the detection logic** — `summarize`, `join`, `mv-expand` as needed
5. **Check false positives** — Look at the returned rows. Are they legitimate admin activity?

## Things to avoid

- Do not run the full detection query against the maximum timespan. Use `| limit 100` when iterating.
- Do not assume a column exists just because a blog post mentions it. Validate with `| limit 1` first.
- Do not treat live results as source of truth for column types. Load
  `detection-engineering` and use its static table references.
- Do not run a query and then write a rule without inspecting the results for false positives.
