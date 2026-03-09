import { z } from "zod";
import { importProfileData, importDataSchema } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson } from "../index";

export function registerImportProfileData(server: McpServer, authUserId: string) {
  server.registerTool(
    "import_profile_data",
    {
      description: "Bulk import profile data from the standard JSON format (user + categories + biomarkers + results).",
      inputSchema: z.object({
        data: importDataSchema.describe("Full profile data JSON object matching the OpenMarkers schema"),
      }),
    },
    async ({ data }) => mcpJson({ ok: true, profile_id: await importProfileData(authUserId, data) }),
  );
}
