# CalendarHeatmap — Technical Logic Explainer

## What Does It Do? (Plain English)

The GitHub contribution calendar, rebuilt from first principles. Pass it an array of `{ date, value }` records and it renders a 7-row × N-week SVG grid where each cell's colour intensity reflects its value. Hover any cell for a tooltip with the formatted date and count. Tab into the grid and arrow-key around it. The whole thing is one SVG, zero external dependencies, and copy-paste portable.

Think of it as a year-at-a-glance heat ribbon: weeks march left-to-right, days run top-to-bottom (Sunday at the top), and colour scales from "nothing happened" through five discrete shades to "lots happened". Useful for activity calendars, streak trackers, traffic dashboards, or any time-series where the eye benefits from spatial periodicity (you can immediately spot weekday vs weekend patterns).

## How It Works (Pseudo-Code)

```
state:
  tooltip      = { visible: false, x: 0, y: 0, text: '' }
  focusedCell  = null                      // { weekIndex, dayIndex } when keyboard-active

derive dataMap (from data):
  for each entry in data: map.set(entry.date, entry.value)
  // O(1) lookup by ISO date string

derive maxValue (from data):
  return max(data.map(d => d.value), 1)    // 1 floor avoids divide-by-zero

derive colorPalette (from colorLow, colorHigh, levels):
  palette = [colorLow]                     // level 0
  for i from 1 to levels-1:
    factor = i / (levels-1)
    palette.push(interpolateColor(colorLow, colorHigh, factor))
  return palette                           // length === levels

derive calendarWeeks (from startDate, endDate, dataMap):
  firstDay = nearest Sunday on or before startDate
  weeks = []
  while currentDate <= endDate:
    week = []
    for d from 0 to 6:
      if currentDate in [startDate, endDate]:
        week.push({ date, value: dataMap.get(toISODate(date)) ?? 0 })
      else:
        week.push(null)                    // padding for partial start/end weeks
      currentDate += 1 day
    weeks.push(week)
  return weeks                             // 2D grid

derive monthLabels (from calendarWeeks):
  walk weeks left-to-right; emit a label whenever the month flips

render:
  <svg>
    {#each monthLabels} <text> {/each}              // top row: Jan, Feb, …
    {#each WEEKDAY_LABELS} <text> {/each}           // left column: Mon, Wed, Fri
    {#each calendarWeeks as week, weekIndex}        // 52 columns
      {#each week as cell, dayIndex}                // 7 rows
        <rect fill={getCellColor(cell.value)}> with mouse + keyboard handlers
  </svg>
  {#if tooltip.visible} absolute-positioned div {/if}
  {#if showLegend} Less <swatches> More {/if}

events:
  on cell mouseenter: position tooltip near cursor, format text
  on cell mouseleave: hide tooltip
  on cell click: onCellClick?.(isoDate, value)
  on Arrow keys: shift focusedCell within grid bounds
  on Enter / Space on focused cell: same as click
```

## Core Concept: The Grid Algorithm + Discrete Colour Banding

Two algorithms make this component work, and both are simple but easy to get wrong.

### Building the grid

GitHub's calendar always starts a column on Sunday and always shows full weeks, even if the date range begins mid-week. The algorithm:

1. Take the `startDate` and walk **backwards** to the nearest Sunday — that's the top-left cell of column 0.
2. Walk forward seven days at a time, building each column as an array of seven `{ date, value }` cells. Out-of-range cells (before `startDate` or after `endDate`) become `null` so the grid remains rectangular but doesn't render fake data.
3. Stop when the current date exceeds `endDate` and the in-progress column is full.

This means the **first and last columns are often padded** with `null` cells. The `{#if cell}` check in the template skips those slots, leaving visual gaps that match GitHub's behaviour exactly.

### Colour banding

Linear gradient interpolation produces 256 shades per channel — way too many for the eye to distinguish at 12 px square. We band them into discrete levels (default 5):

```
level(value) = value === 0 ? 0
             : min(ceil((value / maxValue) × (levels - 1)), levels - 1)
```

Then map each level to a colour by interpolating `colorLow → colorHigh` at `factor = level / (levels - 1)`. The interpolation is straight RGB linear blend per channel — no gamma correction, no LCH, just `r1 + factor × (r2 - r1)`. For the small gamut shifts in a typical heatmap (light grey → dark green), linear RGB looks correct enough that fancier colour spaces aren't worth the bytes.

The `value === 0` short-circuit is intentional: zero activity should always be the lowest colour, regardless of the rest of the dataset's distribution. Without it, a single huge spike could push every other day into level 0 and obliterate visual contrast.

`colorLow` and `colorHigh` are parsed by a small dispatcher that handles `#fff`, `#ffffff`, `#ffffff80` (alpha discarded), `rgb(...)`, `rgba(...)`, and a short list of named colours (`black`, `white`, `red`, …). Anything else returns `null` and the interpolation gracefully falls back to `colorLow`.

## Performance

The whole component runs at **render time and never animates**. There's no rAF loop, no resize observer, no force simulation. Everything is a `$derived` computed once when its inputs change.

Cost per render with the default 365-day range:

- `dataMap` build: O(n) where n = `data.length` — typically <365.
- `calendarWeeks` build: O(weeks × 7) ≈ O(52 × 7) = 364 cells. Each is a Date construction and a Map lookup. Sub-millisecond.
- `colorPalette` build: O(levels) — 5 RGB blends.
- DOM render: ~365 `<rect>` elements + month/weekday labels + legend. SVG handles this in a single paint.

