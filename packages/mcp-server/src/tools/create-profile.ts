import { z } from "zod";
import { createProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCreateProfile(server: McpServer, authUserId: string) {
  server.registerTool(
    "create_profile",
    {
      description: "Create a new health profile.",
      inputSchema: z.object({
        name: z.string().describe("Profile name (e.g. person's name)"),
        date_of_birth: z.string().describe("Date of birth (YYYY-MM-DD)"),
        sex: z.enum(["M", "F"]).describe("Biological sex"),
      }),
    },
    async (input) => {
      const profile = await createProfile(authUserId, input);
      return { content: [{ type: "text" as const, text: JSON.stringify(profile, null, 2) }] };
    },
  );
}
