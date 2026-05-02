# BentoGrid — Technical Logic Explainer

## What Does It Do? (Plain English)

BentoGrid arranges a set of tiles into the kind of asymmetric, mixed-size grid you see on landing pages and dashboards — one big tile next to a column of small ones, a wide banner under three squares, and so on. Each tile declares how many columns and rows it wants to span; CSS Grid does the rest. On a phone the whole thing collapses to a single column so nothing gets squashed.

Think of a Japanese bento box: a few large compartments for the main features, smaller compartments for the sides, all packed neatly into one tray.

## How It Works (Pseudo-Code)

```
state:
  items     = list of tiles, each with optional colSpan / rowSpan / href / image
  cols      = max columns at desktop width
  gap       = spacing between tiles

derive container style:
  --bento-cols = cols
  --bento-gap  = gap (px if number, raw string otherwise)

derive tile style for each item:
  --col-span = item.colSpan ?? 1
  --row-span = item.rowSpan ?? 1

events:
  on keydown(item) Enter or Space (only if item.href is set):
    preventDefault
    window.location.href = item.href

render:
  <div class="bento-grid" style={containerStyle}>
    for each item:
      tag = item.href ? 'a' : 'div'
      <tag href={item.href} style={tileStyle}> ... </tag>

CSS:
  default 1 column on mobile (< 768 px)
  at >= 768 px: grid-template-columns = repeat(cols, minmax(0, 1fr))
                grid-auto-rows         = minmax(150 px, auto)
                each tile: grid-column span var(--col-span)
                           grid-row    span var(--row-span)
```

There's no JS-driven layout — every dimension comes out of CSS Grid. The component is essentially a typed, themed wrapper around `display: grid`.

## The Core Concept: Native CSS Grid Spans

The whole layout reduces to two CSS Grid facts:

```
.bento-grid {
  display: grid;
  grid-template-columns: repeat(var(--bento-cols), minmax(0, 1fr));
  grid-auto-rows: minmax(150px, auto);
}

.bento-item {
  grid-column: span var(--col-span, 1);
  grid-row:    span var(--row-span, 1);
}
```

`minmax(0, 1fr)` is the load-bearing piece. `1fr` alone has a quirk — it won't shrink below the intrinsic content size — so a tile with a long title would force the column wider than its share, breaking the grid. `minmax(0, 1fr)` says "take an equal slice but allow shrinking to zero", which is what people actually mean when they say "a 1fr column".

`grid-auto-rows: minmax(150px, auto)` does the same job vertically: every implicit row is at least 150 px tall, but expands to fit content. So a `rowSpan: 2` tile is at least 300 px + the gap, but can grow if its content needs more room.

### Visual example

```
cols = 3, gap = 16 px

tiles: [
  { id: 1, colSpan: 2, rowSpan: 2 },
  { id: 2 }, { id: 3 },
  { id: 4 }, { id: 5, colSpan: 2 }
]

┌───────────────────────────┬─────────────┐
│                           │      2      │
│                           ├─────────────┤
│            1              │      3      │
│       (2x2 hero)          │             │
│                           │             │
├─────────────┬─────────────┴─────────────┤
│      4      │            5              │
│             │       (2x1 banner)        │
└─────────────┴───────────────────────────┘

On mobile (< 768 px) the same tiles stack as a single column,
in source order, ignoring colSpan/rowSpan entirely.
```

The mobile collapse is not a media query that overrides each tile's span — it's that the **mobile rule never applies the spans in the first place**. The `grid-column: span var(--col-span)` rule is wrapped in `@media (min-width: 768px)`, so on phones every tile naturally occupies one row of one column.

## Image Layering & Hover Transforms

Tiles can carry a background image without a separate slot. The image lives in an absolutely-positioned container behind the content, with `opacity: 0.3` so text stays readable, and a hover scale that triggers from the tile (not the image itself):

