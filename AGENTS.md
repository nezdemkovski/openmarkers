# AGENTS.md

This file provides guidance for any coding assistant working with this
repository.

## Project Overview

OpenMarkers is an open-source biomarker tracker with a Bun backend,
Postgres database (via Drizzle ORM + `bun:sql`), Better Auth for
authentication, and an MCP server for programmatic access. The React
SPA visualizes blood test / lab results over time using Recharts,
fetching data from an authenticated API.

## Commands

- `bun run dev` — Start Vite dev server + API server via Turborepo (parallel)
- `bun run build` — Production build via Turborepo (cached, outputs to `packages/web/dist/`)
- `bun run format` — Format all packages via Turborepo
- `bun run db:push` — Push Drizzle schema to Postgres
- `bun run db:generate` — Generate Drizzle migrations
- `bun run db:migrate` — Run Drizzle migrations
- `bun run db:studio` — Open Drizzle Studio
- `helm lint charts/openmarkers` — Validate the OpenMarkers Helm chart
- `helm template openmarkers charts/openmarkers --namespace openmarkers` — Render the chart locally
- `.github/workflows/publish-helm-chart.yml` — Publishes the chart to GHCR on `master`

Package manager is **bun**. Build system is **Turborepo** (`turbo.json`). Tests run with `bun test packages/db/src/`.

## Environment Variables

Per-package `.env` files (not at root — Turborepo best practice):

**`packages/web/.env`** — used by API server and Vite dev server:
- `DATABASE_URL` — Postgres connection string
- `AUTH_BASE_URL` — Better Auth project endpoint
- `AUTH_JWKS_URL` — Better Auth JWKS endpoint
- `AUTH_JWT_ISSUER` — expected JWT issuer
- `AUTH_JWT_AUDIENCE` — expected JWT audience, comma-separated when both browser session JWTs and OAuth access JWTs are accepted. Production includes `openmarkers`, `https://auth.nezdemkovski.cloud/api/openmarkers`, and `https://openmarkers.app/mcp`.
- `VITE_AUTH_BASE_URL` — Better Auth project endpoint for the browser

**`.env`** (root) — used only by drizzle-kit commands:
- `DATABASE_URL` — Postgres connection string

## Architecture

Monorepo with bun workspaces + Turborepo. Three packages:

```
Dockerfile                          — Multi-stage Alpine build for production
turbo.json                          — Turborepo task config (build, dev, dev:api, format)
drizzle.config.ts                   — Drizzle Kit config (schema + DB URL)
.env.example                        — Root env template (DATABASE_URL for drizzle-kit)
charts/openmarkers/                 — Helm chart scaffolded with helm create
.github/workflows/publish-helm-chart.yml — Publishes the Helm chart to GHCR
data/
├── schema.json                     — JSON schema for lab data import format
└── demo.json                       — Demo data for "Try Demo" feature
packages/
├── db/                             — Postgres database + business logic (@openmarkers/db)
│   └── src/
│       ├── schema/app.ts           — Drizzle schema (profiles, categories, biomarkers, results, user_preferences)
│       ├── db.ts                   — Drizzle + bun:sql connection singleton
│       ├── auth.ts                 — JWT validation via jose + configured Better Auth JWKS
│       ├── index.ts                — Async CRUD functions with authUserId scoping, re-exports, enrichUserData
│       ├── types.ts                — All shared type interfaces (DB + computed data) + UnitSystem enum
│       ├── seed.ts                 — Import from JSON files (requires authUserId)
│       ├── analytics.ts            — isOutOfRange, analyzeTrend, correlations, snapshots, comparisons
│       ├── bioage.ts               — calculatePhenoAge, chronoAge (Levine 2018)
│       ├── units.ts                — Unit conversion (SI ↔ Conventional), convert, convertRange, getDisplayUnit
│       ├── enrich.ts               — enrichUserData (pure function, adds trends/outOfRange/daysSince/correlations/bioAge)
│       ├── promptBuilder.ts        — buildPrompt (AI analysis prompt generation)
│       ├── services.ts             — Profile-level service functions (getTrendsForProfile, etc.)
│       ├── validation.ts           — Zod schemas for import/API validation
│       ├── i18n.ts                 — makeI18n, LANGS
│       └── i18n/                   — Translations (en/cs/ru/is)
├── mcp-server/                     — MCP tool definitions (@openmarkers/mcp-server)
│   └── src/
│       ├── index.ts                — createMcpServer(authUserId), createMcpHandler()
│       └── tools/                  — One file per tool (25 tools, all thin wrappers with authUserId)
└── web/                            — Frontend + HTTP server (@openmarkers/web)
    ├── index.html
    ├── vite.config.ts              — Dev proxy /api → :3000
    └── src/
        ├── server.ts               — Bun.serve: auth middleware + API routes + MCP + static files
        ├── lib/api.ts              — Frontend fetch wrapper with JWT auth headers
        ├── lib/auth-client.ts      — Better Auth client (createAuthClient from better-auth/react)
        ├── App.tsx                 — Root: auth gate → AuthPage or main app
        ├── components/AuthPage.tsx  — Login/signup form with "Try Demo" button
        ├── types.ts                — Re-exports from @openmarkers/db + presentation types
        ├── i18n.ts                 — Re-exports from @openmarkers/db/src/i18n
        ├── i18n/                   — Re-exports from @openmarkers/db/src/i18n/*
        └── components/             — React components (pure display, fetch via API)
```

