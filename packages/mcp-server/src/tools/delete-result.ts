import { z } from "zod";
import { deleteResult } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDeleteResult(server: McpServer, authUserId: string) {
  server.registerTool(
    "delete_result",
    {
      description: "Delete a lab result.",
      inputSchema: z.object({
        result_id: z.coerce.number().int().describe("Result ID"),
      }),
    },
    async ({ result_id }) => {
      const deleted = await deleteResult(authUserId, result_id);
      if (!deleted) return { content: [{ type: "text" as const, text: "Result not found" }] };
      return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true }, null, 2) }] };
    },
  );
}
