import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL:           BASE_URL,
    trace:             "on-first-retry",
    screenshot:        "only-on-failure",
    actionTimeout:     10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `pnpm dev -- -p ${PORT}`,
    url:     BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_URL:  "http://localhost:4000",
      NEXTAUTH_URL:         BASE_URL,
      NEXTAUTH_SECRET:      "e2e-test-secret-not-real",
      // Disable Google OAuth in tests
      GOOGLE_CLIENT_ID:     "",
      GOOGLE_CLIENT_SECRET: "",
    },
  },
});
