import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    const url = process.env.NEON_AUTH_BASE_URL;
    if (!url) throw new Error("NEON_AUTH_BASE_URL is not set");
    const baseUrl = url.endsWith("/") ? url : url + "/";
    jwks = createRemoteJWKSet(new URL(".well-known/jwks.json", baseUrl));
  }
  return jwks;
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJWKS());
    return { userId: payload.sub!, email: (payload.email as string) ?? "" };
  } catch (e) {
    console.error("[auth] JWT verification failed:", (e as Error).message);
    return null;
  }
}
