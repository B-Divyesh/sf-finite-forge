# Finite Forge repair 4 handoff

## Result

The game repair is deployed at <https://finite-forge.sociobot.in> from
application commit `5364928` (`repair campaign duration and unlock flow`).
The five-run end screen and restart remain intact. The client-side Sociobot
one-time license flow is implemented and covered, but the billing product is
not registered by the external billing service yet; see **Known gap** before
calling this release-ready.

## Fixed

- Replaced the five immediate boards with 30 authored blueprints: six
  blueprints inside each of the preserved five beacon runs. Every blueprint
  retains its 24-tick sunset deadline, deterministic daylight forecast, loss,
  retry, touch, pointer, and M/S/C controls.
- The exhaustive invariant is stronger, not weaker. It enumerates all 24 reset
  tool orders, solves all 30 blueprints in each order (720 solved boards), and
  asserts every order reaches the fifth-beacon ending before every sunset. The
  solver caches only identical gameplay states and reconstructs its path, so
  each distinct owned-tool state still receives a shortest-path solution.
- The duration contract is now evidence-backed: all tool orders require at
  least 400 production decisions. At the documented five seconds to read the
  forecast and choose a decision, the intended session is 33.3 minutes.
  `@claim:campaign-duration` asserts the 30–45 minute range, 30 blueprints,
  400-decision lower bound, and calibration.
- Implemented the researched purchase model in the static client: first run
  free; a $5 one-time license for runs two through five; checkout link,
  returned `?license=` capture and URL cleanup, local `sb_license:finite-forge`
  storage, cached daily verification, optimistic offline-first paint, revoked
  license handling, and paste-to-restore.
- Added claim regressions for generated-image disclosure/provenance and retry
  retaining earlier reset tools.
- Enlarged the skip link, navigation, and footer links to at least 44×44 CSS
  px at 390 px. The automated mobile test measures both dimensions.
- Rebuilt the true static 404 with the standard skip link, wordmark, Demo/How
  it works/Privacy navigation, footer, Privacy/Terms links, build id,
  canonical metadata, and product styling. Live `/missing-plan` returns HTTP
  404 and contains the required skeleton.
- Added `https://api.sociobot.in` to CSP `connect-src` solely for buyer license
  verification. Normal and demo play make same-origin requests only.

## Verification

From a clean install on 2026-09-02 UTC:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm audit
```

Results: `npm test` passed (10 Vitest tests, 16 Playwright tests); typecheck,
lint, build, and both audits passed. The exhaustive unit test completed inside
the suite in about one second, well under Vitest's default five-second limit.
All 18 exact commands in `.factory/claims.json` were also run separately and
passed.

Production build sizes: JS 19,342 bytes raw / 7,210 gzip; CSS 11,715 bytes
raw / 3,064 gzip; blueprint WebP 27,948 bytes. A production-preview mobile
Lighthouse run scored performance 100, accessibility 100, best practices 100,
and SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0.

Browser coverage includes desktop and 390×844 mobile, keyboard, pointer,
touch, reduced motion, local persistence, demo isolation, malformed-save
recovery, no service worker/offline-income behavior, route focus, Axe serious
and critical checks, mobile target measurements, license return/verification,
and full campaign/restart. The factory URL verifier passed live at 720 ms with
no console errors, `lang=en`, one h1, a main landmark, image alt text, and
labeled buttons. Its screenshots and report are in
`.factory/verify-repair-4-live/`.

Live checks:

- `/`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-plan` returns
  404.
- HTML sends CSP with `frame-ancestors 'none'` and the explicit Sociobot
  `connect-src`, `nosniff`, and strict-origin referrer policy. Hashed assets
  are `public, max-age=31536000, immutable`.
- Local/live SHA-256 matched for HTML
  `be2e2d822dca7695ae18eccf0d87e0ce3b7f5ca162286ad13c7c3e60c6833efe`, JS
  `22b16c7cf3dcca8bb3475b88af9dfa5fa509a64ee647f98b03cd1668e4a42c5b`, CSS
  `151bac2bd782399b6de6f9f995f3801dddf31341b123f35bf361f4d1c1b5297c`, and
  hero image `eb361c2b317a2725e476663d205a66a4f528ec87a5bfd1429ba2af614111b4df`.

The independent report's original test-timeout symptom was hardware-sensitive:
the unmodified candidate's clean `npm test` ran in 4.87 seconds on this worker,
whereas verification recorded 7.19–7.45 seconds and failed its five-second
Vitest timeout. The root cause was the uncached allocation-heavy solver; the
new exhaustive regression is materially broader and no longer near that limit.

## Known gap

The required factory registrar (`fleet/new-paid-product.sh`) is not present in
this worker image and no billing-registration credential or API route is
available to this product worker. A live read-only checkout check after deploy
returns HTTP 404 with `{"error":"enabled factory product","status":404}` for
`/api/v1/products/finite-forge/checkout`. No approved $0 product-model
deviation exists, so this is not described as an approved deviation.

The static client is ready for the registered product endpoint and its mocked
return/verification regression passes. Factory billing must register
`finite-forge` at $5 with return URL `https://finite-forge.sociobot.in/` before
the checkout link can work for a real buyer. Until then, the free first run,
demo, and all local gameplay work, but the paid continuation cannot be bought.
