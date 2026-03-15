import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { deleteResult } from "@openmarkers/db";
import { z } from "zod";

import { mcpText, mcpError } from "../index";

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
      if (!deleted) return mcpError("Result not found");
      return mcpText("Result deleted successfully");
    },
  );
}
