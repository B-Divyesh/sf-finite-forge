# Finite Forge

Finite Forge is a five-run browser strategy game for reset fans. Build each
beacon across six 24-tick blueprints. Mine ore, shape parts, and charge before
sunset. The fifth beacon ends the campaign.

## Session and price

A full campaign is designed for 33.3 minutes. Every reset-tool order needs at
least 400 production decisions. The estimate budgets five seconds to read the
forecast and choose each action. Run one is free. A $5 one-time Sociobot
license adds runs two through five. Sociobot and Dodo are the merchant of
record. Refunds revoke the license.

After checkout, Finite Forge stores the returned license in browser storage
and checks it with Sociobot before opening paid runs. The check happens on
return, then at most once a day. A buyer can paste a license token to restore
a purchase on another device. A previously checked license keeps paid progress
available while offline.

## Play and controls

Every action spends one tick. An unfinished blueprint loses when tick 24 ends.
Complete six blueprints to finish a beacon run. Winning a run lets you choose
one tool for the next run. A failed later blueprint can be retried without losing
earlier tools. Starting a new campaign after the final ending resets every run,
blueprint, resource, tool, and tick.

Production works with touch, pointer input, and the M, S, and C keys. Motion
and sound settings persist after reload. Sound starts only after a player
enables it and takes an action.

## Demo

Open `/demo` for a stocked run-three, blueprint-four sample with two tools. Demo
progress uses `demo:finite-forge:v4`. Real progress uses
`finite-forge:v4`. Reset demo restores only the sample. Start for real
discards demo data and returns to the real campaign.

## Privacy

Progress and settings stay in browser localStorage. Game play makes no request
away from this site before a license is supplied. A supplied buyer license is
checked only with Sociobot. The forge has no idle timer or offline production.
See `/privacy` and `/terms`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

The rendering claim uses Chromium at 390×844 with 4× CPU slowdown. It samples
180 animation intervals and requires 55–65 fps with a 20 ms p95. Product
claims and their regression commands are in `.factory/claims.json`.

Vite places the static site in `dist/`. Deploy that directory to the static
host. The copied `staticwebapp.config.json` sets security headers, the
Sociobot license API allow-list, immutable asset caching, route rewrites, and
the HTTP 404 response.
