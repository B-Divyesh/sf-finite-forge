import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const results = [];
for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-plan']) {
  const response = await page.goto(`https://finite-forge.sociobot.in${path}`, { waitUntil: 'networkidle' });
  const scan = await new AxeBuilder({ page }).analyze();
  results.push({ path, status: response?.status(), violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) });
}
await browser.close();
writeFileSync('.factory/verification-9-evidence/axe-live.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
