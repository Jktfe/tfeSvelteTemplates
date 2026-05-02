# Sunburst — Technical Logic Explainer

## What Does It Do? (Plain English)

A pie chart that keeps splitting. Each ring is one level of a hierarchy; each segment's angular sweep is proportional to the sum of values in its subtree. Click a segment to zoom into it — that segment expands to fill the whole sweep, and its children become the new visible rings. Click the centre to zoom back out, one level at a time.

The visual idiom is borrowed from D3's "zoomable sunburst" example, rebuilt in Svelte 5 with no external dependency. It's the right shape for proportional drill-downs: file-system disk usage, taxonomy proportions, budget breakdowns, time-allocation surveys — anywhere a hierarchy has comparable values at every level and you want to traverse it without losing context.

The breadcrumb at the top tracks where you are; the centre circle becomes a "zoom out" button when you're below the root.

## How It Works (Pseudo-Code)

```
state:
  tooltip   = { visible, x, y, text }
  focusNode = null               // null = at root; otherwise the zoomed-in arc

derive arcTree (from data):
  // 1. Pre-compute every node's total value (post-order traversal, cached in WeakMap)
  precomputeValues(root):
    if leaf: return value ?? 1
    else:    return sum(precomputeValues(child) for child in children)

  // 2. Build arcs: each node gets x0/x1 (start/end angle) and y0/y1 (depth ring)
  function build(node, depth, x0, x1, parent, colorIndex):
    cursor = x0
    for each child, i:
      childAngle = (child.value / node.value) × (x1 - x0)
      build(child, depth + 1, cursor, cursor + childAngle, this, i)
      cursor += childAngle
    return arcNode

  return build(root, depth=0, x0=0, x1=2π, parent=null, colorIndex=0)

derive visibleNodes (from arcTree, focusNode):
  focus = focusNode ?? arcTree
  return allNodes.filter(node =>
    node.depth ∈ [focus.depth, focus.depth + 2]   // show focus + 2 rings
    AND node is descendant of focus
  )

derive transform (from focus):
  // Map focus.x0..focus.x1 to 0..2π (so focused arc fills the circle)
  // Map focus.y0..focus.y1 + 2 to ring 0..2 (so focus is innermost ring)
  scaleX(angle) = ((angle - focus.x0) / (focus.x1 - focus.x0)) × 2π
  scaleY(depth) = depth - focus.depth

render:
  breadcrumb path
  <svg>
    {#each visibleNodes as arc}
      <path d={arcPath(scaleX(arc.x0), scaleX(arc.x1), scaleY(arc.y0), scaleY(arc.y1))}
            fill={arc.color}
            with click/hover/keyboard handlers />
      {#if labelFits} <text rotated to arc midpoint> {/each}
    <circle r=centerRadius onclick={zoomOut} />     // when focus !== root
  </svg>

events:
  on arc click(node):
    if node has children: focusNode = node          // zoom in
    else: onNodeClick?.(node)
  on centre click: focusNode = focusNode.parent     // zoom out
  on Escape: zoom out one level
```

## Core Concept: Partition Layout + Affine Zoom

Two algorithms drive everything.

### Partition layout: angle = proportional value

The classic 1D partition: a parent owns the angular range `[x0, x1]`, and divides it among its children in proportion to each child's total subtree value. Recursively.

```
For each child i of parent:
  childAngle = (childValue / parentValue) × parentAngularRange
  child.x0   = cursor
  child.x1   = cursor + childAngle
  cursor    += childAngle
```

The root owns `[0, 2π]`. After the recursion, every leaf has an `(x0, x1)` arc that represents its share of its parent (and, transitively, its share of the root). Depth maps to ring index — a node at depth 2 is in the third ring out.

The clever bit is the **value precomputation**. Sunburst trees are recursive structures where a parent's value is the sum of its children's values. The naive `getValue(node)` function recursively sums children every time it's called — O(n²) over the whole tree. We precompute the total for every node in a single post-order traversal, cache it in a `WeakMap`, and look it up in O(1) thereafter. The WeakMap means cached values get garbage-collected when the input data is replaced.

### Affine zoom: rescale visible nodes

When you click an arc to zoom, the goal is: the clicked arc's angular range should expand to fill the whole circle, and its children should appear in the rings immediately outside it.

The trick is **not** to recompute the layout — the layout is data-shaped, and the data hasn't changed. Instead, every visible arc is rescaled with two affine maps:

```
visibleAngle  = (originalAngle  - focus.x0) / (focus.x1 - focus.x0) × 2π
visibleRadius = (originalDepth  - focus.depth)                       // 0 = focus ring, 1 = next, ...
```

The focused arc's `x0` becomes 0, its `x1` becomes 2π, and everything outside `[focus.x0, focus.x1]` falls outside `[0, 2π]` and is filtered out. The depth shift moves the focused ring to ring 0 and pushes its children to ring 1, etc.

Then we filter the rendered set to nodes within 2 rings of the focus — same as D3's example. Showing 2 rings means you always see the current level and one level deeper, which is enough to motivate further drill-down without overcrowding.

This `visibleNodes` set is a `$derived` — it recomputes when `focusNode` changes, and Svelte handles the DOM diff. The "animation" of arcs growing into place is just the difference between two renders; we lean on CSS transitions on the path's `d` attribute (where supported) and on the natural fade as old arcs leave and new arcs arrive.

### Arc path math

Each arc's SVG path is a wedge bounded by two radial lines and two circular arcs (inner and outer). The path string is:

