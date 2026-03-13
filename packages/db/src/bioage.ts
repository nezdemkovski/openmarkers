import type { Category, PhenoAgeResult, PhenoAgeScore } from "./types";

const REQUIRED_IDS = ["S-ALB", "S-CREA", "P-P-GLU", "B-lymf", "B-MCV", "B-RDW", "S-ALP", "B-WBC"];
const CRP_IDS = ["S-hsCRP", "S-CRP"];

const SCORE_META: Record<string, { label: string; unit: string }> = {
  "S-ALB": { label: "Albumin", unit: "g/L" },
  "S-CREA": { label: "Creatinine", unit: "µmol/L" },
  "P-P-GLU": { label: "Glucose", unit: "mmol/L" },
  CRP: { label: "ln(CRP)", unit: "mg/L→ln" },
  "B-lymf": { label: "Lymphocyte", unit: "%" },
  "B-MCV": { label: "MCV", unit: "fL" },
  "B-RDW": { label: "RDW", unit: "%" },
  "S-ALP": { label: "ALP", unit: "µkat/L" },
  "B-WBC": { label: "WBC", unit: "×10⁹/L" },
};

const COEFFICIENTS: Record<string, number> = {
  "S-ALB": -0.0336,
  "S-CREA": 0.0095,
  "P-P-GLU": 0.1953,
  CRP: 0.0954,
  "B-lymf": -0.012,
  "B-MCV": 0.0268,
  "B-RDW": 0.3306,
  "S-ALP": 0.00188,
  "B-WBC": 0.0554,
};

const ALP_TO_UL = 60;
const CRP_TO_MGDL = 0.1;

const INTERCEPT = -19.9067;
const AGE_COEFF = 0.0804;

const GAMMA = 0.0076927;
const GOMPERTZ_MULT = (Math.exp(120 * GAMMA) - 1) / GAMMA;

export function chronoAge(dateOfBirth: string, testDate: string): number {
  const dob = new Date(dateOfBirth);
  const test = new Date(testDate);
  let age = test.getFullYear() - dob.getFullYear();
  const m = test.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && test.getDate() < dob.getDate())) age--;
  return age;
}

export function getMissingPhenoAgeMarkers(categories: Category[]): string[] {
  const available = new Set<string>();
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      if (bio.results.length > 0) available.add(bio.id);
    }
  }
  const missing: string[] = [];
  for (const id of REQUIRED_IDS) {
    if (!available.has(id)) missing.push(id);
  }
  if (!CRP_IDS.some((id) => available.has(id))) missing.push("CRP");
  return missing;
}

export function calculatePhenoAge(categories: Category[], dateOfBirth: string): PhenoAgeResult[] {
  const bioEntries = new Map<string, { date: string; value: number }[]>();
  const bioRefs = new Map<string, { refMin?: number; refMax?: number }>();
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      if (!REQUIRED_IDS.includes(bio.id) && !CRP_IDS.includes(bio.id)) continue;
      const entries: { date: string; value: number }[] = [];
      for (const r of bio.results) {
        if (typeof r.value === "number") entries.push({ date: r.date, value: r.value });
      }
      entries.sort((a, b) => a.date.localeCompare(b.date));
      bioEntries.set(bio.id, entries);
      bioRefs.set(bio.id, {
        refMin: bio.refMin ?? undefined,
        refMax: bio.refMax ?? undefined,
      });
    }
  }

  function latestBefore(id: string, date: string): { value: number; date: string } | undefined {
    const entries = bioEntries.get(id);
    if (!entries) return undefined;
    let result: { value: number; date: string } | undefined;
    for (const e of entries) {
      if (e.date > date) break;
      result = e;
    }
    return result;
  }

  const allDates = new Set<string>();
  for (const entries of bioEntries.values()) {
    for (const e of entries) allDates.add(e.date);
  }

  const results: PhenoAgeResult[] = [];

  for (const date of allDates) {
    const vals: Record<string, number> = {};
    const valDates: Record<string, string> = {};
    let missing = false;

    for (const id of REQUIRED_IDS) {
      const hit = latestBefore(id, date);
      if (hit == null) {
        missing = true;
        break;
      }
      vals[id] = hit.value;
      valDates[id] = hit.date;
    }
    if (missing) continue;

    const rawVals = { ...vals };

    vals["S-ALP"] *= ALP_TO_UL;

    let crpRaw: number | undefined;
    let crpDate: string | undefined;
    let crpBioId: string | undefined;
    for (const id of CRP_IDS) {
      const hit = latestBefore(id, date);
      if (hit != null) {
        crpRaw = hit.value;
        crpDate = hit.date;
        crpBioId = id;
        break;
      }
    }
    if (crpRaw == null) continue;

    const lnCRP = Math.log(Math.max(crpRaw * CRP_TO_MGDL, 0.001));

    let xb = INTERCEPT;
    const scores: PhenoAgeScore[] = [];
    for (const [id, coeff] of Object.entries(COEFFICIENTS)) {
      const converted = id === "CRP" ? lnCRP : vals[id];
      const score = coeff * converted;
      xb += score;
      const meta = SCORE_META[id];
      const refBioId = id === "CRP" ? crpBioId! : id;
      const refs = bioRefs.get(refBioId);
      scores.push({
        id: meta.label,
        value: id === "CRP" ? crpRaw! : rawVals[id],
        unit: meta.unit,
        score: Math.round(score * 100) / 100,
        date: id === "CRP" ? crpDate! : valDates[id],
        refMin: refs?.refMin,
        refMax: refs?.refMax,
      });
    }
    const age = chronoAge(dateOfBirth, date);
    xb += AGE_COEFF * age;
    scores.push({ id: "Age", value: age, unit: "yrs", score: Math.round(AGE_COEFF * age * 100) / 100, date });

    let M = 1 - Math.exp(-Math.exp(xb) * GOMPERTZ_MULT);
    M = Math.min(M, 0.99999);

    const phenoAge = 141.50225 + Math.log(-0.00553 * Math.log(1 - M)) / 0.090165;

    const dnamAge = phenoAge / (1 + 1.28047 * Math.exp(0.0344329 * (phenoAge - 182.344)));

    const dnamInner = Math.exp((dnamAge - 141.50225) * 0.090165);
    const dnamM = 1 - Math.exp(dnamInner / -0.00553);

    results.push({
      date,
      phenoAge: Math.round(phenoAge * 10) / 10,
      chronoAge: age,
      delta: Math.round((phenoAge - age) * 10) / 10,
      mortalityScore: Math.round(M * 1000) / 10,
      dnamAge: Math.round(dnamAge * 10) / 10,
      dnamMortality: Math.round(dnamM * 1000) / 10,
      xb: Math.round(xb * 10000) / 10000,
      scores,
    });
  }

  results.sort((a, b) => a.date.localeCompare(b.date));
  return results;
}
