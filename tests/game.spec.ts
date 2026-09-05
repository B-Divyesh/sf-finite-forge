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
  newShift,
  tools,
  type Action,
  type Campaign,
  type ToolId
} from '../src/engine';
import { winningActions } from './game-helpers';

const keyFor: Record<Action, string> = { mine: 'm', shape: 's', charge: 'c' };
const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];
const demoKey = 'demo:finite-forge:v4';
const demoLicenseKey = 'demo:sb_license:finite-forge';
const demoLicenseCacheKey = 'demo:sb_license_verdict:finite-forge';
const verifyEndpoint = 'https://api.sociobot.in/api/v1/products/finite-forge/verify';
const checkoutEndpoint = 'https://api.sociobot.in/api/v1/products/finite-forge/checkout';
const evidenceDir = process.env.EVIDENCE_DIR;

type DemoSave = { campaign: Campaign; settings: { motion: boolean; sound: boolean }; demoEntitled: boolean };
type LicenseVerdict = { token: string; valid: boolean; checkedAt: number };

function demoSave(campaign: Campaign, demoEntitled = true): DemoSave {
  return { campaign, settings: { motion: true, sound: false }, demoEntitled };
}

async function seedDemo(page: Page, campaign: Campaign, demoEntitled = true, license?: { token: string; verdict?: LicenseVerdict }) {
  await page.addInitScript(({ saveKey, save, licenseKey, cacheKey, storedLicense }) => {
    localStorage.setItem(saveKey, JSON.stringify(save));
    if (storedLicense) {
      localStorage.setItem(licenseKey, storedLicense.token);
      if (storedLicense.verdict) localStorage.setItem(cacheKey, JSON.stringify(storedLicense.verdict));
    }
  }, {
    saveKey: demoKey,
    save: demoSave(campaign, demoEntitled),
    licenseKey: demoLicenseKey,
    cacheKey: demoLicenseCacheKey,
    storedLicense: license
  });
}

async function readDemoSave(page: Page): Promise<DemoSave> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), demoKey) as Promise<DemoSave>;
}

async function captureEvidence(page: Page, name: string) {
  if (evidenceDir) await page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: true });
}

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

function completeRun(campaign: Campaign): Campaign {
  for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
    campaign = winningActions(campaign).reduce((state, action) => act(state, action), campaign);
    if (shift < SHIFTS_PER_RUN) campaign = advanceShift(campaign);
  }
  return campaign;
}

function completedFirstRun(): Campaign {
  return completeRun(newCampaign());
}

function completedCampaign(): Campaign {
  let campaign = newCampaign();
  for (let run = 1; run <= RUN_COUNT; run += 1) {
    campaign = completeRun(campaign);
    if (run < RUN_COUNT) campaign = chooseTool(campaign, toolOrder[run - 1]);
  }
  return campaign;
}

function runCompleteWithTools(previousTools: ToolId[]): Campaign {
  let campaign = newCampaign();
  for (const tool of previousTools) {
    campaign = completeRun(campaign);
    campaign = chooseTool(campaign, tool);
  }
  return completeRun(campaign);
}

test('regression: the sample board exposes a populated 24-tick blueprint', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('17 ticks left')).toBeVisible();
  await expect(page.locator('.tick-track i')).toHaveCount(PRODUCTION_TICKS);
  await expect(page.locator('.resource-grid')).toContainText('4');
});

test('@claim:checkout-available the advertised full-campaign URL redirects to hosted Sociobot checkout', async ({ request }) => {
  const response = await request.get(checkoutEndpoint, { maxRedirects: 0 });
  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  expect(response.headers().location).toMatch(/^https:\/\/.+/);
});

test('@claim:campaign-final-ending a demo campaign reaches the genuine final ending after five runs', async ({ page }) => {
  test.setTimeout(120_000);
  await seedDemo(page, newCampaign());
  await page.goto('/demo');
  await completeCampaign(page);
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('5 / 5')).toBeVisible();
  await expect(page.getByText(`${CAMPAIGN_SHIFT_COUNT} / ${CAMPAIGN_SHIFT_COUNT}`)).toBeVisible();
  await captureEvidence(page, 'live-final-ending');
});

