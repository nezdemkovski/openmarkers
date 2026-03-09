import { z } from "zod";
import { compareDatesForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCompareDates(server: McpServer, authUserId: string) {
  server.registerTool(
    "compare_dates",
    {
      description:
        "Compare lab results between two dates side by side. Shows values for each date, absolute delta, percentage change, and out-of-range status.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        date1: z.string().describe("First lab date (YYYY-MM-DD)"),
        date2: z.string().describe("Second lab date (YYYY-MM-DD)"),
      }),
    },
    async ({ profile_id, date1, date2 }) => {
      const rows = await compareDatesForProfile(profile_id, authUserId, date1, date2);
      if (!rows) return { content: [{ type: "text" as const, text: "Profile not found" }], isError: true };
      if (rows.length === 0)
        return { content: [{ type: "text" as const, text: "No overlapping results found for these dates" }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }] };
    },
  );
}
