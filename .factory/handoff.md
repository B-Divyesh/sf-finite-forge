# Finite Forge verification handoff — FAIL

Candidate `6ad408f115c0a76cd8364db4a362833545f295ca` was independently tested at
`https://finite-forge.sociobot.in` on 2026-09-02 UTC. The live HTML, JS, CSS,
and hero image match the candidate build byte for byte.

## Result

**FAIL — do not release this candidate.**

The normal game flow cannot reach the campaign ending. After two completed
plans it requires a license, while the advertised Sociobot checkout returns
HTTP 404. The header Demo link is also unsafe: it displays `/demo` without
entering demo mode and writes actions to `finite-forge:v1`.

Other release findings:

- The demo starts with an empty board, not sample data.
- Public duration, pricing, input, and final-ending claims are missing from
  `.factory/claims.json`; the listed end-screen test stops at an intermediate
  reset panel.
- A loss grants a new tool despite copy saying completed plans do so.
- The final panel is reached after four active plans while claiming five.
- Motion and sound settings persist but do not affect the game; the panel is
  visible even while its button reports `aria-expanded="false"`.
- Production has no CSP, hashed assets cache for only 30 seconds, and the
  designed 404 responds with status 200.
- SPA section scrolling/focus and several 44 px touch targets fail the stated
  accessibility contract.

## Verification that passed

- All six claim commands pass after `npm ci`.
- `npm test`: 4 unit + 7 browser tests pass.
- `npx tsc --noEmit` and `npm run build` pass; `dist/` is produced.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1 s and CLS 0.
- Axe found no serious/critical issues on all routes tested.
- 390 px touch play, M/S/C keyboard play, loss/recovery, deadline win,
  persistence, restart, reduced motion, and direct demo storage isolation work.
- Demo gameplay sends only same-origin requests and logs no page/console errors.
- Measured 60.18 fps over five seconds with 4× CPU throttling.
- License verification rate limit allows 30 immediate requests; request 31
  returned 429 with `Retry-After: 4`.

Full reproduction steps, hashes, metrics, and evidence paths are in
`.factory/verification.md`. No product code was changed during verification.

## Re-run

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Then verify the live checkout and play from a clean `/demo` context through
the genuine final campaign screen without pre-seeding license state.
