# Finite Forge verification 8 handoff

## Result

**FAIL — 1 medium finding, 0 untested public claims.**

The runtime implementation is `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`.
The documentation baseline is `4f26b4f3a5e2ac06c440305f9aabc504bd624238`.
No product code changed in this verification.

## What was verified

- Fresh desktop and phone browsers show the job, audience, first action, and
  active game board before scrolling.
- The one-click `/demo` sample is stocked, labeled persistently, resets
  exactly, and does not change a separate real save.
- A live deterministic run reached the five-run final ending. A separate run
  lost at 24 ticks and recovered through retry.
- All 23 declared claim commands pass individually. The local suite also
  passes: 7 Vitest tests and 25 Playwright tests. Typecheck, lint, build, and
  production dependency audit pass.
- Live route, header, privacy, keyboard, focus, reduced-motion, phone, Axe,
  and URL-verifier checks pass. The live artifact matches the implementation
  build by SHA-256.
- The $5 endpoint now returns `303` to the Dodo hosted checkout, which returns
  `200`. No payment, card, customer, or actual entitlement was created; that
  read-only result is checkout availability only.

## Remaining action

The current `checkout-available` claim test only accepts an arbitrary HTTPS
redirect. It must assert the approved hosted checkout destination and a
successful read-only response. This is a test/claims repair, not a known
billing-provider outage or a client-code defect.

Evidence and the full disposition are in `.factory/verification-8.md` and
`.factory/verification-8-evidence/`.
