# RadialCluster — Technical Logic Explainer

## What Does It Do? (Plain English)

A circular dendrogram. Pass it nested `{ name, children? }` data and it renders the root at the centre with branches fanning outward like spokes — every leaf node sits on the same outer ring, connected back through curved Bézier paths to its ancestors. The visual idiom is borrowed from D3's classic "radial cluster" example, but rebuilt natively in Svelte 5 with no D3 dependency.

Think of it as a family tree wrapped into a circle. It's the right shape when you have a bushy hierarchy (lots of leaves at similar depth) and you want to show *all* of them at once: project taxonomies, organisational charts, file-system overviews, biological clades, anything tree-shaped where rectangle layouts feel cramped.

The layout is deterministic — same data in, same picture out — so it's safe for visual regression tests and screenshot comparisons.

## How It Works (Pseudo-Code)

```
state:
  hoveredNode      = null
  mousePos         = { x: 0, y: 0 }
  maxVisibleDepth  = null          // null = show all rings

derive layout:
  // 1. Count leaves under every node so siblings get angular space proportional to bushiness
  leafCounts = postOrderTraversal(data, n =>
    n.children.length === 0 ? 1 : sum(children.leafCounts)
  )

  // 2. Recursively assign each node an angle and a radius
  function place(node, angleStart, angleEnd, depth):
    if isLeaf(node):
      angle  = (angleStart + angleEnd) / 2
      radius = effectiveOuterRadius      // every leaf on the same outer ring
    else:
      // Distribute the angular slice [angleStart, angleEnd] among children
      // proportionally to their leaf counts
      cursor = angleStart
      for each child:
        slice = (child.leafCount / node.leafCount) × (angleEnd - angleStart) × separation
        place(child, cursor, cursor + slice, depth + 1)
        cursor += slice
      angle  = mean(child.angle for child in children)
      radius = innerRadius + (depth / maxDepth) × (effectiveOuterRadius - innerRadius)

  // 3. Flatten and emit links (parent→child pairs) for rendering
  nodes = flatten(layoutTree)
  links = collectLinks(layoutTree)

render:
  <svg>
    {#each links} curved Bézier path from source(angle, r) to target(angle, r) {/each}
    {#each nodes}
      <circle at polar(angle, r) /> with hover/focus handlers
      {#if showLabels} <text rotated tangentially> {/each}
  </svg>
  {#if hoveredNode} tooltip near mousePos {/if}
```

The placement function is the whole algorithm. It walks the tree top-down, recursively dividing the parent's angular slice among its children based on each subtree's leaf count, then assigns each node a `(angle, radius)` polar position.

## Core Concept: Angle by Leaf Count, Radius by Depth

Two layout decisions define the look.

### Angular allocation: leaves get equal share

If you naively gave each subtree the same angle (say, parent has 3 children, each gets 120°), a subtree with 10 leaves would crowd the same arc as a subtree with 1 leaf. The layout would look uneven and labels would collide.

Instead, every subtree's angular slice is **proportional to how many leaves it contains**:

```
slice(child) = (child.leafCount / parent.leafCount) × parent.slice × separation
```

Leaves all end up on the same outer ring at angles that are uniformly distributed around the circle. Every leaf gets exactly `360° / totalLeaves` of arc, regardless of how deeply nested it is. This is the "cluster" property: leaves are equally spaced even though their parents are not.

The `separation` prop multiplies the slice (default 1, but you can pass e.g. 0.95 to compress the layout slightly, leaving small gaps between sibling subtrees that improve readability of dense trees).

### Radial allocation: depth maps linearly to radius

```
radius(node) = isLeaf
             ? effectiveOuterRadius
             : innerRadius + (depth / maxDepth) × (effectiveOuterRadius - innerRadius)
```

Internal nodes are placed at concentric rings spaced linearly between `innerRadius` and `effectiveOuterRadius`. Leaves are pinned to `effectiveOuterRadius` regardless of their actual depth — that's what makes this a cluster layout (leaves aligned) rather than a tree layout (leaves at their natural depth).

If you want the tree variant where leaves at depth 3 sit closer in than leaves at depth 5, swap the `isLeaf` branch for the same depth-based radius formula. This component deliberately enforces equal-leaf-radius for visual rhythm.

### Curved links

Connecting two polar points with a straight line crosses the centre awkwardly. We use a cubic Bézier where the control points are the source's radius rotated to the target's angle (and vice versa) — the link bows outward in a smooth arc that hugs the layer geometry. The path string is `M sx sy C cx1 cy1 cx2 cy2 tx ty` with control points computed from the polar coordinates.

This is the same trick D3's `d3.linkRadial` uses; it's worth understanding because it's also the right answer for radial Sankey, radial trees, and any other circle-aligned diagram with parent-child links.

### Pre-computed leaf counts

The naive approach to "how many leaves under this node" is to traverse the subtree on demand — but that's O(n²) over a deep tree. We precompute every node's leaf count in a single post-order pass and store it in a `SvelteMap<RadialClusterNode, number>`. Layout building then runs in O(n).

## Performance

The layout is O(n) once leaf counts are precomputed. Rendering is O(n) DOM elements (one `<circle>` and one `<text>` per node, one `<path>` per link).

Cost at typical scales:

