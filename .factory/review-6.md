# Build a beacon before sunset — review 6

Reviewed 2026-09-06 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout claim-test repair: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline reviewed: `46639d6dfef771fbd5225f3193f206a0033ee4fa`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The application source is unchanged since `c4cce27`; later commits only add
claim-test coverage and reports. A fresh comparison found byte-for-byte matches
between the clean build and live JavaScript, CSS, blueprint image, 404, and
robots files.

## First screen before scrolling

Fresh desktop (1440×900) and phone browser sessions opened at scroll position
zero.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** It opens run three with stock and
  two tools.

The active game board begins at y=752 on desktop and y=533.2 on the phone, so
it is visible in both first viewports. It is a game screen, not a menu wall.
Both fresh sessions returned 200 with `lang="en"`, one h1, one main landmark,
the title `Finite Forge — Build a beacon before sunset`, and no page or console
errors.

## Sample and real progress

One click opened `/demo`. Its persistent banner reads **Demo — sample data,
nothing is saved**. The populated sample showed run 3, blueprint 4, tick 7,
4 ore, 3 parts, 5/18 charge, Bellows, and Pattern plate on both devices.

Mining moved only demo progress from tick 7 to tick 8. **Reset demo** returned
it to tick 7. **Start for real** discarded the demo namespace and returned to a
byte-for-byte unchanged real save. The banner remained visible throughout.
The live privacy claim recorded only same-origin requests during sample play.

## Game paths

The independent live browser suite played the deterministic campaign through
all 30 blueprints and five runs, selected four reset tools, and reached the
actual **Final beacon lit** screen. It showed 5/5 runs, 30/30 blueprints, and
419 production ticks, then reset correctly through **Start a new campaign**.

A separate live run used 24 ineffective ticks, reached **Sunset reached**, and
returned to tick zero through **Retry this blueprint**. The same suite covered
missing-material input, ignored unknown keys, M/S/C keys, pointer and touch,
sunlight bonuses, every reset tool, later-tool retention after loss, local
persistence and malformed-save recovery, settings, reduced motion, and the
390×844 4×-CPU frame-rate measurement.

Recorded evidence:

- `/work/.evidence/review-6/live-final-ending.png`
- `/work/.evidence/review-6/live-sunset-loss.png`
- `/work/.evidence/review-6/live-desktop-fresh.png`
- `/work/.evidence/review-6/live-phone-fresh.png`

This is a static single-player browser game. It advertises no multiplayer,
product backend, account, tenant, room, health endpoint, service worker,
offline-reload promise, or update promise. Server isolation, restart, health,
and server rate-limit checks therefore do not apply. The narrower cached-license
offline claim was exercised in its own fresh browser context.

## Claims and clean checks

In a new detached checkout at documentation SHA `46639d6`, `npm ci` completed
with zero production vulnerabilities. Every exact command from the 23-entry
`.factory/claims.json` inventory was then run separately with
`BASE_URL=https://finite-forge.sociobot.in`; all completed with exit status 0.
Each declared `@claim:` tag occurs exactly once. The command log ends with
`ALL_DECLARED_CLAIM_COMMANDS_PASS 23`.

| Claim groups | Result |
| --- | --- |
| Campaign ending, restart, sunset, structure, duration | PASS |
| Checkout, unlock, verification, restore, cache, daily check, revocation | PASS |
| Controls, sunlight, reset tools, retry retention, settings, frame rate | PASS |
| Demo isolation, local persistence, no idle production, local-only privacy | PASS |
| Generated-image disclosure | PASS |

`npm test` passed 7 Vitest and 25 Playwright tests locally. The independent
live suite passed 25/25. `npm run typecheck`, `npm run lint`, `npm run build`,
`npm audit --omit=dev`, and `npm audit` passed. `dist/` was produced with
19.99 kB raw JavaScript (7.46 kB gzip) and 11.74 kB raw CSS (3.06 kB gzip).

The visible $5 checkout claim passed its exact live assertion: the Sociobot
endpoint redirected to an HTTPS Dodo hosted order summary for Finite Forge,
showing $5.00 and a one-time license. No buyer data, payment, or entitlement
was attempted.

## Accessibility, privacy, and routes

- `/opt/fleet/lib/verify-url.sh` passed the live root: 200, title, language,
  h1, main, image alt text, labeled buttons, and no console errors.
- Fresh Axe scans found zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and `/missing-plan`. The live suite also passed keyboard skip-link focus,
  route focus, touch targets, text sizing, reduced motion, settings controls,
  malformed-save recovery, and legal-page navigation.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with distinct titles,
  canonicals, header, main, footer, and one h1. `/missing-plan` returned the
  intended designed HTTP 404 with a return link. Its browser network console
  records the expected document 404, not an application error.
- All discovered product links resolved. The live headers include CSP,
  `nosniff`, and strict-origin referrer policy. The runtime has no analytics,
  third-party scripts, or remote fonts.
- Lighthouse 13.4.1 mobile scored 100 for performance, accessibility, best
  practices, and SEO: FCP 1.4 s, LCP 1.4 s, TBT 0 ms, CLS 0, and 39 KiB
  transfer.
- The frame-rate claim passed at 390×844 under 4× CPU throttling. Its test
  requires 55–65 fps and a p95 interval at or below 20 ms.

## Earlier finding disposition

All earlier review and verification findings, including minor findings, remain
fixed and were rechecked.

| Earlier finding | Current disposition |
| --- | --- |
| Checkout was unavailable or its test accepted any HTTPS redirect | Fixed. The exact hosted product, price, one-time terms, approved redirect, and 200 order summary pass live. |
| Demo was empty, mixed with real data, lacked its label, or could not reset | Fixed. Fresh desktop and phone isolation, stock, tools, label, reset, and exit all pass. |
| Loss/retry, reset tools, final ending, or final restart was wrong | Fixed. The 24-tick loss/retry and five-run, 30-blueprint ending pass live. |
| The campaign did not prove its finite 24-tick, 30–45 minute shape | Fixed. The 24-order deterministic solver and 400-decision lower bound pass. |
| Claims were missing, incomplete, tautological, nonportable, or outside demo | Fixed. All 23 declared outcome commands ran separately and passed from the documented clean setup. |
| License verification, restore, cache, daily check, offline, or revocation was unsafe | Fixed. Live and fixture-backed claim paths pass; an unverified offline token remains locked. |
| Tests, audit, build, deployment assets, routes, headers, focus, or 404 failed | Fixed. Clean gates, live hashes, headers, route matrix, links, focus, and designed HTTP 404 pass. |
| Mobile targets/text, ARIA, accessibility, metadata, or reduced motion failed | Fixed. Fresh Axe has zero violations and the phone/keyboard/reduced-motion suite passes. |
| Privacy wording, 404 wording, or generated-image provenance was incomplete | Fixed. Plain legal copy, expected 404 copy, request recording, and visible provenance all pass. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**

Evidence is in `/work/.evidence/review-6/`, including `claim-commands.log`,
`claim-commands.status`, browser screenshots, and `verify-url/verify.json`.
