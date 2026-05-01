# ReadingTOC — Technical Logic Explainer

## What Does It Do? (Plain English)

ReadingTOC is an auto-tracking table of contents for long-form content. It scans a target container for headings, renders them as a hierarchical list, highlights the heading the reader is currently looking at, and smooth-scrolls to a section on click. As the reader scrolls past a heading, the active marker quietly follows them down the page.

Think of it as a *you-are-here* sticker for a magazine article. The reader can glance over, see which section they're inside, and jump anywhere with a single click. It pairs naturally with `ScrollProgressBar` — together they form a complete reading toolkit:

- **ScrollProgressBar** — *how much* (passive position 0→100%)
- **ReadingTOC** — *where* (active section awareness)

The component ships in three layouts so it can adapt to any page:

- **rail** — a sticky vertical sidebar. Best for desktop layouts with a margin column. Hierarchy is shown via indented sub-lists with a connecting line.
- **top** — a horizontal scrolling pill row. Best for short docs or top-of-page placement. Renders only top-level headings (children are ignored).
- **drawer** — a fixed-position floating action button that opens an overlay panel. Best for mobile or content-dense pages where a permanent rail would crowd the layout.

## How It Works (Pseudo-Code)

```
state:
  extractedHeadings = []           // populated on mount from `target` container
  activeId          = null         // id of the currently active heading
  drawerOpen        = false        // drawer variant only
  reduced           = false        // prefers-reduced-motion gate
  entryCache        = {}           // id → { ratio, isIntersecting, top }

derived:
  headingsToUse = providedHeadings ?? extractedHeadings
  tree          = buildHeadingTree(headingsToUse)

on mount:
  reduced = isReducedMotion()
  if no providedHeadings:
    container = document.querySelector(target)
    extractedHeadings = extractHeadings(container, levels)
    // mutates DOM: assigns slugified ids to headings that lack one
  setupObserver()

setupObserver():
  observer = new IntersectionObserver(handleIntersect, {
    rootMargin: '0px 0px -60% 0px',
    threshold:  [0, 0.25, 0.5, 0.75, 1]
  })
  for each heading h:
    el = document.getElementById(h.id)
    if el: observer.observe(el)

on intersect(entries):
  for each entry e:
    entryCache[e.target.id] = snapshot(e)
  activeId = resolveActiveHeading(values(entryCache), activeId)

resolveActiveHeading(entries, fallback):
  visible = entries where isIntersecting
  if any visible: return one with highest ratio (tiebreak: top closest to 0)
  passed = entries where top < 0
  if any passed:  return one with greatest top (most recently passed)
  return fallback

on link click(id):
  prevent default
  el = document.getElementById(id)
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  activeId  = id
  history.replaceState(null, '', `#${id}`)
  if drawer variant: drawerOpen = false

on Escape (drawer variant only):
  drawerOpen = false

on headings change (effect):
  re-run setupObserver()  // disconnects, clears cache, re-observes
```

## Helper Exports

The module-script exposes pure helpers for testing and downstream use. Every one of these is a plain function with no Svelte runtime dependency, which is what makes the component's logic so easy to unit-test.

| Export | Purpose |
|--------|---------|
| `VALID_VARIANTS` | Read-only list of accepted variant names |
| `VALID_SIZES` | Read-only list of accepted size names |
| `isValidVariant(v)` | Type-guard for variant strings |
| `pickVariant(v)` | Coerce to valid variant or fall back to `'rail'` |
| `isValidSize(s)` | Type-guard for size strings |
| `pickSize(s)` | Coerce to valid size or fall back to `'md'` |
| `slugify(text)` | URL-safe slug; NFKD-strips diacritics, drops punctuation, hyphenates |
| `buildHeadingTree(list)` | Stack-based hierarchy from a flat heading list (handles level skips) |
| `flattenTree(nodes)` | Depth-first walk back to a flat list (inverse of `buildHeadingTree`) |
| `resolveActiveHeading(...)` | Three-tier active resolver (intersecting → passed → fallback) |
| `extractHeadings(el, lv)` | Read h-tags from a container; auto-assigns slugified IDs when missing |
| `isReducedMotion()` | Detect `prefers-reduced-motion: reduce` safely |

The `resolveActiveHeading` function is the heart of the tracker. It picks the active heading using a three-tier strategy: first preferring any heading currently *intersecting* the top band of the viewport (highest ratio wins, tiebreak by document order), then falling back to the most recently *passed* heading (largest negative `top`), and finally to the supplied fallback. This is why the active marker stays put even when you've scrolled past every heading on the page — there's always a sensible answer.

## Performance

- A single `IntersectionObserver` covers all tracked headings — never one observer per heading.
- Top-band `rootMargin: '0px 0px -60% 0px'` makes the active item update as you read past a heading, not when it leaves the bottom of the viewport. The effect is that the highlight follows your *eye line*, not the heading's exit.
- The hierarchical tree is rebuilt only when the headings list changes (`$derived` memoisation) — not on every observer tick.
- The entry cache is a plain object keyed by id, not a `Map`. There's no per-frame churn, no reactive proxy overhead.
- No scroll listener, no `ResizeObserver`, no `MutationObserver`, no `requestAnimationFrame` loop. The observer fires only when a heading actually crosses a threshold.

## Distinct From ScrollProgressBar

These two components live next to each other in the docs and are deliberately complementary, not competing:

- **ScrollProgressBar** is *passive*. It tells you you're 47% of the way through. It doesn't know what 47% means; it doesn't know about sections; it can't take you anywhere.
- **ReadingTOC** is *active*. It knows which section you're in, lets you jump elsewhere, and rebuilds itself if the heading list changes.

Other things that are *not* ReadingTOC:

- **Pagination** — discrete step navigation, not scroll-bound.
- **Stepper** — multi-step form indicator, not document-driven.
- **StaggeredMenu** — site-wide navigation, not in-page anchor list.

## Recipes

### Pair with ScrollProgressBar

```svelte
<ScrollProgressBar variant="thin" color="#6366f1" />

