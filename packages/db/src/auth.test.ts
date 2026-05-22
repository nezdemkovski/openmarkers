import { describe, expect, test } from "bun:test";

import { getAcceptedAudiences } from "./auth";

describe("auth audience config", () => {
  test("parses one or more accepted JWT audiences", () => {
    const previous = process.env.AUTH_JWT_AUDIENCE;

    try {
      process.env.AUTH_JWT_AUDIENCE = "openmarkers";
      expect(getAcceptedAudiences()).toBe("openmarkers");

      process.env.AUTH_JWT_AUDIENCE =
        "openmarkers, https://auth.nezdemkovski.cloud/openmarkers ";
      expect(getAcceptedAudiences()).toEqual([
        "openmarkers",
        "https://auth.nezdemkovski.cloud/openmarkers",
      ]);

      process.env.AUTH_JWT_AUDIENCE = " , ";
      expect(getAcceptedAudiences()).toBeUndefined();
    } finally {
      if (previous === undefined) {
        delete process.env.AUTH_JWT_AUDIENCE;
      } else {
        process.env.AUTH_JWT_AUDIENCE = previous;
      }
    }
  });
});
