# Finite Forge visual system

## Direction

**Blueprint drafting sheet.** The game is a compact plan for a single evening,
not a smoky factory simulator. It uses a midnight-blue drafting paper, sharp
construction lines, an amber signal lamp, and pale ink. Each run feels like a
new marked-up plan rather than an endless dashboard.

## Tokens

| Role | Token | Value |
|---|---|---|
| Sheet | `--paper` | `#071c2d` |
| Raised sheet | `--surface` | `#0c2a40` |
| Rule line | `--rule` | `#28516a` |
| Blueprint ink | `--ink` | `#eef5ee` |
| Note ink | `--muted` | `#b9ced6` |
| Signal amber | `--amber` | `#ffc45c` |
| Amber ink | `--amber-ink` | `#1b1607` |
| Success mint | `--mint` | `#9ee0bb` |
| Warning coral | `--coral` | `#ff9b83` |

The single dark treatment makes a phone feel like a lit drafting board. Ink
and amber exceed 4.5:1 against the sheet.

## Type and rhythm

The app uses self-hosted system fallbacks: `ui-monospace` for measurements and
`Arial, sans-serif` for instructions. This gives numbers rigid alignment while
keeping long help text familiar. Space uses an 8 px grid. Panels have square
corners, clipped blueprint tabs, and 1 px construction rules instead of soft
generic cards.

## Interaction and motion

Each chosen program action enters a numbered blueprint slot with one small
180 ms marking motion. Forecast, projected stock, and exact target remain
visible together so planning does not depend on memory or color. No motion
carries game state. With reduced motion, markers update instantly and all
transitions stop. The game offers persistent motion and sound switches; sound
is off by default.

## Illustration plan and provenance

The hero uses an original generated editorial illustration: a top-down
blueprint of a three-station hand forge and a beacon, rendered as cyan ink on
paper. It has no text, brands, logos, people, or watermarks. It is generated
with the factory image deployment from this prompt:

> Use case: stylized-concept. Asset type: browser-game landing illustration.
> Primary request: top-down technical blueprint drafting sheet showing a small
> three-station hand forge feeding a tall beacon tower, elegant cyan ink line
> drawing, subtle paper grain. Scene: midnight blue drafting paper. Lighting:
> an amber beacon glow only. Composition: portrait, readable central forge,
> generous quiet margins. Constraints: no text, no numerals, no watermark, no
> logo, no people, no copyrighted objects.

Generated image provenance is disclosed in the footer. The source PNG and its
prompt sidecar live in `public/assets`; its optimized WebP is used at runtime.

## Difficulty curve

The campaign has 30 deterministic planning shifts across five plans: 4, 5, 6,
7, then 8. A shift shows starting stock, an exact order, and a two-to-four-slot
forecast. Players program mine, shape, and charge actions, inspect the result,
and revise before committing. Early shifts use two slots; later shifts use
six. Three missed orders lose a plan without granting a tool, and retry keeps
earlier tools.

Each completed plan offers a real choice among Bellows (more ore), Pattern
(more parts), Lens (more charge), and Sundial (one extra mistake). Tool order
changes later numeric targets and risk tolerance. Four chosen tools lead into
the fifth final plan; only its eighth solved shift lights the beacon. Thirty
short reasoning problems, resets, and tool choices target a 30–45 minute first
campaign. The game never pads that time with cooldowns, real-time gates, or
idle production. A deterministic scripted solver keeps end-to-end QA practical.
