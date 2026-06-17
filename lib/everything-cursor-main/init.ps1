#Requires -Version 5.1
# ============================================================================
# Everything Cursor — One-Click Deploy Script (Windows PowerShell)
# ============================================================================
#
# USAGE:
#   .\init.ps1                    # Interactive mode — choose what to do
#   .\init.ps1 -Global            # Install rules + skills globally
#   .\init.ps1 -Project           # Init current project with agents + commands
#   .\init.ps1 -All               # Both global install + project init
#   .\init.ps1 -Project -Force    # Overwrite existing project configs
#   .\init.ps1 -Status            # Check what's installed
#
# ============================================================================

param(
    [switch]$Global,
    [switch]$Project,
    [switch]$All,
    [switch]$Force,
    [switch]$Status,
    [string]$TargetDir = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$SourceDir = $PSScriptRoot
$GlobalDir = "$env:USERPROFILE\.cursor"

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Banner {
    Write-Host ""
    Write-Host "  Everything Cursor — Deploy Script" -ForegroundColor Cyan
    Write-Host "  ==================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Ok { param([string]$Msg) Write-Host "  [OK]      $Msg" -ForegroundColor Green }
function Write-Skip { param([string]$Msg) Write-Host "  [SKIP]    $Msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$Msg) Write-Host "  [ERROR]   $Msg" -ForegroundColor Red }
function Write-Info { param([string]$Msg) Write-Host "  [INFO]    $Msg" -ForegroundColor Gray }

function Copy-Module {
    param(
        [string]$Name,
        [string]$Src,
        [string]$Dst,
        [bool]$IsForce
    )
    if (-not (Test-Path $Src)) {
        Write-Fail "$Name source not found: $Src"
        return $false
    }
    if ((Test-Path $Dst) -and -not $IsForce) {
        $count = (Get-ChildItem $Dst -File -Recurse).Count
        Write-Skip "$Name already exists ($count files). Use -Force to overwrite."
        return $true
    }
    if (Test-Path $Dst) { Remove-Item $Dst -Recurse -Force }
    Copy-Item -Path $Src -Destination $Dst -Recurse -Force
    $count = (Get-ChildItem $Dst -File -Recurse).Count
    Write-Ok "$Name installed ($count files)"
    return $true
}

# ── Source Validation ────────────────────────────────────────────────────────

function Test-Source {
    if (-not (Test-Path "$SourceDir\.cursor")) {
        Write-Fail "Source .cursor/ not found at $SourceDir"
        Write-Host "  Make sure you run this script from the everything-cursor repo." -ForegroundColor Red
        return $false
    }
    return $true
}

# ── Status Check ─────────────────────────────────────────────────────────────

function Show-Status {
    Write-Host ""
    Write-Host "  Installation Status" -ForegroundColor Cyan
    Write-Host "  -------------------" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Global ($GlobalDir):" -ForegroundColor White

    $modules = @(
        @{ Name = "Rules";  Path = "$GlobalDir\rules";  Glob = "*.mdc" },
        @{ Name = "Skills"; Path = "$GlobalDir\skills";  Glob = "SKILL.md" }
    )
    foreach ($m in $modules) {
        if (Test-Path $m.Path) {
            $count = (Get-ChildItem $m.Path -Filter $m.Glob -Recurse).Count
            Write-Ok "$($m.Name): $count files"
        } else {
            Write-Fail "$($m.Name): not installed"
        }
    }

    # Check if agents were mistakenly installed globally
    if (Test-Path "$GlobalDir\agents") {
        $count = (Get-ChildItem "$GlobalDir\agents" -Filter "*.md").Count
        Write-Info "Agents: $count files (global — NOTE: Cursor only reads agents per-project)"
    }

    Write-Host ""
    Write-Host "  Current Project ($TargetDir):" -ForegroundColor White

    $projModules = @(
        @{ Name = "Agents";   Path = "$TargetDir\.cursor\agents";   Glob = "*.md" },
        @{ Name = "Commands"; Path = "$TargetDir\.cursor\commands";  Glob = "*.md" },
        @{ Name = "Hooks";    Path = "$TargetDir\.cursor\hooks";     Glob = "*" },
        @{ Name = "MCP";      Path = "$TargetDir\.cursor\mcp.json";  Glob = $null }
    )
    foreach ($m in $projModules) {
        if ($m.Glob -eq $null) {
            if (Test-Path $m.Path) { Write-Ok "$($m.Name): configured" }
            else { Write-Fail "$($m.Name): not configured" }
        } else {
            if (Test-Path $m.Path) {
                $count = (Get-ChildItem $m.Path -Filter $m.Glob -Recurse -File).Count
                Write-Ok "$($m.Name): $count files"
            } else {
                Write-Fail "$($m.Name): not installed"
            }
        }
    }
    Write-Host ""
}

# ── Global Install ───────────────────────────────────────────────────────────

function Install-Global {
    Write-Host "  Global Install -> $GlobalDir" -ForegroundColor White
    Write-Host ""

    if (-not (Test-Path $GlobalDir)) {
        New-Item -ItemType Directory -Path $GlobalDir -Force | Out-Null
    }

    $null = Copy-Module -Name "Rules" -Src "$SourceDir\.cursor\rules" -Dst "$GlobalDir\rules" -IsForce $Force.IsPresent
    $null = Copy-Module -Name "Skills" -Src "$SourceDir\.cursor\skills" -Dst "$GlobalDir\skills" -IsForce $Force.IsPresent

    Write-Host ""
    Write-Ok "Global install complete. Rules + Skills apply to ALL projects."
}

# ── Project Init ─────────────────────────────────────────────────────────────

function Install-Project {
    Write-Host "  Project Init -> $TargetDir\.cursor" -ForegroundColor White
    Write-Host ""

    if (-not (Test-Path "$TargetDir\.cursor")) {
        New-Item -ItemType Directory -Path "$TargetDir\.cursor" -Force | Out-Null
    }

    $null = Copy-Module -Name "Agents" -Src "$SourceDir\.cursor\agents" -Dst "$TargetDir\.cursor\agents" -IsForce $Force.IsPresent
    $null = Copy-Module -Name "Commands" -Src "$SourceDir\.cursor\commands" -Dst "$TargetDir\.cursor\commands" -IsForce $Force.IsPresent
    $null = Copy-Module -Name "Hooks" -Src "$SourceDir\.cursor\hooks" -Dst "$TargetDir\.cursor\hooks" -IsForce $Force.IsPresent

    # MCP: only copy if not exists (never overwrite without -Force)
    if (-not (Test-Path "$TargetDir\.cursor\mcp.json")) {
        Copy-Item -Path "$SourceDir\.cursor\mcp.json" -Destination "$TargetDir\.cursor\mcp.json" -Force
        Write-Ok "MCP config installed"
    } elseif ($Force.IsPresent) {
        Copy-Item -Path "$SourceDir\.cursor\mcp.json" -Destination "$TargetDir\.cursor\mcp.json" -Force
        Write-Ok "MCP config overwritten"
    } else {
        Write-Skip "MCP config already exists. Use -Force to overwrite."
    }

    Write-Host ""
    Write-Ok "Project init complete. @orchestrator and /commands are now available."
}

# ── Interactive Mode ─────────────────────────────────────────────────────────

function Show-Menu {
    Write-Host "  What would you like to do?" -ForegroundColor White
    Write-Host ""
    Write-Host "  [1] Global Install    — Rules + Skills for all projects" -ForegroundColor White
    Write-Host "  [2] Project Init      — Agents + Commands for this project" -ForegroundColor White
    Write-Host "  [3] Full Setup        — Both global + project" -ForegroundColor White
    Write-Host "  [4] Check Status      — See what's installed" -ForegroundColor White
    Write-Host "  [0] Exit" -ForegroundColor Gray
    Write-Host ""
    $choice = Read-Host "  Enter choice (0-4)"
    return $choice
}

# ── Main ─────────────────────────────────────────────────────────────────────

Write-Banner

if (-not (Test-Source)) { exit 1 }

if ($Status) {
    Show-Status
    exit 0
}

if ($All) {
    Install-Global
    Write-Host ""
    Install-Project
    Write-Host ""
    Show-Status
    exit 0
}

if ($Global) {
    Install-Global
    exit 0
}

if ($Project) {
    Install-Project
    exit 0
}

# Interactive mode if no flags provided
while ($true) {
    $choice = Show-Menu
    Write-Host ""
    switch ($choice) {
        "1" { Install-Global; Write-Host "" }
        "2" { Install-Project; Write-Host "" }
        "3" {
            Install-Global
            Write-Host ""
            Install-Project
            Write-Host ""
            Show-Status
        }
        "4" { Show-Status }
        "0" { Write-Host "  Bye!" -ForegroundColor Gray; Write-Host ""; exit 0 }
        default { Write-Host "  Invalid choice. Try again." -ForegroundColor Red; Write-Host "" }
    }
}
