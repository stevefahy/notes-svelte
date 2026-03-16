import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // default is 500 (kB)
  },
  plugins: [
    nodePolyfills({
      globals: { Buffer: true },
    }),
    svelte(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      open: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: "127.0.0.1",
    hmr: {
      host: "localhost",
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        proxyTimeout: 60000, // wait for server (e.g. MongoDB timeout ~5s dev, ~15s prod)
      },
    },
  },
});
