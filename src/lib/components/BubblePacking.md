# BubblePacking — Technical Logic Explainer

## What Does It Do? (Plain English)

A bowl of bubbles where each bubble's size encodes a value. Pass it `[{ id, label, value, group? }, …]` and the component runs a small physics simulation to settle the bubbles into a tidy, non-overlapping cluster inside a circular container. Hover any bubble for a tooltip, click for a callback, and watch them colour-code automatically by their `group` field.

It's the same family of visualisation as D3's `pack` layout, except this implementation is a **150-iteration force simulation** rather than a recursive geometric pack. The trade-off: the result isn't perfectly tightly packed (small gaps remain), but the algorithm is dependency-free, tolerates incremental data updates, and produces an organic-looking cluster that reads as "data" rather than "diagram".

Use cases: budget breakdowns, vocabulary frequency, market-share snapshots, "skills I have" portfolio plots, anything where relative magnitudes matter more than precise comparisons.

## How It Works (Pseudo-Code)

```
state:
  tooltip       = { visible: false, x: 0, y: 0, text: '' }
  hoveredBubble = null

derive packedBubbles (from data, width, height, padding, useForce):
  if data is empty: return []

  // 1. assign colours by group
  groups        = unique(data.map(d => d.group))
  groupColorMap = groups.map((g, i) => [g, colorScheme[i % colorScheme.length]])

  // 2. value → radius using sqrt scaling (area is proportional to value)
  maxValue        = max(data.map(d => d.value))
  containerRadius = min(width, height) / 2
  maxBubbleRadius = containerRadius * 0.35
  for each item:
    rawR  = max(10, sqrt(value / maxValue) × maxBubbleRadius)

  // 3. global scale-to-fit so total area ≤ 85% of container area
  totalArea     = sum(π × r²)
  availableArea = π × containerRadius² × 0.85
  scaleFactor   = sqrt(availableArea / totalArea)
  for each bubble:
    r = max(10, rawR × min(1, scaleFactor))

  // 4. seed positions near centre with small random jitter
  // 5. sort largest-first; place largest at exact centre

  // 6. force simulation
  iterations = useForce ? 150 : 50
  for iter from 0 to iterations - 1:
    alpha = 1 - iter / iterations
    for each bubble i:
      // attractive force toward centre
      fx, fy += unit_vector_to_centre × 0.5 × alpha

      // collision avoidance against every other bubble
      for each other j ≠ i:
        if dist(i, j) < r_i + r_j + padding:
          push apart along the i→j vector by (overlap × 0.5 × alpha)

      // soft container walls
      if bubble would cross boundary: push back inward

      bubble.x += fx; bubble.y += fy

  return bubbles

render:
  <svg>
    {#each packedBubbles}
      <g transform="translate(x, y)">
        <circle r fill role="button" with hover/click/keyboard handlers />
        {#if showLabels && r >= labelThreshold} <text>truncated label</text> {/if}
      </g>
  </svg>
  {#if tooltip.visible} absolute-positioned div {/if}
  {#if groups.length > 1} <legend> {/if}
```

The force simulation is **deterministic-ish**: the random initial jitter means two runs can produce slightly different final positions. If you need bit-stable layouts (e.g., for visual regression tests), seed `Math.random` upstream or set `useForce: false` to get a near-static placement.

## Core Concept: Why √value, And Why A Force Simulation

Two design choices define how this component reads.

### Square-root scaling: area, not diameter

Humans compare circle sizes by **area**, not radius. If you want a bubble with value 4 to look "four times" the bubble with value 1, you need:

```
area(4) = 4 × area(1)
π × r4² = 4 × π × r1²
r4 = 2 × r1                ← square root of the value ratio
```

So the radius formula is:

```
radius = √(value / maxValue) × maxBubbleRadius
```

The naive `radius = (value / maxValue) × maxBubbleRadius` gives 4-vs-1 a *sixteen-times* area ratio, dramatically over-emphasising the larger bubble. The square root keeps the visual ratio honest.

