import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from 'playwright/test';
import {
  CAMPAIGN_SHIFT_COUNT,
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
} from '../../src/engine';
import { winningActions } from '../../tests/game-helpers';

const evidenceDir = resolve('.factory/verification-10-evidence');
const demoKey = 'demo:finite-forge:v4';
const realKey = 'finite-forge:v4';
const keyFor: Record<Action, string> = { mine: 'm', shape: 's', charge: 'c' };
const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];

async function operate(page: Page, phone: boolean, action: Action) {
  if (phone) await page.locator(`[data-action="${action}"]`).tap();
  else await page.keyboard.press(keyFor[action]);
}

async function press(page: Page, phone: boolean, name: string | RegExp) {
  const button = page.getByRole('button', { name });
  if (phone) await button.tap();
  else await button.click();
}

async function completeCampaign(page: Page, phone: boolean) {
  let campaign = newCampaign();
  for (let run = 1; run <= RUN_COUNT; run += 1) {
    for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
      for (const action of winningActions(campaign)) {
        await operate(page, phone, action);
        campaign = act(campaign, action);
      }
      if (shift < SHIFTS_PER_RUN) {
        await press(page, phone, `Start blueprint ${shift + 1}`);
        campaign = advanceShift(campaign);
      }
    }
    if (run < RUN_COUNT) {
      const tool = toolOrder[run - 1];
      await press(page, phone, new RegExp(tools[tool].name));
      campaign = chooseTool(campaign, tool);
    }
  }
  return campaign;
}

