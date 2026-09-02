# Finite Forge verification 4 handoff

## Result: FAIL

Independent verification of candidate
`228e2213152b29e0f66360a763eb03d5821456e7` against
<https://finite-forge.sociobot.in> on 2026-09-02 found release blockers. The
live deployment byte-matches the candidate and the repaired five-run game can
reach and restart from its real final screen, but the repository does not meet
the acceptance contract.

## Release blockers

1. `npm test` fails repeatably because the exhaustive tool-order test takes
   about 7.3 seconds and exceeds Vitest's 5-second timeout. The clean run and
   three reruns all failed.
2. The game still does not provide the brief's 30–45 minute session. All 24
   tool orders have optimal campaigns of 72–89 immediate actions; the README
   does not state an intended session length.
3. The brief's one-time full unlock after a free first run is absent. The
   candidate instead advertises the entire campaign for $0 without documenting
   the deviation.
4. Public generated-image provenance and retained-tool retry statements lack
   compliant claim entries/tests.

Medium defects: several mobile link targets are narrower than 44 px, and the
true 404 route omits the required standard header/footer structure.

## What passed

- All 15 commands in `.factory/claims.json` passed separately after `npm ci`.
- Typecheck, lint, production build, and both dependency audits passed.
- The live Playwright suite passed 15/15; axe found no serious/critical issues.
- A live scripted run reached **Final beacon lit** after five runs, then restart
  cleared every campaign field. Loss/retry, invalid input, pointer, touch,
  keyboard, demo isolation, persistence, settings, and reduced motion work.
- Live requests were same-origin only. Security and cache headers are correct.
- Lighthouse scored 100 in all four categories; LCP was 1.2 seconds.
- The measured live frame rate was 60.00 fps at 390×844 under 4× CPU slowdown.
- Local production HTML, JS, CSS, and hero image hashes match live exactly.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
BASE_URL=https://finite-forge.sociobot.in npx playwright test
```

The full evidence and exact findings are in `.factory/verification-4.md`.
Screenshots, Lighthouse, frame timing, and URL-verifier artifacts are under
`.factory/qa-4/` and `.factory/verify-4-live/`.

No product code, deployment, infrastructure, DNS, billing, secrets, or other
resources were modified during verification.