DB: Postgres (configured via `DATABASE_URL`)
Server port: `3000`

### Database Tables (Postgres via Drizzle)

Application tables:
- **profiles** — id (serial PK), auth_user_id (Better Auth user id), name, date_of_birth, sex, display_order, UNIQUE(auth_user_id, name)
- **categories** — id (text PK), display_order
- **biomarkers** — id (text PK), category_id, unit, ref_min, ref_max, type, molecular_weight, conventional_unit, display_order
- **results** — id (serial PK), profile_id (FK), biomarker_id, date, value, ref_min, ref_max, unit, UNIQUE(profile_id, biomarker_id, date)
- **user_preferences** — auth_user_id (PK, Better Auth user id), unit_system (si/conventional)

### Auth Flow

Better Auth is provided by the shared homelab auth service. It manages users,
passwords, and sessions per project. Security is based on asymmetric JWT
verification (RS256).

**Full flow:**
1. **Sign-up/Sign-in**: Frontend calls `authClient.signUp()`/`signIn()` → hits the configured Better Auth project endpoint (`VITE_AUTH_BASE_URL`). Better Auth validates credentials and sets a session cookie
2. **Getting a JWT**: Before every API call, `getAuthToken()` requests a short-lived JWT from Better Auth using the session cookie
3. **API calls**: Frontend sends `Authorization: Bearer <jwt>` header with every `/api/*` request (set up in `lib/api.ts`)
4. **Backend verification**: `server.ts` extracts the Bearer token → `verifyToken()` (`packages/db/src/auth.ts`) verifies JWT signature against Better Auth's public keys (JWKS from `AUTH_JWKS_URL`) using `jose` library → extracts `sub` (userId) → passes it to all DB functions for ownership scoping

**Key files:**
- `packages/web/src/lib/auth-client.ts` — Better Auth client (`createAuthClient`) + JWT helper
- `packages/web/src/lib/api.ts` — Attaches JWT to every fetch
- `packages/db/src/auth.ts` — `verifyToken()` via JWKS
- `packages/web/src/server.ts` — Auth middleware extracting Bearer token

**Other auth contexts:**
- **MCP**: OpenMarkers is the OAuth protected resource server. It advertises `/.well-known/oauth-protected-resource` and delegates authorization to the shared auth realm from `AUTH_JWT_ISSUER`. Remote clients should connect to `https://openmarkers.app/mcp`; local clients can use `http://localhost:3000/mcp`. Bearer tokens are extracted and validated through `verifyToken()`, then `authUserId` is passed to all tool registrations. The auth realm must allow the MCP resource URL as a valid OAuth audience/resource.
- **Demo mode**: Client-side only, loads `demo.json` without auth

### API Routes

