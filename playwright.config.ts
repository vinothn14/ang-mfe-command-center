import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Angular MFE Command Center.
 * Designed for smoke testing shell orchestration, remote loading, and fallback resilience.
 */
export default defineConfig({
  testDir: './apps/shell/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env['SHELL_URL'] || 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run start:all',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      NX_DAEMON: 'false',
    },
  },
});
