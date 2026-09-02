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

The current production tick travels through three connected stations; each
successful action adds one small 180 ms pulse. No motion carries game state.
With reduced motion, markers update instantly and all transitions stop. The
game offers persistent motion and sound switches; sound is off by default.

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

Runs have 24 production ticks. The first is deliberately roomy. Each reset
adds exactly one selected tool: Bellows (ore), Pattern (parts), Lens (charge),
or Sundial (two-tick deadline extension). Four earned tools finish the campaign
in five short runs. The pressure is the visible tick budget, never a real-time
timer.
