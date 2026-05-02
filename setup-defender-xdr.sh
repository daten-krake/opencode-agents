#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(dirname "$(realpath "$0")")"

SECRETS_DIR="$HOME/.local/share/opencode/secrets"
SECRETS_FILE="$SECRETS_DIR/defender-xdr.env"
BIN_DIR="$HOME/.local/bin"
WRAPPER_PATH="$BIN_DIR/opencode-hunt"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

banner() {
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  Defender XDR Hunt — Credential Setup${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
}

usage() {
    echo "Usage: $0 [--reconfigure] [--cleanup] [--yes] [--help]"
    echo ""
    echo "  (no flags)        Interactive credential setup"
    echo "  --reconfigure     Re-enter credentials (overwrites existing)"
    echo "  --cleanup         Remove credentials and wrapper script"
    echo "  --yes, -y         Skip confirmation prompts"
    echo "  --help            Show this message"
    exit 0
}

die() {
    echo -e "${RED}ERROR:${NC} $1" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}WARN:${NC} $1" >&2
}

ok() {
    echo -e "${GREEN}OK:${NC} $1"
}

info() {
    echo -e "${CYAN}→${NC} $1"
}

# ── check deps ──

ensure_bun() {
    if ! command -v bun &>/dev/null; then
        echo "Bun is not installed. Installing..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
        if ! command -v bun &>/dev/null; then
            die "Bun installation failed. Install manually: https://bun.sh"
        fi
    fi
    ok "bun $(bun --version)"
}

# ── cred prompts ──

prompt_credentials() {
    echo ""
    echo -e "${CYAN}Enter your Entra ID application credentials.${NC}"
    echo "Find these in the Azure Portal → Entra ID → App registrations → [your app]"
    echo ""

    read -r -p "Tenant ID:  " tenant_id
    read -r -p "Client ID:  " client_id
    read -r -s -p "Client Secret (hidden): " client_secret
    echo ""

    if [[ -z "$tenant_id" || -z "$client_id" || -z "$client_secret" ]]; then
        die "All three fields are required."
    fi

    read -r -s -p "Confirm secret: " confirm_secret
    echo ""

    if [[ "$client_secret" != "$confirm_secret" ]]; then
        die "Secrets do not match."
    fi

    # Validate GUIDs loosely
    if ! [[ "$tenant_id" =~ ^[a-f0-9-]{30,}$ ]]; then
        warn "Tenant ID doesn't look like a GUID. Continuing anyway."
    fi
    if ! [[ "$client_id" =~ ^[a-f0-9-]{30,}$ ]]; then
        warn "Client ID doesn't look like a GUID. Continuing anyway."
    fi
}

write_secrets_file() {
    mkdir -p "$SECRETS_DIR"
    cat > "$SECRETS_FILE" <<EOF
MS_GRAPH_TENANT_ID=$tenant_id
MS_GRAPH_CLIENT_ID=$client_id
MS_GRAPH_CLIENT_SECRET=$client_secret
EOF
    chmod 600 "$SECRETS_FILE"
    ok "Credentials written to $SECRETS_FILE"
}

# ── wrapper generation ──

generate_wrapper() {
    mkdir -p "$BIN_DIR"
    cat > "$WRAPPER_PATH" <<WRAPPER
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$REPO_ROOT"

# Pre-flight credential validation
echo "Checking credentials..."
if ! bun run "\$REPO_ROOT/scripts/validate-ms-graph-credentials.ts" 2>&1; then
    echo ""
    echo "Credential validation failed."
    echo "Your client secret may have expired or permissions are misconfigured."
    echo "Re-run setup to update credentials:"
    echo "  cd $REPO_ROOT && ./setup-defender-xdr.sh --reconfigure"
    exit 1
fi

exec opencode "\$@"
WRAPPER
    chmod +x "$WRAPPER_PATH"
    ok "Wrapper written to $WRAPPER_PATH"

    if ! echo "$PATH" | tr ':' '\n' | grep -qF "$BIN_DIR"; then
        warn "$BIN_DIR is not in your PATH."
        echo "  Add this to your ~/.bashrc:"
        echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
}

