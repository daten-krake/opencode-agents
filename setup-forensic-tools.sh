#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[-]${NC} $*"; }
info() { echo -e "${CYAN}[*]${NC} $*"; }

require_root() {
    if [[ $EUID -ne 0 ]]; then
        err "This script must be run as root (or with sudo)."
        exit 1
    fi
}

detect_pkg_manager() {
    if command -v apt-get &>/dev/null; then
        echo "apt"
    elif command -v dnf &>/dev/null; then
        echo "dnf"
    elif command -v yum &>/dev/null; then
        echo "yum"
    elif command -v zypper &>/dev/null; then
        echo "zypper"
    elif command -v pacman &>/dev/null; then
        echo "pacman"
    else
        echo "unknown"
    fi
}

# ─── APT (Debian / Ubuntu) ───────────────────────────────────────────
install_apt() {
    log "Detected apt-based system (Debian/Ubuntu)."
    log "Updating package lists..."
    apt-get update -y

    log "Installing core forensic tools via apt..."

    # Disk & filesystem
    apt-get install -y sleuthkit dc3dd ewf-tools foremost testdisk scalpel \
        binwalk bulk-extractor afflib-tools libvshadow-utils \
        libbde-utils fsarchiver ddrescue

    # Memory forensics
    apt-get install -y volatility3

    # Network forensics
    apt-get install -y tshark tcpdump ngrep dsniff net-tools

    # Zeek — may be named zeek or zeek-lts
    apt-get install -y zeek || apt-get install -y zeek-lts || warn "Zeek not available via apt, skipping."

    # Hashing
    apt-get install -y md5deep ssdeep

    # File analysis
    apt-get install -y exiftool sqlite3 yara clamav

    # Plaso (log2timeline) — only available from GIFT repository on some distros
    log "Plaso is not typically available in base repos. Installing via pip3..."
    # But first try system package; some newer Ubuntus have it
    apt-get install -y plaso-tools 2>/dev/null || warn "plaso-tools not in apt repos; will install via pip3 later."

    # Autopsy — may not be in all repos
    apt-get install -y autopsy 2>/dev/null || warn "autopsy not in apt repos, skipping."

    # Registry tools (from github, handled later)
    # EVTX tools (from github, handled later)
}

# ─── DNF (Fedora / RHEL 8+) ──────────────────────────────────────────
install_dnf() {
    log "Detected dnf-based system (Fedora / RHEL 8+)."
    log "Updating package lists..."
    dnf check-update -y || true

    log "Enabling EPEL and RPM Fusion (if needed)..."
    dnf install -y epel-release 2>/dev/null || warn "EPEL not available."
    dnf install -y \
        https://download1.rpmfusion.org/free/el/rpmfusion-free-release-$(rpm -E %rhel).noarch.rpm \
        2>/dev/null || warn "RPM Fusion not available."

    log "Installing core forensic tools via dnf..."

    dnf install -y sleuthkit dc3dd ewf-tools foremost testdisk scalpel \
        binwalk bulk-extractor afflib-tools libvshadow-utils \
        libbde-utils fsarchiver ddrescue

    dnf install -y volatility3

    dnf install -y tshark tcpdump ngrep dsniff net-tools wireshark-cli

    dnf install -y zeek 2>/dev/null || warn "Zeek not in dnf repos, skipping."

    dnf install -y md5deep ssdeep

    dnf install -y exiftool sqlite yara clamav

    dnf install -y plaso-tools 2>/dev/null || warn "plaso-tools not in dnf repos; will install via pip3 later."
    dnf install -y autopsy 2>/dev/null || warn "autopsy not in dnf repos, skipping."

    # Enable and configure zeek if installed
    if command -v zeek &>/dev/null; then
        mkdir -p /opt/zeek/logs && chown -R "$(logname):$(logname)" /opt/zeek 2>/dev/null || true
    fi
}

