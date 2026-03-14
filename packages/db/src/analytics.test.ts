import { describe, test, expect } from "bun:test";
import {
  isOutOfRange,
  analyzeTrend,
  getAllDates,
  getDateSnapshot,
  daysSinceLastTest,
  compareDates,
  getRelevantCorrelations,
} from "./analytics";
import type { Category, BiomarkerResult } from "./types";

// Helper to build test categories
function makeCategory(id: string, biomarkers: Category["biomarkers"]): Category {
  return { id, biomarkers };
}

function makeBio(
  id: string,
  results: BiomarkerResult[],
  opts?: { refMin?: number; refMax?: number; unit?: string },
): Category["biomarkers"][0] {
  return { id, results, refMin: opts?.refMin, refMax: opts?.refMax, unit: opts?.unit };
}

describe("isOutOfRange", () => {
  test("returns false for non-numeric values", () => {
    expect(isOutOfRange("pos", 0, 10)).toBe(false);
    expect(isOutOfRange(null, 0, 10)).toBe(false);
    expect(isOutOfRange(undefined, 0, 10)).toBe(false);
  });

  test("returns false when in range", () => {
    expect(isOutOfRange(5, 0, 10)).toBe(false);
    expect(isOutOfRange(0, 0, 10)).toBe(false);
    expect(isOutOfRange(10, 0, 10)).toBe(false);
  });

  test("returns true when below min", () => {
    expect(isOutOfRange(-1, 0, 10)).toBe(true);
    expect(isOutOfRange(2.7, 2.8, 8.1)).toBe(true);
  });

  test("returns true when above max", () => {
    expect(isOutOfRange(11, 0, 10)).toBe(true);
    expect(isOutOfRange(8.2, 2.8, 8.1)).toBe(true);
  });

  test("handles null min (no lower bound)", () => {
    expect(isOutOfRange(0, null, 10)).toBe(false);
    expect(isOutOfRange(-999, null, 10)).toBe(false);
    expect(isOutOfRange(11, null, 10)).toBe(true);
  });

  test("handles null max (no upper bound)", () => {
    expect(isOutOfRange(999, 0, null)).toBe(false);
    expect(isOutOfRange(-1, 0, null)).toBe(true);
  });

  test("handles both null (no bounds)", () => {
    expect(isOutOfRange(999, null, null)).toBe(false);
  });
});

describe("analyzeTrend", () => {
  test("returns null with fewer than 2 results", () => {
    expect(analyzeTrend([], 0, 10)).toBeNull();
    expect(analyzeTrend([{ date: "2024-01-01", value: 5 }], 0, 10)).toBeNull();
  });

  test("returns null with non-numeric results", () => {
    expect(
      analyzeTrend(
        [
          { date: "2024-01-01", value: "pos" },
          { date: "2024-02-01", value: "neg" },
        ],
        null,
        null,
      ),
    ).toBeNull();
  });

  test("detects upward trend", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 5 },
      { date: "2024-02-01", value: 7 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend).not.toBeNull();
    expect(trend!.direction).toBe("up");
    expect(trend!.rateChange).toBeCloseTo(40, 0);
  });

  test("detects downward trend", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 8 },
      { date: "2024-02-01", value: 5 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.direction).toBe("down");
    expect(trend!.rateChange).toBeCloseTo(-37.5, 0);
  });

  test("detects stable trend (< 1% change)", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 100 },
      { date: "2024-02-01", value: 100.5 },
    ];
    const trend = analyzeTrend(results, 80, 120);
    expect(trend!.direction).toBe("stable");
  });

  test("overall change is null with only 2 results", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 5 },
      { date: "2024-02-01", value: 7 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.overallChange).toBeNull();
  });

  test("overall change calculated with 3+ results", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 5 },
      { date: "2024-02-01", value: 6 },
      { date: "2024-03-01", value: 7 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.overallChange).toBeCloseTo(40, 0);
  });

  test("trend warning when approaching upper bound", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 8 },
      { date: "2024-02-01", value: 9.5 },
    ];
    // ref range 3-10, buffer = 1.05, so 9.5 >= 10 - 1.05 = 8.95 → warning
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.trendWarning).toBe(true);
  });

  test("no trend warning when comfortably in range", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 5 },
      { date: "2024-02-01", value: 6 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.trendWarning).toBe(false);
  });

  test("no trend warning when out of range (already flagged differently)", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 10 },
      { date: "2024-02-01", value: 12 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.trendWarning).toBe(false);
  });

  test("improving when out of range and moving toward range", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 15 },
      { date: "2024-02-01", value: 12 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.improving).toBe(true);
  });

  test("not improving when out of range and moving away", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 12 },
      { date: "2024-02-01", value: 15 },
    ];
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.improving).toBe(false);
  });

  test("improving when in range and moving toward center", () => {
    const results: BiomarkerResult[] = [
      { date: "2024-01-01", value: 4 },
      { date: "2024-02-01", value: 6 },
    ];
    // center = 6.5, 6 is closer to center than 4
    const trend = analyzeTrend(results, 3, 10);
    expect(trend!.improving).toBe(true);
  });
});

