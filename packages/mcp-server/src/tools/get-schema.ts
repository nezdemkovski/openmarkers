import { z } from "zod";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpText, mcpError } from "../index";

let cachedSchema: string | null = null;

function loadSchema(): string | null {
  if (cachedSchema) return cachedSchema;
  const paths = [
    join(import.meta.dir, "..", "..", "..", "..", "data", "schema.json"),
    join(process.cwd(), "data", "schema.json"),
  ];
  for (const p of paths) {
    try {
      cachedSchema = readFileSync(p, "utf-8");
      return cachedSchema;
    } catch {}
  }
  return null;
}

export function registerGetSchema(server: McpServer) {
  server.registerTool(
    "get_schema",
    {
      description:
        "Get the full OpenMarkers JSON schema with all biomarker IDs, categories, units, reference ranges, and descriptions. " +
        "Use this to understand what biomarker IDs exist before adding results. " +
        "When parsing lab reports (PDFs, text), first call this tool to map test names to biomarker IDs, " +
        "then use add_result or import_user_data to store the data.",
      inputSchema: z.object({}),
    },
    async () => {
      const schema = loadSchema();
      if (!schema) return mcpError("schema.json not found");
      return mcpText(schema);
    },
  );
}
