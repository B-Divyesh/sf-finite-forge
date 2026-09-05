# Finite Forge checkout registration repair handoff

## Result

**BLOCKED — one external billing finding and zero untested product claims.**

Implementation `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea` is deployed at
<https://finite-forge.sociobot.in>. Documentation/evidence commit
`92b45bb84df2936ad3535038eef4efbbcb997ad7` does not change the product image.

The game repair passed fresh live QA. The remaining release blocker is external
billing registration: the advertised `finite-forge` checkout still returns
HTTP 404, so a new buyer cannot obtain the $5 full-campaign license. The
product site's designed 404 is correct and is not the finding. No product-code
change was made because the public checkout link and client license flow are
already correct.

## Verified

- All 22 exact declared claim commands passed after a fresh `npm ci`.
- Local gates passed: 7 Vitest tests, 24 Playwright tests, typecheck, lint,
  build, production audit, and full audit.
- The live Playwright suite passed 24/24 and the deployed JS, CSS, and artwork
  byte-match the implementation build.
- Fresh 1440×900 desktop and 390×844 phone views show the job, audience, first
  action, and game before scrolling.
- The one-click sample is populated, persistently labeled, resettable, and
  isolated from real progress.
- A deterministic live UI run reached **Final beacon lit** after 5 runs, 30
  blueprints, and 419 ticks. A separate 24-mine run reached **Sunset reached**.
  Loss, retry, restart, invalid input, malformed save recovery, settings,
  touch, pointer, and keyboard paths passed.
- Accessibility, reduced motion, 200% reflow, route metadata, legal pages,
  privacy requests, headers, caching, and the designed HTTP 404 passed.
- Live frame sample: 60.00 fps with 16.7 ms p95 at 390×844 and 4× CPU.
- Lighthouse: 100/100/100/100; LCP 1.1 s, TBT 0 ms, CLS 0.
- The verify endpoint returned 429 on request 31 with `Retry-After: 4`.

## Evidence and commands

Full report: `.factory/verification-6.md`

Fresh evidence: `.factory/qa-7/` and `.factory/qa-7/verify-live/`

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
BASE_URL=https://finite-forge.sociobot.in npx playwright test
```

## Remaining action

Register the one-time `finite-forge` product through the factory Sociobot
billing workflow. Then verify a real checkout, return token, live verification,
and entry into run two. This worker has no `/opt/fleet/new-paid-product.sh`
helper or product billing registration credential, so it cannot perform that
external registration safely. No payment stub, invented credential, or
product-code workaround was added.
