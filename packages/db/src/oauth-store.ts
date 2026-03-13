import { db } from "./db";
import { oauthClients, oauthAuthCodes, oauthRefreshTokens } from "./schema/app";
import { eq, lt } from "drizzle-orm";

// --- Types ---

export interface OAuthClient {
  clientId: string;
  clientSecret: string;
  redirectUris: string;
  clientName: string | null;
}

export interface OAuthAuthCode {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  neonSessionToken: string;
  neonSessionCookie: string;
  expiresAt: number;
}

export interface OAuthRefreshToken {
  token: string;
  clientId: string;
  neonSessionCookie: string;
  expiresAt: number;
}

// --- Client operations ---

export async function getClient(clientId: string): Promise<OAuthClient | null> {
  const rows = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  return rows[0] ?? null;
}

export async function registerClient(client: {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  clientName?: string;
}): Promise<void> {
  await db.insert(oauthClients).values({
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    redirectUris: JSON.stringify(client.redirectUris),
    clientName: client.clientName,
  });
}

export async function validateRedirectUri(clientId: string, redirectUri: string): Promise<boolean> {
  const client = await getClient(clientId);
  if (!client) return false;
  const uris: string[] = JSON.parse(client.redirectUris);
  return uris.includes(redirectUri);
}

// --- Auth code operations ---

export async function storeAuthCode(code: OAuthAuthCode): Promise<void> {
  await db.insert(oauthAuthCodes).values(code);
}

export async function getAuthCode(code: string): Promise<OAuthAuthCode | null> {
  const rows = await db.select().from(oauthAuthCodes).where(eq(oauthAuthCodes.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function deleteAuthCode(code: string): Promise<void> {
  await db.delete(oauthAuthCodes).where(eq(oauthAuthCodes.code, code));
}

// --- Refresh token operations ---

export async function storeRefreshToken(token: OAuthRefreshToken): Promise<void> {
  await db.insert(oauthRefreshTokens).values(token);
}

export async function getRefreshToken(token: string): Promise<OAuthRefreshToken | null> {
  const rows = await db.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.token, token)).limit(1);
  return rows[0] ?? null;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await db.delete(oauthRefreshTokens).where(eq(oauthRefreshTokens.token, token));
}

// --- Cleanup ---

export async function cleanupExpired(): Promise<void> {
  const now = Date.now();
  await db.delete(oauthAuthCodes).where(lt(oauthAuthCodes.expiresAt, now));
  await db.delete(oauthRefreshTokens).where(lt(oauthRefreshTokens.expiresAt, now));
}
