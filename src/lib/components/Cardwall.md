# Cardwall — Technical Logic Explainer

## What Does It Do? (Plain English)

Cardwall is a full-bleed statement section that reads like a slowly-tumbling architectural photo wall. Multiple rows of gradient-billboard tiles drift horizontally at row-specific speeds and alternating directions, all viewed through a CSS perspective so the upper rows tilt forward and the lower rows tilt back. There are no images: every tile is a CSS-gradient panel with a serif label, and the whole composition picks itself deterministically from a Halton sequence so SSR and the hydrated client produce byte-identical output. Click any tile (or activate it with Enter / Space) to pin it; the rest of the wall keeps drifting.

Think of it like the marquee photo wall on an editorial homepage, rebuilt as a fully portable Svelte 5 component with zero image assets and zero RNG seeds.

## How It Works (Pseudo-Code)

```
state:
  rows           = buildRows(density, tilesPerRow)    // pure function — deterministic
  trackEls       = bound DOM ref per row
  pinned         = null | tile palette
  reducedMotion  = boolean
  rafId          = pending RAF handle
  startTime      = performance now at first tick

on mount:
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  if not reducedMotion:
    rafId = requestAnimationFrame(tick)

tick(now):
  t = (now − startTime) / 1000                        // seconds
  for each row in rows:
    offset = rowOffset(t, period, row.speed, row.dir)
    trackEls[r].style.transform = `translate3d(${-offset}px, 0, 0)`
  rafId = requestAnimationFrame(tick)

events:
  on tile click / Enter / Space:
    if pinned matches this tile: pinned = null      // toggle off
    else:                         pinned = tile     // pin this one

on destroy:
  cancelAnimationFrame(rafId)
```

The maths is split into a pure-helpers module (`Cardwall/types.ts`) with no DOM dependencies, so the whole drift / wrap / perspective pipeline is unit-testable without rendering anything.

## The Core Concept: Seamless Marquee with a Twin Track

The trick that makes the rows drift forever without seams is rendering each row's tile sequence **twice**, side by side, and translating both copies in lockstep. When the first copy slides off-screen left, the second copy is already filling in from the right at the same X position the first copy occupied moments before — there's nothing to see at the seam because the seam visually never appears.

```
row inner element renders the tile sequence twice:

  [TILE TILE TILE TILE TILE TILE TILE TILE][TILE TILE TILE TILE TILE TILE TILE TILE]
  ┃ ──────────── copy A ──────────────── ┃ ──────────── copy B ──────────────── ┃

  translate3d(-offset, 0, 0)
       offset wraps inside [0, period)
       period = (tileWidth + tileGap) × tilesPerRow

  when offset wraps from period → 0 (or vice versa for dir = -1):
    copy A snaps back into the same on-screen position copy B was just at
    the snap is invisible because the tile sequences are identical
```

The wrap is implemented in `rowOffset(t, period, speed, dir)`:

```
raw = (t * speed * dir) mod period
if raw === 0: return 0           // normalise -0
if raw <  0: return raw + period // always inside [0, period)
return raw
```

Two subtle moves:

1. **Always-positive return.** `(-foo) mod period` in JavaScript returns negatives, which means the consumer would have to sign-juggle when applying `translateX`. Wrapping into `[0, period)` lets the consumer always write `translate3d(${-offset}px, 0, 0)` — correct for both directions.
2. **`-0` normalisation.** JavaScript distinguishes `0` and `-0`; `0 * -1` is `-0`. The helper coerces to `+0` so consumers don't accidentally end up with subtly weird transform strings during testing.

## Perspective Tilt: Mapping Row Index to Camera

Each row gets a single CSS transform combining `translateY`, `rotateX`, and `scale`:

```
perspectiveTransform(rowIdx, totalRows):
  mid    = (totalRows − 1) / 2
  rel    = (rowIdx − mid) / mid                  // [-1, 1] across rows
  tilt   = -rel × 14                              // ±14° rotateX
  scale  = 1 − abs(rel) × 0.08                    // 0.92 .. 1.00
  ty     = rel × 6                                // ±6 px Y nudge
  return `translateY(${ty}px) rotateX(${tilt}deg) scale(${scale})`
```

```
row index    rel       tilt       scale     ty
─────────────────────────────────────────────────
   0       -1.00      +14.0°      0.92    -6 px      (top — tilts forward)
   1       -0.50       +7.0°      0.96    -3 px
   2 (mid)  0.00        0.0°      1.00     0 px      (camera plane)
   3       +0.50       -7.0°      0.96    +3 px
   4       +1.00      -14.0°      0.92    +6 px      (bottom — tilts back)
```

The wall lives inside a CSS `perspective: 1400px` container with `transform-style: preserve-3d`, so the per-row tilts compose with the camera projection rather than acting as flat 2D rotations. Without `preserve-3d`, you'd see the rows rotate in their own plane and the depth illusion would collapse.

## Deterministic Palette Selection: Halton Sequence

