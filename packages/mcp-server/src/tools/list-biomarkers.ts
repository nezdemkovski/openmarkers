import { z } from "zod";
import { listBiomarkers } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson } from "../index";

export function registerListBiomarkers(server: McpServer) {
  server.registerTool(
    "list_biomarkers",
    {
      description: "List biomarker definitions, optionally filtered by category.",
      inputSchema: z.object({
        category_id: z.string().optional().describe("Filter by category ID"),
      }),
    },
    async ({ category_id }) => mcpJson(await listBiomarkers(category_id)),
  );
}