test('fresh live session reaches the final ending and passes browser boundaries', async ({ browser, page }, testInfo) => {
  const phone = testInfo.project.name.endsWith('-phone');
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requests: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => requests.push(request.url()));

  const rootResponse = await page.goto('/', { waitUntil: 'networkidle' });
  expect(rootResponse?.status()).toBe(200);
  await expect(page).toHaveTitle('Finite Forge — Build a beacon before sunset');
  await expect(page.getByRole('heading', { level: 1, name: 'Build a beacon before sunset.' })).toBeVisible();
  await expect(page.getByText('For reset fans who want a 30–45 minute campaign with a deadline.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeVisible();
  const boardTop = (await page.locator('.game-shell').boundingBox())?.y;
  expect(boardTop).toBeLessThan(phone ? 844 : 900);
  await page.screenshot({ path: `${evidenceDir}/${testInfo.project.name}-fresh.png` });

  // Create real progress, then prove the one-click sample never changes it.
  await operate(page, phone, 'mine');
  const realBefore = await page.evaluate(key => localStorage.getItem(key), realKey);
  await press(page, phone, 'Try it with sample data');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: /RUN 03 · BLUEPRINT 4\/6/ })).toBeVisible();
  await expect(page.getByText('5 / 18')).toBeVisible();
  await expect(page.getByText('Bellows')).toBeVisible();
  await expect(page.getByText('Pattern plate')).toBeVisible();
  await operate(page, phone, 'mine');
  await page.reload();
  await expect(page.getByText('8 / 24 production ticks used.')).toBeVisible();

  // Start real Web Audio only after the player enables sound and acts.
  await press(page, phone, 'Settings');
  expect(await page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(0);
  const sound = page.getByLabel('Enable sound cues');
  if (phone) await sound.tap();
  else await sound.check();
  await operate(page, phone, 'mine');
  await expect.poll(() => page.evaluate(() => (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0)).toBe(1);
  await page.reload();
  await press(page, phone, 'Settings');
  await expect(page.getByLabel('Enable sound cues')).toBeChecked();

  await press(page, phone, 'Reset demo');
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), realKey)).toBe(realBefore);
  await press(page, phone, 'Start for real');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(key => localStorage.getItem(key), realKey)).toBe(realBefore);
  expect(await page.evaluate(key => localStorage.getItem(key), demoKey)).toBeNull();

  // Malformed storage recovers to the stocked, playable sample.
  await press(page, phone, 'Try it with sample data');
  await page.evaluate(key => localStorage.setItem(key, '{bad json'), demoKey);
  await page.reload();
  await expect(page.getByText('Saved progress could not be read. A new forge run is ready.')).toBeAttached();
  await expect(page.getByText('7 / 24 production ticks used.')).toBeVisible();

  // Begin a clean deterministic campaign and play every blueprint to its real ending.
  await page.evaluate(({ key, campaign }) => localStorage.setItem(key, JSON.stringify({
    campaign,
    settings: { motion: true, sound: false },
    demoEntitled: true
  })), { key: demoKey, campaign: newCampaign() });
  await page.reload();
  const completed = await completeCampaign(page, phone);
  expect(completed.status).toBe('campaign-complete');
  await expect(page.getByRole('heading', { name: 'Final beacon lit' })).toBeVisible();
  await expect(page.getByText('5 / 5')).toBeVisible();
  await expect(page.getByText(`${CAMPAIGN_SHIFT_COUNT} / ${CAMPAIGN_SHIFT_COUNT}`)).toBeVisible();
  await page.screenshot({ path: `${evidenceDir}/${testInfo.project.name}-final.png`, fullPage: true });

  await press(page, phone, 'Start a new campaign');
  await expect(page.getByRole('heading', { name: /RUN 01 · BLUEPRINT 1\/6 · 24 TICKS TO SUNSET/ })).toBeVisible();
  await expect(page.getByText('0/30 blueprints complete')).toBeVisible();
  for (let tick = 0; tick < 24; tick += 1) await operate(page, phone, 'mine');
  await expect(page.getByRole('heading', { name: 'Sunset reached' })).toBeVisible();
  await press(page, phone, 'Retry this blueprint');
  await expect(page.getByText('0 / 24 production ticks used.')).toBeVisible();

  // Browser navigation, focus, reduced motion, routes, legal pages, and expected 404.
  if (!phone) {
    await page.goto('/demo');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  const reducedDuration = await page.locator('.resource-grid .charge b').evaluate(element => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(reducedDuration).toBeLessThanOrEqual(0.00001);
  const responsive = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    smallTargets: [...document.querySelectorAll<HTMLElement>('a,button,input')]
      .filter(element => element.getClientRects().length > 0)
      .map(element => ({ label: element.innerText || element.getAttribute('aria-label') || element.tagName, box: element.getBoundingClientRect() }))
      .filter(item => item.box.width < 44 || item.box.height < 44)
      .map(item => ({ label: item.label, width: item.box.width, height: item.box.height }))
  }));
  expect(responsive.overflow).toBeLessThanOrEqual(0);
  expect(responsive.smallTargets).toEqual([]);

  const routes = [
    ['/', 200, 'Finite Forge — Build a beacon before sunset'],
    ['/demo', 200, 'Demo — Finite Forge'],
    ['/privacy', 200, 'Privacy — Finite Forge'],
    ['/terms', 200, 'Terms — Finite Forge'],
    ['/missing-plan', 404, 'Not found — Finite Forge']
  ] as const;
  const routeEvidence = [];
  for (const [path, expectedStatus, title] of routes) {
    const response = await page.goto(path);
    expect(expectedStatus === 200 ? [200, 304] : [expectedStatus]).toContain(response?.status());
    await expect(page).toHaveTitle(title);
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('main').count()).toBe(1);
    expect(await page.locator('header').count()).toBe(1);
    expect(await page.locator('footer').count()).toBe(1);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter(item => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
    routeEvidence.push({ path, status: response?.status(), title, axeViolations: axe.violations.length });
  }
  await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to game board' })).toBeVisible();

  const offOrigin = requests.filter(url => new URL(url).origin !== 'https://finite-forge.sociobot.in');
  expect(offOrigin).toEqual([]);
  expect(pageErrors).toEqual([]);
  // A browser may log the deliberate top-level 404 as a resource error. Keep it separate.
  const screenshotHarnessErrors = consoleErrors.filter(message => message.startsWith('Refused to apply a stylesheet because its hash'));
  const unexpectedConsoleErrors = consoleErrors.filter(message => !message.includes('404') && !message.startsWith('Refused to apply a stylesheet because its hash'));
  expect(unexpectedConsoleErrors).toEqual([]);

  const outcome = {
    project: testInfo.project.name,
    engineVersion: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    viewport: page.viewportSize(),
    firstScreenBoardTop: boardTop,
    input: phone ? 'Playwright touch events' : 'keyboard M/S/C',
    audio: 'unmocked Web Audio cue initialized after enable-and-act gesture',
    fullCampaign: {
      status: completed.status,
      runsVisible: '5 / 5',
      blueprintsVisible: '30 / 30',
      productionTicks: completed.totalTicks
    },
    sampleResetAndIsolation: 'pass',
    reloadRecovery: 'pass',
    sunsetLossAndRetry: 'pass',
    responsiveTargetsAndOverflow: responsive,
    routes: routeEvidence,
    offOriginRequestsBeforeLicense: offOrigin,
    unexpectedConsoleErrors,
    screenshotHarnessErrors,
    pageErrors
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(`${evidenceDir}/${testInfo.project.name}.json`, `${JSON.stringify(outcome, null, 2)}\n`);
});
