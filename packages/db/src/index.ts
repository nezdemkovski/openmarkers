import { db } from "./db";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { profiles, categories, biomarkers, results, profileBiomarkers, neonAuthUser } from "./schema/app";
import type { DbProfile, DbBiomarker, DbResult, ProfileSummary, UserData, Sex, BiomarkerType } from "./types";

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

export { chronoAge, calculatePhenoAge } from "./bioage";
export { LANGS, makeI18n } from "./i18n";
export { buildPrompt } from "./promptBuilder";
export { verifyToken } from "./auth";
export { db } from "./db";
export * as oauthStore from "./oauth-store";
export { importDataSchema, sexEnum, biomarkerTypeEnum, publicHandleSchema } from "./validation";

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

// ---- Profiles ----

export async function listProfiles(authUserId: string): Promise<ProfileSummary[]> {
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

export async function getProfile(profileId: number, authUserId: string): Promise<DbProfile | undefined> {
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
  data: Partial<{ name: string; date_of_birth: string; sex: Sex; is_public: boolean; public_handle: string | null }>,
): Promise<DbProfile | undefined> {
  const existing = await getProfile(profileId, authUserId);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.date_of_birth !== undefined) updates.dateOfBirth = data.date_of_birth;
  if (data.sex !== undefined) updates.sex = data.sex;
  if (data.is_public !== undefined) updates.isPublic = data.is_public;
  if (data.public_handle !== undefined) updates.publicHandle = data.public_handle;

  const [row] = await db
    .update(profiles)
    .set(updates)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .returning();
  if (!row) return undefined;
  return toProfile(row);
}

export async function deleteProfile(profileId: number, authUserId: string): Promise<boolean> {
  const result = await db
    .delete(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .returning({ id: profiles.id });
  return result.length > 0;
}

export async function reorderProfiles(authUserId: string, profileIds: number[]): Promise<void> {
  for (let i = 0; i < profileIds.length; i++) {
    await db
      .update(profiles)
      .set({ displayOrder: i })
      .where(and(eq(profiles.id, profileIds[i]), eq(profiles.authUserId, authUserId)));
  }
}

export async function findProfileByName(authUserId: string, name: string): Promise<DbProfile | undefined> {
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

// ---- Categories ----

export async function listCategories(): Promise<string[]> {
  const rows = await db.select({ id: categories.id }).from(categories);
  return rows.map((r) => r.id);
}

export async function ensureCategory(id: string): Promise<void> {
  await db.insert(categories).values({ id }).onConflictDoNothing();
}

// ---- Biomarkers ----

export async function listBiomarkers(categoryId?: string): Promise<DbBiomarker[]> {
  const query = categoryId
    ? db.select().from(biomarkers).where(eq(biomarkers.categoryId, categoryId))
    : db.select().from(biomarkers).orderBy(biomarkers.categoryId);
  const rows = await query;
  return rows.map(toBiomarker);
}

export async function getBiomarker(id: string): Promise<DbBiomarker | undefined> {
  const [row] = await db.select().from(biomarkers).where(eq(biomarkers.id, id)).limit(1);
  return row ? toBiomarker(row) : undefined;
}

export async function createBiomarker(data: {
  id: string;
  category_id: string;
  unit?: string | null;
  ref_min?: number | null;
  ref_max?: number | null;
  type?: BiomarkerType;
}): Promise<DbBiomarker> {
  await ensureCategory(data.category_id);
  const [row] = await db
    .insert(biomarkers)
    .values({
      id: data.id,
      categoryId: data.category_id,
      unit: data.unit ?? null,
      refMin: data.ref_min ?? null,
      refMax: data.ref_max ?? null,
      type: data.type ?? "quantitative",
    })
    .returning();
  return toBiomarker(row);
}

export async function updateBiomarker(
  id: string,
  data: Partial<{
    unit: string | null;
    ref_min: number | null;
    ref_max: number | null;
  }>,
): Promise<DbBiomarker | undefined> {
  const existing = await getBiomarker(id);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};
  if (data.unit !== undefined) updates.unit = data.unit;
  if (data.ref_min !== undefined) updates.refMin = data.ref_min;
  if (data.ref_max !== undefined) updates.refMax = data.ref_max;

  if (Object.keys(updates).length === 0) return existing;

  const [row] = await db.update(biomarkers).set(updates).where(eq(biomarkers.id, id)).returning();
  return row ? toBiomarker(row) : undefined;
}

function toBiomarker(row: typeof biomarkers.$inferSelect): DbBiomarker {
  return {
    id: row.id,
    category_id: row.categoryId,
    unit: row.unit,
    ref_min: row.refMin,
    ref_max: row.refMax,
    type: row.type,
  };
}

// ---- Results ----

export async function addResult(
  authUserId: string,
  data: {
    profile_id: number;
    biomarker_id: string;
    date: string;
    value: string | number;
  },
): Promise<DbResult> {
  // Verify ownership
  const profile = await getProfile(data.profile_id, authUserId);
  if (!profile) throw new Error("Profile not found or not owned by user");

  const [row] = await db
    .insert(results)
    .values({
      profileId: data.profile_id,
      biomarkerId: data.biomarker_id,
      date: data.date,
      value: String(data.value),
    })
    .returning();
  return toResult(row);
}

export async function updateResult(
  authUserId: string,
  id: number,
  data: Partial<{ date: string; value: string | number }>,
): Promise<DbResult | undefined> {
  // Verify ownership through profile
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

  if (Object.keys(updates).length === 0) return toResult(existing.result);

  const [row] = await db.update(results).set(updates).where(eq(results.id, id)).returning();
  return row ? toResult(row) : undefined;
}

export async function deleteResult(authUserId: string, id: number): Promise<boolean> {
  // Verify ownership through profile
  const [existing] = await db
    .select({ id: results.id })
    .from(results)
    .innerJoin(profiles, eq(results.profileId, profiles.id))
    .where(and(eq(results.id, id), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!existing) return false;

  const deleted = await db.delete(results).where(eq(results.id, id)).returning({ id: results.id });
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
  // Verify ownership
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
    return rows.filter((r) => r.biomarker.categoryId === filters.category_id).map((r) => toResult(r.result));
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
    created_at: row.createdAt?.toISOString() ?? "",
  };
}

// ---- getProfileData (reassemble frontend shape) ----

export async function getProfileData(profileId: number, authUserId: string): Promise<UserData | undefined> {
  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.authUserId, authUserId)))
    .limit(1);
  if (!profileRow) return undefined;

  return assembleProfileData(profileId, profileRow);
}

