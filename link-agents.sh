#!/usr/bin/env bash
set -euo pipefail

REPO_AGENTS="$(dirname "$0")/agents"
GLOBAL_AGENTS="$HOME/.config/opencode/agents"

# Backup existing global agents
backup="$GLOBAL_AGENTS/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"
for f in "$GLOBAL_AGENTS"/*.md; do
    [ -f "$f" ] && mv "$f" "$backup/"
done

# Symlink each agent's .md
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
[ -d "$dst_dir" ] && mv "$dst_dir" "$backup/"
ln -sf "$(realpath "$src_dir")" "$dst_dir"

echo "Done. Backed up old agents to $backup"
