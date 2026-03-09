import { z } from "zod";
import { getTimelineForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetTimeline(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_timeline",
    {
      description: "Get all lab test dates for a profile, sorted chronologically.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const dates = await getTimelineForProfile(profile_id, authUserId);
      if (!dates) return { content: [{ type: "text" as const, text: "Profile not found" }], isError: true };
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ dates, count: dates.length }, null, 2) },
        ],
      };
    },
  );
}
