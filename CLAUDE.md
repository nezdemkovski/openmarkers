# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenMarkers is an open-source biomarker tracker with a Bun backend, Neon Postgres database (via Drizzle ORM + `bun:sql`), Neon Auth for authentication, and an MCP server for AI agent access. The React SPA visualizes blood test / lab results over time using Recharts, fetching data from an authenticated API.

## Commands

- `bun run dev` — Start Vite dev server + API server via Turborepo (parallel)
- `bun run build` — Production build via Turborepo (cached, outputs to `packages/web/dist/`)
- `bun run format` — Format all packages via Turborepo
- `bun run db:push` — Push Drizzle schema to Neon Postgres
- `bun run db:generate` — Generate Drizzle migrations
- `bun run db:migrate` — Run Drizzle migrations
- `bun run db:studio` — Open Drizzle Studio

Package manager is **bun**. Build system is **Turborepo** (`turbo.json`). No test framework is configured.

## Environment Variables

Per-package `.env` files (not at root — Turborepo best practice):

**`packages/web/.env`** — used by API server and Vite dev server:
- `DATABASE_URL` — Neon Postgres connection string
- `NEON_AUTH_BASE_URL` — Neon Auth service URL (server-side JWT validation)
- `VITE_NEON_AUTH_URL` — Neon Auth service URL (client-side auth SDK)

**`.env`** (root) — used only by drizzle-kit commands:
- `DATABASE_URL` — Neon Postgres connection string

## Architecture

Monorepo with bun workspaces + Turborepo. Three packages:

```
Dockerfile                          — Multi-stage Alpine build for production
fly.toml                            — Fly.io deployment config (fra region)
turbo.json                          — Turborepo task config (build, dev, dev:api, format)
drizzle.config.ts                   — Drizzle Kit config (schema + DB URL)
.env.example                        — Root env template (DATABASE_URL for drizzle-kit)
data/
├── schema.json                     — JSON schema for lab data import format
└── demo.json                       — Demo data for "Try Demo" feature
packages/
├── db/                             — Postgres database + business logic (@openmarkers/db)
│   └── src/
│       ├── schema/app.ts           — Drizzle schema (profiles, categories, biomarkers, results, profile_biomarkers)
│       ├── db.ts                   — Drizzle + bun:sql connection singleton
│       ├── auth.ts                 — JWT validation via jose + Neon Auth JWKS
│       ├── index.ts                — Async CRUD functions with authUserId scoping, re-exports
│       ├── types.ts                — All shared type interfaces (DB + computed data)
│       ├── seed.ts                 — Import from JSON files (requires authUserId)
│       ├── analytics.ts            — isOutOfRange, analyzeTrend, correlations, snapshots, comparisons
│       ├── bioage.ts               — calculatePhenoAge, chronoAge (Levine 2018)
│       ├── promptBuilder.ts        — buildPrompt (AI analysis prompt generation)
│       ├── services.ts             — Profile-level service functions (getTrendsForProfile, etc.)
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
        ├── lib/auth-client.ts      — Neon Auth client (createAuthClient from @neondatabase/neon-js)
        ├── App.tsx                 — Root: auth gate → AuthPage or main app
        ├── components/AuthPage.tsx  — Login/signup form with "Try Demo" button
        ├── types.ts                — Re-exports from @openmarkers/db + presentation types
        ├── i18n.ts                 — Re-exports from @openmarkers/db/src/i18n
        ├── i18n/                   — Re-exports from @openmarkers/db/src/i18n/*
        └── components/             — React components (pure display, fetch via API)
```

DB: Neon Postgres (configured via `DATABASE_URL`)
Server port: `3000`

### Database Tables (Postgres via Drizzle)

Auth tables (managed by Neon Auth in `neon_auth` schema):
- **neon_auth.user** — id, email, name (referenced as FK)

Application tables:
- **profiles** — id (serial PK), auth_user_id (FK → neon_auth.user.id), name, date_of_birth, sex, display_order, UNIQUE(auth_user_id, name)
- **categories** — id (text PK)
- **biomarkers** — id (text PK), category_id, unit, ref_min, ref_max, type
- **profile_biomarkers** — per-profile ref range overrides (profile_id, biomarker_id, unit, ref_min, ref_max)
- **results** — id (serial PK), profile_id (FK), biomarker_id, date, value, UNIQUE(profile_id, biomarker_id, date)

