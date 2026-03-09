import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/db/src/schema/app.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
