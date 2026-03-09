import { z } from "zod";
import { deleteProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDeleteProfile(server: McpServer, authUserId: string) {
  server.registerTool(
    "delete_profile",
    {
      description: "Delete a health profile and all its data.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const deleted = await deleteProfile(profile_id, authUserId);
      if (!deleted) return { content: [{ type: "text" as const, text: "Profile not found" }], isError: true };
      return { content: [{ type: "text" as const, text: "Profile deleted successfully" }] };
    },
  );
}
