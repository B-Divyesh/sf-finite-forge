import { expect, test, type Page } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PRODUCTION_TICKS, RUN_COUNT, act, chooseTool, newCampaign, tools, type Action, type Campaign, type ToolId } from '../src/engine';
import { winningActions } from './game-helpers';

const keyFor: Record<Action, string> = { mine: 'm', shape: 's', charge: 'c' };
const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];

async function winRun(page: Page, campaign: Campaign): Promise<Campaign> {
  for (const action of winningActions(campaign)) {
    await page.keyboard.press(keyFor[action]);
    campaign = act(campaign, action);
  }
  return campaign;
}

async function completeCampaign(page: Page): Promise<Campaign> {
  let campaign = newCampaign();
  for (let run = 1; run <= RUN_COUNT; run += 1) {
    campaign = await winRun(page, campaign);
    if (run < RUN_COUNT) {
      const tool = toolOrder[run - 1];
      await page.getByRole('button', { name: new RegExp(tools[tool].name) }).click();
      campaign = chooseTool(campaign, tool);
    }
  }
  return campaign;
}

test('regression: the board exposes a 24-tick sunset deadline instead of 30 planning shifts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Build a beacon before sunset.' })).toBeVisible();
  await expect(page.getByText('24 production ticks per run')).toBeVisible();
  await expect(page.getByText('24 ticks left')).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText(/30 planning shifts/i)).toHaveCount(0);
  await expect(page.locator('.tick-track i')).toHaveCount(PRODUCTION_TICKS);
});

test('@claim:campaign-final-ending @claim:restart-resets-state a title-to-ending run restarts every campaign field', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Build a beacon before sunset.' })).toBeVisible();
  await completeCampaign(page);
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('You charged five beacons before sunset. This campaign ends here.')).toBeVisible();
  await expect(page.getByText('5/5 runs complete')).toBeVisible();
  await page.getByRole('button', { name: 'Start a new campaign' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('0/5 runs complete')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
  await expect(page.locator('.resource-grid')).toContainText('0 / 12');
});

test('@claim:sunset-deadline tick 24 causes a real loss and retry resets the run', async ({ page }) => {
  await page.goto('/');
  for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) await page.keyboard.press('m');
  await expect(page.getByRole('heading', { name: 'Sunset reached' })).toBeVisible();
  await expect(page.getByText('0 ticks left')).toBeVisible();
  await expect(page.getByText('The beacon reached 0 of 12 charge when tick 24 ended.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry this run' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
});

test('@claim:campaign-price-availability all five runs are included without checkout', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByText('$0. All five runs are available now. No checkout is required.')).toBeVisible();
  await expect(page.getByRole('link', { name: /buy|checkout/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in|log in|create account/i })).toHaveCount(0);
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:campaign-structure the campaign has five runs with 24 production ticks each', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Five runs with a final ending')).toBeVisible();
  await expect(page.getByText('0/5 runs complete')).toBeVisible();
  await expect(page.locator('.deadline')).toHaveAttribute('aria-label', 'Sunset deadline: 24 of 24 production ticks remain');
  const campaign = await winRun(page, newCampaign());
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
  await page.getByRole('button', { name: /Focusing lens/ }).click();
  await expect(page.getByRole('heading', { name: /RUN 02 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('1/5 runs complete')).toBeVisible();
  expect(campaign.status).toBe('run-complete');
});

test('@claim:production-input touch, pointer, and M/S/C inputs each spend one production tick', async ({ page, browser }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.keyboard.press('m');
  await page.keyboard.press('s');
  await page.keyboard.press('c');
  await expect(page.getByText('11 / 24 production ticks used.')).toBeVisible();
  await expect(page.locator('.resource-grid')).toContainText('Beacon charge');
  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/demo');
  await touchPage.getByRole('button', { name: /Mine ore/ }).tap();
  await expect(touchPage.getByText('8 / 24 production ticks used.')).toBeVisible();
  await touchContext.close();
});

