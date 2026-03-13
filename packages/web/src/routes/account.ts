import { json } from "./_shared.ts";
import { deleteUser } from "@openmarkers/db";

export async function handleDeleteAccount(auth: { userId: string }): Promise<Response> {
  await deleteUser(auth.userId);
  return json({ ok: true });
}
