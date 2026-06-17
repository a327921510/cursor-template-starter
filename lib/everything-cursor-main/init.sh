#!/usr/bin/env bash
# ============================================================================
# Everything Cursor — One-Click Deploy Script (macOS / Linux)
# ============================================================================
#
# USAGE:
#   ./init.sh                     # Interactive mode
#   ./init.sh --global            # Install rules + skills globally
#   ./init.sh --project           # Init current project with agents + commands
#   ./init.sh --all               # Both global install + project init
#   ./init.sh --project --force   # Overwrite existing project configs
#   ./init.sh --status            # Check what's installed
#
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/.cursor"
GLOBAL_DIR="$HOME/.cursor"
TARGET_DIR="$(pwd)"

DO_GLOBAL=false
DO_PROJECT=false
DO_ALL=false
DO_STATUS=false
FORCE=false

# ── Parse Arguments ──────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
    case $1 in
        --global)  DO_GLOBAL=true; shift ;;
        --project) DO_PROJECT=true; shift ;;
        --all)     DO_ALL=true; shift ;;
        --force)   FORCE=true; shift ;;
        --status)  DO_STATUS=true; shift ;;
        --target)  TARGET_DIR="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ── Colors ───────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
WHITE='\033[1;37m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}[OK]${NC}      $1"; }
skip() { echo -e "  ${YELLOW}[SKIP]${NC}    $1"; }
fail() { echo -e "  ${RED}[ERROR]${NC}   $1"; }
info() { echo -e "  ${GRAY}[INFO]${NC}    $1"; }

# ── Helpers ──────────────────────────────────────────────────────────────────

copy_module() {
    local name="$1" src="$2" dst="$3"

    if [[ ! -d "$src" ]]; then
        fail "$name source not found: $src"
        return 1
    fi

    if [[ -d "$dst" && "$FORCE" != "true" ]]; then
        local count
        count=$(find "$dst" -type f | wc -l | tr -d ' ')
        skip "$name already exists ($count files). Use --force to overwrite."
        return 0
    fi

    [[ -d "$dst" ]] && rm -rf "$dst"
    cp -r "$src" "$dst"
    local count
    count=$(find "$dst" -type f | wc -l | tr -d ' ')
    ok "$name installed ($count files)"
}

# ── Source Validation ────────────────────────────────────────────────────────

if [[ ! -d "$SOURCE_DIR" ]]; then
    fail "Source .cursor/ not found at $SCRIPT_DIR"
    echo "  Make sure you run this script from the everything-cursor repo."
    exit 1
fi

# ── Status ───────────────────────────────────────────────────────────────────

show_status() {
    echo ""
    echo -e "  ${CYAN}Installation Status${NC}"
    echo -e "  ${CYAN}-------------------${NC}"
    echo ""
    echo -e "  ${WHITE}Global ($GLOBAL_DIR):${NC}"

    for module in rules skills; do
        local path="$GLOBAL_DIR/$module"
        if [[ -d "$path" ]]; then
            local count
            count=$(find "$path" -type f | wc -l | tr -d ' ')
            ok "$module: $count files"
        else
            fail "$module: not installed"
        fi
    done

    if [[ -d "$GLOBAL_DIR/agents" ]]; then
        local count
        count=$(find "$GLOBAL_DIR/agents" -name "*.md" | wc -l | tr -d ' ')
        info "agents: $count files (global — NOTE: Cursor only reads agents per-project)"
    fi

    echo ""
    echo -e "  ${WHITE}Current Project ($TARGET_DIR):${NC}"

    for module in agents commands hooks; do
        local path="$TARGET_DIR/.cursor/$module"
        if [[ -d "$path" ]]; then
            local count
            count=$(find "$path" -type f | wc -l | tr -d ' ')
            ok "$module: $count files"
        else
            fail "$module: not installed"
        fi
    done

    if [[ -f "$TARGET_DIR/.cursor/mcp.json" ]]; then
        ok "mcp: configured"
    else
        fail "mcp: not configured"
    fi
    echo ""
}

# ── Global Install ───────────────────────────────────────────────────────────

install_global() {
    echo -e "  ${WHITE}Global Install -> $GLOBAL_DIR${NC}"
    echo ""
    mkdir -p "$GLOBAL_DIR"
    copy_module "Rules" "$SOURCE_DIR/rules" "$GLOBAL_DIR/rules"
    copy_module "Skills" "$SOURCE_DIR/skills" "$GLOBAL_DIR/skills"
    echo ""
    ok "Global install complete. Rules + Skills apply to ALL projects."
}

# ── Project Init ─────────────────────────────────────────────────────────────

install_project() {
    echo -e "  ${WHITE}Project Init -> $TARGET_DIR/.cursor${NC}"
    echo ""
    mkdir -p "$TARGET_DIR/.cursor"

    copy_module "Agents" "$SOURCE_DIR/agents" "$TARGET_DIR/.cursor/agents"
    copy_module "Commands" "$SOURCE_DIR/commands" "$TARGET_DIR/.cursor/commands"
    copy_module "Hooks" "$SOURCE_DIR/hooks" "$TARGET_DIR/.cursor/hooks"

    if [[ ! -f "$TARGET_DIR/.cursor/mcp.json" ]]; then
        cp "$SOURCE_DIR/../.cursor/mcp.json" "$TARGET_DIR/.cursor/mcp.json" 2>/dev/null || true
        ok "MCP config installed"
    elif [[ "$FORCE" == "true" ]]; then
        cp "$SOURCE_DIR/../.cursor/mcp.json" "$TARGET_DIR/.cursor/mcp.json" 2>/dev/null || true
        ok "MCP config overwritten"
    else
        skip "MCP config already exists. Use --force to overwrite."
    fi

    echo ""
    ok "Project init complete. @orchestrator and /commands are now available."
}

# ── Interactive Menu ─────────────────────────────────────────────────────────

show_menu() {
    echo -e "  ${WHITE}What would you like to do?${NC}"
    echo ""
    echo -e "  ${WHITE}[1]${NC} Global Install    — Rules + Skills for all projects"
    echo -e "  ${WHITE}[2]${NC} Project Init      — Agents + Commands for this project"
    echo -e "  ${WHITE}[3]${NC} Full Setup        — Both global + project"
    echo -e "  ${WHITE}[4]${NC} Check Status      — See what's installed"
    echo -e "  ${GRAY}[0]${NC} Exit"
    echo ""
    read -rp "  Enter choice (0-4): " choice
    echo ""
}

# ── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "  ${CYAN}Everything Cursor — Deploy Script${NC}"
echo -e "  ${CYAN}==================================${NC}"
echo ""

if $DO_STATUS; then show_status; exit 0; fi

if $DO_ALL; then
    install_global; echo ""; install_project; echo ""; show_status; exit 0
fi

if $DO_GLOBAL; then install_global; exit 0; fi
if $DO_PROJECT; then install_project; exit 0; fi

# Interactive mode
while true; do
    show_menu
    case $choice in
        1) install_global; echo "" ;;
        2) install_project; echo "" ;;
        3) install_global; echo ""; install_project; echo ""; show_status ;;
        4) show_status ;;
        0) echo -e "  ${GRAY}Bye!${NC}"; echo ""; exit 0 ;;
        *) echo -e "  ${RED}Invalid choice. Try again.${NC}"; echo "" ;;
    esac
done