There's also a `max(10, ...)` floor — bubbles smaller than 10 px are unreadable, so we lift everything to that minimum even if their values would otherwise produce something tiny. This sacrifices strict proportionality at the bottom of the range in exchange for hover-targetable circles.

### Force-directed packing

D3's `d3-pack` is a recursive enclosure algorithm: it computes the smallest enclosing circle for groups of bubbles and nests the result. It's perfect for hierarchical data and produces tight packing. We don't use it for two reasons: (a) the implementation is ~600 lines of geometry; (b) the result looks *too* tidy for non-hierarchical data.

The force-directed approach treats each bubble as a particle with three forces:

```
F_centre    = 0.5 × alpha × unit_vector(bubble → centre)
F_collision = 0.5 × alpha × overlap × unit_vector(bubble → other)   // for each overlapping neighbour
F_walls     = 0.5 × distance_outside_bounds                          // when crossing the container edge
```

The `alpha = 1 - iter / iterations` annealing factor decays the forces over the simulation: early iterations make big moves to break gross overlaps; later iterations make small adjustments to settle into local stability. This is the same idea as simulated annealing — start hot, cool down.

The **collision pass is O(n²)** per iteration: every bubble checks every other. With `iterations = 150` and `n = 50` bubbles, that's 150 × 50 × 50 = 375 000 distance calculations. Each is a sqrt and a few additions — trivial. At `n = 200` it's 6 million; still fine on a modern machine but you can feel the layout pause. See **Performance** for guidance.

The 0.85 area-fit factor (`availableArea = π × R² × 0.85`) leaves ~15 % whitespace inside the container, which is the magic number where bubbles look "comfortably arranged" rather than "sardine-packed". Tighter packing produces visual stress; looser packing makes the container feel empty.

## Performance

Computational cost dominates rendering cost — DOM is cheap, simulation is not.

- **n ≤ 50 bubbles:** Layout completes in <16 ms (one frame). No perceptible lag even on `data` change.
- **n = 50–200:** Layout takes 50–300 ms. Set `useForce: false` (drops iterations to 50) if you can tolerate a less-settled look.
- **n > 200:** The O(n²) collision pass becomes the bottleneck. The component blocks the main thread during layout. If you need this scale, consider quad-tree spatial indexing (Barnes–Hut style) or move the simulation off-thread.

The render is a single `<svg>` with `n` `<g>` elements. SVG handles a few hundred elements comfortably; for >1 000 elements you'd want to switch to canvas, but you'd hit the simulation wall first.

There is **no animation between layouts** — the simulation runs synchronously when `data`, `width`, or `height` changes, and the new positions appear immediately. Bubbles that were on screen don't smoothly transition to their new spots; they teleport. This is intentional: animating an unstable physics result would flicker. If you want enter/exit animations on the bubbles themselves, wrap the `<g>` elements in a Svelte transition.

`prefers-reduced-motion` disables the hover stroke transition (the only CSS animation in the component). The simulation itself runs the same regardless — it's a layout calculation, not an animation.

## State Flow Diagram

