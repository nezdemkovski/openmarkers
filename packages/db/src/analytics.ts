import type {
  BiomarkerResult,
  Category,
  TrendResult,
  SnapshotItem,
  ComparisonRow,
  CorrelationGroup,
  MatchedCorrelationGroup,
  DaysSinceResult,
} from "./types";

export function isOutOfRange(
  value: number | string | null | undefined,
  refMin: number | null | undefined,
  refMax: number | null | undefined,
): boolean {
  if (typeof value !== "number") return false;
  if (refMin != null && value < refMin) return true;
  if (refMax != null && value > refMax) return true;
  return false;
}

export function analyzeTrend(
  results: BiomarkerResult[],
  refMin: number | null | undefined,
  refMax: number | null | undefined,
): TrendResult | null {
  const numeric = results.filter((r): r is BiomarkerResult & { value: number } => typeof r.value === "number");
  if (numeric.length < 2) return null;

  const first = numeric[0].value;
  const prev = numeric[numeric.length - 2].value;
  const latest = numeric[numeric.length - 1].value;
  const rateChange = prev !== 0 ? ((latest - prev) / Math.abs(prev)) * 100 : 0;
  const overallChange = first !== 0 ? ((latest - first) / Math.abs(first)) * 100 : 0;
  const direction: TrendResult["direction"] = Math.abs(rateChange) < 1 ? "stable" : rateChange > 0 ? "up" : "down";

  const inRange = !isOutOfRange(latest, refMin, refMax);

  let trendWarning = false;
  if (inRange && direction !== "stable") {
    if (refMin != null && refMax != null) {
      const range = refMax - refMin;
      const buffer = range * 0.15;
      if (direction === "down" && latest <= refMin + buffer) trendWarning = true;
      if (direction === "up" && latest >= refMax - buffer) trendWarning = true;
    } else if (refMax != null) {
      const buffer = refMax * 0.15;
      if (direction === "up" && latest >= refMax - buffer) trendWarning = true;
    } else if (refMin != null) {
      const buffer = refMin * 0.15;
      if (direction === "down" && latest <= refMin + buffer) trendWarning = true;
    }
  }

  let improving: boolean | null = null;
  if (isOutOfRange(latest, refMin, refMax)) {
    if (refMin != null && latest < refMin) improving = direction === "up";
    else if (refMax != null && latest > refMax) improving = direction === "down";
  } else if (refMin != null && refMax != null) {
    const center = (refMin + refMax) / 2;
    const prevDist = Math.abs(prev - center);
    const latestDist = Math.abs(latest - center);
    improving = latestDist < prevDist;
  }

  const hasOverall = numeric.length > 2;
  return { direction, rateChange, overallChange: hasOverall ? overallChange : null, trendWarning, improving };
}

export function personalBaseline(): null {
  return null;
}

export const CORRELATION_GROUPS: CorrelationGroup[] = [
  {
    id: "iron_panel",
    biomarkers: [
      "S-Fe",
      "S-Feritin",
      "S-Transferin",
      "S-TransSat",
      "S-TransRec",
      "S-UIBC",
      "S-TIBC",
      "B-HB",
      "B-MCV",
      "B-MCH",
    ],
  },
  { id: "lipid_panel", biomarkers: ["S-CHOL", "S-HDL", "S-LDL", "S-TGL", "S-nHDL"] },
  { id: "liver_panel", biomarkers: ["S-ALT", "S-AST", "S-GGT", "S-ALP", "S-BIL", "S-FIB4"] },
  { id: "thyroid_panel", biomarkers: ["S-TSH", "S-fT4", "S-aTPO", "S-aTG", "S-aTSH"] },
  { id: "kidney_panel", biomarkers: ["S-UREA", "S-CREA", "S-CKDEPI", "MDRD-UreaAlb"] },
];

export function getAllDates(categories: Category[]): string[] {
  const dates = new Set<string>();
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      for (const r of bio.results) dates.add(r.date);
    }
  }
  return [...dates].sort();
}

export function getDateSnapshot(categories: Category[], date: string): SnapshotItem[] {
  const items: SnapshotItem[] = [];
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      const result = bio.results.find((r) => r.date === date);
      if (result) {
        items.push({
          categoryId: cat.id,
          biomarkerId: bio.id,
          unit: bio.unit,
          refMin: bio.refMin,
          refMax: bio.refMax,
          value: result.value,
          outOfRange: isOutOfRange(result.value, bio.refMin, bio.refMax),
        });
      }
    }
  }
  return items;
}

export function daysSinceLastTest(categories: Category[]): DaysSinceResult[] {
  const now = new Date();
  return categories.map((cat) => {
    let latest: string | null = null;
    for (const bio of cat.biomarkers) {
      for (const r of bio.results) {
        if (!latest || r.date > latest) latest = r.date;
      }
    }
    if (!latest) return { categoryId: cat.id, days: null, lastDate: null };
    const days = Math.floor((now.getTime() - new Date(latest).getTime()) / 86400000);
    return { categoryId: cat.id, days, lastDate: latest };
  });
}

export function compareDates(categories: Category[], date1: string, date2: string): ComparisonRow[] {
  const rows: ComparisonRow[] = [];
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      const r1 = bio.results.find((r) => r.date === date1);
      const r2 = bio.results.find((r) => r.date === date2);
      if (!r1 && !r2) continue;
      const v1 = r1?.value ?? null;
      const v2 = r2?.value ?? null;
      let delta: number | null = null;
      let deltaPct: number | null = null;
      if (typeof v1 === "number" && typeof v2 === "number") {
        delta = v2 - v1;
        deltaPct = v1 !== 0 ? (delta / Math.abs(v1)) * 100 : null;
      }
      rows.push({
        categoryId: cat.id,
        biomarkerId: bio.id,
        unit: bio.unit,
        refMin: bio.refMin,
        refMax: bio.refMax,
        v1,
        v2,
        delta,
        deltaPct,
        out1: isOutOfRange(v1, bio.refMin, bio.refMax),
        out2: isOutOfRange(v2, bio.refMin, bio.refMax),
      });
    }
  }
  return rows;
}

export function getRelevantCorrelations(categories: Category[]): MatchedCorrelationGroup[] {
  const allBioIds = new Set<string>();
  for (const cat of categories) {
    for (const bio of cat.biomarkers) allBioIds.add(bio.id);
  }
  return CORRELATION_GROUPS.map((g) => ({
    ...g,
    matched: g.biomarkers.filter((id) => allBioIds.has(id)),
  })).filter((g) => g.matched.length >= 2);
}
