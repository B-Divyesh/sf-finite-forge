# Build a beacon before sunset — review 2

Reviewed 2026-09-05 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout claim-test repair: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline: `5656c92fb24db01c271ce213783fe99df5ca15c1`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The application source has not changed after `c4cce27`. Later commits change
tests, claims metadata, evidence, and reports. Fresh live HTML, JavaScript, and
CSS SHA-256 hashes match a clean production build from the current checkout.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts were opened at scroll
position zero.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** Adjacent text says it opens run
  three with stock and two tools.

The active game board begins at 752 px on desktop and 533.2 px on phone, so it
is visible in both first viewports. The page is not a menu wall. Both contexts
returned 200 with `lang="en"`, the title `Finite Forge — Build a beacon before
sunset`, one h1, one main landmark, and no console or page errors.

Evidence: `/work/.evidence/review-2-desktop-fresh.png` and
`/work/.evidence/review-2-phone-fresh.png`.

## Sample and real-data isolation

One click opened `/demo` with the persistent label **Demo — sample data,
nothing is saved**. Desktop and phone showed run 3, blueprint 4, tick 7, 4 ore,
3 parts, 5/18 charge, Bellows, and Pattern plate.

Pointer and phone touch input changed only `demo:finite-forge:v4`. The real
`finite-forge:v4` value stayed byte-for-byte unchanged. **Reset demo** restored
the exact seed. **Start for real** removed demo state and returned to the
unchanged real campaign. No off-origin request occurred during this flow.

Evidence: `/work/.evidence/review-2-desktop-demo.png` and
`/work/.evidence/review-2-phone-demo.png`.

## Game paths

A deterministic live browser run played all 30 blueprints across five runs,
selected all four reset tools, and reached the actual **Final beacon lit** end
screen. It reports 5/5 runs, 30/30 blueprints, and 419 production ticks. The
screen offers **Start a new campaign**, which resets every campaign field.

A separate live run spent all 24 ticks without charging the beacon, reached
**Sunset reached**, and recovered through **Retry this blueprint** at tick
zero. A later-run retry retained its earlier tool. Pointer, phone touch, M/S/C
keys, sunlight bonuses, all tools, settings, persistence, refresh, a missing
material action, an unknown key, and malformed-save recovery passed. The
invalid action spent one tick and announced what happened; the unknown key
changed nothing.

Recorded end-screen evidence:

- `/work/.evidence/review-2-game/live-final-ending.png`
- `/work/.evidence/review-2-game/live-sunset-loss.png`

This is a single-player static game. It advertises no multiplayer, account,
tenant, product backend, server-side state, health endpoint, or room. Those
checks are not applicable. It has no service worker or offline-reload/update
promise. Its narrower cached-license offline behavior was tested in a fresh
browser context.

## Declared public claims

After `npm ci` in a new clean clone, every exact command in
`.factory/claims.json` ran separately. Playwright commands used
`BASE_URL=https://finite-forge.sociobot.in`; the duration command used its
declared Vitest command. All 23 passed, and each claim ID has exactly one test
tag.

| Claims | Result |
| --- | --- |
| `campaign-final-ending`, `restart-resets-state`, `sunset-deadline`, `campaign-duration` | PASS |
| `checkout-available`, `campaign-unlock`, `license-verification`, `license-restore` | PASS |
| `license-offline-cache`, `license-daily-check`, `license-revocation` | PASS |
| `campaign-structure`, `production-input`, `sunlight-bonus`, `reset-tools` | PASS |
| `demo-sandbox`, `local-progress`, `no-offline-income`, `local-only` | PASS |
| `settings-persist`, `frame-rate-60`, `retry-retains-tools`, `generated-image-provenance` | PASS |

The duration solver covered all 24 reset-tool orders and 720 authored
blueprints. The frame-rate check measured 60.004 fps with a 16.8 ms p95 at
390×844 under 4× CPU slowdown. Landing, game, legal, footer, and README copy
map to the claim set. No missing, false, incomplete, or untested public claim
was found.

## Checkout and license service

From an isolated completed free run, the visible $5 link returned 303 to the
approved `checkout.dodopayments.com` host. The hosted page returned 200 and
showed **Finite Forge Full Campaign**, **$5.00**, and one-time purchase terms.
No buyer details, payment, or entitlement were attempted.

An invented license returned 200 with `valid:false`, reason `invalid`,
`Cache-Control: no-store`, and CORS for the product origin. A fresh allowance
window returned 429 on request 30 with `Retry-After: 4`. Valid return,
restoration, initial verification, daily cache, offline use of a previously
verified license, and revocation were exercised with isolated fixtures.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed the live root: status, title, language,
  h1, main, alt text, button names, and console checks.
- Fresh Axe scans found zero violations of any severity on `/`, `/demo`,
  `/privacy`, `/terms`, and the designed missing-page response.
- Tab first reaches the skip link. Enter focuses `main`. The visible focus
  ring is 3 px amber. SPA navigation and browser back restore route titles and
  heading focus.
- Every visible phone link, button, and input measured at least 44×44 CSS px.
  The 640 px reflow check had no horizontal overflow. Reduced motion changed
  the resource animation to 0.01 ms.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific titles,
  canonicals, one h1, header, main, and footer. `/missing-plan` deliberately
  returns the expected designed HTTP 404 with a way back. The 404 status is not
  a defect. All linked routes and metadata assets resolve.
- Sample play sends no request away from the product origin before a license
  is supplied. There are no analytics, third-party runtime scripts, or remote
  fonts. Security headers and immutable artwork caching are present.
- Lighthouse 13.4.1 mobile: performance 100, accessibility 100, best practices
  100, and SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0, and 39 KiB transfer.
- The production build contains 19.99 kB raw JavaScript (7.46 kB gzip) and
  11.74 kB raw CSS (3.06 kB gzip).

## Clean quality gates

These commands passed from the clean clone:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm audit
BASE_URL=https://finite-forge.sociobot.in npx playwright test
```

Results: 7 Vitest tests, 25 local Playwright tests, 25 live Playwright tests,
zero audit vulnerabilities, and a complete `dist/` build.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Checkout returned 404 or its test accepted an arbitrary redirect | Fixed. The exact claim checks the 303, approved Dodo host, hosted 200, product, $5 price, and one-time terms. |
| Demo touched real progress, was empty, or lacked a persistent label | Fixed. Fresh desktop and phone isolation, seed, label, reset, and exit checks pass. |
| Loss granted progress, the fifth run was skipped, or restart was incomplete | Fixed. Live 24-tick loss/retry and the full five-run, 30-blueprint ending pass. |
| Campaign lacked a 24-tick deadline or 30–45 minute design | Fixed. Every blueprint has 24 ticks; all 24 tool orders need at least 400 decisions for the tested 33.3-minute plan. |
| Claims were missing, tautological, non-portable, or outside the demo sandbox | Fixed. All 23 exact outcome commands pass separately from a clean checkout. |
| Paid client behavior or invented offline tokens bypassed verification | Fixed. Free gate, return, restore, daily cache, prior-verdict offline use, and revocation pass; a new offline token stays locked. |
| Tests timed out, audits failed, deployment files differed, or headers/routes/404 failed | Fixed. Clean gates, live hash comparison, headers, route matrix, and the designed 404 pass. |
| Touch targets, phone text, ARIA, focus, metadata, or reduced motion failed | Fixed. Fresh device checks and zero-violation Axe scans pass. |
| Privacy, 404, or generated-image wording was incomplete | Fixed. Legal copy, direct 404 wording, and visible provenance disclosure pass. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
