# Build a beacon before sunset — verification 7

Verified on 2026-09-05 UTC against
<https://finite-forge.sociobot.in>.

- Implementation reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Documentation baseline reviewed: `e35334412ab8e055513e579c379a24012c85927c`
- Verdict: **FAIL**
- Findings: **1 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The live site byte-matches the implementation build. The game, isolated sample,
all 22 declared claims, accessibility, privacy, routes, and performance pass.
The external billing registration remains unavailable, so a new buyer cannot
purchase runs two through five.

## Finding

### Critical — the advertised $5 checkout is unavailable

The supported buy URL still fails from a clean client:

```text
GET https://api.sociobot.in/api/v1/products/finite-forge/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

This is not the product site's deliberate not-found response. The designed
`/missing-plan` route correctly returns HTTP 404 with the standard page
structure and a way back. The billing 404 breaks the advertised purchase path:
run one is playable, but a new player cannot obtain a legitimate return token
or enter run two.

The product client is ready for registration. Fixture-backed claim tests prove
that a newly returned or pasted token stays locked until Sociobot verifies it,
a previously verified token remains usable offline, the verdict is refreshed
at most daily, and revocation relocks paid play. The live invalid-token endpoint
returned HTTP 200 with CORS for the product origin. After the preceding invalid
request, burst request 30 returned HTTP 429 with `Retry-After: 4` (31 requests
in the allowance window).

Required external action: register the `$5` one-time `finite-forge` product in
the factory billing workflow, then verify checkout, return token, verification,
and entry into run two. No product-code repair is indicated.

## Declared claims

After a fresh `npm ci`, every exact command in `.factory/claims.json` was run
individually. All 22 passed.

| Claim | Result |
| --- | --- |
| `campaign-final-ending` | PASS |
| `restart-resets-state` | PASS |
| `sunset-deadline` | PASS |
| `campaign-duration` | PASS |
| `campaign-unlock` | PASS |
| `license-verification` | PASS |
| `license-restore` | PASS |
| `license-offline-cache` | PASS |
| `license-daily-check` | PASS |
| `license-revocation` | PASS |
| `campaign-structure` | PASS |
| `production-input` | PASS |
| `sunlight-bonus` | PASS |
| `reset-tools` | PASS |
| `demo-sandbox` | PASS |
| `local-progress` | PASS |
| `no-offline-income` | PASS |
| `local-only` | PASS |
| `settings-persist` | PASS |
| `frame-rate-60` | PASS |
| `retry-retains-tools` | PASS |
| `generated-image-provenance` | PASS |

The duration command solved all 24 tool orders and 720 authored blueprints.
The browser claims used `/demo` and the `demo:` namespace. Public landing,
game, README, legal, and footer statements map to these tests. The real purchase
path was also exercised and failed at checkout, so it is a finding rather than
an untested claim.

Evidence: `.factory/verification-7-evidence/claims.log`.

## First screen and sample

Fresh 1440×900 desktop and 390×844 phone contexts showed this before scrolling:

- Job: “Build a beacon before sunset.”
- Audience: “For reset fans who want a 30–45 minute campaign with a deadline.”
- First action: “Try it with sample data,” followed by what it opens.
- Game: the active run-one board starts at y=752 on desktop and y=533 on phone,
  inside both first viewports rather than behind a menu wall.

One tap opened `/demo` with the persistent “Demo — sample data, nothing is
saved” label. The populated state was run 3, blueprint 4, tick 7, with 4 ore,
3 parts, 5/18 charge, Bellows, and Pattern plate. The label remained after an
action. Reset restored that exact state. Start for real removed the demo key.
The real save remained byte-for-byte unchanged through entry, play, and reset.
All sample requests stayed on the product origin.

Evidence: `live-desktop-fresh.png`, `live-phone-fresh.png`,
`live-demo-phone-fresh.png`, `first-screen-game.json`, and
`live-independent.json` in `.factory/verification-7-evidence/`.

## Game paths and recovery

- A fresh deterministic live UI run played all 30 blueprints across five runs,
  selected four reset tools, and reached **Final beacon lit** after 419 ticks.
  The end screen showed 5/5 runs and 30/30 blueprints.
- A separate run spent all 24 ticks mining and reached **Sunset reached**.
  Retry restored the same blueprint at tick zero.
- The ending's new-campaign action reset run, blueprint, resources, tools,
  tick count, and campaign progress in its declared claim test.
- An unknown key spent no tick. Charging without material spent one tick,
  added no charge, and announced what happened. A malformed demo save recovered
  to the stocked sample and accepted the next action.
- Touch, pointer, M/S/C, sunlight bonuses, every reset tool, settings, sound
  after a user action, and later-run tool retention passed.

Recorded end-screen evidence:

- `.factory/verification-7-evidence/live-final-phone-fresh.png`
- `.factory/verification-7-evidence/live-loss-phone-fresh.png`
- `.factory/verification-7-evidence/live-playwright.log`

## Accessibility, phone, privacy, and routes

- The factory URL check passed with no console errors, `lang=en`, one h1, a
  main landmark, image alt text, and labeled buttons.
- Fresh Axe scans found zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and `/missing-plan`.
- Tab first reaches the visible skip link; Enter focuses `main`. Back and
  forward navigation restore the correct route title and focus the h1.
- Phone interactive targets sampled in the first view were at least 44 px in
  both dimensions. The smallest visible text was 16 px.
- Reduced motion changed the resource animation to 0.01 ms. The 640 px reflow
  check used for 200% desktop zoom had no horizontal overflow.
- Home, Demo, Privacy, and Terms return 200 with route-specific titles,
  descriptions, canonicals, one h1, header, and footer. The designed unknown
  route returns 404 with plain copy and a return link.
- Normal and sample play sent no request away from the product origin. There
  are no analytics, third-party scripts, accounts, or remote game saves.
- The game makes no offline-app or update claim and has no service worker. Its
  narrower promise—offline access for an already verified license—passed.

This is a static, local-first, single-player game. Product-backend tenant
isolation, restart persistence, health checks, SQLite, multiplayer clients, and
room persistence do not apply. The product's only remote integration is the
documented Sociobot license service, checked above.

## Build, deployment, and performance

- `npm ci`: PASS, 54 packages, zero vulnerabilities.
- `npm test`: PASS, 7 Vitest tests and 24 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev` and `npm audit`: PASS.
- Live Playwright: PASS, 24/24.
- JavaScript: 19,991 bytes raw / 7.46 kB gzip.
- CSS: 11,745 bytes raw / 3.06 kB gzip.
- Blueprint image: 27,948 bytes.
- Frame-rate claim: PASS at 390×844 under 4× CPU slowdown.
- Fresh Lighthouse mobile: 100 performance, 100 accessibility, 100 best
  practices, 100 SEO; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0, 39 KiB total.

