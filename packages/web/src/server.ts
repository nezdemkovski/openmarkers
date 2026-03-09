import {
  listProfiles,
  getProfileData,
  createProfile,
  updateProfile,
  deleteProfile,
  reorderProfiles,
  listCategories,
  listBiomarkers,
  createBiomarker,
  updateBiomarker,
  addResult,
  updateResult,
  deleteResult,
  getProfileResults,
  importProfileData,
  exportProfileData,
  batchAddResults,
  findProfileByName,
  getTimelineForProfile,
  getSnapshotForProfile,
  getTrendsForProfile,
  getDaysSinceForProfile,
  compareDatesForProfile,
  getCorrelationsForProfile,
  getBiologicalAgeForProfile,
  getAnalysisPromptForProfile,
  verifyToken,
  importDataSchema,
  sexEnum,
  biomarkerTypeEnum,
} from "@openmarkers/db";
import { isLang, errorMessage } from "@openmarkers/db";

import { createMcpHandler } from "@openmarkers/mcp-server";
import { handleASMetadata, handleRSMetadata, handleRegister, handleAuthorize, handleToken, handleOAuthPreflight } from "./oauth.ts";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { z } from "zod";

// --- Validation schemas ---

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB

const dateString = z.union([z.string().date(), z.literal("")]);

const profileCreateSchema = z.object({
  name: z.string().min(1).max(200),
  date_of_birth: dateString,
  sex: sexEnum,
});

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  date_of_birth: dateString.optional(),
  sex: sexEnum.optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field is required");

const resultCreateSchema = z.object({
  profile_id: z.number().int().positive(),
  biomarker_id: z.string().min(1).max(200),
  date: z.string().date(),
  value: z.union([z.number(), z.string().min(1).max(200)]),
});

const resultUpdateSchema = z.object({
  date: z.string().date().optional(),
  value: z.union([z.number(), z.string().min(1).max(200)]).optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field is required");

const biomarkerCreateSchema = z.object({
  id: z.string().min(1).max(200).regex(/^[a-z0-9_]+$/, "Must be lowercase alphanumeric with underscores"),
  category_id: z.string().min(1).max(200),
  unit: z.string().max(50).nullish(),
  ref_min: z.number().nullish(),
  ref_max: z.number().nullish(),
  type: biomarkerTypeEnum.optional(),
});

const biomarkerUpdateSchema = z.object({
  unit: z.string().max(50).nullable().optional(),
  ref_min: z.number().nullable().optional(),
  ref_max: z.number().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field is required");

const batchResultsSchema = z.object({
  profile_id: z.number().int().positive(),
  date: z.string().date(),
  entries: z.array(z.object({
    biomarker_id: z.string().min(1).max(200),
    value: z.union([z.number(), z.string().min(1).max(200)]),
  })).min(1).max(500),
});

const reorderSchema = z.object({
  profileIds: z.array(z.number().int().positive()).min(1).max(100),
});

async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T | Response> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return error("Request body too large", 413);
  }
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
      return error(`Validation error: ${messages.join("; ")}`, 400);
    }
    return result.data;
  } catch {
    return error("Invalid JSON", 400);
  }
}

function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  ...(process.env.NODE_ENV === "production"
    ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
    : {}),
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      ...SECURITY_HEADERS,
    },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function requireAuth(
  req: Request,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const result = await verifyToken(authHeader.slice(7));
    if (result) return { userId: result.userId };
  }
  return error("Unauthorized", 401);
}

function authResult(
  result: { userId: string } | Response,
): result is { userId: string } {
  return "userId" in result;
}

