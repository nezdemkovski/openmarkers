import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { importProfileData, isDbEmpty } from "./index";

export async function seedFromJsonFiles(dataDir: string, authUserId: string): Promise<void> {
  if (!(await isDbEmpty())) return;

  const usersDir = join(dataDir, "users");
  let files: string[];
  try {
    files = readdirSync(usersDir).filter((f) => f.endsWith(".json"));
  } catch {
    console.log("No seed data found at", usersDir);
    return;
  }

  for (const file of files) {
    const filePath = join(usersDir, file);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    await importProfileData(authUserId, data);
    console.log(`Seeded profile: ${data.user.name}`);
  }
}
