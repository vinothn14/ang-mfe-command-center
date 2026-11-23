import { test, expect } from '@playwright/test';

test.describe('Shell Micro-Frontend Smoke & Resilience Suite', () => {
  test('shell root loads successfully with nav header and cluster overview', async ({ page }) => {
    await page.goto('/');

    // Check title and shell brand
    await expect(page.locator('.brand-title')).toContainText('MFE Command Center');
    await expect(page.locator('.brand-badge')).toContainText('SHELL');

    // Check all remote navigation links are present
    const navLinks = page.locator('.nav-link');
    await expect(navLinks).toHaveCount(4);
    await expect(navLinks.nth(0)).toContainText('Overview');
    await expect(navLinks.nth(1)).toContainText('Tasks');
    await expect(navLinks.nth(2)).toContainText('Analytics');
    await expect(navLinks.nth(3)).toContainText('Settings');

    // Check cluster overview cards for all remotes
    await expect(page.locator('.cluster-grid .card')).toHaveCount(4);
    await expect(page.locator('.cluster-grid')).toContainText('Remote Tasks');
    await expect(page.locator('.cluster-grid')).toContainText('Remote Analytics');
    await expect(page.locator('.cluster-grid')).toContainText('Remote Settings');
  });

  test('theme toggle switches shell and propagates theme attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('.theme-btn');
    await themeBtn.click();

    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBe(initialTheme);
  });

  test('displays graceful fallback UI when a remote is unavailable or fails to load', async ({ page }) => {
    // Intercept remoteEntry request and simulate offline / network failure
    await page.route('**/remoteEntry.json', (route) => {
      route.abort('failed');
    });

    await page.goto('/tasks');

    // Verify graceful fallback component renders instead of crashing the shell
    const fallback = page.locator('mfe-remote-fallback');
    await expect(fallback).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.fallback-title')).toContainText('Remote Unavailable');
    await expect(page.locator('.fallback-message')).toContainText('Failed to load remote module');

    // Verify retry button exists and is interactive
    const retryBtn = page.locator('.retry-btn');
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toContainText('Retry Connection');
  });

  test('role-based guard blocks unauthorized roles from settings', async ({ page }) => {
    // Switch role to viewer if not already
    await page.goto('/');
    const roleSelect = page.locator('#role-select');
    await roleSelect.selectOption('viewer');

    // Attempt to navigate to guarded settings remote
    await page.goto('/settings');

    // Guard should redirect to /access-denied
    await expect(page).toHaveURL(/.*access-denied/);
    await expect(page.locator('.access-denied-card')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Access Denied');
    await expect(page.locator('.card-body')).toContainText('viewer');
  });
});