# ── validation ──

validate_credentials() {
    info "Validating credentials against Microsoft Graph..."
    if bun run "$REPO_ROOT/scripts/validate-ms-graph-credentials.ts" 2>&1; then
        ok "Credentials valid. Token acquired successfully."
    else
        warn "Credential validation failed. The secret may be expired or permissions not yet granted."
        warn "You can still launch opencode-hunt — it will re-validate each time."
    fi
}

# ── setup ──

do_setup() {
    local reconfigure="${1:-false}"

    if [[ "$reconfigure" == "false" && -f "$SECRETS_FILE" ]]; then
        info "Credentials file already exists at $SECRETS_FILE"
        if [[ "$YES" != "true" ]]; then
            read -r -p "Overwrite? [y/N] " answer
            [[ "${answer,,}" != "y" ]] && die "Aborted."
        fi
    fi

    ensure_bun

    info "Linking @opencode-ai/plugin for opencode tool discovery..."
    mkdir -p "$REPO_ROOT/node_modules/@opencode-ai"
    local plugin_src="$HOME/.config/opencode/node_modules/@opencode-ai/plugin"
    local plugin_dst="$REPO_ROOT/node_modules/@opencode-ai/plugin"
    if [ -d "$plugin_src" ]; then
        ln -sf "$plugin_src" "$plugin_dst"
        ok "Linked @opencode-ai/plugin"
    else
        warn "@opencode-ai/plugin not found at $plugin_src — tool may not load in opencode"
    fi

    info "Installing dependencies..."
    (cd "$REPO_ROOT" && bun install --silent) || die "bun install failed"

    prompt_credentials
    write_secrets_file
    generate_wrapper
    validate_credentials

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  Setup complete.${NC}"
    echo ""
    echo "  Launch:  opencode-hunt"
    echo "  Skill:   defender-xdr-hunt (loads automatically in opencode)"
    echo "  Logs:    ~/.local/share/opencode/logs/defender-xdr-hunt.log"
    echo -e "${GREEN}============================================${NC}"
}

# ── cleanup ──

do_cleanup() {
    banner

    local to_remove=()
    [[ -f "$SECRETS_FILE" ]] && to_remove+=("$SECRETS_FILE")
    [[ -f "$WRAPPER_PATH" ]] && to_remove+=("$WRAPPER_PATH")

    if [[ ${#to_remove[@]} -eq 0 ]]; then
        info "Nothing to clean up. No credentials or wrapper found."
        exit 0
    fi

    echo "This will permanently remove:"
    for f in "${to_remove[@]}"; do
        echo "  $f"
    done
    echo ""

    if [[ "$YES" != "true" ]]; then
        read -r -p "Continue? [y/N] " answer
        [[ "${answer,,}" != "y" ]] && die "Aborted."
    fi

    for f in "${to_remove[@]}"; do
        if command -v shred &>/dev/null; then
            shred -u "$f" 2>/dev/null || rm -f "$f"
        else
            rm -f "$f"
        fi
        ok "Removed $f"
    done

    if [[ -f "$SECRETS_FILE" ]]; then
        warn "Could not remove $SECRETS_FILE"
    fi

    echo ""
    info "Cleanup complete."
    info "Note: Symlinks in ~/.config/opencode/ were not removed (run link-agents.sh to re-link)."
}

# ── main ──

YES="false"
MODE="setup"
RECONFIGURE="false"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --cleanup) MODE="cleanup" ;;
        --reconfigure) RECONFIGURE="true" ;;
        --yes|-y) YES="true" ;;
        --help|-h) usage ;;
        *) usage ;;
    esac
    shift
done

case "$MODE" in
    setup)
        banner
        do_setup "$RECONFIGURE"
        ;;
    cleanup)
        do_cleanup
        ;;
esac