export async function exportProfileData(profileId: number, authUserId: string): Promise<object | undefined> {
  const data = await getProfileData(profileId, authUserId);
  if (!data) return undefined;
  const { id, ...userWithoutId } = data.user;
  return { user: userWithoutId, categories: data.categories };
}

function parseNumericValue(value: string): number | string {
  const num = Number(value);
  return isNaN(num) ? value : num;
}

// ---- Import from JSON ----

interface JsonUserData {
  user: { name: string; dateOfBirth?: string; sex?: Sex };
  categories: {
    id: string;
    biomarkers: {
      id: string;
      unit?: string | null;
      refMin?: number | null;
      refMax?: number | null;
      type?: BiomarkerType;
      results: { date: string; value: number | string }[];
    }[];
  }[];
}

export async function importProfileData(authUserId: string, jsonData: JsonUserData): Promise<number> {
  const [profileRow] = await db
    .insert(profiles)
    .values({
      authUserId,
      name: jsonData.user.name,
      dateOfBirth: jsonData.user.dateOfBirth ?? "",
      sex: jsonData.user.sex ?? "M",
    })
    .returning();
  const profileId = profileRow.id;

  // Collect all values for batch inserts
  const catValues: { id: string }[] = [];
  const bioValues: {
    id: string;
    categoryId: string;
    unit: string | null;
    refMin: number | null;
    refMax: number | null;
    type: string;
  }[] = [];
  const pbValues: {
    profileId: number;
    biomarkerId: string;
    unit: string | null;
    refMin: number | null;
    refMax: number | null;
  }[] = [];
  const resValues: { profileId: number; biomarkerId: string; date: string; value: string }[] = [];

  for (const cat of jsonData.categories) {
    catValues.push({ id: cat.id });
    for (const bio of cat.biomarkers) {
      bioValues.push({
        id: bio.id,
        categoryId: cat.id,
        unit: bio.unit ?? null,
        refMin: bio.refMin ?? null,
        refMax: bio.refMax ?? null,
        type: bio.type ?? "quantitative",
      });
      pbValues.push({
        profileId,
        biomarkerId: bio.id,
        unit: bio.unit ?? null,
        refMin: bio.refMin ?? null,
        refMax: bio.refMax ?? null,
      });
      for (const r of bio.results) {
        resValues.push({ profileId, biomarkerId: bio.id, date: r.date, value: String(r.value) });
      }
    }
  }

  if (catValues.length > 0) {
    await db.insert(categories).values(catValues).onConflictDoNothing();
  }
  if (bioValues.length > 0) {
    await db.insert(biomarkers).values(bioValues).onConflictDoNothing();
  }
  if (pbValues.length > 0) {
    await db.insert(profileBiomarkers).values(pbValues).onConflictDoNothing();
  }
  if (resValues.length > 0) {
    // Batch in chunks of 500 to avoid query param limits
    for (let i = 0; i < resValues.length; i += 500) {
      await db
        .insert(results)
        .values(resValues.slice(i, i + 500))
        .onConflictDoNothing();
    }
  }

  return profileId;
}

