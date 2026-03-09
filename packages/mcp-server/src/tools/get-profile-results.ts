import { z } from "zod";
import { getProfileResults } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetProfileResults(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_profile_results",
    {
      description: "Get filtered lab results for a profile.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        category_id: z.string().optional().describe("Filter by category ID"),
        biomarker_id: z.string().optional().describe("Filter by biomarker ID"),
        date_from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        date_to: z.string().optional().describe("End date (YYYY-MM-DD)"),
      }),
    },
    async ({ profile_id, ...filters }) => {
      const results = await getProfileResults(authUserId, profile_id, filters);
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    },
  );
}
