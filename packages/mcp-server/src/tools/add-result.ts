import { z } from "zod";
import { addResult } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerAddResult(server: McpServer, authUserId: string) {
  server.registerTool(
    "add_result",
    {
      description: "Add a lab result for a profile.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        biomarker_id: z.string().describe("Biomarker ID"),
        date: z.string().describe("Result date (YYYY-MM-DD)"),
        value: z.union([z.number(), z.string()]).describe("Result value (numeric or string)"),
      }),
    },
    async (input) => {
      try {
        const result = await addResult(authUserId, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e: unknown) {
        return { content: [{ type: "text" as const, text: (e as Error).message }], isError: true };
      }
    },
  );
}
