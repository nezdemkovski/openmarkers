import { eq, and, sql, gte, lte } from "drizzle-orm";

import { isOutOfRange, analyzeTrend } from "./analytics";
import { calculatePhenoAge, getMissingPhenoAgeMarkers } from "./bioage";
import { db } from "./db";
import { enrichUserData } from "./enrich";
import {
  profiles,
  categories,
  biomarkers,
  results,
  neonAuthUser,
  userPreferences,
} from "./schema/app";
import type {
  DbProfile,
  DbBiomarker,
  DbResult,
  ProfileSummary,
  UserData,
} from "./types";
import { Sex, BiomarkerType } from "./types";
import { UnitSystem } from "./types";
import { convert as convertUnit, convertRange, getDisplayUnit } from "./units";

export type { DbProfile, DbBiomarker, DbResult, ProfileSummary, UserData };
export type {
  Sex,
  BiomarkerType,
  TrendDirection,
  BiomarkerResult,
  Biomarker,
  Category,
  TrendResult,
  BiomarkerTrend,
  SnapshotItem,
  ComparisonRow,
  CorrelationGroup,
  MatchedCorrelationGroup,
  PhenoAgeScore,
  PhenoAgeResult,
  DaysSinceResult,
  TranslationData,
  Lang,
  I18n,
} from "./types";

export { isLang, errorMessage } from "./types";

export {
  isOutOfRange,
  analyzeTrend,
  CORRELATION_GROUPS,
  getAllDates,
  getDateSnapshot,
  daysSinceLastTest,
  compareDates,
  getRelevantCorrelations,
} from "./analytics";

export {
  chronoAge,
  calculatePhenoAge,
  getMissingPhenoAgeMarkers,
} from "./bioage";
export { enrichUserData } from "./enrich";
export { LANGS, makeI18n } from "./i18n";
export { buildPrompt } from "./promptBuilder";
export { verifyToken } from "./auth";
export { db } from "./db";
export * as oauthStore from "./oauth-store";
export {
  importDataSchema,
  sexEnum,
  biomarkerTypeEnum,
  publicHandleSchema,
} from "./validation";
export {
  convert as convertUnit,
  convertRange,
  canConvert,
  getDisplayUnit,
} from "./units";

export {
  getTimelineForProfile,
  getSnapshotForProfile,
  getTrendsForProfile,
  getDaysSinceForProfile,
  compareDatesForProfile,
  getCorrelationsForProfile,
  getBiologicalAgeForProfile,
  getAnalysisPromptForProfile,
} from "./services";

export async function listProfiles(
  authUserId: string,
): Promise<ProfileSummary[]> {
  const rows = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      dateOfBirth: profiles.dateOfBirth,
      sex: profiles.sex,
      isPublic: profiles.isPublic,
      publicHandle: profiles.publicHandle,
    })
    .from(profiles)
    .where(eq(profiles.authUserId, authUserId))
    .orderBy(profiles.displayOrder, profiles.name);
  return rows;
}

export async function getProfile(
  profileId: number,
  authUserId: string,
): Promise<DbProfile | undefined> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!row) return undefined;
  return toProfile(row);
}

export async function createProfile(
  authUserId: string,
  data: { name: string; date_of_birth: string; sex: Sex },
): Promise<DbProfile> {
  const [row] = await db
    .insert(profiles)
    .values({
      authUserId,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      sex: data.sex,
    })
    .returning();
  return toProfile(row);
}

export async function updateProfile(
  profileId: number,
  authUserId: string,
  data: Partial<{
    name: string;
    date_of_birth: string;
    sex: Sex;
    is_public: boolean;
    public_handle: string | null;
  }>,
): Promise<DbProfile | undefined> {
  const existing = await getProfile(profileId, authUserId);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.date_of_birth !== undefined)
    updates.dateOfBirth = data.date_of_birth;
  if (data.sex !== undefined) updates.sex = data.sex;
  if (data.is_public !== undefined) updates.isPublic = data.is_public;
  if (data.public_handle !== undefined)
    updates.publicHandle = data.public_handle;

  const [row] = await db
    .update(profiles)
    .set(updates)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .returning();
  if (!row) return undefined;
  return toProfile(row);
}

