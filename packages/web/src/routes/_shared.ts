import { z } from "zod";

export const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  ...(process.env.NODE_ENV === "production"
    ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
    : {}),
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      ...SECURITY_HEADERS,
    },
  });
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T | Response> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return error(`Validation error: ${messages.join("; ")}`, 400);
    }
    return result.data;
  } catch {
    return error("Invalid JSON", 400);
  }
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
