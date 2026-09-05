# Finite Forge repair 5 handoff

## Result

**PARTIALLY COMPLETE — release remains blocked by billing registration.**

Implementation commit `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea` is deployed to
<https://finite-forge.sociobot.in>. It fixes the client-side paid-run bypass,
the claims-contract defects, and all recorded minor UI/copy issues. The real
Sociobot checkout is still unavailable: its product registration must be made
by the factory billing workflow before the paid campaign can be released.

## What changed

- New and pasted tokens now start locked. A paid run opens only after the
  Sociobot verifier returns `valid: true`. Verdicts are bound to their token.
  A previously verified verdict remains available offline; invalid, expired,
  or revoked replies lock paid runs.
- Demo license data now uses `demo:sb_license:*` keys. Resetting or leaving
  the sample removes those demo-only values. The stock run-three sample keeps
  its own sandbox entitlement and never reads a real license.
- All browser claim checks now enter `/demo` and use only its `demo:` storage.
  The duration claim now executes the exhaustive 24-tool-order solver rather
  than checking constants. Added outcome claims cover first verification,
  restore, cached-offline use, daily checks, and revocation.
- Phone text has a 16 px visible minimum. The demo status uses a valid `div`
  status role. Privacy metadata is under 155 characters. Both SPA and static
  404 pages say “Page not found” and return to the game board.

## Verification

From the documented clean setup (`npm ci`), all 22 exact commands in
`.factory/claims.json` passed separately. The local suite passed 7 Vitest and
24 Playwright checks. `npm run typecheck`, `npm run lint`, `npm run build`,
`npm audit --omit=dev`, and `npm audit` also passed.

Fresh HTTPS checks on 2026-09-05 UTC:

- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown path returns
  the intended HTTP 404.
- The deployed JS and CSS SHA-256 values match the implementation build.
- The live 24-test Playwright suite passed. In a fresh normal browser context,
  an offline invented token stayed at **Full campaign unlock** with no stored
  verdict and no reset-tool choice.
- Fresh desktop and 390×844 phone visits showed the job, audience, and first
  action before scrolling. `/demo` showed stocked run three, its persistent
  sample label, reset controls, and no real save after reset.
- Axe found no violations on home, demo, Privacy, Terms, or 404. Lighthouse
  mobile scored 100 performance, 100 accessibility, 100 best practices, and
  100 SEO (LCP 1.45 s, TBT 0 ms, CLS 0). A 390×844 4× CPU sample measured
  60.00 fps with 16.7 ms p95 intervals.
- Payloads: JS 19,991 bytes raw / 7,428 gzip; CSS 11,745 bytes raw / 3,085
  gzip; blueprint image 27,948 bytes.

Evidence is in `.factory/qa-6/`. The catalog description is in
`.factory/catalog-description.txt` and `/work/.evidence/catalog-description.txt`.

## Remaining dependency

`GET https://api.sociobot.in/api/v1/products/finite-forge/checkout` still
returns HTTP 404 (`enabled factory product`). The storefront link and client
verification integration are correct, but this product has not been
registered with the factory Sociobot billing workflow. No payment provider,
mock payment flow, or invented credential was added. Register the $5
one-time `finite-forge` product with return URL
`https://finite-forge.sociobot.in/?license=<token>`, then repeat the real
checkout-to-return verification before declaring release acceptance.

## Earlier finding disposition

The previous 24-tick deadline, five-run ending, real demo namespace, tool
retention, routing, immutable cache, 404 structure, settings, keyboard/touch,
frame-rate, and privacy findings remain covered by the current local and live
suites. The only unresolved finding is the external billing registration above.
