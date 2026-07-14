#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(dirname "$(realpath "$0")")"
REPO_AGENTS="$REPO_ROOT/agents"
REPO_SKILLS="$REPO_ROOT/skills"

GLOBAL_AGENTS="$HOME/.claude/agents"
GLOBAL_SKILLS="$HOME/.claude/skills"

# Backup dir
backup_parent="$HOME/.claude/backups"
backup="$backup_parent/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"

# --- Agents ---
mkdir -p "$GLOBAL_AGENTS"
for f in "$GLOBAL_AGENTS"/*.md; do
    [ -f "$f" ] && mv "$f" "$backup/"
done

for dir in "$REPO_AGENTS"/*/; do
    name="$(basename "$dir")"
    src="$dir/$name.md"
    dst="$GLOBAL_AGENTS/$name.md"
    if [ -f "$src" ]; then
        ln -sf "$(realpath "$src")" "$dst"
    fi
done

# Symlink detection_engineer directory (so knowledge/ is accessible)
src_dir="$REPO_AGENTS/detection_engineer"
dst_dir="$GLOBAL_AGENTS/detection_engineer"
[ -d "$dst_dir" ] || [ -L "$dst_dir" ] && mv "$dst_dir" "$backup/"
ln -sf "$(realpath "$src_dir")" "$dst_dir"

# --- Skills ---
mkdir -p "$GLOBAL_SKILLS"
if [ -d "$REPO_SKILLS" ]; then
    for skill_dir in "$REPO_SKILLS"/*/; do
        [ -d "$skill_dir" ] || continue
        name="$(basename "$skill_dir")"
        dst="$GLOBAL_SKILLS/$name"
        [ -d "$dst" ] || [ -L "$dst" ] && mv "$dst" "$backup/"
        ln -sf "$(realpath "$skill_dir")" "$dst"
    done

    # Remove orphaned symlinks whose source no longer exists in repo
    if [ -d "$GLOBAL_SKILLS" ]; then
        for dst in "$GLOBAL_SKILLS"/*/; do
            [ -L "$dst" ] || continue
            if [ ! -d "$(readlink -f "$dst")" ]; then
                mv "$dst" "$backup/"
            fi
        done
    fi
fi

echo "Done. Backed up old configs to $backup"
