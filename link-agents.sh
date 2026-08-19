#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(dirname "$(realpath "$0")")"
REPO_AGENTS="$REPO_ROOT/agents"
REPO_SKILLS="$REPO_ROOT/skills"
REPO_TOOLS="$REPO_ROOT/tools"
REPO_COMMANDS="$REPO_ROOT/commands"

GLOBAL_ROOT="$HOME/.config/opencode"
GLOBAL_AGENTS="$GLOBAL_ROOT/agents"
GLOBAL_SKILLS="$GLOBAL_ROOT/skills"
GLOBAL_TOOLS="$GLOBAL_ROOT/tools"
GLOBAL_COMMANDS="$GLOBAL_ROOT/commands"

backup="$GLOBAL_ROOT/backups/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup/agents" "$backup/skills" "$backup/tools" "$backup/commands"
mkdir -p "$GLOBAL_AGENTS" "$GLOBAL_SKILLS" "$GLOBAL_TOOLS" "$GLOBAL_COMMANDS"

backup_existing() {
    local dst="$1"
    local category="$2"
    if [ -e "$dst" ] || [ -L "$dst" ]; then
        mv "$dst" "$backup/$category/$(basename "$dst")"
    fi
}

link_owned() {
    local src="$1"
    local dst="$2"
    local category="$3"
    local resolved_src
    resolved_src="$(realpath "$src")"

    if [ -L "$dst" ] && [ "$(readlink -f "$dst")" = "$resolved_src" ]; then
        return
    fi

    backup_existing "$dst" "$category"
    ln -s "$resolved_src" "$dst"
}

cleanup_orphaned_links() {
    local destination="$1"
    local category="$2"
    shift 2
    local roots=("$@")

    for dst in "$destination"/*; do
        [ -L "$dst" ] || continue
        local target raw_target
        raw_target="$(readlink "$dst" 2>/dev/null || true)"
        case "$raw_target" in
            /*) target="$(realpath -m "$raw_target")" ;;
            *) target="$(realpath -m "$(dirname "$dst")/$raw_target")" ;;
        esac
        local managed=false
        for root in "${roots[@]}"; do
            case "$target" in
                "$root"/*) managed=true ;;
            esac
        done
        if [ "$managed" = true ] && [ ! -e "$target" ]; then
            backup_existing "$dst" "$category"
        fi
    done
}

# Agents are always linked as one flat Markdown file. Reference directories are
# exposed as skills below, never as nested agent trees.
for dir in "$REPO_AGENTS"/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"
    src="$dir/$name.md"
    [ -f "$src" ] || continue
    link_owned "$src" "$GLOBAL_AGENTS/$name.md" agents
done

# Remove the old whole-directory links that recursively registered knowledge
# files and duplicate agent definitions.
for dst in "$GLOBAL_AGENTS"/*; do
    [ -L "$dst" ] || continue
    case "$(readlink -f "$dst" 2>/dev/null || true)" in
        "$REPO_AGENTS"/*)
            case "$(basename "$dst")" in
                *.md) ;;
                *) backup_existing "$dst" agents ;;
            esac
            ;;
    esac
done
cleanup_orphaned_links "$GLOBAL_AGENTS" agents "$REPO_AGENTS"

for tool_file in "$REPO_TOOLS"/*.ts; do
    [ -f "$tool_file" ] || continue
    link_owned "$tool_file" "$GLOBAL_TOOLS/$(basename "$tool_file")" tools
done
cleanup_orphaned_links "$GLOBAL_TOOLS" tools "$REPO_TOOLS"

for skill_dir in "$REPO_SKILLS"/*/; do
    [ -f "$skill_dir/SKILL.md" ] || continue
    name="$(basename "$skill_dir")"
    link_owned "$skill_dir" "$GLOBAL_SKILLS/$name" skills
done

# Existing knowledge trees remain intact in the repository but are deployed as
# skills so their Markdown reference files are not discovered as subagents.
link_owned "$REPO_AGENTS/detection_engineer/knowledge" "$GLOBAL_SKILLS/detection-engineering" skills
link_owned "$REPO_AGENTS/cti/knowledge" "$GLOBAL_SKILLS/threat-informed-detection" skills
link_owned "$REPO_AGENTS/forensic_analyst/knowledge" "$GLOBAL_SKILLS/forensic-reference" skills
cleanup_orphaned_links "$GLOBAL_SKILLS" skills "$REPO_SKILLS" "$REPO_AGENTS"

for command_file in "$REPO_COMMANDS"/*.md; do
    [ -f "$command_file" ] || continue
    link_owned "$command_file" "$GLOBAL_COMMANDS/$(basename "$command_file")" commands
done
cleanup_orphaned_links "$GLOBAL_COMMANDS" commands "$REPO_COMMANDS"

printf 'Linked agents, skills, tools, and commands. Backups: %s\n' "$backup"
