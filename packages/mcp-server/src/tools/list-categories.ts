import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listCategories } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson } from "../index";

export function registerListCategories(server: McpServer) {
  server.registerTool(
    "list_categories",
    {
      description: "List all biomarker category IDs.",
      inputSchema: z.object({}),
    },
    async () => mcpJson(await listCategories()),
  );
}
