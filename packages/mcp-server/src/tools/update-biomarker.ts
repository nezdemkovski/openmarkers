import { z } from "zod";
import { updateBiomarker } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerUpdateBiomarker(server: McpServer) {
  server.registerTool(
    "update_biomarker",
    {
      description: "Update a biomarker's metadata.",
      inputSchema: z.object({
        id: z.string().describe("Biomarker ID"),
        unit: z.string().nullable().optional().describe("Unit of measurement"),
        ref_min: z.number().nullable().optional().describe("Reference range minimum"),
        ref_max: z.number().nullable().optional().describe("Reference range maximum"),
      }),
    },
    async ({ id, ...data }) => {
      const biomarker = await updateBiomarker(id, data);
      if (!biomarker) return { content: [{ type: "text" as const, text: "Biomarker not found" }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(biomarker, null, 2) }] };
    },
  );
}
