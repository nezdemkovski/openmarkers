import { z } from "zod";
import { updateProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerUpdateProfile(server: McpServer, authUserId: string) {
  server.registerTool(
    "update_profile",
    {
      description: "Update a health profile's name, date of birth, or sex.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        name: z.string().optional().describe("New name"),
        date_of_birth: z.string().optional().describe("New date of birth (YYYY-MM-DD)"),
        sex: z.enum(["M", "F"]).optional().describe("New biological sex"),
      }),
    },
    async ({ profile_id, ...data }) => {
      const profile = await updateProfile(profile_id, authUserId, data);
      if (!profile) return { content: [{ type: "text" as const, text: "Profile not found" }], isError: true };
      return { content: [{ type: "text" as const, text: JSON.stringify(profile, null, 2) }] };
    },
  );
}
