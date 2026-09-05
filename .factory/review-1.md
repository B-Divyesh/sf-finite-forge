# Build a beacon before sunset — review 1

Reviewed 2026-09-05 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout-test repair: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation/report baseline: `13f527a38ac920e131d716e24d58219a2b26c47b`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The application source has not changed after `c4cce27`; the later commits only
change checkout tests and factory reports. Fresh live HTML, JavaScript, and
CSS SHA-256 hashes match the clean candidate build. Evidence is in
`.factory/review-1-evidence/`.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts were opened before any
scrolling.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** It says that it opens run three
  with stock and two tools.

The active run-one board is visible at the bottom of both first viewports. The
first screen is not a menu wall. Both contexts returned 200 with the title
`Finite Forge — Build a beacon before sunset`, `lang="en"`, one h1, one main
landmark, and no page or console errors. See `live-desktop-fresh.png`,
`live-phone-fresh.png`, and `fresh-live.json`.

## Sample and real-data isolation

The first action opens `/demo` in one click. The populated sample shows run 3,
blueprint 4, tick 7, 4 ore, 3 parts, 5/18 charge, Bellows, and Pattern plate.
The persistent banner says **Demo — sample data, nothing is saved**.

On desktop and phone, mining advanced only `demo:finite-forge:v4` from tick 7
to tick 8. The real `finite-forge:v4` save stayed byte-for-byte unchanged.
**Reset demo** restored the exact seed and **Start for real** is covered by the
live claim suite as discarding the demo namespace and returning to the real
campaign. The privacy claim recorded no off-origin request during sample play.
See `live-desktop-demo.png`, `live-phone-demo.png`, and `fresh-live.json`.

## Game paths

The deterministic live browser run played all 30 blueprints across five runs,
selected four reset tools, and reached the actual **Final beacon lit** end
screen. It reports 5/5 runs, 30/30 blueprints, 419 production ticks, and a
working **Start a new campaign** action. `live-final-ending.png` records the
end screen.

A separate live run spent 24 ticks without completing the beacon, reached
**Sunset reached**, and recovered through **Retry this blueprint** at tick
zero. The live suite also covers M/S/C keyboard input, pointer and touch
input, invalid missing-material actions, unknown-key recovery, reset tools,
settings persistence, malformed-save recovery, and reduced motion. The loss
screen is recorded in `live-sunset-loss.png`.

This is a single-player game and advertises no multiplayer mode. It has no
product backend, tenant, account, health endpoint, room, or server-side state;
tenant isolation and restart-persistence checks are therefore not applicable.
It has no service-worker, offline-reload, or update promise. Its narrower
cached-license offline claim was exercised in a fresh browser context.

## Declared public claims

After `npm ci` in a fresh clone at `13f527a`, every exact command in
`.factory/claims.json` was run separately. Playwright commands used
`BASE_URL=https://finite-forge.sociobot.in`; the duration command used the
documented Vitest command. All passed.

| Claims | Result |
| --- | --- |
| `campaign-final-ending`, `restart-resets-state`, `sunset-deadline`, `campaign-duration` | PASS |
| `checkout-available`, `campaign-unlock`, `license-verification`, `license-restore` | PASS |
| `license-offline-cache`, `license-daily-check`, `license-revocation` | PASS |
| `campaign-structure`, `production-input`, `sunlight-bonus`, `reset-tools` | PASS |
| `demo-sandbox`, `local-progress`, `no-offline-income`, `local-only` | PASS |
| `settings-persist`, `frame-rate-60`, `retry-retains-tools`, `generated-image-provenance` | PASS |

The frame-rate claim passed live at 390×844 under four-times CPU slowdown. The
duration solver passed its all-24-reset-tool-order lower bound. Copy on the
landing page, legal pages, footer, and README maps to this claim set; no
missing, false, incomplete, or untested public claim was found.

The complete live browser suite also passed 25/25. The clean local suite
passed 7 Vitest tests and 25 Playwright tests.

## Checkout and license service

The visible checkout claim passed against the live checkout: it requires the
Sociobot endpoint to return 303, an HTTPS Dodo checkout host, a hosted 200
order summary, the Finite Forge full campaign product, a $5.00 price, and a
one-time license. No buyer data, payment details, payment, or entitlement was
attempted.

An invented license returned `200`, `valid:false`, `reason:"invalid"`,
`Cache-Control: no-store`, and the product-origin CORS allow header. A fresh
allowance window returned 429 on requests 30 and 31 with `Retry-After: 2`.
The cached-license, daily check, restoration, revoked-license, and offline
behavior are covered by the live claim commands. Evidence redacts session and
cookie values.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed on the live root: 200, title, language,
  h1, main, image alt text, labeled buttons, and no console errors.
- Fresh Axe scans had zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and `/missing-plan`.
- The full live suite proved the skip link, keyboard focus movement, 44 px
  phone targets, 16 px minimum visible text, 200%/narrow reflow, and reduced
  motion behavior.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with route-specific
  titles, canonicals, one h1, header, main, and footer. `/missing-plan`
  intentionally returns a designed HTTP 404 with a way back. The skip link's
  fragment on that already-404 page is an in-page control, not a broken user
  link. All navigable internal product routes return 200.
- Sample-play request logging proves no tracking or off-origin game request
  before a user supplies a license. There are no third-party fonts or runtime
  scripts.
- Mobile Lighthouse 13.4.1: performance 99, accessibility 100, best
  practices 100, SEO 100; FCP 1.6 s, LCP 1.6 s, TBT 0 ms, CLS 0, 39 KiB total
  transfer.

## Clean quality gates

All commands completed in the clean checkout:

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

`npm audit` and `npm audit --omit=dev` report zero vulnerabilities. The build
produces `dist/` with 19.99 kB raw JavaScript (7.46 kB gzip) and 11.74 kB raw
CSS (3.06 kB gzip).

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Checkout unavailable or its test accepted any HTTPS redirect | Fixed; the live exact claim proves the approved 303, Dodo host, hosted order, product, price, and one-time terms. |
| Demo was not isolated, populated, persistent, or resettable | Fixed; fresh desktop and phone isolation, label, seed, reset, and exit checks pass. |
| Loss, retry, tool progression, final ending, or restart was wrong | Fixed; live 24-tick loss/retry and full five-run ending pass. |
| Campaign lacked the 24-tick finite 30–45 minute loop | Fixed; 30 blueprints, 24 ticks each, and all 24 reset orders meet the 400-decision lower bound. |
| Claims were missing, tautological, non-portable, or not sandboxed | Fixed; all 23 listed outcome commands pass separately against live. |
| Client, license, cache, offline, restoration, or revocation behavior was unsafe | Fixed; live and fixture-backed claim paths pass; invented offline tokens remain locked. |
| Tests, audit, build, deployment assets, headers, routes, or true 404 failed | Fixed; clean gates, hash comparison, verifier, route matrix, headers, and designed 404 pass. |
| Touch targets, phone text, ARIA, focus, title, canonical, metadata, or reduced motion failed | Fixed; live suite and fresh Axe scans pass. |
| Privacy copy, 404 wording, or generated-image disclosure was incomplete | Fixed; plain legal copy, designed 404, and visible generated-image disclosure pass. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
