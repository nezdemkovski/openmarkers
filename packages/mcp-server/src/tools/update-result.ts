import { z } from "zod";
import { updateResult } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerUpdateResult(server: McpServer, authUserId: string) {
  server.registerTool(
    "update_result",
    {
      description: "Update an existing lab result.",
      inputSchema: z.object({
        result_id: z.coerce.number().int().describe("Result ID"),
        date: z.string().optional().describe("Result date (YYYY-MM-DD)"),
        value: z.union([z.number(), z.string()]).optional().describe("Result value"),
      }),
    },
    async ({ result_id, ...data }) => {
      const result = await updateResult(authUserId, result_id, data);
      if (!result) return { content: [{ type: "text" as const, text: "Result not found" }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    },
  );
}
