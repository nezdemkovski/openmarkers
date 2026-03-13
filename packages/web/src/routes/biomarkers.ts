import { json } from "./_shared.ts";
import { listCategories, listBiomarkers } from "@openmarkers/db";

export async function handleListCategories(): Promise<Response> {
  return json(await listCategories());
}

export async function handleListBiomarkers(url: URL): Promise<Response> {
  const categoryId = url.searchParams.get("category_id") ?? undefined;
  return json(await listBiomarkers(categoryId));
}
