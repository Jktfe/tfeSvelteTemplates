# RippleGrid — Technical Logic Explainer

## What Does It Do? (Plain English)

RippleGrid is a grid of small clickable cells where clicking any one sends a wave outward — each cell pulses with a colour flash as the wavefront passes through it. Cells closer to the click point pulse first; cells further away pulse later, with timing proportional to grid distance from the origin. Multiple clicks in quick succession produce overlapping wavefronts that compose visually but never crowd memory because there's a hard cap on simultaneous ripples.

It is a tactile, ambient surface — useful for music visualisers, "feel something happened" feedback in dashboards, and as an interactive backdrop for hero sections. Distance metric is configurable: Manhattan gives a diamond-shaped wavefront, Chebyshev gives a square, Euclidean gives a circle. There's also a `hex` variant that offsets odd rows by half a cell so the lattice is hexagonal rather than square. Keyboard navigation is full-fidelity — arrow keys move focus between cells, Enter/Space fires a ripple.

## How It Works (Pseudo-Code)

```
state:
  ripples[]      // active ripples; each has { id, origin: {row, col}, startedAt }
  nextId         // monotonic
  prefersReduced // capability flag
  focusRow, focusCol  // for keyboard focus management

derived:
  lifetime = rippleLifetime(rows, cols, rippleSpeed, rippleDuration, distanceMode)

on mount:
  prefersReduced = isReducedMotion()
  subscribe to matchMedia change events

on cell click(row, col):
  focusRow, focusCol = row, col
  fireRipple(row, col)

fireRipple(row, col):
  id = nextId++
  ripples = clampConcurrent([...ripples, {id, origin:{row,col}, startedAt: now}], maxConcurrent)
  onRipple?.({row, col})
  schedule(setTimeout, lifetime + 16):
    ripples = ripples.filter(r => r.id !== id)

on cell keydown(event, row, col):
  if Enter or Space: fireRipple(row, col); preventDefault
  else if Arrow{Up|Down|Left|Right}: move focus to neighbour; preventDefault

render:
  div.ripple-grid role="grid" with CSS vars (cell, gap, cols, rows, colour, duration)
    for each row:
      div.row role="row" (offset class for hex variant on odd rows)
        for each col:
          button.cell role="gridcell"
            tabindex={isFocus ? 0 : -1}
            for each ripple:
              span.layer style="--rg-delay: {layerDelay(ripple, r, c)}ms;"

CSS:
  .layer {
    background: var(--rg-colour);
    opacity: 0; transform: scale(0.6);
    mix-blend-mode: screen;     /* multiple ripples compose nicely */
    animation: rg-pulse var(--rg-duration) ease-out forwards;
    animation-delay: var(--rg-delay);
  }
  @keyframes rg-pulse {
    0%   { opacity: 0;   transform: scale(0.6); }
    35%  { opacity: 0.9; transform: scale(1.08);}
    100% { opacity: 0;   transform: scale(1);   }
  }
```

## The Core Concept: Wavefront Math, Three Distance Metrics, And Per-Cell Animation Delay

The wave illusion is a single delayed-start animation per (cell × ripple) pair. The "wave" is not a continuous mathematical surface — it is `rows × cols × ripples.length` independent CSS animations, each starting at its own offset.

**Distance metrics** decide the shape of the wavefront:

```
gridDistance(a, b, mode):
  manhattan : |dr| + |dc|              → diamond
  chebyshev : max(|dr|, |dc|)          → square
  euclidean : hypot(dr, dc)            → circle (default)
```

```
   manhattan      chebyshev        euclidean
   . . X . .      X X X X X         . . X . .
   . X X X .      X X X X X         . X X X .
   X X ● X X      X X ● X X         X X ● X X
   . X X X .      X X X X X         . X X X .
   . . X . .      X X X X X         . . X . .
```

(● = origin, X = cells at the same "distance" under each metric.)

**Arrival delay** is a simple division: `delay = (distance / speed) * 1000` ms, where `speed` is in cells/sec. So with `speed = 12 cells/sec` and `mode = euclidean`, a cell 6 cells away from the click point starts pulsing at t = 500 ms. The wavefront *appears* to travel because cells closer to the origin start before cells further away — but each cell is running its own 700 ms `rg-pulse` animation, frozen until its delay expires.

**Concurrent ripples compose** via `mix-blend-mode: screen`. Two overlapping ripples brighten the cell rather than darkening it (which `multiply` would do). The maximum-not-sum compositing approach in the helper `composeRipples` is a fallback for environments without screen blending — it picks the largest current intensity per cell, which keeps the colour from blowing out:

```
composeRipples = max over all active ripples of cellIntensity(ripple, cell)
cellIntensity  = sin(π × t / duration)   for t in [0, duration]; else 0
```

The `sin(π × t / duration)` is the smooth in/out envelope used by the per-cell intensity helper (exported for tests and consumers building their own renderer); the actual CSS keyframes use a more practical 0/35%/100% three-stop curve with a small overshoot at 35% so the pulse has a visible peak.

**Concurrent cap** keeps the layer count bounded:

```
clampConcurrent(ripples, max) = ripples.length > max
                                ? ripples.slice(-max)
                                : ripples
```

Since each cell renders one `<span>` per active ripple, the total layer count is `rows × cols × maxConcurrent`. Default `20 × 12 × 3 = 720` layers — comfortable. Push `maxConcurrent` past 5 with a 40×24 grid and you're at 4800 layers; performance drops noticeably. Document the cap.

