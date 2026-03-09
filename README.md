# OpenMarkers

Open-source biomarker tracker with a Bun backend, Neon Postgres database, and MCP server for AI agent access. The React SPA visualizes blood test / lab results over time using Recharts, fetching data from an authenticated API.

## Quick Start

```bash
bun install
bun run dev        # starts API server + Vite frontend
```

Open http://localhost:5173

## MCP Tools

The MCP server at `http://localhost:3000/mcp` exposes 25 tools for managing profiles, biomarkers, results, and analytics. All endpoints require JWT authentication.

### Claude Code Integration

Add to `~/.claude.json` under `mcpServers`:

```json
{
  "openmarkers": {
    "type": "http",
    "url": "http://localhost:3000/mcp"
  }
}
```

### Importing Lab Reports

Upload a PDF or paste lab results text into Claude Code. Claude will:
1. Call `get_schema` to learn all biomarker IDs and categories
2. Map your lab test names to biomarker IDs
3. Use `add_result` or `import_profile_data` to store the data
