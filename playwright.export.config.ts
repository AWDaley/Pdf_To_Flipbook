import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/export',
  outputDir: './test-results/export',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/export', open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
