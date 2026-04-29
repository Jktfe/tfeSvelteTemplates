---
name: MagnetGrid
slug: magnetgrid
category: Helpful UX
status: shipped
since: 2026-04-29
---

# MagnetGrid

A cursor-driven displacement field. A grid of arbitrary cells (dots,
icons, glyphs, anything) where every cell shifts toward (or away
from) the pointer with a smooth quadratic falloff. Move the cursor
across a hero panel and the grid bows under it like a sheet of iron
filings under a magnet; lift the cursor and the field returns to
rest.

Useful for hero accents, "kinetic" backdrops behind a headline,
empty-state panels that reward exploration, or anywhere you want
quiet ambient motion that responds to the user without demanding
their attention.

## Key Features

- **N×M grid of arbitrary content** — pass a `cell` snippet and you
  control what each square renders. Default is a styled dot.
- **Cursor-driven displacement** — pointer position drives a per-
  cell offset via CSS custom properties, so the GPU composites
  every transform.
- **Smoothstep falloff** — `(1 - clamp(d/r))²` curve so cells near
  the cursor warp strongly while distant cells stay perfectly
  still.
- **Attract or repel** — `policy="attract"` (default) pulls cells
  toward the cursor; `policy="repel"` pushes them away.
- **Settle-on-leave** — pointer leaves the grid and every cell
  returns to rest with a CSS transition, no JS lerp loop required.
- **prefers-reduced-motion** — flat grid, zero displacement,
  enforced at the stylesheet level.

## Usage

### Default dot field

```svelte
<script>
  import MagnetGrid from '$lib/components/MagnetGrid.svelte';
</script>

<MagnetGrid />
```

### Custom cell content (icon grid)

```svelte
<script>
  import MagnetGrid from '$lib/components/MagnetGrid.svelte';

  const icons = ['★', '◆', '◯', '▲', '✦'];
</script>

<MagnetGrid cols={10} rows={6} cellSize={48} radius={180} strength={28}>
  {#snippet cell(row, col)}
    <span class="icon">{icons[(row + col) % icons.length]}</span>
  {/snippet}
</MagnetGrid>
```

### Repel mode (cursor pushes cells away)

```svelte
<MagnetGrid
  cols={12}
  rows={8}
  policy="repel"
  radius={200}
  strength={32}
/>
```

## Props

| Prop        | Type                              | Default     | Description                                              |
| ----------- | --------------------------------- | ----------- | -------------------------------------------------------- |
| `cols`      | `number`                          | `8`         | Number of columns (clamped to ≥1, floored)               |
| `rows`      | `number`                          | `6`         | Number of rows (clamped to ≥1, floored)                  |
| `radius`    | `number`                          | `140`       | Influence radius in px — cells inside warp, outside rest |
| `strength`  | `number`                          | `24`        | Maximum displacement at distance 0 (px)                  |
| `policy`    | `'attract' \| 'repel'`            | `'attract'` | Cells pull toward cursor or push away                    |
| `cellSize`  | `number`                          | `36`        | Width and height of each cell in px                      |
| `gap`       | `number`                          | `0`         | Gap between cells in px                                  |
| `class`     | `string`                          | `''`        | Extra classes on the host                                |
| `cell`      | `Snippet<[number, number]>`       | —           | Optional render snippet — receives (row, col)            |

## Pure helpers (module-script exports)

| Function                                                 | Returns          | Purpose                                                |
| -------------------------------------------------------- | ---------------- | ------------------------------------------------------ |
| `gridIndices(cols, rows)`                                | `CellIndex[]`    | Row-major flat list of `{row, col}` pairs              |
| `cellCenter(row, col, cellW, cellH)`                     | `Vec2`           | Pixel-coordinate centre of a cell                      |
| `falloff(dist, radius)`                                  | `number`         | Smoothstep `(1 - clamp(d/r))²` curve, 0–1              |
| `displacement(cellX, cellY, curX, curY, r, str, pol?)`   | `Displacement`   | Vector offset for a cell relative to cursor            |
| `pickPolicy(name)`                                       | `Policy`         | Validates / defaults a policy string                   |
| `isReducedMotion()`                                      | `boolean`        | SSR-safe matchMedia probe                              |

## How it works

The host renders a CSS grid: `grid-template-columns: repeat(cols,
cellSize)`, `grid-auto-rows: cellSize`. Each cell carries two CSS
custom properties — `--cell-dx` and `--cell-dy` — and applies them
through `transform: translate(var(--cell-dx), var(--cell-dy))`.

A single `pointermove` handler walks every cell on the host,
computes the cell's centre relative to the host's bounding rect,
runs `displacement()` against the cursor coords, and writes the
resulting `dx`/`dy` to the cell's inline style. No rAF — pointer
events fire fast enough on their own (60-120 Hz), and writing to a
custom property only invalidates the GPU's transform layer, not
layout.

`pointerleave` resets every cell's CSS variables to `0px`. The
cell's CSS transition (`transform 240ms cubic-bezier(...)`) handles
the settle animation — that's the `[data-active="true"]` rule
swapping to a faster 60ms timing while the pointer is over the grid,
so motion feels responsive while active and softly easing on exit.

The `gridIndices`, `cellCenter`, `falloff`, and `displacement`
helpers live in module scope so the test suite can verify the
distribution and vector maths without rendering.

## Accessibility

- The host is `role="presentation"` — MagnetGrid is purely a visual
  effect, not interactive content. Wrap it inside meaningful
  semantics if you put real UI in the cells.
- prefers-reduced-motion: reduce → cells render in their grid
  positions with `transform: none !important` and no transition,
  ignoring pointer movement entirely.
- No keyboard interaction in M1. If consumers put focusable content
  inside cells, normal Tab order applies and the displacement
  effect runs only on pointer input.

## Performance

- **One pointer event** per move (60-120 Hz), one DOM walk over the
  cell list, one custom-property write per cell. At 8×6 = 48 cells
  this is invisible; tested smooth up to ~250 cells.
- **No rAF loop** — pointer events drive the writes directly. Cells
  outside `radius` get `{0, 0}` displacement so they don't
  re-composite.
- **Settle animation** runs on the GPU via CSS transition, no JS.
- **Reduced motion** disables transforms and transitions at the
  stylesheet level — zero animation cost.

## When to reach for it

- Hero accents and atmosphere — quiet motion that follows the user
  without commanding attention.
- Empty-state panels that reward exploration ("hover me").
- Background fields behind headlines, with the headline z-indexed
  on top.
- "Iron filings under a magnet" demos for portfolio sites.

## When not to

- For pointer-on-a-single-element warps (avatars, buttons), reach
  for **VariableProximity** (per-letter font variation) or
  **Tilt3D** (single-element parallax) — MagnetGrid is overkill for
  one target.
- For continuously animating fields without a cursor, reach for
  **RippleGrid** or **ScrollReveal**.
- For real cursor-driven UI controls (snap targets, magnetic
  buttons), reach for **MagneticButton** — MagnetGrid is decoration,
  not affordance.

## Inspiration

A nod to the iron-filings-under-a-magnet demos that floated around
ReactBits and Awwwards portfolios circa 2024. Pure CSS transforms
with no canvas, no SVG, and no per-frame JS — the GPU does the
heavy lifting and the helpers stay pure for testing.
