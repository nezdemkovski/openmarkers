import { isOutOfRange, analyzeTrend, daysSinceLastTest, getRelevantCorrelations } from "./analytics";
import { calculatePhenoAge, getMissingPhenoAgeMarkers } from "./bioage";
import type { UserData } from "./types";

/**
 * Enrich UserData with computed fields (trends, outOfRange, daysSince, correlations, biologicalAge).
 * Pure function — no DB access. Can be used client-side for demo data.
 */
export function enrichUserData(data: UserData): UserData {
  for (const cat of data.categories) {
    for (const bio of cat.biomarkers) {
      for (const r of bio.results) {
        const effectiveMin = r.refMin ?? bio.refMin;
        const effectiveMax = r.refMax ?? bio.refMax;
        r.outOfRange = isOutOfRange(r.value, effectiveMin, effectiveMax);
      }
      bio.trend = analyzeTrend(bio.results, bio.refMin, bio.refMax);
      const latest = bio.results[bio.results.length - 1];
      bio.latestOutOfRange = latest?.outOfRange ?? false;
    }
  }
  data.daysSince = daysSinceLastTest(data.categories);
  data.correlations = getRelevantCorrelations(data.categories);
  const hasDob = data.user.dateOfBirth && !isNaN(new Date(data.user.dateOfBirth).getTime());
  data.biologicalAge = {
    results: hasDob ? calculatePhenoAge(data.categories, data.user.dateOfBirth) : [],
    missingMarkers: getMissingPhenoAgeMarkers(data.categories),
  };
  return data;
}
