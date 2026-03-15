import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getBiologicalAgeForProfile } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson, mcpText, mcpError } from "../index";

export function registerGetBiologicalAge(
  server: McpServer,
  authUserId: string,
) {
  server.registerTool(
    "get_biological_age",
    {
      description:
        "Calculate biological age using Levine's PhenoAge formula from 9 blood biomarkers. Returns PhenoAge, chronological age, delta, mortality score, DNAm age, and per-biomarker score breakdown for each lab date where all required biomarkers are present.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
      }),
    },
    async ({ profile_id }) => {
      const results = await getBiologicalAgeForProfile(profile_id, authUserId);
      if (results === undefined) return mcpError("Profile not found");
      if (results.length === 0)
        return mcpText(
          "Not enough biomarkers for PhenoAge calculation. Required: S-ALB, S-CREA, P-P-GLU, B-lymf, B-MCV, B-RDW, S-ALP, B-WBC, and S-hsCRP or S-CRP.",
        );
      return mcpJson(results);
    },
  );
}
