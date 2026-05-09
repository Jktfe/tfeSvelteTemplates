# Gantt — Technical Logic Explainer

## What Does It Do? (Plain English)

Gantt draws a project schedule as a row of horizontal bars on a date axis. Each bar is one task; its position shows when it starts, its length shows how long it takes, and a darker overlay shows how much is done. Diamonds mark instant events ("kick-off", "ship"). Arrows between bars show what blocks what. A dashed red line marks today.

Think of it as a calendar laid on its side: instead of one row per day, you get one row per task, and the days run left-to-right. It's the picture project managers reach for to answer "what are we working on, what's next, and what's stuck waiting on something else?"

## How It Works (Pseudo-Code)

```
state:
  tasks = props.tasks
  chartStart = startDate ?? min(task.start)
  chartEnd   = endDate   ?? max(task.end)
  totalDays  = days(chartStart, chartEnd) + 1
  today      = startOfDay(now)

derived layout per task:
  startOffset = days(chartStart, task.start)
  span        = days(task.start, task.end) + 1
  x = startOffset * dayWidth
  y = rowIndex * rowHeight + 6
  width = span * dayWidth - 4
  if task.isMilestone:
    render diamond at (x + dayWidth/2, y + rowHeight/2)
  else:
    render bar(x, y, width, rowHeight - 12)
    if task.progress > 0:
      render progress overlay(x, y, width * progress/100)

derived weekend bands:
  for each day in [chartStart .. chartEnd]:
    if day is Sat or Sun: shade column

derived dependency arrows:
  for each task t with t.dependencies = [a, b, …]:
    for each dep id in t.dependencies:
      from = layoutById[dep] (right edge)
      to   = layoutById[t.id] (left edge)
      draw elbow path: from → mid → to (with arrowhead)

events:
  on bar/diamond click: onTaskClick(task)
  on bar/diamond Enter or Space when role=button: same
  on Tab into chart-scroll: focus the scroll viewport so arrow keys can pan it
```

## The Core Concept: Day-Based Pixel Math, Once

Gantt charts are deceptive: they look like they need a charting library because there are bars, axes, headers, arrows, today markers, and dependencies. But every visual element on the chart can be computed from a single conversion — **how many days from the chart's start is this date?** — multiplied by `dayWidth`.

```
function dayOffset(date) {
  return days(chartStart, startOfDay(date));
}

x  = dayOffset(task.start) * dayWidth;
w  = (days(task.start, task.end) + 1) * dayWidth;
```

That's it. Headers, weekend bands, today line, milestone diamonds, and dependency arrow endpoints are all just `dayOffset(date) * dayWidth` plus a small margin. Because the chart renders to SVG, sub-pixel positioning is exact and there's no need to round to grid lines or recalculate on resize — the SVG just scales the underlying viewport.

The only thing the layout pass needs *besides* the day math is the row index, which is the task's position in the input array (`tasks[i]` ⇒ row `i`). So the entire layout is `O(tasks)`, and rebuilding it when `tasks` changes is a single map. The `$derived` runes wire that up: change a task's start date and the affected bar, its weekend backdrop, and any arrows pointing to or from it move in the same render.

This is why a native SVG Gantt is small — about 320 lines of script — even though it shows weekends, today, milestones, % complete, and elbow-routed dependency arrows. Most of the apparent complexity collapses into the same `dayOffset * dayWidth` expression repeated in different contexts.

## Dependency Arrows: Elbow Routing

Each `task.dependencies` entry produces an SVG `<path>` with finish-to-start semantics: it starts at the right edge of the dependency's bar and ends at the left edge of the dependent's bar. Direct lines look like spaghetti as soon as two arrows cross; the standard fix is the same one circuit-board layout tools use — **elbow routing**.

```
M  startX           startY              ← right edge of dep bar
L  startX + turn    startY              ← step right by `turn`
L  startX + turn    midY                ← step vertically to the midpoint
L  endX   - turn    midY                ← step horizontally
L  endX   - turn    endY                ← step vertically again
L  endX             endY                ← finish at the dependent's left edge
```

`turn` is `max(8, dayWidth/2)` so arrows don't visually merge when `dayWidth` is small. The arrowhead is an SVG `<marker>` with `orient="auto-start-reverse"` so it always points along the path direction — which means the same arrowhead works whether the dependent task is above, below, or to the right of the dependency.

Cycles aren't validated; if a consumer hands in `A depends on B; B depends on A`, both arrows render and the chart simply looks busy. Validation belongs at the data layer, not the renderer.

## State Flow Diagram

