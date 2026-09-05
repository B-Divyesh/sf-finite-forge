# Build a beacon before sunset — verification 8

Verified on 2026-09-05 UTC against <https://finite-forge.sociobot.in>.

- Implementation reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Documentation baseline reviewed: `4f26b4f3a5e2ac06c440305f9aabc504bd624238`
- Verdict: **FAIL**
- Findings: **0 critical, 0 high, 1 medium, 0 low**
- Untested public claims: **0**

The deployed HTML, JavaScript, CSS, illustration, and robots file SHA-256
match the build from the implementation candidate. Later commits are tests and
reports, not a newer product image.

## Finding

### Medium — the checkout claim command does not prove its stated checkout outcome

The public claim `checkout-available` says that the $5 link opens the hosted
Sociobot checkout. Its declared exact command passed, but its assertion only
accepts any HTTP 3xx response whose `Location` starts with `https://`:

```ts
expect(response.status()).toBeGreaterThanOrEqual(300);
expect(response.status()).toBeLessThan(400);
expect(response.headers().location).toMatch(/^https:\/\/.+/);
```

It would pass if the buy link redirected to an unrelated HTTPS site or a
non-checkout page. It does not assert the Dodo checkout host or that the
destination answers as a hosted checkout. This is an incomplete outcome test
under the claims contract, even though the current live result is good.

Independent read-only evidence at this verification was `303` from the
Finite Forge checkout endpoint to `checkout.dodopayments.com`; that destination
returned `200`. No buyer details, payment, card, or issued entitlement were
used. A checkout redirect is evidence that checkout is reachable, not proof
of payment settlement or a real entitlement. The fixture-backed paid-gate
tests prove the client behavior after a valid or invalid verification response,
but they do not prove Dodo's live fulfillment. There is no current provider
outage finding; this finding is the product's incomplete regression assertion.

Required repair: make the declared command assert the approved hosted checkout
destination and a successful read-only hosted response, without submitting a
payment.

## First screen and sample

Fresh 1440×900 desktop and 390×844 phone contexts showed the following before
scrolling:

- Job: “Build a beacon before sunset.”
- Audience: “For reset fans who want a 30–45 minute campaign with a deadline.”
- First action: “Try it with sample data.” It says it opens run three with
  stock and two tools.
- The active game board begins at y=752 on desktop and y=533.2 on phone, so it
  is inside each first viewport rather than behind a menu wall.

The one-click sample opened `/demo` in a separate browser storage namespace.
It showed run 3, blueprint 4, tick 7, 4 ore, 3 parts, 5 charge, Bellows, and
Pattern plate. The persistent “Demo — sample data, nothing is saved” label
remained after production. Reset restored that exact sample. A sentinel real
save was unchanged before and after sample entry, play, and reset on both
devices.

Evidence: `.factory/verification-8-evidence/live-desktop-fresh.png`,
`live-phone-fresh.png`, `live-desktop-demo.png`, and `live-phone-demo.png`.

## Game, paid gate, and recovery

- The live deterministic UI run reached **Final beacon lit** after five runs
  and 30 blueprints. The recorded end screen is
  `live-final-ending.png`.
- A separate live run spent all 24 ticks, reached **Sunset reached**, and
  retried at tick zero. The recorded loss is `live-sunset-loss.png`.
- The live suite exercised pointer, touch, M/S/C keyboard controls, sunlight
  bonuses, all reset tools, settings persistence, invalid input, malformed
  sample recovery, local persistence, no idle income, and retaining tools on
  retry.
- A fresh invented license remains locked while offline. Fixture responses
  prove a verified return or restored token opens the paid gate, daily checks
  do not duplicate, revocation relocks it, and a previously verified cache can
  continue offline.
- The live invalid-license endpoint returned `200`, no-store, and the expected
  CORS allowance for this product origin. This static single-player product
  has no product backend, tenant, room, health, restart, or rate-limit surface
  to test.

The live checkout availability evidence is deliberately separate: it is a
read-only `303` to the current Dodo host followed by `200`, not payment or
entitlement evidence.

## Declared claims

After fresh `npm ci`, every exact command listed in `.factory/claims.json` was
run individually against the live URL. All commands passed. The one checkout
command has the incomplete assertion described in the finding above; none was
skipped or left untested.

| Claim | Command execution |
| --- | --- |
| `campaign-final-ending` | PASS |
| `restart-resets-state` | PASS |
| `sunset-deadline` | PASS |
| `campaign-duration` | PASS |
| `checkout-available` | PASS; assertion incomplete (finding) |
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

The duration command solved all 24 reset-tool orders across 720 authored
blueprints. The frame-rate command passed at 390×844 under 4× CPU slowdown.

## Accessibility, privacy, and routes

- `BASE_URL=https://finite-forge.sociobot.in npx playwright test` passed all
  25 browser tests, including Axe serious/critical scans on `/demo`, `/privacy`,
  `/terms`, and the designed 404.
- The required URL verifier passed with no console errors, `lang=en`, one h1,
  a main landmark, image alt text, and labeled buttons. Its report is
  `.factory/verification-8-evidence/verify-url/verify.json`.
- Keyboard skip link, route focus, back/forward, reduced motion, 44 px tested
  targets, 16 px visible text, and 200% reflow are covered by the live suite.
- `/`, `/demo`, `/privacy`, and `/terms` return `200` with route titles and
  one h1. `/missing-plan` returns a designed `404` with a way back; that status
  is expected, not a defect.
- All checked pages have the CSP, `nosniff`, and strict-origin referrer policy.
  The sample made no off-origin request before a license was supplied. There
  are no analytics, accounts, remote saves, service worker, or offline-reload
  promise.

## Quality checks

- `npm ci`: PASS — 54 packages; zero vulnerabilities.
- `npm test`: PASS — 7 Vitest tests and 25 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev`: PASS.
- Live browser suite: PASS — 25/25.
- Runtime payload: JavaScript 19,991 bytes raw; CSS 11,745 bytes raw;
  blueprint image 27,948 bytes.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Campaign did not provide the required finite 30–45 minute, 24-tick sunset game | Fixed. The solver proves every tool order needs at least 400 decisions and the live run reaches five runs and 30 blueprints. |
| Deadline/loss, fair retry, tools, settings, or final restart were missing or wrong | Fixed. Live UI and deterministic claim tests cover win, loss, retry, tools, settings, and reset. |
| Demo changed real data, was empty, or lacked a persistent sample label | Fixed. Fresh desktop and phone isolation checks passed. |
| Required claims were absent, tautological, or outside the demo sandbox | Fixed for the prior inventory: all 23 current declarations run from `/demo` or the deterministic engine as documented. The checkout assertion remains incomplete and is the current finding. |
| Clean test gate timed out; audit had advisories | Fixed. Clean suite, build, and audit pass. |
| Paid gate was absent or an invented offline token could bypass it | Fixed. The valid/invalid, cache, daily check, restore, and revocation paths pass in isolated browser tests. |
| Checkout returned a billing `404` | Fixed externally. Fresh live request returns `303` to the Dodo hosted checkout and the hosted response is `200`. |
| Touch targets, small phone text, demo semantics, Privacy metadata, or 404 wording failed | Fixed. Current live browser and Axe checks pass. |
| Route focus, title, canonical, cache/header, link, or designed 404 structure failed | Fixed. Current live route and verifier checks pass. |

## Verdict

**FAIL — 1 medium finding, 0 untested public claims.** The game and current
checkout are live and behaving as expected, but the declared checkout claim
does not yet prove the promised hosted-checkout outcome strongly enough for a
zero-finding release verdict.