All routes require `Authorization: Bearer <jwt>` (except static files).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profiles` | List profiles for auth user |
| GET | `/api/profiles/:id` | Full ProfileData (categories → biomarkers → results) |
| POST | `/api/profiles` | Create profile |
| PATCH | `/api/profiles/:id` | Update profile |
| DELETE | `/api/profiles/:id` | Delete profile and all their data |
| PUT | `/api/profiles/reorder` | Reorder profiles (display_order) |
| GET | `/api/categories` | List category IDs |
| GET | `/api/biomarkers?category_id=` | List biomarker metadata |
| POST | `/api/biomarkers` | Create biomarker |
| PATCH | `/api/biomarkers/:id` | Update biomarker |
| GET | `/api/results?profile_id=&...` | Filtered results |
| POST | `/api/results` | Add result |
| PATCH | `/api/results/:id` | Update result |
| DELETE | `/api/results/:id` | Delete result |
| POST | `/api/import` | Bulk import (JSON format) |
| POST | `/api/import/check` | Check if profile name exists |
| GET | `/api/profiles/:id/export` | Export profile data |
| GET | `/api/profiles/:id/timeline` | All lab dates sorted chronologically |
| GET | `/api/profiles/:id/snapshot?date=` | All biomarker values for a specific date |
| GET | `/api/profiles/:id/trends?biomarker_id=&category_id=` | Trend analysis |
| GET | `/api/profiles/:id/days-since` | Days since last test per category |
| GET | `/api/profiles/:id/compare?date1=&date2=` | Side-by-side comparison |
| GET | `/api/profiles/:id/correlations` | Correlated biomarker panels |
| GET | `/api/profiles/:id/biological-age` | PhenoAge biological age |
| GET | `/api/profiles/:id/analysis-prompt?lang=` | AI analysis prompt |
| DELETE | `/api/account` | Delete all user profiles and data |
| GET | `/api/preferences` | Get user preferences (unit system) |
| PUT | `/api/preferences` | Update user preferences |
| POST | `/mcp` | MCP endpoint (requires Bearer JWT) |

### Data Model

- **auth user** — managed by Better Auth (email + password)
- **profile** — `name`, `dateOfBirth`, `sex` (M/F) — one auth user can have multiple profiles
- **categories[]** — Groups of biomarkers (e.g., "basic_biochemistry", "hematology")
  - **biomarkers[]** — Individual tests with `id`, `unit`, `refMin`/`refMax`, `type` (quantitative or qualitative)
    - **results[]** — `{ date, value, refMin?, refMax?, unit? }` entries (numeric for quantitative, string for qualitative). Per-result ref ranges and unit from the lab report.
- Reference range hierarchy: per-result → global (`biomarkers`)
- Unit conversion: stored values are in original lab units. Display unit determined by user's `unit_system` preference (SI or Conventional). Conversion uses `molecular_weight` (for mass↔molar) and `conventional_unit` (per biomarker) fields.
- All display names and descriptions live in `packages/db/src/i18n/*.ts`, keyed by biomarker/category ID

### Key Patterns

- **Auth**: Better Auth (managed service) — no auth server code on our side. Client SDK handles sign-in/up, JWT passed as Bearer token
- **DB**: All CRUD functions are async and take `authUserId: string` for ownership scoping
- **Routing**: Hash-based (`#/` and `#/category/:id`), managed in App.tsx via `hashchange` listener
- **i18n**: `makeI18n(lang)` returns `{ t, tCat, tBio }` helpers. Four languages: en, cs, ru, is. Lives in `packages/db/`, re-exported by web
- **Dark mode**: Class-based (`.dark` on `<html>`), persisted to localStorage
- **Charts**: Recharts `<LineChart>` with `<ReferenceArea>` for min/max range bands
- **MCP**: Stateless HTTP transport via `@modelcontextprotocol/sdk`, 25 tools with Bearer JWT auth. OAuth discovery is delegated to the shared auth realm; for Codex use `mcp-remote https://openmarkers.app/mcp`.
- **Service layer**: All business logic (analytics, bio age, prompt building, unit conversion) lives in `packages/db/src/`. Service functions in `services.ts` wrap `getProfileData()` + pure logic. API endpoints and MCP tools are thin wrappers
- **Dumb frontend**: All calculations happen server-side. Frontend only displays data from API responses. Demo mode uses `enrichUserData()` from `enrich.ts` (pure function, no DB). Never import from `analytics.ts`, `bioage.ts`, or `promptBuilder.ts` in frontend components.
- **Unit system**: Per-user preference (SI/Conventional) stored in `user_preferences` table. Conversion happens in `assembleProfileData()` on read. PhenoAge and AI prompt always use raw SI data via `getRawProfileData()`.
- **React Query**: All API calls use `@tanstack/react-query` for caching and deduplication
- **Tests**: `bun test packages/db/src/` runs unit tests for analytics, bioage, and unit conversion (84 tests). CI runs on every PR and push to master via `.github/workflows/test.yml`
- **Tailwind v4**: Uses `@custom-variant dark (&:where(.dark, .dark *))` for dark mode variant

### MCP Tools

The MCP server exposes 25 tools (requires `Authorization: Bearer <jwt>`).
Production clients connect to `https://openmarkers.app/mcp`; local development
uses `http://localhost:3000/mcp`. OAuth-capable clients should use the
protected-resource metadata and shared auth realm instead of manually creating
Bearer tokens.

| Tool | What it does |
|------|-------------|
| `list_profiles` | List all health profiles for the auth user |
| `get_profile` | Full profile data (categories, biomarkers, results) |
| `create_profile` | Add a new health profile |
| `update_profile` | Edit profile name/DOB/sex |
| `delete_profile` | Delete a profile and all its data |
| `list_categories` | All category IDs |
| `list_biomarkers` | Biomarker metadata, optionally by category |
| `get_biomarker` | Single biomarker details |
| `create_biomarker` | Add a new biomarker definition |
| `update_biomarker` | Edit unit/ref ranges |
| `add_result` | Add a lab result |
| `update_result` | Edit a result's date/value |
| `delete_result` | Remove a result |
| `get_profile_results` | Filtered results (by category, biomarker, date range) |
| `import_profile_data` | Bulk import from the JSON format |
| `export_profile_data` | Export profile data (JSON schema-compliant) |
| `get_schema` | Full JSON schema with all biomarker IDs, units, ref ranges |
| `get_timeline` | All lab test dates for a profile |
| `get_date_snapshot` | All biomarker values on a specific date |
| `get_trends` | Trend analysis (direction, rate, warnings, improving) |
| `get_days_since_last_test` | Days since last test per category |
| `compare_dates` | Side-by-side comparison of two lab dates |
| `get_correlations` | Correlated biomarker panels |
| `get_biological_age` | PhenoAge biological age calculation |
| `get_analysis_prompt` | AI analysis prompt with all data |

When adding a new biomarker: update the user JSON, add translations to all 4 i18n files (en/cs/ru/is) in `packages/db/src/i18n/`, add the ID to `data/schema.json`, and if it has a US conventional unit different from the SI unit, set `conventionalUnit` and `molecularWeight` (for mass↔molar conversions) in schema.json metadata.