<div class="page-grid">
  <ReadingTOC variant="rail" position="right" />
  <main>
    <article>...</article>
  </main>
</div>
```

### Mobile drawer + desktop rail (CSS-driven)

```svelte
<div class="md:hidden">
  <ReadingTOC variant="drawer" />
</div>
<div class="hidden md:block">
  <ReadingTOC variant="rail" />
</div>
```

### Top pill row for short docs

```svelte
<ReadingTOC variant="top" levels={[2]} title="Sections" />
```

### Override extraction with a pre-built list

Useful when content is rendered into a container after `onMount`, or when you want to control which headings appear:

```svelte
<script lang="ts">
  import ReadingTOC, { type Heading } from '$lib/components/ReadingTOC.svelte';

  const headings: Heading[] = [
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'install', text: 'Installation', level: 2 },
    { id: 'config', text: 'Configuration', level: 3 }
  ];
</script>

<ReadingTOC {headings} />
```

## State Flow Diagram

```
                ┌────────────────────────┐
                │  mount                 │
                │  extractedHeadings = []│
                │  activeId   = null     │
                └───────────┬────────────┘
                            │ if no providedHeadings:
                            │   extractHeadings(target, levels)
                            ▼
                ┌────────────────────────┐
                │  observe all heading   │
                │  elements              │
                └───────────┬────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
   ┌─────────────────┐ ┌──────────┐ ┌────────────────┐
   │ heading enters  │ │ click on │ │ headings array │
   │ top band        │ │ link     │ │ changes        │
   └────────┬────────┘ └────┬─────┘ └────────┬───────┘
            │ ratio update  │ scrollIntoView │ disconnect +
            │ resolve()     │ activeId = id  │ re-observe
            ▼               ▼                ▼
   ┌─────────────────────────────────────────────┐
   │  activeId = <id>  →  aria-current="location"│
   └─────────────────────────────────────────────┘

   drawer variant only:
   ┌─────────┐   click toggle   ┌─────────┐
   │ closed  │ ────────────────▶│  open   │
   │         │ ◀────────────────│         │
   └─────────┘  Escape / link   └─────────┘
                 click
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `string` | `'main'` | CSS selector for the container whose headings are extracted. |
| `headings` | `Heading[]` | `undefined` | Pre-built heading list; overrides DOM extraction when supplied. |
| `levels` | `number[]` | `[2, 3, 4]` | Which heading levels to track. |
| `variant` | `'rail' \| 'top' \| 'drawer'` | `'rail'` | Visual layout. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Type scale. |
| `position` | `'left' \| 'right'` | `'left'` | Rail anchor side (rail variant only). |
| `title` | `string` | `'On this page'` | Section heading shown above the list. |
| `aria-label` | `string` | `'Table of contents'` | Screen-reader announcement for the nav landmark. |
| `class` | `string` | `''` | Additional wrapper classes. |

The `Heading` type:

```typescript
interface Heading {
  id: string;
  text: string;
  level: number;  // 1–6
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `target` selector matches nothing on mount | `extractedHeadings` stays empty; rail/drawer renders an *"No headings found."* message. |
| Heading element has no `id` attribute | `extractHeadings` mutates the DOM and assigns a slugified id (`heading-0` if the text slugifies to empty). |
| Two headings produce the same slug | Subsequent collisions get a numeric suffix (`overview`, `overview-1`, `overview-2`). |
| User scrolls past every heading | Active marker stays on the most recently passed heading via the `top < 0` fallback in `resolveActiveHeading`. |
| `headings` prop changes at runtime | The `$effect` re-runs `setupObserver()`: disconnects, clears the entry cache, observes the new set. |
| `prefers-reduced-motion: reduce` | `scrollIntoView` uses `behavior: 'auto'` (instant jump); panel fade-in and link transitions are killed. |
| `IntersectionObserver` unavailable (very old browsers) | List renders, links work, but no auto-tracking — `setupObserver` returns early. |
| Heading level skip (h2 → h4 with no h3) | `buildHeadingTree`'s stack pop keeps the h4 as a child of the h2; no orphan node. |
| Top variant with deeply nested headings | Top variant only renders the top level of the tree; children are ignored by design. |

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`, `$effect`) and snippets (`{#snippet itemList}` recurses through the tree).
- Zero external dependencies — pure scoped CSS, native `IntersectionObserver`, no motion library.

## File Structure

```
src/lib/components/ReadingTOC.svelte    # implementation (with module-script helpers)
src/lib/components/ReadingTOC.md        # this file (rendered inside ComponentPageShell)
src/lib/components/ReadingTOC.test.ts   # vitest unit tests for the helpers
src/routes/readingtoc/+page.svelte      # demo page
```
