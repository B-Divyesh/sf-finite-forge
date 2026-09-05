# Finite Forge repair 7 handoff

## Result

**FAIL — checkout registration remains unavailable.**

The product implementation remains
`c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`. The documentation baseline at the
start of this repair was
`690a52f74aa969f4ec9d3af49310f50bf365ea31`. The checkout regression commit is
`7f040e48dbe0d0f7dad7953725c6beb895bd3a56`; the fresh evidence documentation
commit is `2611d4aff7cf94e88ff3b01de6dfba51d3c106d4`. This repair adds an
external, outcome-based checkout regression check; it does not alter the
shipped game client or its payment integration.

## What changed

- Added `checkout-available` to `.factory/claims.json`.
- Added a Playwright integration check that makes a read-only request to the
  advertised full-campaign URL with redirects disabled. It requires a 3xx
  response with a hosted-checkout `Location`; it does not create a payment or
  submit buyer data.
- Kept the existing approved Sociobot endpoint and local-first game behavior
  unchanged. No payment stub, provider credential, or alternate checkout was
  introduced.

## Verification

From a clean `npm ci` install:

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --omit=dev`,
  and `npm audit` pass.
- All 22 pre-existing declared claim commands pass individually, including the
  deterministic five-run ending, sample isolation, restart, loss/retry,
  controls, settings, privacy, and frame-rate checks.
- The new command, `npx playwright test --grep @claim:checkout-available`,
  fails correctly: the live checkout returns HTTP 404 instead of the required
  hosted-checkout redirect. Consequently `npm test` also fails only at this
  new contract check.

The actual response is from
`https://api.sociobot.in/api/v1/products/finite-forge/checkout`, not the
product's deliberate designed 404 route. It returns the recorded API error
`enabled factory product` with status 404.

## Live deployment check

`/opt/fleet/lib/deploy-static.sh finite-forge dist` succeeded for the existing
one-replica static app and its `finite-forge.sociobot.in` custom domain. The
implementation artifact is unchanged from `c4cce27`; this repair ships tests,
claims, documentation, and evidence.

- A fresh 1440×900 desktop and 390×844 phone both showed the job, audience,
  first action, and active board before scrolling. The board begins at y=752
  on desktop and y=533 on phone.
- The phone sample started with 4 ore, 3 parts, and 5/18 charge. Its label
  remained after play, reset restored tick 7, Start for real removed the demo
  key, and the original real save was byte-for-byte unchanged.
- Fresh live deterministic win and loss tests passed. The five-run end screen
  and the 24-tick sunset screen are recorded in `.factory/repair-7/`.
- The live non-checkout browser suite passed 24/24. The factory URL check
  passed with no console errors, and fresh Axe scans found no serious or
  critical issue on home, demo, Privacy, Terms, or the designed 404 route.
- The checkout was checked again after deployment and still returns HTTP 404.

Evidence: `.factory/repair-7/live-desktop-first.png`,
`.factory/repair-7/live-phone-first.png`,
`.factory/repair-7/live-phone-demo.png`,
`.factory/repair-7/live-final-ending.png`,
`.factory/repair-7/live-sunset-loss.png`, and
`.factory/repair-7/verify-url/verify.json`.

## Remaining action

The factory billing workflow must register the one-time `$5` `finite-forge`
product and its return URL. The documented `fleet/new-paid-product.sh` helper
is not installed in this worker, and no product-scoped registration endpoint
or factory credential was provided. I did not invent an undocumented API call
or access another service's settings or secrets.

After registration, rerun:

```sh
npx playwright test --grep @claim:checkout-available
npm test
BASE_URL=https://finite-forge.sociobot.in npx playwright test
```

Then check a real hosted checkout, its license return, Sociobot verification,
and entry into run two. The static game itself needs no further code change.
