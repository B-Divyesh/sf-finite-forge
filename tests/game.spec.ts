import { test, expect, type Page } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { challengeFor, planShiftCounts, runProgram, stocksMatch, tools, type Action, type ToolId } from '../src/engine';

const keyFor: Record<Action, string> = { mine: 'm', shape: 's', charge: 'c' };
const toolOrder: ToolId[] = ['sundial', 'bellows', 'pattern', 'lens'];
async function solveShift(page: Page, plan: number, shift: number, owned: ToolId[]) {
  const challenge = challengeFor(plan, shift, owned);
  for (const action of challenge.solution) await page.keyboard.press(keyFor[action]);
  await page.keyboard.press('Enter');
}
async function completeCampaign(page: Page) {
  const owned: ToolId[] = [];
  for (let plan = 1; plan <= 5; plan += 1) {
    for (let shift = 0; shift < planShiftCounts[plan - 1]; shift += 1) await solveShift(page, plan, shift, owned);
    if (plan < 5) {
      const tool = toolOrder[plan - 1];
      await page.getByRole('button', { name: new RegExp(tools[tool].name) }).click();
      owned.push(tool);
    }
  }
}
function wrongProgram(plan: number, shift: number, owned: ToolId[]): Action[] {
  const challenge = challengeFor(plan, shift, owned);
  const actions: Action[] = ['mine', 'shape', 'charge'];
  for (let encoded = 0; encoded < 3 ** challenge.slots; encoded += 1) {
    const program = Array.from({ length: challenge.slots }, (_, slot) => actions[Math.floor(encoded / (3 ** slot)) % 3]);
    if (!stocksMatch(runProgram(challenge.stock, program, challenge.boosts, owned), challenge.target)) return program;
  }
  throw new Error('no wrong program');
}

test('regression: the old 63 instantaneous production inputs cannot skip planning shifts', async ({ page }) => {
  await page.goto('/');
  for (let index = 0; index < 21; index += 1) for (const key of ['m', 's', 'c']) await page.keyboard.press(key);
  await expect(page.getByText('0/30 shifts solved')).toBeVisible();
  await expect(page.getByText('PLAN 01 · SHIFT 1/4')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toHaveCount(0);
});

test('@claim:campaign-final-ending a normal local campaign reaches the real ending after thirty shifts', async ({ page }) => {
  await page.goto('/'); await completeCampaign(page);
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('You solved all 30 planning shifts across five forge plans.')).toBeVisible();
  await expect(page.getByText('30/30 shifts solved')).toBeVisible();
});

test('@claim:campaign-price-availability all five plans are included without checkout', async ({ page }) => {
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByText('$0. All five plans are available now. No checkout is required.')).toBeVisible();
  await expect(page.getByRole('link', { name: /buy|checkout/i })).toHaveCount(0);
  await completeCampaign(page);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:campaign-structure the campaign contains five plans and thirty strategic shifts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('30 planning shifts across five plans')).toBeVisible();
  await expect(page.getByText('0/30 shifts solved')).toBeVisible();
  await expect(page.getByText('Program 2 actions')).toBeVisible();
  await solveShift(page, 1, 0, []);
  await expect(page.getByText('1/30 shifts solved')).toBeVisible();
});

test('@claim:production-input pointer and M/S/C program actions', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mine ore' }).click(); await page.keyboard.press('s'); await page.keyboard.press('c');
  await expect(page.locator('.program li.filled')).toHaveCount(3);
  await expect(page.getByText('Projected', { exact: true })).toBeVisible();
});

test('@claim:local-progress demo progress is retained in its own browser namespace', async ({ page }) => {
  await page.goto('/demo'); await page.getByRole('button', { name: 'Mine ore' }).click(); await page.reload();
  await expect(page.locator('.program li.filled')).toHaveCount(1);
  await expect(page.locator('.program li.filled')).toContainText('Mine ore');
});

