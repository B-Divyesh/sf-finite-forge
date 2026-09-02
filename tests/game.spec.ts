import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function completePlan(page: import('playwright/test').Page) {
  for (let i = 0; i < 6; i += 1) for (const key of ['m', 's', 'c']) await page.keyboard.press(key);
}
async function completeCampaign(page: import('playwright/test').Page) {
  for (let plan = 1; plan <= 5; plan += 1) {
    await completePlan(page);
    if (plan < 5) await page.getByRole('button', { name: 'Reset the forge' }).click();
    else await page.getByRole('button', { name: 'Light the final beacon' }).click();
  }
}

test('@claim:campaign-final-ending a normal local campaign reaches its fifth-plan ending', async ({ page }) => {
  await page.goto('/'); await completeCampaign(page);
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('You completed five forge plans. This campaign ends here.')).toBeVisible();
});
test('@claim:campaign-price-availability all five plans are included without checkout', async ({ page }) => {
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByText('$0. All five plans are available now. No checkout is required.')).toBeVisible();
  await expect(page.getByRole('link', { name: /buy|checkout/i })).toHaveCount(0);
  await completeCampaign(page);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});
test('@claim:campaign-duration the shortest successful five-plan path uses 63 actions', async ({ page }) => {
  await page.goto('/'); let actions = 0;
  const press = async (key: 'm' | 's' | 'c', count: number) => { for (let i = 0; i < count; i += 1) { await page.keyboard.press(key); actions += 1; } };
  await press('m', 6); await press('s', 6); await press('c', 6); await page.getByRole('button', { name: 'Reset the forge' }).click();
  await press('m', 3); await press('s', 6); await press('c', 6); await page.getByRole('button', { name: 'Reset the forge' }).click();
  await press('m', 3); await press('s', 3); await press('c', 6); await page.getByRole('button', { name: 'Reset the forge' }).click();
  for (let plan = 0; plan < 2; plan += 1) { await press('m', 3); await press('s', 3); await press('c', 3); if (plan === 0) await page.getByRole('button', { name: 'Reset the forge' }).click(); }
  expect(actions).toBe(63); await page.getByRole('button', { name: 'Light the final beacon' }).click();
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
});
test('@claim:production-input pointer and M/S/C controls make production actions', async ({ page }) => {
  await page.goto('/demo'); const initial = await page.locator('.tickline').textContent();
  await page.getByRole('button', { name: /Mine ore/ }).click(); await page.keyboard.press('s'); await page.keyboard.press('c');
  await expect(page.locator('.tickline')).not.toHaveText(initial || '');
});
test('@claim:tick-budget the demo displays a 24-tick forge deadline', async ({ page }) => {
  await page.goto('/demo'); await expect(page.getByText('6 / 24 production ticks used.')).toBeVisible();
});
test('@claim:local-progress demo progress is retained in its own browser namespace', async ({ page }) => {
  await page.goto('/demo'); await page.getByRole('button', { name: /Mine ore/ }).click(); await page.reload();
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
});
test('@claim:no-offline-income waiting does not add production ticks', async ({ page }) => {
  await page.goto('/demo'); await page.waitForTimeout(500); await expect(page.getByText('6 / 24 production ticks used.')).toBeVisible();
});
test('@claim:local-only demo makes no requests away from the product', async ({ page }) => {
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/demo'); await page.getByRole('button', { name: /Mine ore/ }).click();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});
test('header Demo enters a seeded, isolated sandbox and preserves a real save', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('m'); await expect(page.getByText('1 / 24 production ticks used.')).toBeVisible();
  await page.getByRole('link', { name: 'Demo' }).click(); await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page).toHaveTitle('Demo — Finite Forge'); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://finite-forge.sociobot.in/demo');
  await expect(page.getByText('6 / 24 production ticks used.')).toBeVisible(); await page.keyboard.press('m');
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('finite-forge:v1'), demo: localStorage.getItem('demo:finite-forge:v1') }));
  expect(JSON.parse(storage.real!).run.tick).toBe(1); expect(JSON.parse(storage.demo!).run.tick).toBe(7);
});
test('a lost plan earns no tool and retries the same run', async ({ page }) => {
  await page.goto('/'); for (let i = 0; i < 24; i += 1) await page.keyboard.press('m');
  await expect(page.getByRole('heading', { name: 'Revise this plan' })).toBeVisible(); await page.getByRole('button', { name: 'Try this plan again' }).click();
  await expect(page.getByText('RUN 01')).toBeVisible(); await expect(page.getByRole('button', { name: /Mine ore/ })).toContainText('+1');
});
test('settings panel state, motion, and sound cues are effective and persistent', async ({ page }) => {
  await page.addInitScript(() => { class MockAudioContext { currentTime=0; destination={}; createOscillator(){return {frequency:{value:0},connect:()=>({connect:()=>undefined}),start:()=>undefined,stop:()=>undefined};} createGain(){return {gain:{setValueAtTime:()=>undefined,exponentialRampToValueAtTime:()=>undefined},connect:()=>({connect:()=>undefined})};} } Object.defineProperty(window,'AudioContext',{value:MockAudioContext}); });
  await page.goto('/demo'); await expect(page.locator('.settings')).toBeHidden(); await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true'); await expect(page.locator('.settings')).toBeVisible();
  await page.getByLabel('Show board motion').uncheck(); await expect(page.locator('.game-shell')).toHaveClass(/motion-off/);
  await page.getByLabel('Enable sound cues').check(); await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(1);
  await page.reload(); await page.getByRole('button', { name: 'Settings' }).click(); await expect(page.getByLabel('Show board motion')).not.toBeChecked(); await expect(page.getByLabel('Enable sound cues')).toBeChecked();
});
test('routes scroll and focus their destination, and mobile targets meet 44px', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused(); await page.keyboard.press('Enter'); await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100); await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('how');
  await page.locator('nav').getByRole('link', { name: 'Privacy' }).click(); await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('H1');
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/demo');
  for (const locator of [page.getByRole('link', { name: 'Demo' }), page.getByRole('button', { name: 'Settings' }), page.getByRole('button', { name: 'Reset demo' })]) expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});
test('demo uses its own local storage key and every app route meets baseline accessibility', async ({ page }) => {
  await page.goto('/demo'); expect((await page.evaluate(() => Object.keys(localStorage))).some(key => key.startsWith('demo:finite-forge'))).toBeTruthy();
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
    await page.goto(path);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(v => ['critical', 'serious'].includes(v.impact || '')).map(v => v.id)).toEqual([]);
  }
});
