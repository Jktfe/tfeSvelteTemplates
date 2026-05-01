# Pagination — Technical Logic Explainer

## What Does It Do? (Plain English)

A row of page numbers — `Prev   1 … 4 5 6 … 20   Next` — for stepping through a paginated list of results, table rows, or gallery images. Click a number to jump straight to that page. Click `Prev` or `Next` to move one step at a time. The button for the page you're on is highlighted and announced to screen readers as the current page.

When there are too many pages to show every number, the middle of the row collapses into one or two `…` markers. The first page, the last page, the current page and a configurable number of *sibling* pages either side of the current one are always preserved — those are the only numbers a user is likely to want to click.

Think of it as a TV channel changer: there's a "+1" and a "-1" at the edges for stepping, and the middle shows the channels closest to the one you're watching, with a hint that there are more above and below.

## How It Works (Pseudo-Code)

```
state:
  page       = 1                          // bindable, 1-indexed
  totalPages = 1
  siblings   = 1                          // pages either side of current

derive items[]:
  call buildItems(page, totalPages, siblings)
  // returns array of `number | 'ellipsis-left' | 'ellipsis-right'`

derive isFirst = page <= 1
derive isLast  = page >= totalPages

events:
  on click Prev:                goTo(page - 1)
  on click page-number N:       goTo(N)
  on click Next:                goTo(page + 1)

  goTo(target):
    clamped = clamp(target, 1, totalPages)
    if clamped == page: return                // no-op, no callback
    page = clamped                            // mutates bindable
    onChange?.(clamped)                       // optional callback

render:
  <nav aria-label="Pagination">
    <button disabled={isFirst} aria-label="Go to previous page">Prev</button>
    for each item in items:
      if item is an ellipsis: <span aria-hidden>…</span>
      else: <button
              aria-label="Go to page {item}"
              aria-current={item == page ? 'page' : undefined}
              class:active={item == page}
            >{item}</button>
    <button disabled={isLast} aria-label="Go to next page">Next</button>
  </nav>
```

The two reactive primitives are `items` (the visible row) and the `isFirst` / `isLast` flags (which drive the disabled state of Prev/Next). Both are `$derived`, so any change to `page`, `totalPages`, or `siblings` updates the row and the edge buttons in one go.

## The Core Concept: Ellipsis Algorithm

The behaviour that makes a pagination component feel right is *which* numbers it chooses to show when the row can't fit everything. Get it wrong and the user hits a wall of `…` with no useful jump targets; get it right and the row stays compact while still surfacing every page they're likely to want.

The algorithm in `buildItems(current, total, siblings)` answers four questions in order.

### 1. Is the trail trivial?

```
if (total <= 1) return [1]
```

Zero or one page — no navigation needed, render a single button labelled `1`. This guards against `totalPages = 0` (an empty result set), which a naïve implementation would render as nothing at all.

### 2. Will every page fit?

```
totalVisible = siblings * 2 + 5
if (total <= totalVisible) return [1, 2, …, total]
```

`totalVisible` is the count of slots the row would hold at full stretch: first page + last page + current + `siblings` on each side + two ellipsis markers = `5 + 2 * siblings`. With `siblings = 1`, that's `7` — fewer than 8 pages renders every number, no ellipses. With `siblings = 2` it rises to `9`.

### 3. Where is the current page?

```
leftSib       = max(current - siblings, 1)
rightSib      = min(current + siblings, total)
showLeftDots  = leftSib  > 2
showRightDots = rightSib < total - 1
```

The `showLeftDots` / `showRightDots` flags ask whether the sibling window has cleared a meaningful gap from each edge. The `> 2` and `< total - 1` thresholds matter: if the gap would only hide *one* number, the ellipsis costs more visual noise than the digit it replaces — so we render the digit instead.

### 4. Which layout wins?

There are three real cases, each producing a different shape:

| Case | Condition | Layout | Example (total=20, siblings=1) |
|------|-----------|--------|--------------------------------|
| Near start | `!showLeftDots && showRightDots` | `1, 2, …, 2s+3, …, total` | page 3 → `1 2 3 4 5 … 20` |
| Near end | `showLeftDots && !showRightDots` | `1, …, total-2s-2, …, total` | page 18 → `1 … 16 17 18 19 20` |
| Middle | both flags true | `1, …, leftSib..rightSib, …, total` | page 10 → `1 … 9 10 11 … 20` |

The asymmetry is deliberate: near-start and near-end cases render `2s + 3` consecutive numbers (`5` when `siblings = 1`), but the middle case renders only `2s + 1` (`3`). When one side is anchored at the edge, the spare visual budget gets spent on more numbers rather than a redundant ellipsis. Same algorithm Material UI and Mantine use.

### Worked example — total = 20, siblings = 1

| `page` | Output | Case |
|---|---|---|
| `1`–`4` | `1 2 3 4 5 … 20` | near start (page 4 still qualifies — `leftSib = 3` is not `> 2`) |
| `5` | `1 … 4 5 6 … 20` | middle |
| `10` | `1 … 9 10 11 … 20` | middle |
| `17`–`20` | `1 … 16 17 18 19 20` | near end |

