FROM oven/bun:1.3.10-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY packages/db/package.json packages/db/
COPY packages/mcp-server/package.json packages/mcp-server/
COPY packages/web/package.json packages/web/
RUN bun install --frozen-lockfile

# Build frontend
FROM deps AS build
COPY . .
ARG VITE_NEON_AUTH_URL
ENV VITE_NEON_AUTH_URL=$VITE_NEON_AUTH_URL
RUN bun run build

# Production
FROM base
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "packages/web/src/server.ts"]