## CSS Animation Strategy

One keyframe with one animation-delay per cell drives the whole wave:

```css
.layer {
  position: absolute;
  inset: 0;
  background: var(--rg-colour);
  opacity: 0;
  transform: scale(0.6);
  mix-blend-mode: screen;
  animation: rg-pulse var(--rg-duration) ease-out forwards;
  animation-delay: var(--rg-delay);   /* per-cell-per-ripple delay */
  border-radius: 4px;
}

@keyframes rg-pulse {
  0%   { opacity: 0;   transform: scale(0.6); }
  35%  { opacity: 0.9; transform: scale(1.08); }
  100% { opacity: 0;   transform: scale(1);    }
}
```

The `35%` peak with a `1.08` overshoot is what makes individual cell pulses visible against neighbours. A symmetric 50% peak would feel limp; the asymmetric curve gives a quick attack and a longer, more satisfying decay.

Reduced motion swaps the keyframe for an opacity-only pulse:

```css
.ripple-grid.reduced .layer {
  animation: rg-pulse-reduced var(--rg-duration) linear forwards;
}
@keyframes rg-pulse-reduced {
  0% { opacity: 0; }  50% { opacity: 0.6; }  100% { opacity: 0; }
}
```

The colour flash still communicates the wave; the scale animation that would feel jarring for motion-sensitive users is removed.

## State Flow Diagram

```
              ┌──────────────────────┐
              │  IDLE                │
              │  ripples = []        │
              └──────────┬───────────┘
                         │ click cell or Enter/Space on focused cell
                         ▼
              ┌──────────────────────┐
              │  FIRING              │
              │  push new ripple     │
              │  clamp to maxConcur. │
              │  ┌──────────────────┐│
              │  │ N × M cells each ││ ← CSS animations begin,
              │  │ scheduled by     ││   keyed by per-cell delay
              │  │ delayForCell()   ││
              │  └──────────────────┘│
              └──────────┬───────────┘
                         │ lifetime + 16ms timer
                         ▼
              ┌──────────────────────┐
              │  GARBAGE COLLECT     │
              │  filter out ripple id│
              └──────────┬───────────┘
                         │ ripples non-empty? → FIRING ; else → IDLE

  Arrow keys → move focusRow/focusCol; cell receives focus
  prefers-reduced-motion: reduce: opacity-only pulse, no scale
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `number` | `20` | Columns. |
| `rows` | `number` | `12` | Rows. |
| `cellSize` | `number` | `24` | Cell edge length (px). |
| `gap` | `number` | `2` | Gap between cells (px). |
| `colour` | `string` | `'#6366f1'` | Accent colour for the pulse. Any CSS colour. |
| `rippleDuration` | `number` | `700` | Per-cell pulse duration (ms). |
| `rippleSpeed` | `number` | `12` | Wave speed in cells per second. Higher = faster wavefront. |
| `maxConcurrent` | `number` | `3` | Cap on simultaneous ripples. Caps total CSS layer count. |
| `distanceMode` | `'manhattan' \| 'chebyshev' \| 'euclidean'` | `'euclidean'` | Wavefront geometry. |
| `variant` | `'rect' \| 'hex'` | `'rect'` | Hex offsets odd rows by half a cell. |
| `ariaLabel` | `string` | descriptive default | Grid-level aria-label. |
| `onRipple` | `(e: { row, col }) => void` | — | Callback per fired ripple. |
| `class` | `string` | `''` | Extra wrapper classes. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `rippleSpeed ≤ 0` | `delayForCell` returns 0 — every cell pulses simultaneously. The "wave" collapses to a flash. |
| `maxConcurrent = 0` | `clampConcurrent` returns `[]` — clicks fire `onRipple` but no visual pulse. |
| `rippleDuration = 0` | Animation is no-op; cells flash through their default state instantly. |
| Hex variant with `cols = 1` | Hex offset still applies to odd rows but visually is meaningless with one column. Acceptable. |
| Keyboard at edge | Arrow keys clamp to `[0, rows-1]` / `[0, cols-1]`. Wrap-around is not implemented. |
| Rapid keypress / click flurry | Each fires a fresh ripple; `clampConcurrent` drops oldest beyond `maxConcurrent`. Bounded layer count. |
| `prefers-reduced-motion: reduce` flips at runtime | `matchMedia` change listener flips `prefersReduced` reactively; subsequent ripples use the reduced keyframe. In-flight ripples finish their original animation. |
| Component unmounts mid-ripple | `setTimeout` callbacks reference torn-down state; harmless. |
| Very large grid (e.g. 50×30) | Layer count `rows × cols × maxConcurrent` can exceed ~3000 — keep `maxConcurrent ≤ 2` for huge grids, or pre-cap it. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$props`, `onMount`. Snippets not used (cells are built-in `<button>`s for keyboard support).
- **`<script module>`** exports — `gridDistance`, `delayForCell`, `cellIntensity`, `composeRipples`, `clampConcurrent`, `rippleLifetime`, `isReducedMotion`. All pure, deterministic, testable without a DOM.
- **`performance.now()`** — for ripple `startedAt` so per-cell intensity calculations work in absolute time.
- **Zero external libraries** — no animation library, no audio library, no SVG. Pure CSS keyframes.

## File Structure

```
src/lib/components/RippleGrid.svelte          # implementation
src/lib/components/RippleGrid.md              # this explainer
src/lib/components/RippleGrid.test.ts         # unit tests for exported helpers
src/routes/ripplegrid/+page.svelte            # demo page
```
