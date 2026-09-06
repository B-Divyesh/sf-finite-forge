# Finite Forge verification 10 handoff

## Result

**PASS — 0 findings and 0 untested public claims.**

The live runtime matches implementation candidate
`c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`. The exact hosted-checkout test
uses repair `3b55ebf1fec72ec7ebe91f5dadf8006710087662`. The reviewed documentation
baseline is `46f0cb504e4776a6c1cdcc1c7797776de8b889b0`.

## What was verified

- All 23 declared claim commands passed separately against the live URL.
- Chromium 145.0.7632.6, Firefox 146.0.1, and WebKit 26.0 each completed the
  five-run, 30-blueprint campaign on desktop and 390×844 touch-phone profiles.
- Keyboard, touch, unmocked gesture-started Web Audio, save/reload, malformed
  save recovery, sample isolation/reset/exit, loss/retry, final restart,
  reduced motion, focus, routes, legal pages, privacy traffic, and 404 passed.
- Axe was clean across every route and profile. `verify-url.sh` passed.
- The invalid-license response and request-31 429 with `Retry-After: 3` passed.
- Local and live Playwright suites passed 25/25. Build, typecheck, lint, and
  both audits passed. Live files byte-match the clean production build.
- Chromium at 390×844 and 4× CPU slowdown measured 60.004 fps with a 16.8 ms
  p95. Lighthouse mobile scored 100 in all four categories.

## How to verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm audit
BASE_URL=https://finite-forge.sociobot.in npx playwright test
npx playwright test -c .factory/verification-10-evidence/playwright.cross-engine.config.ts
```

Run every `test` command in `.factory/claims.json` separately with `BASE_URL`
set to the live URL for the strict claim gate. See
`.factory/verification-10.md` and `.factory/verification-10-evidence/`.

## Support boundaries

The six profiles are pinned Playwright Linux engine builds, not branded mobile
or macOS browser releases. No physical audio hardware was available; unmocked
Web Audio initialization after a user gesture passed. The game advertises no
multiplayer or offline application mode. No payment or real entitlement was
created.

## Known gaps

None found within the public product claims.
