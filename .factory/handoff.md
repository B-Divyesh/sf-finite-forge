# Finite Forge repair 3 handoff

## Result

The release blockers in independent verification commit `1056ba8` are fixed.
The deployed product now implements the researched core loop: every forge run
has exactly 24 production ticks, the sunset deadline is always visible, and an
unfinished beacon loses when tick 24 ends. The repair source commit is
`39ef832`.

## Reproduction and root-cause repair

Before editing, a clean `npm ci && npm test` passed while asserting the wrong
game. `src/engine.ts` defined `[4, 5, 6, 7, 8]` planning shifts, the page said
“30 planning shifts,” and no sunset or deadline state existed. This reproduced
the verifier's exact finding rather than a test failure.

The replacement deterministic engine now provides:

- Five beacon runs with a strict 24-tick budget in every run.
- A 24-part sunset rail, numeric ticks used, and ticks remaining.
- A real deadline loss screen at tick 24 and a retry that grants no tool.
- Mine, shape, and charge actions; each action spends exactly one tick.
- A deterministic sunlight schedule with the next six bonuses visible.
- Rising charge goals of 12, 14, 17, 19, and 36.
- Four player-chosen reset tools with tested production effects.
- A final ending only after five wins, followed by a complete campaign reset.
- A fixed 60 Hz render loop with delta clamping and hidden-tab pause behavior.
- Persistent, effective motion and sound settings. Sound remains opt-in.

An exhaustive engine test proves all 24 tool orders can finish each run before
sunset. Browser tests script the full title-to-win ending and restart, plus a
separate title-to-loss ending and retry.

## Claims and regression coverage

`.factory/claims.json` contains 15 unique claims. Each has exactly one matching
`@claim:<id>` test. The set includes the final ending, restart reset, sunset
loss, five-run structure, price, touch/pointer/keyboard input, sunlight bonus,
all reset-tool effects, seeded demo isolation, local progress, no idle income,
same-origin privacy, settings persistence, measured frame rate, and response
policy.

The two privacy checks now derive the expected origin from the loaded URL, so
the same test passes locally and in production. Demo state uses only
`demo:finite-forge:v3`; real state uses `finite-forge:v3`.

## Clean local verification

Run:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm audit
```

Observed on 2026-09-02 UTC:

- Clean install: 54 packages; 0 vulnerabilities.
- `npm test`: PASS — 7 Vitest/config tests and 15 Chromium tests.
- TypeScript and lint: PASS.
- Production build: PASS; `dist/` generated.
- JavaScript: 15,301 bytes raw / 5,870 bytes gzip.
- CSS: 11,152 bytes raw / 2,986 bytes gzip.
- Hero WebP: 27,948 bytes.
- Every one of the 15 claim commands passed separately after the clean run.
- Axe: no serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`,
  or the 404 route.
- Factory URL verifier: PASS with no console errors, one h1, `lang=en`, main,
  alt text, and labeled buttons. Evidence: `.factory/repair-3-local/`.
- Local mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 0 ms, CLS 0. Evidence:
  `.factory/qa-repair-3-lighthouse.json`.
- Local 390×844, 4× CPU sample: 300 frames over 4,999.8 ms, 60.00 fps average,
  16.8 ms p95. Evidence: `.factory/qa-repair-3-frame.json`.
- Desktop and 390 px mobile screenshots are in `.factory/repair-3-local/`.

Keyboard focus, skip navigation, 44 px mobile targets, touch input, reduced
motion, sound opt-in, malformed-save recovery, route focus, and responsive
layout are covered in Chromium. No service worker is registered and no
offline-reload claim is made, so cache update/offline reload testing is not
applicable. The no-idle test confirms loaded game state does not advance while
waiting.

## Deployment and live evidence

`dist/` was deployed through `/opt/fleet/lib/deploy-static.sh` to the existing
product-owned `sf-finite-forge` Static Web App. Deployment ID:
`b402fb2f-4a81-4f2c-b84b-9220f8fce75c`. No other product resource, database,
secret store, storage account, or staging slot was accessed.

Live checks at <https://finite-forge.sociobot.in> passed:

- Factory URL verifier: HTTPS 200, correct title, one h1/main, alt text, and no
  console errors. Evidence: `.factory/repair-3-live/`.
- Full live Playwright suite: 15/15 passed, including ending/restart,
  loss/retry, touch and keyboard, settings, privacy, 390 px, frame timing, and
  all-route Axe checks.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 1.5 s, LCP 1.5 s, TBT 0 ms, CLS 0. Evidence:
  `.factory/qa-repair-3-live-lighthouse.json`.
- Live 390×844, 4× CPU sample: 300 frames over 4,999.8 ms, 60.00 fps average,
  16.7 ms p95. Evidence: `.factory/qa-repair-3-live-frame.json`.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; `/missing-plan` returns
  404.
- CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and strict-origin
  referrer policy are present. Hashed assets return one-year immutable cache
  headers.
- Local/live SHA-256 matches: HTML
  `99fb82c198be04c9c24e4fab2b39572ad5b300c0de3423f3e9a542f073cabee7`,
  JavaScript
  `2ea8d1d422cb32f86843d952c37f84a67fe1a53821d1d66f50ad8b89c7d7979f`,
  and CSS
  `a9d9e5fad3805a59662c90ade76d53ba4fce8b9d0d2b5f0c13ff11a3e85d0d8b`.

## Known gaps

No release-blocking gap is known. This static game has no sign-in, backend,
checkout, service worker, or package-consumer surface.
