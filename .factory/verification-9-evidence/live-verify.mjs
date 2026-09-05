import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'https://finite-forge.sociobot.in';
const out = '/work/repo/.factory/verification-9-evidence';
const browser = await chromium.launch({ headless: true });
const results = {};

for (const device of [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, mobile: false },
  { name: 'phone', viewport: { width: 390, height: 844 }, mobile: true }
]) {
  const context = await browser.newContext({ viewport: device.viewport, isMobile: device.mobile, hasTouch: device.mobile });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  const first = {
    status: response?.status(), title: await page.title(), h1: await page.locator('h1').innerText(),
    audience: await page.locator('.lede').innerText(),
    primary: await page.getByRole('button', { name: 'Try it with sample data' }).innerText(),
    primaryExplanation: await page.locator('.hero-actions span').innerText(), scrollY: await page.evaluate(() => scrollY),
    boardBox: await page.locator('.game-shell').boundingBox(), h1Count: await page.locator('h1').count(),
    mainCount: await page.locator('main').count(), lang: await page.locator('html').getAttribute('lang')
  };
  await page.screenshot({ path: `${out}/live-${device.name}-fresh.png`, fullPage: false });
  const realBefore = await page.evaluate(() => localStorage.getItem('finite-forge:v4'));
  if (device.mobile) await page.getByRole('button', { name: 'Try it with sample data' }).tap();
  else await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await page.waitForURL(`${base}/demo`);
  const seeded = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-forge:v4')));
  const sample = {
    url: page.url(), title: await page.title(), label: await page.getByText('Demo — sample data, nothing is saved').innerText(),
    heading: await page.locator('.game-shell h2').innerText(), progress: await page.getByText('7 / 24 production ticks used.').innerText(),
    seeded: seeded.campaign,
    realUnchangedAfterEnter: (await page.evaluate(() => localStorage.getItem('finite-forge:v4'))) === realBefore
  };
  if (device.mobile) await page.getByRole('button', { name: /Mine ore/ }).tap();
  else await page.getByRole('button', { name: /Mine ore/ }).click();
  sample.labelAfterPlay = await page.getByText('Demo — sample data, nothing is saved').innerText();
  sample.tickAfterPlay = (await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-forge:v4')))).campaign.tick;
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const reset = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-forge:v4')));
  sample.reset = { run: reset.campaign.run, shift: reset.campaign.shift, tick: reset.campaign.tick, stock: reset.campaign.stock, owned: reset.campaign.owned };
  sample.realUnchangedAfterReset = (await page.evaluate(() => localStorage.getItem('finite-forge:v4'))) === realBefore;
  await page.screenshot({ path: `${out}/live-${device.name}-demo.png`, fullPage: false });
  await page.getByRole('button', { name: 'Start for real' }).click();
  sample.exit = { url: page.url(), demoRemoved: await page.evaluate(() => localStorage.getItem('demo:finite-forge:v4') === null),
    realRestored: (await page.evaluate(() => localStorage.getItem('finite-forge:v4'))) === realBefore };
  results[device.name] = { first, sample, consoleErrors, pageErrors, offOriginBeforeLicense: requests.filter(url => new URL(url).origin !== base) };
  await context.close();
}

const keyboard = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const keyboardPage = await keyboard.newPage();
await keyboardPage.goto(`${base}/demo`, { waitUntil: 'networkidle' });
await keyboardPage.keyboard.press('Tab');
const firstFocus = await keyboardPage.evaluate(() => document.activeElement?.textContent?.trim());
await keyboardPage.keyboard.press('Enter');
const skipTarget = await keyboardPage.evaluate(() => document.activeElement?.id);
await keyboardPage.keyboard.press('m');
const tickAfterM = (await keyboardPage.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-forge:v4')))).campaign.tick;
results.keyboard = { firstFocus, skipTarget, tickAfterM };
await keyboard.close();
await browser.close();
writeFileSync('.factory/verification-9-evidence/live-independent.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
