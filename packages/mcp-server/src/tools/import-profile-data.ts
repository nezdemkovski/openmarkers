import { z } from "zod";
import { importProfileData } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerImportProfileData(server: McpServer, authUserId: string) {
  server.registerTool(
    "import_profile_data",
    {
      description: "Bulk import profile data from the standard JSON format (user + categories + biomarkers + results).",
      inputSchema: z.object({
        data: z.any().describe("Full profile data JSON object matching the OpenMarkers schema"),
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
