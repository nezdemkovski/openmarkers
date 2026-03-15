import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getBiomarker } from "@openmarkers/db";
import { z } from "zod";

import { mcpJson, mcpError } from "../index";

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
      if (!b) return mcpError("Biomarker not found");
      return mcpJson(b);
    },
  );
}
