import {
  addResult,
  updateResult,
  deleteResult,
  getProfileResults,
  batchAddResults,
} from "@openmarkers/db";
import { errorMessage } from "@openmarkers/db";
import { z } from "zod";

import { json, error, parseBody, isResponse } from "./_shared.ts";

const resultCreateSchema = z.object({
  profile_id: z.number().int().positive(),
  biomarker_id: z.string().min(1).max(200),
  date: z.string().date(),
  value: z.union([z.number(), z.string().min(1).max(200)]),
  ref_min: z.number().nullish(),
  ref_max: z.number().nullish(),
  unit: z.string().max(50).nullish(),
});

const resultUpdateSchema = z
  .object({
    date: z.string().date().optional(),
    value: z.union([z.number(), z.string().min(1).max(200)]).optional(),
    ref_min: z.number().nullish(),
    ref_max: z.number().nullish(),
    unit: z.string().max(50).nullish(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

const batchResultsSchema = z.object({
  profile_id: z.number().int().positive(),
  date: z.string().date(),
  entries: z
    .array(
      z.object({
        biomarker_id: z.string().min(1).max(200),
        value: z.union([z.number(), z.string().min(1).max(200)]),
        ref_min: z.number().nullish(),
        ref_max: z.number().nullish(),
        unit: z.string().max(50).nullish(),
      }),
    )
    .min(1)
    .max(500),
});

export async function handleListResults(
  url: URL,
  auth: { userId: string },
): Promise<Response> {
  const profileId = url.searchParams.get("profile_id");
  if (!profileId) return error("profile_id is required");
  const filters = {
    category_id: url.searchParams.get("category_id") ?? undefined,
    biomarker_id: url.searchParams.get("biomarker_id") ?? undefined,
    date_from: url.searchParams.get("date_from") ?? undefined,
    date_to: url.searchParams.get("date_to") ?? undefined,
  };
  return json(await getProfileResults(auth.userId, Number(profileId), filters));
}

export async function handleAddResult(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, resultCreateSchema);
  if (isResponse(body)) return body;
  try {
    const result = await addResult(auth.userId, body);
    return json(result, 201);
  } catch (e: unknown) {
    return error(errorMessage(e) || "Failed to add result", 403);
  }
}

export async function handleBatchResults(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, batchResultsSchema);
  if (isResponse(body)) return body;
  try {
    const result = await batchAddResults(auth.userId, body);
    return json(result, 201);
  } catch (e: unknown) {
    return error(errorMessage(e) || "Failed to add results", 403);
  }
}

export async function handleUpdateResult(
  req: Request,
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const body = await parseBody(req, resultUpdateSchema);
  if (isResponse(body)) return body;
  const result = await updateResult(auth.userId, id, body);
  if (!result) return error("Result not found", 404);
  return json(result);
}

export async function handleDeleteResult(
  auth: { userId: string },
  id: number,
): Promise<Response> {
  const deleted = await deleteResult(auth.userId, id);
  if (!deleted) return error("Result not found", 404);
  return json({ ok: true });
}
