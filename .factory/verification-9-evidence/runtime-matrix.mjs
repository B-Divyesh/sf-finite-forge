import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = 'https://finite-forge.sociobot.in';
const browser = await chromium.launch({ headless: true });
const results = { routes: [], links: [], history: {}, layout: {}, input: {}, settings: {}, platform: {} };
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  results.routes.push({
    path, status: response?.status(), title: await page.title(), h1: await page.locator('h1').allInnerTexts(),
    lang: await page.locator('html').getAttribute('lang'), main: await page.locator('main').count(),
    header: await page.locator('header').count(), footer: await page.locator('footer').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    descriptionLength: (await page.locator('meta[name="description"]').getAttribute('content'))?.length
  });
}

await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('nav').getByRole('link', { name: 'Privacy' }).click();
await page.waitForURL(`${base}/privacy`);
await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
results.history.forward = { title: await page.title(), h1: await page.locator('h1').innerText(), focus: await page.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.textContent?.trim()) };
await page.goBack();
await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
results.history.back = { url: page.url(), title: await page.title(), h1: await page.locator('h1').innerText(), focus: await page.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.textContent?.trim()) };

const hrefs = new Set();
for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  for (const href of await page.locator('a[href]').evaluateAll(as => as.map(a => a.href))) hrefs.add(href);
}
for (const href of [...hrefs].sort()) {
  if (!href.startsWith(base)) continue;
  const response = await context.request.get(href.split('#')[0], { maxRedirects: 0 });
  results.links.push({ href, status: response.status() });
}

await page.setViewportSize({ width: 640, height: 900 });
await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
results.layout.reflow640 = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
await page.emulateMedia({ reducedMotion: 'reduce' });
results.layout.reducedMotionDuration = await page.locator('.resource-grid .charge b').evaluate(el => getComputedStyle(el).animationDuration);
results.platform.serviceWorkers = await page.evaluate(async () => 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
results.layout.targets = await page.locator('a,button,input').evaluateAll(elements => elements.filter(el => {
  const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
}).map(el => { const r = el.getBoundingClientRect(); return { name: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ').slice(0, 80), width: r.width, height: r.height }; }));
results.layout.smallTargets = results.layout.targets.filter(target => target.width < 44 || target.height < 44);
results.settings.initiallyHidden = await page.locator('.settings').getAttribute('hidden') !== null;
await page.getByRole('button', { name: 'Settings' }).click();
await page.getByLabel('Show board motion').uncheck();
results.settings.motionClass = await page.locator('.game-shell').getAttribute('class');
results.settings.animationName = await page.locator('.resource-grid .charge b').evaluate(el => getComputedStyle(el).animationName);
await page.getByLabel('Enable sound cues').check();
await page.reload();
await page.getByRole('button', { name: 'Settings' }).click();
results.settings.persisted = {
  motion: await page.getByLabel('Show board motion').isChecked(),
  sound: await page.getByLabel('Enable sound cues').isChecked()
};

await page.goto(base, { waitUntil: 'networkidle' });
const beforeUnknown = JSON.parse(await page.evaluate(() => localStorage.getItem('finite-forge:v4'))).campaign.tick;
await page.keyboard.press('x');
const afterUnknown = JSON.parse(await page.evaluate(() => localStorage.getItem('finite-forge:v4'))).campaign.tick;
await page.keyboard.press('c');
const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('finite-forge:v4')));
results.input = { beforeUnknown, afterUnknown, afterMissingMaterial: saved.campaign.tick, stockAfterMissingMaterial: saved.campaign.stock,
  liveMessage: await page.locator('[aria-live="polite"]').innerText() };

await context.close();
await browser.close();
writeFileSync('.factory/verification-9-evidence/runtime-matrix.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
