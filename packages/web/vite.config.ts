import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/mcp": {
        target: "http://localhost:3000",
      },
      "/.well-known": {
        target: "http://localhost:3000",
      },
      "/authorize": {
        target: "http://localhost:3000",
      },
      "/token": {
        target: "http://localhost:3000",
      },
      "/register": {
        target: "http://localhost:3000",
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
