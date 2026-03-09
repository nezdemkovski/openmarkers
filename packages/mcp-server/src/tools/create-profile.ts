import { z } from "zod";
import { createProfile, sexEnum } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson } from "../index";

export function registerCreateProfile(server: McpServer, authUserId: string) {
  server.registerTool(
    "create_profile",
    {
      description: "Create a new health profile.",
      inputSchema: z.object({
        name: z.string().describe("Profile name (e.g. person's name)"),
        date_of_birth: z.string().describe("Date of birth (YYYY-MM-DD)"),
        sex: sexEnum.describe("Biological sex"),
      }),
    },
    async (input) => mcpJson(await createProfile(authUserId, input)),
  );
}
