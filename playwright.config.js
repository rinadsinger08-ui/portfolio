import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser-tests',
  workers: 1,
  reporter: 'list',
  timeout: 90_000,
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
