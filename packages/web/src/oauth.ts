import { verifyToken } from "@openmarkers/db";
import { renderLoginPage } from "./oauth-login.ts";

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;

// --- In-memory stores ---

interface AuthCode {
  codeChallenge: string;
  clientId: string;
  redirectUri: string;
  neonSessionToken: string; // JWT from Neon Auth
  neonSessionCookie: string; // session cookie for refresh
  expiresAt: number;
}

interface RegisteredClient {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  clientName?: string;
  registeredAt: number;
}

interface StoredRefreshToken {
  neonSessionCookie: string;
  clientId: string;
  expiresAt: number;
}

const authCodes = new Map<string, AuthCode>();
const registeredClients = new Map<string, RegisteredClient>();
const refreshTokens = new Map<string, StoredRefreshToken>();

// Cleanup expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of authCodes) if (v.expiresAt < now) authCodes.delete(k);
  for (const [k, v] of refreshTokens) if (v.expiresAt < now) refreshTokens.delete(k);
}, 60_000);

// --- Neon Auth server-side sign-in ---

async function signInViaNeonAuth(
  email: string,
  password: string,
): Promise<{ jwt: string; sessionCookie: string } | null> {
  try {
    const base = NEON_AUTH_BASE_URL.replace(/\/+$/, "");

    // Step 1: Sign in — returns opaque session token
    const signInRes = await fetch(`${base}/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!signInRes.ok) {
      console.warn("[oauth] Sign-in failed:", signInRes.status);
      return null;
    }

    const signInData = await signInRes.json();
    const sessionToken = signInData?.token;
    if (!sessionToken) {
      console.error("[oauth] Sign-in response missing token");
      return null;
    }

    // Step 2: Build session cookie from the token
    // Also check set-cookie headers as fallback
    const setCookies = signInRes.headers.getSetCookie();
    const headerCookie = setCookies
      .map((c) => c.split(";")[0])
      .filter((c) => c.includes("session_token") || c.includes("better-auth"))
      .join("; ");

    const sessionCookie = headerCookie || `better-auth.session_token=${sessionToken}`;

    // Step 3: Get JWT from session endpoint — JWT comes in the "set-auth-jwt" response header
    const sessionRes = await fetch(`${base}/get-session`, {
      headers: { Cookie: sessionCookie },
    });

    if (!sessionRes.ok) {
      console.error("[oauth] get-session failed:", sessionRes.status);
      return null;
    }

    const jwt = sessionRes.headers.get("set-auth-jwt");
    if (!jwt) {
      console.error("[oauth] No set-auth-jwt header in get-session response");
      return null;
    }
    console.info("[oauth] Sign-in successful");
    return { jwt, sessionCookie };
  } catch (e) {
    console.error("[oauth] Neon Auth sign-in failed:", e);
    return null;
  }
}

async function refreshViaNeonAuth(sessionCookie: string): Promise<string | null> {
  try {
    const base = NEON_AUTH_BASE_URL.replace(/\/+$/, "");
    const res = await fetch(`${base}/get-session`, {
      headers: { Cookie: sessionCookie },
    });
    if (!res.ok) return null;
    return res.headers.get("set-auth-jwt");
  } catch {
    return null;
  }
}


// --- PKCE verification ---

async function verifyPkce(codeVerifier: string, codeChallenge: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const base64url = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64url === codeChallenge;
}

function generateCode(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Helper to get base URL ---

function getBaseUrl(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

// --- OAuth Handlers ---

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function handleASMetadata(req: Request): Response {
  const baseUrl = getBaseUrl(req);
  return Response.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    registration_endpoint: `${baseUrl}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["openid", "profile"],
  }, { headers: CORS_HEADERS });
}

export function handleRSMetadata(req: Request): Response {
  const baseUrl = getBaseUrl(req);
  return Response.json({
    resource: `${baseUrl}/mcp`,
    authorization_servers: [baseUrl],
    scopes_supported: ["openid", "profile"],
    bearer_methods_supported: ["header"],
    resource_name: "OpenMarkers MCP Server",
  }, { headers: CORS_HEADERS });
}

export function handleRegister(req: Request): Response | Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  return (async () => {
    try {
      const body = await req.json();
      const clientId = crypto.randomUUID();
      const clientSecret = generateCode();
      const redirectUris: string[] = body.redirect_uris || [];
      const clientName: string | undefined = body.client_name;

      if (!redirectUris.length) {
        return Response.json({ error: "redirect_uris is required" }, { status: 400, headers: CORS_HEADERS });
      }

      const client: RegisteredClient = {
        clientId,
        clientSecret,
        redirectUris,
        clientName,
        registeredAt: Date.now(),
      };
      registeredClients.set(clientId, client);
      console.info("[oauth] Client registered:", clientId, clientName || "");

      return Response.json({
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(client.registeredAt / 1000),
        redirect_uris: redirectUris,
        client_name: clientName,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
      }, { status: 201, headers: CORS_HEADERS });
    } catch {
      return Response.json({ error: "invalid_request" }, { status: 400, headers: CORS_HEADERS });
    }
  })();
}

