---
title: Cardwall
description: Full-bleed perspective billboard wall — multiple rows of gradient tiles drift at row-specific speeds and directions inside a CSS perspective container, giving the illusion of a deep, slowly-tumbling photo wall. Click or keyboard-activate any tile to pin it; the rest of the wall keeps moving. Asset-free, SSR-deterministic, prefers-reduced-motion safe.
category: Statement Sections
author: antclaude
status: stable
---

# Cardwall

A statement-piece hero section that reads like a slowly-tumbling architectural photo wall — multiple rows of gradient billboard tiles drifting horizontally at row-specific speeds and alternating directions, all viewed through a CSS perspective so the upper rows tilt forward and the lower rows tilt back. There are no images: every tile is a CSS-gradient panel with a serif label, palette-picked deterministically from a Halton sequence so SSR and client agree without an RNG seed leak.

Inspired by the marquee wall on real-world editorial sites where a photo gallery scrolls past on a slight tilt, rebuilt as a portable Svelte 5 component with zero dependencies and zero image assets.

## Key Features

- **Pure CSS gradients** — no `<img>`, no SVG sprites, nothing to download. Every tile paints itself from a four-stop palette (`from`, `via`, `to`, `accent`).
- **Perspective billboard** — CSS `perspective` + per-row `rotateX/scale/translateY` gives the wall its tilt; the middle row sits flat on the camera plane and outer rows fall away.
- **Seamless infinite drift** — each row track renders the tile sequence twice; a `requestAnimationFrame` loop translates the track by `rowOffset(t)` which wraps inside `[0, period)` so the seam is invisible.
- **Row-specific speed + direction** — odd rows go right-to-left, even rows go left-to-right, and the speed cycles 12–29 px/s so neighbouring rows never lock-step.
- **Click / keyboard pin** — every tile is `role="button" tabindex="0"`; activate it (mouse or Enter/Space) to pin it. A `.cw-pin-readout` chip live-reports the pinned label for assistive tech.
- **Reduced-motion safe** — `@media (prefers-reduced-motion: reduce)` short-circuits the rAF loop and freezes every track at offset 0; the wall reads as a static composition.
- **SSR-deterministic** — palette + label selection comes from `halton(2, 3)` indexed by row × tile, so the first paint matches the hydrated DOM byte-for-byte.
- **Pure-helpers split** — all maths (offset wrap, perspective transform, palette pick, motion gate) is in `Cardwall/types.ts` so the test suite can assert it without rendering.

## Usage

```svelte
<script lang="ts">
  import Cardwall from '$lib/components/Cardwall/Cardwall.svelte';
</script>

<!-- Default 5-row wall, 8 tiles per row -->
<Cardwall />

<!-- Sparse 3-row variant — quieter, suits hero sections that want
     the wall as a backdrop rather than the main event -->
<Cardwall density="sparse" tilesPerRow={6} />

<!-- Dense 7-row "city of tiles" — best paired with a foreground
     headline overlay -->
<Cardwall density="dense" tilesPerRow={10} />

<!-- Larger tiles for a more cinematic billboard -->
<Cardwall tileWidth={300} tileGap={20} />
```

The component is a single full-bleed `<section class="cw-wall">` — it expects to live inside a parent that gives it a sensible width (typically `100vw`) and at least 480 px of height.

## Props

| Prop          | Type                              | Default     | Description                                                  |
|---------------|-----------------------------------|-------------|--------------------------------------------------------------|
| `density`     | `'sparse' \| 'default' \| 'dense'` | `'default'` | Number of rows (3 / 5 / 7).                                  |
| `tilesPerRow` | `number`                          | `8`         | Tiles per row before the seamless duplicate.                 |
| `tileWidth`   | `number` (px)                     | `220`       | Width of each tile. Tile height is `0.62 ×` width.           |
| `tileGap`     | `number` (px)                     | `16`        | Horizontal gap between adjacent tiles in a row.              |
| `class`       | `string`                          | `''`        | Extra CSS classes appended to the `.cw-wall` wrapper.        |