describe("getAllDates", () => {
  test("returns sorted unique dates", () => {
    const categories: Category[] = [
      makeCategory("cat1", [
        makeBio("b1", [
          { date: "2024-03-01", value: 1 },
          { date: "2024-01-01", value: 2 },
        ]),
        makeBio("b2", [
          { date: "2024-01-01", value: 3 },
          { date: "2024-02-01", value: 4 },
        ]),
      ]),
    ];
    expect(getAllDates(categories)).toEqual(["2024-01-01", "2024-02-01", "2024-03-01"]);
  });

  test("returns empty for no results", () => {
    expect(getAllDates([])).toEqual([]);
    expect(getAllDates([makeCategory("cat1", [makeBio("b1", [])])])).toEqual([]);
  });
});

describe("getDateSnapshot", () => {
  const categories: Category[] = [
    makeCategory("hematology", [
      makeBio("B-HB", [{ date: "2024-01-01", value: 150 }], { refMin: 135, refMax: 175, unit: "g/l" }),
      makeBio("B-WBC", [{ date: "2024-01-01", value: 12 }], { refMin: 4, refMax: 10, unit: "×10⁹/l" }),
    ]),
    makeCategory("biochemistry", [
      makeBio("S-GLU", [{ date: "2024-02-01", value: 5.5 }], { refMin: 3.9, refMax: 5.6, unit: "mmol/l" }),
    ]),
  ];

  test("returns snapshot items for matching date", () => {
    const items = getDateSnapshot(categories, "2024-01-01");
    expect(items).toHaveLength(2);
    expect(items[0].biomarkerId).toBe("B-HB");
    expect(items[0].value).toBe(150);
    expect(items[0].outOfRange).toBe(false);
    expect(items[1].biomarkerId).toBe("B-WBC");
    expect(items[1].value).toBe(12);
    expect(items[1].outOfRange).toBe(true);
  });

  test("returns empty for non-matching date", () => {
    expect(getDateSnapshot(categories, "2099-01-01")).toEqual([]);
  });

  test("uses per-result ref ranges when available", () => {
    const cats: Category[] = [
      makeCategory("test", [
        makeBio(
          "B-HB",
          [{ date: "2024-01-01", value: 130, refMin: 120, refMax: 160 }],
          { refMin: 135, refMax: 175 }, // biomarker-level range
        ),
      ]),
    ];
    const items = getDateSnapshot(cats, "2024-01-01");
    // 130 is in range for result-level (120-160) but out of range for biomarker-level (135-175)
    expect(items[0].outOfRange).toBe(false);
    expect(items[0].refMin).toBe(120);
    expect(items[0].refMax).toBe(160);
  });
});