export async function deleteProfile(
  profileId: number,
  authUserId: string,
): Promise<boolean> {
  const result = await db
    .delete(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .returning({ id: profiles.id });
  return result.length > 0;
}

export async function reorderProfiles(
  authUserId: string,
  profileIds: number[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (let i = 0; i < profileIds.length; i++) {
      await tx
        .update(profiles)
        .set({ displayOrder: i })
        .where(
          and(
            eq(profiles.id, profileIds[i]),
            eq(profiles.authUserId, authUserId),
          ),
        );
    }
  });
}

export async function findProfileByName(
  authUserId: string,
  name: string,
): Promise<DbProfile | undefined> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.authUserId, authUserId), eq(profiles.name, name)))
    .limit(1);
  if (!row) return undefined;
  return toProfile(row);
}

function toProfile(row: typeof profiles.$inferSelect): DbProfile {
  return {
    id: row.id,
    auth_user_id: row.authUserId,
    name: row.name,
    date_of_birth: row.dateOfBirth,
    sex: row.sex,
    is_public: row.isPublic,
    public_handle: row.publicHandle,
    created_at: row.createdAt?.toISOString() ?? "",
    updated_at: row.updatedAt?.toISOString() ?? "",
  };
}

export async function listCategories(): Promise<string[]> {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(categories.displayOrder, categories.id);
  return rows.map((r) => r.id);
}

export async function ensureCategory(id: string): Promise<void> {
  await db.insert(categories).values({ id }).onConflictDoNothing();
}

export async function listBiomarkers(
  categoryId?: string,
): Promise<DbBiomarker[]> {
  const query = categoryId
    ? db.select().from(biomarkers).where(eq(biomarkers.categoryId, categoryId))
    : db.select().from(biomarkers).orderBy(biomarkers.categoryId);
  const rows = await query;
  return rows.map(toBiomarker);
}

export async function getBiomarker(
  id: string,
): Promise<DbBiomarker | undefined> {
  const [row] = await db
    .select()
    .from(biomarkers)
    .where(eq(biomarkers.id, id))
    .limit(1);
  return row ? toBiomarker(row) : undefined;
}

export async function createBiomarker(data: {
  id: string;
  category_id: string;
  unit?: string | null;
  ref_min_m?: number | null;
  ref_max_m?: number | null;
  ref_min_f?: number | null;
  ref_max_f?: number | null;
  type?: BiomarkerType;
}): Promise<DbBiomarker> {
  await ensureCategory(data.category_id);
  const [row] = await db
    .insert(biomarkers)
    .values({
      id: data.id,
      categoryId: data.category_id,
      unit: data.unit ?? null,
      refMinM: data.ref_min_m ?? null,
      refMaxM: data.ref_max_m ?? null,
      refMinF: data.ref_min_f ?? null,
      refMaxF: data.ref_max_f ?? null,
      type: data.type ?? BiomarkerType.Quantitative,
    })
    .returning();
  return toBiomarker(row);
}

export async function updateBiomarker(
  id: string,
  data: Partial<{
    unit: string | null;
    ref_min_m: number | null;
    ref_max_m: number | null;
    ref_min_f: number | null;
    ref_max_f: number | null;
  }>,
): Promise<DbBiomarker | undefined> {
  const existing = await getBiomarker(id);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};
  if (data.unit !== undefined) updates.unit = data.unit;
  if (data.ref_min_m !== undefined) updates.refMinM = data.ref_min_m;
  if (data.ref_max_m !== undefined) updates.refMaxM = data.ref_max_m;
  if (data.ref_min_f !== undefined) updates.refMinF = data.ref_min_f;
  if (data.ref_max_f !== undefined) updates.refMaxF = data.ref_max_f;

  if (Object.keys(updates).length === 0) return existing;

  const [row] = await db
    .update(biomarkers)
    .set(updates)
    .where(eq(biomarkers.id, id))
    .returning();
  return row ? toBiomarker(row) : undefined;
}

function toBiomarker(row: typeof biomarkers.$inferSelect): DbBiomarker {
  return {
    id: row.id,
    category_id: row.categoryId,
    unit: row.unit,
    ref_min_m: row.refMinM,
    ref_max_m: row.refMaxM,
    ref_min_f: row.refMinF,
    ref_max_f: row.refMaxF,
    type: row.type,
    molecular_weight: row.molecularWeight,
  };
}

