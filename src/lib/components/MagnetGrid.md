# MagnetGrid — Technical Logic Explainer

## What Does It Do? (Plain English)

MagnetGrid lays out a regular grid of small cells and then deforms it in response to the cursor — every cell within an influence radius around the pointer slides toward (or away from) it, with the displacement falling off smoothly to zero at the edge of the radius. The result feels like a sheet of iron filings rippling under a moving magnet, or like a fluid surface dimpling under fingertip contact.

It is a decorative-only layout, intended for hero backgrounds, ambient cursor responsiveness, and visual punctuation between content sections. The default cell renders a small dot, but consumers can pass any snippet so the grid can be made of letters, icons, or even animated sub-components. Reduced-motion users see the static grid; touch devices that don't emit `pointermove` see the static grid too.

## How It Works (Pseudo-Code)

```
state:
  containerEl   // bound DOM div
  reduced       // capability flag
  pointerActive // true while cursor is over the grid

derived:
  safePolicy = pickPolicy(policy)              // 'attract' or 'repel'
  safeCols   = max(1, floor(cols))
  safeRows   = max(1, floor(rows))
  cells      = gridIndices(safeCols, safeRows)  // [{row, col}, ...]

on mount:
  reduced = isReducedMotion()

on pointermove(event):
  if !containerEl or reduced: return
  rect = containerEl.getBoundingClientRect()
  cx   = event.clientX - rect.left
  cy   = event.clientY - rect.top
  pointerActive = true
  stride = cellSize + gap
  for each cell el:
    r, c   = el.dataset.row, el.dataset.col
    centre = cellCenter(r, c, stride, stride)        // (col + .5) * stride, (row + .5) * stride
    d      = displacement(centre.x, centre.y, cx, cy, radius, strength, safePolicy)
    el.style.setProperty('--cell-dx', d.dx + 'px')
    el.style.setProperty('--cell-dy', d.dy + 'px')

on pointerleave:
  pointerActive = false
  for each cell el:
    el.style.setProperty('--cell-dx', '0px')
    el.style.setProperty('--cell-dy', '0px')

CSS:
  .magnet-grid__cell {
    transform: translate(var(--cell-dx, 0), var(--cell-dy, 0));
    transition: transform 240ms cubic-bezier(.22, 1, .36, 1);
  }
  .magnet-grid[data-active='true'] .magnet-grid__cell {
    transition: transform 60ms linear;       /* tight tracking while pointer is over */
  }
```

## The Core Concept: Smoothstep Falloff On A Cell-To-Cursor Vector

The displacement of each cell is a unit vector (cell → cursor) scaled by a smoothstep falloff and the strength prop. Three pure helpers compose:

**1. `cellCenter(row, col, cellW, cellH)`** — `(col + 0.5) * cellW` puts the centre inside the cell regardless of size. So a 100 px cell at column 0 returns x=50.

**2. `falloff(dist, radius)`** — a quadratic smoothstep:

```
t   = clamp(dist / radius, 0, 1)
inv = 1 - t
return inv * inv      // squared so the curve flattens at both ends
```

```
  falloff
   1.0 │●
       │ ●●
       │   ●
       │    ●●
       │      ●●●
   0.0 │         ●●●●●●●● dist (px)
       └─────────────────────
       0       radius/2     radius
```

`(1 - t)²` is the second-cheapest smoothstep available (true smoothstep is `t² × (3 - 2t)`, slightly more expensive and visually similar at this sample density). Both endpoints are differentiable — meaning cells right at the radius and cells right under the cursor blend in/out without snap.

**3. `displacement(cellX, cellY, cursorX, cursorY, radius, strength, policy)`** — combines the above:

```
dx0  = cursorX - cellX
dy0  = cursorY - cellY
dist = hypot(dx0, dy0)
f    = falloff(dist, radius)
if f === 0 or dist === 0: return (0, 0)
ux, uy = dx0 / dist, dy0 / dist               // unit vector
sign   = policy === 'repel' ? -1 : 1
return (sign * ux * f * strength, sign * uy * f * strength)
```

The unit vector decouples direction from magnitude — cells very close to the cursor still travel "toward it" by a small *direction* but a large *amount* (because `f` is near 1). Cells at the boundary travel hardly at all (`f` near 0) but in the correct direction.

```
   neutral grid                       under cursor (attract)
   · · · · · · · ·                    · · · · · · · ·
   · · · · · · · ·                    · ·   · ·   · ·
   · · · · · · · ·                       · · ╲ · · 
   · · · · · · · ·   ─────►            · · · ●● · · ·       ← cursor
   · · · · · · · ·                       · · ╱ · ·
   · · · · · · · ·                    · ·   · ·   · ·
   · · · · · · · ·                    · · · · · · · ·
```

