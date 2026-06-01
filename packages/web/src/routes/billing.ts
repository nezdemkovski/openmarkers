import { z } from "zod";

import {
  authApiUrl,
  authRealmApiUrl,
  getAuthSessionCookie,
} from "../auth-session.ts";
import { error, isResponse, json, parseBody } from "./_shared.ts";

const AI_REQUESTS_PRODUCT_SLUG = "ai-requests-50";
const AI_REQUESTS_BENEFIT_KEY = "ai_requests";

const checkoutSchema = z.object({
  slug: z.string().min(1).default(AI_REQUESTS_PRODUCT_SLUG),
  returnTo: z.string().min(1).optional(),
});

type AiRequestUsage = {
  used: number;
  limit: number;
  remaining: number;
  totalRemaining: number;
  unlimited: boolean;
};

type AiRequestReservation = {
  id: string;
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

function safeReturnPath(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard/settings";
  }

  return path;
}

function checkoutReturnUrl(
  req: Request,
  path: string | undefined,
  status: "success" | "cancelled",
): string {
  const url = new URL(safeReturnPath(path), requestOrigin(req));
  url.searchParams.set("checkout", status);
  return url.toString();
}

function emptyAiRequestUsage(): AiRequestUsage {
  return {
    used: 0,
    limit: 0,
    remaining: 0,
    totalRemaining: 0,
    unlimited: false,
  };
}

function aiUsageFromPayload(payload: unknown): AiRequestUsage {
  if (!payload || typeof payload !== "object" || !("summary" in payload)) {
    return emptyAiRequestUsage();
  }

  const summary = payload.summary;
  if (!summary || typeof summary !== "object") {
    return emptyAiRequestUsage();
  }

  const used = Number("used" in summary ? summary.used : 0);
  const limit = Number("limit" in summary ? summary.limit : 0);
  const remaining = Number("remaining" in summary ? summary.remaining : 0);

  return {
    used: Number.isFinite(used) ? used : 0,
    limit: Number.isFinite(limit) ? limit : 0,
    remaining: Number.isFinite(remaining) ? Math.max(0, remaining) : 0,
    totalRemaining: Number.isFinite(remaining) ? Math.max(0, remaining) : 0,
    unlimited: "unlimited" in summary ? summary.unlimited === true : false,
  };
}

export async function getAiRequestUsage(req: Request): Promise<AiRequestUsage> {
  const headers = authCookieHeaders(req);
  if (!headers) return emptyAiRequestUsage();

  const url = authRealmApiUrl(
    `/billing/usage/summary?key=${AI_REQUESTS_BENEFIT_KEY}`,
  );
  const res = await fetch(url, { headers });
  if (!res.ok) {
    return emptyAiRequestUsage();
  }

  const payload = await res.json().catch(() => null);
  return aiUsageFromPayload(payload);
}

export async function reserveAiRequest(
  req: Request,
): Promise<AiRequestReservation | null> {
  const headers = authCookieHeaders(req);
  if (!headers) return null;

  const res = await fetch(authRealmApiUrl("/billing/usage/reserve"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      key: AI_REQUESTS_BENEFIT_KEY,
      amount: 1,
    }),
  });
  if (!res.ok) return null;

  const payload = await res.json().catch(() => null);
  const reservationId =
    payload &&
    typeof payload === "object" &&
    "reservationId" in payload &&
    typeof payload.reservationId === "string"
      ? payload.reservationId
      : null;

  return reservationId ? { id: reservationId } : null;
}

export async function commitAiRequest(
  req: Request,
  reservation: AiRequestReservation,
): Promise<boolean> {
  return finishAiRequestReservation(req, reservation, "commit");
}

export async function releaseAiRequest(
  req: Request,
  reservation: AiRequestReservation,
): Promise<boolean> {
  return finishAiRequestReservation(req, reservation, "release");
}

async function finishAiRequestReservation(
  req: Request,
  reservation: AiRequestReservation,
  action: "commit" | "release",
): Promise<boolean> {
  const headers = authCookieHeaders(req);
  if (!headers) return false;

  const res = await fetch(authRealmApiUrl(`/billing/usage/${action}`), {
    method: "POST",
    headers,
    body: JSON.stringify({
      reservationId: reservation.id,
    }),
  });

  return res.ok;
}

export async function handleBillingCheckout(req: Request): Promise<Response> {
  const headers = authCookieHeaders(req);
  if (!headers) return error("Unauthorized", 401);

  const body = await parseBody(req, checkoutSchema);
  if (isResponse(body)) return body;

  const successUrl = checkoutReturnUrl(req, body.returnTo, "success");
  const returnUrl = checkoutReturnUrl(req, body.returnTo, "cancelled");
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
