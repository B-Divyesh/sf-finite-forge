# Finite Forge independent verification 5 — FAIL

Tested candidate `9674957f0433ffb3eea680ce99a3aae85e4f42b8` from
`main` against <https://finite-forge.sociobot.in> on 2026-09-02 UTC.

## Result

**FAIL.** The deployed files byte-match the candidate, the clean quality gates
pass, and the game itself has a deterministic 30-blueprint path to a genuine
ending. A new buyer still cannot buy the required full-campaign license: the
live checkout URL returns HTTP 404. Runs two through five are therefore not
available through the advertised legitimate path. In addition, an arbitrary
unverified token unlocks run two if the browser is offline, and the claims
suite does not meet the required demo-only, outcome-testing contract.

## Mandatory first checks

### Declared claim commands — all PASS

`.factory/claims.json` exists and contains 18 entries. After `npm ci`, I ran
every listed command separately before broader QA. Each exact command passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `campaign-final-ending` | `npx playwright test --grep @claim:campaign-final-ending` | PASS, 1 test |
| `restart-resets-state` | `npx playwright test --grep @claim:restart-resets-state` | PASS, 1 test |
| `sunset-deadline` | `npx playwright test --grep @claim:sunset-deadline` | PASS, 1 test |
| `campaign-duration` | `npx vitest run --testNamePattern @claim:campaign-duration` | PASS, 1 test |
| `campaign-unlock` | `npx playwright test --grep @claim:campaign-unlock` | PASS, 1 test |
| `campaign-structure` | `npx playwright test --grep @claim:campaign-structure` | PASS, 1 test |
| `production-input` | `npx playwright test --grep @claim:production-input` | PASS, 1 test |
| `sunlight-bonus` | `npx playwright test --grep @claim:sunlight-bonus` | PASS, 1 test |
| `reset-tools` | `npx vitest run --testNamePattern @claim:reset-tools` | PASS, 1 test |
| `demo-sandbox` | `npx playwright test --grep @claim:demo-sandbox` | PASS, 1 test |
| `local-progress` | `npx playwright test --grep @claim:local-progress` | PASS, 1 test |
| `no-offline-income` | `npx playwright test --grep @claim:no-offline-income` | PASS, 1 test |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS, 1 test |
| `settings-persist` | `npx playwright test --grep @claim:settings-persist` | PASS, 1 test |
| `frame-rate-60` | `npx playwright test --grep @claim:frame-rate-60` | PASS, 1 test |
| `response-policy` | `npx vitest run --testNamePattern @claim:response-policy` | PASS, 1 test |
| `retry-retains-tools` | `npx playwright test --grep @claim:retry-retains-tools` | PASS, 1 test |
| `generated-image-provenance` | `npx vitest run --testNamePattern @claim:generated-image-provenance` | PASS, 1 test |

The passing commands do not cure the claims-contract defects described below.

### Cold first-read — PASS

At 390×844, a fresh live visit answers the required questions in the first
screen:

- What: “Build a beacon before sunset.”
- For whom: “For reset fans who want a 30–45 minute campaign with a deadline.”
- What to click: “Try it with sample data,” with “Opens run three with stock
  and two tools” beside it.

The run-one board is visible in the same viewport, so the captured first screen
shows the game rather than a menu wall. One click opens `/demo`, shows a stocked
run-three board, and displays “Demo — sample data, nothing is saved” with
**Reset demo** and **Start for real**. Evidence:
`.factory/qa-5/live-first-read-390.png` and
`.factory/qa-5/live-demo-390.png`.

## Release-blocking findings

### Critical — the advertised $5 checkout is still not registered

Fresh read-only evidence from the required buy URL:

```text
GET https://api.sociobot.in/api/v1/products/finite-forge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The real game correctly stops after the sixth blueprint in run one and shows
**Full campaign unlock**. Its only buy link is that failing endpoint. The
brief promises a one-time full unlock, so a new player cannot legitimately
reach runs two through five or the final beacon. The mocked browser claim test
only checks the client contract and cannot prove a live purchase.

The separate invalid-license endpoint is live and CORS-correct: it returned
HTTP 200 with `{"valid":false,"reason":"invalid"}`. Its burst allowance was
30 requests from one client; request 31 returned HTTP 429 with
`Retry-After: 3` and `X-RateLimit-After: 3`.

### High — any pasted token unlocks paid play while offline

On the live run-one completion screen, I set the browser offline, pasted
`not-a-real-license`, and selected **Restore license**. Without any successful
verification response, the app exposed **Choose one reset tool** and accepted
**Focusing lens**, advancing to run 2. Storage then contained:

```json
{"token":"not-a-real-license","verdict":{"valid":true,"checkedAt":0},"run":2}
```

The client marks a newly pasted or returned token valid before its first
verification, then preserves that optimistic state when the request fails.
This violates the paid-unlock requirement to verify the first unlock and makes
the paywall bypassable by disconnecting the network. Previously verified
buyers may remain optimistic offline; a never-verified token may not.

### High — the claims suite is not a compliant demo/outcome gate

The declarations pass, but they do not satisfy the attached claims and demo
contracts:

- Campaign ending, restart, sunset, unlock, structure, and sunlight browser
  tests enter `/`, write the real `finite-forge:v4` namespace, and in one case
  seed a test license. They do not run through `/demo` or the `demo:` namespace,
  despite the requirement that every claim be exercised only through the demo
  entry point and sample data.
- The tagged `campaign-duration` test proves only that exported constants say
  `MINIMUM_CAMPAIGN_TICKS === 400` and `PLANNING_SECONDS_PER_TICK === 5`.
  Its exact filtered command skips the separate exhaustive solver test that
  actually calculates the lower bound across all 24 tool orders. The full
  suite supplies supporting evidence, but the required claim test itself is
  tautological rather than an outcome test.
- Public README promises that verification occurs at most daily, licenses can
  be restored by pasting, and refunds/revocation remove access. No claim entry
  and tagged sandbox test proves those three visitor-facing behaviors.

Under the supplied claims contract, an incomplete inventory or a tagged test
that does not prove its observable claim fails independent verification.

## Other findings

### Medium — key phone copy is smaller than the specified type baseline

The visual contract requires body text of at least 16 px on web and 17 pt on
mobile. The live phone UI renders facts and production guidance at 14 px,
resource labels at 13 px, board/forecast values at 11–12 px, and footer copy at
13 px. Numbers remain visually discernible in the screenshot, and Axe reports
no contrast issue, but the implementation does not meet the stated baseline.

### Low — the demo has one Axe semantic violation

A fresh Axe scan found no serious or critical issues on `/`, `/demo`,
`/privacy`, `/terms`, or the 404. `/demo` has one minor `aria-allowed-role`
violation because the `aside` demo banner is assigned `role="status"`.

### Low — metadata and 404 copy miss two site-copy rules

The Privacy route's meta description is 166 characters, above the 155-character
limit. The 404 headline “This page is not in the forge” uses the brand metaphor
that the plain-words contract prohibits, although its next sentence provides a
clear return action.

## Passing product evidence

### Build and automated gates

- Clean `npm ci`: PASS, 54 packages, zero audit findings.
- `npm test`: PASS, 10 Vitest tests and 16 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS and produced `dist/`.
- `npm audit --omit=dev` and `npm audit`: PASS, zero vulnerabilities.
- Full browser suite against the live URL: PASS, 16/16.
- Playwright is pinned to the provided `1.58.2` browser version.

Production payloads are well below budget: JavaScript 19,342 bytes raw / 7,217
gzip; CSS 11,715 bytes raw / 3,093 gzip; hero WebP 27,948 bytes. Fresh mobile
Lighthouse scored performance 100, accessibility 100, best practices 100, and
SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0, total transfer 39 KiB. Evidence:
`.factory/qa-5/lighthouse-live.json`.

### Gameplay and state

- An independent deterministic live run started on the title screen, solved
  all 30 blueprints, selected Lens → Pattern plate → Bellows → Stock bin, and
  reached **Final beacon lit** at 419 production ticks. The screen showed 5/5
  runs and 30/30 blueprints. Evidence: `.factory/qa-5/live-final-390.png`.
- **Start a new campaign** reset run, blueprint, tick, resources, owned tools,
  completed progress, and total ticks to their initial values.
- An unknown key spent no tick. Charging without parts spent one tick and gave
  recovery feedback. Twenty-four unsuccessful actions reached **Sunset
  reached**; retry restored 24 ticks and the same tool set. Evidence:
  `.factory/qa-5/live-loss-390.png`.
- The live suite additionally verifies a failed later blueprint retains its
  earlier reset tool, settings persist, malformed storage recovers, sound only
  starts after opt-in and a gesture, and M/S/C, pointer, and touch all work.
- A direct fresh `/demo` created only `demo:finite-forge:v4`. Reset returned it
  to run 3, blueprint 4, tick 7 without creating a real save. **Start for real**
  deleted the demo key and created a fresh real campaign.
- At 390×844 with Chromium's 4× CPU throttle, 301 frames over 4,999.8 ms
  measured 60.00 fps with a 16.8 ms p95. Evidence:
  `.factory/qa-5/frame-live.json`.

### Accessibility, mobile, privacy, and deployment

- Factory URL verification passed at 571 ms with no console errors,
  `lang=en`, one h1, a main landmark, alt text, and labeled buttons. Evidence:
  `.factory/verify-5-live/`.
- Keyboard entry exposes a 44 px skip link with a visible 3 px amber focus
  ring; Enter moves focus to `main`. All game controls and settings are
  keyboard-operable. Pointer targets are at least 44 px; the 22 px checkboxes
  sit inside 44 px clickable labels.
- Reduced motion resolves animation and transition duration to 0.01 ms. There
  is no horizontal overflow at 320, 390, 640, or 1280 CSS pixels; the 640 px
  check covers a 200% desktop-zoom layout.
- Normal play through the full campaign and the complete demo/reset/exit flow
  requested only the live product origin. No analytics, third-party script,
  console error, or page error occurred. Supplying a license contacted only
  the documented Sociobot verifier.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns a
  real 404. HTML sends CSP including `frame-ancestors 'none'`, HSTS, `nosniff`,
  and strict-origin referrer policy. HTML revalidates after 30 seconds; hashed
  JS, CSS, and the hero use one-year immutable caching.
- The candidate build and live deployment SHA-256 match exactly for HTML
  (`be2e2d822dca7695ae18eccf0d87e0ce3b7f5ca162286ad13c7c3e60c6833efe`),
  JS (`22b16c7cf3dcca8bb3475b88af9dfa5fa509a64ee647f98b03cd1668e4a42c5b`),
  CSS (`151bac2bd782399b6de6f9f995f3801dddf31341b123f35bf361f4d1c1b5297c`),
  and hero (`eb361c2b317a2725e476663d205a66a4f528ec87a5bfd1429ba2af614111b4df`).

Not applicable: this static browser game has no sign-in, product-owned backend,
service worker/offline-app claim, CLI, library package, or multiplayer mode.

## Required remediation

1. Register the live `finite-forge` $5 one-time Sociobot billing product and
   prove checkout → return token → verification → paid run on the real service.
2. Never grant a first unlock from a newly pasted/returned token until one
   successful verification marks it valid; retain optimistic offline access
   only for a previously verified cached verdict.
3. Move every browser claim to the isolated demo namespace, make the duration
   tag execute the calculated lower-bound proof, and add claims/tests for
   daily verification, paste restore, and revocation.
4. Bring phone text, the demo banner semantics, Privacy metadata, and 404 copy
   into their stated contracts.