```
M (innerR × cos(x0))  (innerR × sin(x0))
A innerR innerR 0 largeArc 0 (innerR × cos(x1))  (innerR × sin(x1))
L (outerR × cos(x1))  (outerR × sin(x1))
A outerR outerR 0 largeArc 1 (outerR × cos(x0))  (outerR × sin(x0))
Z
```

`largeArc` is 1 when the angular sweep exceeds π; the SVG `A` command needs that flag to draw the long way round. The `0`/`1` after `largeArc` is the sweep direction — the inner arc goes clockwise, the outer goes counter-clockwise, so the wedge closes correctly.

## Performance

Layout is O(n) with the WeakMap cache. Render is O(visible) — typically far smaller than `n` because of the 2-ring filter.

- **n ≤ 200 nodes:** Trivial. Render is instant; zoom feels native.
- **n = 200–1 000:** Layout still in <5 ms. Render filters to typically 30–80 visible arcs.
- **n > 1 000:** Layout fine, render fine, but text labels start to overlap and the eye loses orientation. Reduce `labelMinAngle` or set `showLabels: false`.

The 2-ring visibility filter is the main reason this scales: a 5 000-node tree never renders 5 000 arcs, only the ~50 within two rings of the current focus.

There are no animations beyond what CSS transitions on `path d` give you (limited browser support — Chrome/Edge animate, Firefox/Safari snap). The `animationDuration` prop is reserved for future use and currently has no effect; the visual cue for zoom is the change in visible set rather than a tween.

## State Flow Diagram

```
                ┌──────────────────────────┐
                │  empty / no data         │  data is required
                └─────────────┬────────────┘
                              │ data prop set
                              ▼
                ┌──────────────────────────┐
                │  arcTree built           │
                │  focusNode = null        │
                │  showing root + 2 rings  │
                └─────────────┬────────────┘
                              │
              ┌───────────────┼───────────────┐
              │ click arc     │ Escape        │ click centre
              │ (has kids)    │               │ (when zoomed)
              ▼               ▼               ▼
       ┌─────────────────┐                ┌──────────────────┐
       │  focusNode set  │  ◄─────────────│  focusNode =     │
       │  visibleNodes   │                │  focusNode.parent│
       │  recomputed     │                │  (or null at root)│
       │  arcs rescaled  │                └──────────────────┘
       └────────┬────────┘
                │
                │ click leaf arc (no children)
                ▼
       ┌─────────────────┐
       │ onNodeClick?.() │
       │ no zoom change  │
       └─────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `SunburstNode` | required | Root node `{ id, name, value?, color?, children? }`. |
| `width` | `number` | `500` | SVG width in pixels. |
| `height` | `number` | `500` | SVG height in pixels. |
| `colorScheme` | `string[]` | `SUNBURST_COLOR_SCHEME` | Palette assigned to children by index. Per-node `color` overrides. |
| `showLabels` | `boolean` | `true` | Render text labels on segments. |
| `labelMinAngle` | `number` | `10` | Minimum arc angle (degrees) for a label to render. |
| `animationDuration` | `number` | `750` | Transition duration in ms (reserved; currently informational). |
| `onNodeClick` | `(node: SunburstNode) => void` | `undefined` | Fires when a leaf arc is clicked (parents zoom instead). |
| `tooltipFormatter` | `(node: SunburstNode) => string` | `undefined` | Custom tooltip text. Defaults to `"{name}: {value}"`. |
| `class` | `string` | `''` | Extra classes on the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Single-node tree (root only) | Renders as a full circle. No drill-down possible. |
| Empty children array | Treated as a leaf — clicking calls `onNodeClick` rather than zooming. |
| All children have value 0 | Total value is 0; arc proportions become 0/0 = NaN. Defaults handle this by giving each leaf a value of 1 if missing. Mixed (some 0, some non-zero) works fine. |
| Tree depth > visible window | Only 2 rings beyond focus render. Drill in further to see deeper levels. |
| Click on the small wedge that's hard to hit | Use Tab to focus through arcs; Enter/Space activates. The focus indicator (stroke ring) makes the small wedge pickable by keyboard. |
| Zoomed in, then `data` prop changes | `focusNode` is held by reference into the *old* tree. After data swap, `currentFocus` falls back to the new `arcTree` root and the view resets. (The component does not try to re-resolve focus by id.) |
| `labelMinAngle` set very low (e.g., 1°) | Many tiny labels render and overlap. Default 10° is the sweet spot. |
| Duplicate node ids across the tree | Layout doesn't care — nodes are identified by reference. Tooltips and ARIA labels show whatever's in the `name` field. |
| `prefers-reduced-motion: reduce` | CSS hover transitions disabled. Zoom is already a state change rather than an animation, so reduced-motion users see clean transitions either way. |
| Right-click on an arc | Browser context menu (we don't preventDefault). Use `onNodeClick` for left-click only. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived.by` for the layout/focus pipeline.
- Zero external runtime dependencies. The partition algorithm, arc path generation, value precomputation, and zoom transform are all hand-rolled. D3 is intentionally avoided — `d3-hierarchy` and `d3-shape` together would add ~70 KB to give us features this component implements in ~10 KB.

## File Structure

```
src/lib/components/Sunburst.svelte    # implementation
src/lib/components/Sunburst.test.ts   # unit tests
src/lib/components/Sunburst.md        # this file
src/routes/sunburst/+page.svelte      # demo page
src/lib/types.ts                      # SunburstNode, SunburstArcNode, SunburstProps
src/lib/constants.ts                  # SUNBURST_COLOR_SCHEME, FALLBACK_SUNBURST_DATA
```
