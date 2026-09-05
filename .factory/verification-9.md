# Build a beacon before sunset — verification 9

Verified on 2026-09-05 UTC against <https://finite-forge.sociobot.in>.

- Runtime implementation reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout claim-test repair reviewed: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline reviewed: `b7344c957f56a3e15842019c13cf6a1a132f02af`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The runtime source has not changed since `c4cce27`. The later checkout test and
documentation commits do not contain a newer game image. Fresh production
HTML, JavaScript, CSS, illustration, 404, and robots hashes match the build
from this checkout.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts showed these facts before
scrolling:

- Job: **“Build a beacon before sunset.”**
- Audience: **“For reset fans who want a 30–45 minute campaign with a deadline.”**
- First action: **“Try it with sample data.”** The adjacent text says it opens
  run three with stock and two tools.
- The active game board begins at y=752 on desktop and y=533.2 on phone. It is
  in both first viewports, so the game is not hidden behind a menu wall.

Both pages returned 200 with one h1, one main landmark, `lang=en`, the correct
title, and no console or page errors. Evidence:
`verification-9-evidence/live-desktop-fresh.png`,
`live-phone-fresh.png`, and `live-independent.json`.

## Sample and real-data isolation

One click opened `/demo` with the persistent label **“Demo — sample data,
nothing is saved.”** The populated sample showed run 3, blueprint 4, tick 7,
4 ore, 3 parts, 5/18 charge, Bellows, and Pattern plate.

Pointer and phone touch actions advanced only the demo save to tick 8. The
label remained visible. Reset restored the exact seeded state. A real save was
byte-for-byte unchanged after entering, playing, and resetting the sample on
both devices. **Start for real** removed the demo save and returned to the
unchanged real campaign. Sample play made no off-origin request.

Evidence: `verification-9-evidence/live-desktop-demo.png`,
`live-phone-demo.png`, and `live-independent.json`.

## Complete game run, loss, and recovery

- A deterministic live browser run began at run 1 and played all 30
  blueprints across five runs. It selected four reset tools and reached the
  actual **Final beacon lit** screen after 419 production ticks. The screen
  showed 5/5 runs and 30/30 blueprints and offered **Start a new campaign**.
- The restart claim reset the run, blueprint, resources, tools, ticks, and
  campaign progress.
- A separate live run spent all 24 ticks without charging, reached **Sunset
  reached**, and recovered through **Retry this blueprint** at tick zero.
  Later-run retry retained its earlier reset tool.
- Pointer, phone touch, M/S/C keys, sunlight bonuses, all four reset tools,
  sound and motion settings, persistence, refresh, malformed-save recovery,
  missing-material input, and an ignored unknown key were exercised.

Recorded end-screen evidence:

- `verification-9-evidence/live-final-ending.png`
- `verification-9-evidence/live-sunset-loss.png`

The game is single-player and advertises no multiplayer mode. The measured
frame-rate claim passed at 390×844 under 4× CPU slowdown. The product makes no
offline-reload or background-update promise and has no service worker. Its
narrower cached-license offline behavior passed in a fresh browser context.

## Declared claims

After fresh `npm ci`, every exact command in `.factory/claims.json` was run
individually with `BASE_URL=https://finite-forge.sociobot.in`. Each claim tag
occurs exactly once. No command was skipped.

| Claim | Result |
| --- | --- |
| `campaign-final-ending` | PASS |
| `restart-resets-state` | PASS |
| `sunset-deadline` | PASS |
| `campaign-duration` | PASS |
| `checkout-available` | PASS |
| `campaign-unlock` | PASS |
| `license-verification` | PASS |
| `license-restore` | PASS |
| `license-offline-cache` | PASS |
| `license-daily-check` | PASS |
| `license-revocation` | PASS |
| `campaign-structure` | PASS |
| `production-input` | PASS |
| `sunlight-bonus` | PASS |
| `reset-tools` | PASS |
| `demo-sandbox` | PASS |
| `local-progress` | PASS |
| `no-offline-income` | PASS |
| `local-only` | PASS |
| `settings-persist` | PASS |
| `frame-rate-60` | PASS |
| `retry-retains-tools` | PASS |
| `generated-image-provenance` | PASS |

The duration command exhaustively solved all 24 reset-tool orders and 720
authored blueprints. The public game, price, license, privacy, settings,
provenance, and README statements map to these outcomes. The landing, legal,
footer, and README cross-check found no missing, false, or untested public
claim.

## Checkout and license service

From the visible paid gate in a clean completed free run, the repaired claim
test and an independent read-only request observed:

- 303 from the advertised Sociobot checkout endpoint.
- HTTPS destination on `checkout.dodopayments.com`.
- 200 from the hosted page.
- Title **Sociobot | Checkout** and visible order summary.
- Product **Finite Forge Full Campaign**, price **$5.00**, and a one-time
  license description for this product origin.

No buyer data, payment details, payment, or real entitlement were attempted.
This proves hosted checkout availability, not payment settlement.

An invented license returned 200, `valid:false`, reason `invalid`, `no-store`,
and CORS for the product origin. In a fresh allowance window, invalid request
31 returned 429 with `Retry-After: 4`. Fixture-backed browser checks proved
valid return, restore, initial verification, daily cache, offline use of a
previously verified license, and revocation behavior.

This is a static local-first product. It has no product backend, tenant,
account, health endpoint, server-side state, SQLite data, restart-persistence
surface, multiplayer client, or room to test.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one h1,
  main landmark, complete alt text, labeled buttons, and no console errors.
- Fresh Playwright Axe scans found zero violations of any severity on `/`,
  `/demo`, `/privacy`, `/terms`, and the designed not-found response.
- Tab first reaches the visible skip link; Enter focuses `main`. SPA route and
  back navigation update the title and focus the new h1.
- All visible phone links, buttons, and inputs measured at least 44×44 CSS px.
  A 640 px reflow check had no horizontal overflow. Visible text is at least
  16 px. Reduced motion changed resource animation to 0.01 ms.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with distinct titles,
  canonicals, one h1, header, main, and footer. `/missing-plan` deliberately
  returns the expected designed 404 with a way back; that status is not a
  defect.
- Internal links and metadata assets resolve. HTML revalidates after 30
  seconds; the hashed illustration uses one-year immutable caching. CSP,
  `nosniff`, strict-origin referrer policy, and `frame-ancestors 'none'` are
  present.
- Normal and sample play made no request away from the product origin before a
  license was supplied. There are no analytics or third-party runtime scripts
  or fonts.
- Lighthouse 13.4.1 mobile: 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. FCP was 0.81 s, LCP 1.05 s, TBT 0 ms, CLS 0, and
  total transfer 40,098 bytes.
- Runtime files: 19,991 bytes JavaScript, 11,745 bytes CSS, and 27,948 bytes
  for the blueprint image.

Evidence is under `.factory/verification-9-evidence/`.

## Clean quality gates

- `npm ci`: PASS; 54 packages and zero vulnerabilities.
- `npm test`: PASS; 7 Vitest and 25 Playwright tests.
- `BASE_URL=https://finite-forge.sociobot.in npx playwright test`: PASS;
  25/25.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev`: PASS.
- `npm audit`: PASS.

## Earlier finding disposition

| Earlier finding | Current disposition and proof |
| --- | --- |
| Checkout returned 404 | Fixed. It redirects to the live Dodo-hosted Finite Forge order summary. |
| Checkout test accepted an arbitrary HTTPS redirect | Fixed. The exact claim now checks status, approved host, hosted 200, product, $5 price, and one-time offer. |
| Demo route touched real progress, was empty, or lacked a persistent label | Fixed. Fresh desktop and phone isolation, stocked sample, persistent label, reset, and exit passed. |
| Loss granted progress, fifth run was skipped, or final restart was wrong | Fixed. The 24-tick loss/retry and full five-run, 30-blueprint run passed; restart reset every field. |
| Settings were ineffective or visibly open when collapsed | Fixed. Sound/motion behavior and persistence pass, and the panel is hidden when collapsed. |
| Campaign lacked the specified 24-tick loop or 30–45 minute design | Fixed. Each blueprint has 24 ticks; all 24 tool orders need at least 400 decisions, giving the tested 33.3-minute planning budget. |
| Claims were missing, tautological, non-portable, or outside the demo sandbox | Fixed. All 23 exact outcome commands pass against live; the duration test runs the exhaustive solver. |
| `npm test` timed out or dependency audits failed | Fixed. Clean tests, build, typecheck, lint, and both audits pass. |
| Paid client was absent or an invented offline token bypassed verification | Fixed. The free gate, verified return, restore, daily cache, offline cache, and revocation paths pass. |
| Route focus, title, canonical, headers, cache, links, or true 404 failed | Fixed. Fresh route matrix, history checks, headers, hashes, crawl, and designed HTTP 404 pass. |
| Touch targets or phone text were too small | Fixed. All visible tested targets are at least 44×44 px and text is at least 16 px. |
| Demo had an ARIA violation | Fixed. Axe reports zero violations on every tested route. |
| Privacy description was too long or 404 copy was metaphorical | Fixed. Privacy description is 121 characters and the 404 h1 is “Page not found.” |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
