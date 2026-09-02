import { expect, test, type Page } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  CAMPAIGN_SHIFT_COUNT,
  PRODUCTION_TICKS,
  RUN_COUNT,
  SHIFTS_PER_RUN,
  act,
  advanceShift,
  chooseTool,
  newCampaign,
  tools,
  type Action,
  type Campaign,
  type ToolId
} from '../src/engine';
import { winningActions } from './game-helpers';

const keyFor: Record<Action, string> = { mine: 'm', shape: 's', charge: 'c' };
const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];
const realKey = 'finite-forge:v4';
const licenseKey = 'sb_license:finite-forge';
const licenseCacheKey = 'sb_license_verdict:finite-forge';

async function winShift(page: Page, campaign: Campaign): Promise<Campaign> {
  for (const action of winningActions(campaign)) {
    await page.keyboard.press(keyFor[action]);
    campaign = act(campaign, action);
  }
  return campaign;
}

async function winRun(page: Page, campaign: Campaign): Promise<Campaign> {
  for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
    campaign = await winShift(page, campaign);
    if (shift < SHIFTS_PER_RUN) {
      await page.getByRole('button', { name: `Start blueprint ${shift + 1}` }).click();
      campaign = advanceShift(campaign);
    }
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

function completedFirstRun(): Campaign {
  let campaign = newCampaign();
  for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
    campaign = winningActions(campaign).reduce((state, action) => act(state, action), campaign);
    if (shift < SHIFTS_PER_RUN) campaign = advanceShift(campaign);
  }
  return campaign;
}

async function seedLicense(page: Page) {
  await page.addInitScript(({ tokenKey, cacheKey }) => {
    localStorage.setItem(tokenKey, 'test-license');
    localStorage.setItem(cacheKey, JSON.stringify({ valid: true, checkedAt: Date.now() }));
  }, { tokenKey: licenseKey, cacheKey: licenseCacheKey });
}

test('regression: the board exposes each 24-tick blueprint inside a 30-blueprint campaign', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Build a beacon before sunset.' })).toBeVisible();
  await expect(page.getByText('30 blueprints with 24 ticks each')).toBeVisible();
  await expect(page.getByText('24 ticks left')).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('0/30 blueprints complete')).toBeVisible();
  await expect(page.locator('.tick-track i')).toHaveCount(PRODUCTION_TICKS);
});

