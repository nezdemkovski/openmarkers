import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { registerAddResult } from "./tools/add-result";
import { registerCompareDates } from "./tools/compare-dates";
import { registerCreateBiomarker } from "./tools/create-biomarker";
import { registerCreateProfile } from "./tools/create-profile";
import { registerDeleteProfile } from "./tools/delete-profile";
import { registerDeleteResult } from "./tools/delete-result";
import { registerExportProfileData } from "./tools/export-profile-data";
import { registerGetAnalysisPrompt } from "./tools/get-analysis-prompt";
import { registerGetBiologicalAge } from "./tools/get-biological-age";
import { registerGetBiomarker } from "./tools/get-biomarker";
import { registerGetCorrelations } from "./tools/get-correlations";
import { registerGetDateSnapshot } from "./tools/get-date-snapshot";
import { registerGetDaysSinceLastTest } from "./tools/get-days-since-last-test";
import { registerGetProfile } from "./tools/get-profile";
import { registerGetProfileResults } from "./tools/get-profile-results";
import { registerGetSchema } from "./tools/get-schema";
import { registerGetTimeline } from "./tools/get-timeline";
import { registerGetTrends } from "./tools/get-trends";
import { registerImportProfileData } from "./tools/import-profile-data";
import { registerListBiomarkers } from "./tools/list-biomarkers";
import { registerListCategories } from "./tools/list-categories";
import { registerListProfiles } from "./tools/list-profiles";
import { registerUpdateBiomarker } from "./tools/update-biomarker";
import { registerUpdateProfile } from "./tools/update-profile";
import { registerUpdateResult } from "./tools/update-result";

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

export function createMcpHandler(): (
  req: Request,
  authUserId: string,
) => Promise<Response> {
  return async (req: Request, authUserId: string) => {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createMcpServer(authUserId);
    await server.connect(transport);
    return transport.handleRequest(req);
  };
}
