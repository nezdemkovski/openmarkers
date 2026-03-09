import { z } from "zod";
import { getTrendsForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpText, mcpError } from "../index";

export function registerGetTrends(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_trends",
    {
      description:
        "Analyze trends for a profile's biomarkers. Returns direction (up/down/stable), rate of change, overall change, whether the trend is approaching reference limits, and whether values are improving or worsening.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        biomarker_id: z.string().optional().describe("Optional: filter to a specific biomarker ID"),
        category_id: z.string().optional().describe("Optional: filter to a specific category ID"),
      }),
    },
    async ({ profile_id, biomarker_id, category_id }) => {
      const trends = await getTrendsForProfile(profile_id, authUserId, { biomarker_id, category_id });
      if (!trends) return mcpError("Profile not found");
      if (trends.length === 0) return mcpText("No trends available (need at least 2 results per biomarker)");
      return mcpJson(trends);
    },
  );
}
