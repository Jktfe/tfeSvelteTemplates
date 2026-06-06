# BarChart

## What Does It Do? (Plain English)

BarChart draws a dependency-free SVG bar chart from a list of categories and a list of series. Each category is one group on the X axis (a quarter, a month, a region) and each series is one coloured bar within that group (Online vs Retail, say). It can lay the bars out side-by-side (**grouped**) or pile them on top of one another (**stacked**), works out a tidy Y axis on its own, animates the bars up from the baseline on first paint, and shows a tooltip when you hover or keyboard-focus a bar.

**Think of it like:** a spreadsheet chart that ships as a single `.svelte` file — you hand it rows and columns of numbers, it handles the axis maths, the colours, the labels, and the accessibility table underneath.

---

## How It Works (Pseudo-Code)

```
ON render:
  1. rawMax = computeRawMax(categories, mode)
       - stacked → tallest category TOTAL
       - grouped → single largest value anywhere
  2. scale = niceScale(rawMax, yTickCount)
       - round the tick step up to 1/2/5 × 10ⁿ
       - return { max, step, ticks[] } so gridlines land on round numbers
  3. FOR each tick: draw a gridline + a formatted axis label
  4. FOR each category:
       - work out the band x-position
       - IF stacked: stack each series on a running total
       - ELSE grouped: slice the band into one slot per series
       - draw a <rect> per value, height = (value / scale.max) × innerH
  5. AFTER first paint: flip `grown` → bars transition scaleY(0) → scaleY(1)
       (skipped entirely under prefers-reduced-motion)

ON hover / focus a bar:
  - setActive(category, series, value, x, y) → tooltip + dim the others

ON mouseleave / blur:
  - clearActive() → tooltip hidden, all bars full opacity
```

---

## The Nice-Scale Axis

The exported `niceScale(rawMax, tickCount)` helper is the brain of the Y axis. A naive axis dividing the data max by the tick count produces ugly labels like 13.7 or 412. Instead the helper takes the rough step, finds its order of magnitude, and snaps the multiplier to the nearest of 1, 2, 5 or 10 so the gridlines land on human-friendly values. The chart's `max` is then the data max rounded **up** to a whole number of those steps, guaranteeing the tallest bar always sits comfortably inside the plot rather than clipping the top gridline.

Because `niceScale` and `computeRawMax` are pure and exported from the module script, the test suite asserts the axis maths directly without mounting the component.

## Grouped vs Stacked Layout

The same `categories`/`series` data renders two ways off the single `mode` prop. In **grouped** mode each category's band is sliced into one slot per series, so bars sit shoulder-to-shoulder for direct per-series comparison. In **stacked** mode every series shares one wide bar and is offset by the running total of the series below it, so the bar's full height reads as the category total. `computeRawMax` accounts for this: stacked needs the tallest *sum*, grouped needs the tallest *single value*.

## Accessibility Model

The chart is not just a picture. A visually-hidden `<table>` mirrors every value with proper `<caption>`, column and row headers, so a screen reader can read the data linearly. Each bar `<rect>` is a focusable `role="button"` with an `aria-label` naming its category, series and formatted value, and an `aria-live="polite"` region announces the focused/hovered value. The grow animation is gated behind `prefers-reduced-motion` so motion-sensitive users see static bars.

---

## State Flow Diagram

```
                 mount
                   │
                   ▼
            grown = false ──(prefers-reduced-motion)──► grown = true (instant)
                   │
          requestAnimationFrame
                   │
                   ▼
            grown = true  → bars transition scaleY(0) → scaleY(1)

   ┌─────────────── activeBar = null (idle) ───────────────┐
   │                                                        │
hover/focus bar                                       mouseleave/blur
   │                                                        ▲
   ▼                                                        │
activeBar = { categoryIndex, seriesIndex, value, x, y } ────┘
   → tooltip shown, other bars dimmed, live region updated
```

---

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `categories` | `BarCategory[]` | `[]` | Each category (X-axis group) with `label` and a `values` array, one entry per series in series order. |
| `series` | `BarSeries[]` | `[]` | Series metadata: `name` (legend + label) and `colour` (bar fill). |
| `mode` | `'grouped' \| 'stacked'` | `'grouped'` | Bars side-by-side, or summed vertically. |
| `showValueLabels` | `boolean` | `false` | Draw the formatted numeric value above each bar / inside each stacked segment. |
| `showLegend` | `boolean` | `true` | Show the swatch + name legend above the plot. |
| `height` | `number` | `320` | SVG height in px; width is responsive to the container. |
| `yTickCount` | `number` | `5` | Target number of Y gridlines (the nice-scale may adjust). |
| `valueFormat` | `(n: number) => string` | `String` | Formatter applied to axis labels, value labels and the tooltip. |
| `title` | `string` | `'Bar chart'` | Accessible name and the hidden data-table caption. |

---

## Edge Cases

| Scenario | Behaviour |
| --- | --- |
| Empty `categories` | Axis renders with a `max` of 1 (`niceScale` guards `rawMax <= 0`); no bars drawn. |
| All values zero / negative | `computeRawMax` returns 0, axis falls back to `{ max: 1 }`; negative values clamp to height 0 (`Math.max(0, v)`). |
| `series` shorter than a category's `values` | Missing series fall back to colour `#888` and an `aria-label` of `Series N`. |
| `values` shorter than `series` | Hidden table renders `0` for the missing cell via `category.values[si] ?? 0`. |
| `prefers-reduced-motion: reduce` | Grow animation skipped; bars appear at full height immediately. |
| Very large numbers | `valueFormat` lets you compact them (e.g. `Intl.NumberFormat` with `notation: 'compact'`). |
| Stacked segment too short for a label | Label still centres in the segment; pass `showValueLabels={false}` for dense stacks. |

---

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, inline SVG and scoped CSS. No charting library, no icon library.

---

## File Structure

```
src/lib/components/
├── BarChart.svelte        ← component + exported niceScale / computeRawMax helpers
├── BarChart.md            ← this explainer (rendered in the page shell)
└── BarChart.test.ts       ← vitest unit + render + a11y tests

src/routes/barchart/
└── +page.svelte           ← demo page (ComponentPageShell)
```
