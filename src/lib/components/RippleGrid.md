---
title: RippleGrid
description: A grid of cells where clicking one sends a wave outward — each cell pulses on the wave's leading edge with arrival delay proportional to grid distance from the click.
category: Native UI
author: Claude
---

# RippleGrid

An interactive grid where clicks become waves. Tap any cell and a pulse propagates outward through its neighbours, each cell lighting up on the wavefront's leading edge with a sin-shaped intensity curve. Multiple ripples compose cleanly via `mix-blend-mode: screen` — rapid clicks layer rather than thrash. The animation is **pure CSS** (one keyframe per layer) and the steady-state cost is zero.

Unlike effects that animate continuously (Marquee, Cardwall, AuroraBackdrop) or trigger from cursor proximity (VariableProximity, MagicCard), `RippleGrid` is **event-driven** — it does nothing until you interact, then runs a bounded one-shot animation per ripple. This makes it suitable for ambient interactive surfaces, hero sections, and "click anywhere" delight moments.

## Key Features

- **Three distance modes**: `manhattan` (diamond wavefront), `chebyshev` (square wavefront), `euclidean` (circular wavefront, default).
- **Two grid variants**: `rect` (regular grid) and `hex` (offset odd rows by half a cell width).
- **Multi-ripple composition**: per-cell layer stack with `mix-blend-mode: screen`. Concurrent ripples brighten where they overlap.
- **maxConcurrent cap**: bounded layer count keeps rapid-fire clicking from snowballing the DOM.
- **Pure CSS animation**: each ripple plays a one-shot `@keyframes` with `animation-delay` set per cell. No rAF, no per-frame JS in the steady state.
- **Roving tabindex**: only one cell is in the tab order at a time. Arrow keys move focus through the grid; Enter/Space fires a ripple from the focused cell.
- **prefers-reduced-motion safe**: a separate `rg-pulse-reduced` keyframe runs without scaling — just a brief opacity blip.
- **SSR-safe helpers**: `isReducedMotion()` returns `false` on the server, the component mounts safely without DOM access during render.
- **Zero external dependencies**.

## Usage

### Default — 20×12 indigo grid

```svelte
<script lang="ts">
  import RippleGrid from '$lib/components/RippleGrid.svelte';
</script>

<RippleGrid />
```

### Hex variant with manhattan wavefront

```svelte
<RippleGrid
  rows={10}
  cols={14}
  variant="hex"
  distanceMode="manhattan"
  colour="#10b981"
/>
```

### Dense grid with a fast wave

```svelte
<RippleGrid
  rows={24}
  cols={40}
  cellSize={14}
  rippleSpeed={24}
  rippleDuration={400}
  maxConcurrent={5}
/>
```

### Big-cell grid with click-to-log

```svelte
<RippleGrid
  rows={6}
  cols={8}
  cellSize={64}
  gap={4}
  onRipple={({ row, col }) => console.log(`fired at ${row},${col}`)}
/>
```

## Props

| Prop             | Type                                                | Default                                            | Description                                                                                                |
| ---------------- | --------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `cols`           | `number`                                            | `20`                                               | Number of columns. Must be ≥ 0.                                                                            |
| `rows`           | `number`                                            | `12`                                               | Number of rows. Must be ≥ 0.                                                                               |
| `cellSize`       | `number`                                            | `24`                                               | Cell edge length in pixels.                                                                                |
| `gap`            | `number`                                            | `2`                                                | Gap between cells in pixels.                                                                               |
| `colour`         | `string`                                            | `'#6366f1'`                                        | Pulse accent colour. Any CSS colour value.                                                                 |
| `rippleDuration` | `number`                                            | `700`                                              | Per-cell pulse duration in ms.                                                                             |
| `rippleSpeed`    | `number`                                            | `12`                                               | Wavefront speed in cells/sec. Higher = faster propagation.                                                 |
| `maxConcurrent`  | `number`                                            | `3`                                                | Hard cap on simultaneous ripples. Older ripples are dropped when exceeded.                                 |
| `distanceMode`   | `'manhattan' \| 'chebyshev' \| 'euclidean'`         | `'euclidean'`                                      | Distance metric used to compute per-cell delays. Determines wavefront shape.                               |
| `variant`        | `'rect' \| 'hex'`                                   | `'rect'`                                           | Grid layout. Hex offsets odd rows by half a cell.                                                          |
| `ariaLabel`      | `string`                                            | `'Ripple grid — click any cell to send a wave'`    | Accessible name for the grid wrapper.                                                                      |
| `onRipple`       | `(event: { row: number; col: number }) => void`     | `undefined`                                        | Callback fired when any cell is clicked or activated by keyboard.                                          |
| `class`          | `string`                                            | `''`                                               | Extra class names appended to the wrapper. Useful for layout/sizing at the call-site.                      |

## Types

```typescript
export type DistanceMode = 'manhattan' | 'chebyshev' | 'euclidean';
export type GridVariant = 'rect' | 'hex';

export interface Point {
  row: number;
  col: number;
}

export interface Ripple {
  id: number;
  origin: Point;
  startedAt: number;
}
```

