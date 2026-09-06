import { defineConfig } from 'playwright/test';

const desktop = { viewport: { width: 1440, height: 900 } };
const phone = { viewport: { width: 390, height: 844 }, hasTouch: true };

export default defineConfig({
  testDir: '.',
  testMatch: 'cross-engine.spec.ts',
  timeout: 180_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [
    ['line'],
    ['json', { outputFile: 'cross-engine-results.json' }]
  ],
  use: {
    baseURL: 'https://finite-forge.sociobot.in',
    headless: true,
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', ...desktop } },
    { name: 'chromium-phone', use: { browserName: 'chromium', ...phone, isMobile: true } },
    { name: 'firefox-desktop', use: { browserName: 'firefox', ...desktop } },
    { name: 'firefox-phone', use: { browserName: 'firefox', ...phone } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', ...desktop } },
    { name: 'webkit-phone', use: { browserName: 'webkit', ...phone, isMobile: true } }
  ]
});
