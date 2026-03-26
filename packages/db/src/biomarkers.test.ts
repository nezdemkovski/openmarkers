import { describe, test, expect } from "bun:test";

import {
  getAllBiomarkers,
  getBiomarkerById,
  getBiomarkersByCategory,
  getCategoryIds,
  getValidBiomarkerIds,
  buildCompactReference,
  buildMolecularWeightMap,
  type BiomarkerDefinition,
} from "./biomarkerRegistry";
import { convert } from "./units";

const allBiomarkers = getAllBiomarkers();
const categoryIds = getCategoryIds();
const validIds = getValidBiomarkerIds();
const compactRef = buildCompactReference();
const mwMap = buildMolecularWeightMap();

describe("biomarker registry", () => {
  test("loads 140 biomarkers", () => {
    expect(allBiomarkers.length).toBe(140);
  });

  test("has 14 categories", () => {
    expect(categoryIds.length).toBe(14);
  });

  test("no duplicate IDs", () => {
    const ids = allBiomarkers.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every biomarker has an English name", () => {
    const missing = allBiomarkers.filter((b) => !b.name?.en);
    expect(missing.map((b) => b.id)).toEqual([]);
  });

  test("every biomarker belongs to a valid category", () => {
    const catSet = new Set(categoryIds);
    const bad = allBiomarkers.filter((b) => !catSet.has(b.category));
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  test("getBiomarkerById returns correct data", () => {
    const urea = getBiomarkerById("S-UREA");
    expect(urea).toBeDefined();
    expect(urea!.unit).toBe("mmol/l");
    expect(urea!.molecularWeight).toBe(60.06);
  });

  test("getBiomarkersByCategory returns correct count", () => {
    const hema = getBiomarkersByCategory("hematology");
    expect(hema.length).toBeGreaterThan(10);
  });

  test("compact reference has all biomarkers", () => {
    expect(Object.keys(compactRef).length).toBe(140);
  });

  test("molecular weight map has entries", () => {
    expect(Object.keys(mwMap).length).toBeGreaterThan(20);
    expect(mwMap["S-CHOL"]).toBe(386.65);
    expect(mwMap["P-P-GLU"]).toBe(180.16);
  });
});

describe("reference ranges", () => {
  for (const bio of allBiomarkers) {
    if (bio.refRanges?.male?.min != null && bio.refRanges?.male?.max != null) {
      test(`${bio.id}: male min (${bio.refRanges.male.min}) <= max (${bio.refRanges.male.max})`, () => {
        expect(bio.refRanges!.male!.min!).toBeLessThanOrEqual(
          bio.refRanges!.male!.max!,
        );
      });
    }
    if (
      bio.refRanges?.female?.min != null &&
      bio.refRanges?.female?.max != null
    ) {
      test(`${bio.id}: female min (${bio.refRanges.female.min}) <= max (${bio.refRanges.female.max})`, () => {
        expect(bio.refRanges!.female!.min!).toBeLessThanOrEqual(
          bio.refRanges!.female!.max!,
        );
      });
    }
  }
});

describe("unit conversions", () => {
  const withConversion = allBiomarkers.filter(
    (b) => b.conventionalUnit && b.unit,
  );

  for (const bio of withConversion) {
    test(`${bio.id}: ${bio.unit} → ${bio.conventionalUnit} round-trip`, () => {
      const testValue =
        bio.refRanges?.male?.max ?? bio.refRanges?.male?.min ?? 1;
      const forward = convert(
        testValue,
        bio.unit!,
        bio.conventionalUnit!,
        bio.molecularWeight,
      );
      expect(forward).not.toBeNull();

      const back = convert(
        forward!,
        bio.conventionalUnit!,
        bio.unit!,
        bio.molecularWeight,
      );
      expect(back).not.toBeNull();
      expect(Math.abs(back! - testValue)).toBeLessThan(testValue * 0.01 + 0.01);
    });
  }
});

describe("molecular weights present where needed", () => {
  const needsMW = allBiomarkers.filter(
    (b) =>
      b.conventionalUnit &&
      b.unit &&
      (b.unit.includes("mol") || b.conventionalUnit.includes("mol")) &&
      b.unit !== b.conventionalUnit,
  );

  for (const bio of needsMW) {
    const convNeedsMW = convert(1, bio.unit!, bio.conventionalUnit!) === null;
    if (convNeedsMW) {
      test(`${bio.id}: has molecular weight for ${bio.unit} ↔ ${bio.conventionalUnit}`, () => {
        expect(bio.molecularWeight).toBeDefined();
        expect(bio.molecularWeight!).toBeGreaterThan(0);
      });
    }
  }
});

describe("PhenoAge markers", () => {
  const phenoMarkers = allBiomarkers.filter((b) => b.phenoAge);

  test("has 10 PhenoAge markers (9 + CRP variants)", () => {
    expect(phenoMarkers.length).toBe(10);
  });

  test("all have coefficients", () => {
    for (const m of phenoMarkers) {
      expect(typeof m.phenoAge!.coefficient).toBe("number");
    }
  });
});

describe("auto-convert scenarios (US → SI)", () => {
  const testCases: { id: string; us: number; si: number; tol: number }[] = [
    { id: "P-P-GLU", us: 90, si: 5.0, tol: 0.1 },
    { id: "S-CHOL", us: 200, si: 5.17, tol: 0.1 },
    { id: "S-HDL", us: 60, si: 1.55, tol: 0.1 },
    { id: "S-LDL", us: 100, si: 2.59, tol: 0.1 },
    { id: "S-TGL", us: 150, si: 1.69, tol: 0.1 },
    { id: "S-CREA", us: 1.0, si: 88.4, tol: 1 },
    { id: "S-UREA", us: 15, si: 2.5, tol: 0.1 },
    { id: "B-HB", us: 15, si: 150, tol: 1 },
    { id: "S-ALT", us: 30, si: 0.5, tol: 0.01 },
    { id: "S-AST", us: 25, si: 0.42, tol: 0.01 },
    { id: "S-ALP", us: 70, si: 1.17, tol: 0.02 },
    { id: "S-BIL", us: 1.0, si: 17.1, tol: 0.5 },
    { id: "S-VITD", us: 40, si: 99.8, tol: 2 },
    { id: "S-Ca", us: 9.5, si: 2.37, tol: 0.05 },
    { id: "S-Fe", us: 100, si: 17.9, tol: 0.5 },
    { id: "S-TESTO", us: 500, si: 17.3, tol: 0.5 },
    { id: "S-E2", us: 30, si: 110, tol: 5 },
    { id: "S-B12", us: 400, si: 295, tol: 5 },
  ];

  for (const tc of testCases) {
    const bio = getBiomarkerById(tc.id);
    if (!bio?.conventionalUnit || !bio.unit) continue;

    test(`${tc.id}: ${tc.us} ${bio.conventionalUnit} → ~${tc.si} ${bio.unit}`, () => {
      const result = convert(
        tc.us,
        bio.conventionalUnit!,
        bio.unit!,
        bio.molecularWeight,
      );
      expect(result).not.toBeNull();
      expect(Math.abs(result! - tc.si)).toBeLessThan(tc.tol);
    });
  }
});

describe("hematocrit % ↔ l/l", () => {
  test("45% → 0.45 l/l", () => {
    expect(convert(45, "%", "l/l")).toBe(0.45);
  });
  test("0.45 l/l → 45%", () => {
    expect(convert(0.45, "l/l", "%")).toBe(45);
  });
});

describe("translations coverage", () => {
  for (const lang of ["en", "cs", "ru", "is"]) {
    const count = allBiomarkers.filter((b) => b.name[lang]).length;
    test(`${lang}: ${count}/140 names (>95%)`, () => {
      expect(count).toBeGreaterThan(133);
    });
  }
});