export async function addResult(
  authUserId: string,
  data: {
    profile_id: number;
    biomarker_id: string;
    date: string;
    value: string | number;
    ref_min?: number | null;
    ref_max?: number | null;
    unit?: string | null;
  },
): Promise<DbResult> {
  const profile = await getProfile(data.profile_id, authUserId);
  if (!profile) throw new Error("Profile not found or not owned by user");

  const [row] = await db
    .insert(results)
    .values({
      profileId: data.profile_id,
      biomarkerId: data.biomarker_id,
      date: data.date,
      value: String(data.value),
      refMin: data.ref_min ?? null,
      refMax: data.ref_max ?? null,
      unit: data.unit ?? null,
    })
    .returning();
  return toResult(row);
}

export async function updateResult(
  authUserId: string,
  id: number,
  data: Partial<{
    date: string;
    value: string | number;
    ref_min: number | null;
    ref_max: number | null;
    unit: string | null;
  }>,
): Promise<DbResult | undefined> {
  const [existing] = await db
    .select({ result: results, profile: profiles })
    .from(results)
    .innerJoin(profiles, eq(results.profileId, profiles.id))
    .where(and(eq(results.id, id), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};
  if (data.date !== undefined) updates.date = data.date;
  if (data.value !== undefined) updates.value = String(data.value);
  if (data.ref_min !== undefined) updates.refMin = data.ref_min;
  if (data.ref_max !== undefined) updates.refMax = data.ref_max;
  if (data.unit !== undefined) updates.unit = data.unit;

  if (Object.keys(updates).length === 0) return toResult(existing.result);

  const [row] = await db
    .update(results)
    .set(updates)
    .where(
      and(
        eq(results.id, id),
        sql`${results.profileId} IN (SELECT ${profiles.id} FROM ${profiles} WHERE ${profiles.authUserId} = ${authUserId})`,
      ),
    )
    .returning();
  return row ? toResult(row) : undefined;
}

export async function deleteResult(
  authUserId: string,
  id: number,
): Promise<boolean> {
  const deleted = await db
    .delete(results)
    .where(
      and(
        eq(results.id, id),
        sql`${results.profileId} IN (SELECT ${profiles.id} FROM ${profiles} WHERE ${profiles.authUserId} = ${authUserId})`,
      ),
    )
    .returning({ id: results.id });
  return deleted.length > 0;
}

export async function getProfileResults(
  authUserId: string,
  profileId: number,
  filters?: {
    category_id?: string;
    biomarker_id?: string;
    date_from?: string;
    date_to?: string;
  },
): Promise<DbResult[]> {
  const profile = await getProfile(profileId, authUserId);
  if (!profile) return [];

  const conditions = [eq(results.profileId, profileId)];
  if (filters?.biomarker_id) {
    conditions.push(eq(results.biomarkerId, filters.biomarker_id));
  }
  if (filters?.date_from) {
    conditions.push(gte(results.date, filters.date_from));
  }
  if (filters?.date_to) {
    conditions.push(lte(results.date, filters.date_to));
  }

  let query = db
    .select({ result: results, biomarker: biomarkers })
    .from(results)
    .innerJoin(biomarkers, eq(results.biomarkerId, biomarkers.id))
    .where(and(...conditions))
    .orderBy(results.biomarkerId, results.date);

  if (filters?.category_id) {
    const rows = await query;
    return rows
      .filter((r) => r.biomarker.categoryId === filters.category_id)
      .map((r) => toResult(r.result));
  }

  const rows = await query;
  return rows.map((r) => toResult(r.result));
}

function toResult(row: typeof results.$inferSelect): DbResult {
  return {
    id: row.id,
    profile_id: row.profileId,
    biomarker_id: row.biomarkerId,
    date: row.date,
    value: row.value,
    ref_min: row.refMin,
    ref_max: row.refMax,
    unit: row.unit,
    created_at: row.createdAt?.toISOString() ?? "",
  };
}

export async function getProfileData(
  profileId: number,
  authUserId: string,
): Promise<UserData | undefined> {
  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!profileRow) return undefined;

  const data = await assembleProfileData(profileId, profileRow);

  enrichUserData(data);

  const rawData = await assembleProfileData(profileId, profileRow, {
    skipUnitConversion: true,
  });
  const hasDob =
    profileRow.dateOfBirth &&
    !isNaN(new Date(profileRow.dateOfBirth).getTime());
  data.biologicalAge = {
    results: hasDob
      ? calculatePhenoAge(rawData.categories, profileRow.dateOfBirth)
      : [],
    missingMarkers: getMissingPhenoAgeMarkers(rawData.categories),
  };

  return data;
}

