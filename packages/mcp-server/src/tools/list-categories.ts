import { z } from "zod";
import { listCategories } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
