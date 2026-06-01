import { beforeEach, describe, expect, mock, test } from "bun:test";

const usage = {
  used: 0,
  limit: 5,
  remaining: 5,
  totalRemaining: 5,
  unlimited: false
};

let currentUsage = usage;
let generatedOutput: unknown = {
  results: [
    {
      biomarker_id: "P-P-GLU",
      value: "5.1",
      date: "2026-06-01"
    }
  ]
};
let generationError: Error | null = null;

const getAiRequestUsageMock = mock(async () => currentUsage);
const reserveAiRequestMock = mock(async () => ({ id: "reservation_test" }));
const commitAiRequestMock = mock(async () => true);
const releaseAiRequestMock = mock(async () => true);
const generateTextMock = mock(async () => {
  if (generationError) {
    throw generationError;
  }

  return {
    output: generatedOutput
  };
});

mock.module("./billing.ts", () => ({
  getAiRequestUsage: getAiRequestUsageMock,
  reserveAiRequest: reserveAiRequestMock,
  commitAiRequest: commitAiRequestMock,
  releaseAiRequest: releaseAiRequestMock
}));

mock.module("@ai-sdk/anthropic", () => ({
  anthropic: () => "anthropic-test-model"
}));

mock.module("ai", () => ({
  generateText: generateTextMock,
  Output: {
    object: (input: unknown) => input
  }
}));

const { handleExtract } = await import("./extract.ts");

const extractRequest = () =>
  new Request("https://example.test/api/extract", {
    method: "POST",
    body: JSON.stringify({
      file: "data:image/jpeg;base64,ZmFrZQ==",
      fileName: "lab.jpg"
    })
  });

const resetMocks = () => {
  currentUsage = usage;
  generatedOutput = {
    results: [
      {
        biomarker_id: "P-P-GLU",
        value: "5.1",
        date: "2026-06-01"
      }
    ]
  };
  generationError = null;
  getAiRequestUsageMock.mockClear();
  reserveAiRequestMock.mockClear();
  commitAiRequestMock.mockClear();
  releaseAiRequestMock.mockClear();
  generateTextMock.mockClear();
};

describe("extract route billing reservations", () => {
  beforeEach(resetMocks);

  test("does not reserve a credit when extraction credits are depleted", async () => {
    currentUsage = {
      ...usage,
      remaining: 0,
      totalRemaining: 0
    };

    const response = await handleExtract(extractRequest());

    expect(response.status).toBe(429);
    expect(reserveAiRequestMock).not.toHaveBeenCalled();
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  test("releases the reservation when AI extraction fails", async () => {
    generationError = new Error("provider unavailable");

    const response = await handleExtract(extractRequest());

    expect(response.status).toBe(500);
    expect(reserveAiRequestMock).toHaveBeenCalledTimes(1);
    expect(releaseAiRequestMock).toHaveBeenCalledTimes(1);
    expect(commitAiRequestMock).not.toHaveBeenCalled();
  });

  test("commits the reservation only after valid extraction results are produced", async () => {
    const response = await handleExtract(extractRequest());

    expect(response.status).toBe(200);
    expect(reserveAiRequestMock).toHaveBeenCalledTimes(1);
    expect(commitAiRequestMock).toHaveBeenCalledTimes(1);
    expect(releaseAiRequestMock).not.toHaveBeenCalled();
  });
});
