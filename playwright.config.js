const { defineConfig } = require("@playwright/test");

const useRealBackend = process.env.PLAYWRIGHT_USE_REAL_BACKEND === "true";

module.exports = defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:19006",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: useRealBackend ? "npm run web:e2e:real" : "npm run web:e2e",
    url: useRealBackend
      ? "http://127.0.0.1:19006/__playwright_ready"
      : "http://127.0.0.1:19006",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