test('@claim:sunlight-bonus the displayed sunlit station produces one extra unit', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('m');
  await page.keyboard.press('m');
  await expect(page.locator('.forecast li.current')).toContainText('Mine ore +1');
  await page.keyboard.press('m');
  await expect(page.locator('.resource-grid > div').first().locator('b')).toHaveText('4');
  await expect(page.getByText('3 / 24 production ticks used.')).toBeVisible();
});

test('@claim:local-progress demo progress is retained in its own browser namespace', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.reload();
  await expect(page.getByText('8 / 24 production ticks used.')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('demo:finite-forge:v3');
  expect(keys).not.toContain('finite-forge:v3');
});

test('@claim:no-offline-income waiting does not spend ticks or make materials', async ({ page }) => {
  await page.goto('/demo');
  const before = await page.locator('.resource-grid').textContent();
  await page.waitForTimeout(600);
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  expect(await page.locator('.resource-grid').textContent()).toBe(before);
});

test('@claim:local-only normal and demo play make no requests away from the page origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  const origin = new URL(page.url()).origin;
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.goto('/');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:settings-persist motion and sound settings work and persist', async ({ page }) => {
  await page.addInitScript(() => {
    class MockAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() { return { frequency: { value: 0 }, connect: () => ({ connect: () => undefined }), start: () => undefined, stop: () => undefined }; }
      createGain() { return { gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined }, connect: () => ({ connect: () => undefined }) }; }
    }
    Object.defineProperty(window, 'AudioContext', { value: MockAudioContext });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(0);
  await expect(page.locator('.settings')).toBeHidden();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByLabel('Show board motion').uncheck();
  await expect(page.locator('.game-shell')).toHaveClass(/motion-off/);
  await page.getByLabel('Enable sound cues').check();
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Show board motion')).not.toBeChecked();
  await expect(page.getByLabel('Enable sound cues')).toBeChecked();
});

test('@claim:frame-rate-60 the 390px board stays near 60 fps under 4x CPU throttle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  const stats = await page.evaluate(async () => new Promise<{ fps: number; p95: number }>(resolve => {
    const frames: number[] = [];
    const sample = (time: number) => {
      frames.push(time);
      if (frames.length < 181) requestAnimationFrame(sample);
      else {
        const intervals = frames.slice(1).map((value, index) => value - frames[index]).sort((a, b) => a - b);
        resolve({ fps: 1000 * (frames.length - 1) / (frames.at(-1)! - frames[0]), p95: intervals[Math.floor(intervals.length * 0.95)] });
      }
    };
    requestAnimationFrame(sample);
  }));
  await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(stats.fps).toBeGreaterThanOrEqual(55);
  expect(stats.fps).toBeLessThanOrEqual(65);
  expect(stats.p95).toBeLessThanOrEqual(20);
});

test('@claim:demo-sandbox header Demo enters a seeded sandbox and preserves the real save', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('m');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page).toHaveTitle('Demo — Finite Forge');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://finite-forge.sociobot.in/demo');
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('finite-forge:v3'), demo: localStorage.getItem('demo:finite-forge:v3') }));
  expect(JSON.parse(storage.real!).campaign.tick).toBe(1);
  expect(JSON.parse(storage.demo!).campaign.tick).toBe(7);
});

test('routes, keyboard focus, mobile targets, reduced motion, and accessibility pass', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('how');
  await page.locator('nav').getByRole('link', { name: 'Privacy' }).click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('H1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const locator of [page.getByRole('link', { name: 'Demo' }), page.getByRole('button', { name: 'Settings' }), page.getByRole('button', { name: 'Reset demo' }), page.getByRole('button', { name: /Mine ore/ })]) {
    expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  const reducedDuration = await page.locator('.resource-grid .charge b').evaluate(element => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(reducedDuration).toBeLessThanOrEqual(0.00001);

  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
    await page.goto(path);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(violation => ['critical', 'serious'].includes(violation.impact || '')).map(violation => violation.id)).toEqual([]);
  }
  expect(await page.evaluate(async () => 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0)).toBe(0);
});

test('a malformed local save recovers to a playable campaign', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('finite-forge:v3', '{bad json'));
  await page.reload();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect(page.getByText('1 / 24 production ticks used.')).toBeVisible();
});
