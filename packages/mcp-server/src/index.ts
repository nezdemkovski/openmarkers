import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerListProfiles } from "./tools/list-profiles";
import { registerGetProfile } from "./tools/get-profile";
import { registerCreateProfile } from "./tools/create-profile";
import { registerUpdateProfile } from "./tools/update-profile";
import { registerDeleteProfile } from "./tools/delete-profile";
import { registerListCategories } from "./tools/list-categories";
import { registerListBiomarkers } from "./tools/list-biomarkers";
import { registerGetBiomarker } from "./tools/get-biomarker";
import { registerCreateBiomarker } from "./tools/create-biomarker";
import { registerUpdateBiomarker } from "./tools/update-biomarker";
import { registerAddResult } from "./tools/add-result";
import { registerUpdateResult } from "./tools/update-result";
import { registerDeleteResult } from "./tools/delete-result";
import { registerGetProfileResults } from "./tools/get-profile-results";
import { registerImportProfileData } from "./tools/import-profile-data";
import { registerGetSchema } from "./tools/get-schema";
import { registerExportProfileData } from "./tools/export-profile-data";
import { registerGetBiologicalAge } from "./tools/get-biological-age";
import { registerGetAnalysisPrompt } from "./tools/get-analysis-prompt";
import { registerGetTimeline } from "./tools/get-timeline";
import { registerGetDateSnapshot } from "./tools/get-date-snapshot";
import { registerCompareDates } from "./tools/compare-dates";
import { registerGetTrends } from "./tools/get-trends";
import { registerGetDaysSinceLastTest } from "./tools/get-days-since-last-test";
import { registerGetCorrelations } from "./tools/get-correlations";

export function mcpJson(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function mcpText(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }] };
}

export function mcpError(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function createMcpServer(authUserId: string): McpServer {
  const server = new McpServer({ name: "openmarkers", version: "1.0.0" });

  registerListProfiles(server, authUserId);
  registerGetProfile(server, authUserId);
  registerCreateProfile(server, authUserId);
  registerUpdateProfile(server, authUserId);
  registerDeleteProfile(server, authUserId);
  registerListCategories(server);
  registerListBiomarkers(server);
  registerGetBiomarker(server);
  registerCreateBiomarker(server);
  registerUpdateBiomarker(server);
  registerAddResult(server, authUserId);
  registerUpdateResult(server, authUserId);
  registerDeleteResult(server, authUserId);
  registerGetProfileResults(server, authUserId);

  registerImportProfileData(server, authUserId);
  registerExportProfileData(server, authUserId);
  registerGetSchema(server);

  registerGetBiologicalAge(server, authUserId);
  registerGetAnalysisPrompt(server, authUserId);
  registerGetTimeline(server, authUserId);
  registerGetDateSnapshot(server, authUserId);
  registerCompareDates(server, authUserId);
  registerGetTrends(server, authUserId);
  registerGetDaysSinceLastTest(server, authUserId);
  registerGetCorrelations(server, authUserId);

  return server;
}

export function createMcpHandler(): (req: Request, authUserId: string) => Promise<Response> {
  return async (req: Request, authUserId: string) => {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createMcpServer(authUserId);
    await server.connect(transport);
    return transport.handleRequest(req);
  };
}
