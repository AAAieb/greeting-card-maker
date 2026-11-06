import { defineConfig } from "vite";

export default defineConfig({
  // React 18 automatic JSX runtime, handled by esbuild — no plugin needed.
  esbuild: { jsx: "automatic" },
  server: { port: 5173, host: true },
});
