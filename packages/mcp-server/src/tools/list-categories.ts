import { z } from "zod";
import { listCategories } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerListCategories(server: McpServer) {
  server.registerTool(
    "list_categories",
    {
      description: "List all biomarker category IDs.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await listCategories(), null, 2) }],
    }),
  );
}
