import { describe, test, expect } from "bun:test";

import {
  chronoAge,
  calculatePhenoAge,
  getMissingPhenoAgeMarkers,
} from "./bioage";
import type { Category } from "./types";

function makeCategory(
  id: string,
  biomarkers: Category["biomarkers"],
): Category {
  return { id, biomarkers };
}

function makeBio(
  id: string,
  results: { date: string; value: number }[],
  opts?: { refMin?: number; refMax?: number },
) {
  return { id, results, refMin: opts?.refMin, refMax: opts?.refMax };
}

describe("chronoAge", () => {
  test("calculates correct age", () => {
    expect(chronoAge("1990-01-15", "2024-06-01")).toBe(34);
    expect(chronoAge("1990-06-15", "2024-06-01")).toBe(33); // birthday not yet
    expect(chronoAge("1990-06-01", "2024-06-01")).toBe(34); // exact birthday
  });
});

describe("getMissingPhenoAgeMarkers", () => {
  test("returns all markers when none present", () => {
    const missing = getMissingPhenoAgeMarkers([]);
    expect(missing).toContain("S-ALB");
    expect(missing).toContain("S-CREA");
    expect(missing).toContain("P-P-GLU");
    expect(missing).toContain("B-lymf");
    expect(missing).toContain("B-MCV");
    expect(missing).toContain("B-RDW");
    expect(missing).toContain("S-ALP");
    expect(missing).toContain("B-WBC");
    expect(missing).toContain("CRP");
  });

  test("returns empty when all markers present", () => {
    const categories: Category[] = [
      makeCategory("test", [
        makeBio("S-ALB", [{ date: "2024-01-01", value: 45 }]),
        makeBio("S-CREA", [{ date: "2024-01-01", value: 80 }]),
        makeBio("P-P-GLU", [{ date: "2024-01-01", value: 5 }]),
        makeBio("B-lymf", [{ date: "2024-01-01", value: 30 }]),
        makeBio("B-MCV", [{ date: "2024-01-01", value: 90 }]),
        makeBio("B-RDW", [{ date: "2024-01-01", value: 13 }]),
        makeBio("S-ALP", [{ date: "2024-01-01", value: 0.8 }]),
        makeBio("B-WBC", [{ date: "2024-01-01", value: 6 }]),
        makeBio("S-CRP", [{ date: "2024-01-01", value: 2 }]),
      ]),
    ];
    expect(getMissingPhenoAgeMarkers(categories)).toEqual([]);
  });

  test("accepts hsCRP as alternative to CRP", () => {
    const categories: Category[] = [
      makeCategory("test", [
        makeBio("S-ALB", [{ date: "2024-01-01", value: 45 }]),
        makeBio("S-CREA", [{ date: "2024-01-01", value: 80 }]),
        makeBio("P-P-GLU", [{ date: "2024-01-01", value: 5 }]),
        makeBio("B-lymf", [{ date: "2024-01-01", value: 30 }]),
        makeBio("B-MCV", [{ date: "2024-01-01", value: 90 }]),
        makeBio("B-RDW", [{ date: "2024-01-01", value: 13 }]),
        makeBio("S-ALP", [{ date: "2024-01-01", value: 0.8 }]),
        makeBio("B-WBC", [{ date: "2024-01-01", value: 6 }]),
        makeBio("S-hsCRP", [{ date: "2024-01-01", value: 1.5 }]),
      ]),
    ];
    expect(getMissingPhenoAgeMarkers(categories)).toEqual([]);
  });
});

