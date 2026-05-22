const AUTH_ISSUER = process.env.AUTH_JWT_ISSUER;
if (!AUTH_ISSUER) {
  throw new Error("AUTH_JWT_ISSUER environment variable is required");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function handleOAuthProtectedResource(req: Request): Response {
  const baseUrl = getBaseUrl(req);

  return Response.json(
    {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [AUTH_ISSUER],
      scopes_supported: ["openid", "profile", "email", "offline_access"],
      bearer_methods_supported: ["header"],
      resource_name: "OpenMarkers MCP Server",
      resource_documentation: `${baseUrl}/schema.json`,
    },
    { headers: CORS_HEADERS },
  );
}

export function handleMcpOAuthPreflight(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}

function getBaseUrl(req: Request): string {
  const url = new URL(req.url);
  const proto =
    req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}`;
}
