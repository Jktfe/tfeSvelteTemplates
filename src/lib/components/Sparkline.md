# Sparkline

## What Does It Do? (Plain English)

A Sparkline is a tiny, word-sized chart that lives inline — in a table cell, beside a number on a stat card, or tucked into a dashboard tile. It strips a chart down to its essence: just the shape of the trend, no axes, no gridlines, no legend. You hand it an array of numbers and it draws a single line showing how they move from left to right.

**Think of it as** a heart-rate trace on a hospital monitor: at a glance you read the rhythm — climbing, falling, steady — without ever caring about the exact tick marks.

## How It Works (Pseudo-Code)

```
inputs:
  data    = [ ...numbers ]
  width, height
  min, max          (optional overrides)

derive clean:
  keep only finite numbers from data

derive scale:
  lo = min ?? Math.min(clean)
  hi = max ?? Math.max(clean)
  span = hi - lo

derive points:
  for each value v at index i:
    x = pad + (i / (count - 1)) * innerWidth
    t = span == 0 ? 0.5 : (v - lo) / span     // flat series → centre line
    y = pad + (1 - t) * innerHeight            // invert: SVG y grows downward

render:
  if count >= 2 → <polyline points={points}>
  if count == 1 → <circle> at the single point
  if fill       → <path> closing line down to baseline
  if last       → <circle> on final point

aria-label:
  "Trend up/down/flat from {first} to {last}, +/-{pct}%"
```

## The Core Concept: Auto-Scaling To The Data Range

The job of a sparkline is to use every available pixel of its little box. It does this by mapping the data's own minimum and maximum onto the box's vertical extent, rather than anchoring to zero like a bar chart.

Given a value `v`, a domain `[lo, hi]`, and an inner drawing height `innerH`:

```
t = (v - lo) / (hi - lo)     // normalise to 0..1
y = pad + (1 - t) * innerH   // 0 sits at the bottom, 1 at the top
```

The `(1 - t)` inversion matters because SVG's y-axis grows **downward** — without it, your highest revenue month would plot at the floor.

Two awkward inputs are handled explicitly. A **single point** would make `i / (count - 1)` divide by zero, so it is pinned to the left edge and drawn as a dot. A **flat series** has `span === 0`, which would divide by zero in `t`; instead `t` is forced to `0.5` so the line rests on the vertical centre rather than vanishing against the top edge.

Passing `min` and `max` opts out of auto-scaling. This is essential when you render a column of sparklines that must be visually comparable — pin them to a shared domain (e.g. `min={0} max={100}`) so a tall spike in one row genuinely means a bigger number than a flat line in another.

## CSS Animation Strategy

The line draws itself in using the classic `stroke-dasharray` / `stroke-dashoffset` trick: the dash is set longer than the path, then the offset animates from `1000` to `0`, revealing the stroke left-to-right over 0.8s. Only `stroke-dashoffset` animates, which the browser can composite without re-layout.

Under `prefers-reduced-motion: reduce` the animation is removed and `stroke-dasharray` is reset to `none`, so the full line is painted instantly with no movement.

## Browser Support

Everything here is plain SVG 1.1 plus CSS custom properties — universally supported across evergreen browsers and back to IE-era SVG rendering. The one detail worth naming is `vector-effect: non-scaling-stroke`, which keeps the 1.5px line crisp even though `preserveAspectRatio="none"` stretches the viewBox non-uniformly to fill its container. It is supported in all modern browsers; where it is absent the stroke simply scales with the box (slightly thicker on wide cards), which degrades gracefully.

## State Flow Diagram

Sparkline is a pure presentational component — its "state" is entirely derived from the `data` prop, so the diagram tracks which branch of the render renders.

```
                 data prop changes
                        │
                        ▼
              ┌── filter finite ──┐
              │                   │
        clean.length         clean.length
           == 0                 == 1
              │                   │
              ▼                   ▼
        [empty svg]          [single dot]
              ▲                   ▲
              │                   │
              └──── clean.length >= 2 ─────┐
                                           ▼
                                   [polyline drawn]
                                    │          │
                              fill=true    last=true
                                    │          │
                                    ▼          ▼
                              [+ area path] [+ end dot]
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | `[]` | The series to plot, left to right; non-finite entries are dropped. |
| `width` | `number` | `120` | SVG viewBox width in user units. |
| `height` | `number` | `32` | SVG viewBox height in user units. |
| `stroke` | `string` | `'currentColor'` | Line and dot colour; accepts any CSS colour. |
| `fill` | `boolean` | `false` | Draw a soft translucent area beneath the line. |
| `last` | `boolean` | `false` | Render a dot on the final data point. |
| `min` | `number \| undefined` | `undefined` | Override the scale minimum to pin the baseline. |
| `max` | `number \| undefined` | `undefined` | Override the scale maximum to pin the ceiling. |
| `label` | `string` | `''` | Prefix for the computed `aria-label` (e.g. the metric name). |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `data` is empty (`[]`) | Renders an empty SVG of the correct size; `aria-label` reads "No data". |
| `data` has exactly one value | Plots a single dot at the left edge; `aria-label` reads "Single value N". |
| All values are equal (flat series) | Line sits on the vertical centre rather than the top edge. |
| `data` contains `NaN` / `Infinity` | Those entries are silently filtered out before scaling. |
| First value is `0` | Percentage change is omitted from the label (division by zero avoided). |
| `min`/`max` set tighter than the data | Values still plot; points beyond the domain extend past the box (overflow visible). |
| `prefers-reduced-motion: reduce` | The draw-in animation is suppressed; the line appears instantly. |

## Dependencies

- Zero external dependencies — pure Svelte 5.

## File Structure

```
src/lib/components/Sparkline.svelte    # implementation (SVG + scoped CSS)
src/lib/components/Sparkline.md         # this file (rendered inside ComponentPageShell)
src/lib/components/Sparkline.test.ts    # vitest unit tests
src/routes/sparkline/+page.svelte       # demo page
```
