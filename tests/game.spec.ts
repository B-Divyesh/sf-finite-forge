import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function completeRun(page: import('playwright/test').Page) {
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: /Mine ore/ }).click();
    await page.getByRole('button', { name: /Shape parts/ }).click();
    await page.getByRole('button', { name: /Charge beacon/ }).click();
  }
}

test('@claim:reaches-end-screen a scripted demo run reaches beacon-ready', async ({ page }) => {
  await page.goto('/demo');
  await completeRun(page);
  await expect(page.getByRole('heading', { name: 'Reset with one new tool' })).toBeVisible();
  await expect(page.getByText('Beacon charged. Choose one tool for your next plan.')).toBeVisible();
});

test('@claim:restart-resets-state resetting starts an empty forge plan', async ({ page }) => {
  await page.goto('/demo');
  await completeRun(page);
  await page.getByRole('button', { name: 'Reset the forge' }).click();
  await expect(page.getByText('RUN 02')).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
});

test('@claim:tick-budget the demo starts with 24 visible production ticks', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
});

test('@claim:local-progress progress is retained in this browser on reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.reload();
  await expect(page.getByText('1 / 24 production ticks used.')).toBeVisible();
});

test('@claim:no-offline-income waiting does not add production ticks', async ({ page }) => {
  await page.goto('/demo');
  await page.waitForTimeout(500);
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
});

test('@claim:local-only demo makes no requests away from the product', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('demo uses its own local storage key and meets baseline accessibility', async ({ page }) => {
  await page.goto('/demo');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some(key => key.startsWith('demo:finite-forge'))).toBeTruthy();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(v => ['critical', 'serious'].includes(v.impact || '')).map(v => v.id)).toEqual([]);
});
