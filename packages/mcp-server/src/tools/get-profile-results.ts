import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProfileResults } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson } from "../index";

export function registerGetProfileResults(
  server: McpServer,
  authUserId: string,
) {
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
    async ({ profile_id, ...filters }) =>
      mcpJson(await getProfileResults(authUserId, profile_id, filters)),
  );
}
