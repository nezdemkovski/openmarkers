import { UnitSystem } from "./types";

interface Formula {
  from: string;
  to: string;
  needsMW: boolean;
  convert: (value: number, mw?: number) => number;
}

const FORMULAS: Formula[] = [
  {
    from: "mg/dL",
    to: "mmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 10) / mw!,
  },
  {
    from: "mg/dL",
    to: "µmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 10000) / mw!,
  },
  {
    from: "g/L",
    to: "mmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 1000) / mw!,
  },
  {
    from: "ng/mL",
    to: "nmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 1000) / mw!,
  },
  {
    from: "ng/dL",
    to: "nmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 10) / mw!,
  },
  {
    from: "µg/dL",
    to: "µmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 10) / mw!,
  },
  {
    from: "µg/dL",
    to: "nmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 10000) / mw!,
  },
  {
    from: "µg/mL",
    to: "µmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 1000) / mw!,
  },
  {
    from: "pg/mL",
    to: "pmol/l",
    needsMW: true,
    convert: (v, mw) => (v * 1000) / mw!,
  },
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

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeUnit(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/μ/g, "µ")
    .replace(/u(?=mol|kat|iu|g)/g, "µ");
}

const forwardMap = new Map<string, Formula>();
const reverseMap = new Map<string, Formula>();
for (const f of FORMULAS) {
  const key = `${normalizeUnit(f.from)}|${normalizeUnit(f.to)}`;
  forwardMap.set(key, f);
  reverseMap.set(`${normalizeUnit(f.to)}|${normalizeUnit(f.from)}`, f);
}

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

  const forward = forwardMap.get(key);
  if (forward) {
    if (forward.needsMW && !molecularWeight) return null;
    return round(forward.convert(value, molecularWeight ?? undefined));
  }

  const reverse = reverseMap.get(key);
  if (reverse) {
    if (reverse.needsMW && !molecularWeight) return null;
    const oneForward = reverse.convert(1, molecularWeight ?? undefined);
    if (oneForward === 0) return null;
    return round(value / oneForward);
  }

  return null;
}

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
    refMin:
      refMin != null
        ? (convert(refMin, fromUnit, toUnit, molecularWeight) ?? refMin)
        : null,
    refMax:
      refMax != null
        ? (convert(refMax, fromUnit, toUnit, molecularWeight) ?? refMax)
        : null,
  };
}

export function getDisplayUnit(
  storedUnit: string,
  conventionalUnit: string | null | undefined,
  targetSystem: UnitSystem,
): string | null {
  if (!conventionalUnit) return null;

  if (targetSystem === UnitSystem.Conventional) {
    if (normalizeUnit(storedUnit) === normalizeUnit(conventionalUnit))
      return null;
    return conventionalUnit;
  } else {
    if (normalizeUnit(storedUnit) === normalizeUnit(conventionalUnit))
      return null;
    return null;
  }
}

export function canConvert(
  fromUnit: string,
  toUnit: string,
  hasMolecularWeight: boolean = false,
): boolean {
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
