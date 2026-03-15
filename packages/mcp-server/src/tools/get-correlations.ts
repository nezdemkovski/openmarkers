import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCorrelationsForProfile } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson, mcpText, mcpError } from "../index";

export function registerGetCorrelations(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_correlations",
    {
      description:
        "Get correlated biomarker panels for a profile (iron panel, lipid panel, liver panel, thyroid panel, kidney panel). Only returns panels where the profile has at least 2 matching biomarkers.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const correlations = await getCorrelationsForProfile(
        profile_id,
        authUserId,
      );
      if (!correlations) return mcpError("Profile not found");
      if (correlations.length === 0)
        return mcpText("No correlated panels found for this profile's data");
      return mcpJson(correlations);
    },
  );
}