describe("calculatePhenoAge", () => {
  // Realistic SI values for a healthy 35-year-old male
  const healthyCategories: Category[] = [
    makeCategory("biochemistry", [
      makeBio("S-ALB", [{ date: "2024-01-01", value: 45 }]), // g/L
      makeBio("S-CREA", [{ date: "2024-01-01", value: 80 }]), // µmol/L
      makeBio("P-P-GLU", [{ date: "2024-01-01", value: 5.0 }]), // mmol/L
      makeBio("S-ALP", [{ date: "2024-01-01", value: 1.0 }]), // µkat/L
    ]),
    makeCategory("hematology", [
      makeBio("B-lymf", [{ date: "2024-01-01", value: 30 }]), // %
      makeBio("B-MCV", [{ date: "2024-01-01", value: 90 }]), // fL
      makeBio("B-RDW", [{ date: "2024-01-01", value: 13 }]), // %
      makeBio("B-WBC", [{ date: "2024-01-01", value: 6 }]), // ×10⁹/L
    ]),
    makeCategory("immunology", [
      makeBio("S-CRP", [{ date: "2024-01-01", value: 1.5 }]), // mg/L
    ]),
  ];

  test("returns results for complete data", () => {
    const results = calculatePhenoAge(healthyCategories, "1989-01-15");
    expect(results.length).toBeGreaterThan(0);
  });

  test("phenoAge is a reasonable number", () => {
    const results = calculatePhenoAge(healthyCategories, "1989-01-15");
    const latest = results[results.length - 1];
    // For healthy values, phenoAge should be in a reasonable range (not 111)
    expect(latest.phenoAge).toBeGreaterThan(20);
    expect(latest.phenoAge).toBeLessThan(60);
  });

  test("chronoAge is correct", () => {
    const results = calculatePhenoAge(healthyCategories, "1989-01-15");
    const latest = results[results.length - 1];
    expect(latest.chronoAge).toBe(34); // born 1989, test 2024-01-01
  });

  test("delta is phenoAge minus chronoAge", () => {
    const results = calculatePhenoAge(healthyCategories, "1989-01-15");
    const latest = results[results.length - 1];
    expect(latest.delta).toBeCloseTo(latest.phenoAge - latest.chronoAge, 0);
  });

  test("returns empty when missing required markers", () => {
    const incomplete: Category[] = [
      makeCategory("test", [
        makeBio("S-ALB", [{ date: "2024-01-01", value: 45 }]),
        makeBio("S-CREA", [{ date: "2024-01-01", value: 80 }]),
        // missing other required markers
      ]),
    ];
    expect(calculatePhenoAge(incomplete, "1989-01-15")).toEqual([]);
  });

  test("scores array contains all expected markers", () => {
    const results = calculatePhenoAge(healthyCategories, "1989-01-15");
    const latest = results[results.length - 1];
    const scoreIds = latest.scores.map((s) => s.id);
    expect(scoreIds).toContain("Albumin");
    expect(scoreIds).toContain("Creatinine");
    expect(scoreIds).toContain("Glucose");
    expect(scoreIds).toContain("ln(CRP)");
    expect(scoreIds).toContain("Lymphocyte");
    expect(scoreIds).toContain("MCV");
    expect(scoreIds).toContain("RDW");
    expect(scoreIds).toContain("ALP");
    expect(scoreIds).toContain("WBC");
    expect(scoreIds).toContain("Age");
  });

  test("multiple dates produce multiple results", () => {
    const multiDate: Category[] = [
      makeCategory("biochemistry", [
        makeBio("S-ALB", [
          { date: "2024-01-01", value: 45 },
          { date: "2024-06-01", value: 44 },
        ]),
        makeBio("S-CREA", [
          { date: "2024-01-01", value: 80 },
          { date: "2024-06-01", value: 85 },
        ]),
        makeBio("P-P-GLU", [
          { date: "2024-01-01", value: 5.0 },
          { date: "2024-06-01", value: 5.2 },
        ]),
        makeBio("S-ALP", [
          { date: "2024-01-01", value: 1.0 },
          { date: "2024-06-01", value: 1.1 },
        ]),
      ]),
      makeCategory("hematology", [
        makeBio("B-lymf", [
          { date: "2024-01-01", value: 30 },
          { date: "2024-06-01", value: 28 },
        ]),
        makeBio("B-MCV", [
          { date: "2024-01-01", value: 90 },
          { date: "2024-06-01", value: 91 },
        ]),
        makeBio("B-RDW", [
          { date: "2024-01-01", value: 13 },
          { date: "2024-06-01", value: 13.5 },
        ]),
        makeBio("B-WBC", [
          { date: "2024-01-01", value: 6 },
          { date: "2024-06-01", value: 6.5 },
        ]),
      ]),
      makeCategory("immunology", [
        makeBio("S-CRP", [
          { date: "2024-01-01", value: 1.5 },
          { date: "2024-06-01", value: 2.0 },
        ]),
      ]),
    ];
    const results = calculatePhenoAge(multiDate, "1989-01-15");
    expect(results.length).toBe(2);
    expect(results[0].date).toBe("2024-01-01");
    expect(results[1].date).toBe("2024-06-01");
  });
});
