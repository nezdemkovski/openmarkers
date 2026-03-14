import { describe, test, expect } from "bun:test";
import { convert, convertRange, canConvert, getDisplayUnit } from "./units";
import { UnitSystem } from "./types";

describe("convert", () => {
  describe("same unit → no conversion", () => {
    test("returns value unchanged", () => {
      expect(convert(5.5, "mmol/l", "mmol/l")).toBe(5.5);
      expect(convert(100, "mg/dL", "mg/dL")).toBe(100);
    });
  });

  describe("fixed-factor conversions (no MW needed)", () => {
    test("µkat/l → U/L (×60)", () => {
      expect(convert(0.5, "µkat/l", "U/L")).toBe(30);
      expect(convert(1, "µkat/l", "U/L")).toBe(60);
    });

    test("U/L → µkat/l (÷60)", () => {
      expect(convert(60, "U/L", "µkat/l")).toBe(1);
      expect(convert(30, "U/L", "µkat/l")).toBe(0.5);
    });

    test("g/l → g/dL (÷10)", () => {
      expect(convert(150, "g/l", "g/dL")).toBe(15);
      expect(convert(35, "g/l", "g/dL")).toBe(3.5);
    });

    test("g/dL → g/l (×10)", () => {
      expect(convert(15, "g/dL", "g/l")).toBe(150);
    });

    test("mg/l → mg/dL (÷10)", () => {
      expect(convert(5, "mg/l", "mg/dL")).toBe(0.5);
    });

    test("mg/dL → mg/l (×10)", () => {
      expect(convert(0.5, "mg/dL", "mg/l")).toBe(5);
    });

    test("IU/l → µkat/l (÷60)", () => {
      expect(convert(60, "IU/l", "µkat/l")).toBe(1);
    });
  });

  describe("MW-dependent conversions", () => {
    // Glucose: MW 180.16
    test("glucose mmol/l → mg/dL", () => {
      const result = convert(5.5, "mmol/l", "mg/dL", 180.16);
      expect(result).toBeCloseTo(99.09, 1);
    });

    test("glucose mg/dL → mmol/l", () => {
      const result = convert(100, "mg/dL", "mmol/l", 180.16);
      expect(result).toBeCloseTo(5.55, 1);
    });

    // Creatinine: MW 113.12
    test("creatinine µmol/l → mg/dL", () => {
      const result = convert(88.4, "µmol/l", "mg/dL", 113.12);
      expect(result).toBeCloseTo(1.0, 0);
    });

    test("creatinine mg/dL → µmol/l", () => {
      const result = convert(1.0, "mg/dL", "µmol/l", 113.12);
      expect(result).toBeCloseTo(88.4, 0);
    });

    // Iron: MW 55.845
    test("iron µmol/l → µg/dL", () => {
      const result = convert(20, "µmol/l", "µg/dL", 55.845);
      expect(result).toBeCloseTo(111.69, 0);
    });

    test("iron µg/dL → µmol/l", () => {
      const result = convert(100, "µg/dL", "µmol/l", 55.845);
      expect(result).toBeCloseTo(17.91, 0);
    });

    // Cholesterol: MW 386.65
    test("cholesterol mmol/l → mg/dL", () => {
      const result = convert(5.0, "mmol/l", "mg/dL", 386.65);
      expect(result).toBeCloseTo(193.33, 0);
    });

    // Testosterone: MW 288.42
    test("testosterone nmol/l → ng/dL", () => {
      const result = convert(20, "nmol/l", "ng/dL", 288.42);
      expect(result).toBeCloseTo(576.84, 0);
    });

    test("testosterone ng/dL → nmol/l", () => {
      const result = convert(500, "ng/dL", "nmol/l", 288.42);
      expect(result).toBeCloseTo(17.34, 0);
    });

    // Vitamin D: MW 400.64, nmol/l → ng/mL
    test("vitamin D nmol/l → ng/mL", () => {
      const result = convert(75, "nmol/l", "ng/mL", 400.64);
      expect(result).toBeCloseTo(30.05, 0);
    });

    test("vitamin D ng/mL → nmol/l", () => {
      const result = convert(30, "ng/mL", "nmol/l", 400.64);
      expect(result).toBeCloseTo(74.88, 0);
    });

    // Cortisol: MW 362.46, nmol/l → µg/dL
    test("cortisol nmol/l → µg/dL", () => {
      const result = convert(500, "nmol/l", "µg/dL", 362.46);
      expect(result).toBeCloseTo(18.12, 0);
    });

    // Estradiol: MW 272.38, pmol/l → pg/mL
    test("estradiol pmol/l → pg/mL", () => {
      const result = convert(200, "pmol/l", "pg/mL", 272.38);
      expect(result).toBeCloseTo(54.49, 0);
    });

    // B12: MW 1355.37, pmol/l → pg/mL
    test("B12 pmol/l → pg/mL", () => {
      const result = convert(300, "pmol/l", "pg/mL", 1355.37);
      expect(result).toBeCloseTo(406.61, 0);
    });
  });

  describe("returns null when conversion not possible", () => {
    test("MW-dependent without MW", () => {
      expect(convert(5, "mmol/l", "mg/dL")).toBeNull();
      expect(convert(5, "mmol/l", "mg/dL", null)).toBeNull();
    });

    test("unknown unit pair", () => {
      expect(convert(5, "mmol/l", "bananas")).toBeNull();
      expect(convert(5, "foo", "bar")).toBeNull();
    });
  });

  describe("rounding", () => {
    test("rounds to 2 decimal places", () => {
      const result = convert(7.1, "mmol/l", "mg/dL", 386.65);
      // 7.1 * 386.65 / 10 = 274.5215 → 274.52
      expect(result).toBe(274.52);
    });
  });

  describe("unicode normalization", () => {
    test("handles Greek mu (μ) same as micro sign (µ)", () => {
      // μmol/l with Greek mu should work same as µmol/l
      expect(convert(88.4, "μmol/l", "mg/dL", 113.12)).toBeCloseTo(1.0, 0);
    });

    test("handles ASCII u as µ prefix", () => {
      expect(convert(1, "ukat/l", "U/L")).toBe(60);
      expect(convert(88.4, "umol/l", "mg/dL", 113.12)).toBeCloseTo(1.0, 0);
    });
  });
});

