import { z } from "zod";

import { authApiUrl, getAuthSessionCookie } from "../auth-session.ts";

import { error, isResponse, json, parseBody } from "./_shared.ts";

const AI_REQUESTS_PRODUCT_SLUG = "ai-requests-50";
const AI_REQUEST_EVENT = "ai_request";
const AI_REQUEST_METER_NAME = "OpenMarkers AI Requests";

const checkoutSchema = z.object({
  slug: z.string().min(1).default(AI_REQUESTS_PRODUCT_SLUG),
});

type PaidAiUsage = {
  paidUsed: number;
  paidLimit: number;
  paidRemaining: number;
};

function requestOrigin(req: Request): string {
  const url = new URL(req.url);
  const proto =
    req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

function authCookieHeaders(req: Request): HeadersInit | null {
  const sessionCookie = getAuthSessionCookie(req);
  if (!sessionCookie) return null;
  const origin = requestOrigin(req);
  return {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
    Origin: origin,
    Referer: `${origin}/dashboard`,
  };
}

function absoluteUrl(req: Request, path: string): string {
  return `${requestOrigin(req)}${path}`;
}

function findAiMeter(payload: unknown): Record<string, unknown> | null {
  const root = payload as Record<string, unknown> | null;
  const items =
    Array.isArray(root?.items)
      ? root.items
      : Array.isArray((root?.result as Record<string, unknown> | undefined)?.items)
        ? (root?.result as Record<string, unknown>).items
        : Array.isArray((root?.data as Record<string, unknown> | undefined)?.items)
          ? (root?.data as Record<string, unknown>).items
          : [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const meter = record.meter as Record<string, unknown> | undefined;
    const name = typeof meter?.name === "string" ? meter.name : "";
    const metadata = meter?.metadata as Record<string, unknown> | undefined;
    if (
      name === AI_REQUEST_METER_NAME ||
      metadata?.event === AI_REQUEST_EVENT ||
      metadata?.service === "openmarkers"
    ) {
      return record;
    }
  }

  return null;
}

export async function getPaidAiUsage(req: Request): Promise<PaidAiUsage> {
  const headers = authCookieHeaders(req);
  if (!headers) return { paidUsed: 0, paidLimit: 0, paidRemaining: 0 };

  const res = await fetch(authApiUrl("/usage/meters/list?page=1&limit=50"), {
    headers,
  });
  if (!res.ok) {
    return { paidUsed: 0, paidLimit: 0, paidRemaining: 0 };
  }

  const payload = await res.json().catch(() => null);
  const meter = findAiMeter(payload);
  if (!meter) return { paidUsed: 0, paidLimit: 0, paidRemaining: 0 };

  const paidUsed = Number(meter.consumedUnits ?? meter.consumed_units ?? 0);
  const paidLimit = Number(meter.creditedUnits ?? meter.credited_units ?? 0);
  const paidRemaining = Number(meter.balance ?? Math.max(0, paidLimit - paidUsed));

  return {
    paidUsed: Number.isFinite(paidUsed) ? paidUsed : 0,
    paidLimit: Number.isFinite(paidLimit) ? paidLimit : 0,
    paidRemaining: Number.isFinite(paidRemaining) ? Math.max(0, paidRemaining) : 0,
  };
}

export async function consumePaidAiRequest(req: Request): Promise<boolean> {
  const headers = authCookieHeaders(req);
  if (!headers) return false;

  const res = await fetch(authApiUrl("/usage/ingest"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      event: AI_REQUEST_EVENT,
      metadata: {
        service: "openmarkers",
      },
    }),
  });

  return res.ok;
}

export async function handleBillingCheckout(req: Request): Promise<Response> {
  const headers = authCookieHeaders(req);
  if (!headers) return error("Unauthorized", 401);

  const body = await parseBody(req, checkoutSchema);
  if (isResponse(body)) return body;

  const successUrl = absoluteUrl(req, "/dashboard?view=settings&checkout=success");
  const returnUrl = absoluteUrl(req, "/dashboard?view=settings");
  const res = await fetch(authApiUrl("/checkout"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      slug: body.slug,
      successUrl,
      returnUrl,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : "Could not create checkout";
    return error(message, res.status);
  }

  const checkoutUrl =
    typeof payload?.url === "string"
      ? payload.url
      : typeof payload?.checkout?.url === "string"
        ? payload.checkout.url
        : typeof payload?.data?.url === "string"
          ? payload.data.url
          : null;

  if (!checkoutUrl) {
    return error("Checkout URL was not returned", 502);
  }

  return json({ url: checkoutUrl });
}
