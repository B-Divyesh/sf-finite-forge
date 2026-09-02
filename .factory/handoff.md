# Finite Forge handoff

## Delivered

- A complete local-first browser game: 24 visible production ticks, mine →
  shape → charge actions, a lose state, reset choices, four persistent tools,
  and a final beacon ending on the fifth plan.
- Portrait-first touch controls plus M/S/C keyboard controls. Progress and
  settings persist in localStorage, and the game pauses its visual clock when
  the tab is hidden.
- `/demo` and `?demo=1` use the isolated `demo:finite-forge:v1` storage key,
  display a persistent demo banner, and provide reset/start-real actions.
- A $5 one-time full-campaign path uses Sociobot checkout, query-token capture,
  local token storage, daily license verification, and manual license restore.
- `/privacy`, `/terms`, app-style 404 fallback, metadata, sitemap, robots,
  CSP/security headers, original favicon, and a generated original blueprint
  hero illustration.

## Verification

- `npm test` passes: 4 deterministic core tests and 7 Chromium tests.
  Browser tests cover completion (`@claim:reaches-end-screen`), reset
  (`@claim:restart-resets-state`), isolated demo storage, and no serious or
  critical axe findings.
- `npm run build` passes and emits `dist/index.html`.
- Production payload: JavaScript is 4.62 KB gzip; CSS is 2.37 KB gzip; the
  optimized hero WebP is 28 KB. The source PNG is kept outside `public/`.
- A Chromium 390×844 screenshot was reviewed: the game board begins on the
  first phone screen and controls are stacked as 44 px+ targets.
- Lighthouse CLI was attempted with the supplied Chromium path but could not
  connect to Chrome in this container. Axe/browser checks and build-size
  measurements are recorded above instead.

## Assets and provenance

`assets/src/forge-blueprint.png` was generated with the factory-image
deployment on 2026-09-02. Prompt and generation metadata are in the adjacent
JSON file and `.factory/design.md`. Runtime uses its 512 px WebP derivative.

## Known gaps / next steps

- The stated $5 price is a v1 product decision; the factory must register the
  Sociobot product before checkout becomes live.
- Re-run Lighthouse in the deployment environment when a Chrome debugging
  connection is available.