# ─── Yum (RHEL / CentOS 7) ──────────────────────────────────────────
install_yum() {
    log "Detected yum-based system (RHEL / CentOS 7)."
    log "Updating package lists..."
    yum check-update -y || true

    log "Enabling EPEL..."
    yum install -y epel-release 2>/dev/null || warn "EPEL not available."

    log "Installing core forensic tools via yum..."

    yum install -y sleuthkit dc3dd ewf-tools foremost testdisk scalpel \
        binwalk bulk-extractor afflib-tools libvshadow-utils \
        fsarchiver ddrescue 2>/dev/null

    yum install -y volatility3 2>/dev/null || warn "volatility3 not in yum repos."

    yum install -y tshark tcpdump ngrep dsniff net-tools wireshark

    yum install -y zeek 2>/dev/null || warn "Zeek not in yum repos, skipping."

    yum install -y md5deep ssdeep 2>/dev/null

    yum install -y exiftool sqlite yara clamav 2>/dev/null || warn "Some packages missing from yum."

    yum install -y plaso-tools 2>/dev/null || warn "plaso-tools not available via yum."
    yum install -y autopsy 2>/dev/null || warn "autopsy not available via yum."
}

# ─── Zypper (openSUSE) ───────────────────────────────────────────────
install_zypper() {
    log "Detected zypper-based system (openSUSE)."
    zypper refresh

    zypper install -y sleuthkit dc3dd ewf-tools foremost testdisk scalpel \
        binwalk bulk-extractor afflib-tools libvshadow-utils fsarchiver ddrescue

    zypper install -y tshark tcpdump ngrep dsniff net-tools wireshark-cli

    zypper install -y md5deep ssdeep exiftool sqlite3 yara clamav

    zypper install -y volatility3 2>/dev/null || warn "volatility3 not in zypper repos."
    zypper install -y zeek 2>/dev/null || warn "Zeek not in zypper repos."
    zypper install -y plaso-tools 2>/dev/null || warn "plaso-tools not in zypper repos."
    zypper install -y autopsy 2>/dev/null || warn "autopsy not in zypper repos."
}

# ─── Pacman (Arch) ────────────────────────────────────────────────────
install_pacman() {
    log "Detected pacman-based system (Arch Linux)."
    pacman -Syu --noconfirm

    pacman -S --noconfirm sleuthkit dc3dd \
        foremost testdisk scalpel binwalk bulk-extractor afflib \
        libvshadow libbde ddrescue

    pacman -S --noconfirm tshark tcpdump ngrep dsniff net-tools wireshark-cli

    pacman -S --noconfirm md5deep ssdeep exiftool sqlite3 yara clamav

    pacman -S --noconfirm volatility3 2>/dev/null || \
        warn "volatility3 not in pacman repos; install via pip3."

    # Zeek from AUR
    if command -v yay &>/dev/null; then
        yay -S --noconfirm zeek-lts 2>/dev/null || warn "Zeek not available via yay/AUR."
    elif command -v paru &>/dev/null; then
        paru -S --noconfirm zeek-lts 2>/dev/null || warn "Zeek not available via paru/AUR."
    else
        warn "Zeek requires AUR helper (yay/paru). Skipping."
    fi
}

# ─── pip3 installations ───────────────────────────────────────────────
install_pip_tools() {
    log "Installing / upgrading Python forensic tools via pip3..."

    # Ensure pip3 is available
    if ! command -v pip3 &>/dev/null; then
        warn "pip3 not found. Installing python3-pip..."
        case "$PKG_MGR" in
            apt)    apt-get install -y python3-pip ;;
            dnf|yum) dnf install -y python3-pip || yum install -y python3-pip ;;
            zypper) zypper install -y python3-pip ;;
            pacman) pacman -S --noconfirm python-pip ;;
        esac
    fi

    # Core forensic Python tools
    pip3 install --upgrade pip 2>/dev/null || true

    pip3 install volatility3 || warn "Failed to install volatility3 via pip3"

    # Plaso
    log "Installing plaso (log2timeline) via pip3 — this may take a while..."
    pip3 install plaso 2>/dev/null || {
        warn "plaso pip3 install failed. Trying with --break-system-packages..."
        pip3 install --break-system-packages plaso 2>/dev/null || \
            err "plaso installation failed. Timeline analysis will be unavailable."
    }

    # Registry tools
    pip3 install python-registry 2>/dev/null || \
        warn "python-registry pip3 install failed."
    pip3 install regipy 2>/dev/null || \
        warn "regipy install failed."

    # File analysis
    pip3 install oletools 2>/dev/null || warn "oletools install failed."
    pip3 install pefile 2>/dev/null || warn "pefile install failed."

    # Memory dump tools
    pip3 install rekall 2>/dev/null || warn "rekall install failed."
}

