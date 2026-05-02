# ExplainerCanvas — Technical Logic Explainer

## What Does It Do? (Plain English)

A pannable, zoomable canvas of cards arranged in space, with nested sub-canvases, fuzzy search, breadcrumb navigation, and markdown-rendered card content. It's a concept-mapping tool you use to *explain* something complex by laying its parts out spatially and letting the reader walk through them.

Think Obsidian Canvas or Miro, but data-driven and embeddable: pass in a tree of cards (each with a position, summary, optional markdown body, optional sub-canvas, optional links to other cards) and the component renders an interactive map. Drag to pan, scroll to zoom, click a card to expand its detail, click a link to fly to another card, dive into a sub-canvas to enter a nested level. Ctrl/Cmd + F searches across every card in every level.

On mobile, the spatial canvas collapses to a simplified accordion view because pan/zoom on a tiny screen with a tiny finger is misery. Same data, same content, very different shape.

It's the right component when you have **structured knowledge with spatial relationships** — architecture diagrams, lesson plans, design systems, story bibles, project mind-maps — and the prose-then-link form of Markdown documentation is too linear.

## How It Works (Pseudo-Code)

```
state:
  canvasData         // loaded from data prop, src URL, or loader function
  navigationPath     // breadcrumb: [rootCardId, subCanvasCardId, …]
  expandedCardId     // which card is currently showing its detail
  searchQuery        // current search input
  searchResults      // fuse.js results across canvasData
  viewport           // { x, y, zoom } managed by Panzoom
  isMobile           // true when innerWidth < threshold

derive currentLevel (from canvasData, navigationPath):
  // Walk navigationPath: root canvas → sub-canvas of card A → sub-canvas of card B → …
  return the canvas at the end of the path

derive visibleCards (from currentLevel):
  return currentLevel.cards

derive arrows (from visibleCards):
  for each card.links: emit arrow from card → linked card

events:
  on mount:
    load data via loader / src / data prop
    initialise Panzoom on viewport
    register keyboard shortcuts (Ctrl+F, +, -, Esc)

  on card click(card):
    if expandedCardId === card.id:
      collapse, run onCollapse?
    else:
      expandedCardId = card.id, run onExpand?

  on card link click(targetCardId):
    smoothly pan/zoom to target's position
    expand target if not already
    onNavigate?(targetCardId, navigationPath)

  on dive-in click(card):
    if card.subCanvas exists:
      navigationPath.push(card.id)
      reset viewport to subCanvas root

  on breadcrumb click(level):
    navigationPath = navigationPath.slice(0, level)

  on search input:
    searchResults = fuse.search(query) over flattened cards
    onSearch?(query, searchResults)

  on search result click:
    navigate path to that card's parent canvas, then expand the card

  on Escape:
    if search open: close search
    else if expandedCardId: collapse it
    else if navigationPath.length > 0: pop a level

render (desktop):
  <Breadcrumbs items={navigationPath} />
  <SearchPanel visible={searchOpen} results={searchResults} />
  <CanvasViewport with Panzoom>
    <ConnectionLines arrows={arrows} style={lineStyle} />
    {#each visibleCards} <Card content={CardContent}> {/each}
  </CanvasViewport>
  <CanvasControls zoom in/out/fit />
  <TooltipPortal />

render (mobile):
  <MobileView cards={visibleCards} as accordion list />
```

The component is split across ten sub-components (Card, CardContent, CanvasViewport, CanvasControls, Breadcrumbs, ConnectionLines, SearchPanel, MobileView, TooltipPortal, plus the orchestrating ExplainerCanvas). Data flows down via props; events bubble up via callback props. State lives at the top level.

## Core Concept: Recursive Canvas + Fuzzy Search Across Levels

Two ideas drive the component.

### Recursive sub-canvases

Every card optionally carries a `subCanvas: ExplainerCanvasData` field — the same shape as the top-level data. Diving into a card with a sub-canvas pushes its id onto `navigationPath`, and the renderer walks the path each render to find the *currently active* level.

This is the same recursive pattern as a file system: the same node type appears at every level, navigation is push/pop on a path stack, and rendering is "show me the level at the end of this path". The data structure is therefore unbounded in depth — you can nest as deep as your data goes, and the breadcrumb will track every level.

The only practical limit is cognitive: more than 3–4 levels deep and users lose orientation regardless of how good the breadcrumb is.

### Fuzzy search across the entire tree

Search uses Fuse.js with a flat index built from a recursive walk of every card at every level. The walk also records each card's `path` (the sequence of parent-card ids needed to reach it), so when the user clicks a search result, the component can:

1. Set `navigationPath` to the result's path,
2. Wait one tick for the new level to render,
3. Pan/zoom the viewport to the result's `position`,
4. Expand the result card.

Fuse's fuzzy matching means typing `"react"` finds cards mentioning `"reactivity"`, `"reactive"`, `"reaction"`. Score is a 0–1 distance — lower is better — and the search panel shows results sorted by score with a small badge for which field matched (`title` / `summary` / `content`).

The flat index is rebuilt on `data` change. For canvases with hundreds of nested cards this is still fast (<10 ms); Fuse's pre-tokenisation is the dominant cost, paid once per data load.

### Pan/zoom delegated to Panzoom

The viewport uses `@panzoom/panzoom` for the mouse/touch interaction. Hand-rolling pan-zoom is ~300 lines of pointer-event glue with subtle bugs (touch event ordering, momentum decay, coordinate space transforms); Panzoom solves all of it and is ~7 KB. The component reads the viewport state and writes back when navigating to a search result or following a card link.

The "fly to" animation when following a link is a custom tween over 300 ms that interpolates `(x, y, zoom)` simultaneously — Panzoom doesn't expose a one-shot tween, so we drive it via its imperative API in a rAF loop.

## Performance

The component juggles four cost centres: data load, search index, pan/zoom, render.

- **Up to ~100 cards across all levels:** Trivial. Search index builds in <5 ms; Panzoom is GPU-accelerated; markdown renders are cheap.
- **100–500 cards:** Search index build climbs to ~30 ms (still negligible on data load). The DOM holds 20–100 cards visible at any one time (current-level only); render cost is constant.
- **500+ cards:** The search index gets fat (~MB-class memory) and Fuse search slows to 50 ms+ per keystroke. Debounce search input to 150 ms. Consider lazy-loading sub-canvases via the `loader` prop.
- **Cards with very large markdown bodies:** marked + highlight.js parsing is one-shot per expand; output is sanitised by isomorphic-dompurify. Heavy code blocks (>10 KB) noticeably slow the first expand. Cache the parsed HTML in the component if you re-render frequently.

The `loader` prop is the escape hatch for genuinely large datasets: load the top-level canvas first, then fetch sub-canvases on dive-in. The component's data shape is recursive enough to support partial loads (a card with a `subCanvas: undefined` plus a `loader` callback can hydrate on demand).

`prefers-reduced-motion: reduce` disables the fly-to tween (jumps instantly), the card expand animation (instant show/hide), and the search panel slide.

## State Flow Diagram

```
              ┌──────────────────────────┐
              │  loading                  │
              │  fetching data via         │
              │  loader / src / props      │
              └────────────┬─────────────┘
                           │ data ready
                           ▼
              ┌──────────────────────────┐
              │  rendered (desktop)       │
              │  navigationPath = []      │
              │  expandedCardId = null    │
              │  searchOpen = false       │
              │  Panzoom initialised      │
              └────────────┬─────────────┘
                           │
       ┌───────────────────┼─────────────────────┬─────────────────┐
       │ pan/zoom          │ click card           │ Ctrl+F          │ click sub-canvas
       │ (Panzoom)         │                      │                 │ "dive in"
       ▼                   ▼                      ▼                 ▼
 ┌──────────┐       ┌─────────────────┐   ┌──────────────┐   ┌──────────────────┐
 │ viewport │       │ expandedCardId  │   │ searchOpen=  │   │ navigationPath   │
 │ updates  │       │ set; markdown   │   │ true; focus  │   │ pushed; viewport │
 └──────────┘       │ rendered        │   │ search input │   │ resets to new    │
                    └────────┬────────┘   └──────┬───────┘   │ level            │
                             │                   │           └────────┬─────────┘
                             │ click card link   │                    │
                             ▼                   ▼                    │
                    ┌────────────────┐   ┌──────────────┐              │
                    │ fly-to tween   │   │ Fuse.search; │              │
                    │ (rAF, 300ms)   │   │ click result │──────────────┘
                    │ to target;     │   │ → navigate   │
                    │ expand it      │   └──────────────┘
                    └────────────────┘
                             │
                             │ Escape
                             ▼
                    ┌────────────────┐
                    │ collapse, or   │
                    │ pop nav path   │
                    └────────────────┘
```

