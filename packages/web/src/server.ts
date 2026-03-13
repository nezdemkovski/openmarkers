import { verifyToken } from "@openmarkers/db";
import { createMcpHandler } from "@openmarkers/mcp-server";
import {
  handleASMetadata,
  handleRSMetadata,
  handleRegister,
  handleAuthorize,
  handleToken,
  handleOAuthPreflight,
} from "./oauth.ts";
import { json, error, ALLOWED_ORIGIN, SECURITY_HEADERS } from "./routes/_shared.ts";
import {
  handleListProfiles,
  handleGetProfile,
  handleCreateProfile,
  handleUpdateProfile,
  handleDeleteProfile,
  handleReorderProfiles,
  handleCheckHandle,
  handleExport,
  handleTimeline,
  handleSnapshot,
  handleTrends,
  handleDaysSince,
  handleCompare,
  handleCorrelations,
  handleBiologicalAge,
  handleAnalysisPrompt,
} from "./routes/profiles.ts";
import {
  handleListResults,
  handleAddResult,
  handleBatchResults,
  handleUpdateResult,
  handleDeleteResult,
} from "./routes/results.ts";
import { handleListCategories, handleListBiomarkers } from "./routes/biomarkers.ts";
import { handleImportCheck, handleImport } from "./routes/import.ts";
import { handleDeleteAccount } from "./routes/account.ts";
import { handleListPublicProfiles, handleGetPublicProfile } from "./routes/public.ts";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

const MAX_BODY_SIZE = 5 * 1024 * 1024;

async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const result = await verifyToken(authHeader.slice(7));
    if (result) return { userId: result.userId };
  }
  return error("Unauthorized", 401);
}

function authResult(result: { userId: string } | Response): result is { userId: string } {
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
    maxRequestBodySize: MAX_BODY_SIZE,
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;
      const start = Date.now();

      try {
        const res = await handleRequest(req, url, path, method);
        const ms = Date.now() - start;
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
    if (method === "GET" && path === "/.well-known/oauth-authorization-server") return handleASMetadata(req);
    if (
      method === "GET" &&
      (path === "/.well-known/oauth-protected-resource/mcp" || path === "/.well-known/oauth-protected-resource")
    )
      return handleRSMetadata(req);

    if (path === "/register") {
      if (method === "OPTIONS") return handleOAuthPreflight();
      if (method === "POST") return handleRegister(req);
    }

    if (path === "/authorize" && (method === "GET" || method === "POST")) return handleAuthorize(req);

    if (path === "/token") {
      if (method === "OPTIONS") return handleOAuthPreflight();
      if (method === "POST") return handleToken(req);
    }

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

    if (method === "GET" && path === "/api/public") return handleListPublicProfiles();

    const publicHandleMatch = path.match(/^\/api\/public\/([a-z0-9][a-z0-9-]*[a-z0-9]|[a-z0-9]{1,2})$/);
    if (method === "GET" && publicHandleMatch) return handleGetPublicProfile(publicHandleMatch[1]);

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

    if (method === "GET" && path === "/api/profiles") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleListProfiles(auth);
    }

    if (method === "GET" && path === "/api/handle-available") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleCheckHandle(url, auth);
    }

    const exportMatch = path.match(/^\/api\/profiles\/(\d+)\/export$/);
    if (method === "GET" && exportMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleExport(auth, Number(exportMatch[1]));
    }

    const timelineMatch = path.match(/^\/api\/profiles\/(\d+)\/timeline$/);
    if (method === "GET" && timelineMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleTimeline(auth, Number(timelineMatch[1]));
    }

    const snapshotMatch = path.match(/^\/api\/profiles\/(\d+)\/snapshot$/);
    if (method === "GET" && snapshotMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleSnapshot(url, auth, Number(snapshotMatch[1]));
    }

    const trendsMatch = path.match(/^\/api\/profiles\/(\d+)\/trends$/);
    if (method === "GET" && trendsMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleTrends(url, auth, Number(trendsMatch[1]));
    }

    const daysSinceMatch = path.match(/^\/api\/profiles\/(\d+)\/days-since$/);
    if (method === "GET" && daysSinceMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleDaysSince(auth, Number(daysSinceMatch[1]));
    }

    const compareMatch = path.match(/^\/api\/profiles\/(\d+)\/compare$/);
    if (method === "GET" && compareMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleCompare(url, auth, Number(compareMatch[1]));
    }

    const correlationsMatch = path.match(/^\/api\/profiles\/(\d+)\/correlations$/);
    if (method === "GET" && correlationsMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleCorrelations(auth, Number(correlationsMatch[1]));
    }

    const bioAgeMatch = path.match(/^\/api\/profiles\/(\d+)\/biological-age$/);
    if (method === "GET" && bioAgeMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleBiologicalAge(auth, Number(bioAgeMatch[1]));
    }

    const promptMatch = path.match(/^\/api\/profiles\/(\d+)\/analysis-prompt$/);
    if (method === "GET" && promptMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleAnalysisPrompt(url, auth, Number(promptMatch[1]));
    }

    const profileMatch = path.match(/^\/api\/profiles\/(\d+)$/);
    if (method === "GET" && profileMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleGetProfile(auth, Number(profileMatch[1]));
    }

    if (method === "POST" && path === "/api/profiles") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleCreateProfile(req, auth);
    }

    if (method === "PATCH" && profileMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleUpdateProfile(req, auth, Number(profileMatch[1]));
    }

    if (method === "PUT" && path === "/api/profiles/reorder") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleReorderProfiles(req, auth);
    }

    if (method === "DELETE" && profileMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleDeleteProfile(auth, Number(profileMatch[1]));
    }

    if (method === "GET" && path === "/api/categories") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleListCategories();
    }

    if (method === "GET" && path === "/api/biomarkers") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleListBiomarkers(url);
    }

    if (method === "GET" && path === "/api/results") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleListResults(url, auth);
    }

    if (method === "POST" && path === "/api/batch-results") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleBatchResults(req, auth);
    }

    if (method === "POST" && path === "/api/results") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleAddResult(req, auth);
    }

    const resultMatch = path.match(/^\/api\/results\/(\d+)$/);
    if (method === "PATCH" && resultMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleUpdateResult(req, auth, Number(resultMatch[1]));
    }

    if (method === "DELETE" && resultMatch) {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleDeleteResult(auth, Number(resultMatch[1]));
    }

    if (method === "DELETE" && path === "/api/account") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleDeleteAccount(auth);
    }

    if (method === "POST" && path === "/api/import/check") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleImportCheck(req, auth);
    }

    if (method === "POST" && path === "/api/import") {
      const auth = await requireAuth(req);
      if (!authResult(auth)) return auth;
      return handleImport(req, auth);
    }

    if (hasFrontend) {
      const filePath = resolve(resolvedPublicDir, path === "/" ? "index.html" : path.slice(1));
      if (!filePath.startsWith(resolvedPublicDir + "/") && filePath !== resolvedPublicDir) {
        return error("Forbidden", 403);
      }
      const file = Bun.file(filePath);
      if (await file.exists()) return new Response(file, { headers: SECURITY_HEADERS });
      return new Response(Bun.file(join(resolvedPublicDir, "index.html")), { headers: SECURITY_HEADERS });
    }

    return error("Not found", 404);
  }
}

if (import.meta.main) {
  const port = Number(process.env.PORT) || 3000;
  startWebServer({
    port,
    mcpHandler: createMcpHandler(),
  });
  console.log(`OpenMarkers API running on http://localhost:${port}`);
}
