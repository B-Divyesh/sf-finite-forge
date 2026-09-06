# Build a beacon before sunset — review 7

Reviewed 2026-09-06 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Claim-test repair reviewed: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline reviewed: `bc1508cef8f51d644a1048bf8c45e3719250ad34`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The application runtime source remains at `c4cce27`. Later commits update
claim coverage and review records only. A clean production build at the
documentation baseline byte-matches the live HTML, JavaScript, CSS, blueprint
art, 404 document, 404 CSS, robots file, and sitemap. The live response also
has the expected CSP, `nosniff`, and strict-origin referrer policy.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 touch-phone contexts opened the live root
at scroll position zero, with no browser console errors.

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** It opens run three with stock and
  two tools.

Both had `lang="en"`, one h1, one main landmark, and the title `Finite Forge
— Build a beacon before sunset`. The active board begins at y=752 on desktop
and y=533.22 on phone, so the first screen shows the game rather than a menu
wall.

Evidence: `/work/.evidence/review-7/live-desktop-fresh.png`,
`/work/.evidence/review-7/live-phone-fresh.png`, and
`/work/.evidence/review-7/live-browser.json`.

## Sample and saved progress

One click reached `/demo` on both devices. The persistent banner reads **Demo
— sample data, nothing is saved**. It showed run 3, blueprint 4, 17 ticks
left, 4 ore, 3 parts, 5/18 charge, Bellows, and Pattern plate.

In a separate fresh browser, real progress advanced to tick one. Sample play
advanced only the demo to tick eight. **Reset demo** restored tick seven, and
**Start for real** removed the demo key and returned to the byte-for-byte
unchanged real save. The direct `?demo=1` entry works. The local-only claim
recorded no off-origin request during sample play.

Evidence: `/work/.evidence/review-7/live-desktop-demo.png`,
`/work/.evidence/review-7/live-phone-demo.png`, and
`/work/.evidence/review-7/live-browser.json`.

## Game paths

The live deterministic suite completed all 30 blueprints across five runs,
chose the four reset tools, and reached **Final beacon lit**. The final screen
shows 5/5 runs, 30/30 blueprints, and 419 production ticks. **Start a new
campaign** resets the run, blueprint, stock, tools, ticks, and campaign total.

A separate live run spent all 24 ineffective ticks, reached **Sunset reached**,
then recovered through **Retry this blueprint** at tick zero. The same live
coverage exercised missing-material actions, malformed-save recovery, ignored
unknown keys, pointer/touch/M/S/C controls, sunlight bonuses, all reset tools,
later-tool retention after a loss, settings persistence, reduced motion, and
the free-run license gate.

Recorded end states: `/work/.evidence/review-7/live-final-ending.png` and
`/work/.evidence/review-7/live-sunset-loss.png`.

This is a static, single-player game. It has no multiplayer, accounts, rooms,
product backend, tenant data, product health endpoint, service worker,
offline-reload promise, or update promise. Tenant isolation, service restart,
health, and product-server 429 checks do not apply. The stated cached-license
offline behavior is a declared claim and was independently exercised.

## Claims and local quality gates

In a clean clone at `bc1508`, `npm ci` succeeded with zero vulnerabilities.
Every exact command in the 23-entry `.factory/claims.json` inventory then ran
separately with `BASE_URL=https://finite-forge.sociobot.in`; all passed. The
log ends with `ALL_DECLARED_CLAIM_COMMANDS_PASS 23`. The full independent live
Playwright suite also passed 25/25.

| Claim group | Result |
| --- | --- |
| Final ending, restart, 24-tick deadline, structure, duration | PASS |
| Checkout, unlock, verification, restore, daily check, offline cache, revocation | PASS |
| Pointer, touch, keyboard, sunlight, reset tools, retry, settings, frame rate | PASS |
| Demo isolation, local progress, no idle production, local-only privacy | PASS |
| Generated-image disclosure | PASS |