Mobile path branches at "rendered": instead of CanvasViewport + Panzoom, the component renders `MobileView` which is a flat accordion with all the same data accessible via tap/expand.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ExplainerCanvasData` | `undefined` | Direct data object. One of `data`/`src`/`loader` is required. |
| `src` | `string` | `undefined` | URL to a JSON file. Loaded on mount. |
| `loader` | `() => Promise<ExplainerCanvasData>` | `undefined` | Custom async loader (e.g. fetch + auth). |
| `initialCardId` | `string` | `undefined` | Override the data's `defaultCardId` to start expanded on a specific card. |
| `lineStyle` | `'bezier' \| 'straight' \| 'orthogonal'` | `'bezier'` | Connection-line shape between linked cards. |
| `class` | `string` | `''` | Extra classes on the container. |
| `onNavigate` | `(cardId: string, path: string[]) => void` | `undefined` | Fires on card-to-card navigation (link follow or search result). |
| `onExpand` | `(cardId: string) => void` | `undefined` | Fires when a card opens its detail panel. |
| `onCollapse` | `(cardId: string) => void` | `undefined` | Fires when a card closes. |
| `onSearch` | `(query: string, results: ExplainerCard[]) => void` | `undefined` | Fires on every search input change with the result set. |

`ExplainerCanvasData`:

```typescript
interface ExplainerCanvasData {
  id: string;
  title: string;
  description?: string;
  defaultCardId: string;
  cards: ExplainerCard[];
  config?: ExplainerCanvasConfig;
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| All three of `data`/`src`/`loader` are unset | Component renders nothing and logs a console warning. |
| `data` set after mount | Component resets to initial state with the new data; navigation path clears. |
| Card with no `subCanvas` but a "dive in" affordance in its template | The dive-in click is silently ignored. Hide the affordance with conditional rendering. |
| Card link points to a non-existent id | Click is silently ignored. The console logs a warning (in dev mode). Validate links during data load. |
| Mobile viewport (<768 px) | `MobileView` replaces `CanvasViewport`. Pan/zoom disabled; cards render as a flat accordion. Sub-canvases become tappable expansions. |
| Cyclic links (A → B, B → A) | Allowed. Fly-to animation works in both directions. |
| Search query with special characters | Fuse handles it without regex injection (it's not regex-based). |
| Markdown body contains `<script>` tags | Sanitised by isomorphic-dompurify before rendering. XSS-safe. |
| User has `prefers-reduced-motion: reduce` | Fly-to becomes instant; card expand is instant; search panel slide is instant. |
| Loader rejects | Component catches and renders an error state with a retry affordance. |
| Network slow on `src` load | Loading skeleton shown until response arrives. |
| Sub-canvas references its own ancestor (cycle in dive-in) | Possible to create accidentally. Breadcrumb prevents infinite recursion (each path entry must be unique by id), but the data is malformed — validate it. |

## Dependencies

- **`@panzoom/panzoom`** — pan/zoom glue. **Why external?** Hand-rolling cross-browser, cross-device pan/zoom with momentum and pinch handling is a 300+ line project full of edge cases (Safari touch events, Firefox wheel deltas, momentum decay tuning). Panzoom is ~7 KB and battle-tested.
- **`marked`** + **`highlight.js`** — markdown → HTML with syntax highlighting in code blocks.
- **`fuse.js`** — fuzzy search across the flat card index. Tiny (~12 KB), fast, and tolerant of typos.
- **`isomorphic-dompurify`** — XSS sanitisation of rendered markdown HTML. Security-critical when users supply markdown content.
- **Svelte 5.x** — `$state`, `$derived`, `$effect`, snippets across the 10 sub-components.

The four external libraries are all present elsewhere in the codebase or are best-in-class for their job. Native replacements would multiply the source size by ~3–5×, so the dependency cost is justified.

## File Structure

```
src/lib/components/ExplainerCanvas/
├── ExplainerCanvas.svelte        # orchestrator
├── ExplainerCanvas.test.ts       # unit tests
├── ExplainerCanvas.md            # this file
├── Card.svelte                   # individual card on the canvas
├── CardContent.svelte            # markdown-rendered detail panel
├── CanvasViewport.svelte         # pan/zoom container (wraps Panzoom)
├── CanvasControls.svelte         # zoom in/out/fit-to-view buttons
├── ConnectionLines.svelte        # SVG arrows between linked cards
├── Breadcrumbs.svelte            # navigation path display
├── SearchPanel.svelte            # Fuse.js-powered search UI
├── MobileView.svelte             # mobile accordion fallback
├── TooltipPortal.svelte          # tooltip layer
└── utils/
    ├── geometry.ts               # bezier/orthogonal path math
    ├── loader.ts                 # data/src/loader factory
    ├── markdown.ts               # marked + dompurify pipeline
    └── search.ts                 # fuse.js index builder

src/routes/explainercanvas/+page.svelte    # demo page
src/lib/types.ts                            # ExplainerCanvas* interfaces
src/lib/constants.ts                        # FALLBACK_EXPLAINER_CANVAS_DATA
```
