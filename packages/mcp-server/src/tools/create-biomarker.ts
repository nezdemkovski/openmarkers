import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createBiomarker, biomarkerTypeEnum } from "@openmarkers/db";
import { z } from "zod";

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
        ref_min_m: z
          .number()
          .optional()
          .describe("Male reference range minimum"),
        ref_max_m: z
          .number()
          .optional()
          .describe("Male reference range maximum"),
        ref_min_f: z
          .number()
          .optional()
          .describe("Female reference range minimum"),
        ref_max_f: z
          .number()
          .optional()
          .describe("Female reference range maximum"),
        type: biomarkerTypeEnum
          .optional()
          .describe("Biomarker type (default: quantitative)"),
      }),
    },
    async (input) => mcpJson(await createBiomarker(input)),
  );
}
