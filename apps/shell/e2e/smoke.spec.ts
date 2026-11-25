import { test, expect, Page } from '@playwright/test';

async function attachErrorCollectors(page: Page): Promise<{ consoleErrors: string[]; pageErrors: string[] }> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  return { consoleErrors, pageErrors };
}

async function assertAppRootNonEmpty(page: Page): Promise<void> {
  const appRoot = page.locator('app-root');
  await expect(appRoot).toBeVisible();
  const childCount = await page.evaluate(
    () => document.querySelector('app-root')?.childElementCount ?? 0,
  );
  expect(childCount).toBeGreaterThan(0);
}

test.describe('Shell Micro-Frontend Smoke & Resilience Suite', () => {
  test('shell root loads successfully and renders children into app-root with zero console errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
    await page.goto('/');

    // Assert app-root is non-empty (prevents silent blank page regressions)
    await assertAppRootNonEmpty(page);

    // Verify brand title and navigation links
    await expect(page.locator('.brand .title')).toContainText('Command Center');
    const navItems = page.locator('.nav-item');
    await expect(navItems).toHaveCount(5);

    // Check cluster overview cards for all 4 applications
    await expect(page.locator('.cluster-grid .cluster-card')).toHaveCount(4);
    await expect(page.locator('.cluster-grid')).toContainText('Shell (Host)');
    await expect(page.locator('.cluster-grid')).toContainText('remote-tasks');
    await expect(page.locator('.cluster-grid')).toContainText('remote-analytics');
    await expect(page.locator('.cluster-grid')).toContainText('remote-settings');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('theme toggle switches shell and propagates data-theme attribute', async ({ page }) => {
    const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
    await page.goto('/');
    await assertAppRootNonEmpty(page);

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('.theme-toggle');
    await themeBtn.click();

    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBe(initialTheme);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('navigates to and renders Remote Tasks MFE with zero console errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
    await page.goto('/tasks');
    await assertAppRootNonEmpty(page);

    // Verify tasks board component renders inside the shell
    const board = page.locator('mfe-tasks-board');
    await expect(board).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.board-header h2')).toContainText('Engineering Tasks Board');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('navigates to and renders Remote Analytics MFE with zero console errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
    await page.goto('/analytics');
    await assertAppRootNonEmpty(page);

    // Verify analytics dashboard renders with inline SVG charts
    const dashboard = page.locator('mfe-analytics-dashboard');
    await expect(dashboard).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.header-intro h2')).toContainText(
      'Engineering Throughput & Analytics',
    );

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('navigates to and renders Remote Settings MFE for authorized roles with zero console errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
    await page.goto('/settings');
    await assertAppRootNonEmpty(page);

    // Verify settings form component renders
    const settingsForm = page.locator('mfe-settings-form');
    await expect(settingsForm).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.settings-wrapper h2')).toContainText(
      'Environment & User Preferences',
    );

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('standalone remotes render non-empty app-root with zero console errors', async ({ page }) => {
    const remoteUrls = [
      'http://localhost:4201',
      'http://localhost:4202',
      'http://localhost:4203',
    ];

    for (const url of remoteUrls) {
      const { consoleErrors, pageErrors } = await attachErrorCollectors(page);
      await page.goto(url);
      await assertAppRootNonEmpty(page);
      expect(consoleErrors, `Console errors on ${url}`).toEqual([]);
      expect(pageErrors, `Page errors on ${url}`).toEqual([]);
    }
  });

  test('displays graceful fallback UI when navigating to unavailable remote', async ({ page }) => {
    await page.goto('/missing-remote');

    // Verify graceful fallback component renders instead of a blank page
    const fallback = page.locator('app-remote-fallback');
    await expect(fallback).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.fallback-card h2')).toContainText('Micro-Frontend Unavailable');

    // Verify retry button exists and is interactive
    const retryBtn = page.locator('.action-bar button');
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toContainText('Retry Connection');
  });

  test('role-based guard blocks unauthorized viewer role from settings', async ({ page }) => {
    await page.goto('/');

    // Cycle role step by step until viewer is confirmed active
    const rolePill = page.locator('.role-pill');
    await expect(rolePill).toBeVisible();
    await expect(rolePill).toHaveText('architect');

    await rolePill.click(); // architect -> admin
    await expect(rolePill).toHaveText('admin');

    await rolePill.click(); // admin -> developer
    await expect(rolePill).toHaveText('developer');

    await rolePill.click(); // developer -> viewer
    await expect(rolePill).toHaveText('viewer');

    // Attempt SPA navigation to guarded settings remote via nav link
    const settingsNav = page.locator('a[routerLink="/settings"]');
    await settingsNav.click();

    // Guard should redirect to /access-denied
    await expect(page).toHaveURL(/.*access-denied/);
    await expect(page.locator('app-access-denied')).toBeVisible();
    await expect(page.locator('.denied-card h2')).toContainText('Access Denied');
    await expect(page.locator('.role-badge')).toContainText('viewer');
  });
});