describe("convertRange", () => {
  test("converts both min and max", () => {
    const result = convertRange(3.9, 6.1, "mmol/l", "mg/dL", 180.16);
    expect(result.refMin).toBeCloseTo(70.2, 0);
    expect(result.refMax).toBeCloseTo(109.9, 0);
  });

  test("handles null min", () => {
    const result = convertRange(null, 5.7, "mmol/l", "mg/dL", 180.16);
    expect(result.refMin).toBeNull();
    expect(result.refMax).toBeCloseTo(102.69, 0);
  });

  test("handles null max", () => {
    const result = convertRange(3.9, null, "mmol/l", "mg/dL", 180.16);
    expect(result.refMin).toBeCloseTo(70.2, 0);
    expect(result.refMax).toBeNull();
  });

  test("same unit returns originals", () => {
    const result = convertRange(3.9, 6.1, "mmol/l", "mmol/l");
    expect(result.refMin).toBe(3.9);
    expect(result.refMax).toBe(6.1);
  });
});

describe("canConvert", () => {
  test("same unit always true", () => {
    expect(canConvert("mmol/l", "mmol/l")).toBe(true);
  });

  test("fixed-factor works without MW", () => {
    expect(canConvert("µkat/l", "U/L")).toBe(true);
    expect(canConvert("g/l", "g/dL")).toBe(true);
  });

  test("MW-dependent needs MW flag", () => {
    expect(canConvert("mmol/l", "mg/dL", false)).toBe(false);
    expect(canConvert("mmol/l", "mg/dL", true)).toBe(true);
  });

  test("unknown pair returns false", () => {
    expect(canConvert("mmol/l", "bananas")).toBe(false);
  });
});

describe("getDisplayUnit", () => {
  test("conventional mode returns conventionalUnit when different from stored", () => {
    expect(getDisplayUnit("µkat/l", "U/L", UnitSystem.Conventional)).toBe("U/L");
    expect(getDisplayUnit("mmol/l", "mg/dL", UnitSystem.Conventional)).toBe("mg/dL");
    expect(getDisplayUnit("µmol/l", "µg/dL", UnitSystem.Conventional)).toBe("µg/dL");
    expect(getDisplayUnit("nmol/l", "ng/mL", UnitSystem.Conventional)).toBe("ng/mL");
  });

  test("conventional mode returns null when no conventionalUnit defined", () => {
    expect(getDisplayUnit("%", null, UnitSystem.Conventional)).toBeNull();
    expect(getDisplayUnit("fl", undefined, UnitSystem.Conventional)).toBeNull();
    expect(getDisplayUnit("nmol/l", null, UnitSystem.Conventional)).toBeNull();
  });

  test("conventional mode returns null when stored is already conventional", () => {
    expect(getDisplayUnit("mg/dL", "mg/dL", UnitSystem.Conventional)).toBeNull();
    expect(getDisplayUnit("ng/mL", "ng/mL", UnitSystem.Conventional)).toBeNull();
  });

  test("SI mode always returns null (stored unit is already SI)", () => {
    expect(getDisplayUnit("mmol/l", "mg/dL", UnitSystem.SI)).toBeNull();
    expect(getDisplayUnit("µkat/l", "U/L", UnitSystem.SI)).toBeNull();
    expect(getDisplayUnit("%", null, UnitSystem.SI)).toBeNull();
  });
});
