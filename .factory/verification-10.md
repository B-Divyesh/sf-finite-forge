# Build a beacon before sunset — verification 10

Verified on 2026-09-06 UTC against <https://finite-forge.sociobot.in>.

- Runtime implementation reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Hosted-checkout test repair reviewed: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline reviewed: `46f0cb504e4776a6c1cdcc1c7797776de8b889b0`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The earlier strict PASS covered Chromium only. This qualification adds fresh
Firefox and WebKit runs without changing or redeploying product code. A clean
build at the documentation baseline byte-matches the live HTML, JavaScript,
CSS, illustration, 404 document, robots file, and sitemap.

## First screen before scrolling

Fresh desktop and 390×844 phone profiles in all three engines showed:

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** The adjacent text says it opens
  run three with stock and two tools.

The active game board began at 752–754 CSS px on desktop and 533–537 CSS px on
phone. It was inside every first viewport. Each page had the correct title,
`lang="en"`, one h1, one main landmark, and no product console or page errors.

## Browser and engine qualification

Playwright 1.58.2 and its documented OS dependencies were installed before
testing. Every profile opened a fresh live context and played all five runs
and 30 blueprints to the actual **Final beacon lit** screen.

| Engine profile | Version | Viewport and input | Complete ending | Audio startup |
| --- | --- | --- | --- | --- |
| Chromium desktop | 145.0.7632.6 | 1440×900, M/S/C keys | PASS | PASS |
| Chromium phone | 145.0.7632.6 | 390×844, touch events | PASS | PASS |
| Firefox desktop | 146.0.1 | 1440×900, M/S/C keys | PASS | PASS |
| Firefox phone | 146.0.1 | 390×844, touch events | PASS | PASS |
| WebKit desktop | 26.0 | 1440×900, M/S/C keys | PASS | PASS |
| WebKit phone | 26.0 | 390×844, touch events | PASS | PASS |

All six endings showed 5/5 runs, 30/30 blueprints, and 419 production ticks.
**Start a new campaign** reset the run, blueprint, resources, tools, ticks,
and campaign progress. Each profile also spent 24 ineffective ticks, reached
**Sunset reached**, and recovered with **Retry this blueprint** at tick zero.

The phone profiles used Playwright touch input, not click substitution. The
desktop profiles used the advertised keyboard controls. Audio was not mocked:
each engine created its Web Audio cue only after the player enabled sound and
took an action, then retained the setting through reload.

Evidence: `verification-10-evidence/cross-engine-final.log`, the six engine
JSON files, and the `*-fresh.png` and `*-final.png` captures.

## Sample, persistence, and recovery

In every engine and viewport, a real run first advanced to tick one. One click
then opened `/demo` with the persistent **Demo — sample data, nothing is
saved** label, run 3, blueprint 4, tick 7, 4 ore, 3 parts, 5/18 charge,
Bellows, and Pattern plate.

Sample play survived reload in the demo namespace. **Reset demo** restored the
seed. **Start for real** removed the demo save and returned to the byte-for-byte
unchanged real save. A malformed sample save recovered to the stocked playable
sample. Sample and normal play made no request away from the product origin
before a license was supplied.

The game advertises no multiplayer mode. It has no account, room, product
backend, tenant state, server restart surface, health endpoint, service worker,
offline-reload promise, or update promise. The narrower cached-license offline
claim passed in its declared fresh browser context.

## Declared claims

After `npm ci`, every exact command in the 23-entry `.factory/claims.json` ran
separately with `BASE_URL=https://finite-forge.sociobot.in`. The log ends with
`ALL_DECLARED_CLAIM_COMMANDS_PASS 23`.

| Claim group | Result |
| --- | --- |
| Final ending, restart, 24-tick deadline, duration, campaign structure | PASS |
| Checkout, unlock, verification, restore, offline cache, daily check, revocation | PASS |
| Pointer, touch, keyboard, sunlight, reset tools, retry, settings | PASS |
| Demo isolation, local progress, no idle production, local-only privacy | PASS |
| Chromium 60 fps measurement and generated-image disclosure | PASS |

The landing page, game, legal pages, footer, README, and metadata were
cross-checked against the inventory. No missing, false, incomplete, or
untested public statement was found.

## Checkout and license boundary

The visible $5 buy link returned 303 to the approved
`checkout.dodopayments.com` host. The exact claim test then required a hosted
200 page with the Finite Forge product, $5.00 price, and one-time description.

