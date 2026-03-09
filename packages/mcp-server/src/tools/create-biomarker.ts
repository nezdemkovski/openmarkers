import { z } from "zod";
import { createBiomarker, biomarkerTypeEnum } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpJson } from "../index";

export function registerCreateBiomarker(server: McpServer) {
  server.registerTool(
    "create_biomarker",
    {
      description: "Create a new biomarker definition.",
      inputSchema: z.object({
        id: z.string().describe("Biomarker ID (e.g. S-UREA)"),
        category_id: z.string().describe("Category ID"),
        unit: z.string().optional().describe("Unit of measurement"),
        ref_min: z.number().optional().describe("Reference range minimum"),
        ref_max: z.number().optional().describe("Reference range maximum"),
        type: biomarkerTypeEnum.optional().describe("Biomarker type (default: quantitative)"),
      }),
    },
    async (input) => mcpJson(await createBiomarker(input)),
  );
}