### Auth Flow

Neon Auth is a hosted auth service (built on Better Auth). No auth server code runs on our side — Neon manages users, passwords, and sessions. Security is based on asymmetric JWT verification (RS256).

**Full flow:**
1. **Sign-up/Sign-in**: Frontend calls `authClient.signUp()`/`signIn()` → hits Neon Auth servers directly (`VITE_NEON_AUTH_URL`). Neon Auth validates credentials, stores users in `neon_auth.user` table in our DB, sets a session cookie
2. **Getting a JWT**: Before every API call, `authClient.getSession()` sends the session cookie to Neon Auth → returns a short-lived JWT signed with Neon Auth's private key (`session.data.session.token`)
3. **API calls**: Frontend sends `Authorization: Bearer <jwt>` header with every `/api/*` request (set up in `lib/api.ts`)
4. **Backend verification**: `server.ts` extracts the Bearer token → `verifyToken()` (`packages/db/src/auth.ts`) verifies JWT signature against Neon Auth's public keys (JWKS from `NEON_AUTH_BASE_URL/.well-known/jwks.json`) using `jose` library → extracts `sub` (userId) → passes it to all DB functions for ownership scoping

**Key files:**
- `packages/web/src/lib/auth-client.ts` — Neon Auth client (`createAuthClient`)
- `packages/web/src/lib/api.ts` — Attaches JWT to every fetch
- `packages/db/src/auth.ts` — `verifyToken()` via JWKS
- `packages/web/src/server.ts` — Auth middleware extracting Bearer token

**Other auth contexts:**
- **MCP**: Same JWT auth — Bearer token extracted and validated, `authUserId` passed to all tool registrations
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
| POST | `/mcp` | MCP endpoint (requires Bearer JWT) |

### Data Model

- **auth user** — managed by Neon Auth (email + password)
- **profile** — `name`, `dateOfBirth`, `sex` (M/F) — one auth user can have multiple profiles
- **categories[]** — Groups of biomarkers (e.g., "basic_biochemistry", "hematology")
  - **biomarkers[]** — Individual tests with `id`, `unit`, `refMin`/`refMax`, `type` (quantitative or qualitative)
    - **results[]** — `{ date, value }` entries (numeric for quantitative, string for qualitative)
- Reference ranges are per-profile via `profile_biomarkers` table
- All display names and descriptions live in `packages/db/src/i18n/*.ts`, keyed by biomarker/category ID

### Key Patterns

- **Auth**: Neon Auth (managed service) — no auth server code on our side. Client SDK handles sign-in/up, JWT passed as Bearer token
- **DB**: All CRUD functions are async and take `authUserId: string` for ownership scoping
- **Routing**: Hash-based (`#/` and `#/category/:id`), managed in App.tsx via `hashchange` listener
- **i18n**: `makeI18n(lang)` returns `{ t, tCat, tBio }` helpers. Four languages: en, cs, ru, is. Lives in `packages/db/`, re-exported by web
- **Dark mode**: Class-based (`.dark` on `<html>`), persisted to localStorage
- **Charts**: Recharts `<LineChart>` with `<ReferenceArea>` for min/max range bands
- **MCP**: Stateless HTTP transport via `@modelcontextprotocol/sdk`, 25 tools with Bearer JWT auth
- **Service layer**: All business logic (analytics, bio age, prompt building) lives in `packages/db/src/`. Service functions in `services.ts` wrap `getProfileData()` + pure logic. API endpoints and MCP tools are thin wrappers
- **Tailwind v4**: Uses `@custom-variant dark (&:where(.dark, .dark *))` for dark mode variant

### MCP Tools

The MCP server at `http://localhost:3000/mcp` exposes 25 tools (requires `Authorization: Bearer <jwt>`):

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

When adding a new biomarker: update the user JSON, add translations to all 4 i18n files (en/cs/ru/is) in `packages/db/src/i18n/`, and add the ID to `data/schema.json`.