## Palette + label sets

The component ships with eight curated four-stop palettes (deep teal/sky, violet/pink, amber/rose, emerald/cyan, etc.) and sixteen short serif labels — `STORY`, `CRAFT`, `DRIFT`, `SIGNAL`, `NORTH`, `CIPHER`, `STILL`, `SPARK`, `ECHO`, `OFFLINE`, `CANVAS`, `PROOF`, `WARP`, `PRELUDE`, `STATUS`, `INDIGO`. Each tile draws one of each, indexed by a Halton sequence so the same `(rowIdx, tileIdx)` pair always produces the same look.

If you want to extend the sets, override the arrays in `Cardwall/types.ts` — they are exported intentionally for downstream curation.

## Accessibility

- Each tile is `role="button"` with a descriptive `aria-label` of the form `Pin <LABEL>` and `aria-pressed` to reflect the pinned state — fully keyboard-operable via Enter or Space.
- The pinned-tile readout uses `aria-live="polite"` so screen readers announce the change without interrupting current speech.
- The wall wrapper carries `aria-label="Decorative billboard wall"` to give assistive tech context for what otherwise is a long sequence of decorative buttons.
- The duplicate marquee copy is hidden with `aria-hidden="true"` so screen readers do not read the same labels twice.
- Honours `prefers-reduced-motion: reduce` — no rAF loop is started, and the tracks rest at `transform: translate3d(0, 0, 0)`.

## Performance Notes

- A single `requestAnimationFrame` loop runs for the whole wall, not one per row. Per-frame work is `O(rowCount)` style writes — comfortable up to dense 7-row configurations.
- `will-change: transform` is set on `.cw-row` and `.cw-track` so the compositor promotes them to their own layer; mutations are GPU-only.
- Tiles use `transform: scale()` on hover/focus rather than re-laying out — there is no paint-storm even with 50+ tiles on screen.
- The duplicate track copy doubles the DOM node count vs. a single-render row. For very dense walls (e.g. `density="dense"` × `tilesPerRow={20}` × 2 copies = 280 tiles) this is still cheap, but consider lowering `tilesPerRow` if your target hardware is constrained.

## Distinct From

- **`Marquee`** — also scrolls horizontally but is a single row of arbitrary children, no perspective tilt, no pin interaction.
- **`BentoGrid`** — a static editorial grid of fixed cells; never moves, content is a real grid of children.
- **`CardStack`** / **`CardStackMotionFlip`** — focused on a single tower of cards being flipped; no horizontal drift, no multi-row depth field.
- **`MembraneHero`** — a single warped fluid-mesh canvas as the hero backdrop; no tile grid, no multi-row marquee.

## Implementation Notes

- The seamless marquee math: each row's inner element renders the tile sequence twice. The `rowOffset(t, period, speed, dir)` helper wraps the time-driven offset into `[0, period)`. Translating by `-offset` makes copy 1 drift off-screen left while copy 2 fills in from the right; when `offset` wraps to 0, copy 1 has snapped back into the same on-screen position copy 2 just occupied — the snap is invisible.
- `perspectiveTransform(rowIdx, totalRows)` returns a single `translateY + rotateX + scale` transform string. The middle row gets the identity transform (no tilt, unit scale). Outer rows tilt by ±14° and scale to 0.92, with a subtle ±6 px Y nudge to compress the apparent depth.
- The wall lives inside a CSS `perspective: 1400px` container with `transform-style: preserve-3d` so the per-row tilts compose with the camera projection rather than acting as flat 2D rotations.
- Each row carries a soft horizontal mask (`mask-image: linear-gradient(transparent, #000 8%, #000 92%, transparent)`) so tiles fade in and out at the row edges instead of clipping hard.
