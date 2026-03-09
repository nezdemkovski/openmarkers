import { z } from "zod";
import { getSnapshotForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetDateSnapshot(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_date_snapshot",
    {
      description:
        "Get a snapshot of all biomarker results for a profile on a specific date. Shows values, units, reference ranges, and whether each is out of range.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        date: z.string().describe("Lab date (YYYY-MM-DD)"),
      }),
    },
    async ({ profile_id, date }) => {
      const snapshot = await getSnapshotForProfile(profile_id, authUserId, date);
      if (!snapshot) return { content: [{ type: "text" as const, text: "Profile not found" }], isError: true };
      if (snapshot.length === 0)
        return { content: [{ type: "text" as const, text: `No results found for date ${date}` }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(snapshot, null, 2) }] };
    },
  );
}