export async function getRawProfileData(
  profileId: number,
  authUserId: string,
): Promise<UserData | undefined> {
  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!profileRow) return undefined;

  return assembleProfileData(profileId, profileRow, {
    skipUnitConversion: true,
  });
}

export async function exportProfileData(
  profileId: number,
  authUserId: string,
): Promise<object | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  const { id, ...userWithoutId } = data.user;
  return { user: userWithoutId, categories: data.categories };
}

function parseNumericValue(value: string): number | string {
  const num = Number(value);
  return isNaN(num) ? value : num;
}

interface JsonUserData {
  user: { name: string; dateOfBirth?: string; sex?: Sex };
  categories: {
    id: string;
    biomarkers: {
      id: string;
      unit?: string | null;
      refMinM?: number | null;
      refMaxM?: number | null;
      refMinF?: number | null;
      refMaxF?: number | null;
      conventionalUnit?: string | null;
      type?: BiomarkerType;
      results: {
        date: string;
        value: number | string;
        refMin?: number | null;
        refMax?: number | null;
        unit?: string | null;
      }[];
    }[];
  }[];
}

export async function importProfileData(
  authUserId: string,
  jsonData: JsonUserData,
): Promise<number> {
  return await db.transaction(async (tx) => {
    const [profileRow] = await tx
      .insert(profiles)
      .values({
        authUserId,
        name: jsonData.user.name,
        dateOfBirth: jsonData.user.dateOfBirth ?? "",
        sex: jsonData.user.sex ?? Sex.Male,
      })
      .returning();
    const profileId = profileRow.id;

    const catValues: { id: string; displayOrder: number }[] = [];
    const bioValues: {
      id: string;
      categoryId: string;
      unit: string | null;
      refMinM: number | null;
      refMaxM: number | null;
      refMinF: number | null;
      refMaxF: number | null;
      conventionalUnit: string | null;
      type: string;
      displayOrder: number;
    }[] = [];
    const resValues: {
      profileId: number;
      biomarkerId: string;
      date: string;
      value: string;
      refMin: number | null;
      refMax: number | null;
      unit: string | null;
    }[] = [];

    for (let catIdx = 0; catIdx < jsonData.categories.length; catIdx++) {
      const cat = jsonData.categories[catIdx];
      catValues.push({ id: cat.id, displayOrder: catIdx });
      for (let bioIdx = 0; bioIdx < cat.biomarkers.length; bioIdx++) {
        const bio = cat.biomarkers[bioIdx];
        bioValues.push({
          id: bio.id,
          categoryId: cat.id,
          unit: bio.unit ?? null,
          refMinM: bio.refMinM ?? null,
          refMaxM: bio.refMaxM ?? null,
          refMinF: bio.refMinF ?? bio.refMinM ?? null,
          refMaxF: bio.refMaxF ?? bio.refMaxM ?? null,
          conventionalUnit: bio.conventionalUnit ?? null,
          type: bio.type ?? BiomarkerType.Quantitative,
          displayOrder: bioIdx,
        });
        for (const r of bio.results) {
          resValues.push({
            profileId,
            biomarkerId: bio.id,
            date: r.date,
            value: String(r.value),
            refMin: r.refMin ?? null,
            refMax: r.refMax ?? null,
            unit: r.unit ?? null,
          });
        }
      }
    }

    if (catValues.length > 0) {
      await tx.insert(categories).values(catValues).onConflictDoNothing();
    }
    if (bioValues.length > 0) {
      await tx.insert(biomarkers).values(bioValues).onConflictDoNothing();
    }
    if (resValues.length > 0) {
      for (let i = 0; i < resValues.length; i += 500) {
        await tx
          .insert(results)
          .values(resValues.slice(i, i + 500))
          .onConflictDoNothing();
      }
    }

    return profileId;
  });
}

