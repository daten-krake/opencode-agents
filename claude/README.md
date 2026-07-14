# Claude Code agent configs

Claude Code port of the opencode agents in `../agents`. Bodies (system prompts) are
copied **verbatim**; only the YAML frontmatter was rewritten to Claude Code's
subagent schema. Skills and the custom tool are portable and copied unchanged.

## Layout

```
claude/
├── agents/
│   ├── detection_engineer/
│   │   ├── detection_engineer.md   # agent (name: detection-engineer)
│   │   └── knowledge/              # Sentinel/Defender schema + methodology (99 files)
│   ├── go_expert/go_expert.md
│   ├── purple_team/purple_team.md
│   ├── red_team/red_team.md
│   ├── reviewer/reviewer.md
│   └── security-eng/security-eng.md
├── skills/                         # portable as-is (already Anthropic skill format)
│   ├── defender-xdr-hunt/
│   └── detection-test/
└── tools/defender-xdr-hunt.ts
```

## Frontmatter mapping (opencode → Claude Code)

| opencode | Claude Code | Notes |
|---|---|---|
| — | `name:` | Added; kebab-case (e.g. `detection-engineer`). Required by Claude Code. |
| `description:` | `description:` | Copied verbatim. |
| `mode: subagent` | *(dropped)* | Every file under `agents/` is a subagent; no field exists. |
| `model: ollama-cloud/deepseek-v4-pro` | `model: opus` / `sonnet` | Claude Code only accepts `opus`/`sonnet`/`haiku`/`inherit`. Tiered — see below. |
| `temperature: 0.1` | *(dropped)* | **No per-agent temperature in Claude Code.** The deterministic bias is lost; agents run at the harness default. |
| `tools: {write:false, edit:false, bash:false}` | `tools: Read, Grep, Glob, WebFetch, WebSearch` | Claude Code uses an **allow-list** (no boolean deny). This set = "all analysis/research tools, nothing that mutates or executes" — the faithful equivalent of disabling write/edit/bash. **detection-engineer additionally gets `Bash, Skill`** so its skills run (see caveat 1). |

## Model tiering

| Agent | Model | Rationale |
|---|---|---|
| detection-engineer, red-team, purple-team, security-eng | `opus` | Deep, high-stakes analysis. |
| reviewer, go-expert | `sonnet` | Focused code review; cost/quality balance. |

Change any of these by editing the `model:` line in that agent's `.md`.

## Caveats / things to verify before use

1. **detection-engineer has `Bash, Skill` (deliberate deviation from opencode).**
   The `detection-test` skill runs Python and `defender-xdr-hunt` invokes the TS
   tool — both need `Bash` (and `Skill`) to execute. The opencode config had
   `bash:false`, which would leave this agent author/analyze-only; to keep its
   skills runnable we added `Bash, Skill` to its `tools:` line. Remove them to
   restore the strict read-only posture.
2. **`knowledge/` paths.** The detection-engineer prompt references `knowledge/…`
   relative to itself. Claude Code's Read tool resolves paths against the working
   dir, not the agent file — the same relative-path assumption opencode's symlink
   layout papered over. Point the agent at the absolute `knowledge/` path, or install
   so the paths resolve.
3. **Discovery layout.** Claude Code discovers agents from `.claude/agents/`
   (project) or `~/.claude/agents/` (user), recursing into subdirs. The nested
   `<name>/<name>.md` layout here mirrors opencode and keeps `knowledge/` beside its
   agent; if your Claude Code version doesn't recurse, flatten the `.md` files into
   `.claude/agents/` (see install note).

## Installing (analog of ../link-agents.sh)

Symlink or copy into a project or user config, e.g.:

```bash
mkdir -p ~/.claude/agents ~/.claude/skills
cp -R claude/agents/*   ~/.claude/agents/
cp -R claude/skills/*   ~/.claude/skills/
```

Then `/agents` in Claude Code to confirm they're picked up.
