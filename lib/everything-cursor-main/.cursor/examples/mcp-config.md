# MCP Server Configuration

Guide for configuring MCP (Model Context Protocol) servers in Cursor.

## Overview

MCP servers extend Cursor's capabilities with external tools and services.
Configure them in Cursor settings or project-level `.cursor/mcp.json`.

## Essential Servers

### GitHub
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_PAT_HERE"
    }
  }
}
```
**Features:** PRs, issues, repo operations

### Memory
```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```
**Features:** Persistent memory across sessions

### Context7
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@context7/mcp-server"]
  }
}
```
**Features:** Live documentation lookup

## Database Servers

### Supabase
```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  }
}
```

## Deployment Servers

### Vercel
```json
{
  "vercel": {
    "type": "http",
    "url": "https://mcp.vercel.com"
  }
}
```

### Railway
```json
{
  "railway": {
    "command": "npx",
    "args": ["-y", "@railway/mcp-server"]
  }
}
```

## Utility Servers

### Filesystem
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/projects"]
  }
}
```

### Firecrawl (Web Scraping)
```json
{
  "firecrawl": {
    "command": "npx",
    "args": ["-y", "firecrawl-mcp"],
    "env": {
      "FIRECRAWL_API_KEY": "YOUR_KEY_HERE"
    }
  }
}
```

## Best Practices

### Limit Active Servers
- Keep under 10 MCPs enabled per project
- Disable unused servers
- Too many servers can reduce context window

### Project-Specific Config
Create `.cursor/mcp.json` in project root:
```json
{
  "mcpServers": {
    "github": { "enabled": true },
    "supabase": { "enabled": true }
  },
  "disabledMcpServers": ["firecrawl"]
}
```

### Environment Variables
Store secrets in `.env.local` (add to .gitignore):
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx
```

## Quick Start

Recommended setup for web development:
```json
{
  "mcpServers": {
    "github": { "enabled": true },
    "memory": { "enabled": true },
    "context7": { "enabled": true }
  }
}
```

Add database/deployment servers as needed.
