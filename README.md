# Finite Forge

Finite Forge is a five-plan browser strategy game for reset fans. Program each forge shift against an exact material order and a changing forecast. Completed plans let you choose a tool. The fifth plan lights the final beacon.

## Who it is for

People who like improving a reset plan but do not want an endless idle game. One campaign has 30 planning shifts and is designed for about 30–45 minutes. Production controls work with touch, pointer input, and the M, S, and C keys. Enter runs a filled program. Backspace removes its last action.

## Play and demo

The complete campaign is included for $0. No checkout or account is required. Open `/demo` for a seeded plan-three sample. It includes Bellows, a Pattern plate, and 11 solved shifts. Demo progress uses `demo:finite-forge:v2`. Real progress uses `finite-forge:v2`. Reset demo restores the sample only. Start for real discards demo data.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Vite places the static deployable site in `dist/`. Every public, testable product claim is listed in `.factory/claims.json`.

## Privacy and deployment

Campaign progress and settings stay in browser localStorage. There are no analytics or third-party runtime requests. The game has no real-time waiting or offline production. See `/privacy` and `/terms`.

Deploy the generated `dist/` directory to the static host. `public/staticwebapp.config.json` is copied to the deploy root. It sets security headers, immutable asset caching, route rewrites, and the HTTP 404 rewrite.
