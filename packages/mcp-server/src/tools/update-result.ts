import { z } from "zod";
import { updateResult } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpError } from "../index";

export function registerUpdateResult(server: McpServer, authUserId: string) {
  server.registerTool(
    "update_result",
    {
      description: "Update an existing lab result.",
      inputSchema: z.object({
        result_id: z.coerce.number().int().describe("Result ID"),
        date: z.string().optional().describe("Result date (YYYY-MM-DD)"),
        value: z.union([z.number(), z.string()]).optional().describe("Result value"),
        ref_min: z.number().nullish().describe("Lab-reported reference minimum"),
        ref_max: z.number().nullish().describe("Lab-reported reference maximum"),
        unit: z.string().nullish().describe("Lab-reported unit of measurement"),
      }),
    },
    async ({ result_id, ...data }) => {
      const result = await updateResult(authUserId, result_id, data);
      if (!result) return mcpError("Result not found");
      return mcpJson(result);
    },
  );
}
