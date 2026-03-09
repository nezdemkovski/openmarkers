import { z } from "zod";
import { importProfileData } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const importDataSchema = z.object({
  user: z.object({
    name: z.string().min(1).max(200),
    dateOfBirth: z.string().optional(),
    sex: z.enum(["M", "F"]).optional(),
  }),
  categories: z.array(z.object({
    id: z.string().min(1).max(200),
    biomarkers: z.array(z.object({
      id: z.string().min(1).max(200),
      unit: z.string().max(50).nullish(),
      refMin: z.number().nullish(),
      refMax: z.number().nullish(),
      type: z.enum(["quantitative", "qualitative"]).optional(),
      results: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        value: z.union([z.number(), z.string().max(200)]),
      })).max(10000),
    })).max(500),
  })).max(100),
});

export function registerImportProfileData(server: McpServer, authUserId: string) {
  server.registerTool(
    "import_profile_data",
    {
      description: "Bulk import profile data from the standard JSON format (user + categories + biomarkers + results).",
      inputSchema: z.object({
        data: importDataSchema.describe("Full profile data JSON object matching the OpenMarkers schema"),
      }),
    },
    async ({ data }) => {
      const profileId = await importProfileData(authUserId, data);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: true, profile_id: profileId }, null, 2) }],
      };
    },
  );
}
