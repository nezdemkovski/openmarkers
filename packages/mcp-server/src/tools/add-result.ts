import { z } from "zod";
import { addResult } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpError } from "../index";

export function registerAddResult(server: McpServer, authUserId: string) {
  server.registerTool(
    "add_result",
    {
      description: "Add a lab result for a profile.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        biomarker_id: z.string().describe("Biomarker ID"),
        date: z.string().describe("Result date (YYYY-MM-DD)"),
        value: z.union([z.number(), z.string()]).describe("Result value (numeric or string)"),
        ref_min: z.number().nullish().describe("Lab-reported reference minimum"),
        ref_max: z.number().nullish().describe("Lab-reported reference maximum"),
        unit: z.string().nullish().describe("Lab-reported unit of measurement"),
      }),
    },
    async (input) => {
      try {
        return mcpJson(await addResult(authUserId, input));
      } catch (e: unknown) {
        return mcpError(e instanceof Error ? e.message : "Failed to add result");
      }
    },
  );
}
