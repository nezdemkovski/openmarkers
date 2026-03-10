# OpenMarkers

Open-source biomarker tracker with a Bun backend, Neon Postgres database, and MCP server for AI agent access. The React SPA visualizes blood test / lab results over time using Recharts, fetching data from an authenticated API.

## Quick Start

```bash
bun install
bun run dev        # starts API server + Vite frontend
```

Open http://localhost:5173

### Environment Setup

Copy the example env files and fill in your Neon credentials:

```bash
cp .env.example .env                          # for drizzle-kit commands
cp packages/web/.env.example packages/web/.env # for API server + frontend
```

Required variables in `packages/web/.env`:
- `DATABASE_URL` — Neon Postgres connection string
- `NEON_AUTH_BASE_URL` — Neon Auth service URL (server-side)
- `VITE_NEON_AUTH_URL` — Neon Auth service URL (client-side)

Push the schema to your database:

```bash
bun run db:push
```

## Architecture

Monorepo with three packages:

- **`packages/db`** — Drizzle ORM schema, CRUD functions, analytics, bio age, i18n (en/cs/ru/is)
- **`packages/mcp-server`** — 25 MCP tools wrapping db functions
- **`packages/web`** — React SPA + Bun HTTP server (API routes + static files)

Auth is handled by [Neon Auth](https://neon.tech/docs/guides/neon-auth) — no auth server code on our side. JWTs are verified against Neon's JWKS endpoint.

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

## Self-Hosting with Docker

OpenMarkers can be self-hosted using Docker. The app runs in a single container — you just need a [Neon](https://neon.tech) account (free tier works) for Postgres and authentication.

### Prerequisites

1. [Docker](https://docs.docker.com/get-docker/) installed
2. A Neon project with [Neon Auth](https://neon.tech/docs/guides/neon-auth) enabled — this gives you all three required env vars

### Setup

1. Clone the repo and create a `.env` file:

```bash
git clone https://github.com/nezdemkovski/openmarkers.git
cd openmarkers
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth
```

3. Push the database schema:

```bash
bun run db:push
```

4. Start the app:

```bash
docker compose up -d
```

The app will be available at `http://localhost:3000`.

### Updating

```bash
git pull
docker compose up -d --build
```

## Deployment on Fly.io

Production deployment uses Docker on Fly.io:

```bash
fly deploy
```

The `Dockerfile` runs a multi-stage Alpine build. The `fly.toml` configures a single shared-cpu instance in the `fra` region.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server + API server (Turborepo) |
| `bun run build` | Production build (outputs to `packages/web/dist/`) |
| `bun run format` | Format all packages with Prettier |
| `bun run db:push` | Push Drizzle schema to Neon Postgres |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run Drizzle migrations |
| `bun run db:studio` | Open Drizzle Studio |
