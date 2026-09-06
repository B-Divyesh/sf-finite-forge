# Build a beacon before sunset — review 4

Reviewed 2026-09-06 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout claim-test repair: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline: `7a7a964cab9329fb76e4409344c6dadeb251b493`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The product source has not changed since `c4cce27`. The later `3b55ebf`
commit strengthened the checkout claim test. Remaining later commits contain
evidence and reports. Fresh live HTML, JavaScript, and CSS byte-match a clean
production build from the current remote checkout.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts opened at scroll position
zero.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** The adjacent text says it opens
  run three with stock and two tools.

The active run-one board begins at 752 px on desktop and 533.2 px on phone, so
the game itself is visible in both first viewports. The page is not a menu
wall. Both contexts returned 200 with `lang="en"`, the route title `Finite
Forge — Build a beacon before sunset`, one h1, one main landmark, and no
console or page errors.

Evidence: `/work/.evidence/review-4/live-desktop-fresh.png`,
`/work/.evidence/review-4/live-phone-fresh.png`, and
`/work/.evidence/review-4/live-independent.json`.

## Sample and real-data isolation

One click opened `/demo` with the persistent label **Demo — sample data,
nothing is saved**. The populated board showed run 3, blueprint 4, tick 7, 4
ore, 3 parts, 5/18 charge, Bellows, and Pattern plate. The documented
`/?demo=1` entry also opened the same stocked sample.

A fresh real campaign was first advanced to tick 1. Entering the sample,
playing to tick 8, and resetting changed only the demo save. **Reset demo**
restored the exact run-3 seed. **Start for real** deleted the demo save and
returned to the unchanged tick-1 real campaign. The sample label remained
visible during play, and no off-origin request occurred before a license was
supplied.

Evidence: `/work/.evidence/review-4/live-desktop-demo.png`,
`/work/.evidence/review-4/live-phone-demo.png`, and
`/work/.evidence/review-4/demo-real-sentinel.json`.

## Complete game paths

A deterministic live browser run played all 30 blueprints across five runs,
selected all four reset tools, and reached the actual **Final beacon lit** end
screen. It reports 5/5 runs, 30/30 blueprints, and 419 production ticks. The
end screen offers **Start a new campaign**; its claim test reset every
campaign field.

A separate live run spent all 24 ticks without charging the beacon, reached
**Sunset reached**, and recovered through **Retry this blueprint** at tick
zero. Pointer, touch, M/S/C keys, sunlight bonuses, all reset tools, refresh
persistence, sound and motion settings, later-run tool retention, an ignored
unknown key, a missing-material action, and malformed-save recovery passed.
The invalid production action spent one tick and announced what happened.

Recorded end screens:

- `/work/.evidence/review-4/live-final-ending.png`
- `/work/.evidence/review-4/live-sunset-loss.png`

Finite Forge is a static, single-player, turn-based game. It advertises no
multiplayer, account, tenant, room, product backend, health endpoint, or
server-side game state. Multiplayer, tenant-isolation, and restart-persistence
backend checks do not apply. The board does not advance without player input.
It has no service worker or general offline/update promise. The narrower
previously-verified-license offline behavior passed in a fresh context.

## Declared public claims

After `npm ci` in a new clone at documentation SHA `7a7a964`, every exact
command in `.factory/claims.json` ran separately. Playwright commands used
`BASE_URL=https://finite-forge.sociobot.in`; the duration command used its
declared Vitest command. All 23 passed, with one test tag for each claim ID.

| Claims | Result |
| --- | --- |
| `campaign-final-ending`, `restart-resets-state`, `sunset-deadline`, `campaign-duration` | PASS |
| `checkout-available`, `campaign-unlock`, `license-verification`, `license-restore` | PASS |
| `license-offline-cache`, `license-daily-check`, `license-revocation` | PASS |
| `campaign-structure`, `production-input`, `sunlight-bonus`, `reset-tools` | PASS |
| `demo-sandbox`, `local-progress`, `no-offline-income`, `local-only` | PASS |
| `settings-persist`, `frame-rate-60`, `retry-retains-tools`, `generated-image-provenance` | PASS |

The duration solver covered all 24 reset-tool orders and 720 authored
blueprints. The independent rendering sample measured 60.00 fps with a 16.8
ms p95 at 390×844 under 4× CPU slowdown. Landing, board, legal, footer,
README, and demo documentation statements map to the declared behavior and
the independent request, source, and route checks. No missing, false,
incomplete, or untested public claim was found.

