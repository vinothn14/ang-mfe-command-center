import { test, expect } from '@playwright/test';

test.describe('Shell Micro-Frontend Smoke & Resilience Suite', () => {
  test('shell root loads successfully and renders children into app-root', async ({ page }) => {
    await page.goto('/');

    // Assert app-root is non-empty (prevents silent blank page regressions)
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();
    const childCount = await page.evaluate(
      () => document.querySelector('app-root')?.childElementCount ?? 0,
    );
    expect(childCount).toBeGreaterThan(0);

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
  });

  test('theme toggle switches shell and propagates data-theme attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('.theme-toggle');
    await themeBtn.click();

    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBe(initialTheme);
  });

  test('navigates to and renders Remote Tasks MFE', async ({ page }) => {
    await page.goto('/tasks');

    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Verify tasks board component renders inside the shell
    const board = page.locator('mfe-tasks-board');
    await expect(board).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.board-header h2')).toContainText('Engineering Tasks Board');
  });

  test('navigates to and renders Remote Analytics MFE', async ({ page }) => {
    await page.goto('/analytics');

    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Verify analytics dashboard renders with inline SVG charts
    const dashboard = page.locator('mfe-analytics-dashboard');
    await expect(dashboard).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.header-intro h2')).toContainText(
      'Engineering Throughput & Analytics',
    );
  });

  test('navigates to and renders Remote Settings MFE for authorized roles', async ({ page }) => {
    await page.goto('/settings');

    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Verify settings form component renders
    const settingsForm = page.locator('mfe-settings-form');
    await expect(settingsForm).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.settings-wrapper h2')).toContainText(
      'Environment & User Preferences',
    );
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
