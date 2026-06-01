import { beforeEach, describe, expect, mock, test } from "bun:test";

const authApiUrlMock = mock((path: string) => `https://auth.test${path}`);
const getAuthSessionCookieMock = mock(() => "openmarkers_session=test");
const fetchMock = mock(async (_url: string, init?: RequestInit) => {
  return Response.json({
    url: "https://checkout.test/session",
    received: init?.body ? JSON.parse(String(init.body)) : null
  });
});

mock.module("../auth-session.ts", () => ({
  authApiUrl: authApiUrlMock,
  authRealmApiUrl: (path: string) => `https://auth.test/api/test${path}`,
  getAuthSessionCookie: getAuthSessionCookieMock
}));

const { handleBillingCheckout } = await import("./billing.ts");

const checkoutRequest = (body: unknown) =>
  new Request("https://openmarkers.test/api/billing/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "openmarkers.test"
    },
    body: JSON.stringify(body)
  });

describe("billing checkout route", () => {
  beforeEach(() => {
    authApiUrlMock.mockClear();
    getAuthSessionCookieMock.mockClear();
    fetchMock.mockClear();
    globalThis.fetch = fetchMock;
  });

  test("returns to the page that started checkout", async () => {
    const response = await handleBillingCheckout(
      checkoutRequest({
        slug: "ai-requests-50",
        returnTo: "/dashboard/category/lipids?range=90d#chart"
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(init?.body));

    expect(payload.successUrl).toBe(
      "https://openmarkers.test/dashboard/category/lipids?range=90d&checkout=success#chart"
    );
    expect(payload.returnUrl).toBe(
      "https://openmarkers.test/dashboard/category/lipids?range=90d&checkout=cancelled#chart"
    );
  });

  test("falls back to settings for unsafe return paths", async () => {
    const response = await handleBillingCheckout(
      checkoutRequest({
        slug: "ai-requests-50",
        returnTo: "https://evil.test/callback"
      })
    );

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(init?.body));

    expect(payload.successUrl).toBe(
      "https://openmarkers.test/dashboard/settings?checkout=success"
    );
    expect(payload.returnUrl).toBe(
      "https://openmarkers.test/dashboard/settings?checkout=cancelled"
    );
  });
});