test('@claim:campaign-final-ending @claim:restart-resets-state a title-to-ending run restarts every campaign field', async ({ page }) => {
  test.setTimeout(90_000);
  await seedLicense(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Build a beacon before sunset.' })).toBeVisible();
  await completeCampaign(page);
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('You charged five beacons through thirty blueprints before sunset. This campaign ends here.')).toBeVisible();
  await expect(page.getByText('5 / 5')).toBeVisible();
  await expect(page.getByText(`${CAMPAIGN_SHIFT_COUNT} / ${CAMPAIGN_SHIFT_COUNT}`)).toBeVisible();
  await page.getByRole('button', { name: 'Start a new campaign' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · BLUEPRINT 1\/6 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('0/30 blueprints complete')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
  await expect(page.locator('.resource-grid')).toContainText('0 / 13');
});

test('@claim:sunset-deadline tick 24 causes a real loss and retry resets the blueprint', async ({ page }) => {
  await page.goto('/');
  for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) await page.keyboard.press('m');
  await expect(page.getByRole('heading', { name: 'Sunset reached' })).toBeVisible();
  await expect(page.getByText('0 ticks left')).toBeVisible();
  await expect(page.getByText('Blueprint 1 reached 0 of 13 charge when tick 24 ended.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry this blueprint' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · BLUEPRINT 1\/6 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
});

test('@claim:campaign-unlock the first run is free and a returned one-time license opens runs two through five', async ({ page }) => {
  const runComplete = completedFirstRun();
  await page.addInitScript(({ key, campaign }) => localStorage.setItem(key, JSON.stringify({ campaign, settings: { motion: true, sound: false } })), { key: realKey, campaign: runComplete });
  let verifyCalls = 0;
  await page.route('https://api.sociobot.in/api/v1/products/finite-forge/verify?license=return-license', async route => {
    verifyCalls += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy full campaign — $5 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/finite-forge/checkout');
  await page.goto('/?license=return-license');
  await expect(page).not.toHaveURL(/license=/);
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
  await expect.poll(() => verifyCalls).toBe(1);
  const stored = await page.evaluate(({ tokenKey, cacheKey }) => ({ token: localStorage.getItem(tokenKey), verdict: localStorage.getItem(cacheKey) }), { tokenKey: licenseKey, cacheKey: licenseCacheKey });
  expect(stored.token).toBe('return-license');
  expect(JSON.parse(stored.verdict!)).toMatchObject({ valid: true });
});

test('@claim:campaign-structure the campaign has five runs, six blueprints each, and a free first run', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('30 blueprints with 24 ticks each')).toBeVisible();
  await expect(page.getByText('0/30 blueprints complete')).toBeVisible();
  await expect(page.locator('.deadline')).toHaveAttribute('aria-label', 'Sunset deadline: 24 of 24 production ticks remain');
  const campaign = await winRun(page, newCampaign());
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
  await expect(page.getByText('Run one is free. Pay $5 once for runs two through five.')).toBeVisible();
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
  await expect(page.locator('.forecast li.current')).toContainText('Mine ore +1');
  await page.keyboard.press('m');
  await expect(page.locator('.resource-grid > div').first().locator('b')).toHaveText('2');
  await expect(page.getByText('1 / 24 production ticks used.')).toBeVisible();
});

test('@claim:local-progress demo progress is retained in its own browser namespace', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.reload();
  await expect(page.getByText('8 / 24 production ticks used.')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('demo:finite-forge:v4');
  expect(keys).not.toContain(realKey);
});

test('@claim:no-offline-income waiting does not spend ticks or make materials', async ({ page }) => {
  await page.goto('/demo');
  const before = await page.locator('.resource-grid').textContent();
  await page.waitForTimeout(600);
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  expect(await page.locator('.resource-grid').textContent()).toBe(before);
});

test('@claim:local-only normal and demo play make no requests away from the page origin before a license is supplied', async ({ page }) => {
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
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('finite-forge:v4'), demo: localStorage.getItem('demo:finite-forge:v4') }));
  expect(JSON.parse(storage.real!).campaign.tick).toBe(1);
  expect(JSON.parse(storage.demo!).campaign.tick).toBe(7);
});

test('@claim:retry-retains-tools a failed later blueprint keeps earlier reset tools after retry', async ({ page }) => {
  let campaign = chooseTool(completedFirstRun(), 'lens');
  await page.addInitScript(({ key, campaign: stored, tokenKey, cacheKey }) => {
    localStorage.setItem(key, JSON.stringify({ campaign: stored, settings: { motion: true, sound: false } }));
    localStorage.setItem(tokenKey, 'test-license');
    localStorage.setItem(cacheKey, JSON.stringify({ valid: true, checkedAt: Date.now() }));
  }, { key: realKey, campaign, tokenKey: licenseKey, cacheKey: licenseCacheKey });
  await page.goto('/');
  await expect(page.getByText('Focusing lens')).toBeVisible();
  for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) await page.keyboard.press('m');
  await expect(page.getByRole('heading', { name: 'Sunset reached' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry this blueprint' }).click();
  await expect(page.getByText('Focusing lens')).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  campaign = campaign;
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
  const targets = [
    page.getByRole('link', { name: 'Skip to game' }),
    page.locator('nav').getByRole('link', { name: 'Demo' }),
    page.getByRole('button', { name: 'Settings' }),
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('button', { name: /Mine ore/ }),
    page.locator('footer').getByRole('link', { name: 'Privacy' }),
    page.locator('footer').getByRole('link', { name: 'Terms' })
  ];
  for (const locator of targets) {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
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
  await page.evaluate(key => localStorage.setItem(key, '{bad json'), realKey);
  await page.reload();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect(page.getByText('1 / 24 production ticks used.')).toBeVisible();
});