describe("compareDates", () => {
  const categories: Category[] = [
    makeCategory("test", [
      makeBio(
        "B-HB",
        [
          { date: "2024-01-01", value: 150 },
          { date: "2024-06-01", value: 160 },
        ],
        { refMin: 135, refMax: 175, unit: "g/l" },
      ),
      makeBio(
        "B-WBC",
        [
          { date: "2024-01-01", value: 12 },
          { date: "2024-06-01", value: 8 },
        ],
        { refMin: 4, refMax: 10, unit: "×10⁹/l" },
      ),
    ]),
  ];

  test("computes correct deltas", () => {
    const rows = compareDates(categories, "2024-01-01", "2024-06-01");
    expect(rows).toHaveLength(2);

    const hb = rows.find((r) => r.biomarkerId === "B-HB")!;
    expect(hb.v1).toBe(150);
    expect(hb.v2).toBe(160);
    expect(hb.delta).toBe(10);
    expect(hb.deltaPct).toBeCloseTo(6.67, 0);

    const wbc = rows.find((r) => r.biomarkerId === "B-WBC")!;
    expect(wbc.delta).toBe(-4);
  });

  test("correct out-of-range flags", () => {
    const rows = compareDates(categories, "2024-01-01", "2024-06-01");
    const hb = rows.find((r) => r.biomarkerId === "B-HB")!;
    expect(hb.out1).toBe(false); // 150 in 135-175
    expect(hb.out2).toBe(false); // 160 in 135-175

    const wbc = rows.find((r) => r.biomarkerId === "B-WBC")!;
    expect(wbc.out1).toBe(true); // 12 > 10
    expect(wbc.out2).toBe(false); // 8 in 4-10
  });

  test("handles missing results on one date", () => {
    const cats: Category[] = [
      makeCategory("test", [makeBio("B-HB", [{ date: "2024-01-01", value: 150 }], { refMin: 135, refMax: 175 })]),
    ];
    const rows = compareDates(cats, "2024-01-01", "2024-06-01");
    expect(rows).toHaveLength(1);
    expect(rows[0].v1).toBe(150);
    expect(rows[0].v2).toBeNull();
    expect(rows[0].delta).toBeNull();
  });

  test("uses per-result ref ranges for out-of-range", () => {
    const cats: Category[] = [
      makeCategory("test", [
        makeBio(
          "B-HB",
          [
            { date: "2024-01-01", value: 130, refMin: 120, refMax: 160 },
            { date: "2024-06-01", value: 130 },
          ],
          { refMin: 135, refMax: 175 },
        ),
      ]),
    ];
    const rows = compareDates(cats, "2024-01-01", "2024-06-01");
    // date1: 130 vs result-level 120-160 → in range
    expect(rows[0].out1).toBe(false);
    // date2: 130 vs biomarker-level 135-175 → out of range (below 135)
    expect(rows[0].out2).toBe(true);
  });
});

describe("daysSinceLastTest", () => {
  test("returns days since most recent result per category", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
    const categories: Category[] = [makeCategory("cat1", [makeBio("b1", [{ date: yesterday, value: 1 }])])];
    const result = daysSinceLastTest(categories);
    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("cat1");
    expect(result[0].days).toBe(1);
    expect(result[0].lastDate).toBe(yesterday);
  });

  test("returns null days for category with no results", () => {
    const categories: Category[] = [makeCategory("cat1", [makeBio("b1", [])])];
    const result = daysSinceLastTest(categories);
    expect(result[0].days).toBeNull();
    expect(result[0].lastDate).toBeNull();
  });
});

describe("getRelevantCorrelations", () => {
  test("returns groups with at least 2 matched biomarkers", () => {
    const categories: Category[] = [
      makeCategory("test", [
        makeBio("S-CHOL", [{ date: "2024-01-01", value: 5 }]),
        makeBio("S-HDL", [{ date: "2024-01-01", value: 1.5 }]),
        makeBio("S-LDL", [{ date: "2024-01-01", value: 3 }]),
      ]),
    ];
    const groups = getRelevantCorrelations(categories);
    const lipid = groups.find((g) => g.id === "lipid_panel");
    expect(lipid).toBeDefined();
    expect(lipid!.matched).toContain("S-CHOL");
    expect(lipid!.matched).toContain("S-HDL");
    expect(lipid!.matched).toContain("S-LDL");
  });

  test("excludes groups with fewer than 2 matches", () => {
    const categories: Category[] = [makeCategory("test", [makeBio("S-CHOL", [{ date: "2024-01-01", value: 5 }])])];
    const groups = getRelevantCorrelations(categories);
    expect(groups.find((g) => g.id === "lipid_panel")).toBeUndefined();
  });

  test("returns empty for no data", () => {
    expect(getRelevantCorrelations([])).toEqual([]);
  });
});
