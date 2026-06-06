# LineChart

## What Does It Do? (Plain English)

LineChart draws one or more lines over a shared X axis using nothing but inline
SVG. You hand it an array of series — each with a name, a colour, and a list of
`{ x, y }` points — and it works out a tidy value scale, lays out gridlines and
tick labels, and renders a crisp, responsive chart that resizes with its
container.

Hovering (or arrowing) across the plot snaps a vertical crosshair to the nearest
X position and pops a tooltip listing every series' value at that point. For
screen-reader users the same numbers are mirrored in a visually-hidden data
table, so the chart is never a dead-end for assistive technology.

It is deliberately dependency-free: no D3, no charting library, no icon set —
just Svelte 5 runes, scoped CSS, and SVG geometry you can read and tweak.

## How It Works (Pseudo-Code)

```
on mount:
  observe container width with ResizeObserver → containerWidth

derive geometry:
  width   = max(containerWidth, 240)
  innerW  = width  − marginLeft − marginRight
  innerH  = height − marginTop  − marginBottom

derive xValues:
  collect every point.x across all series → dedupe → sort ascending
  (these are evenly-spaced categorical slots)

derive yScale (nice-scaled):
  find data min / max across all series
  span  = niceNum(max − min)
  step  = niceNum(span / (yTicks − 1), round=true)   // 1 / 2 / 5 × 10ⁿ
  niceMin = floor(min / step) × step
  niceMax = ceil (max / step) × step
  ticks   = [niceMin, niceMin+step, … , niceMax]

map to pixels:
  xPos(x) = marginLeft + index(x)/(n−1) × innerW
  yPos(y) = marginTop  + (1 − (y−min)/(max−min)) × innerH   // SVG y is inverted

render:
  for each yTick → gridline + Y label
  draw the two axis baselines + X labels
  for each series → <path d="M …" /> + optional dots
  if active → crosshair line + HTML tooltip overlay
  always → legend + visually-hidden <table>  // role="application", focusable surface

interaction:
  pointermove → activeIndex = nearest xValue to cursor
  ArrowLeft/Right → step activeIndex; Home/End → first/last; Escape → clear
```

## The Core Concept: Nice-Scaled Axes

A naive chart maps the raw data min/max straight onto the plot edges, which
produces ugly axis labels like `13.7` or `1284`. LineChart instead runs a
"nice number" algorithm (the same idea behind most plotting libraries): it
rounds the data range out to the nearest `1`, `2`, `5` or `10` times a power of
ten, then chooses a step that yields roughly `yTicks` gridlines. The result is
human-friendly labels (`0, 5, 10, 15, 20`) and a baseline that snaps to zero
when the data naturally includes it.

## CSS Animation Strategy

There is very little motion by design — charts should feel solid, not jittery.
The only transition is the active data dot growing from `r=3` to `r=5`, which is
suppressed under `prefers-reduced-motion: reduce`. Stroke widths use
`vector-effect: non-scaling-stroke` so that lines, gridlines and the crosshair
stay exactly 1–2px crisp no matter how the `viewBox` is stretched by the
responsive container — the SVG scales geometry, not stroke pixels.

## Performance

The chart re-derives geometry only when its inputs change (`$derived`), and the
ResizeObserver is the single source of width updates — there is no scroll or
resize listener storm. Rendering cost is `O(points)` for the lines plus
`O(points)` for the dots; with a few hundred points per series it stays well
within a single frame. For very dense datasets, set `showDots={false}` to halve
the node count, and consider down-sampling before passing data in.

## State Flow Diagram

```
          ┌──────────────────────────────┐
          │   idle (activeIndex = null)   │
          └──────────────────────────────┘
              │ pointermove / ArrowRight        │ pointerleave / blur / Escape
              ▼                                  ▲
          ┌──────────────────────────────┐      │
          │  active (activeIndex = i)     │──────┘
          │  • crosshair at xValues[i]    │
          │  • tooltip lists each series  │
          │  • matching dot enlarges      │
          └──────────────────────────────┘
              │ ArrowLeft/Right → clamp(i ± 1)
              │ Home → 0   •   End → last
              ▼
          (stays active, index moves)
```

## Props Reference

| Prop         | Type                     | Default          | Description                                                        |
| ------------ | ------------------------ | ---------------- | ------------------------------------------------------------------ |
| `series`     | `LineSeries[]`           | `[]`             | Array of `{ name, colour, points: { x, y }[] }`.                   |
| `height`     | `number`                 | `320`            | Plot height in px. Width is responsive to the container.           |
| `xLabel`     | `string`                 | `''`             | Title rendered beneath the X axis (also the table's X header).     |
| `yLabel`     | `string`                 | `''`             | Title rendered rotated beside the Y axis.                          |
| `yTicks`     | `number`                 | `5`              | Target number of Y gridlines; the nice-scale picks the real count. |
| `showDots`   | `boolean`                | `true`           | Draw a marker at each data point.                                  |
| `showLegend` | `boolean`                | `true`           | Show the colour-swatch legend below the chart.                     |
| `formatX`    | `(x: number) => string`  | `String`         | Formats X tick + tooltip labels.                                   |
| `formatY`    | `(y: number) => string`  | compact (`12k`)  | Formats Y tick + tooltip values.                                   |
| `ariaLabel`  | `string`                 | auto-generated   | Accessible name for the chart image + table caption.               |
| `class`      | `string`                 | `''`             | Extra class on the wrapper.                                        |

`LineSeries` and `LinePoint` are declared inline in the component:

```ts
interface LinePoint { x: number; y: number; }
interface LineSeries { name: string; colour: string; points: LinePoint[]; }
```

## Edge Cases

| Case                                   | Behaviour                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `series` is empty                      | Renders a centred "No data to display." message; no SVG, legend or table.     |
| A single point / single x-value        | The point is centred horizontally rather than pinned to the left edge.        |
| All y-values identical (flat line)     | The scale pads above and below so the line sits mid-plot, not on an edge.     |
| A series skips an x-value present in others | Its tooltip and table cell show `—`; the path simply omits that segment. |
| Negative values                        | Handled by the nice-scale; the zero baseline is included when natural.        |
| `ResizeObserver` unavailable           | Falls back to the initial 640px width; chart still renders (test-safe).       |
| Cursor between two points              | Crosshair snaps to whichever x-pixel is nearest — never lands between slots.  |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, scoped CSS, and inline SVG.
The only platform API used is `ResizeObserver`, which is guarded so the
component still renders where it is absent (e.g. SSR / jsdom).

## File Structure

```
src/lib/components/
  LineChart.svelte      ← component (geometry, nice-scale, crosshair, a11y table)
  LineChart.md          ← this explainer
  LineChart.test.ts     ← vitest + @testing-library/svelte coverage
src/routes/linechart/
  +page.svelte          ← demo page wrapped in ComponentPageShell
```
