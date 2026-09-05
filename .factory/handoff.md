# Finite Forge repair 8 handoff

## Result

**PASS — the recorded checkout-claim finding is fixed.**

The runtime implementation remains
`c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`. The outcome-based checkout test
repair is `3b55ebfc21c7392fcd172e96356ef19fe7b28189`. The shipped game code did not
change. The production artifact was rebuilt and redeployed from the repair
tree, and every checked live file matches that build by SHA-256.

## What changed

The `checkout-available` claim now starts at the visible paid gate in an
isolated completed free run. It reads the advertised buy link and requires:

- HTTP 303 from the advertised Sociobot checkout endpoint.
- An HTTPS destination on `checkout.dodopayments.com`.
- HTTP 200 from the hosted page.
- The hosted title and visible order summary for Finite Forge Full Campaign.
- The visible $5.00 price and one-time license description for this origin.

The test enters no buyer data and attempts no payment. It proves that the
advertised checkout opens the current hosted order summary. It does not claim
that payment settlement or a real entitlement was proven.

The matching sandbox description in `.factory/claims.json` now records the
full observable outcome. The live offer metadata is available at
`/work/.evidence/billing-offer.json`.

## Clean verification

From `npm ci`:

- All 23 exact commands in `.factory/claims.json`: PASS individually.
- `npm test`: PASS — 7 Vitest tests and 25 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev` and `npm audit`: PASS with zero vulnerabilities.
- Runtime size: 19,991 bytes JavaScript, 11,745 bytes CSS, and 27,948 bytes
  for the blueprint image.

## Deployment and live checks

`/opt/fleet/lib/deploy-static.sh finite-forge dist` succeeded with the existing
Static Web App and custom domain. The durable configuration and routing stayed
unchanged.

- Fresh 1440×900 desktop and 390×844 phone pages returned 200 with no console
  errors. They showed the job, audience, first action, and active game board
  before scrolling. The board began at 752 px on desktop and 533.2 px on phone.
- One tap opened the stocked run-three sample. Its label remained after play.
  Reset restored tick 7, 4 ore, 3 parts, 5/18 charge, Bellows, and Pattern
  plate. The real save stayed byte-for-byte unchanged. Start for real removed
  the sample save.
- The live deterministic browser run reached **Final beacon lit** after five
  runs and 30 blueprints. A separate run reached **Sunset reached** at tick 24
  and recovered at tick zero through retry.
- The live suite passed 25/25, including touch, pointer, M/S/C keyboard input,
  focus, 44 px targets, 16 px text, reduced motion, settings, local storage,
  invalid input, malformed-save recovery, license states, and Axe scans.
- The URL verifier passed with one h1, `lang=en`, a main landmark, complete alt
  text, labeled buttons, and no console errors.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-plan` returns the
  expected designed 404. CSP, `nosniff`, and strict-origin referrer headers are
  present on every checked route.
- Route titles, canonical links, internal links, favicon, touch icon, and the
  social image all passed the live crawl.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO. LCP was 1.06 s, TBT 0 ms, CLS 0, and transfer 40,143 bytes.
- The frame-rate claim passed at 390×844 under 4× CPU slowdown.
- The license verifier returned 200, `no-store`, the product CORS origin, and
  an invalid verdict for an invented token.
- The checkout test observed 303 to the approved Dodo host and a 200 Finite
  Forge $5.00 one-time order summary. No payment or entitlement was attempted.

Evidence is in `.factory/repair-8/`, including fresh phone, desktop, sample,
final-ending, sunset-loss, URL-verifier, and Lighthouse artifacts.

## Earlier findings

- Arbitrary HTTPS redirects satisfying the checkout claim: fixed by the
  hosted offer, status, host, product, price, and one-time outcome checks.
- Billing checkout returning 404: fixed externally; the hosted offer is live.
- Empty or real-data demo behavior: fixed; stocked sample isolation passed.
- Missing 24-tick deadline, complete fifth run, or 30–45 minute design: fixed;
  the deterministic claims cover 30 blueprints and at least 400 decisions.
- Loss progression, tool retention, settings, and final reset defects: fixed
  by current engine and browser outcomes.
- Missing, tautological, or non-sandbox claims: fixed; all 23 declared commands
  passed individually through the sample or deterministic engine.
- New offline tokens bypassing verification: fixed; only a cached verified
  token can continue offline.
- Test timeout, audit, route, focus, touch, text, demo ARIA, Privacy metadata,
  404 copy, cache, and header findings: fixed by current clean and live checks.

## Known limits

A real purchase, refund, and issued entitlement were not attempted. Those are
provider and operator transactions, not claims proved by this repair. Fixture
tests cover valid, invalid, cached, daily-check, restore, and revoked license
responses. No known product defect remains from verification 8.

## Repeat the checks

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
BASE_URL=https://finite-forge.sociobot.in npx playwright test
/opt/fleet/lib/verify-url.sh https://finite-forge.sociobot.in <evidence-dir>
```
