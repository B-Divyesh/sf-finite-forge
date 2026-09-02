# Independent verification — FAIL

Tested candidate `6ad408f115c0a76cd8364db4a362833545f295ca` from
`main` against `https://finite-forge.sociobot.in` on 2026-09-02 UTC.

The candidate **FAILS release verification**. The live files match the
candidate build, but a normal player cannot buy the required full-campaign
license because the advertised checkout returns HTTP 404. The supported game
flow therefore cannot reach the final campaign screen. The Demo navigation
also writes to the real save instead of entering the promised sandbox.

## Mandatory gates

### Claims gate — PASS after clean install

`.factory/claims.json` exists. After `npm ci`, every listed command passed:

| Claim | Command | Result |
|---|---|---|
| `reaches-end-screen` | `npx playwright test --grep @claim:reaches-end-screen` | PASS, 1 test |
| `restart-resets-state` | `npx playwright test --grep @claim:restart-resets-state` | PASS, 1 test |
| `tick-budget` | `npx playwright test --grep @claim:tick-budget` | PASS, 1 test |
| `local-progress` | `npx playwright test --grep @claim:local-progress` | PASS, 1 test |
| `no-offline-income` | `npx playwright test --grep @claim:no-offline-income` | PASS, 1 test |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS, 1 test |

The commands were invoked once before dependencies were installed and stopped
at module resolution (`playwright` absent). `npm ci` installed the lockfile,
after which all six actual claim runs passed.

The claim suite is incomplete despite passing. The page and README also claim
that the first run is free, the campaign costs $5 once, touch and M/S/C inputs
work, the fifth plan lights the beacon, and a campaign takes 30–45 minutes.
None has a corresponding claim entry. The quantitative duration claim is not
measured. The `reaches-end-screen` test only reaches the per-run reset panel,
not the final campaign end screen.

### Cold first-read gate — PASS

At 1440×900 the first screen says:

- What: “Build a beacon before sunset.”
- For whom: “For reset fans who want one complete campaign on a phone.”
- First action: “Try it with sample data”, followed by “Loads a planned forge
  run.”

The forge board begins in the first screen. At 390×844 it begins at y=534 and
the first production control is visible. This is the game, not a menu wall.
Screenshots: `qa-first-screen-desktop.png` and
`qa-first-screen-mobile.png`.

The demo action exists, but the demo does not contain sample data: it stores
the same untouched run-one state as the real game (0 ore, 0 parts, 0/6 charge,
0/24 ticks). `.factory/demo.md` also describes it as an empty board. This does
not satisfy the required opinionated sample-data demo.

## Release-blocking findings

### Critical — paid path is unavailable, so the real ending is unreachable

Fresh `/demo`, with no manipulated license state:

1. Complete plan 1 in 18 actions and reset; Bellows is added.
2. Complete plan 2 in 18 actions and choose “Reset the forge”.
3. The game remains at `RUN 02 · Beacon ready` and announces: “The free forge
   includes the first reset. The full campaign needs a license.”
4. `GET https://api.sociobot.in/api/v1/products/finite-forge/checkout`
   returns `404` with `{"error":"enabled factory product","status":404}`.

The brief requires a complete 4–6 run campaign. A normal visitor cannot reach
it. This independently confirms the previously noted product-registration gap
is still present in production and is not merely historical.

### Critical — the header Demo link is not a sandbox

From a fresh home page with real progress at tick 7, keyboard-activating the
header “Demo” link changed the address to `/demo`, but rendered no demo banner.
Pressing M advanced the real save to tick 8. Local storage contained only
`finite-forge:v1`; `demo:finite-forge:v1` was absent.

Directly loading `/demo` and using the primary “Try it with sample data” button
do use the demo namespace. The header route is nevertheless an advertised path
to Demo and violates the sandbox/privacy contract.

### High — progression contradicts the stated rules

- Spending all 24 ticks without charging shows the loss panel, but “Try this
  plan again” grants Bellows and starts `RUN 02`. This contradicts “A completed
  plan adds one useful tool” and allows progression through intentional losses.
- With a cached valid license verdict, four active plans were completed. Reset
  after plan 4 immediately displayed “Final beacon lit” on the already-finished
  board while relabelling it `RUN 05 · Beacon ready`. There was no fifth active
  plan, yet the end panel and README claim five completed plans.