test('@claim:no-offline-income waiting does not solve a shift or alter progress', async ({ page }) => {
  await page.goto('/demo'); await page.waitForTimeout(500);
  await expect(page.getByText('11/30 shifts solved')).toBeVisible();
  await expect(page.locator('.program li.filled')).toHaveCount(0);
});

test('@claim:local-only demo makes no requests away from the product', async ({ page }) => {
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/demo'); await page.getByRole('button', { name: 'Mine ore' }).click();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('header Demo enters a seeded isolated sandbox and preserves a real save', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('m');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page).toHaveTitle('Demo — Finite Forge');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://finite-forge.sociobot.in/demo');
  await expect(page.getByText('11/30 shifts solved')).toBeVisible(); await page.keyboard.press('m');
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('finite-forge:v2'), demo: localStorage.getItem('demo:finite-forge:v2') }));
  expect(JSON.parse(storage.real!).campaign.program).toEqual(['mine']);
  expect(JSON.parse(storage.demo!).campaign.program).toEqual(['mine']);
});

test('three missed orders lose the plan and retry recovers without a tool', async ({ page }) => {
  await page.goto('/'); const wrong = wrongProgram(1, 0, []);
  for (let attempt = 0; attempt < 3; attempt += 1) { for (const action of wrong) await page.keyboard.press(keyFor[action]); await page.keyboard.press('Enter'); }
  await expect(page.getByRole('heading', { name: 'Revise plan 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry this plan' }).click();
  await expect(page.getByText('PLAN 01 · SHIFT 1/4')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
});

test('tool choice changes the next plan and remains a player decision', async ({ page }) => {
  await page.goto('/'); for (let shift = 0; shift < 4; shift += 1) await solveShift(page, 1, shift, []);
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
  await expect(page.locator('.tool-choices button')).toHaveCount(4);
  await page.getByRole('button', { name: /Sun dial/ }).click();
  await expect(page.getByText('PLAN 02 · SHIFT 1/5')).toBeVisible();
  await expect(page.getByLabel('4 plan integrity remaining')).toBeVisible();
});

test('settings panel state, motion, and sound cues are effective and persistent', async ({ page }) => {
  await page.addInitScript(() => { class MockAudioContext { currentTime=0; destination={}; createOscillator(){return {frequency:{value:0},connect:()=>({connect:()=>undefined}),start:()=>undefined,stop:()=>undefined};} createGain(){return {gain:{setValueAtTime:()=>undefined,exponentialRampToValueAtTime:()=>undefined},connect:()=>({connect:()=>undefined})};} } Object.defineProperty(window,'AudioContext',{value:MockAudioContext}); });
  await page.goto('/demo'); await expect(page.locator('.settings')).toBeHidden(); await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByLabel('Show board motion').uncheck(); await expect(page.locator('.game-shell')).toHaveClass(/motion-off/);
  await page.getByLabel('Enable sound cues').check(); await page.getByRole('button', { name: 'Mine ore' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(1);
  await page.reload(); await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Show board motion')).not.toBeChecked(); await expect(page.getByLabel('Enable sound cues')).toBeChecked();
});

test('routes scroll and focus their destination, and mobile targets meet 44px', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused(); await page.keyboard.press('Enter'); await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100); await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('how');
  await page.locator('nav').getByRole('link', { name: 'Privacy' }).click(); await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('H1');
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/demo');
  for (const locator of [page.getByRole('link', { name: 'Demo' }), page.getByRole('button', { name: 'Settings' }), page.getByRole('button', { name: 'Reset demo' }), page.getByRole('button', { name: 'Mine ore' })]) expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('demo uses its own local storage key and every app route meets baseline accessibility', async ({ page }) => {
  await page.goto('/demo'); expect((await page.evaluate(() => Object.keys(localStorage))).some(key => key === 'demo:finite-forge:v2')).toBeTruthy();
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
    await page.goto(path); const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(v => ['critical', 'serious'].includes(v.impact || '')).map(v => v.id)).toEqual([]);
  }
});
