# Finite Forge verification 7 handoff

## Result

**FAIL — one external billing finding and zero untested claims.**

Implementation `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea` is live at
<https://finite-forge.sociobot.in>. The documentation baseline reviewed was
`e35334412ab8e055513e579c379a24012c85927c`. Later changes in this handoff are
reports and evidence only; no product code was modified.

All implementation checks pass. The remaining blocker is the unregistered
`finite-forge` billing product: its advertised `$5` checkout returns HTTP 404,
so a new buyer cannot receive a license or enter run two.

## Verified

- All 22 declared claim commands passed individually after a fresh `npm ci`.
- `npm test` passed 7 Vitest and 24 Playwright tests; typecheck, lint, build,
  production audit, and full audit passed.
- The full live suite passed 24/24, and live HTML/assets byte-match the build.
- Fresh 1440×900 desktop and 390×844 phone first views show the job, audience,
  first action, and the active game board before scrolling.
- The stocked one-click sample remains labeled, resets exactly, and leaves the
  real save unchanged.
- A fresh live run reached **Final beacon lit** after five runs, 30 blueprints,
  and 419 ticks. A separate run reached **Sunset reached** at tick 24 and
  recovered with retry.
- Invalid input, malformed-save recovery, touch, pointer, keyboard, settings,
  reduced motion, history focus, 200% reflow, route titles, legal pages,
  privacy requests, and the designed 404 passed.
- Fresh Axe scans found zero violations on every route. The factory URL check
  reported no console errors.
- Fresh Lighthouse mobile scored 100/100/100/100 with 1.1 s LCP, 0 ms TBT,
  CLS 0, and 39 KiB transferred.
- The license verifier returned a CORS-valid invalid response and enforced its
  allowance with HTTP 429 and `Retry-After: 4`.

## Evidence and commands

Full report: `.factory/verification-7.md`

Fresh evidence: `.factory/verification-7-evidence/`

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
BASE_URL=https://finite-forge.sociobot.in npx playwright test
```

## Remaining action

Register the `$5` one-time `finite-forge` product through the factory Sociobot
billing workflow. Then verify checkout, return token, live verification, and
entry into run two. This is an external billing-registration dependency, not a
product-code defect. Do not replace it with a payment stub or direct provider.
