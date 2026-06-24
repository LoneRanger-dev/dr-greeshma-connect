import { defineConfig } from "vitest/config";
import path from "path";

// Uses vitest's built-in esbuild JSX transform — avoids @vitejs/plugin-react
// ESM-only import error in CJS config loading.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles:  ["./vitest.setup.ts"],
    globals:     true,
    include:     ["src/tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include:  ["src/**/*.{ts,tsx}"],
      exclude:  ["src/tests/**", "src/types/**", "**/*.d.ts"],
    },
  },
  esbuild: {
    jsx:             "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