`npm test` passed 7 Vitest and 25 local Playwright tests. `npm run typecheck`,
`npm run lint`, `npm run build`, `npm audit --omit=dev`, and `npm audit`
passed. The build created `dist/` with 19.99 kB raw JavaScript (7.46 kB gzip)
and 11.74 kB raw CSS (3.06 kB gzip).

The frame-rate claim was measured again at 390×844 with 4× CPU throttling:
60.002 fps with 16.8 ms p95, within its stated 55–65 fps and ≤20 ms bounds.
Mobile Lighthouse scored 100 for performance, accessibility, best practices,
and SEO; FCP was 0.76 s, LCP 1.05 s, TBT 34 ms, CLS 0, and transfer 40.1 kB.

Evidence: `/work/.evidence/review-7/claim-commands.log`,
`/work/.evidence/review-7/npm-test-local.log`,
`/work/.evidence/review-7/quality-local.log`,
`/work/.evidence/review-7/frame-rate-live.json`, and
`/work/.evidence/review-7/lighthouse-live-final.json`.

## Accessibility, privacy, and routes

- The supplied `verify-url.sh` passed the live root: 200, title, language,
  h1, main, image alt text, button labels, and no console errors.
- Live Playwright Axe scans found zero violations of every severity on `/`,
  `/demo`, `/privacy`, `/terms`, and `/missing-plan`.
- Keyboard checks cover the visible skip link, Enter to main, M/S/C actions,
  and history navigation. Route navigation moves focus to the new h1. Reduced
  motion removes the board animation. Phone checks found 44 px controls, 16 px
  visible text, and no horizontal overflow.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific
  titles, one h1, header, main, footer, and canonical URL. All live in-product
  links resolve. `/missing-plan` deliberately returns a designed HTTP 404 with
  a return link; its network console reports that expected document status,
  not an application failure.
- The game stores progress locally. It has no analytics, remote fonts, or
  third-party runtime scripts. Sample play stays same-origin until a player
  supplies a license.

Evidence: `/work/.evidence/review-7/verify-url/verify.json`,
`/work/.evidence/review-7/axe-playwright-live.json`,
`/work/.evidence/review-7/routes-live.json`, and
`/work/.evidence/review-7/live-headers.txt`.

## Earlier findings

All findings recorded in reviews 1–6 and verifications 2–9, including minor
ones, were inspected and re-proven as fixed.

| Earlier finding | Current disposition |
| --- | --- |
| Checkout failed or accepted any redirect | Fixed. The exact live claim requires the approved Dodo host, Finite Forge order, $5 price, and one-time terms. |
| Demo was empty, mixed with real data, unlabeled, or could not reset | Fixed. Fresh desktop and phone checks prove stock, tools, label, reset, exit, and unchanged real progress. |
| Loss/retry, reset tool, final ending, or final restart was incomplete | Fixed. The 24-tick loss/retry and five-run, 30-blueprint final screen pass live. |
| The campaign did not prove its finite 24-tick, 30–45 minute shape | Fixed. The 24-tool-order solver and 400-decision lower bound pass. |
| Claims were missing, incomplete, tautological, nonportable, or outside demo | Fixed. All 23 exact outcome commands pass separately from clean setup. |
| License verification, restore, cache, daily check, offline use, or revocation was unsafe | Fixed. Fixture and live-boundary claim paths pass; an unverified offline token stays locked. |
| Tests, build, audit, deployment assets, headers, deep links, focus, or 404 failed | Fixed. Clean gates, byte matches, headers, route/history checks, and designed 404 all pass. |
| Mobile controls/text, semantics, metadata, or reduced motion failed | Fixed. Fresh Axe is clean, and phone/keyboard/reduced-motion checks pass. |
| Privacy, 404 wording, or generated-image provenance was incomplete | Fixed. Local-only request evidence, plain legal/404 copy, and the visible provenance disclosure pass. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
