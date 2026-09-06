# Build a beacon before sunset — review 8

Reviewed 2026-09-06 UTC at <https://finite-forge.sociobot.in>.

- Implementation candidate reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Checkout-claim test repair reviewed: `3b55ebf1fec72ec7ebe91f5dadf8006710087662`
- Documentation baseline before this review: `08b6982cf94c671268c0c8fca6d6d9a9fc376540`
- Verdict: **PASS**
- Findings: **0 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The requested external `factory-evidence/finite-forge-verify-10/qa-report.md`
path was not mounted in this worker. The complete repository verification 10
report was read instead, then its reported outcome was independently checked
against the live product. No product source changed in this review.

## First screen before scrolling

Fresh Chromium contexts opened the live URL at 1440×900 desktop and 390×844
touch-phone sizes. Before scrolling, both showed:

- Job: **Build a beacon before sunset.**
- Audience: **Reset fans who want a 30–45 minute campaign with a deadline.**
- First action: **Try it with sample data.** It says it opens run three with
  stock and two tools.

The active game board began at y=752 on desktop and y=533.2 on phone, inside
both first viewports. This is a game board, not a menu wall. Both fresh loads
had no product console or page errors. Evidence:
`/work/.evidence/review-8/desktop-fresh.png` and
`/work/.evidence/review-8/phone-fresh.png`.

## Demo, game paths, and recovery

One click opened `/demo`. The persistent label was **Demo — sample data,
nothing is saved**. The populated board showed run 3, blueprint 4, 17 ticks
left, Bellows, and Pattern plate.

In a fresh phone context, real play was advanced to tick 1. Sample play then
changed only demo state. **Reset demo** restored run 3, blueprint 4, tick 7,
4 ore, 3 parts, and 5 charge. **Start for real** discarded the demo state and
returned to the unchanged real tick-1 state. No request left the product
origin during this flow.

The deterministic live claim run reached the actual **Final beacon lit** end
screen after five runs and 30 blueprints. A separate 24-tick loss reached
**Sunset reached** and **Retry this blueprint** returned the board to tick
zero. Evidence is recorded in
`/work/.evidence/review-8/live-final-ending.png` and
`/work/.evidence/review-8/live-sunset-loss.png`.

The game advertises no multiplayer, account, room, product backend, tenant
state, health endpoint, service worker, offline-reload promise, or update
promise. Backend tenant and restart checks are therefore not applicable.

## Claims and paid boundary

After `npm ci`, all 23 exact commands in `.factory/claims.json` were run
separately with `BASE_URL=https://finite-forge.sociobot.in`. Every command
passed. This includes the final ending, restart, sunset deadline, duration,
checkout, license, controls, demo isolation, privacy, settings, frame-rate,
tool retry, and generated-image provenance claims.

The visible $5 link returned a 303 to the approved Dodo hosted-checkout host;
the declared claim then verified the hosted Finite Forge $5 one-time order
summary without buyer data or payment. An invented-license verification
request remained invalid. In a fresh allowance window, 30 invalid requests
returned 200 and request 31 returned **429** with **Retry-After: 3**. No
purchase, entitlement, or personal data was created.

Landing, game, README, footer, legal pages, metadata, and the generated-image
disclosure were cross-checked against the claims inventory. No missing,
false, incomplete, or untested public claim was found.

## Accessibility, routes, privacy, and runtime

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with distinct correct
  titles, one h1, header, main, and footer. `/missing-plan` deliberately
  returned the designed HTTP 404 with a way back; that is expected.
- All real linked destinations resolved. The 404 page's own `#main` skip-link
  fragment retains its deliberate 404 status and is an in-page control, not a
  broken destination.
- `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one h1, main landmark,
  image alt text, button names, and no console errors on the live root.
- The requested Axe CLI could not start because its Selenium harness could not
  find a Chrome binary. The equivalent installed Playwright Axe integration
  scanned `/`, `/demo`, `/privacy`, `/terms`, and `/missing-plan` at phone size
  and found zero violations. This is a verifier-tool limitation, not an
  untested public claim.
- Keyboard Tab first reached the visible skip link and Enter focused `main`.
  In reduced motion, board animation duration was `0.00001s`. Sampled phone
  Settings and production controls measured 79.1×44 and 328×62 CSS px.
- No analytics, remote fonts, or third-party runtime scripts loaded. Normal
  sample play made no off-origin request before a license was supplied.
- Live headers include CSP, `nosniff`, and strict-origin referrer policy.
  Hashed JS uses one-year immutable caching.
- A clean build byte-matched live HTML, JS, CSS, blueprint art, 404 document,
  robots, and sitemap. The runtime candidate is `c4cce27`; later SHA
  `08b6982` changes reports and evidence only.

## Quality gates

All commands passed from this clean checkout:

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
zero audit vulnerabilities, and a complete `dist/` build. The production
bundle contains 19.99 kB raw JavaScript and 11.74 kB raw CSS.

## Earlier finding disposition

All earlier review and verification findings, including minor findings, were
checked again.

| Earlier finding | Current disposition |
| --- | --- |
| The 24-tick sunset loop, real 30–45 minute campaign, loss, retry, five-run ending, or restart was missing or wrong | Fixed. The engine and live deterministic final/loss runs passed; all 24 tool orders retain the documented 400-decision lower bound. |
| Demo was empty, touched real data, lacked a persistent label, reset, or clean exit | Fixed. Fresh desktop and phone sample checks proved the stocked label, isolated namespace, reset, exit, and unchanged real save. |
| Paid unlock was absent, checkout returned 404, or a checkout test accepted any redirect | Fixed. The live 303, approved checkout host, hosted order summary, product, price, and one-time terms pass the exact claim test. |
| A new offline token could unlock paid play, or restore/cache/daily/revocation behavior was unsafe | Fixed. The declared isolated browser claim commands passed; a live invented token remained invalid and rate limiting is explicit. |
| Claims were missing, tautological, incomplete, nonportable, or outside the sandbox | Fixed. Every current public claim maps to one observable outcome command; all 23 passed separately. |
| `npm test` timed out, lint/build was incomplete, or audits had advisories | Fixed. Clean test, typecheck, lint, build, production audit, and full audit passed. |
| CSP, immutable asset cache, routes, deep links, title/canonical/focus behavior, links, or true 404 failed | Fixed. Fresh route matrix, live headers, link checks, focus, and designed HTTP 404 passed. |
| Small touch targets/text, settings state, demo semantics, ARIA, reduced motion, privacy metadata, or 404 wording failed | Fixed. Fresh phone measurements, keyboard/reduced-motion checks, and zero-violation Playwright Axe route scans passed. |

## Verdict

**PASS — 0 findings and 0 untested public claims.**
