import { z } from "zod";
import { getProfileData } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpError } from "../index";

export function registerGetProfile(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_profile",
    {
      description: "Get full profile data including all categories, biomarkers, and results.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const data = await getProfileData(profile_id, authUserId);
      if (!data) return mcpError("Profile not found");
      return mcpJson(data);
    },
  );
}
