# Masonry

## What Does It Do? (Plain English)

Masonry takes a list of items of differing heights and packs them into a set of equal-width columns so the columns end up roughly the same height — no big ragged gaps at the bottom. It is the "Pinterest wall" layout.

**Think of it like:** loading a dishwasher. You don't just fill the first rack until it's full — you drop each dish into whichever rack currently has the most room, so everything ends up balanced.

Unlike the CSS `columns` property, Masonry never splits an item across a column boundary — each item is an indivisible block — and unlike a fixed CSS grid it doesn't leave a short card floating next to a tall one with dead space beneath it.

---

## How It Works (Pseudo-Code)

```
WHEN the component mounts:
  1. MEASURE the container width
  2. RESOLVE how many columns to use (fixed number, or the widest
     breakpoint in the responsive map that fits the container)
  3. RENDER items round-robin as a first guess (item i → column i % cols)
  4. MEASURE the pixel height of every rendered item
  5. RE-PACK using the measured heights (see "Height-Balanced Columns")

WHEN the container OR any item resizes (e.g. an image finishes loading):
  1. ResizeObserver fires
  2. RE-MEASURE the container width and item heights (coalesced into one rAF)
  3. numCols and the packing recompute reactively
  4. Items reflow into their new columns

WHEN the component unmounts:
  1. DISCONNECT the ResizeObserver
```

---

## The Core Concept: Height-Balanced Columns

The packing rule is deliberately simple: **always give the next item to the column that is currently shortest.**

```
heights = [0, 0, 0]          # running height per column
FOR each item in source order:
  shortest = index of the smallest value in `heights`
  place item into column `shortest`
  heights[shortest] += itemHeight + gap
```

Why this is stable and correct:

- **Equal widths.** Every column is `flex: 1 1 0`, so all columns share the same width. An item's rendered height therefore does **not** depend on which column it lands in. That means the measurement taken during the round-robin first pass is already the final height — the re-pack converges in a single pass with no oscillation.
- **Source order per column.** Because we iterate items in source order and only ever *append* to a column, the items within any one column always read top-to-bottom in ascending source index. Reading order is preserved down each column.
- **Ties go left.** When two columns are equally short, the lowest index wins, which keeps the layout deterministic (and fills left-to-right, matching reading direction).

```
Source: [A(tall)  B(short)  C(short)  D(tall)  E(short)]

col0    col1    col2
────    ────    ────
A       B       C
D       E       (C was shortest-so-far when E arrived? no —
                 after B,C,D placed, col1 & col2 are shortest,
                 so E lands next to the shortest)
```

---

## Performance

- **One measure pass per resize.** Heights are read in a single `requestAnimationFrame` after ResizeObserver fires, so a burst of resize events collapses into one layout read. The packing loop is `O(items × columns)` — negligible for the few-hundred-item range this primitive targets.
- **No per-item width maths on the main thread.** Column widths come entirely from flexbox (`flex: 1 1 0`), so the JavaScript only ever *reads* heights, never writes geometry.
- **The observer watches items too, not just the container.** Late-loading images are the classic masonry failure mode: the layout balances against a zero-height `<img>`, then the image pops in and wrecks the balance. Observing each item element means the image's resize re-triggers a re-pack automatically.
- **Guarded commits.** `measure()` only writes to state when a height actually changed (>0.5px), so identical re-measures don't cause needless re-renders.

---

## State Flow Diagram

```
                 ┌────────────────────────┐
                 │        MOUNTED         │
                 │  round-robin fallback  │
                 │  (heights unmeasured)  │
                 └───────────┬────────────┘
                             │ measure() reads item heights
                             ▼
                 ┌────────────────────────┐
                 │        BALANCED        │
                 │  shortest-column pack  │
                 └───────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │ container resizes  │ item/image resizes  │ items prop changes
        ▼                    ▼                     ▼
 ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
 │ width → new  │   │ height → re-pack │   │ re-render → new  │
 │ numCols      │   │ same columns     │   │ refs → re-observe│
 └──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
        └────────────────────┴──────────────────────┘
                             │
                             ▼
                    (back to BALANCED)

              UNMOUNT → ResizeObserver.disconnect()
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | The items to distribute across columns (generic over `T`). |
| `item` | `Snippet<[T, number]>` | — | Renders a single item; receives the item and its source index. |
| `columns` | `number \| Partial<Record<Breakpoint, number>>` | `3` | A fixed column count, or a responsive map like `{ base: 1, sm: 2, lg: 3 }`. |
| `gap` | `number` | `16` | Gap in pixels between columns and between stacked items. |
| `class` | `string` | `''` | Extra CSS class on the container. |

`Breakpoint` is one of `base` (0px), `sm` (640), `md` (768), `lg` (1024), `xl` (1280), `2xl` (1536) — Tailwind's defaults. The widest breakpoint whose min-width fits the container wins.

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `items` array | Renders the requested number of empty columns; no item nodes. |
| Fewer items than columns | Extra columns render empty; items fill left-to-right. |
| `columns` given as a number < 1 | Clamped to a minimum of 1 column. |
| Responsive map with gaps (e.g. only `base` + `lg`) | Missing breakpoints inherit the nearest smaller defined value. |
| Late-loading images | Item ResizeObserver re-triggers a re-pack once the image lands. |
| Server-side render / pre-measure | Falls back to round-robin distribution, still in correct source order. |
| `prefers-reduced-motion: reduce` | The item mount fade is suppressed entirely. |

---

## Dependencies

- **Zero external dependencies.** Svelte 5 runes plus the native `ResizeObserver` only.
- Column widths are pure flexbox; no polyfills or measurement libraries.

---

## File Structure

```
Masonry.svelte      # The component (inline Props interface)
Masonry.test.ts     # Unit tests
Masonry.md          # This explainer
```