Evidence: `/work/.evidence/review-4/claims.log` and
`/work/.evidence/review-4/frame-rate.json`.

## Checkout and license service

From an isolated completed free run, the visible $5 link returned 303 to the
approved `checkout.dodopayments.com` host. The hosted page returned 200 and
showed **Finite Forge Full Campaign**, **$5.00**, and one-time terms. No buyer
details, payment, or entitlement were attempted.

An invented license returned 200 with `valid:false`, reason `invalid`,
`Cache-Control: no-store`, and CORS for the product origin. A fresh request
allowance returned 429 on request 30 with `Retry-After: 4`. Fixture-backed
browser checks covered verified return, paste restore, the initial
verification gate, daily caching, prior-verdict offline use, and revocation.

Evidence: `/work/.evidence/review-4/billing-boundaries.json`.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed the live root: status, title, language,
  h1, main, alt text, button names, and console checks.
- Fresh Axe scans found zero violations of any severity on `/`, `/demo`,
  `/privacy`, `/terms`, and the designed missing-page response.
- Tab first reaches the skip link with a 3 px amber focus outline; Enter
  focuses `main`. Native controls work from the keyboard, M/S/C advance play,
  and route/back navigation restores the route title and h1 focus.
- Every visible phone link, button, and input measured at least 44×44 CSS px.
  Visible text was at least 16 px. The 640 px reflow check had no horizontal
  overflow. Reduced motion changed the resource animation to 0.01 ms.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific
  titles, canonicals, one h1, header, main, and footer. `/missing-plan`
  deliberately returns the expected designed HTTP 404 with a way back. The
  deliberate 404 status is not a defect. All other linked routes and metadata
  assets resolve.
- Sample play sends no request away from the product origin before a license
  is supplied. Source and request inspection found no analytics, third-party
  runtime scripts, remote fonts, accounts, or remote game saves.
- CSP, `nosniff`, strict-origin referrer policy, and immutable artwork caching
  are live.
- Lighthouse 13.0.1 mobile: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.88 s, LCP 1.15 s, TBT 12 ms, CLS 0, and 40.1 kB
  transfer.
- The production build contains 19.99 kB raw JavaScript (7.46 kB gzip) and
  11.74 kB raw CSS (3.06 kB gzip).

## Clean quality gates

These commands passed from the new clone:

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

| Earlier finding | Current disposition and proof |
| --- | --- |
| Paid checkout returned 404, or its claim accepted any redirect | Fixed. The exact claim and an independent request require the 303, approved Dodo host, hosted 200, product name, $5 price, and one-time terms. |
| Demo touched real progress, was empty, or lacked a persistent label | Fixed. Fresh desktop and phone checks prove the stocked sample, persistent label, exact reset, query alias, exit, and unchanged real save. |
| Loss granted progress, the fifth run was skipped, or restart was incomplete | Fixed. The live 24-tick loss/retry and full five-run, 30-blueprint ending pass; restart resets every campaign field. |
| Campaign lacked a 24-tick deadline or a real 30–45 minute design | Fixed. Every blueprint has 24 ticks; all 24 tool orders need at least 400 decisions for the tested 33.3-minute plan. |
| Claims were missing, tautological, non-portable, or outside the demo sandbox | Fixed. All 23 exact outcome commands pass separately from a clean checkout, with one tag per claim. |
| Paid client behavior was absent, or an invented offline token bypassed verification | Fixed. Free gate, return, restore, daily cache, prior-verdict offline use, and revocation pass; a new offline token stays locked. |
| Tests timed out, audits failed, or live files differed from the candidate | Fixed. Clean gates pass, both audits report zero vulnerabilities, and live HTML, JavaScript, and CSS byte-match the clean build. |
| Headers, deep routes, focus, titles, canonicals, links, or the true 404 failed | Fixed. Fresh header, history, route, crawl, focus, and designed HTTP 404 checks pass. |
| Touch targets, phone text, demo ARIA, metadata, or reduced motion failed | Fixed. Fresh device measurements and zero-violation Axe scans pass. |
| Privacy, 404, or generated-image wording was incomplete | Fixed. Legal copy, direct 404 wording, same-origin request evidence, and visible provenance disclosure pass. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