// ---- Batch add results (for "Add Lab Visit" flow) ----

export async function batchAddResults(
  authUserId: string,
  data: {
    profile_id: number;
    date: string;
    entries: Array<{ biomarker_id: string; value: string | number }>;
  },
): Promise<{ inserted: number; skipped: number }> {
  const profile = await getProfile(data.profile_id, authUserId);
  if (!profile) throw new Error("Profile not found or not owned by user");
  if (!data.entries.length) return { inserted: 0, skipped: 0 };

  // Ensure profile_biomarkers associations exist
  const pbValues: {
    profileId: number;
    biomarkerId: string;
    unit: string | null;
    refMin: number | null;
    refMax: number | null;
  }[] = data.entries.map((e) => ({
    profileId: data.profile_id,
    biomarkerId: e.biomarker_id,
    unit: null,
    refMin: null,
    refMax: null,
  }));
  await db.insert(profileBiomarkers).values(pbValues).onConflictDoNothing();

  // Insert results
  const resValues = data.entries.map((e) => ({
    profileId: data.profile_id,
    biomarkerId: e.biomarker_id,
    date: data.date,
    value: String(e.value),
  }));
  const upserted = await db
    .insert(results)
    .values(resValues)
    .onConflictDoUpdate({
      target: [results.profileId, results.biomarkerId, results.date],
      set: { value: sql`excluded.value` },
    })
    .returning({ id: results.id });
  return { inserted: upserted.length, skipped: data.entries.length - upserted.length };
}

// ---- Public profiles ----

export async function checkHandleAvailability(handle: string, excludeProfileId?: number): Promise<boolean> {
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

export async function listPublicProfiles(): Promise<{ name: string; handle: string }[]> {
  const rows = await db
    .select({ name: profiles.name, handle: profiles.publicHandle })
    .from(profiles)
    .where(and(eq(profiles.isPublic, true), sql`${profiles.publicHandle} IS NOT NULL`))
    .orderBy(profiles.name);
  return rows.map((r) => ({ name: r.name, handle: r.handle! }));
}

export async function getPublicProfileByHandle(handle: string): Promise<UserData | undefined> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.publicHandle, handle), eq(profiles.isPublic, true)))
    .limit(1);
  if (!profile) return undefined;

  return assembleProfileData(profile.id, profile);
}

async function assembleProfileData(profileId: number, profileRow: typeof profiles.$inferSelect): Promise<UserData> {
  const allCategories = await listCategories();
  const allBiomarkerRows = await db.select().from(biomarkers);
  const allResults = await db
    .select()
    .from(results)
    .where(eq(results.profileId, profileId))
    .orderBy(results.biomarkerId, results.date);

  const overrideRows = await db.select().from(profileBiomarkers).where(eq(profileBiomarkers.profileId, profileId));
  const overrideMap = new Map(
    overrideRows.map((o) => [o.biomarkerId, { unit: o.unit, ref_min: o.refMin, ref_max: o.refMax }]),
  );

  const resultsByBiomarker = new Map<string, (typeof results.$inferSelect)[]>();
  for (const r of allResults) {
    const arr = resultsByBiomarker.get(r.biomarkerId);
    if (arr) arr.push(r);
    else resultsByBiomarker.set(r.biomarkerId, [r]);
  }

  const biomarkersByCategory = new Map<string, (typeof biomarkers.$inferSelect)[]>();
  for (const b of allBiomarkerRows) {
    const arr = biomarkersByCategory.get(b.categoryId);
    if (arr) arr.push(b);
    else biomarkersByCategory.set(b.categoryId, [b]);
  }

  const userCategories = allCategories
    .map((catId) => {
      const bios = (biomarkersByCategory.get(catId) || [])
        .map((b) => {
          const ress = (resultsByBiomarker.get(b.id) || []).map((r) => ({
            id: r.id,
            date: r.date,
            value: b.type === "qualitative" ? r.value : parseNumericValue(r.value),
          }));
          if (ress.length === 0) return null;
          const override = overrideMap.get(b.id);
          const unit = override?.unit ?? b.unit;
          const refMin = override?.ref_min ?? b.refMin;
          const refMax = override?.ref_max ?? b.refMax;
          return {
            id: b.id,
            ...(unit != null ? { unit } : {}),
            ...(refMin != null ? { refMin } : {}),
            ...(refMax != null ? { refMax } : {}),
            ...(b.type !== "quantitative" ? { type: b.type } : {}),
            results: ress,
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
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(profiles);
  return (row?.count ?? 0) === 0;
}