The palette and label of each tile come from a Halton(2, 3) low-discrepancy sequence indexed by `(rowIdx × 100) + tileIdx`. Halton sequences are quasi-random — they look uniformly distributed, but the same input always returns the same output. This solves the SSR-vs-client hydration problem: a server render and a client render of the same `(density, tilesPerRow)` will pick the same palette for every tile, so React-style hydration mismatches never happen.

```
halton(i, base):
  f = 1; r = 0; n = i
  while n > 0:
    f /= base
    r += f × (n mod base)
    n  = floor(n / base)
  return r                          // float in [0, 1)

pickTilePalette(seed):
  h2 = halton(seed + 1, 2)          // base 2 — picks palette
  h3 = halton(seed + 1, 3)          // base 3 — picks label
  palette = TILE_PALETTES[floor(h2 × len) % len]
  label   = TILE_LABELS  [floor(h3 × len) % len]
  return { ...palette, label }
```

Two Halton bases (2 and 3 — co-prime — is the canonical choice) ensure palette and label are statistically independent: a "STORY" tile won't always be teal, an amber tile won't always say "DRIFT". The result is visually rich variety from a tiny deterministic pipeline.

## State Flow Diagram

```
                    ┌──────────────────────┐
                    │  buildRows(density,  │
                    │    tilesPerRow)      │
                    │  → deterministic     │
                    │    palette + labels  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  on mount            │
                    │  reducedMotion?      │
                    └──┬───────────────────┘
                       │
       ┌───────────────┴────────────────┐
       │ false                          │ true
       ▼                                ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ DRIFTING         │         │ STATIC           │
  │ rAF loop writes  │         │ tracks at        │
  │ translate3d to   │         │ translate3d(0,0) │
  │ each row track   │         │ no rAF loop      │
  │ each frame       │         └──────────────────┘
  └────────┬─────────┘
           │
   click/Enter/Space on tile
           │
           ▼
  ┌──────────────────┐
  │ PINNED           │
  │ pinned = tile    │
  │ readout          │
  │ announces label  │
  │ (aria-live)      │
  │                  │
  │ tracks keep      │
  │ drifting         │
  └────────┬─────────┘
           │
   click same tile
           │
           ▼
  ┌──────────────────┐
  │ pinned = null    │
  └──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `density` | `'sparse' \| 'default' \| 'dense'` | `'default'` | Number of rows: 3 / 5 / 7. |
| `tilesPerRow` | `number` | `8` | Tiles per row before the seamless duplicate. |
| `tileWidth` | `number` | `220` | Tile width in px. Tile height is `0.62 ×` width (golden-ratio-ish). |
| `tileGap` | `number` | `16` | Horizontal gap between adjacent tiles in a row, in px. |
| `class` | `string` | `''` | Extra classes appended to the `.cw-wall` wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User has `prefers-reduced-motion: reduce` | The rAF loop never starts; tracks rest at `translate3d(0, 0, 0)`. The wall reads as a static composition. Pin interaction still works. |
| `tilesPerRow = 0` or negative | `period` becomes 0; `rowOffset` returns 0 unconditionally; the wall renders empty rows. The component does not throw. |
| Window resized while drifting | The rAF loop keeps writing the same transform values; the rows reflow naturally because the tiles are inline-flex. No reset needed. |
| Same tile palette appears twice in adjacent rows | Possible — Halton(2, 3) is quasi-random but not anti-aliased. The eye reads it as a coincidence rather than a bug. |
| User pins a tile in copy A, then copy A drifts off-screen | The same palette appears in copy B; the pin "follows" because the comparison is by palette content (`from + label`), not by DOM identity. |
| SSR with no `window` | `isReducedMotion()` returns `false` in non-DOM environments; `buildRows` is pure; the wall renders to HTML correctly during SSR and hydrates without mismatch. |
| Very dense configuration (`density="dense"`, `tilesPerRow=20`) | DOM contains 7 × 20 × 2 = 280 tile elements. Acceptable on most hardware; lower `tilesPerRow` if the target device is constrained. |
| `tileWidth` set to a tiny value (e.g. 40) | Period shrinks to ~448 px; the wrap interval becomes obvious because tile patterns repeat quickly. The component still works; the visual just looks less varied. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `bind:this` for the row track refs, and `onMount`/`onDestroy` for the rAF lifecycle.
- Zero external dependencies — pure CSS gradients (no images, no SVG sprites), pure CSS perspective for tilt, single rAF loop for drift.

## File Structure

```
src/lib/components/Cardwall/Cardwall.svelte         # wall + rAF lifecycle
src/lib/components/Cardwall/CardwallTile.svelte     # one tile (gradient + label + pin button)
src/lib/components/Cardwall/types.ts                # pure helpers (rowOffset, perspectiveTransform, halton, buildRows)
src/lib/components/Cardwall.md                      # this file
src/lib/components/Cardwall.test.ts                 # vitest unit tests (helpers + render)
src/routes/cardwall/+page.svelte                    # demo page
```
