import { createAuthClient } from "@neondatabase/neon-js/auth";

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL;

export const authClient = createAuthClient(NEON_AUTH_URL);