`policy = 'repel'` flips the sign so cells are pushed *away* — useful for "magnetic field" backgrounds where you want the cursor to look like it's parting the grid.

## CSS Animation Strategy

Two transition durations swap based on a `data-active` flag on the wrapper.

```css
.magnet-grid__cell {
  transform: translate(var(--cell-dx, 0px), var(--cell-dy, 0px));
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);  /* slow, eases home */
  will-change: transform;
}

.magnet-grid[data-active='true'] .magnet-grid__cell {
  transition: transform 60ms linear;  /* fast, tracks the cursor */
}
```

Why two durations?

- **240 ms ease** when the pointer leaves: cells should *settle* back to rest, not snap. The smoothstep curve makes it feel weighty.
- **60 ms linear** while the pointer is over the grid: each pointermove writes a new `(dx, dy)` per cell, and we want the visible position to follow the cursor without lag. A long ease here would make the field rubbery and laggy.

The flag flip is a single attribute write per pointer enter/leave — `data-active='true' / 'false'` — so the cascade selector toggles cleanly.

`@media (prefers-reduced-motion: reduce) { .magnet-grid__cell { transform: none !important; transition: none !important; } }` is the catch-all override.

## State Flow Diagram

```
              ┌──────────────────────┐
              │  IDLE                │  ← cells at (0, 0)
              │  data-active=false   │
              │  transition: 240ms   │
              └──────────┬───────────┘
                         │ pointermove
                         ▼
              ┌──────────────────────┐
              │  ACTIVE              │
              │  data-active=true    │
              │  transition: 60ms    │
              │  every cell's dx/dy  │
              │  recomputed per move │
              └──────────┬───────────┘
                         │ pointerleave
                         ▼
              ┌──────────────────────┐
              │  RETURNING           │
              │  cells dx/dy = 0     │
              │  data-active=false   │
              │  240ms ease back     │
              └──────────────────────┘

   prefers-reduced-motion: reduce → all transforms locked to identity, no transitions.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `number` | `8` | Columns. Floored, clamped to `≥ 1`. |
| `rows` | `number` | `6` | Rows. Floored, clamped to `≥ 1`. |
| `radius` | `number` | `140` | Influence radius in pixels. |
| `strength` | `number` | `24` | Peak displacement in pixels (a cell exactly under the cursor moves by `strength`). |
| `policy` | `'attract' \| 'repel'` | `'attract'` | Direction of pull. Unknown → `'attract'` via `pickPolicy`. |
| `cellSize` | `number` | `36` | Cell edge length in pixels. The grid's outer size scales linearly. |
| `gap` | `number` | `0` | Pixels of gap between cells. Affects `stride` used for cell centres. |
| `class` | `string` | `''` | Extra wrapper classes. |
| `cell` | `Snippet<[number, number]>` | — | Per-cell snippet receiving `(row, col)`. Defaults to a small currentColor dot. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `cols × rows = 0` | `gridIndices` returns `[]`. Empty wrapper renders. |
| Non-finite cols/rows | Coerced to defaults via `Math.max(1, Math.floor(...))`. No NaN propagation. |
| Cursor exactly at cell centre (dist === 0) | `displacement` short-circuits to `(0, 0)` to avoid divide-by-zero. The cell stays put. |
| `radius ≤ 0` | `falloff` returns 0 for everything. The grid is inert; consumers should keep `radius > 0`. |
| `policy = 'repel'` | Sign flip on the final dx/dy. Cells flee the cursor instead of chasing it. |
| Touch device, no pointer events | Without `pointermove`, `pointerActive` never flips and dx/dy stay 0. The grid is static — same as reduced-motion. |
| `prefers-reduced-motion: reduce` | Pointer handler bails before touching cell styles; CSS `@media` locks transforms to identity. |
| Resize during interaction | `getBoundingClientRect` is read every pointermove, so the grid follows window resizes without lag. The strides used for cell centres are derived from props (`cellSize + gap`), not actual layout — keep those in sync if you customise the cell snippet. |
| Component unmounts mid-interaction | Svelte tears down the listeners with the wrapper. No global handlers were registered. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$props`, `Snippet`, `onMount`.
- **`<script module>`** exports — `gridIndices`, `cellCenter`, `falloff`, `displacement`, `pickPolicy`, `isReducedMotion`. All pure, testable without a DOM.
- **Zero external libraries** — no animation library, no physics library. The "physics" is one quadratic smoothstep.

## File Structure

```
src/lib/components/MagnetGrid.svelte          # implementation
src/lib/components/MagnetGrid.md              # this explainer
src/lib/components/MagnetGrid.test.ts         # unit tests for exported helpers
src/routes/magnetgrid/+page.svelte            # demo page
```