```css
.bento-item {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-image-container { position: absolute; inset: 0; z-index: 0; }
.bento-content         { position: relative; z-index: 10; }

.bento-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
}
.bento-item:hover .bento-image {
  transform: scale(1.05);
}
```

The lift-and-zoom is two transforms on two elements driven by a single `:hover`. Because both `transform` and `opacity` stay on the GPU, even a grid of fifty tiles never repaints anything when the cursor moves around.

`prefers-reduced-motion: reduce` zeroes out both transforms so the grid is fully static for users who need it.

## State Flow Diagram

```
   ┌─────────────────────┐
   │    items prop       │
   │    cols, gap        │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐         ┌──────────────────────┐
   │  CSS variables on   │ ──────▶ │  Browser layout pass │
   │  container & tiles  │         │  (no JS recompute)   │
   └─────────────────────┘         └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  Rendered grid       │
                                   │  ── responsive via   │
                                   │     media query only │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                              hover ──▶ transform: translateY + scale
                              focus ──▶ outline: 2px solid #3b82f6
                              click on item.href ──▶ <a> navigates
                              Enter/Space on item.href ──▶ window.location

   prefers-reduced-motion: reduce ──▶ all transforms disabled
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BentoItem[]` | `FALLBACK_BENTO_ITEMS` | Tiles to render. Each item carries `id`, `title`, optional `description`, `icon`, `image`, `href`, `colSpan`, `rowSpan`, and per-item `class`. |
| `cols` | `number` | `3` | Maximum columns at desktop width (`>= 768 px`). Phones always use one column. |
| `gap` | `number \| string` | `16` | Space between tiles. Numbers become pixels; strings (e.g. `'1rem'`) pass through verbatim. |
| `class` | `string` | `''` | Extra classes appended to the grid container. |
| `itemClass` | `string` | `''` | Extra classes applied to every tile (compose with per-item `item.class`). |

The `BentoItem` type:

```typescript
interface BentoItem {
  id: string | number;
  title: string;
  description?: string;
  icon?: string;     // emoji or character
  image?: string;    // URL for background image
  colSpan?: number;
  rowSpan?: number;
  class?: string;
  href?: string;     // when set, tile renders as <a> and is keyboard-activatable
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Tile has `colSpan` larger than `cols` | CSS Grid clamps the span to the available track count for that row. The tile fills the row instead of overflowing. |
| Tile has both `image` and `icon` | Both render. The image sits behind at 30% opacity; the icon sits in the foreground content stack. |
| `gap` passed as a string like `'1.5rem'` | Forwarded verbatim into `--bento-gap`. Any valid CSS length works. |
| Viewport narrower than 768 px | All tiles collapse to a single column in source order. `colSpan` and `rowSpan` are ignored entirely on mobile. |
| Tile has `href` and the user presses Enter | `keydown` handler intercepts Enter and Space, calls `preventDefault()`, and navigates via `window.location.href` to keep behaviour identical to clicking. |
| Tile has no `href` | Renders as a plain `<div>` with `tabindex="-1"`. It's no longer keyboard-focusable, which is correct — there's nothing to activate. |
| User has `prefers-reduced-motion: reduce` | All transforms (lift on hover, zoom on image) are disabled; the grid is fully static. |

## Dependencies

- **Svelte 5.x** — `$props`, `svelte:element` for the dynamic `<a>` / `<div>` switch, and CSS custom properties for the spans.
- Zero external dependencies — pure CSS Grid for layout, pure CSS for hover/focus, no motion library.

## File Structure

```
src/lib/components/BentoGrid.svelte         # implementation
src/lib/components/BentoGrid.md             # this file
src/lib/components/BentoGrid.test.ts        # vitest unit tests
src/routes/bentogrid/+page.svelte           # demo page
src/lib/types.ts                            # BentoGridProps + BentoItem
src/lib/constants.ts                        # FALLBACK_BENTO_ITEMS sample data
```
