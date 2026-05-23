import { verifyToken } from "@openmarkers/db";

const SESSION_COOKIE = "openmarkers_session";
const STATE_COOKIE = "openmarkers_auth_state";
const PKCE_VERIFIER_COOKIE = "openmarkers_auth_pkce";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function authBaseUrl(): string {
  const base = process.env.AUTH_BASE_URL;
  if (!base) {
    throw new Error("AUTH_BASE_URL environment variable is required");
  }
  return base.replace(/\/+$/, "");
}

export function authApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${authBaseUrl()}${normalized}`;
}

function authRealm(): { origin: string; project: string } {
  const base = new URL(authBaseUrl());
  const match = base.pathname.match(/^\/api\/([^/]+)\/auth\/?$/);
  if (!match) {
    throw new Error("AUTH_BASE_URL must look like https://host/api/<project>/auth");
  }

  return {
    origin: base.origin,
    project: match[1]
  };
}

function authLoginUrl(): string {
  const realm = authRealm();
  return `${realm.origin}/login/${realm.project}`;
}

function authLoginTokenUrl(): string {
  const realm = authRealm();
  return `${realm.origin}/api/${realm.project}/login/token`;
}

function getBaseUrl(req: Request): string {
  const url = new URL(req.url);
  const proto =
    req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

function parseCookies(req: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join("=")));
  }
  return cookies;
}

export function getAuthSessionCookie(req: Request): string | null {
  return parseCookies(req).get(SESSION_COOKIE) ?? null;
}

function secureCookie(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  return proto === "https" || new URL(req.url).protocol === "https:";
}

function cookieHeader(
  name: string,
  value: string,
  req: Request,
  maxAge: number
): string {
  const secure = secureCookie(req) ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearCookieHeader(name: string, req: Request): string {
  const secure = secureCookie(req) ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function randomState(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString(
    "base64url"
  );
}

function randomCodeVerifier(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
    "base64url"
  );
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );

  return Buffer.from(digest).toString("base64url");
}

async function getTokenFromSessionCookie(
  sessionCookie: string
): Promise<string | null> {
  const res = await fetch(authApiUrl("/get-session"), {
    headers: {
      Cookie: sessionCookie
    }
  });

  if (!res.ok) {
    return null;
  }

  return res.headers.get("set-auth-jwt");
}

export async function handleAuthLogin(req: Request, mode: "login" | "signup") {
  const state = randomState();
  const verifier = randomCodeVerifier();
  const baseUrl = getBaseUrl(req);
  const loginUrl = new URL(authLoginUrl());
  loginUrl.searchParams.set("redirect_uri", `${baseUrl}/auth/callback`);
  loginUrl.searchParams.set("state", state);
  loginUrl.searchParams.set("mode", mode);
  loginUrl.searchParams.set("code_challenge", await codeChallenge(verifier));
  loginUrl.searchParams.set("code_challenge_method", "S256");

  const headers = new Headers({
    Location: loginUrl.toString()
  });
  headers.append("Set-Cookie", cookieHeader(STATE_COOKIE, state, req, 10 * 60));
  headers.append(
    "Set-Cookie",
    cookieHeader(PKCE_VERIFIER_COOKIE, verifier, req, 10 * 60)
  );

  return new Response(null, {
    status: 302,
    headers
  });
}

export async function handleAuthCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const cookies = parseCookies(req);
  const expectedState = cookies.get(STATE_COOKIE);
  const codeVerifier = cookies.get(PKCE_VERIFIER_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
    const headers = new Headers({
      Location: "/"
    });
    headers.append("Set-Cookie", clearCookieHeader(STATE_COOKIE, req));
    headers.append("Set-Cookie", clearCookieHeader(PKCE_VERIFIER_COOKIE, req));

    return new Response(null, {
      status: 302,
      headers
    });
  }

  const res = await fetch(authLoginTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      redirect_uri: `${getBaseUrl(req)}/auth/callback`,
      code_verifier: codeVerifier
    })
  });

  if (!res.ok) {
    const headers = new Headers({
      Location: "/"
    });
    headers.append("Set-Cookie", clearCookieHeader(STATE_COOKIE, req));
    headers.append("Set-Cookie", clearCookieHeader(PKCE_VERIFIER_COOKIE, req));

    return new Response(null, {
      status: 302,
      headers
    });
  }

  const data = await res.json().catch(() => null);
  const sessionCookie =
    typeof data?.sessionCookie === "string" ? data.sessionCookie : "";
  if (!sessionCookie) {
    const headers = new Headers({
      Location: "/"
    });
    headers.append("Set-Cookie", clearCookieHeader(STATE_COOKIE, req));
    headers.append("Set-Cookie", clearCookieHeader(PKCE_VERIFIER_COOKIE, req));

    return new Response(null, {
      status: 302,
      headers
    });
  }

  const headers = new Headers({
    Location: "/dashboard"
  });
  headers.append(
    "Set-Cookie",
    cookieHeader(SESSION_COOKIE, sessionCookie, req, SESSION_MAX_AGE_SECONDS)
  );
  headers.append("Set-Cookie", clearCookieHeader(STATE_COOKIE, req));
  headers.append("Set-Cookie", clearCookieHeader(PKCE_VERIFIER_COOKIE, req));

  return new Response(null, {
    status: 302,
    headers
  });
}

export async function handleAuthSession(req: Request): Promise<Response> {
  const sessionCookie = parseCookies(req).get(SESSION_COOKIE);
  const token = sessionCookie
    ? await getTokenFromSessionCookie(sessionCookie)
    : null;
  const session = token ? await verifyToken(token) : null;

  return Response.json({
    authenticated: Boolean(session),
    user: session ? { email: session.email } : null
  });
}

export async function handleAuthToken(req: Request): Promise<Response> {
  const sessionCookie = parseCookies(req).get(SESSION_COOKIE);
  const token = sessionCookie
    ? await getTokenFromSessionCookie(sessionCookie)
    : null;
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ token });
}

export function handleAuthLogout(req: Request): Response {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearCookieHeader(SESSION_COOKIE, req)
      }
    }
  );
}
