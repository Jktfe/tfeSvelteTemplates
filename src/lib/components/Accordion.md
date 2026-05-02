# Accordion — Technical Logic Explainer

## What Does It Do? (Plain English)

A stack of expandable panels — click a header, the panel below slides open and reveals its content. Click again to collapse. Use it for dense, optional information like FAQs, settings groups, "what's in the box" lists — content that would overwhelm the page if shown all at once but mustn't be hidden behind a navigation step. Single-mode keeps just one panel open at a time (the FAQ pattern); multi-mode lets users open as many as they like (the settings panel pattern).

Think of it like a row of filing-cabinet drawers. You can open one to peek at what's inside, then close it; or open several at once if you're cross-referencing. The drawer is always ready, takes no extra navigation, and the page below stays where it was.

## How It Works (Pseudo-Code)

```
state:
  openIds = SvelteSet of currently-open item ids
  defaultOpen[] populates openIds at construction

events:
  on header click(id):
    item = items.find(i => i.id === id)
    if item.disabled: return
    wasOpen = openIds.has(id)
    if wasOpen:
      if !multiple && preventCollapseLast && openIds.size === 1:
        return                                  // anchor: keep at least one open
      openIds.delete(id)
    else:
      if !multiple: openIds.clear()             // single-mode: close others first
      openIds.add(id)
    fire onToggle(id, !wasOpen)

render per item:
  <button aria-expanded={openIds.has(id)} aria-controls="panel-{id}">
    title + chevron
  </button>
  <div role="region" aria-labelledby="trigger-{id}" aria-hidden={!isOpen}>
    grid-template-rows: 0fr (closed) | 1fr (open)
    overflow: hidden
    {content}
  </div>
```

`SvelteSet` is the key choice for `openIds`. It's a reactive `Set` from `svelte/reactivity` with O(1) `has`/`add`/`delete` and fine-grained reactivity — Svelte tracks individual `has(id)` reads, so toggling one panel doesn't re-render the others.

## The Core Concept: `grid-template-rows: 0fr ↔ 1fr` for Auto-Height Animation

The classic accordion problem is animating from height 0 to height auto. CSS animations refuse to interpolate `auto` — you have to know the target height in pixels, which means JS measurement, which means a `ResizeObserver`, which means complexity that breaks when content changes.

The 2023 fix that this component uses: **animate `grid-template-rows`** between `0fr` and `1fr`.

```css
.accordion-panel {
  display: grid;
  grid-template-rows: 0fr;       /* closed: implicit row collapses to 0 height */
  transition: grid-template-rows 0.2s ease;
}

.accordion-item.open .accordion-panel {
  grid-template-rows: 1fr;        /* open: implicit row takes full content height */
}

.accordion-content {
  min-height: 0;                  /* required so the row can collapse below content */
  overflow: hidden;               /* clip during the transition */
}
```

When `grid-template-rows: 0fr`, the implicit grid row has zero height, and the content's overflow is hidden. When it's `1fr`, the row takes its content's full height. The browser interpolates the row size between those two — for free, with zero JS measurement, for any content size — short paragraphs, long bullet lists, nested components, dynamically-loaded markdown, anything.

The `min-height: 0` on `.accordion-content` is the critical prerequisite. Grid items default to `min-height: auto`, which prevents the row from shrinking below its content's intrinsic size. Setting `min-height: 0` lets the row truly collapse to 0.

This is one of those CSS tricks where the browser does the heavy lifting and the component is essentially declarative. No JS height tracking, no `ResizeObserver`, no event listeners on content mutations. Add or remove content from inside an accordion panel and it Just Works.

## Single-Mode vs Multi-Mode vs Anchor-Mode

Three behaviours encoded in two booleans:

```
multiple=false, preventCollapseLast=false  →  Single mode (FAQ)
multiple=false, preventCollapseLast=true   →  Anchor mode (settings panel)
multiple=true                               →  Multi mode (everything open)
```

**Single mode** (default): clicking a closed header closes any other open panel first, then opens this one. Clicking the open one closes it. Models the "only one Q&A visible at a time" FAQ pattern.

**Anchor mode**: same as single, *except* clicking the only open panel does nothing. There's always exactly one panel visible. Models the "settings panel with grouped sections, the active section is always shown" pattern from VS Code's preferences.

