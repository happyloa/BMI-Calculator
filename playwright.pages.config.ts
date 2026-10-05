import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

const liveURL = process.env.BMI_E2E_BASE_URL;

export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: liveURL ?? "http://127.0.0.1:3100" },
  webServer: liveURL ? undefined : {
    command: "npm run preview:pages -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