export function handleAuthorize(req: Request): Response | Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "GET") {
    // Render login page
    const clientId = url.searchParams.get("client_id") || "";
    const redirectUri = url.searchParams.get("redirect_uri") || "";
    const codeChallenge = url.searchParams.get("code_challenge") || "";
    const codeChallengeMethod = url.searchParams.get("code_challenge_method") || "S256";
    const state = url.searchParams.get("state") || "";
    const scope = url.searchParams.get("scope") || "";

    // Validate client
    const client = registeredClients.get(clientId);
    if (!client) {
      return new Response("Unknown client", { status: 400 });
    }
    if (!client.redirectUris.includes(redirectUri)) {
      return new Response("Invalid redirect_uri", { status: 400 });
    }
    if (!codeChallenge || codeChallengeMethod !== "S256") {
      return new Response("PKCE S256 is required", { status: 400 });
    }

    const html = renderLoginPage({ clientId, redirectUri, codeChallenge, codeChallengeMethod, state, scope });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // POST — form submission
  return (async () => {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const clientId = formData.get("client_id") as string;
    const redirectUri = formData.get("redirect_uri") as string;
    const codeChallenge = formData.get("code_challenge") as string;
    const codeChallengeMethod = formData.get("code_challenge_method") as string;
    const state = formData.get("state") as string;
    const scope = formData.get("scope") as string;

    // Validate client again
    const client = registeredClients.get(clientId);
    if (!client || !client.redirectUris.includes(redirectUri)) {
      return new Response("Invalid client", { status: 400 });
    }

    // Authenticate via Neon Auth
    const authResult = await signInViaNeonAuth(email, password);
    if (!authResult) {
      const html = renderLoginPage({
        clientId, redirectUri, codeChallenge, codeChallengeMethod, state, scope,
        error: "Invalid email or password.",
      });
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // Generate authorization code
    const code = generateCode();
    authCodes.set(code, {
      codeChallenge,
      clientId,
      redirectUri,
      neonSessionToken: authResult.jwt,
      neonSessionCookie: authResult.sessionCookie,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Redirect back to MCP client
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);

    console.info("[oauth] Authorization code issued for client:", clientId);
    return Response.redirect(redirectUrl.toString(), 302);
  })();
}

export function handleToken(req: Request): Response | Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  return (async () => {
    let params: URLSearchParams;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      params = new URLSearchParams(await req.text());
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      params = new URLSearchParams(body);
    } else {
      params = new URLSearchParams(await req.text());
    }

    const grantType = params.get("grant_type");
    const clientId = params.get("client_id") || "";

    // Validate client exists
    const client = registeredClients.get(clientId);
    if (!client) {
      return Response.json({ error: "invalid_client" }, { status: 401, headers: CORS_HEADERS });
    }

    if (grantType === "authorization_code") {
      const code = params.get("code") || "";
      const codeVerifier = params.get("code_verifier") || "";

      const stored = authCodes.get(code);
      if (!stored || stored.clientId !== clientId || stored.expiresAt < Date.now()) {
        authCodes.delete(code);
        return Response.json({ error: "invalid_grant" }, { status: 400, headers: CORS_HEADERS });
      }

      if (stored.redirectUri !== params.get("redirect_uri")) {
        return Response.json({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, { status: 400, headers: CORS_HEADERS });
      }

      // Verify PKCE
      const pkceValid = await verifyPkce(codeVerifier, stored.codeChallenge);
      if (!pkceValid) {
        authCodes.delete(code);
        return Response.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400, headers: CORS_HEADERS });
      }

      // Delete auth code (one-time use)
      authCodes.delete(code);

      // Generate refresh token
      const refreshToken = generateCode();
      refreshTokens.set(refreshToken, {
        neonSessionCookie: stored.neonSessionCookie,
        clientId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Calculate expires_in from JWT
      let expiresIn = 3600;
      try {
        const payload = JSON.parse(atob(stored.neonSessionToken.split(".")[1]));
        if (payload.exp) {
          expiresIn = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
        }
      } catch { /* use default */ }

      console.info("[oauth] Token issued for client:", clientId, "expires_in:", expiresIn);
      return Response.json({
        access_token: stored.neonSessionToken,
        token_type: "bearer",
        expires_in: expiresIn,
        refresh_token: refreshToken,
      }, { headers: CORS_HEADERS });

    } else if (grantType === "refresh_token") {
      const refreshToken = params.get("refresh_token") || "";
      const stored = refreshTokens.get(refreshToken);
      if (!stored || stored.clientId !== clientId || stored.expiresAt < Date.now()) {
        refreshTokens.delete(refreshToken);
        return Response.json({ error: "invalid_grant" }, { status: 400, headers: CORS_HEADERS });
      }

      // Get fresh JWT from Neon Auth
      const newJwt = await refreshViaNeonAuth(stored.neonSessionCookie);
      if (!newJwt) {
        refreshTokens.delete(refreshToken);
        console.warn("[oauth] Token refresh failed — session expired for client:", clientId);
        return Response.json({ error: "invalid_grant", error_description: "Session expired. Please re-authorize." }, { status: 400, headers: CORS_HEADERS });
      }
      console.info("[oauth] Token refreshed for client:", clientId);

      // Rotate refresh token
      refreshTokens.delete(refreshToken);
      const newRefreshToken = generateCode();
      refreshTokens.set(newRefreshToken, {
        neonSessionCookie: stored.neonSessionCookie,
        clientId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      let expiresIn = 3600;
      try {
        const payload = JSON.parse(atob(newJwt.split(".")[1]));
        if (payload.exp) {
          expiresIn = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
        }
      } catch { /* use default */ }

      return Response.json({
        access_token: newJwt,
        token_type: "bearer",
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
      }, { headers: CORS_HEADERS });

    } else {
      return Response.json({ error: "unsupported_grant_type" }, { status: 400, headers: CORS_HEADERS });
    }
  })();
}

// CORS preflight for OAuth endpoints
export function handleOAuthPreflight(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}
