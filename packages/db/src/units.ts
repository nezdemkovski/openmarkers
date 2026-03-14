/**
 * Generic unit conversion module for biomarker values.
 *
 * Conversions fall into two categories:
 * 1. MW-dependent (mass ↔ molar): require the biomarker's molecular weight
 * 2. Fixed-factor (e.g., U/L ↔ µkat/l): no MW needed
 *
 * All formulas are bidirectional — if A→B exists, B→A is computed as the inverse.
 */

interface Formula {
  from: string;
  to: string;
  needsMW: boolean;
  convert: (value: number, mw?: number) => number;
}

const FORMULAS: Formula[] = [
  // Mass ↔ Molar (require MW)
  { from: "mg/dL", to: "mmol/l", needsMW: true, convert: (v, mw) => (v * 10) / mw! },
  { from: "mg/dL", to: "µmol/l", needsMW: true, convert: (v, mw) => (v * 10000) / mw! },
  { from: "g/L", to: "mmol/l", needsMW: true, convert: (v, mw) => (v * 1000) / mw! },
  { from: "ng/mL", to: "nmol/l", needsMW: true, convert: (v, mw) => (v * 1000) / mw! },
  { from: "ng/dL", to: "nmol/l", needsMW: true, convert: (v, mw) => (v * 10) / mw! },
  { from: "µg/dL", to: "µmol/l", needsMW: true, convert: (v, mw) => (v * 10) / mw! },
  { from: "µg/mL", to: "µmol/l", needsMW: true, convert: (v, mw) => (v * 1000) / mw! },
  { from: "pg/mL", to: "pmol/l", needsMW: true, convert: (v, mw) => (v * 1000) / mw! },

  // Fixed-factor conversions (no MW needed)
  { from: "U/L", to: "µkat/l", needsMW: false, convert: (v) => v / 60 },
  { from: "IU/l", to: "µkat/l", needsMW: false, convert: (v) => v / 60 },
  { from: "g/L", to: "g/dL", needsMW: false, convert: (v) => v / 10 },
  { from: "g/L", to: "mg/dL", needsMW: false, convert: (v) => v * 100 },
  { from: "mg/L", to: "mg/dL", needsMW: false, convert: (v) => v / 10 },
  { from: "µg/L", to: "ng/mL", needsMW: false, convert: (v) => v },
  { from: "ng/L", to: "pg/mL", needsMW: false, convert: (v) => v },
  { from: "mmol/l", to: "µmol/l", needsMW: false, convert: (v) => v * 1000 },
  { from: "µmol/l", to: "nmol/l", needsMW: false, convert: (v) => v * 1000 },
  { from: "nmol/l", to: "pmol/l", needsMW: false, convert: (v) => v * 1000 },
];

/** Round to 2 decimal places, dropping trailing zeros */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, "");
}

// Build lookup maps for fast access
const forwardMap = new Map<string, Formula>();
const reverseMap = new Map<string, Formula>();
for (const f of FORMULAS) {
  const key = `${normalizeUnit(f.from)}|${normalizeUnit(f.to)}`;
  forwardMap.set(key, f);
  reverseMap.set(`${normalizeUnit(f.to)}|${normalizeUnit(f.from)}`, f);
}

/**
 * Convert a value between units.
 * Returns null if no conversion formula exists or if MW is required but not provided.
 */
export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  molecularWeight?: number | null,
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return value;

  const key = `${from}|${to}`;

  // Try forward lookup
  const forward = forwardMap.get(key);
  if (forward) {
    if (forward.needsMW && !molecularWeight) return null;
    return round(forward.convert(value, molecularWeight ?? undefined));
  }

  // Try reverse lookup (compute inverse)
  const reverse = reverseMap.get(key);
  if (reverse) {
    if (reverse.needsMW && !molecularWeight) return null;
    // Compute the inverse: convert 1 unit forward, then divide
    const oneForward = reverse.convert(1, molecularWeight ?? undefined);
    if (oneForward === 0) return null;
    return round(value / oneForward);
  }

  return null;
}

/**
 * Convert a reference range between units.
 * If conversion fails, returns the original values unchanged.
 */
export function convertRange(
  refMin: number | null | undefined,
  refMax: number | null | undefined,
  fromUnit: string,
  toUnit: string,
  molecularWeight?: number | null,
): { refMin: number | null; refMax: number | null } {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) {
    return { refMin: refMin ?? null, refMax: refMax ?? null };
  }

  return {
    refMin: refMin != null ? (convert(refMin, fromUnit, toUnit, molecularWeight) ?? refMin) : null,
    refMax: refMax != null ? (convert(refMax, fromUnit, toUnit, molecularWeight) ?? refMax) : null,
  };
}

export type UnitSystem = "si" | "conventional";

/**
 * Pairs mapping SI ↔ Conventional units.
 * Used to find the target unit when switching systems.
 */
const SYSTEM_PAIRS: { si: string; conventional: string }[] = [
  { si: "mmol/l", conventional: "mg/dL" },
  { si: "µmol/l", conventional: "mg/dL" },
  { si: "µkat/l", conventional: "U/L" },
  { si: "g/l", conventional: "g/dL" },
  { si: "mg/l", conventional: "mg/dL" },
  { si: "nmol/l", conventional: "ng/dL" },
  { si: "pmol/l", conventional: "pg/mL" },
  { si: "µmol/l", conventional: "µg/dL" },
];

// Lookup sets for quick classification
const SI_UNIT_SET = new Set(SYSTEM_PAIRS.map((p) => normalizeUnit(p.si)));
const CONV_UNIT_SET = new Set(SYSTEM_PAIRS.map((p) => normalizeUnit(p.conventional)));

/**
 * Given a unit, return its counterpart in the target system.
 * Returns null if already in the target system or no mapping exists.
 */
export function getTargetUnit(currentUnit: string, targetSystem: UnitSystem): string | null {
  const norm = normalizeUnit(currentUnit);

  if (targetSystem === "conventional") {
    if (CONV_UNIT_SET.has(norm)) return null; // already conventional
    const pair = SYSTEM_PAIRS.find((p) => normalizeUnit(p.si) === norm);
    return pair?.conventional ?? null;
  } else {
    if (SI_UNIT_SET.has(norm)) return null; // already SI
    const pair = SYSTEM_PAIRS.find((p) => normalizeUnit(p.conventional) === norm);
    return pair?.si ?? null;
  }
}

/**
 * Check if a conversion between two units is possible.
 */
export function canConvert(fromUnit: string, toUnit: string, hasMolecularWeight: boolean = false): boolean {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (from === to) return true;

  const key = `${from}|${to}`;
  const forward = forwardMap.get(key);
  if (forward) return !forward.needsMW || hasMolecularWeight;

  const reverse = reverseMap.get(key);
  if (reverse) return !reverse.needsMW || hasMolecularWeight;

  return false;
}
