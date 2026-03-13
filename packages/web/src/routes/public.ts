import { json, error } from "./_shared.ts";
import { listPublicProfiles, getPublicProfileByHandle } from "@openmarkers/db";

export async function handleListPublicProfiles(): Promise<Response> {
  return json(await listPublicProfiles());
}

export async function handleGetPublicProfile(handle: string): Promise<Response> {
  const data = await getPublicProfileByHandle(handle);
  if (!data) return error("Profile not found", 404);
  return json(data);
}