- **n ≤ 100 nodes:** Trivial. Layout in <1 ms; render is dominated by SVG paint.
- **n = 100–500:** Comfortable. Layout in a few ms. Labels are still legible at the default 800 × 800 viewport.
- **n = 500–1 000:** The DOM holds up; readability is the bottleneck. Reduce `fontSize`, set `showLabels: false`, or grow the SVG.
- **n > 1 000:** Layout is still fast (~5 ms), but you'll have label overlap regardless of font size. Consider whether the radial form is the right choice — packed bar layouts handle dense leaves better.

There are no animations and no rAF loops. The `$derived` chain recomputes the layout when `data`, `width`, `height`, or any layout knob changes; otherwise everything is static. Hover triggers a state change but doesn't re-run the layout — only the `hoveredNode` reference updates.

## State Flow Diagram

```
              ┌────────────────────────┐
              │  empty / no data       │  data is required
              │  (component errors at  │
              │   runtime if missing)  │
              └───────────┬────────────┘
                          │ data prop set
                          ▼
              ┌────────────────────────┐
              │  layout computed       │
              │  - leaf counts         │
              │  - polar positions     │
              │  - links collected     │
              └───────────┬────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  rendered              │
              │  hoveredNode = null    │
              └───────────┬────────────┘
                          │
              ┌───────────┼─────────────────┐
              │ hover     │ tab+focus       │ data prop changes
              ▼           ▼                 ▼
       ┌──────────┐ ┌──────────────┐  ┌────────────────┐
       │ hovered- │ │ focus ring   │  │ layout         │
       │ Node set │ │ on circle    │  │ recomputes     │
       │ tooltip  │ │              │  │ everything     │
       │ visible  │ │              │  │ re-renders     │
       └────┬─────┘ └──────────────┘  └────────────────┘
            │ mouseleave
            ▼
       ┌──────────┐
       │ hovered- │
       │ Node ←   │
       │  null    │
       └──────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadialClusterNode` | required | Root of the tree. Recursive `{ name, children?, value? }`. |
| `width` | `number` | `800` | SVG width in pixels. |
| `height` | `number` | `800` | SVG height in pixels. |
| `innerRadius` | `number` | `100` | Radius of the innermost ring (root's distance from centre 0). |
| `outerRadius` | `number` | `min(w, h)/2 - 120` | Radius where leaves sit. Auto-computed to leave label room. |
| `nodeRadius` | `number` | `2.5` | Pixel radius of each node circle. |
| `nodeColorParent` | `string` | `'#555'` | Fill colour for non-leaf nodes. |
| `nodeColorLeaf` | `string` | `'#999'` | Fill colour for leaf nodes. |
| `linkColor` | `string` | `'#555'` | Stroke colour of curved links. |
| `linkOpacity` | `number` | `0.4` | Link stroke opacity (0–1). |
| `linkWidth` | `number` | `1.5` | Link stroke width in pixels. |
| `fontSize` | `number` | `11` | Label font size in pixels. |
| `fontFamily` | `string` | `'system-ui, sans-serif'` | Label font family. |
| `labelColor` | `string` | `'#333'` | Label fill colour. |
| `showLabels` | `boolean` | `true` | Render text labels next to nodes. |
| `rotateLabels` | `boolean` | `true` | Rotate labels tangentially so they read along the radial direction. |
| `separation` | `number` | `1` | Multiplier on each child's angular slice. <1 leaves visible gaps between sibling subtrees. |
| `class` | `string` | `''` | Extra classes on the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `data` missing entirely | Component errors at runtime (`data` is required). Always provide at least a root with no children. |
| Single root, no children | Renders one circle at the centre. No links. Single label. |
| Root with one child | Child placed at angle 0 on the outer ring. Link is a straight-ish curve; not visually interesting but valid. |
| Tree of depth 1 (star) | All children are leaves; they fan around the outer ring at equal angular spacing. |
| Very deep, narrow tree (chain) | Internal nodes step radius outward at `1/maxDepth` increments; the only leaf sits at `outerRadius`. The chain looks like a spiral spoke. |
| Subtree with thousands of leaves | Allocated angular slice is proportional. Labels overlap badly; reduce `fontSize` or set `showLabels: false`. |
| Duplicate node `name`s | No problem for layout (nodes are identified by reference, not name). Tooltip text may be ambiguous. |
| `width` or `height` very small | `effectiveOuterRadius` defaults to `min(w,h)/2 - 120`, which can go negative. Pass a sensible viewport, or set `outerRadius` explicitly. |
| `separation: 0` | All siblings collapse to the same angle. Layout is degenerate; pass at least 0.5. |
| `prefers-reduced-motion: reduce` | Hover stroke transition disabled. Layout doesn't animate, so nothing else changes. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived` for the reactive layout chain.
- **`svelte/reactivity`** — `SvelteMap` to memoise leaf counts in a way the runtime can track.
- Zero external runtime dependencies. The polar-coordinate maths, leaf-count traversal, and Bézier path construction are hand-rolled (~200 lines of layout logic). D3 is intentionally not used — its `d3-hierarchy` would add ~50 KB to give us a feature this component implements in 5 KB.

## File Structure

```
src/lib/components/RadialCluster.svelte    # implementation
src/lib/components/RadialCluster.test.ts   # unit tests
src/lib/components/RadialCluster.md        # this file
src/routes/radialcluster/+page.svelte      # demo page
src/lib/types.ts                           # RadialClusterNode, RadialClusterLayoutNode, RadialClusterProps
src/lib/constants.ts                       # FALLBACK_RADIAL_CLUSTER_DATA sample tree
```
