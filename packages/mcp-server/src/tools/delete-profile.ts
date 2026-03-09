import { z } from "zod";
import { deleteProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpText, mcpError } from "../index";

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
      if (!deleted) return mcpError("Profile not found");
      return mcpText("Profile deleted successfully");
    },
  );
}