export function startWebServer(opts: {
  port: number;
  publicDir?: string;
  mcpHandler?: (req: Request, authUserId: string) => Promise<Response>;
}) {
  const { port, mcpHandler } = opts;
  const publicDir = opts.publicDir ?? join(import.meta.dir, "..", "dist");
  const resolvedPublicDir = resolve(publicDir);
  const hasFrontend = existsSync(join(resolvedPublicDir, "index.html"));

  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;
      const start = Date.now();

      try {
        const res = await handleRequest(req, url, path, method);
        const ms = Date.now() - start;
        // Log errors and slow requests (>3s)
        if (res.status >= 400) {
          console.warn(`${method} ${path} ${res.status} ${ms}ms`);
        } else if (ms > 3000) {
          console.warn(`${method} ${path} ${res.status} ${ms}ms (slow)`);
        }
        return res;
      } catch (e) {
        console.error(`${method} ${path} 500 ${Date.now() - start}ms`, e);
        return error("Internal server error", 500);
      }
    },
  });

  async function handleRequest(req: Request, url: URL, path: string, method: string): Promise<Response> {
      // --- OAuth 2.1 endpoints (no auth required) ---

      // OAuth metadata discovery
      if (method === "GET" && path === "/.well-known/oauth-authorization-server")
        return handleASMetadata(req);
      if (method === "GET" && (path === "/.well-known/oauth-protected-resource/mcp" || path === "/.well-known/oauth-protected-resource"))
        return handleRSMetadata(req);

      // Dynamic client registration (OAuth 2.1 spec — unauthenticated per RFC 7591)
      if (path === "/register") {
        if (method === "OPTIONS") return handleOAuthPreflight();
        if (method === "POST") return handleRegister(req);
      }

      // Authorization endpoint (login page)
      if (path === "/authorize" && (method === "GET" || method === "POST"))
        return handleAuthorize(req);

      // Token endpoint
      if (path === "/token") {
        if (method === "OPTIONS") return handleOAuthPreflight();
        if (method === "POST") return handleToken(req);
      }

      // GET /schema.json — public, no auth (biomarker metadata only)
      if (method === "GET" && path === "/schema.json") {
        const schemaPath = join(import.meta.dir, "..", "..", "..", "data", "schema.json");
        const file = Bun.file(schemaPath);
        if (await file.exists()) {
          return new Response(file, {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
        return error("Schema not found", 404);
      }

      // CORS preflight
      if (method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            ...SECURITY_HEADERS,
          },
        });
      }

      // MCP endpoint — requires auth (with OAuth discovery headers)
      if (path === "/mcp" && mcpHandler) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) {
          const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
          const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
          const baseUrl = `${proto}://${host}`;
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "WWW-Authenticate": `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
            },
          });
        }
        return mcpHandler(req, auth.userId);
      }

      // --- API Routes (all require auth) ---

      // GET /api/profiles
      if (method === "GET" && path === "/api/profiles") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        return json(await listProfiles(auth.userId));
      }

      // GET /api/profiles/:id/export
      const exportMatch = path.match(/^\/api\/profiles\/(\d+)\/export$/);
      if (method === "GET" && exportMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const data = await exportProfileData(
          Number(exportMatch[1]),
          auth.userId,
        );
        if (!data) return error("Profile not found", 404);
        return json(data);
      }

      // GET /api/profiles/:id/timeline
      const timelineMatch = path.match(/^\/api\/profiles\/(\d+)\/timeline$/);
      if (method === "GET" && timelineMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const result = await getTimelineForProfile(
          Number(timelineMatch[1]),
          auth.userId,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/snapshot?date=
      const snapshotMatch = path.match(/^\/api\/profiles\/(\d+)\/snapshot$/);
      if (method === "GET" && snapshotMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const date = url.searchParams.get("date");
        if (!date) return error("date is required");
        const result = await getSnapshotForProfile(
          Number(snapshotMatch[1]),
          auth.userId,
          date,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/trends?biomarker_id=&category_id=
      const trendsMatch = path.match(/^\/api\/profiles\/(\d+)\/trends$/);
      if (method === "GET" && trendsMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const opts = {
          biomarker_id: url.searchParams.get("biomarker_id") ?? undefined,
          category_id: url.searchParams.get("category_id") ?? undefined,
        };
        const result = await getTrendsForProfile(
          Number(trendsMatch[1]),
          auth.userId,
          opts,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/days-since
      const daysSinceMatch = path.match(
        /^\/api\/profiles\/(\d+)\/days-since$/,
      );
      if (method === "GET" && daysSinceMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const result = await getDaysSinceForProfile(
          Number(daysSinceMatch[1]),
          auth.userId,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/compare?date1=&date2=
      const compareMatch = path.match(/^\/api\/profiles\/(\d+)\/compare$/);
      if (method === "GET" && compareMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const date1 = url.searchParams.get("date1");
        const date2 = url.searchParams.get("date2");
        if (!date1 || !date2) return error("date1 and date2 are required");
        const result = await compareDatesForProfile(
          Number(compareMatch[1]),
          auth.userId,
          date1,
          date2,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/correlations
      const correlationsMatch = path.match(
        /^\/api\/profiles\/(\d+)\/correlations$/,
      );
      if (method === "GET" && correlationsMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const result = await getCorrelationsForProfile(
          Number(correlationsMatch[1]),
          auth.userId,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/biological-age
      const bioAgeMatch = path.match(
        /^\/api\/profiles\/(\d+)\/biological-age$/,
      );
      if (method === "GET" && bioAgeMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const result = await getBiologicalAgeForProfile(
          Number(bioAgeMatch[1]),
          auth.userId,
        );
        if (!result) return error("Profile not found", 404);
        return json(result);
      }

      // GET /api/profiles/:id/analysis-prompt?lang=
      const promptMatch = path.match(
        /^\/api\/profiles\/(\d+)\/analysis-prompt$/,
      );
      if (method === "GET" && promptMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const langParam = url.searchParams.get("lang");
        const lang = isLang(langParam) ? langParam : "en";
        const result = await getAnalysisPromptForProfile(
          Number(promptMatch[1]),
          auth.userId,
          lang,
        );
        if (!result) return error("Profile not found", 404);
        return json({ prompt: result });
      }

      // GET /api/profiles/:id
      const profileMatch = path.match(/^\/api\/profiles\/(\d+)$/);
      if (method === "GET" && profileMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const data = await getProfileData(
          Number(profileMatch[1]),
          auth.userId,
        );
        if (!data) return error("Profile not found", 404);
        return json(data);
      }

      // POST /api/profiles
      if (method === "POST" && path === "/api/profiles") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, profileCreateSchema);
        if (isResponse(body)) return body;
        const profile = await createProfile(auth.userId, body);
        return json(profile, 201);
      }

      // PATCH /api/profiles/:id
      if (method === "PATCH" && profileMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, profileUpdateSchema);
        if (isResponse(body)) return body;
        const profile = await updateProfile(
          Number(profileMatch[1]),
          auth.userId,
          body,
        );
        if (!profile) return error("Profile not found", 404);
        return json(profile);
      }

      // PUT /api/profiles/reorder
      if (method === "PUT" && path === "/api/profiles/reorder") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, reorderSchema);
        if (isResponse(body)) return body;
        await reorderProfiles(auth.userId, body.profileIds);
        return json({ ok: true });
      }

      // DELETE /api/profiles/:id
      if (method === "DELETE" && profileMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const deleted = await deleteProfile(
          Number(profileMatch[1]),
          auth.userId,
        );
        if (!deleted) return error("Profile not found", 404);
        return json({ ok: true });
      }

      // GET /api/categories
      if (method === "GET" && path === "/api/categories") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        return json(await listCategories());
      }

      // GET /api/biomarkers
      if (method === "GET" && path === "/api/biomarkers") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const categoryId = url.searchParams.get("category_id") ?? undefined;
        return json(await listBiomarkers(categoryId));
      }

      // POST /api/biomarkers
      if (method === "POST" && path === "/api/biomarkers") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, biomarkerCreateSchema);
        if (isResponse(body)) return body;
        const biomarker = await createBiomarker(body);
        return json(biomarker, 201);
      }

      // PATCH /api/biomarkers/:id
      const biomarkerMatch = path.match(/^\/api\/biomarkers\/([^/]+)$/);
      if (method === "PATCH" && biomarkerMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, biomarkerUpdateSchema);
        if (isResponse(body)) return body;
        const biomarker = await updateBiomarker(biomarkerMatch[1], body);
        if (!biomarker) return error("Biomarker not found", 404);
        return json(biomarker);
      }

      // GET /api/results?profile_id=&category_id=&biomarker_id=&date_from=&date_to=
      if (method === "GET" && path === "/api/results") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const profileId = url.searchParams.get("profile_id");
        if (!profileId) return error("profile_id is required");
        const filters = {
          category_id: url.searchParams.get("category_id") ?? undefined,
          biomarker_id: url.searchParams.get("biomarker_id") ?? undefined,
          date_from: url.searchParams.get("date_from") ?? undefined,
          date_to: url.searchParams.get("date_to") ?? undefined,
        };
        return json(
          await getProfileResults(auth.userId, Number(profileId), filters),
        );
      }

      // POST /api/batch-results
      if (method === "POST" && path === "/api/batch-results") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, batchResultsSchema);
        if (isResponse(body)) return body;
        try {
          const result = await batchAddResults(auth.userId, body);
          return json(result, 201);
        } catch (e: unknown) {
          return error(errorMessage(e) || "Failed to add results", 403);
        }
      }

      // POST /api/results
      if (method === "POST" && path === "/api/results") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, resultCreateSchema);
        if (isResponse(body)) return body;
        try {
          const result = await addResult(auth.userId, body);
          return json(result, 201);
        } catch (e: unknown) {
          return error(
            errorMessage(e) || "Failed to add result",
            403,
          );
        }
      }

      // PATCH /api/results/:id
      const resultMatch = path.match(/^\/api\/results\/(\d+)$/);
      if (method === "PATCH" && resultMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, resultUpdateSchema);
        if (isResponse(body)) return body;
        const result = await updateResult(
          auth.userId,
          Number(resultMatch[1]),
          body,
        );
        if (!result) return error("Result not found", 404);
        return json(result);
      }

      // DELETE /api/results/:id
      if (method === "DELETE" && resultMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const deleted = await deleteResult(
          auth.userId,
          Number(resultMatch[1]),
        );
        if (!deleted) return error("Result not found", 404);
        return json({ ok: true });
      }

      // DELETE /api/account — delete all profiles for the auth user
      if (method === "DELETE" && path === "/api/account") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const userProfiles = await listProfiles(auth.userId);
        for (const p of userProfiles) {
          await deleteProfile(p.id, auth.userId);
        }
        return json({ ok: true });
      }

      // POST /api/import/check — check if profile name already exists
      if (method === "POST" && path === "/api/import/check") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, z.object({ user: z.object({ name: z.string().min(1).max(200) }) }));
        if (isResponse(body)) return body;
        const name = body.user.name;
        const existing = await findProfileByName(auth.userId, name);
        return json({
          exists: !!existing,
          user: existing
            ? { id: existing.id, name: existing.name }
            : null,
        });
      }

      // POST /api/import
      if (method === "POST" && path === "/api/import") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await parseBody(req, importDataSchema);
        if (isResponse(body)) return body;
        const profileId = await importProfileData(auth.userId, body);
        return json({ ok: true, profile_id: profileId }, 201);
      }

      // --- Static file serving (production) ---
      if (hasFrontend) {
        const filePath = resolve(
          resolvedPublicDir,
          path === "/" ? "index.html" : path.slice(1),
        );
        // Prevent path traversal — ensure resolved path stays within publicDir
        if (!filePath.startsWith(resolvedPublicDir)) {
          return error("Forbidden", 403);
        }
        const file = Bun.file(filePath);
        if (await file.exists()) return new Response(file, { headers: SECURITY_HEADERS });
        // SPA fallback
        return new Response(Bun.file(join(resolvedPublicDir, "index.html")), { headers: SECURITY_HEADERS });
      }

      return error("Not found", 404);
  }
}

// Auto-start when run directly
if (import.meta.main) {
  const port = Number(process.env.PORT) || 3000;
  startWebServer({
    port,
    mcpHandler: createMcpHandler(),
  });
  console.log(`OpenMarkers API running on http://localhost:${port}`);
}
