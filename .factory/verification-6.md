# Build a beacon before sunset — verification 6

Verified on 2026-09-05 UTC against
<https://finite-forge.sociobot.in>.

- Implementation reviewed: `c4cce27b42edb13501651aaae3f57f6fcdd0f3ea`
- Documentation/evidence reviewed: `92b45bb84df2936ad3535038eef4efbbcb997ad7`
- Verdict: **FAIL**
- Findings: **1 critical, 0 high, 0 medium, 0 low**
- Untested public claims: **0**

The live deployment byte-matches the implementation build. The game, demo,
claims, accessibility, privacy, and performance checks pass. Release is still
blocked because a new player cannot buy the advertised full campaign.

## Finding

### Critical — the advertised $5 checkout is unavailable

The supported buy link still fails:

```text
GET https://api.sociobot.in/api/v1/products/finite-forge/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

This is not the product site's intentional not-found page. `/missing-plan`
correctly returns a designed HTTP 404 and is not a defect. The billing 404
breaks the advertised purchase path. Run one is playable, but a new buyer
cannot obtain a legitimate token and reach runs two through five.

The client-side integration is otherwise correct. A new or pasted token stays
locked until Sociobot verifies it, a previously verified token works offline,
the daily check is cached, and revocation locks paid play. An invented token
entered while offline stayed locked and created no verdict. The live verify
endpoint returned 200 for an invalid token; request 31 in a burst returned 429
with `Retry-After: 4`.

Required action: register the `finite-forge` $5 one-time product through the
factory billing workflow, then verify a real checkout, return token, live
verification, and entry into run two. No product-code repair is indicated by
this finding.

## Declared claim checks

After `npm ci`, I ran every exact command in `.factory/claims.json`
individually from the clean checkout. All 22 passed.

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

The duration command exhaustively solved all 24 reset-tool orders rather than
checking constants alone. The browser claims use `/demo` and the `demo:`
storage namespace. Public landing, game, legal, footer, and README statements
map to the declared claims. No public claim was left untested. The paid-unlock
client claim passes with the recorded valid-response fixture, but the separate
live integration finding above makes the public purchase path false today.

## First screen and sample

Fresh 1440×900 desktop and 390×844 phone contexts showed, before scrolling:

- Job: “Build a beacon before sunset.”
- Audience: “For reset fans who want a 30–45 minute campaign with a deadline.”
- First action: “Try it with sample data,” followed by what it opens.
- Game: the active board begins at 752 px on desktop and 533 px on phone, so
  the first viewport shows the game rather than a menu wall.

One click opened `/demo`. It showed the persistent “Demo — sample data,
nothing is saved” label, run three, blueprint four, tick 7, 4 ore, 3 parts,
5/18 charge, Bellows, and Pattern plate. The label remained after play. Reset
restored that state. Start for real removed the demo save. A real-save snapshot
was unchanged by entry, play, reset, and exit. Sample requests stayed on the
product origin.

Evidence: `.factory/verify-6-live/desktop.png`, `phone.png`, and
`demo-phone.png`.

## Game paths

- A deterministic live UI run started with a fresh campaign, played all 30
  blueprints, chose four reset tools, and reached **Final beacon lit** with
  5/5 runs, 30/30 blueprints, and 419 production ticks.
- The ending offers **Start a new campaign**. The reset claim confirms run,
  blueprint, resources, tools, ticks, total progress, and campaign progress
  return to their initial values.
- Spending all 24 ticks without finishing reached **Sunset reached** at zero
  ticks. Retry returned to the same blueprint at tick zero and retained prior
  tools in a later-run check.
- An unknown key spent no tick. Charging without a part spent one tick and
  announced why. A malformed save recovered to a playable sample.
- Touch, pointer, and M/S/C controls advanced isolated sample states. The
  sunlight bonus and every reset tool changed the visible production outcome.
- Motion and sound switches took effect and persisted. Sound started only
  after opt-in and a player action.

End-screen evidence:

- `.factory/verify-6-live/final-screen.jpeg`
- `.factory/verify-6-live/loss-phone.png`
- `.factory/verify-6-live/game-traces/` contains the complete live win and
  loss/retry traces.

## Accessibility, mobile, privacy, and routes

- `verify-url.sh` passed in 592 ms with no console errors, `lang=en`, one h1,
  a main landmark, complete image alt text, and labeled buttons.
- The live Playwright suite passed 24/24. Axe found no serious or critical
  violations on home, demo, Privacy, Terms, or 404.
- Keyboard entry exposes the skip link; Enter focuses main. Route navigation
  scrolls and focuses the target. All interactive targets sampled on phone are
  at least 44×44 CSS px and visible text is at least 16 px.
- Reduced motion removes the resource animation. There is no horizontal
  overflow at 390 px or the 640 px reflow check used for 200% desktop zoom.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-plan` returns
  the expected designed 404. Each route has its own title, one h1, canonical,
  description, standard header, and footer. Privacy metadata is 121 characters.
- Normal and sample play made no request away from the product origin. There
  are no analytics or third-party scripts. Progress and settings stay in
  browser storage; demo keys are isolated. There is no offline-app promise or
  service worker. Only a previously verified license is promised offline.
- The product is static, single-player, and account-free. Product-backend
  restart persistence, tenant isolation, and multiplayer room checks do not
  apply.

## Build, deployment, and performance

- `npm ci`: PASS, 54 packages, no vulnerabilities.
- `npm test`: PASS, 7 Vitest and 24 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev` and `npm audit`: PASS.
- Live Playwright: PASS, 24/24.
- JavaScript: 19,991 bytes raw / 7.46 kB gzip.
- CSS: 11,745 bytes raw / 3.06 kB gzip.
- Blueprint image: 27,948 bytes.
- Live 390×844, 4× CPU sample: 60.00 fps, 16.7 ms p95 over 181 frames.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0, 39 KiB transferred.
- Live JS, CSS, and artwork SHA-256 values match the local implementation
  build. Hashed assets use one-year immutable caching; HTML revalidates after
  30 seconds. CSP, HSTS, `nosniff`, and strict-origin referrer policy are live.

Evidence: `.factory/verify-6-live/lighthouse.json` and
`.factory/verify-6-live/url-check/`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Header Demo route touched real progress; sample was empty | Fixed; one-click sample is stocked and isolated. |
| Loss granted progress; fifth run was skipped | Fixed; loss retries the same blueprint and the live run plays all 30. |
| Settings had no effect or incorrect expanded state | Fixed; effects, persistence, and hidden state pass. |
| Route focus, titles, links, headers, cache, and 404 structure failed | Fixed on live HTTPS. |
| Touch targets, small phone text, demo ARIA, Privacy metadata, and 404 copy failed | Fixed; current mobile and Axe checks pass. |
| Campaign lacked the 24-tick loop and a 30–45 minute design | Fixed; every blueprint has 24 ticks and every tool order needs at least 400 decisions, yielding the tested 33.3-minute planning budget. |
| Required game and public claims were missing or tautological | Fixed; all 22 outcome commands pass in the sandbox. |
| `npm test` timed out; audits reported advisories | Fixed; all clean gates and audits pass. |
| Paid unlock was absent | Fixed in the client; run one gates at the paid panel and verified tokens open later runs. |
| Invented offline token opened paid play | Fixed; it remains locked with no cached verdict. |
| Live checkout was not registered | **Open; this is the sole finding in this report.** |

## Verdict

**FAIL — 1 finding, 0 untested claims.** The game implementation is ready, but
release acceptance requires a working real checkout.
