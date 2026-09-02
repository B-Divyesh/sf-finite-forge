# Finite Forge

Finite Forge is a short browser incremental game for reset fans. Mine, shape,
and charge through 24 production ticks; each completed plan adds one tool, and
the fifth plan lights the final beacon. A campaign takes about 30–45 minutes.

## Who it is for

People who like improving a reset plan but do not want an endless idle game.
It works with touch controls or the M, S, and C keys.

## Run and verify

```sh
npm install
npm run dev
npm test
npm run build
```

Vite places the static deployable site in `dist/`. Open `/demo` for the
isolated sample. Its progress uses a separate browser storage key; see
`.factory/demo.md`.

## Privacy and paid campaign

Game progress stays in browser localStorage. There are no analytics. The first
run is free. The full campaign is a $5 one-time license through Sociobot; a
buyer can paste a license token to restore it on another device. See `/privacy`
and `/terms`.

## Deployment

Deploy the generated `dist/` directory to the static host. The included
`staticwebapp.config.json` sets SPA fallback and security headers.
