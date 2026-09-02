# Finite Forge independent verification 4 — FAIL

Tested candidate `228e2213152b29e0f66360a763eb03d5821456e7` from
`main` against <https://finite-forge.sociobot.in> on 2026-09-02 UTC.

## Result

**FAIL.** The live deployment byte-matches the candidate and the repaired game
now has a real 24-tick sunset loss, five playable runs, selectable reset tools,
and a reachable final ending. However, the required clean `npm test` gate fails
repeatably, and the game still does not provide the researched brief's real
30–45 minute session. The candidate also replaces the brief's one-time full
unlock with an undocumented $0 campaign, and its claims inventory omits public
claims.

## Mandatory first checks

### Claims gate — PASS for every listed command

`.factory/claims.json` exists. After `npm ci`, I ran every listed command
separately before broader QA. All 15 commands passed:

| Claim | Exact test | Result |
| --- | --- | --- |
| `campaign-final-ending` | `npx playwright test --grep @claim:campaign-final-ending` | PASS, 1 test |
| `restart-resets-state` | `npx playwright test --grep @claim:restart-resets-state` | PASS, 1 test |
| `sunset-deadline` | `npx playwright test --grep @claim:sunset-deadline` | PASS, 1 test |
| `campaign-price-availability` | `npx playwright test --grep @claim:campaign-price-availability` | PASS, 1 test |
| `campaign-structure` | `npx playwright test --grep @claim:campaign-structure` | PASS, 1 test |
| `production-input` | `npx playwright test --grep @claim:production-input` | PASS, 1 test |
| `sunlight-bonus` | `npx playwright test --grep @claim:sunlight-bonus` | PASS, 1 test |
| `reset-tools` | `npx vitest run --testNamePattern @claim:reset-tools` | PASS, 1 test |
| `demo-sandbox` | `npx playwright test --grep @claim:demo-sandbox` | PASS, 1 test |
| `local-progress` | `npx playwright test --grep @claim:local-progress` | PASS, 1 test |
| `no-offline-income` | `npx playwright test --grep @claim:no-offline-income` | PASS, 1 test |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS, 1 test |
| `settings-persist` | `npx playwright test --grep @claim:settings-persist` | PASS, 1 test |
| `frame-rate-60` | `npx playwright test --grep @claim:frame-rate-60` | PASS, 1 test |
| `response-policy` | `npx vitest run --testNamePattern @claim:response-policy` | PASS, 1 test |

### Cold first-read — PASS

At 390×844, a fresh live visit answers all three required questions in plain
words:

- What: “Build a beacon before sunset.”
- For whom: “For reset fans who want a complete campaign with a deadline.”
- First action: “Try it with sample data,” followed by “Opens run three with
  stock and two tools.”

The active run-one board is already visible in the first viewport. This is the
game, not a menu wall. The demo action enters a stocked run-three sandbox with
two tools and a persistent “Demo — sample data, nothing is saved” banner.
Evidence: `.factory/qa-4/live-first-read-390.png`.

## Release-blocking findings

### Critical — the campaign still does not meet the 30–45 minute job

The researched job is a finite browser game with a real 30–45 minute ending.
The candidate has five immediate, turn-based boards and no mechanic that can
sustain that session length. Exhaustively solving every reset-tool order found
optimal campaigns of only 72–89 production actions. A live deterministic path
used 74 actions (15, 12, 12, 13, and 22 per run) and reached the genuine final
screen in 1.34 seconds under automation. There is no cooldown, timed
simulation, additional level content, or other enforced pacing.

Automation time is not a human completion-time claim, but it proves the lack
of time-bearing mechanics. Even at two seconds per action, the longest optimal
path is under three minutes before brief tool-selection pauses. The README also
omits the intended session length required by the browser-game contract. This
is the same core duration defect found in independent verification 2; the
24-tick repair did not resolve it.

### High — the required local test gate fails consistently

The clean `npm test` command fails before Playwright starts:

```text
FAIL tests/engine.test.ts > keeps every reset-tool order winnable before each sunset
Error: Test timed out in 5000ms.
```

The exhaustive synchronous test took 7.19 seconds in the clean run. Three
additional `npx vitest run` attempts failed identically at 7.31–7.45 seconds.
An independent no-timeout probe completed all 24 tool orders successfully in
7.14 seconds, so the gameplay invariant appears true, but the shipped test
timeout makes the mandatory gate fail. This directly violates the repository
definition of done and contradicts the previous handoff's `npm test: PASS`.

### High — the brief's one-time full unlock is absent

The researched brief specifies an optional one-time full-campaign unlock after
a free first run. The candidate instead advertises “$0. All five runs are
available now. No checkout is required.” It contains no buy, restore, license,
or verification path, and the handoff does not explain this product-model
deviation. This avoids the previously broken checkout but does not implement
the acceptance contract. Because no server or unlock endpoint exists in this
candidate, API allowance and `429 Retry-After` testing is not applicable.

### High — public claims are missing compliant claim tests

The exact listed commands pass, but the cross-check required by the claims
contract found unlisted or incompletely sandboxed claims:

- The public footer says “Blueprint illustration uses original generated
  imagery.” No claim entry or tagged provenance test covers it.