- The settings values persist, but “Show board motion” and “Enable sound cues”
  have no effect. No motion state is applied and no audio API or media is used.
  The settings panel is also visibly rendered while its button reports
  `aria-expanded="false"`; the author `display:flex` rule overrides `hidden`.

### High — production headers/routing do not match the shipped configuration

- HTML and assets have no `Content-Security-Policy` response header. The root
  `staticwebapp.config.json` declares one but is absent from `dist/`.
- Every hashed JS/CSS/image asset is served with
  `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable
  caching.
- An unknown route renders the designed not-found page but responds HTTP 200,
  not 404.

### High — claims coverage is incomplete

The unlisted public claims described in the mandatory claims gate are a
release-blocking contract violation. The most important omitted claim—the real
campaign ending—is also false in the supported live purchase flow.

## Other findings

### Medium — route and keyboard focus behavior is incomplete

- “How it works” changes the URL to `/#how` but leaves `scrollY` at 0; the
  section remained 1,273 px below the viewport.
- SPA route changes attempt to focus the `<h1>`, but it is not focusable.
  Focus falls back to `<body>` instead of the new page heading.
- `/demo` uses the home title instead of a route title such as
  “Demo — Finite Forge”. Canonical metadata stays on `/` for all routes.

### Medium — several touch targets are below the required 44 px

At 390 px, measured targets included the 20 px-high wordmark, 36 px Settings
button, 43 px navigation links, 34 px license field, and 15 px footer links.
The production action buttons themselves measured 59 px high and passed.

### Low — development dependency audit findings

`npm audit` reported 3 moderate, 1 high, and 1 critical development-tool
finding, chiefly Vitest 2.1.9 and its nested Vite. `npm audit --omit=dev`
reported zero production vulnerabilities, and the deployed app has no runtime
package dependencies.

## Passing evidence

- `npm ci`: PASS.
- `npm test`: PASS — 4 Vitest tests and 7 Chromium tests.
- `npx tsc --noEmit`: PASS. No lint script exists.
- `npm run build`: PASS; `dist/` produced.
- Build budgets: JS 11.58 KB raw / 4.62 KB gzip; CSS 7.64 KB raw /
  2.37 KB gzip; hero WebP 27.95 KB.
- Live identity: SHA-256 for HTML, JS, CSS, and hero image exactly matches the
  local production build.
- Live outgoing-request log through the full free demo flow: only the document,
  candidate JS, candidate CSS, and hero image on the product origin. No console
  or page errors.
- Direct demo isolation: “Reset demo” preserved a sentinel real save and reset
  only `demo:finite-forge:v1`.
- Input: pointer/touch production controls work; M/S/C work; Tab focus is
  visible with a 3 px amber outline; the skip link focuses `main`; settings and
  progress persist after reload.
- Game boundaries: the 24th successful charge wins; 24 unsuccessful actions
  produce the loss panel; retry clears resources and ticks; final restart
  clears tools/resources when the final panel is reached with seeded license
  state.
- Axe: no serious or critical findings on home, demo, privacy, terms, or the
  not-found screen.
- Reduced motion: media query matched, smooth scrolling became `auto`, and
  animation/transition durations became 0.01 ms.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100,
  SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 100 ms, CLS 0; 35 KiB transferred.
- Frame timing: 301 animation frames over 5,001.9 ms under 4× CPU throttling,
  60.18 fps average, 16.7 ms p95 frame interval.
- License verification API rate limit: 30 immediate invalid-token requests
  returned 200; request 31 returned 429 with `Retry-After: 4` and
  `X-RateLimit-After: 4`.
- Security headers present: HSTS, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- The supplied `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one h1,
  main landmark, alt text, and no console errors. Evidence is in `verify-url/`.

Not applicable: no sign-in, product backend, library/CLI package, or PWA
service worker is present.

## Evidence files

- `qa-first-screen-desktop.png`
- `qa-first-screen-mobile.png`
- `qa-live-final-screen.png`
- `qa-lighthouse.json`
- `verify-url/verify.json`
- `verify-url/screenshot-desktop.png`
- `verify-url/screenshot-mobile.png`