# ─── GitHub / source-based installations ──────────────────────────────
install_github_tools() {
    local INSTALL_BASE="/opt/forensic-tools"
    log "Installing tools from GitHub into $INSTALL_BASE ..."

    mkdir -p "$INSTALL_BASE"

    # ── Eric Zimmerman's Tools (Windows, but parsers can run on Linux) ──
    # These are .NET tools; most require mono or dotnet runtime on Linux
    # We clone for reference but note they need Windows or dotnet
    if command -v git &>/dev/null; then
        log "Cloning Eric Zimmerman's forensic tools (reference only; many require .NET/Mono)..."
        git clone --depth 1 https://github.com/EricZimmerman/Get-ZimmermanTools.git \
            "$INSTALL_BASE/Get-ZimmermanTools" 2>/dev/null || \
            warn "Failed to clone Zimmerman tools."

        # ── Floss (FireEye Labs Obfuscated String Solver) ──
        log "Installing FLOSS (floss)..."
        pip3 install flare-floss 2>/dev/null || \
            warn "flare-floss pip3 install failed."

        # ── Chainsaw (Sigma over EVTX) ──
        log "Installing Chainsaw..."
        # Download latest binary if available
        local CHAINSAW_VERSION="v2.10.0"
        local CHAINSAW_URL="https://github.com/WithSecureLabs/chainsaw/releases/download/${CHAINSAW_VERSION}/chainsaw_x86_64-unknown-linux-gnu.tar.gz"
        curl -sL "$CHAINSAW_URL" -o /tmp/chainsaw.tar.gz 2>/dev/null && {
            tar xzf /tmp/chainsaw.tar.gz -C "$INSTALL_BASE/"
            ln -sf "$INSTALL_BASE/chainsaw/chainsaw" /usr/local/bin/chainsaw 2>/dev/null || true
            rm -f /tmp/chainsaw.tar.gz
        } || warn "Failed to download Chainsaw. You can install manually from https://github.com/WithSecureLabs/chainsaw"

        # ── Hayabusa (fast Windows event log analysis) ──
        log "Installing Hayabusa..."
        local HAYABUSA_VERSION="v3.1.1"
        local HAYABUSA_URL="https://github.com/Yamato-Security/hayabusa/releases/download/${HAYABUSA_VERSION}/hayabusa-${HAYABUSA_VERSION}-linux-x64.zip"
        curl -sL "$HAYABUSA_URL" -o /tmp/hayabusa.zip 2>/dev/null && {
            unzip -o /tmp/hayabusa.zip -d "$INSTALL_BASE/hayabusa/" 2>/dev/null
            chmod +x "$INSTALL_BASE/hayabusa/hayabusa" 2>/dev/null || true
            ln -sf "$INSTALL_BASE/hayabusa/hayabusa" /usr/local/bin/hayabusa 2>/dev/null || true
            rm -f /tmp/hayabusa.zip
        } || warn "Failed to download Hayabusa. Install manually from https://github.com/Yamato-Security/hayabusa"

        # ── Volatility 3 (latest from GitHub for symbols/plugins) ──
        log "Cloning Volatility3 latest from GitHub..."
        git clone --depth 1 https://github.com/volatilityfoundation/volatility3.git \
            "$INSTALL_BASE/volatility3" 2>/dev/null || \
            warn "Failed to clone volatility3 from GitHub."
        # Create wrapper script
        if [[ -d "$INSTALL_BASE/volatility3" ]]; then
            cat > /usr/local/bin/vol3 <<'VOLSCRIPT'
#!/usr/bin/env bash
exec python3 /opt/forensic-tools/volatility3/vol.py "$@"
VOLSCRIPT
            chmod +x /usr/local/bin/vol3
        fi

        # ── AVML (Acquire Volatile Memory for Linux) ──
        log "Downloading AVML..."
        local AVML_URL="https://github.com/microsoft/avml/releases/latest/download/avml"
        curl -sL "$AVML_URL" -o /usr/local/bin/avml 2>/dev/null && \
            chmod +x /usr/local/bin/avml || \
            warn "Failed to download AVML."

        # ── LiME (Linux Memory Extractor) ──
        log "Cloning LiME..."
        git clone --depth 1 https://github.com/504ensicsLabs/LiME.git \
            "$INSTALL_BASE/LiME" 2>/dev/null || \
            warn "Failed to clone LiME. Will need to compile from source for target kernel."

    else
        warn "git not found. Skipping GitHub-based tool installations."
        warn "Install git (apt install git / dnf install git) and re-run this script for full toolkit."
    fi

    # ── RegRipper ──
    if command -v git &>/dev/null; then
        log "Cloning RegRipper..."
        git clone --depth 1 https://github.com/keydet89/RegRipper3.0.git \
            "$INSTALL_BASE/RegRipper3.0" 2>/dev/null || \
            warn "Failed to clone RegRipper."

        # Create rip wrapper
        if [[ -d "$INSTALL_BASE/RegRipper3.0" ]]; then
            cat > /usr/local/bin/rip <<'RIPSCRIPT'
#!/usr/bin/env bash
PERL5LIB="/opt/forensic-tools/RegRipper3.0/lib:$PERL5LIB" \
    exec perl /opt/forensic-tools/RegRipper3.0/rip.pl "$@"
RIPSCRIPT
            chmod +x /usr/local/bin/rip
            log "RegRipper installed. Use 'rip -r <hive> -p <plugin>'"
        fi
    fi
}

