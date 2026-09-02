# Finite Forge

Finite Forge is a five-run browser strategy game for reset fans. Mine ore,
shape parts, and charge each beacon within 24 production ticks. Sunlight
bonuses and reset tools change the best plan. The fifth beacon ends the
campaign.

## Play and controls

Every action spends one tick. An unfinished beacon loses when tick 24 ends.
Winning a run lets you choose one tool for the next run. A failed run can be
retried without losing earlier tools. Starting a new campaign after the final
ending resets every run, resource, tool, and tick.

Production works with touch, pointer input, and the M, S, and C keys. Motion
and sound settings persist after reload. Sound starts only after a player
enables it and takes an action.

## Demo

Open `/demo` for a stocked run-three sample with two tools. Demo progress uses
`demo:finite-forge:v3`. Real progress uses `finite-forge:v3`. Reset demo
restores only the sample. Start for real discards demo data and returns to the
real campaign.

## Price and privacy

The complete five-run campaign costs $0. It needs no account or checkout.
Progress and settings stay in browser localStorage. There are no analytics or
third-party runtime requests. The forge has no idle timer or offline
production. See `/privacy` and `/terms`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

The measured rendering claim uses Chromium at 390×844 with 4× CPU slowdown.
It samples 180 animation intervals and requires 55–65 fps with a 20 ms p95.
Every public, testable product claim is listed in `.factory/claims.json`.

Vite places the static site in `dist/`. Deploy that directory to the static
host. The copied `staticwebapp.config.json` sets security headers, immutable
asset caching, route rewrites, and the HTTP 404 response.
