import { defineConfig } from 'playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run dev -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }
});