## Pure helpers (exported from the module-script)

All helpers are pure functions that can be unit-tested without a DOM. Import them alongside the component:

```typescript
import RippleGrid, {
  gridDistance,
  delayForCell,
  cellIntensity,
  composeRipples,
  clampConcurrent,
  rippleLifetime,
  isReducedMotion,
  type DistanceMode,
  type Ripple
} from '$lib/components/RippleGrid.svelte';
```

| Helper                                                                         | Returns                | Notes                                                                            |
| ------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------- |
| `gridDistance(a, b, mode)`                                                     | `number`               | `manhattan`, `chebyshev`, or `euclidean`. Symmetric. Default mode `euclidean`.   |
| `delayForCell(origin, cell, speed, mode?)`                                     | `number` (ms)          | Defensive: `speed ≤ 0` returns `0` (instant fire).                               |
| `cellIntensity(ripple, cell, now, duration, speed, mode?)`                     | `number` in `[0, 1]`   | Sin-shaped pulse. Returns `0` outside the cell's active window.                  |
| `composeRipples(ripples, cell, now, duration, speed, mode?)`                   | `number` in `[0, 1]`   | Max across active ripples — overlap brightens but never blows out.               |
| `clampConcurrent(ripples, max)`                                                | `Ripple[]`             | Drops oldest when over the cap. Returns a fresh copy.                            |
| `rippleLifetime(rows, cols, speed, duration, mode?)`                           | `number` (ms)          | Total time for a ripple to traverse the grid + the per-cell duration.            |
| `isReducedMotion()`                                                            | `boolean`              | SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.        |

## How it works

1. **Mount**: render `rows × cols` cells inside `role="grid"`, each cell a focusable `<button role="gridcell">` with a roving tabindex (only one cell tab-focusable at a time).
2. **Click**: append a new `Ripple { id, origin, startedAt }` to a `$state` array, then `clampConcurrent` to the configured cap. Schedule a `setTimeout` to remove the ripple after `rippleLifetime` ms.
3. **Per-cell layers**: each cell renders one `<span class="layer">` per active ripple, with `style="--rg-delay: <delayForCell>ms;"`. CSS animation `rg-pulse` plays once per layer with that delay.
4. **Composition**: layers stack via `mix-blend-mode: screen`. Where multiple ripples overlap, the cell brightens additively (capped by alpha).
5. **Keyboard**: arrow keys move focus through cells (handled in `handleKeyDown`). Enter/Space fires a ripple from the focused cell. Roving tabindex ensures only one cell at a time is in the tab order.
6. **Reduced motion**: the wrapper carries a `.reduced` class that swaps the keyframe to `rg-pulse-reduced` (opacity-only, no transform). The wave still propagates but cells don't scale.

## Accessibility

- **Screen readers**: the wrapper has `role="grid"` with a configurable `aria-label`. Each cell has `role="gridcell"` and an explicit `aria-label="Cell row N column M"`.
- **Keyboard**: focus enters the grid on the active cell. Arrow keys navigate (clamped at edges), Enter/Space fires a ripple. Focus is preserved across renders via the roving tabindex pattern.
- **Reduced motion**: when `prefers-reduced-motion: reduce` is set, the wave still works but cells pulse with opacity only — no scale transform. The propagation timing is preserved so the spatial structure of the interaction reads.
- **Focus visibility**: focused cells get a 2px outline in the configured `colour`, with `outline-offset: 2px` so it sits clear of the cell border.

## Performance

- **Steady state**: zero. No rAF, no event listeners running unless the user is interacting.
- **Per-ripple cost**: each cell renders one extra `<span>` per active ripple. With the default 20×12 grid and `maxConcurrent: 3`, that's at most 720 layer spans — well within frame budget.
- **Cleanup**: ripples auto-remove after `rippleLifetime + 16ms` via `setTimeout`. No memory leaks across rapid-click sessions.
- **Recommended bounds**: keep `rows × cols × maxConcurrent ≤ 4000` for buttery-smooth animation. For dense grids (40×24), reduce `maxConcurrent` to 2.

## When to reach for it

- **Hero interactions** that reward exploration without explaining a button.
- **Idle-time delight** in dashboards or empty states — clickable surfaces that come alive.
- **Status/health grids** where individual cells represent something but the field as a whole should feel cohesive.
- **Decorative interactive backdrops** behind copy or imagery.

## When *not* to reach for it

- **Form fields** or **data grids** — the button-per-cell pattern interferes with selection ergonomics.
- **Touch-only contexts where every tap is meaningful** — the wave is a delight effect, not a confirmation. Pair with explicit feedback for actionable cells.
- **Very large grids** (>2000 cells) — the layer-per-ripple cost compounds. Consider chunking into multiple smaller grids if you need a wall of pulses.

## Inspiration

The interaction borrows from classic Apple Pages / Keynote ripple effects and reactbits.dev's grid-based delight primitives, rebuilt as a portable Svelte 5 component with no React, no Framer Motion, no canvas, and no animation library — just CSS keyframes, custom properties, and ~12KB of inspectable Svelte.
