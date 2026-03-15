import {
  importProfileData,
  findProfileByName,
  importDataSchema,
} from "@openmarkers/db";
import { z } from "zod";

import { json, parseBody, isResponse } from "./_shared.ts";

const importCheckSchema = z.object({
  user: z.object({ name: z.string().min(1).max(200) }),
});

export async function handleImportCheck(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, importCheckSchema);
  if (isResponse(body)) return body;
  const existing = await findProfileByName(auth.userId, body.user.name);
  return json({
    exists: !!existing,
    user: existing ? { id: existing.id, name: existing.name } : null,
  });
}

export async function handleImport(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const body = await parseBody(req, importDataSchema);
  if (isResponse(body)) return body;
  const profileId = await importProfileData(auth.userId, body);
  return json({ ok: true, profile_id: profileId }, 201);
}
