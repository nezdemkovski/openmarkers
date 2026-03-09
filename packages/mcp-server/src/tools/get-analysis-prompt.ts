import { z } from "zod";
import { getAnalysisPromptForProfile } from "@openmarkers/db";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpText, mcpError } from "../index";

export function registerGetAnalysisPrompt(server: McpServer, authUserId: string) {
  server.registerTool(
    "get_analysis_prompt",
    {
      description:
        "Generate a structured AI analysis prompt containing all of the profile's lab data, out-of-range values, trends, correlations, and biological age. Ready to paste into ChatGPT or Claude for medical analysis.",
      inputSchema: z.object({
        profile_id: z.coerce.number().int().describe("Profile ID"),
        lang: z.enum(["en", "cs", "ru", "is"]).default("en").describe("Language for the analysis response"),
      }),
    },
    async ({ profile_id, lang }) => {
      const prompt = await getAnalysisPromptForProfile(profile_id, authUserId, lang);
      if (!prompt) return mcpError("Profile not found");
      return mcpText(prompt);
    },
  );
}