The live HTML, JavaScript, CSS, artwork, and robots file match the local build
by SHA-256. HTML revalidates after 30 seconds; hashed assets use one-year
immutable caching. CSP, HSTS, `nosniff`, and strict-origin referrer policy are
live. All internal links and metadata assets return 200 except the intentional
designed 404.

## Earlier findings

| Earlier finding | Current disposition and proof |
| --- | --- |
| Billing checkout unavailable | **Open; sole finding.** Fresh external checkout returned JSON HTTP 404. |
| Header Demo touched real data or had an empty sample | Fixed. One-click stocked sample, persistent label, reset, exit, and unchanged real save passed. |
| Loss granted progress, fifth run was skipped, or settings had no effect | Fixed. Live loss/retry and 5-run/30-blueprint ending passed; settings and sound effects persist. |
| Missing 24-tick deadline or real 30–45 minute design | Fixed. Every blueprint exposes 24 ticks; every one of 24 tool orders needs at least 400 decisions, producing the tested 33.3-minute planning budget. |
| Required game/public claims missing, tautological, or outside the sandbox | Fixed. All 22 outcome commands pass through the isolated demo; the duration tag runs the exhaustive solver. |
| `npm test` timeout or dependency advisories | Fixed. Full clean suite passes and both audits report zero vulnerabilities. |
| Paid client absent | Fixed. The free gate, return token, restore, verify, cache, and revocation paths pass; only external registration remains. |
| Invented offline token unlocked paid play | Fixed. A never-verified token stays locked; only a previously verified cached token works offline. |
| Route focus, titles, canonicals, links, headers, caching, or true 404 failed | Fixed. Browser history, route metadata, link crawl, response headers, cache policy, and designed HTTP 404 passed. |
| Small touch targets or phone text | Fixed. Sampled targets are at least 44×44 px and visible text is at least 16 px. |
| Demo ARIA violation | Fixed. Fresh Axe reports no violation on any route. |
| Privacy description too long or metaphorical 404 copy | Fixed. Privacy description is 121 characters; 404 h1 is “Page not found.” |
| Live privacy tests were tied to localhost | Fixed. The full suite passes against the public HTTPS base URL and derives its request origin at runtime. |

## Verdict

**FAIL — 1 finding, 0 untested claims.** The implementation is ready, but the
real checkout must be registered before the advertised paid campaign can be
purchased and release verification can pass.
