import { z } from "zod";
import { getDaysSinceForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpError } from "../index";

export function registerGetDaysSinceLastTest(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_days_since_last_test",
    {
      description:
        "Show how many days since the last lab test for each category. Useful for identifying overdue tests.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const results = await getDaysSinceForProfile(profile_id, authUserId);
      if (!results) return mcpError("Profile not found");
      return mcpJson(results);
    },
  );
}
