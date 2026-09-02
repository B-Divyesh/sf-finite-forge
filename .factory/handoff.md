# Finite Forge repair handoff

## Result

This repair removes the unavailable checkout from the campaign path. All five
plans are included locally for $0, and a normal new campaign now reaches
**Final beacon lit** only after its fifth completed plan.

The previous release blockers were repaired:

- A loss restarts the same plan and earns no tool.
- Four earned tools start the fifth plan; that plan, rather than plan four,
  triggers the ending.
- `/demo`, `?demo=1`, the header Demo link, and the first-screen action use an
  isolated `demo:finite-forge:v1` namespace. The demo is seeded at plan three
  with Bellows, a Pattern plate, 2 ore, 2 parts, and 2 charge.
- Motion now controls board pulse styling. Sound now uses a short Web Audio
  cue only after a production gesture. Both settings persist. The settings
  panel respects its `hidden` and `aria-expanded` state.
- Routes set title, description, Open Graph title/description, canonical URL,
  destination scroll, and focus. The skip link focuses `main`.
- All checked navigation, settings, demo, form-equivalent, and footer targets
  are at least 44 px high at 390 px.
- `public/staticwebapp.config.json` is copied into `dist/`; it sets the CSP,
  immutable `/assets/*` cache headers, and an HTTP 404 rewrite to the dedicated
  `/404.html` page.

The public claim registry now includes the final ending, price availability,
exact shortest campaign path (63 actions), pointer/M/S/C input, tick budget,
local persistence, no offline income, and demo request privacy.

## Verification

Run from a clean install:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Observed on 2026-09-02 UTC:

- `npm test`: PASS — 6 Vitest tests and 13 Chromium browser tests.
- All eight individual claim commands in `.factory/claims.json`: PASS.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS. `dist/` contains `staticwebapp.config.json`,
  `404.html`, hashed JS/CSS, and the original hero asset.
- Build sizes: JS 12.35 KB raw / 4.84 KB gzip; CSS 7.30 KB raw / 2.27 KB gzip;
  hero WebP 27.95 KB.
- Browser checks cover desktop and 390×844 mobile, keyboard (including the
  skip link), pointer/M/S/C production, seeded-demo isolation, loss recovery,
  the fifth-plan ending, settings persistence/effects, route focus/scroll,
  metadata, mobile targets, and Axe serious/critical violations on `/`,
  `/demo`, `/privacy`, `/terms`, and an unknown route.
- `npm audit --omit=dev`: PASS — 0 production vulnerabilities.

I also visually inspected the desktop landing page and the 390 px seeded-demo
board. The mobile board shows its stocked plan and production controls without
requiring setup.

## Deployment and known gaps

The artifact remains a Vite static browser game deployed from `dist/`. No
product infrastructure, DNS, billing, or external service was changed. The
checkout integration was deliberately removed because its registered endpoint
was unavailable; the complete campaign is now honestly included rather than
claiming a paid path that cannot complete.

Push this commit to `main` to use the repository's static deployment flow.
After deployment, re-check `/demo`, `/missing-plan` (HTTP 404), the CSP and
immutable asset headers, and live build identity. There are no known product
gaps in the repaired local artifact.
