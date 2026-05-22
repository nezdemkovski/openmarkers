import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    const url = process.env.AUTH_JWKS_URL;
    if (!url) throw new Error("AUTH_JWKS_URL is not set");
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: process.env.AUTH_JWT_ISSUER,
      audience: getAcceptedAudiences(),
    });
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[auth] JWT verification failed:", message);
    return null;
  }
}

export function getAcceptedAudiences(): string | string[] | undefined {
  const value = process.env.AUTH_JWT_AUDIENCE;
  if (!value) return undefined;

  const audiences = value
    .split(",")
    .map((audience) => audience.trim())
    .filter(Boolean);

  if (audiences.length === 0) return undefined;
  if (audiences.length === 1) return audiences[0];
  return audiences;
}
