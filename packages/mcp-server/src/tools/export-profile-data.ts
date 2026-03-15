import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exportProfileData } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson, mcpError } from "../index";

export function registerExportProfileData(
  server: McpServer,
  authUserId: string,
) {
  server.registerTool(
    "export_profile_data",
    {
      description:
        "Export a profile's full data as JSON (matches seed file format for re-import).",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID to export"),
      }),
    },
    async ({ profile_id }) => {
      const data = await exportProfileData(profile_id, authUserId);
      if (!data) return mcpError("Profile not found");
      return mcpJson(data);
    },
  );
}