- The README says a failed run can be retried “without losing earlier tools.”
  The `sunset-deadline` claim test loses only on run one, where no earlier tool
  exists, so it cannot prove the stated retention behavior.
- The README asserts that every public testable claim is in
  `.factory/claims.json`; the two cases above make that meta-claim false.

The implementation and design provenance support these statements, but the
mandatory rule is that the named claim test itself proves the observable
promise.

## Other defects

### Medium — some 390 px touch targets are narrower than 44 px

Measured live target boxes at 390 px include Demo at 35×44, Terms at 35×44,
Privacy at 43×44, and the focused skip link at 113×38. The production controls
are 328×59 and pass. The design and accessibility contracts require every
interactive target to be at least 44×44 CSS px.

### Medium — the true 404 omits the standard site skeleton

`/missing-plan` correctly returns HTTP 404 with its own title, one h1, and a
way home. However, that static route has no skip link, Demo/Privacy navigation,
Privacy/Terms footer links, “Built by Param Factory,” version/build id, or
canonical metadata. The site-structure contract requires the consistent header
and footer on every route.

## Passing evidence

- `npm ci`: PASS, 54 packages, zero audit findings.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS and generated `dist/`.
- `npm audit --omit=dev` and `npm audit`: PASS, zero vulnerabilities.
- Production build: JS 15,301 bytes raw / 5,870 gzip; CSS 11,152 bytes raw /
  2,986 gzip; hero WebP 27,948 bytes. Lighthouse transferred 37 KiB.
- Live Playwright suite: PASS, 15/15. This covers final ending/restart,
  deadline loss/retry, tool choice, touch/pointer/M-S-C input, sunlight bonus,
  demo isolation, local persistence, settings, privacy, routes, reduced motion,
  malformed-save recovery, mobile targets sampled by the suite, and axe.
- Deterministic live run: reached **Final beacon lit**, showed 5/5 runs and 74
  total ticks, then **Start a new campaign** reset run, resources, tools,
  progress, and total ticks. Evidence: `.factory/qa-4/live-final-390.png`.
- Boundary/recovery probe: an unknown key spent no tick; charging without a
  part spent one tick and announced why; 24 mining actions reached **Sunset
  reached**; retry returned to run one/tick zero with no tool. Evidence:
  `.factory/qa-4/live-loss-390.png`.
- Demo isolation: a real run-one save at tick one survived entering and
  resetting the run-three sample. **Start for real** removed only
  `demo:finite-forge:v3` and restored the real save.
- Privacy: the full live campaign requested only the root document, candidate
  JS, candidate CSS, and hero image, all on
  `https://finite-forge.sociobot.in`. No analytics, external script, API call,
  console error, or page error occurred.
- Browser response headers: CSP includes `frame-ancestors 'none'`; HSTS,
  `nosniff`, and `strict-origin-when-cross-origin` are present. Hashed assets
  use `public, max-age=31536000, immutable`; HTML uses a 30-second revalidation
  policy.
- Routes: `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route
  returns 404. Page routes have correct titles, `lang=en`, one h1, a main
  landmark, and route canonical metadata.
- Axe through the Playwright integration: zero serious or critical findings on
  home, demo, privacy, terms, and 404. Keyboard entry focuses the skip link
  with a 3 px amber outline and Enter focuses `main`. Reduced motion resolves
  animation and transition duration to 0.01 ms. A 683 CSS-pixel viewport,
  approximating 200% desktop zoom, has no horizontal overflow or content loss.
- Independent frame sample: 301 frames over 4,999.7 ms at 390×844 and 4× CPU
  slowdown, 60.00 fps average and 16.8 ms p95. Evidence:
  `.factory/qa-4/frame-live.json`.
- Live mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 50 ms, CLS 0. Evidence:
  `.factory/qa-4/lighthouse-live.json`.
- Factory URL verifier: PASS, load 581 ms, no console errors, title, `lang=en`,
  one h1, main, complete alt text, and labeled buttons. Evidence:
  `.factory/verify-4-live/`.
- Candidate/live SHA-256 matches: HTML
  `99fb82c198be04c9c24e4fab2b39572ad5b300c0de3423f3e9a542f073cabee7`,
  JS `2ea8d1d422cb32f86843d952c37f84a67fe1a53821d1d66f50ad8b89c7d7979f`,
  CSS `a9d9e5fad3805a59662c90ade76d53ba4fce8b9d0d2b5f0c13ff11a3e85d0d8b`,
  and hero `eb361c2b317a2725e476663d205a66a4f528ec87a5bfd1429ba2af614111b4df`.

Not applicable: this static browser game has no sign-in, product backend,
service worker/offline claim, library package, CLI, or multiplayer service.

## Required remediation

1. Build and measure a real 30–45 minute campaign, then state its intended
   duration in the README and add a quantitative claim test.
2. Make `npm test` pass reliably, either by optimizing the exhaustive solver
   or assigning that synchronous test an evidence-based timeout.
3. Implement the brief's Sociobot one-time unlock, or explicitly obtain and
   document approval for a free-campaign product-model change.
4. Add compliant claim entries/tests for public provenance and retained tools.
5. Enlarge all interactive targets to 44×44 and bring the 404 page into the
   standard site skeleton.
