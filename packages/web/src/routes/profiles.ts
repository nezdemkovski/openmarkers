import {
  listProfiles,
  getProfileData,
  createProfile,
  updateProfile,
  deleteProfile,
  reorderProfiles,
  exportProfileData,
  getTimelineForProfile,
  getSnapshotForProfile,
  getTrendsForProfile,
  getDaysSinceForProfile,
  compareDatesForProfile,
  getCorrelationsForProfile,
  getBiologicalAgeForProfile,
  getAnalysisPromptForProfile,
  sexEnum,
  publicHandleSchema,
  checkHandleAvailability,
} from "@openmarkers/db";
import { isLang } from "@openmarkers/db";
import { z } from "zod";

import { json, error, parseBody, isResponse } from "./_shared.ts";

const dateString = z.union([z.string().date(), z.literal("")]);

const profileCreateSchema = z.object({
  name: z.string().min(1).max(200),
  date_of_birth: dateString,
  sex: sexEnum,
});

const profileUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    date_of_birth: dateString.optional(),
    sex: sexEnum.optional(),
    is_public: z.boolean().optional(),
    public_handle: publicHandleSchema.nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

const reorderSchema = z.object({
  profileIds: z.array(z.number().int().positive()).min(1).max(100),
});

export async function handleListProfiles(auth: {
  userId: string;
}): Promise<Response> {
  return json(await listProfiles(auth.userId));
}

export async function handleGetProfile(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const data = await getProfileData(id, auth.userId);
  if (!data) return error("Profile not found", 404);
  return json(data);
}

export async function handleCreateProfile(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, profileCreateSchema);
  if (isResponse(body)) return body;
  const profile = await createProfile(auth.userId, body);
  return json(profile, 201);
}

export async function handleUpdateProfile(
  req: Request,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const body = await parseBody(req, profileUpdateSchema);
  if (isResponse(body)) return body;
  const profile = await updateProfile(id, auth.userId, body);
  if (!profile) return error("Profile not found", 404);
  return json(profile);
}

export async function handleDeleteProfile(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const deleted = await deleteProfile(id, auth.userId);
  if (!deleted) return error("Profile not found", 404);
  return json({ ok: true });
}

export async function handleReorderProfiles(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, reorderSchema);
  if (isResponse(body)) return body;
  await reorderProfiles(auth.userId, body.profileIds);
  return json({ ok: true });
}

export async function handleCheckHandle(url: URL): Promise<Response> {
  const handle = url.searchParams.get("handle");
  if (!handle) return error("handle is required");
  const profileIdParam = url.searchParams.get("profile_id");
  const profileIdNum = profileIdParam
    ? parseInt(profileIdParam, 10)
    : undefined;
  const available = await checkHandleAvailability(
    handle,
    profileIdNum !== undefined && !isNaN(profileIdNum)
      ? profileIdNum
      : undefined,
  );
  return json({ available });
}

export async function handleExport(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const data = await exportProfileData(id, auth.userId);
  if (!data) return error("Profile not found", 404);
  return json(data);
}

export async function handleTimeline(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const result = await getTimelineForProfile(id, auth.userId);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleSnapshot(
  url: URL,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const date = url.searchParams.get("date");
  if (!date) return error("date is required");
  const result = await getSnapshotForProfile(id, auth.userId, date);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleTrends(
  url: URL,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const opts = {
    biomarker_id: url.searchParams.get("biomarker_id") ?? undefined,
    category_id: url.searchParams.get("category_id") ?? undefined,
  };
  const result = await getTrendsForProfile(id, auth.userId, opts);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleDaysSince(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const result = await getDaysSinceForProfile(id, auth.userId);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleCompare(
  url: URL,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const date1 = url.searchParams.get("date1");
  const date2 = url.searchParams.get("date2");
  if (!date1 || !date2) return error("date1 and date2 are required");
  const result = await compareDatesForProfile(id, auth.userId, date1, date2);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleCorrelations(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const result = await getCorrelationsForProfile(id, auth.userId);
  if (!result) return error("Profile not found", 404);
  return json(result);
}

export async function handleBiologicalAge(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const data = await getBiologicalAgeForProfile(id, auth.userId);
  if (!data) return error("Profile not found", 404);
  return json(data);
}

export async function handleAnalysisPrompt(
  url: URL,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const langParam = url.searchParams.get("lang");
  const lang = isLang(langParam) ? langParam : "en";
  const result = await getAnalysisPromptForProfile(id, auth.userId, lang);
  if (!result) return error("Profile not found", 404);
  return json({ prompt: result });
}
