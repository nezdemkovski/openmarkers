import { z } from "zod";
import { listProfiles } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerListProfiles(server: McpServer, authUserId: string) {
  server.registerTool(
    "list_profiles",
    {
      description: "List all health profiles for the current user.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await listProfiles(authUserId), null, 2) }],
    }),
  );
}
