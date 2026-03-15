import { deleteUser } from "@openmarkers/db";

import { json } from "./_shared.ts";

export async function handleDeleteAccount(auth: {
  userId: string;
}): Promise<Response> {
  await deleteUser(auth.userId);
  return json({ ok: true });
}
