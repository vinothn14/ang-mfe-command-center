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
      },
    },
  ],
  webServer: [
    {
      command: 'npx nx serve remote-tasks --port 4201',
      url: 'http://localhost:4201/remoteEntry.json',
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NX_DAEMON: 'false',
      },
    },
    {
      command: 'npx nx serve remote-analytics --port 4202',
      url: 'http://localhost:4202/remoteEntry.json',
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NX_DAEMON: 'false',
      },
    },
    {
      command: 'npx nx serve remote-settings --port 4203',
      url: 'http://localhost:4203/remoteEntry.json',
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NX_DAEMON: 'false',
      },
    },
    {
      command: 'npx nx serve remote-widget --port 4204',
      url: 'http://localhost:4204/widget-entry.js',
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NX_DAEMON: 'false',
      },
    },
    {
      command: 'npx nx serve shell --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NX_DAEMON: 'false',
      },
    },
  ],
});
