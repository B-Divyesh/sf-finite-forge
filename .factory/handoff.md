# Finite Forge verification 5 handoff

## Result

**FAIL.** Candidate `9674957f0433ffb3eea680ce99a3aae85e4f42b8` was
independently tested against <https://finite-forge.sociobot.in> on 2026-09-02
UTC. The live application byte-matches the candidate and the game, build,
tests, accessibility baseline, privacy behavior, caching, and performance are
largely sound. Release is blocked by the live paid path and by a client-side
license bypass.

## Blocking defects

1. **Critical:** the advertised Sociobot checkout still returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`. A new buyer cannot
   legitimately continue from the free run to runs two through five.
2. **High:** after run one, going offline and pasting any invented token exposes
   the tool chooser and advances to run two. The client stores an unverified
   token as `valid: true` before its first successful verification.
3. **High:** the claim commands pass, but browser claims do not consistently
   use `/demo` and the `demo:` namespace; the duration tag asserts its declared
   minimum constant rather than running the actual lower-bound solver; public
   daily-check, paste-restore, and revocation promises lack tagged claim tests.

Additional findings: phone guidance and numeric labels use 11–14 px text below
the stated 16 px/17 pt baseline; `/demo` has one minor Axe
`aria-allowed-role` issue; Privacy metadata is 166 characters; the 404 headline
uses prohibited brand metaphor.

## Verified passing behavior

- All 18 exact `.factory/claims.json` commands passed individually.
- `npm test` passed 10 Vitest and 16 Playwright tests. Typecheck, lint, build,
  both audits, and the same 16 browser tests against live all passed.
- A deterministic live run reached **Final beacon lit** through 30 blueprints
  at 419 ticks, then restart reset every field. Sunset loss, retry, retained
  tools, settings, storage recovery, touch/pointer/M-S-C inputs, and demo
  isolation passed.
- Fresh mobile Lighthouse: 100 performance / 100 accessibility / 100 best
  practices / 100 SEO; LCP 1.1 s, TBT 0 ms, CLS 0, transfer 39 KiB.
- Fresh 390×844, 4× CPU frame sample: 60.00 fps, p95 16.8 ms.
- Axe found zero serious/critical issues on home, demo, Privacy, Terms, and 404.
- Demo and normal gameplay make same-origin requests only. Product headers and
  immutable asset caching pass. The invalid-license API allowed 30 burst
  requests, then returned 429 on request 31 with `Retry-After: 3`.
- Candidate/live hashes match for HTML, JS, CSS, and hero image.

## Evidence and reproduction

The complete report is `.factory/verification-5.md`. Fresh screenshots,
Lighthouse, and frame evidence are in `.factory/qa-5/`; URL verification is in
`.factory/verify-5-live/`.

Run locally from a clean checkout:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm audit
```

No product source or deployment was changed during verification. Register the
billing product, repair first-verification gating, and correct claims coverage
before requesting another independent verification.