export async function batchAddResults(
  authUserId: string,
  data: {
    profile_id: number;
    date: string;
    entries: Array<{
      biomarker_id: string;
      value: string | number;
      ref_min?: number | null;
      ref_max?: number | null;
      unit?: string | null;
    }>;
  },
): Promise<{ inserted: number; skipped: number }> {
  const profile = await getProfile(data.profile_id, authUserId);
  if (!profile) throw new Error("Profile not found or not owned by user");
  if (!data.entries.length) return { inserted: 0, skipped: 0 };

  const resValues = data.entries.map((e) => ({
    profileId: data.profile_id,
    biomarkerId: e.biomarker_id,
    date: data.date,
    value: String(e.value),
    refMin: e.ref_min ?? null,
    refMax: e.ref_max ?? null,
    unit: e.unit ?? null,
  }));
  const upserted = await db
    .insert(results)
    .values(resValues)
    .onConflictDoUpdate({
      target: [results.profileId, results.biomarkerId, results.date],
      set: {
        value: sql`excluded.value`,
        refMin: sql`excluded.ref_min`,
        refMax: sql`excluded.ref_max`,
        unit: sql`excluded.unit`,
      },
    })
    .returning({ id: results.id });
  return {
    inserted: upserted.length,
    skipped: data.entries.length - upserted.length,
  };
}

export async function checkHandleAvailability(
  handle: string,
  excludeProfileId?: number,
): Promise<boolean> {
  const conditions = [eq(profiles.publicHandle, handle)];
  if (excludeProfileId) {
    conditions.push(sql`${profiles.id} != ${excludeProfileId}`);
  }
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(profiles)
    .where(and(...conditions));
  return Number(row?.count ?? 0) === 0;
}

export async function listPublicProfiles(): Promise<
  { name: string; handle: string }[]
> {
  const rows = await db
    .select({ name: profiles.name, handle: profiles.publicHandle })
    .from(profiles)
    .where(
      and(
        eq(profiles.isPublic, true),
        sql`${profiles.publicHandle} IS NOT NULL`,
      ),
    )
    .orderBy(profiles.name);
  return rows.map((r) => ({ name: r.name, handle: r.handle! }));
}

export async function getPublicProfileByHandle(
  handle: string,
): Promise<UserData | undefined> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.publicHandle, handle), eq(profiles.isPublic, true)))
    .limit(1);
  if (!profile) return undefined;

  return assembleProfileData(profile.id, profile);
}

