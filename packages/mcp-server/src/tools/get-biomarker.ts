import { z } from "zod";
import { getBiomarker } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetBiomarker(server: McpServer) {
  server.registerTool(
    "get_biomarker",
    {
      description: "Get a single biomarker's metadata.",
      inputSchema: z.object({
        biomarker_id: z.string().describe("Biomarker ID"),
      }),
    },
    async ({ biomarker_id }) => {
      const b = await getBiomarker(biomarker_id);
      if (!b) return { content: [{ type: "text" as const, text: "Biomarker not found" }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(b, null, 2) }] };
    },
  );
}