An invented license returned 200 with `valid:false`, reason `invalid`,
`Cache-Control: no-store`, and the expected product-origin CORS response.
Request 31 in a fresh allowance window returned 429 with `Retry-After: 3`.
No buyer data, payment details, purchase, or real entitlement were attempted.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed: HTTPS 200, title, language, one h1,
  main landmark, alt text, labeled buttons, and no console errors.
- Axe found zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the
  designed not-found page in every desktop and phone engine profile. The
  separate Axe CLI check found zero violations on the live root.
- Desktop Tab/Enter checks reached the visible skip link and moved focus to
  main in Chromium, Firefox, and WebKit. Reduced motion removed the resource
  animation in every profile.
- Every visible link, button, and input measured at least 44×44 CSS px. All
  profiles had no horizontal overflow. The 390 px layout is narrower than the
  720 px content viewport produced by 200% zoom on a 1440 px desktop, and no
  control or text was lost.
- `/`, `/demo`, `/privacy`, and `/terms` returned usable pages with distinct
  titles, one h1, header, main, and footer. `/missing-plan` deliberately
  returned the designed HTTP 404 with a way back. That response is expected.
- No analytics, third-party font, or third-party runtime script loaded.
- Chromium 145 at 390×844 under 4× CPU slowdown measured 60.004 fps with a
  16.8 ms p95 across 180 intervals. The public frame-rate claim names Chromium;
  no Firefox or WebKit frame-rate claim was inferred.
- Lighthouse 13.0.1 mobile scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. FCP was 0.87 s, LCP 1.15 s, TBT 15 ms, CLS 0, and
  transfer was 40,107 bytes.
- The production build contains 19.99 kB raw JavaScript and 11.74 kB raw CSS.

WebKit logs a CSP refusal when Playwright captures a screenshot because the
tool injects an inline stylesheet. A separate WebKit probe recorded no error
after a normal live load, then recorded the refusal only after the screenshot
call. This is test-infrastructure behavior, not a product console error.

## Clean quality gates

- `npm ci`: PASS; 54 packages and zero vulnerabilities.
- `npm test`: PASS; 7 Vitest and 25 Playwright tests.
- `BASE_URL=https://finite-forge.sociobot.in npx playwright test`: PASS; 25/25.
- Cross-engine live matrix: PASS; 6/6 complete campaign sessions.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev`: PASS.
- `npm audit`: PASS.

## Browser support boundaries and unavailable infrastructure

The product does not publish a browser-version support matrix. These results
qualify the exact Playwright Linux engine builds above. They do not claim
coverage for branded macOS Safari, iOS Safari, Firefox for Android, older
engines, assistive technology outside Axe and keyboard smoke tests, or a
physical phone. The Firefox phone profile is a touch-enabled 390×844 Firefox
engine, because Playwright does not expose Firefox's mobile-browser mode.
Web Audio initialization was observed, but an audible hardware-output judgment
is unavailable in the headless container. These boundaries are not public
claims and are not product defects.

## Earlier finding disposition

All earlier review and verification findings, including minor ones, were
inspected and re-proven against the unchanged live candidate.

| Earlier finding | Current disposition |
| --- | --- |
| Checkout failed or accepted an arbitrary redirect | Fixed. The live link and exact claim require the approved host, Finite Forge order, $5 price, and one-time terms. |
| Demo was empty, mixed with real data, unlabeled, or could not reset | Fixed in all six profiles. Stock, tools, label, reload, reset, exit, and unchanged real progress passed. |
| Loss, retry, progression, final ending, or final restart was incomplete | Fixed. Six live engine profiles reached the 30-blueprint ending and passed loss, retry, and restart. |
| Campaign lacked the 24-tick or 30–45 minute design | Fixed. The deadline and exhaustive 24-tool-order, 400-decision lower-bound claims pass. |
| Claims were absent, tautological, incomplete, nonportable, or outside demo | Fixed. All 23 exact outcome commands pass separately from clean setup. |
| License verification, restore, cache, revocation, or offline handling was unsafe | Fixed. All declared paths pass; an invented token stays invalid and the live API rate limit is explicit. |
| Tests, audits, headers, deployment files, deep links, route focus, or 404 failed | Fixed. Clean gates, byte matches, headers, six-engine routes, focus, and expected designed 404 pass. |
| Touch targets, phone text, ARIA, metadata, reduced motion, privacy copy, 404 wording, or provenance failed | Fixed. Six-engine layout checks, Axe, reduced motion, local-only traffic, plain copy, and provenance pass. |

## Findings and untested claims

- Findings: **0 critical, 0 high, 0 medium, 0 low**.
- Untested public claims: **0**.

## Verdict

**PASS — 0 findings and 0 untested public claims.**