The visible bottleneck (if there is one) is the **mouseenter/mouseleave** firing on every cell — 364 elements × two listeners per cell. We attach handlers per-rect rather than using event delegation; with a few hundred elements the difference is invisible. If you push to multi-year ranges (1 000+ cells) and notice tooltip jank, switch to a single delegated listener on the `<svg>` and look up the cell from the event target — but for typical use, the per-cell handler model is simpler and identical-feeling.

`SvelteMap` and `SvelteDate` are used for the data map and the iteration cursor — these are the reactive equivalents from `svelte/reactivity`. They cost slightly more than native `Map` / `Date` but keep the `$derived` chain reactive when the underlying state changes (e.g., if the parent passes a different `data` array).

## State Flow Diagram

```
                ┌──────────────────────┐
                │  empty / no data     │  data === []
                │  grid renders, all   │
                │  cells level 0       │
                └──────────┬───────────┘
                           │
                           │ parent passes data
                           ▼
                ┌──────────────────────┐
                │  rendered            │
                │  cells coloured by   │
                │  level(value)        │
                └──────────┬───────────┘
                           │
              ┌────────────┼─────────────────┐
              │ hover cell │ click cell      │ Tab into grid
              ▼            ▼                 ▼
       ┌──────────┐  ┌──────────────┐  ┌────────────────┐
       │ tooltip  │  │ onCellClick  │  │ focusedCell =  │
       │ visible  │  │ fired        │  │ {0,0}          │
       └────┬─────┘  └──────┬───────┘  └────────┬───────┘
            │ mouseleave    │                   │ arrow keys
            ▼               │                   ▼
       ┌──────────┐         │            ┌────────────────┐
       │ tooltip  │         │            │ focusedCell    │
       │ hidden   │         │            │ updated within │
       └──────────┘         │            │ grid bounds    │
                            │            └────────┬───────┘
                            │                     │ Enter/Space
                            │                     ▼
                            │              ┌──────────────┐
                            └─────────────►│ onCellClick  │
                                           │ fired        │
                                           └──────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CalendarDataPoint[]` | `[]` | Array of `{ date: string, value: number }` records. Dates are ISO `YYYY-MM-DD`. |
| `startDate` | `Date` | 365 days before `endDate` | First date to display. Grid is padded back to the previous Sunday. |
| `endDate` | `Date` | today | Last date to display. |
| `colorLow` | `string` | `'#ebedf0'` | Colour for empty / level-0 cells. Hex, rgb, rgba, or named. |
| `colorHigh` | `string` | `'#216e39'` | Colour for the highest level. Same formats as `colorLow`. |
| `cellSize` | `number` | `12` | Pixel size of each square. |
| `cellGap` | `number` | `3` | Pixel gap between squares. |
| `showWeekLabels` | `boolean` | `true` | Render `Mon`, `Wed`, `Fri` on the left axis. |
| `showMonthLabels` | `boolean` | `true` | Render month abbreviations along the top. |
| `showLegend` | `boolean` | `true` | Render the `Less … More` swatch row below the grid. |
| `levels` | `number` | `5` | Number of discrete colour bands. Includes level 0 (empty). |
| `tooltipFormatter` | `(date: string, value: number) => string` | `undefined` | Custom tooltip text. Defaults to `"{full date}: {n} contribution(s)"`. |
| `onCellClick` | `(date: string, value: number) => void` | `undefined` | Fires on click and on Enter/Space when the cell is keyboard-focused. |
| `class` | `string` | `''` | Extra classes appended to the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `data === []` | Grid renders, all cells are `colorLow`. Legend still shows. No errors. |
| Single datum | Grid renders with one coloured cell at level `levels - 1` (since `value === maxValue`). Every other cell is level 0. |
| Date in `data` outside the `startDate`–`endDate` range | Silently ignored. The `dataMap` still stores it, but no grid cell looks it up. |
| Duplicate dates in `data` | Last entry wins (Map semantics). |
| `startDate > endDate` | Grid renders empty (the while-loop exits immediately). No exception. |
| `colorLow` or `colorHigh` is unparseable | Interpolation returns `colorLow` for every level — grid appears flat. Use a hex colour to be safe. |
| Multi-year range (e.g. 1 095 days) | Grid grows wide; container has `overflow-x: auto` and `-webkit-overflow-scrolling: touch` so it scrolls horizontally on mobile. |
| User has `prefers-reduced-motion: reduce` | Hover stroke transition is disabled; everything else (which is already non-animated) is unchanged. |
| Tooltip near right edge | Positioned by raw `clientX/Y - container.left/top` minus 10 px. May clip on the right; if you need clamping, add a max-width to `.tooltip` or compute clamp logic. |
| Cell with no data (value defaults to 0) | Renders at level 0; ARIA label still says `"YYYY-MM-DD: 0 contributions"`. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived.by` for the calendar grid pipeline.
- **`svelte/reactivity`** — `SvelteMap`, `SvelteDate` keep the date iteration and lookup map reactive when the parent passes new data.
- Zero external runtime dependencies. The grid is one `<svg>`, the tooltip is one `<div>`, the colour parser is hand-rolled in ~30 lines.

## File Structure

```
src/lib/components/CalendarHeatmap.svelte    # implementation
src/lib/components/CalendarHeatmap.test.ts   # unit tests
src/lib/components/CalendarHeatmap.md        # this file
src/routes/calendarheatmap/+page.svelte      # demo page
src/lib/types.ts                             # CalendarHeatmapProps, CalendarDataPoint
src/lib/constants.ts                         # sample data fixtures (where applicable)
```
