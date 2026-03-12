import { getProfileData } from "./index";
import {
  getAllDates,
  getDateSnapshot,
  daysSinceLastTest,
  compareDates,
  getRelevantCorrelations,
  analyzeTrend,
} from "./analytics";
import { calculatePhenoAge } from "./bioage";
import { buildPrompt } from "./promptBuilder";
import { makeI18n } from "./i18n";
import type {
  BiomarkerTrend,
  SnapshotItem,
  DaysSinceResult,
  ComparisonRow,
  MatchedCorrelationGroup,
  PhenoAgeResult,
  Lang,
} from "./types";

export async function getTimelineForProfile(profileId: number, authUserId: string): Promise<string[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  return getAllDates(data.categories);
}

export async function getSnapshotForProfile(
  profileId: number,
  authUserId: string,
  date: string,
): Promise<SnapshotItem[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  return getDateSnapshot(data.categories, date);
}

export async function getTrendsForProfile(
  profileId: number,
  authUserId: string,
  opts?: { biomarker_id?: string; category_id?: string },
): Promise<BiomarkerTrend[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;

  const trends: BiomarkerTrend[] = [];
  for (const cat of data.categories) {
    if (opts?.category_id && cat.id !== opts.category_id) continue;
    for (const bio of cat.biomarkers) {
      if (opts?.biomarker_id && bio.id !== opts.biomarker_id) continue;
      const trend = analyzeTrend(bio.results, bio.refMin, bio.refMax);
      if (!trend) continue;
      const latest = bio.results[bio.results.length - 1];
      trends.push({
        biomarkerId: bio.id,
        categoryId: cat.id,
        ...trend,
        latestValue: latest.value,
        latestDate: latest.date,
      });
    }
  }
  return trends;
}

export async function getDaysSinceForProfile(
  profileId: number,
  authUserId: string,
): Promise<DaysSinceResult[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  return daysSinceLastTest(data.categories);
}

export async function compareDatesForProfile(
  profileId: number,
  authUserId: string,
  date1: string,
  date2: string,
): Promise<ComparisonRow[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  return compareDates(data.categories, date1, date2);
}

export async function getCorrelationsForProfile(
  profileId: number,
  authUserId: string,
): Promise<MatchedCorrelationGroup[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  return getRelevantCorrelations(data.categories);
}

export async function getBiologicalAgeForProfile(
  profileId: number,
  authUserId: string,
): Promise<PhenoAgeResult[] | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  if (!data.user.dateOfBirth) return [];
  return calculatePhenoAge(data.categories, data.user.dateOfBirth);
}

export async function getAnalysisPromptForProfile(
  profileId: number,
  authUserId: string,
  lang: Lang = "en",
): Promise<string | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  const enI18n = makeI18n("en");
  return buildPrompt(data, enI18n, lang);
}
