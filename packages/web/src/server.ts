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
} from "@openmarkers/db";
import type { Lang } from "@openmarkers/db";
import { createMcpHandler } from "@openmarkers/mcp-server";
import { join } from "node:path";
import { existsSync } from "node:fs";

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
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
  const hasFrontend = existsSync(join(publicDir, "index.html"));

  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      // CORS preflight
      if (method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      // MCP endpoint — requires auth
      if (path === "/mcp" && mcpHandler) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
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
        const lang = (url.searchParams.get("lang") as Lang) || "en";
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
        const body = await req.json();
        const profile = await createProfile(auth.userId, body);
        return json(profile, 201);
      }

      // PATCH /api/profiles/:id
      if (method === "PATCH" && profileMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await req.json();
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
        const body = await req.json();
        if (!Array.isArray(body?.profileIds)) return error("profileIds array is required");
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
        const body = await req.json();
        const biomarker = await createBiomarker(body);
        return json(biomarker, 201);
      }

      // PATCH /api/biomarkers/:id
      const biomarkerMatch = path.match(/^\/api\/biomarkers\/([^/]+)$/);
      if (method === "PATCH" && biomarkerMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await req.json();
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

      // POST /api/results
      if (method === "POST" && path === "/api/results") {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await req.json();
        try {
          const result = await addResult(auth.userId, body);
          return json(result, 201);
        } catch (e: unknown) {
          return error(
            (e as Error).message || "Failed to add result",
            403,
          );
        }
      }

      // PATCH /api/results/:id
      const resultMatch = path.match(/^\/api\/results\/(\d+)$/);
      if (method === "PATCH" && resultMatch) {
        const auth = await requireAuth(req);
        if (!authResult(auth)) return auth;
        const body = await req.json();
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
        const body = await req.json();
        const name = body?.user?.name;
        if (!name) return error("Missing user.name");
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
        const body = await req.json();
        const profileId = await importProfileData(auth.userId, body);
        return json({ ok: true, profile_id: profileId }, 201);
      }

      // --- Static file serving (production) ---
      if (hasFrontend) {
        const filePath = join(
          publicDir,
          path === "/" ? "index.html" : path,
        );
        const file = Bun.file(filePath);
        if (await file.exists()) return new Response(file);
        // SPA fallback
        return new Response(Bun.file(join(publicDir, "index.html")));
      }

      return error("Not found", 404);
    },
  });
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
