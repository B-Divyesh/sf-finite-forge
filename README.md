# Finite Forge

Finite Forge is a five-plan browser incremental game for reset fans. Mine, shape, and charge through a 24-tick deadline. Completed plans add tools. The fifth plan lights the final beacon. The shortest successful campaign path uses 63 production actions.

## Who it is for

People who like improving a reset plan but do not want an endless idle game. Production controls work with touch or pointer input and the M, S, and C keys.

## Play and demo

The complete campaign is included for $0. No checkout or account is required. Open `/demo` for a seeded plan-three sample. It includes Bellows, a Pattern plate, and stocked materials. Demo progress uses `demo:finite-forge:v1`. Real progress uses `finite-forge:v1`. Reset demo restores the sample only. Start for real discards demo data.

## Run and verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Vite places the static deployable site in `dist/`. Every public, testable product claim is listed in `.factory/claims.json`.

## Privacy and deployment

Game progress and settings stay in browser localStorage. There are no analytics or third-party runtime requests. See `/privacy` and `/terms`.

Deploy the generated `dist/` directory to the static host. `public/staticwebapp.config.json` is copied to the deploy root. It sets security headers, immutable asset caching, SPA fallback, and the HTTP 404 rewrite.
