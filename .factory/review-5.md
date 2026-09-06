# Build a beacon before sunset — review 5

Reviewed 2026-09-06 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout claim-test repair: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline: `49e311b9bc2eca407a52e8f5b693d75b6b04bb1e`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The application source has not changed since `c4cce27`. The checkout-test repair and later documentation do not change the game runtime. Fresh live HTML, JavaScript, and CSS SHA-256 hashes exactly match the clean build from the documentation baseline.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts opened at scroll position zero, before interaction or scrolling.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** It opens run three with stock and two tools.

The active run-one board starts at y=752 on desktop and y=533.2 on phone, so it is visible in each first viewport. It is not a menu wall. Both pages return 200 with `lang="en"`, `Finite Forge — Build a beacon before sunset`, one h1, one main landmark, and no page or console errors.

Evidence: `/work/.evidence/review-5/live-desktop-fresh.png`, `/work/.evidence/review-5/live-phone-fresh.png`, and `/work/.evidence/review-5/live-browser.json`.

## Sample and real progress

One click opens `/demo` with the persistent label **Demo — sample data, nothing is saved**. The sample shows run 3, blueprint 4, tick 7, 4 ore, 3 parts, 5/18 charge, Bellows, and Pattern plate.

In separate fresh desktop and phone contexts, a real campaign was advanced to tick 1. Sample play advanced only the demo save to tick 8. **Reset demo** restored the exact seed. **Start for real** removed the demo save and returned to the byte-for-byte unchanged real tick-1 campaign. The label stayed visible. Sample play made only same-origin requests.

Evidence: `/work/.evidence/review-5/live-desktop-demo.png`, `/work/.evidence/review-5/live-phone-demo.png`, and `/work/.evidence/review-5/live-browser.json`.

## Game paths

The fresh live claim run played all 30 blueprints across five runs, selected the four reset tools, and reached **Final beacon lit**. It recorded 5/5 runs, 30/30 blueprints, and 419 production ticks. **Start a new campaign** resets every campaign field.

A separate live run spent all 24 ticks without completing its beacon, reached **Sunset reached**, and recovered through **Retry this blueprint** at tick zero. The live suite also passed pointer, phone touch, M/S/C input, forecast bonuses, every reset tool, settings persistence, malformed-save recovery, missing-material input, ignored unknown keys, and tool retention after loss.

Recorded end screens:

- `/work/.evidence/review-5/live-final-ending.png`
- `/work/.evidence/review-5/live-sunset-loss.png`

Finite Forge is a static, single-player game. It advertises no multiplayer, account, tenant, room, product backend, server-side state, health endpoint, or service worker. Tenant isolation, server restart persistence, health, and server rate-limit checks do not apply. It has no general offline-reload or update promise. Its previously verified license offline path is a declared claim and passed in a fresh context.

## Claims and quality gates

After `npm ci` in a new clone at documentation SHA `49e311b`, every exact command in `.factory/claims.json` was run separately with `BASE_URL=https://finite-forge.sociobot.in`. All 23 passed, with exactly one test tag per claim. A complete independent live Playwright run passed 25/25.

| Claims | Result |
| --- | --- |
| `campaign-final-ending`, `restart-resets-state`, `sunset-deadline`, `campaign-duration` | PASS |
| `checkout-available`, `campaign-unlock`, `license-verification`, `license-restore` | PASS |
| `license-offline-cache`, `license-daily-check`, `license-revocation` | PASS |
| `campaign-structure`, `production-input`, `sunlight-bonus`, `reset-tools` | PASS |
| `demo-sandbox`, `local-progress`, `no-offline-income`, `local-only` | PASS |
| `settings-persist`, `frame-rate-60`, `retry-retains-tools`, `generated-image-provenance` | PASS |

The duration solver covers all 24 reset-tool orders and 720 authored blueprints. A separate 390×844 Chromium sample under 4× CPU slowdown measured 60.00 fps with a 16.8 ms p95. Landing, game, legal, footer, README, and demo copy map to the claim set. No missing, false, incomplete, or untested public claim was found.

The fresh clone passed `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --omit=dev`, `npm audit`, and the live Playwright suite. Results: 7 Vitest tests, 25 local Playwright tests, 25 live Playwright tests, zero audit vulnerabilities, and `dist/`. The build contains 19.99 kB raw JavaScript (7.46 kB gzip) and 11.74 kB raw CSS (3.06 kB gzip).

## Accessibility, routes, privacy, and performance

- The visible $5 checkout claim passed against the live Dodo-hosted Finite Forge one-time order summary. No buyer data, payment, or entitlement was attempted. A read-only invented-license request returned invalid, no-store, and product-origin CORS.
- The supplied `verify-url.sh` passed the live root: 200, title, language, h1, main, alt text, labeled buttons, and no console errors.
- Fresh Axe scans found zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the designed missing page. The live suite also proves skip-link focus, keyboard operation, phone targets, 16 px text, reduced motion, and recovery.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific titles, canonicals, one h1, header, main, and footer. `/missing-plan` deliberately returns the expected designed 404 with a way back. It is not a defect. All product links resolve.
- Sample play made no off-origin request before a license was supplied. The runtime has no analytics, third-party scripts, or remote fonts. Live CSP, `nosniff`, strict-origin referrer policy, and immutable asset caching exist.
- Lighthouse 13.4.1 mobile performance scored 99: FCP 1.6 s, LCP 1.6 s, TBT 0 ms, CLS 0, and 39 KiB transfer.

## Earlier findings

All findings in reviews 1–4 and verifications 2–9 were inspected. The earlier checkout, demo isolation, loss/retry, ending/restart, campaign pacing, claims, license, quality-gate, route, accessibility, privacy, 404, and provenance findings remain fixed. The fresh checks above prove their current disposition.

## Verdict

**PASS — 0 findings and 0 untested public claims.**
