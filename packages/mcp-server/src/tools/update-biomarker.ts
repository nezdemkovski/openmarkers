import { z } from "zod";
import { updateBiomarker } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson, mcpError } from "../index";

export function registerUpdateBiomarker(server: McpServer) {
  server.registerTool(
    "update_biomarker",
    {
      description: "Update a biomarker's metadata.",
      inputSchema: z.object({
        id: z.string().describe("Biomarker ID"),
        unit: z.string().nullable().optional().describe("Unit of measurement"),
        ref_min_m: z.number().nullable().optional().describe("Male reference range minimum"),
        ref_max_m: z.number().nullable().optional().describe("Male reference range maximum"),
        ref_min_f: z.number().nullable().optional().describe("Female reference range minimum"),
        ref_max_f: z.number().nullable().optional().describe("Female reference range maximum"),
      }),
    },
    async ({ id, ...data }) => {
      const biomarker = await updateBiomarker(id, data);
      if (!biomarker) return mcpError("Biomarker not found");
      return mcpJson(biomarker);
    },
  );
}
