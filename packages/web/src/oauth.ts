import { renderLoginPage } from "./oauth-login.ts";
import { oauthStore } from "@openmarkers/db";

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;
const OAUTH_SECRET = process.env.OAUTH_SECRET;
if (!OAUTH_SECRET) {
  throw new Error("OAUTH_SECRET environment variable is required. Generate one with: openssl rand -base64 32");
}

// --- AES-256-GCM encryption for session cookies stored in DB ---

let cryptoKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  const raw = new TextEncoder().encode(OAUTH_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", raw);
  cryptoKey = await crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
  return cryptoKey;
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return Buffer.from(combined).toString("base64");
}

async function decrypt(encoded: string): Promise<string> {
  const key = await getKey();
  const combined = Buffer.from(encoded, "base64");
  const iv = combined.subarray(0, 12);
  const ciphertext = combined.subarray(12);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

// Cleanup expired entries every 60s
setInterval(() => {
  oauthStore.cleanupExpired().catch(() => {});
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

function verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  const hash = new Bun.CryptoHasher("sha256").update(codeVerifier).digest();
  const base64url = Buffer.from(hash).toString("base64url");
  return base64url === codeChallenge;
}

function generateCode(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
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

      await oauthStore.registerClient({ clientId, clientSecret, redirectUris, clientName });
      console.info("[oauth] Client registered:", clientId, clientName || "");

      return Response.json({
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
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
    const clientId = url.searchParams.get("client_id") || "";
    const redirectUri = url.searchParams.get("redirect_uri") || "";
    const codeChallenge = url.searchParams.get("code_challenge") || "";
    const codeChallengeMethod = url.searchParams.get("code_challenge_method") || "S256";
    const state = url.searchParams.get("state") || "";
    const scope = url.searchParams.get("scope") || "";

    if (!codeChallenge || codeChallengeMethod !== "S256") {
      return new Response("PKCE S256 is required", { status: 400 });
    }
    if (!redirectUri) {
      return new Response("redirect_uri is required", { status: 400 });
    }

    return (async () => {
      await oauthStore.ensureClient(clientId, redirectUri);
      const html = renderLoginPage({ clientId, redirectUri, codeChallenge, codeChallengeMethod, state, scope });
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    })();
  }

  // POST — form submission
  return (async () => {
    const formData = await req.formData();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const clientId = String(formData.get("client_id") ?? "");
    const redirectUri = String(formData.get("redirect_uri") ?? "");
    const codeChallenge = String(formData.get("code_challenge") ?? "");
    const codeChallengeMethod = String(formData.get("code_challenge_method") ?? "");
    const state = String(formData.get("state") ?? "");
    const scope = String(formData.get("scope") ?? "");

    await oauthStore.ensureClient(clientId, redirectUri);

    // Authenticate via Neon Auth
    const authResult = await signInViaNeonAuth(email, password);
    if (!authResult) {
      const html = renderLoginPage({
        clientId, redirectUri, codeChallenge, codeChallengeMethod, state, scope,
        error: "Invalid email or password.",
      });
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // Generate authorization code and store in DB
    const code = generateCode();
    await oauthStore.storeAuthCode({
      code,
      codeChallenge,
      clientId,
      redirectUri,
      neonSessionToken: authResult.jwt,
      neonSessionCookie: await encrypt(authResult.sessionCookie),
      expiresAt: Date.now() + 5 * 60 * 1000,
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

    await oauthStore.ensureClient(clientId);

    if (grantType === "authorization_code") {
      const code = params.get("code") || "";
      const codeVerifier = params.get("code_verifier") || "";

      // Look up auth code from DB
      const stored = await oauthStore.getAuthCode(code);
      if (!stored || stored.clientId !== clientId || stored.expiresAt < Date.now()) {
        if (stored) await oauthStore.deleteAuthCode(code);
        return Response.json({ error: "invalid_grant" }, { status: 400, headers: CORS_HEADERS });
      }

      if (stored.redirectUri !== params.get("redirect_uri")) {
        return Response.json({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, { status: 400, headers: CORS_HEADERS });
      }

      // Verify PKCE
      const pkceValid = verifyPkce(codeVerifier, stored.codeChallenge);
      if (!pkceValid) {
        await oauthStore.deleteAuthCode(code);
        return Response.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400, headers: CORS_HEADERS });
      }

      // Delete auth code (one-time use)
      await oauthStore.deleteAuthCode(code);

      // Generate refresh token and store in DB
      const refreshToken = generateCode();
      await oauthStore.storeRefreshToken({
        token: refreshToken,
        neonSessionCookie: stored.neonSessionCookie,
        clientId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      // Calculate expires_in from JWT
      let expiresIn = 3600;
      try {
        const payload = JSON.parse(Buffer.from(stored.neonSessionToken.split(".")[1], "base64url").toString());
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
      const stored = await oauthStore.getRefreshToken(refreshToken);
      if (!stored || stored.clientId !== clientId || stored.expiresAt < Date.now()) {
        if (stored) await oauthStore.deleteRefreshToken(refreshToken);
        return Response.json({ error: "invalid_grant" }, { status: 400, headers: CORS_HEADERS });
      }

      // Get fresh JWT from Neon Auth (decrypt session cookie first)
      const decryptedCookie = await decrypt(stored.neonSessionCookie);
      const newJwt = await refreshViaNeonAuth(decryptedCookie);
      if (!newJwt) {
        await oauthStore.deleteRefreshToken(refreshToken);
        console.warn("[oauth] Token refresh failed — session expired for client:", clientId);
        return Response.json({ error: "invalid_grant", error_description: "Session expired. Please re-authorize." }, { status: 400, headers: CORS_HEADERS });
      }
      console.info("[oauth] Token refreshed for client:", clientId);

      // Rotate refresh token
      await oauthStore.deleteRefreshToken(refreshToken);
      const newRefreshToken = generateCode();
      await oauthStore.storeRefreshToken({
        token: newRefreshToken,
        neonSessionCookie: stored.neonSessionCookie,
        clientId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      let expiresIn = 3600;
      try {
        const payload = JSON.parse(Buffer.from(newJwt.split(".")[1], "base64url").toString());
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