test('@claim:restart-resets-state starting a new demo campaign resets every visible campaign field', async ({ page }) => {
  await seedDemo(page, completedCampaign());
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await page.getByRole('button', { name: 'Start a new campaign' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · BLUEPRINT 1\/6 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
  await expect(page.getByText('0/30 blueprints complete')).toBeVisible();
  await expect(page.getByText('No reset tools yet.')).toBeVisible();
  await expect(page.locator('.resource-grid')).toContainText('0 / 13');
});

test('@claim:sunset-deadline a demo blueprint loses at tick 24 and retries at sunrise', async ({ page }) => {
  await seedDemo(page, newCampaign());
  await page.goto('/demo');
  for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) await page.keyboard.press('m');
  await expect(page.getByRole('heading', { name: 'Sunset reached' })).toBeVisible();
  await expect(page.getByText('0 ticks left')).toBeVisible();
  await captureEvidence(page, 'live-sunset-loss');
  await page.getByRole('button', { name: 'Retry this blueprint' }).click();
  await expect(page.getByRole('heading', { name: /RUN 01 · BLUEPRINT 1\/6 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
});

test('@claim:campaign-unlock a returned verified license opens the paid demo gate after the free run', async ({ page }) => {
  await seedDemo(page, completedFirstRun(), false);
  let verifyCalls = 0;
  await page.route(`${verifyEndpoint}?license=returned-demo`, async route => {
    verifyCalls += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
  await page.goto('/demo?license=returned-demo');
  await expect(page).not.toHaveURL(/license=/);
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
  await expect.poll(() => verifyCalls).toBe(1);
  const cache = await page.evaluate(key => localStorage.getItem(key), demoLicenseCacheKey);
  expect(JSON.parse(cache!)).toMatchObject({ token: 'returned-demo', valid: true });
});

test('@claim:license-verification an unverified license remains locked while the demo is offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await seedDemo(page, completedFirstRun(), false);
  await page.goto('/demo');
  await context.setOffline(true);
  await page.getByLabel('Have a license? Paste it.').fill('invented-license');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
  await expect(page.getByText('Could not verify this license. Connect to the internet, then try again.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toHaveCount(0);
  const verdict = await page.evaluate(key => localStorage.getItem(key), demoLicenseCacheKey);
  expect(verdict).toBeNull();
  await context.close();
});

test('@claim:license-restore pasting a valid license restores paid demo runs after verification', async ({ page }) => {
  await seedDemo(page, completedFirstRun(), false);
  await page.route(`${verifyEndpoint}?license=pasted-demo`, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/demo');
  await page.getByLabel('Have a license? Paste it.').fill('pasted-demo');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
});

test('@claim:license-offline-cache a previously verified license keeps paid demo progress available offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const token = 'cached-demo';
  await seedDemo(page, completedFirstRun(), false, { token, verdict: { token, valid: true, checkedAt: Date.now() } });
  await page.goto('/demo');
  await context.setOffline(true);
  await page.getByRole('button', { name: /Bellows/ }).click();
  await expect(page.getByRole('heading', { name: /RUN 02 · BLUEPRINT 1\/6/ })).toBeVisible();
  await context.close();
});

test('@claim:license-daily-check a verified demo license is checked no more than once each day', async ({ page }) => {
  const token = 'daily-demo';
  const freshVerdict: LicenseVerdict = { token, valid: true, checkedAt: Date.now() };
  await seedDemo(page, completedFirstRun(), false, { token, verdict: freshVerdict });
  let verifyCalls = 0;
  await page.route(`${verifyEndpoint}?license=${token}`, async route => {
    verifyCalls += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Choose one reset tool' })).toBeVisible();
  expect(verifyCalls).toBe(0);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: demoLicenseCacheKey,
    value: { ...freshVerdict, checkedAt: Date.now() - 25 * 60 * 60 * 1000 }
  });
  await page.locator('nav').getByRole('link', { name: 'Demo' }).click();
  await expect.poll(() => verifyCalls).toBe(1);
  await page.locator('nav').getByRole('link', { name: 'Demo' }).click();
  await expect.poll(() => verifyCalls).toBe(1);
});

test('@claim:license-revocation a revoked license locks the paid demo gate after its daily check', async ({ page }) => {
  const token = 'revoked-demo';
  await seedDemo(page, completedFirstRun(), false, {
    token,
    verdict: { token, valid: true, checkedAt: Date.now() - 25 * 60 * 60 * 1000 }
  });
  await page.route(`${verifyEndpoint}?license=${token}`, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked' }) }));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
  await expect(page.getByText('License no longer active. Buy the full campaign or paste an active license.')).toBeVisible();
});

test('@claim:campaign-structure the demo shows five runs of six blueprints and stops after the free run', async ({ page }) => {
  await seedDemo(page, completedFirstRun(), false);
  await page.goto('/demo');
  await expect(page.getByText('30 blueprints with 24 ticks each')).toBeVisible();
  await expect(page.getByText('6/30 blueprints complete')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Full campaign unlock' })).toBeVisible();
});

test('@claim:production-input touch, pointer, and M/S/C input each spend a demo production tick', async ({ page, browser }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.keyboard.press('m');
  await page.keyboard.press('s');
  await page.keyboard.press('c');
  await expect(page.getByText('11 / 24 production ticks used.')).toBeVisible();
  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/demo');
  await touchPage.getByRole('button', { name: /Mine ore/ }).tap();
  await expect(touchPage.getByText('8 / 24 production ticks used.')).toBeVisible();
  await touchContext.close();
});

test('@claim:sunlight-bonus the displayed demo forecast produces the shown extra unit', async ({ page }) => {
  await page.goto('/demo');
  const forecast = page.locator('.forecast li.current');
  const forecastText = await forecast.innerText();
  const action = forecastText.includes('Mine ore') ? 'mine' : forecastText.includes('Shape parts') ? 'shape' : 'charge';
  const button = page.locator(`[data-action="${action}"]`);
  const expectedYield = Number((await button.locator('small').innerText()).match(/\+(\d+)/)?.[1]);
  const before = await readDemoSave(page);
  await button.click();
  const after = await readDemoSave(page);
  const resource = action === 'mine' ? 'ore' : action === 'shape' ? 'parts' : 'charge';
  expect(expectedYield).toBeGreaterThanOrEqual(2);
  expect(after.campaign.stock[resource]).toBe(before.campaign.stock[resource] + expectedYield - (action === 'shape' ? 0 : 0));
});

test('@claim:reset-tools choosing each reset tool changes a later demo run', async ({ page }) => {
  const cases: Array<{ tool: ToolId; previous: ToolId[]; action?: Action }> = [
    { tool: 'bellows', previous: [], action: 'mine' },
    { tool: 'pattern', previous: ['bellows'], action: 'shape' },
    { tool: 'lens', previous: ['bellows', 'pattern'], action: 'charge' },
    { tool: 'stockpile', previous: ['bellows', 'pattern', 'lens'] }
  ];
  await page.goto('/demo');
  for (const item of cases) {
    const state = runCompleteWithTools(item.previous);
    await page.evaluate(({ key, save }) => localStorage.setItem(key, JSON.stringify(save)), { key: demoKey, save: demoSave(state) });
    await page.reload();
    await page.getByRole('button', { name: new RegExp(tools[item.tool].name) }).click();
    const afterChoice = await readDemoSave(page);
    expect(afterChoice.campaign.owned).toContain(item.tool);
    if (item.tool === 'stockpile') {
      expect(afterChoice.campaign.stock).toEqual({ ore: 1, parts: 1, charge: 0 });
      continue;
    }
    if (item.action === 'shape') await page.locator('[data-action="mine"]').click();
    if (item.action === 'charge') {
      await page.locator('[data-action="mine"]').click();
      await page.locator('[data-action="shape"]').click();
    }
    const control = page.locator(`[data-action="${item.action}"]`);
    const displayedYield = Number((await control.locator('small').innerText()).match(/\+(\d+)/)?.[1]);
    const before = await readDemoSave(page);
    await control.click();
    const after = await readDemoSave(page);
    const resource = item.action === 'mine' ? 'ore' : item.action === 'shape' ? 'parts' : 'charge';
    expect(after.campaign.stock[resource]).toBe(before.campaign.stock[resource] + displayedYield);
  }
});

test('@claim:demo-sandbox reset restores the stocked sample without creating real progress', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('finite-forge:v4'), demo: localStorage.getItem('demo:finite-forge:v4') }));
  expect(storage.real).toBeNull();
  expect(JSON.parse(storage.demo!)).toMatchObject({ campaign: { run: 3, shift: 4, tick: 7 }, demoEntitled: true });
});

test('@claim:local-progress demo progress stays in the demo namespace after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await page.reload();
  await expect(page.getByText('8 / 24 production ticks used.')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain(demoKey);
  expect(keys).not.toContain('finite-forge:v4');
});

test('@claim:no-offline-income waiting in the demo does not spend ticks or make materials', async ({ page }) => {
  await page.goto('/demo');
  const before = await readDemoSave(page);
  await page.waitForTimeout(600);
  const after = await readDemoSave(page);
  expect(after.campaign.tick).toBe(before.campaign.tick);
  expect(after.campaign.stock).toEqual(before.campaign.stock);
});

test('@claim:local-only sample play makes no requests away from its page origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  const origin = new URL(page.url()).origin;
  await page.getByRole('button', { name: /Mine ore/ }).click();
  expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:settings-persist demo motion and sound settings work and persist', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Show board motion').uncheck();
  await page.getByLabel('Enable sound cues').check();
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Show board motion')).not.toBeChecked();
  await expect(page.getByLabel('Enable sound cues')).toBeChecked();
});

test('@claim:frame-rate-60 the 390px demo board stays near 60 fps under 4x CPU throttle', async ({ page }) => {
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

test('@claim:retry-retains-tools a failed later demo blueprint keeps its chosen reset tool', async ({ page }) => {
  const runTwo = chooseTool(completedFirstRun(), 'lens');
  await seedDemo(page, runTwo);
  await page.goto('/demo');
  await expect(page.getByText('Focusing lens')).toBeVisible();
  for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) await page.keyboard.press('m');
  await page.getByRole('button', { name: 'Retry this blueprint' }).click();
  await expect(page.getByText('Focusing lens')).toBeVisible();
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();
});

test('@claim:generated-image-provenance the demo visibly discloses and shows the generated blueprint illustration', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('footer')).toContainText('Blueprint illustration uses original generated imagery.');
  const illustration = page.getByRole('img', { name: 'A blueprint drawing of a small forge connected to a beacon tower.' });
  await expect(illustration).toBeVisible();
  expect(await illustration.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
});

test('demo routes, keyboard focus, mobile targets, reduced motion, and accessibility pass', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('how');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const locator of [
    page.getByRole('link', { name: 'Skip to game' }),
    page.locator('nav').getByRole('link', { name: 'Demo' }),
    page.getByRole('button', { name: 'Settings' }),
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('button', { name: /Mine ore/ }),
    page.locator('footer').getByRole('link', { name: 'Privacy' }),
    page.locator('footer').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const smallestVisibleText = await page.evaluate(() => Math.min(...[...document.querySelectorAll<HTMLElement>('body *')]
    .filter(element => getComputedStyle(element).display !== 'none' && element.textContent?.trim())
    .map(element => Number.parseFloat(getComputedStyle(element).fontSize))
    .filter(Number.isFinite)));
  expect(smallestVisibleText).toBeGreaterThanOrEqual(16);
  const reducedDuration = await page.locator('.resource-grid .charge b').evaluate(element => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(reducedDuration).toBeLessThanOrEqual(0.00001);
  for (const path of ['/demo', '/privacy', '/terms', '/missing-plan']) {
    await page.goto(path);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(violation => ['critical', 'serious'].includes(violation.impact || '')).map(violation => violation.id)).toEqual([]);
  }
  await page.goto('/privacy');
  expect((await page.locator('meta[name="description"]').getAttribute('content'))!.length).toBeLessThanOrEqual(155);
  await page.goto('/missing-plan');
  await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to game board' })).toBeVisible();
});

test('a malformed demo save recovers to a playable sample', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(key => localStorage.setItem(key, '{bad json'), demoKey);
  await page.reload();
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  await page.getByRole('button', { name: /Mine ore/ }).click();
  await expect(page.getByText('8 / 24 production ticks used.')).toBeVisible();
});
