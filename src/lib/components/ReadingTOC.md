---
name: ReadingTOC
category: Helpful UX
author: tfeclaude
status: shipped
---

# ReadingTOC

Auto-tracking table of contents that highlights the heading the reader is currently looking at and smooth-scrolls to a section on click.

## Purpose

Long-form content (blog posts, documentation, articles) often runs longer than a viewport. ReadingTOC gives readers a persistent map of the page: it tells them **where** they are right now, and lets them jump anywhere with one click. It pairs with ScrollProgressBar — together they form a complete reading toolkit:

- **ScrollProgressBar** — *how much* (passive position 0→100%)
- **ReadingTOC** — *where* (active section awareness)

## Quick start

```svelte
<script lang="ts">
  import ReadingTOC from '$lib/components/ReadingTOC.svelte';
</script>

<!-- Default: rail variant, tracks <main>, h2/h3/h4 -->
<ReadingTOC />

<!-- Top-edge horizontal pill row for short docs -->
<ReadingTOC variant="top" />

<!-- Mobile-friendly drawer (FAB + tray) -->
<ReadingTOC variant="drawer" />

<!-- Track a specific container, only h2/h3 -->
<ReadingTOC target="#article-body" levels={[2, 3]} />
```

## Props

| Prop          | Type                                          | Default              | Description                                       |
|---------------|-----------------------------------------------|----------------------|---------------------------------------------------|
| `target`      | `string` (CSS selector)                       | `'main'`             | Container whose headings are extracted            |
| `headings`    | `Heading[]`                                   | `undefined`          | Override extraction with a pre-built list         |
| `levels`      | `number[]`                                    | `[2, 3, 4]`           | Which heading levels to track                     |
| `variant`     | `'rail' \| 'top' \| 'drawer'`                 | `'rail'`             | Visual layout                                     |
| `size`        | `'sm' \| 'md' \| 'lg'`                        | `'md'`               | Type scale                                        |
| `position`    | `'left' \| 'right'`                           | `'left'`             | Rail anchor side (rail variant only)              |
| `title`       | `string`                                      | `'On this page'`     | Section heading shown above the list              |
| `aria-label`  | `string`                                      | `'Table of contents'`| Screen-reader announcement for the nav landmark   |
| `class`       | `string`                                      | `''`                 | Additional wrapper classes                        |

## Variants

- **rail** — sticky vertical sidebar. Best for desktop layouts with a margin column. Hierarchy is shown via indented sub-lists with a connecting line.
- **top** — horizontal scrolling pill row. Best for short docs or top-of-page placement. Renders only top-level headings (children are ignored).
- **drawer** — fixed-position floating action button that opens an overlay panel. Best for mobile or content-dense pages where a permanent rail would crowd the layout.

## Helper exports

The module-script exposes pure helpers for testing and downstream use:

| Export                     | Purpose                                                                |
|----------------------------|------------------------------------------------------------------------|
| `VALID_VARIANTS`           | Read-only list of accepted variant names                               |
| `VALID_SIZES`              | Read-only list of accepted size names                                  |
| `isValidVariant(v)`        | Type-guard for variant strings                                         |
| `pickVariant(v)`           | Coerce to valid variant or fall back to `'rail'`                       |
| `isValidSize(s)`           | Type-guard for size strings                                            |
| `pickSize(s)`              | Coerce to valid size or fall back to `'md'`                            |
| `slugify(text)`            | URL-safe slug; NFKD-strips diacritics, drops punctuation, hyphenates   |
| `buildHeadingTree(list)`   | Stack-based hierarchy from a flat heading list (handles level skips)   |
| `flattenTree(nodes)`       | Depth-first walk back to a flat list (inverse of `buildHeadingTree`)   |
| `resolveActiveHeading(...)`| Three-tier active resolver (intersecting → passed → fallback)          |
| `extractHeadings(el, lv)`  | Read h-tags from a container; auto-assigns slugified IDs when missing  |
| `isReducedMotion()`        | Detect `prefers-reduced-motion: reduce` safely                         |

## Distinct from

- **ScrollProgressBar** — passive position bar (0–100%), not section-aware
- **Pagination** — discrete step navigation, not scroll-bound
- **Stepper** — multi-step form indicator, not document-driven
- **StaggeredMenu** — site-wide navigation, not in-page anchor list

## Accessibility

- The wrapper is a real `<nav>` with a configurable `aria-label`
- Items are real `<a href="#id">` anchors — keyboard reachable, open-in-new-tab works, link works without JS
- `aria-current="location"` marks the currently active item for screen readers
- Drawer toggle is a real `<button>` with `aria-expanded` and `aria-controls` referencing the panel
- Escape closes an open drawer
- `prefers-reduced-motion: reduce` → instant `scrollIntoView` (no smooth animation), no transitions

## Performance

- Single `IntersectionObserver` covers all tracked headings
- Top-band `rootMargin: '0px 0px -60% 0px'` makes the active item update as you read past a heading, not when it leaves the bottom of the viewport
- Tree is rebuilt only when the headings list changes (`$derived` memoisation)
- Entry cache is a plain object keyed by id (no per-frame Map churn)
- No scroll listener, no `ResizeObserver`, no `MutationObserver`

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

## Browser support

Requires `IntersectionObserver`, `requestAnimationFrame` is not used. Effectively all browsers since Safari 12.1 / Chrome 51 / Firefox 55. Where `IntersectionObserver` is unavailable the component renders the list but does not auto-track — clicks still work.
