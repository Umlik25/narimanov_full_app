import { expect, test } from '@playwright/test';

const routes = [
  ['/admin/dashboard', 'Operations Dashboard'],
  ['/admin/map', 'Live Situation Map'],
  ['/admin/ai-review', 'AI Review Panel'],
  ['/report', 'Manual Report'],
  ['/tasks', 'Operational Tasks'],
  ['/admin/analytics', 'Analytics & Reports'],
  ['/admin/issues/ISS-1004', 'Issue Details / Assignment'],
  ['/my-reports', 'My Reports'],
] as const;

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:8081';

test('login and main V2 routes render without runtime errors', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('narimanov-role', 'admin'));
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(baseUrl);
  await expect(page.getByText('Welcome Back!')).toBeVisible();
  await expect(page.getByText('Better Operations.')).toBeVisible();

  await page.getByText('Sign In', { exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText('Operations Dashboard')).toBeVisible();

  for (const [route, title] of routes) {
    await page.goto(`${baseUrl}${route}`);
    await expect(page.getByText(title).first()).toBeVisible();
    if (route === '/admin/dashboard' || route === '/admin/map') {
      await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 8000 });
    }
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 12);
    expect(horizontalOverflow).toBeFalsy();
  }

  expect(errors.filter((error) => !error.includes('shadow* style props are deprecated'))).toEqual([]);
});

test('role routing and demo actions update visually', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });

  await page.goto(baseUrl);
  await page.getByText('User', { exact: true }).click();
  await page.getByText('Sign In', { exact: true }).click();
  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByText('Manual Report').first()).toBeVisible();
  await page.goto(`${baseUrl}/admin/dashboard`);
  await expect(page).toHaveURL(/\/report/);

  await page.goto(baseUrl);
  await page.getByText('Sign In', { exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText('Operations Dashboard')).toBeVisible();

  await page.goto(`${baseUrl}/report`);
  await page.getByText('Submit Report', { exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/map/, { timeout: 3000 });

  await page.goto(`${baseUrl}/admin/ai-review`);
  await page.getByText('Approve').first().click();
  await expect(page.getByText('Detection approved and official issue created.')).toBeVisible();
  await page.getByText('Reject').first().click();
  await expect(page.getByText('Detection rejected from review queue.')).toBeVisible();

  await page.goto(`${baseUrl}/admin/issues/ISS-1004`);
  await page.getByText('Set as In Progress').click();
  await expect(page.getByText('In progress').first()).toBeVisible();
  await page.getByText('Mark as Resolved').click();
  await expect(page.getByText('Resolved').first()).toBeVisible();

  await page.goto(`${baseUrl}/tasks`);
  await page.getByText('Start Work').first().click();
  await expect(page.getByText('Pause Work').first()).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Upload Proof').first().click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('assets/images/icon.png');
  await expect(page.getByText('Proof Uploaded').first()).toBeVisible();
  await page.getByText('Mark Resolved').first().click();
  await expect(page.getByText('Resolved').first()).toBeVisible();
});

test('global menus and mobile layout are usable', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('narimanov-role', 'admin'));
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`${baseUrl}/admin/dashboard`);
  await page.getByText('Need help?').click();
  await expect(page.getByText('Narimanov AI Assistant')).toBeVisible();
  await page.getByText('Show overdue issues').click();
  await expect(page.getByText(/ISS-/).first()).toBeVisible();
  await page.goto(`${baseUrl}/admin/dashboard`);
  await page.getByText('Admin', { exact: true }).last().click();
  await expect(page.getByText('Switch to User')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, title] of routes.slice(0, 6)) {
    await page.goto(`${baseUrl}${route}`);
    await expect(page.getByText(title).first()).toBeVisible();
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 12);
    expect(horizontalOverflow).toBeFalsy();
  }
});

test('dashboard, analytics, and AI review controls do real work', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('narimanov-role', 'admin'));
  await page.setViewportSize({ width: 1600, height: 1000 });

  await page.goto(`${baseUrl}/admin/dashboard`);
  await page.getByLabel('Open dashboard date range').click();
  await expect(page.getByText('Select date range')).toBeVisible();
  await page.getByText('Today', { exact: true }).click();
  await page.getByLabel('Open notifications').click();
  await expect(page.getByText('Notifications')).toBeVisible();

  await page.goto(`${baseUrl}/admin/analytics`);
  await page.getByText('Last 7 Days').click();
  await page.getByText('Last 30 Days').click();
  await expect(page.getByText('Last 30 Days').first()).toBeVisible();
  await page.getByText('Filters', { exact: true }).click();
  await page.getByText('Overdue only').click();
  await expect(page.getByText('Showing: Overdue only')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Export Report').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('narimanov-ops-report.csv');

  await page.goto(`${baseUrl}/admin/ai-review`);
  await page.getByText('Merge').first().click();
  await expect(page.getByText('Merge detection')).toBeVisible();
  await page.getByText(/ISS-/).first().click();
  await expect(page.getByText(/Detection merged with ISS-/)).toBeVisible();
});
