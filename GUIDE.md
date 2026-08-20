# defender-xdr-hunt — Setup & Usage Guide

Run live Advanced Hunting queries against Microsoft Defender XDR via the Microsoft Graph API, from within opencode.

## Architecture

```
~/.config/opencode/tools/defender-xdr-hunt.ts   → symlinked from repo (via link-agents.sh)
~/.config/opencode/skills/defender-xdr-hunt/     → symlinked from repo (via link-agents.sh)
~/.config/opencode/skills/detection-engineering/ → static KQL and schema references
~/.config/opencode/commands/detection-factory*.md → cloud/local factory entry points
~/.local/share/opencode/secrets/defender-xdr.env → plaintext credentials, chmod 600, outside git
~/.local/bin/opencode-hunt                       → generated wrapper with pre-flight validation
```

Credentials live outside the repo in `~/.local/share/opencode/secrets/`. The TypeScript tool reads the `.env` file directly from disk at runtime — credentials **never** enter the process environment block, so the agent's `bash` tool cannot leak them to the LLM provider.

## Quickstart

### 1. Link agents, skills, tools, and commands

```bash
cd ~/opencode-agents
./link-agents.sh
```

### 2. Set up XDR credentials

```bash
./setup-defender-xdr.sh
```

The script will:
- Install bun if missing
- Zero dependencies — pure TypeScript with Bun's built-in `fetch()`
- Prompt for Tenant ID, Client ID, Client Secret (masked input)
- Write `~/.local/share/opencode/secrets/defender-xdr.env` (chmod 600)
- Generate `~/.local/bin/opencode-hunt` wrapper
- Validate credentials against Microsoft Graph

### 3. Launch

```bash
opencode-hunt
```

The wrapper validates credentials before launching opencode. If your client secret has expired, it fails immediately with a clear message — before the LLM even starts.

## Prerequisites

### Entra ID app registration

| Setting | Value |
|---------|-------|
| Permission type | Application (not delegated) |
| API permission | Microsoft Graph → `ThreatHunting.Read.All` |
| Grant type | Client credentials |
| Admin consent | Required |

You'll need:
- **Tenant ID** — from Entra ID overview
- **Client ID** — application/client ID from the app registration
- **Client Secret** — Certificates & secrets → New client secret

## Credential lifecycle

| Action | Command |
|--------|---------|
| First-time setup | `./setup-defender-xdr.sh` |
| Update credentials | `./setup-defender-xdr.sh --reconfigure` |
| Remove credentials | `./setup-defender-xdr.sh --cleanup` |
| Non-interactive removal | `./setup-defender-xdr.sh --cleanup --yes` |

## Usage

From within opencode, ask the agent to run a live query:

```
Use defender-xdr-hunt to show me the last 10 DeviceProcessEvents
```

```
Run: DeviceProcessEvents | where Timestamp > ago(1h) | summarize count()
```

```
Check what columns are in DeviceNetworkEvents by running a limit 1 query against the live tenant
```

```
I wrote this detection query. Run it against the live API and tell me if the results look like false positives:
DeviceProcessEvents | where InitiatingProcessFileName =~ "wscript.exe" | project Timestamp, DeviceName, FileName, ProcessCommandLine | take 20
```

The agent uses `defender-xdr-hunt` for bounded live queries and loads
`detection-engineering` for static table and column references.

Factory test execution attempts both Defender XDR and Sentinel rule harnesses
through Defender XDR. Sentinel-only Kusto incompatibilities are reported as
warnings; they do not prove that a Sentinel query is valid.

Detection-factory commands are autonomous by default. Pass `--gated` to require
plan and repair approvals. Factory planners are limited to eight direct hunting
queries per run; implementations and independent reviews still execute the
required synthetic testblocks.

## Security

| Measure | What it prevents |
|---------|-----------------|
| `.env` file at `~/.local/share/` (outside git) | Accidental `git add` / `git commit` |
| `chmod 600` on credentials file | Other users reading the file |
| Tool reads file directly, never via `process.env` | Agent `bash` tool dumping env vars to LLM |
| Unified error sanitization | LLM provider never receives raw API error bodies |
| Raw errors logged to file, not returned to agent | Operator can debug without leaking to LLM |
| Pre-flight validation in wrapper | Expired/token failures caught before opencode starts |
| `shred -u` on cleanup | Secure credential removal |