## Accessibility Deep-Dive

The wrapper is a real `<nav aria-label="Pagination">`, making it a landmark that screen-reader users can jump to directly. Each page-number is a real `<button type="button">` — not a styled `<div>` or `<a>` — so it inherits focus, `Enter`/`Space` activation, and disabled-state semantics for free.

**`aria-label` on every button.** Plain text `5` inside a button is announced as just *"5, button"* — useless without context. `aria-label="Go to page {N}"` overrides the visible label for assistive tech, so the announcement becomes *"Go to page 5, button"*. Same trick on Prev/Next: visible text is `Prev`, announced label is *"Go to previous page"*.

**`aria-current="page"` on the active button.** Screen readers announce *"current page"* alongside the button label. The active button is deliberately **not** disabled — `goTo` short-circuits when `clamped === page`, so clicking it is a no-op. Disabling it would force keyboard users to skip over their own location when tabbing across the row.

**Real `disabled`, not `aria-disabled`.** When Prev or Next reaches an edge, it gets the native `disabled` attribute. That removes the button from the tab order and blocks `click` events. `aria-disabled` would keep the button tabbable and still firing clicks, requiring manual no-op handling for no benefit.

**Keyboard model.** No custom key handling — `Tab`/`Shift+Tab` walks the row, `Enter`/`Space` activates the focused button, `:focus-visible` paints a 2px outline. No roving tabindex, no arrow keys, no Home/End. Every button is already independently focusable; adding an arrow-key layer over a list with hidden ellipses creates more confusion than it solves.

## State Flow Diagram

```
                  ┌─────────────────────────┐
                  │ page (bindable)         │
                  │ totalPages, siblings    │
                  └────────────┬────────────┘
                               │
                               │ $derived
                               ▼
                  ┌─────────────────────────┐
                  │ items[]                 │
                  │ isFirst, isLast         │
                  └────────────┬────────────┘
                               │ render
                               ▼
                  ┌─────────────────────────┐
                  │ Prev | …pages… | Next   │
                  └────────────┬────────────┘
                               │
                               │ click
                               ▼
                  ┌─────────────────────────┐
                  │ goTo(target):           │
                  │   clamp to [1, total]   │
                  │   no-op if unchanged    │
                  │   else mutate `page`,   │
                  │   fire onChange         │
                  └────────────┬────────────┘
                               │
                               └──────────► (back to top — derived rebuilds)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | `1` | Current page (1-indexed). Bindable via `bind:page`. Clamped on every navigation to `[1, totalPages]`. |
| `totalPages` | `number` | `1` | Total number of pages. `0` and `1` both render a single page button. |
| `siblings` | `number` | `1` | Pages either side of the current page to render. Higher values widen the row before any ellipsis appears. |
| `size` | `'sm' \| 'md'` | `'md'` | Padding and font scale. |
| `prevLabel` | `string` | `'Prev'` | Visible text on the previous-page button (the announced label is always *"Go to previous page"*). |
| `nextLabel` | `string` | `'Next'` | Visible text on the next-page button. |
| `ariaLabel` | `string` | `'Pagination'` | `aria-label` on the wrapper `<nav>`. Override for non-English locales. |
| `onChange` | `(page: number) => void` | — | Fires after a navigation that actually changes the page. Useful for analytics, URL syncing, or data refetches. |
| `class` | `string` | `''` | Extra classes appended to the `<nav>`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `totalPages === 0` | The `total <= 1` guard fires and the component renders a single page button labelled `1`. No crash, no negative numbers. |
| `totalPages === 1` | Same as above — single button, both Prev and Next are disabled. |
| `page` outside `[1, totalPages]` | Every navigation clamps to the valid range. A caller passing `page = 999` with `totalPages = 10` will render the row for page 10 once `goTo` runs. The first render still uses the raw value, so callers should clamp before passing. |
| Click the active page | `goTo` short-circuits: `clamped === page`, so `page` doesn't mutate and `onChange` doesn't fire. Pure no-op. |
| `siblings = 0` | The current page is the only middle number. Layouts shrink to `1 2 3 4 … 20`, `1 … 4 … 20`, `1 … 17 18 19 20`. |
| `siblings` larger than `totalPages` | Falls through to the *"trail fits"* branch — every page is rendered, no ellipses. |
| User has `prefers-reduced-motion: reduce` | Hover-background transitions on buttons are disabled. The component is otherwise non-animated. |
| `bind:page` and `onChange` both supplied | Both run on every page change. `page` mutates first (so the binding settles synchronously), then `onChange(clamped)` fires. |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$state`, `$derived`, `$props`. The two-way `bind:page` flow is built on `$bindable`.
- Zero external dependencies — inline SVG arrow icons, pure CSS animation, no motion library.

## File Structure

```
src/lib/components/Pagination.svelte         # implementation
src/lib/components/Pagination.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Pagination.test.ts        # vitest unit tests
src/routes/pagination/+page.svelte           # demo page
```