async function assembleProfileData(
  profileId: number,
  profileRow: typeof profiles.$inferSelect,
  opts?: { skipUnitConversion?: boolean },
): Promise<UserData> {
  const allCategories = await listCategories();
  const allBiomarkerRows = await db
    .select()
    .from(biomarkers)
    .orderBy(biomarkers.categoryId, biomarkers.displayOrder, biomarkers.id);
  const allResults = await db
    .select()
    .from(results)
    .where(eq(results.profileId, profileId))
    .orderBy(results.biomarkerId, results.date);

  const isFemale = profileRow.sex === Sex.Female;

  const resultsByBiomarker = new Map<string, (typeof results.$inferSelect)[]>();
  for (const r of allResults) {
    const arr = resultsByBiomarker.get(r.biomarkerId);
    if (arr) arr.push(r);
    else resultsByBiomarker.set(r.biomarkerId, [r]);
  }

  const biomarkersByCategory = new Map<
    string,
    (typeof biomarkers.$inferSelect)[]
  >();
  for (const b of allBiomarkerRows) {
    const arr = biomarkersByCategory.get(b.categoryId);
    if (arr) arr.push(b);
    else biomarkersByCategory.set(b.categoryId, [b]);
  }

  const skipConversion = opts?.skipUnitConversion === true;
  let unitSystem: UnitSystem = UnitSystem.SI;
  if (!skipConversion) {
    const [prefs] = await db
      .select({ unitSystem: userPreferences.unitSystem })
      .from(userPreferences)
      .where(eq(userPreferences.authUserId, profileRow.authUserId))
      .limit(1);
    if (prefs) unitSystem = prefs.unitSystem;
  }

  const userCategories = allCategories
    .map((catId) => {
      const bios = (biomarkersByCategory.get(catId) || [])
        .map((b) => {
          const storedUnit = b.unit;
          const mw = b.molecularWeight;

          let systemTarget: string | null = null;
          if (!skipConversion && storedUnit) {
            systemTarget = getDisplayUnit(
              storedUnit,
              b.conventionalUnit,
              unitSystem,
            );
            if (systemTarget) {
              const test = convertUnit(1, storedUnit, systemTarget, mw);
              if (test == null) systemTarget = null;
            }
          }
          const displayUnit = systemTarget ?? storedUnit;

          let bioRefMin = isFemale ? (b.refMinF ?? b.refMinM) : b.refMinM;
          let bioRefMax = isFemale ? (b.refMaxF ?? b.refMaxM) : b.refMaxM;
          if (systemTarget && storedUnit) {
            const cr = convertRange(
              bioRefMin,
              bioRefMax,
              storedUnit,
              systemTarget,
              mw,
            );
            bioRefMin = cr.refMin;
            bioRefMax = cr.refMax;
          }

          const ress = (resultsByBiomarker.get(b.id) || []).map((r) => {
            let value =
              b.type === BiomarkerType.Qualitative
                ? r.value
                : parseNumericValue(r.value);
            let rRefMin = r.refMin;
            let rRefMax = r.refMax;
            const resultUnit = r.unit ?? storedUnit;

            if (
              resultUnit &&
              displayUnit &&
              resultUnit !== displayUnit &&
              typeof value === "number"
            ) {
              const converted = convertUnit(value, resultUnit, displayUnit, mw);
              if (converted != null) value = converted;
              if (rRefMin != null || rRefMax != null) {
                const cr = convertRange(
                  rRefMin,
                  rRefMax,
                  resultUnit,
                  displayUnit,
                  mw,
                );
                rRefMin = cr.refMin;
                rRefMax = cr.refMax;
              }
            }

            const effectiveMin = rRefMin ?? bioRefMin;
            const effectiveMax = rRefMax ?? bioRefMax;
            return {
              id: r.id,
              date: r.date,
              value,
              ...(rRefMin != null ? { refMin: rRefMin } : {}),
              ...(rRefMax != null ? { refMax: rRefMax } : {}),
              outOfRange: isOutOfRange(value, effectiveMin, effectiveMax),
            };
          });
          if (ress.length === 0) return null;
          const latest = ress[ress.length - 1];
          const trend = analyzeTrend(ress, bioRefMin, bioRefMax);
          return {
            id: b.id,
            ...(displayUnit != null ? { unit: displayUnit } : {}),
            ...(bioRefMin != null ? { refMin: bioRefMin } : {}),
            ...(bioRefMax != null ? { refMax: bioRefMax } : {}),
            ...(b.type !== BiomarkerType.Quantitative ? { type: b.type } : {}),
            results: ress,
            trend,
            latestOutOfRange: latest?.outOfRange ?? false,
          };
        })
        .filter((b) => b !== null);
      if (bios.length === 0) return null;
      return { id: catId, biomarkers: bios };
    })
    .filter((c) => c !== null);

  return {
    user: {
      id: profileRow.id,
      name: profileRow.name,
      dateOfBirth: profileRow.dateOfBirth,
      sex: profileRow.sex,
      publicHandle: profileRow.isPublic ? profileRow.publicHandle : null,
    },
    categories: userCategories,
  };
}

export async function deleteUser(authUserId: string): Promise<boolean> {
  const result = await db
    .delete(neonAuthUser)
    .where(eq(neonAuthUser.id, authUserId))
    .returning({ id: neonAuthUser.id });
  return result.length > 0;
}

export async function isDbEmpty(): Promise<boolean> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(profiles);
  return (row?.count ?? 0) === 0;
}

export async function getUserPreferences(
  authUserId: string,
): Promise<{ unitSystem: UnitSystem }> {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.authUserId, authUserId))
    .limit(1);
  return { unitSystem: row?.unitSystem ?? UnitSystem.SI };
}

export async function updateUserPreferences(
  authUserId: string,
  data: { unit_system: UnitSystem },
): Promise<{ unitSystem: UnitSystem }> {
  const [row] = await db
    .insert(userPreferences)
    .values({ authUserId, unitSystem: data.unit_system })
    .onConflictDoUpdate({
      target: userPreferences.authUserId,
      set: { unitSystem: data.unit_system },
    })
    .returning();
  return { unitSystem: row.unitSystem };
}