```
                    ┌─────────────────────────┐
                    │   tasks (props)          │
                    └────────┬────────────────┘
                             │
                ┌────────────▼────────────┐
                │  $derived chartStart    │  min(task.start) unless prop
                │  $derived chartEnd      │  max(task.end)   unless prop
                │  $derived totalDays     │  end - start + 1
                └────────────┬────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
   ┌────▼────┐         ┌─────▼────┐         ┌──────▼─────┐
   │ layouts │         │ weekend   │         │ dayTicks    │
   │ (1/task)│         │ bands     │         │ (1/day)     │
   └────┬────┘         └──────────┘         └─────────────┘
        │
   ┌────▼─────────────┐
   │ dependencyArrows │  one per (task, dep) pair
   └────┬─────────────┘
        │
        ▼
  SVG render: weekends → row lines → ticks → today → arrows → bars/diamonds
        │
        ▼
  click / Enter / Space  →  onTaskClick(task)
```

## Props Reference

| Prop                | Type                                        | Default                | Description                                                              |
|---------------------|---------------------------------------------|------------------------|--------------------------------------------------------------------------|
| `tasks`             | `GanttTask[]`                               | required               | Rows in display order.                                                   |
| `startDate`         | `string \| Date`                            | `min(task.start)`      | Earliest date the chart covers.                                          |
| `endDate`           | `string \| Date`                            | `max(task.end)`        | Latest date the chart covers.                                            |
| `dayWidth`          | `number`                                    | `32`                   | Pixels per day on the timeline.                                          |
| `rowHeight`         | `number`                                    | `36`                   | Pixel height of one task row.                                            |
| `labelWidth`        | `number`                                    | `220`                  | Pixel width of the labels column.                                        |
| `showWeekends`      | `boolean`                                   | `true`                 | Shade Saturdays and Sundays.                                             |
| `showToday`         | `boolean`                                   | `true`                 | Vertical line + label at today's date.                                   |
| `showDependencies`  | `boolean`                                   | `true`                 | Render finish→start arrows between tasks.                                |
| `showProgress`      | `boolean`                                   | `true`                 | Overlay a darker bar showing percent complete.                           |
| `dateFormat`        | `'short' \| 'long' \| (d: Date) => string`  | `'short'`              | Header/label date format.                                                |
| `onTaskClick`       | `(task: GanttTask) => void`                 | —                      | Fires on bar/diamond click or Enter/Space when focused.                  |
| `ariaLabel`         | `string`                                    | `'Gantt chart'`        | Wrapper aria-label, combined with task-count summary.                    |
| `class`             | `string`                                    | `''`                   | Extra classes on the outer container.                                    |

## Edge Cases

| Situation                                              | Behaviour                                                                                                                                                                                |
|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `tasks` is empty                                       | Renders an empty chart with the labels column header and an aria-label of "Empty Gantt chart". No SVG body content.                                                                      |
| `task.end` is before `task.start`                      | Span clamps to a minimum of one day so the bar is still visible; the renderer doesn't validate ordering — that's the data layer's job.                                                   |
| `task.dependencies` references a missing id            | The arrow is silently skipped — it can't be drawn without an endpoint. The task itself still renders.                                                                                    |
| Today is outside `[chartStart, chartEnd]`              | Today marker is suppressed. The dashed line is only useful when in range.                                                                                                                |
| `task.isMilestone === true` and end > start            | The end is ignored — milestones render as a single diamond at start. Use a regular bar if you need a duration.                                                                           |
| `task.progress` is missing or 0                        | No progress overlay, even with `showProgress=true`.                                                                                                                                      |
| `task.progress` > 100 or < 0                           | Clamped into `[0, 100]` before drawing.                                                                                                                                                  |
| User has `prefers-reduced-motion: reduce`              | Hover/focus brightness transitions on bars and milestones are disabled; everything else renders the same way.                                                                            |
| Two tasks share an `id`                                | The second wins inside `layoutById`, so dependency arrows targeting the duplicate land on whichever rendered last. Keep ids unique — there's no warning.                                 |
| Mobile viewport (≤ 640px)                              | Labels column shrinks to 140px and the timeline area horizontally scrolls inside the chart wrapper rather than the page. Page never gets a horizontal scrollbar from the chart.          |
| `onTaskClick` not supplied                             | Bars and diamonds render as decorative SVG with `role="presentation"` — no Tab focus, no Enter/Space handling.                                                                           |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `$bindable` are required for the layout reactivity.
- **`svelte/reactivity`** — none used directly; layouts are derived from `tasks` via `$derived`.
- **Zero external runtime dependencies.** Pure SVG, scoped CSS, no charting libraries.

## File Structure

```
src/lib/components/Gantt.svelte    # the component itself
src/lib/components/Gantt.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Gantt.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                   # GanttTask + GanttProps + GanttTaskRow
src/lib/constants.ts               # FALLBACK_GANTT sample schedule
src/routes/gantt/+page.svelte      # demo page (variants + interactive playground)
```