```
              ┌───────────────────────┐
              │  empty (data === [])  │
              │  packedBubbles = []   │
              └──────────┬────────────┘
                         │ data prop set
                         ▼
              ┌───────────────────────┐
              │  layout running       │  $derived block runs
              │  150 iterations       │  (synchronous, blocking)
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  rendered             │
              │  bubbles in DOM       │
              └──────────┬────────────┘
                         │
       ┌─────────────────┼─────────────────┬───────────────────┐
       │ hover           │ click           │ touchstart        │ data prop changes
       ▼                 ▼                 ▼                   ▼
 ┌──────────┐   ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐
 │ tooltip  │   │ onBubbleClick  │  │ first tap:      │  │ re-layout    │
 │ visible  │   │ fired          │  │   show tooltip  │  │ runs again   │
 └────┬─────┘   └────────────────┘  │ second tap:     │  │ bubbles      │
      │ mouseleave                  │   click + hide  │  │ teleport     │
      ▼                             └─────────────────┘  └──────────────┘
 ┌──────────┐
 │ tooltip  │
 │ hidden   │
 └──────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `BubbleItem[]` | `[]` | Each item: `{ id, label, value, color?, group? }`. `value` drives radius; `group` drives default colour. |
| `width` | `number` | `600` | SVG width in pixels. |
| `height` | `number` | `600` | SVG height in pixels. |
| `padding` | `number` | `3` | Pixel gap between bubble edges in the collision pass. |
| `colorScheme` | `string[]` | `BUBBLE_COLOR_SCHEME` | Palette assigned to groups in encounter order. Used when `item.color` is not set. |
| `showLabels` | `boolean` | `true` | Render the bubble label inside large bubbles. |
| `labelThreshold` | `number` | `20` | Minimum radius (px) for a label to render. Smaller bubbles stay quiet. |
| `useForce` | `boolean` | `true` | `true` = 150 iterations (settled); `false` = 50 iterations (faster, less tidy). |
| `onBubbleClick` | `(bubble: BubbleItem) => void` | `undefined` | Fires on click and Enter/Space on a focused bubble. |
| `onBubbleHover` | `(bubble: BubbleItem \| null) => void` | `undefined` | Fires with the hovered bubble's data, or `null` on leave. |
| `tooltipFormatter` | `(bubble: BubbleItem) => string` | `undefined` | Custom tooltip text. Defaults to `"{label}: {value.toLocaleString()}"`. |
| `class` | `string` | `''` | Extra classes on the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `data === []` | Renders empty SVG and no legend. No errors. |
| Single bubble | Placed at the exact centre at `maxBubbleRadius` (with 10 px floor). |
| All values identical | Every bubble gets the same radius; force simulation produces a hexagonal-packing-like pattern. |
| `value <= 0` for one item | Square-root of zero is zero; the 10 px floor kicks in. The bubble is small but visible. |
| Duplicate `id`s | Svelte's `{#each (id)}` will warn and may misbehave on re-render. Always provide unique IDs. |
| Total bubble area exceeds container | Global `scaleFactor` shrinks every bubble proportionally so they fit at 85 % container area. Relative sizes are preserved. |
| `width` or `height` zero | `containerRadius` is 0, all radii floor to 10 px, simulation runs but looks broken. Provide non-zero dimensions. |
| `n > 200` bubbles | O(n²) collision pass makes layout perceptibly slow. Use `useForce: false` to drop to 50 iterations. |
| Window resize | Parent must pass new `width`/`height`; the `$derived` re-runs the simulation and bubbles teleport to new positions. |
| Mobile touch | First tap shows the tooltip and fires `onBubbleHover`; second tap on the same bubble fires `onBubbleClick` and clears the tooltip. Tapping the SVG background dismisses the tooltip. |
| `prefers-reduced-motion: reduce` | CSS hover transition disabled. Simulation still runs. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived` for the layout pipeline.
- **`svelte/reactivity`** — `SvelteSet`, `SvelteMap` for group enumeration and colour mapping.
- Zero external dependencies. The packing algorithm, colour assignment, label truncation, and tooltip positioning are all hand-rolled.

The decision to skip D3 here is deliberate: D3's `d3-hierarchy` adds ~50 KB and its API expects a hierarchical input. For flat lists with optional grouping, the force simulation in this component is simpler and ships smaller.

## File Structure

```
src/lib/components/BubblePacking.svelte    # implementation
src/lib/components/BubblePacking.test.ts   # unit tests
src/lib/components/BubblePacking.md        # this file
src/routes/bubblepacking/+page.svelte      # demo page
src/lib/types.ts                           # BubbleItem, BubblePackingProps
src/lib/constants.ts                       # BUBBLE_COLOR_SCHEME, sample fixtures
```
