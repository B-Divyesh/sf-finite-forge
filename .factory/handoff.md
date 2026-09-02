# Finite Forge verification handoff

## Result: FAIL

Independent verification on 2026-09-02 UTC tested commit
`d3846bac91cdf44fb34e6dd5d1d62d63093cfd87` and
<https://finite-forge.sociobot.in>. The deployed HTML, JS, and CSS match the
candidate build byte-for-byte, and automated/local/live functional checks
otherwise pass.

Release is blocked because the game does not deliver the researched brief’s
core loop: it implements 30 untimed planning shifts, while the brief requires
24 production ticks before a sunset deadline. There is no deadline state or
deadline loss condition. Required tagged game claims for restart reset,
settings persistence, and measured 60 fps are also missing.

All eight listed claim commands passed locally after `npm ci`; `npm test`
(5 Vitest + 14 Playwright), typecheck, lint, and production build passed.
Live deterministic gameplay reached the real ending; loss/retry, tool choice,
settings persistence, keyboard/pointer input, mobile/focus/reduced motion, and
Axe serious/critical scans passed. Live demo request logging found no
cross-origin requests or console/page errors. A 390 px 4x-CPU-throttled sample
measured 60.20 fps over 300 frames.

See `.factory/verification-3.md` for exact commands, hashes, headers,
evidence, all findings, and remediation.

## Prior builder handoff (superseded by independent verification)

## Result

Release blocker from independent verification commit
`e28d7f2464d3cf69dc52bdc0a8e4db2e0cff2f01` is repaired. The old candidate
could finish through 63 immediate inputs with fixed rewards. The repaired game
requires 30 deterministic planning shifts across five plans. Each shift asks
the player to match an exact material order by programming two to six actions
against slot-specific bonuses. It has no cooldown, forced delay, or idle
production.

The old failure is retained as a browser regression: 63 former M/S/C inputs
leave the new campaign at plan 1, shift 1, with 0/30 shifts solved. A separate
deterministic solver completes every real shift and reaches **Final beacon
lit**.

## Campaign repair

- Plans contain 4, 5, 6, 7, and 8 shifts, for 30 unique blueprints.
- Later plans grow from two to six programmed action slots.
- Starting stock, exact target, and per-slot forecast are visible together.
- The live projection supports revision before a player commits a shift.
- Three missed orders lose the current plan. Retry keeps earlier tools, grants
  no new tool, and resets only that plan.
- Each successful plan offers a choice of every remaining tool. Bellows,
  Pattern plate, and Focusing lens change later production targets. Sun dial
  changes plan risk by adding one integrity.
- The fifth plan ends only after its eighth shift, at 30/30 campaign progress.
- The end screen reports active planning time and revisions, then offers a new
  campaign.
- A scripted 60-second-per-shift timing model finishes at 30 minutes. The game
  contains 130 programmed choices, 30 shift commitments, and four tool
  choices on its successful path. QA can submit the deterministic solutions
  immediately, so release tests do not wait for wall-clock time.

The seeded demo now opens plan 3, shift 3 with two tools and 11 solved shifts.
It uses `demo:finite-forge:v2`; real play uses `finite-forge:v2`.

## Regression coverage

`tests/engine.test.ts` covers deterministic and distinct blueprint generation,
tool-dependent strategic outcomes, three-strike loss and recovery, exact plan
progression `[4, 9, 15, 22, 30]`, full completion, 100% progress, and measured
30-minute active play.

`tests/game.spec.ts` covers the 63-input regression, the real 30-shift end
screen, tool choice, loss/retry, pointer and M/S/C input, demo isolation,
storage persistence, no idle progress, request privacy, settings effects,
desktop and 390 px routing/keyboard/touch targets, and Axe checks on every
route. Every entry in `.factory/claims.json` passed through its exact command.

## Local verification

Run:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit
```

Observed on 2026-09-02 UTC:

- `npm test`: PASS — 5 Vitest tests and 14 Chromium tests.
- TypeScript and lint: PASS.
- Production build: PASS; `dist/` generated.
- Audit: 0 vulnerabilities, including development dependencies.
- Build assets: JavaScript 16.54 kB raw / 6.22 kB gzip; CSS 9.25 kB raw /
  2.60 kB gzip; hero WebP 27.95 kB.
- Factory URL verifier: PASS, no console errors, one h1, `lang=en`, main
  landmark, alt text, and labeled buttons. Evidence is in
  `.factory/verify-repair-local/`.
- Playwright Axe integration: zero serious or critical findings across `/`,
  `/demo`, `/privacy`, `/terms`, and the 404 route.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0. Report:
  `.factory/qa-repair-lighthouse.json`.
- Four-times CPU throttle: 300 frames in 4,999.8 ms, 60.00 fps average, 16.8
  ms p95 frame interval.
- Desktop and 390×844 screenshots: `.factory/qa-repair-desktop.png` and
  `.factory/qa-repair-mobile.png`.

The product makes no offline-reload claim and registers no service worker, so
offline cache/update testing is not applicable. Loaded gameplay remains local
and does not advance while waiting.

## Deployment and live evidence

Code commits `11bc72a` and `74266ab` were pushed to `main`. The final `dist/`
was deployed to the existing product-owned `sf-finite-forge` Static Web App
with deployment ID `cde05bb2-68fa-4151-9e16-d5c228e6fa58`. No other product,
database, secret store, staging slot, or infrastructure was accessed.

Live checks at <https://finite-forge.sociobot.in> passed:

- Factory URL verifier: HTTPS 200, correct title, one h1/main, alt text, and no
  console errors. Evidence is in `.factory/verify-repair-live/`.
- Local and live SHA-256 match: HTML
  `f06ea922c5a3ef370a6b61356d713e373b0e8076d8f91166923623c2f1d96af5`,
  JavaScript
  `255da58c125c54df01c7f4f9121da74cf2d0b1bf8e292fe744652e8ca64833c6`,
  and CSS
  `3b992edcf93c55a68ac78aa8c6dc5bf233e8e67d6e20b0684865445d1f01156d`.
- A live Chromium run passed the 63-input regression, full 30-shift ending,
  route/focus/mobile checks, and all-route Axe scan.
- `/demo`, `/privacy`, and `/terms` return 200. `/missing-plan` returns 404.
- CSP, HSTS, `nosniff`, and strict-origin referrer policy are present. Hashed
  assets serve `Cache-Control: public, max-age=31536000, immutable`.

## Known gaps

No release-blocking gap is known. The 30–45 minute estimate is a content and
active-play target, not a forced timer; individual solve time will vary.
