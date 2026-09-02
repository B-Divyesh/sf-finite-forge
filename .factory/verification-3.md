# Finite Forge independent verification 3

**Verdict: FAIL**

Verified 2026-09-02 UTC against candidate commit
`d3846bac91cdf44fb34e6dd5d1d62d63093cfd87` and
<https://finite-forge.sociobot.in>.

## Release blockers

### High — the core loop does not meet the researched brief

The acceptance brief specifies **24 production ticks to build one beacon before
a sunset deadline**. This candidate advertises and implements 30 planning
shifts over five plans instead:

- The cold live page says “30 planning shifts across five plans.”
- `src/engine.ts` sets `planShiftCounts = [4, 5, 6, 7, 8]`, totalling 30.
- `src/main.ts` has no sunset/deadline state, countdown, or deadline failure
  condition. The only loss condition is three incorrect submitted programs.

The game is a coherent finite planning campaign, but it is not the specified
24-tick, deadline-driven forge. This is a material gameplay and scope
deviation, not a deployment-only issue.

### High — required game claims are absent from `.factory/claims.json`

The game-loop acceptance contract requires claims with deterministic tests for
end screen, restart reset, settings persistence, and measured 60 fps. The
candidate has a final-ending claim, but it has no claim entries for restart
reset, persisted settings, or the 60 fps measurement. Existing untagged tests
cover settings; neither the required restart claim test nor an FPS claim test
exists. The handoff’s measurement is not a claim test.

## Required claim checks — PASS

From a clean dependency install (`npm ci`), I ran every exact command listed
in `.factory/claims.json` before any other QA. All passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| campaign-final-ending | `npx playwright test --grep @claim:campaign-final-ending` | PASS (1) |
| campaign-price-availability | `npx playwright test --grep @claim:campaign-price-availability` | PASS (1) |
| campaign-duration | `npx vitest run --testNamePattern @claim:campaign-duration` | PASS (1) |
| campaign-structure | `npx playwright test --grep @claim:campaign-structure` | PASS (1) |
| production-input | `npx playwright test --grep @claim:production-input` | PASS (1) |
| local-progress | `npx playwright test --grep @claim:local-progress` | PASS (1) |
| no-offline-income | `npx playwright test --grep @claim:no-offline-income` | PASS (1) |
| local-only | `npx playwright test --grep @claim:local-only` | PASS (1) |

## Local candidate checks — PASS

- `npm test`: PASS — 5 Vitest tests and 14 Chromium tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- Build output: JS 16,547 bytes raw / 6,212 bytes gzip; CSS 9,255 bytes raw /
  2,604 bytes gzip; WebP 27,948 bytes. The static JS budget passes.

## Cold first-read and demo — PASS

At a cold live visit, the first screen plainly says it is “a finite strategy
game,” identifies “reset fans” as its audience, states the clear ending, and
offers one-click **Try it with sample data** (“Opens plan three with two
tools”). The captured desktop and 390 px mobile first views include the active
game board, not a menu wall. The demo opens with the persistent “Demo — sample
data, nothing is saved” banner and only `demo:finite-forge:v2` in storage.

## Live gameplay and accessibility — PASS

- The targeted live Playwright run passed 7/7: old 63-input regression, full
  30-shift end screen, loss/retry recovery, real tool selection, persistent
  settings/sound/motion, routing/focus/mobile targets, and Axe serious/critical
  scan across `/`, `/demo`, `/privacy`, `/terms`, and a 404 route.
- The deterministic run reached **Final beacon lit**, showed 30/30 solved, and
  offered a new campaign. The full local test suite also exercises restart,
  keyboard M/S/C and pointer input, no idle progress, and local persistence.
- Fresh live `/demo` request logging during a planning action recorded only
  same-origin document, JS, CSS, and image requests; no console or page errors
  occurred. Demo data never made a remote request.
- Fresh keyboard entry lands on “Skip to game” with a visible amber 3 px focus
  outline. At 390 px, checked controls are at least 44 px high. Reduced motion
  resolves transition duration to `0.01ms`.
- A 300-frame live demo sample at 390 px under 4x CPU throttling measured mean
  frame interval 16.612 ms, p95 16.700 ms, or 60.20 fps. This is supporting QA
  evidence only; it does not cure the missing claim/test above.

One full `BASE_URL=https://finite-forge.sociobot.in npx playwright test` run
reported 12 pass / 2 fail because the two local-only claim tests compare every
request origin to the literal `http://127.0.0.1:4173`. Their actual live
request logs were same-origin as recorded above. This is a test portability
defect, not an observed privacy leak.

## Deployment, privacy, and headers — PASS

The deployed candidate matches the local production output byte-for-byte:

| Asset | SHA-256 |
| --- | --- |
| `index.html` | `f06ea922c5a3ef370a6b61356d713e373b0e8076d8f91166923623c2f1d96af5` |
| `assets/index-BnZeaXrr.js` | `255da58c125c54df01c7f4f9121da74cf2d0b1bf8e292fe744652e8ca64833c6` |
| `assets/index-DhxFRCqT.css` | `3b992edcf93c55a68ac78aa8c6dc5bf233e8e67d6e20b0684865445d1f01156d` |

`/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns
404. All responses checked carry CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, and strict-origin referrer policy. Hashed JS, CSS, and WebP have
`Cache-Control: public, max-age=31536000, immutable`; HTML is revalidated at
30 seconds. No product endpoint exists, so rate-limit verification is not
applicable. This is not a PWA and makes no offline-reload claim.

## Remediation before release

1. Implement the brief’s 24-tick beacon loop and a visible, fair sunset
   deadline with a deadline loss/recovery path; update game copy and
   deterministic end-to-end tests accordingly. If the product deliberately
   changes scope, obtain an updated brief rather than silently substituting a
   different core loop.
2. Add tagged claims and sandbox tests for restart reset, settings persistence,
   and the 60 fps measurement; make the FPS test reproducible with its device
   and throttle method.
3. Make the two privacy test origin expectations derive from `baseURL`, then
   rerun them against the live deployment.
