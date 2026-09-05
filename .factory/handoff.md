# Finite Forge repair 7 handoff

## Result

**FAIL — checkout registration remains unavailable.**

The product implementation remains
`c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`. The documentation baseline at the
start of this repair was
`690a52f74aa969f4ec9d3af49310f50bf365ea31`. This repair adds an external,
outcome-based checkout regression check; it does not alter the shipped game
client or its payment integration.

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
