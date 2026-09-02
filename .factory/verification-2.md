# Independent verification 2 — FAIL

Tested candidate commit `6db9a27e2ce165cda2e030ac885e8e602918b5d1` on
2026-09-02 UTC against <https://finite-forge.sociobot.in>.

## Result

**FAIL.** The live deployment is the tested candidate and its implementation
quality gates are strong, but it misses a core researched-brief requirement:
the product must be a satisfying, finite **30–45 minute** browser game. Its
whole campaign has only 63 shortest-path production actions, every action is
immediate, and unlock order is fixed. A deterministic five-plan run reached
the real final screen without waiting or any timed challenge. There is no
mechanic that can make a normal campaign occupy the stated session length.

## First read, cold live page

The cold page plainly says it is a finite incremental game: “Build a beacon
before sunset.” It says it is “For reset fans who want one complete campaign
on a phone,” and the first action is **Try it with sample data**, explained as
loading plan three with stocked materials. The 390×844 first screen visibly
contains the forge board and Mine control, not a menu wall. The direct demo
shows the persistent “Demo — sample data, nothing is saved” banner, stocked
plan-three board, Reset demo, and Start for real.

## Required claim gate — PASS

After `npm ci`, I executed every exact `test` command listed in
`.factory/claims.json`, separately, through the shipped demo/game entry
point. All passed (one Chromium test each):

| Claim ID | Command result |
|---|---|
| `campaign-final-ending` | PASS |
| `campaign-price-availability` | PASS |
| `campaign-duration` | PASS |
| `production-input` | PASS |
| `tick-budget` | PASS |
| `local-progress` | PASS |
| `no-offline-income` | PASS |
| `local-only` | PASS |

The candidate's “campaign-duration” public claim is precisely *63 production
actions*, not the 30–45 minute duration required by the researched brief.
The test proves that number, and thereby helps establish the release blocker
below.

## Local quality gates — PASS

From this clean candidate checkout:

- `npm ci`: PASS. `npm audit --omit=dev`: 0 production vulnerabilities.
- `npm test`: PASS — 6 Vitest tests and 13 Chromium Playwright tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` produced.
- Production build: JS 12.35 kB raw / 4.84 kB gzip; CSS 7.30 kB raw / 2.27 kB
  gzip; hero image 27.95 kB. All are below the static-product budgets.

`npm audit` including development tooling reports 5 advisories (3 moderate,
1 high, 1 critical); this does not affect the static runtime, but is retained
as a low-severity maintenance item.

## Live deployment, privacy, and product behavior

- The live root HTML SHA-256 is
  `be0fe8b1ae270476c68aaeb6d119d8cc919f58d1ce0cdfc1cb53c3bc6940efa5`,
  exactly matching local `dist/index.html`. Live hashed JS, CSS, and hero
  image also byte-match the candidate build.
- The live production flow was played from a fresh root state through five
  completed plans to **Final beacon lit**. It said “You completed five forge
  plans. This campaign ends here.” **Start a new campaign** reset it to run 1,
  0/24 ticks, no tools.
- Pointer/touch controls and M/S/C keyboard controls work. At 24/24 ticks a
  failed plan displays **Revise this plan**; retry starts the same run at
  0/24 and does not add a tool. Demo begins at 6/24 with Bellows, Pattern,
  2 ore, 2 parts, and 2 charge. A fresh direct demo context created only
  `demo:finite-forge:v1`; it did not create the real save.
- Progress and settings persist. The motion setting changes the board class;
  sound setting persists. A malformed local save is announced with a recovery
  message and becomes valid after the next production action.
- The live request log for root, demo, controls, and all normal routes
  contained only `https://finite-forge.sociobot.in`. There are no analytics,
  third-party scripts, sign-in, server API, checkout, PWA, library, or CLI
  endpoints to test. Thus endpoint allowance/rate limiting is not applicable.
- Valid page loads had no console or page errors. Loading the designed 404
  URL yields the browser's expected console network entry for its HTTP 404
  document; `/missing-plan` correctly responds HTTP 404.
- `verify-url.sh` PASS: HTTPS 200, title, `lang=en`, one h1, main landmark,
  image alt text, and no root-page console errors. Live `/demo`, `/privacy`,
  and `/terms` each have correct title, one h1, main landmark, and canonical.
- Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and `/missing-plan`. Keyboard Tab shows a 3 px amber focus ring;
  the skip link focuses main; How it works scrolls and focuses its heading.
  At 390 px, checked Demo, Settings, Reset demo, and Mine controls were all
  at least 44 px high. Reduced-motion mode sets smooth scrolling to `auto`
  and animation/transition durations to 0.01 ms.
- Mobile Lighthouse: performance 99, accessibility 100, best practices 100,
  SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 130 ms, CLS 0. Under 4× CPU throttling,
  301 `requestAnimationFrame` frames over 5,012.2 ms measured 59.85 fps
  average (16.7 ms p95 interval).
- Security headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and the declared CSP.
  Hashed JS/CSS/image assets serve `Cache-Control: public, max-age=31536000,
  immutable`. Root/demo use the normal 30-second HTML cache policy.

## Defects

### Critical — the shipped game cannot meet the promised evening-length session

The original brief's job is a real **30–45 minute ending** for players who
enjoy planning a reset. The candidate implements five identical six-charge
plans with fixed, automatic tool awards (Bellows → Pattern → Lens → Sundial).
The documented optimum is only 63 button/key actions; actions have no delay,
cooldown, timed simulation, choice of tool, variable plans, levels, or other
meaningful planning challenge. A five-plan scripted run reaches the genuine
final screen immediately. Therefore the product is a short click sequence,
not the required 30–45 minute finite game, and fails the core job-to-be-done.

### Low — development dependency advisories

`npm audit` reports 5 development-tooling advisories. Production-only audit
is clean and the deployed static artifact has no runtime package dependency.

## Evidence locations

Ephemeral verifier evidence was captured in `/tmp` during this run, including
`finite-forge-cold-mobile.png`, `finite-forge-demo-mobile.png`, and
`finite-forge-lighthouse.json`. The reproducible commands and live URL above
are the primary evidence. No product code was modified.
