# DonutChart

## What Does It Do? (Plain English)

DonutChart turns an array of `{ label, value, colour }` into a ring of coloured wedges,
drawn entirely with SVG. It works out each slice's share of the whole, paints it as an arc,
and lists every slice in a legend with its raw value and computed percentage. Hovering or
tab-focusing a wedge raises it slightly and pops a tooltip; in donut mode the empty middle
shows a headline figure (a total, a target, whatever you pass as `centreLabel`).

The same component renders a pie chart: there is no separate "pie" mode flag. A pie is simply
a donut whose ring is as thick as its radius, so the hole disappears. Set `thickness` to
half the `size` (or larger) and you get a solid pie; leave it small and you get a donut.

## How It Works (Pseudo-Code)

```
total = sum(max(0, value) for each slice)

for each slice:
    fraction   = slice.value / total
    arcLength  = fraction * circumference        # of the centre-line circle
    visible    = arcLength - gap                 # shrink so wedges read as separate
    draw a full <circle> with:
        stroke-dasharray  = "visible (circumference - visible)"
        stroke-dashoffset = -cursorSoFar         # rotate this wedge into place
    cursorSoFar += arcLength

rotate the whole <g> by -90deg so slice 0 starts at 12 o'clock
```

Every wedge is the *same* full circle; only its dash pattern differs. The `dasharray` makes
just `visible` units of stroke paint, and `dashoffset` slides that painted segment around the
ring so each slice lands after the previous one.

## The Core Concept: One Circle, Many Dashes

A naïve donut draws SVG `<path>` arcs with trigonometry for each wedge's start/end points.
DonutChart avoids that maths entirely. It stacks N identical `<circle>` elements, all sharing
the same centre and radius, and uses `stroke-dasharray` / `stroke-dashoffset` to reveal a
different slice of each. Because a circle's circumference is a known constant
(`2 × π × r`), turning a percentage into a dash length is a single multiply — no `sin`/`cos`,
no path-string building, no rounding artefacts where arcs meet.

This is also why donut-vs-pie is a continuous knob rather than two code paths: `thickness`
maps straight to the SVG `stroke-width`, and a thick enough stroke fills the hole.

## CSS Animation Strategy

Raising a slice is a `transform: scale(1.06)` on the focused/hovered `<circle>`, with
`transform-box: fill-box` and `transform-origin: center` so it scales out from its own
centre rather than the SVG origin. Non-active slices fade to `opacity: 0.4` so the raised
wedge stands out. All of this lives in the `transition` shorthand and is fully removed
under `@media (prefers-reduced-motion: reduce)`, leaving an instant state change.

## State Flow Diagram

```
            hover / focus slice i ──► active = i
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
   slice i scales up            other slices dim           tooltip + centre
   (.donut__seg--active)        (.donut__seg--dim)         show slice i details

            mouseleave / blur ──► active = null ──► all slices return to rest,
                                                    centre shows centreLabel again
```

## Props Reference

| Prop          | Type           | Default          | Description                                                        |
|---------------|----------------|------------------|--------------------------------------------------------------------|
| `data`        | `DonutSlice[]` | `[]`             | Slices, each `{ label: string; value: number; colour: string }`.   |
| `thickness`   | `number`       | `26`             | Ring thickness in px. When `>= size / 2` the hole closes (pie).    |
| `size`        | `number`       | `220`            | Chart width and height in px.                                       |
| `centreLabel` | `string`       | `''`             | Headline shown in the donut hole. Ignored in pie mode.             |
| `centreSub`   | `string`       | `''`             | Smaller caption beneath the centre label.                          |
| `showLegend`  | `boolean`      | `true`           | Render the legend (values + percentages) next to the chart.        |
| `gap`         | `number`       | `1.5`            | Gap between slices, as a percent of the circumference.             |
| `ariaLabel`   | `string`       | auto-generated   | Override the figure's `aria-label`; defaults to a slice summary.   |

## Edge Cases

| Situation                         | Behaviour                                                                 |
|-----------------------------------|--------------------------------------------------------------------------|
| `data` empty or `total === 0`     | Renders just the faint track circle; legend and tooltip suppressed.      |
| Negative values                   | Clamped to `0` via `Math.max(0, value)` before totalling.                |
| Very thin slice + large `gap`     | Gap is clamped to half the slice so the wedge never vanishes completely. |
| `thickness >= size / 2`           | Treated as a solid pie; the centre label is hidden (no hole to fill).    |
| Single slice                      | Fills the whole ring (one wedge at 100%).                                |
| Duplicate labels                  | Keyed by `label + index`, so repeats still render distinctly.            |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, scoped CSS, and inline SVG. No charting
library, no canvas, no icon set.

## File Structure

```
src/lib/components/DonutChart.svelte   — component (arc maths, legend, tooltip, a11y)
src/lib/components/DonutChart.md       — this explainer (rendered in the page shell)
src/lib/components/DonutChart.test.ts  — vitest + @testing-library/svelte coverage
src/routes/donutchart/+page.svelte     — demo page (donut, pie, and live variants)
```