**Multi mode**: each panel toggles independently. Models "what's in the box / specs / reviews" tabs where the user might want to compare two sections side-by-side without scrolling.

The `preventCollapseLast` check happens *before* the `delete`:

```
if !multiple && preventCollapseLast && openIds.size === 1: return
```

So clicking the last open panel in anchor mode is a no-op — `onToggle` doesn't even fire. The panel doesn't visually flicker, and consumers don't get a misleading callback.

## State Flow Diagram

```
                   ┌─────────────────────┐
                   │  defaultOpen → openIds  │  initial state
                   └──────────┬──────────┘
                              │
                  click header(id)  (item not disabled)
                              │
                              ▼
                ┌─────────────────────────────┐
                │   wasOpen = openIds.has(id) │
                └──────────┬──────────────────┘
                           │
              ┌────────────┼────────────────┐
              │                              │
         wasOpen=true                  wasOpen=false
              │                              │
   ┌──────────┴──────────┐                   │
   │                     │                   │
  multi-mode      anchor (single +      single-mode &&
  or single &&    preventCollapseLast)   openIds.has(others):
  not last open   && openIds.size===1:
   │                     │                  openIds.clear()
   │                     │                       │
   ▼                     ▼                       ▼
  delete(id)           return                add(id)
                       (no-op)
   │                                            │
   ▼                                            ▼
   onToggle(id, false)                onToggle(id, true)

   Panel CSS:
     openIds.has(id) → grid-template-rows: 1fr  (panel slides open)
     !openIds.has(id) → grid-template-rows: 0fr (panel slides closed)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `{ id: string; title: string; content: string; disabled?: boolean }[]` | required | Panels to render. |
| `multiple` | `boolean` | `false` | Allow multiple panels open simultaneously. |
| `defaultOpen` | `string[]` | `[]` | Item ids to open at mount time. |
| `preventCollapseLast` | `boolean` | `false` | In single mode, prevent closing the last open panel — at least one is always open. |
| `size` | `'sm' \| 'md'` | `'md'` | Header padding + font scale. |
| `bordered` | `boolean` | `true` | Show borders around each item with rounded outer corners. |
| `ariaLabel` | `string` | `'Accordion'` | `aria-label` on the wrapper. |
| `onToggle` | `(id: string, isOpen: boolean) => void` | — | Fires after a header is clicked (does not fire when click is no-op'd by `preventCollapseLast`). |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `defaultOpen` contains an id that's not in `items` | Silently ignored — the SvelteSet contains the orphan id but no panel matches, so nothing renders open. Harmless. |
| `multiple={false}` and `defaultOpen` has 2 ids | Both open at mount (the constructor doesn't enforce single-mode). The first user click then collapses to one. |
| Panel content contains nested interactive elements | Tab order works inside open panels (closed panels have `aria-hidden=true`; their content is still in the DOM but visually clipped). To make sure tabbable elements inside closed panels aren't reachable, set `tabindex="-1"` on them or render content conditionally. |
| `preventCollapseLast` and user clicks the last open header | Click does nothing, `onToggle` does not fire. |
| Disabled item's header clicked | `item.disabled` short-circuits the toggle; the button is also `disabled` so AT announces it as such. |
| Content is dynamic (set via prop after mount) | The `grid-template-rows: 0fr ↔ 1fr` interpolation handles any content height — no measurement needed. |
| User has `prefers-reduced-motion: reduce` | The 200 ms grid-row transition and the chevron rotation transition are disabled; panels open and close instantly. |
| Two Accordions on the same page sharing item ids | The DOM uses `id="trigger-{id}"` and `id="panel-{id}"` — duplicate ids cause invalid HTML and broken aria-labelledby. Make ids unique across the page (or scope them per accordion: `faq-shipping`, `settings-shipping`). |

## Dependencies

- **Svelte 5.x** — `$props`, `{@const}`. The state machine is one `SvelteSet`.
- **`svelte/reactivity`** — `SvelteSet` for fine-grained reactive set reads.
- Zero other external dependencies. Native `<button>`, scoped CSS, inline chevron SVG.

## File Structure

```
src/lib/components/Accordion.svelte    # implementation
src/lib/components/Accordion.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Accordion.test.ts   # vitest unit tests
src/routes/accordion/+page.svelte      # demo page
```
