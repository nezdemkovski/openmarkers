# OpenMarkers

Open-source biomarker tracker with a Bun backend, Postgres database, and MCP server for AI agent access. The React SPA visualizes blood test / lab results over time using Recharts, fetching data from an authenticated API.

## Quick Start

```bash
bun install
bun run dev        # starts API server + Vite frontend
```

Open http://localhost:5173

### Environment Setup

Copy the example env files and fill in your database and auth credentials:

```bash
cp .env.example .env                          # for drizzle-kit commands
cp packages/web/.env.example packages/web/.env # for API server + frontend
```

Required variables in `packages/web/.env`:
- `DATABASE_URL` — Postgres connection string
- `AUTH_BASE_URL` — Better Auth project endpoint, for example `https://auth.nezdemkovski.cloud/openmarkers/api/auth`
- `AUTH_JWKS_URL` — Better Auth JWKS endpoint
- `AUTH_JWT_ISSUER` — expected JWT issuer
- `AUTH_JWT_AUDIENCE` — expected JWT audience
- `VITE_AUTH_BASE_URL` — client-side Better Auth endpoint

Push the schema to your database:

```bash
bun run db:push
```

## Architecture

Monorepo with three packages:

- **`packages/db`** — Drizzle ORM schema, CRUD functions, analytics, bio age, i18n (en/cs/ru/is)
- **`packages/mcp-server`** — 25 MCP tools wrapping db functions
- **`packages/web`** — React SPA + Bun HTTP server (API routes + static files)

Auth is handled by a Better Auth project endpoint. JWTs are verified against the configured JWKS endpoint.

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

## Deployment

Production deployment uses Docker images and the Helm chart in
`charts/openmarkers`:

```bash
docker build \
  --build-arg VITE_AUTH_BASE_URL=https://auth.nezdemkovski.cloud/openmarkers/api/auth \
  -t ghcr.io/nezdemkovski/openmarkers:1.0.0 .

helm lint charts/openmarkers
helm template openmarkers charts/openmarkers --namespace openmarkers
```

The `Dockerfile` runs a multi-stage Alpine build. Kubernetes runtime settings
are owned by the Helm chart.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server + API server (Turborepo) |
| `bun run build` | Production build (outputs to `packages/web/dist/`) |
| `bun run format` | Format all packages with Prettier |
| `bun run db:push` | Push Drizzle schema to Postgres |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run Drizzle migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Helm Chart

The Kubernetes chart lives in `charts/openmarkers` and was scaffolded with
`helm create`.

```bash
helm lint charts/openmarkers
helm template openmarkers charts/openmarkers --namespace openmarkers
```

The chart expects a secret named `openmarkers-env` by default with:

- `DATABASE_URL`
- `OAUTH_SECRET`

The browser auth endpoint is compiled into the frontend at image build time, so
build images with:

```bash
docker build \
  --build-arg VITE_AUTH_BASE_URL=https://auth.nezdemkovski.cloud/openmarkers/api/auth \
  -t ghcr.io/nezdemkovski/openmarkers:1.0.0 .
```

On push to `master`, `.github/workflows/publish-helm-chart.yml` publishes the
chart to:

```text
oci://ghcr.io/nezdemkovski/charts/openmarkers
```