# ─── Post-install Setup ────────────────────────────────────────────────
post_install_setup() {
    log "Running post-install configuration..."

    # Configure tshark for non-root capture (optional, for live capture only)
    if command -v tshark &>/dev/null; then
        if ! getent group wireshark &>/dev/null; then
            groupadd wireshark 2>/dev/null || true
        fi
        usermod -aG wireshark "$(logname)" 2>/dev/null || {
            warn "Could not add user $(logname) to wireshark group."
        }
    fi

    # Update ClamAV definitions
    if command -v freshclam &>/dev/null; then
        log "Updating ClamAV virus definitions..."
        freshclam --quiet 2>/dev/null || warn "freshclam failed. Run 'freshclam' manually later."
    fi

    # Verify key tools are available
    log "Verifying installed tools..."

    local TOOLS_CHECK=(
        dc3dd fls icat mmls fsstat foremost bulk_extractor
        tshark tcpdump ngrep
        md5deep sha256deep ssdeep
        exiftool strings yara sqlite3
        volatility3
    )

    local FAILED=()
    for tool in "${TOOLS_CHECK[@]}"; do
        if command -v "$tool" &>/dev/null; then
            info "  $tool — OK"
        else
            warn "  $tool — NOT FOUND"
            FAILED+=("$tool")
        fi
    done

    # Check plaso separately (scripts may not be on PATH)
    if command -v log2timeline.py &>/dev/null; then
        info "  log2timeline.py (plaso) — OK"
    else
        warn "  log2timeline.py (plaso) — NOT FOUND on PATH"
        warn "    Plaso scripts may be in ~/.local/bin/ — add to PATH or use full path."
        FAILED+=("log2timeline.py")
    fi

    if [[ ${#FAILED[@]} -gt 0 ]]; then
        warn "Some tools are missing: ${FAILED[*]}"
        warn "You may need to install them manually or check the package name for your distro."
    else
        log "All core forensic tools verified successfully."
    fi

    log ""
    log "Installation complete."
    log "Tools installed to:"
    log "  System packages — via package manager"
    log "  Python tools      — via pip3"
    log "  GitHub tools      — $INSTALL_BASE/"
    log ""
    log "Available wrappers:"
    log "  vol3              — Latest Volatility3 from GitHub"
    log "  rip               — RegRipper CLI"
    log "  chainsaw          — Sigma over EVTX (if downloaded)"
    log "  hayabusa          — Fast EVTX timeline (if downloaded)"
    log "  avml              — Memory acquisition (AVML)"
    log ""
    log "To compile LiME for a specific kernel:"
    log "  cd /opt/forensic-tools/LiME/src && make"
    log ""
    log "NOTE: Eric Zimmerman's tools (https://ericzimmerman.github.io/) require .NET runtime."
    log "      Run them on Windows or with 'dotnet run' on Linux."
}

# ─── Main ──────────────────────────────────────────────────────────────
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║        Forensic Analyst — Tool Installation Script           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    require_root

    PKG_MGR=$(detect_pkg_manager)
    log "Detected package manager: $PKG_MGR"

    if [[ "$PKG_MGR" == "unknown" ]]; then
        err "Unsupported Linux distribution. Could not detect apt, dnf, yum, zypper, or pacman."
        err "Please install forensic tools manually."
        exit 1
    fi

    case "$PKG_MGR" in
        apt)    install_apt ;;
        dnf)    install_dnf ;;
        yum)    install_yum ;;
        zypper) install_zypper ;;
        pacman) install_pacman ;;
    esac

    install_pip_tools
    install_github_tools
    post_install_setup
}

main "$@"
