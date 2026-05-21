import { createAuthClient } from "better-auth/react";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;

if (!AUTH_BASE_URL) {
  throw new Error("VITE_AUTH_BASE_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
});

export async function getAuthToken(): Promise<string | null> {
  const res = await fetch(`${AUTH_BASE_URL}/token`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json().catch(() => null);
  return typeof data?.token === "string" ? data.token : null;
}
