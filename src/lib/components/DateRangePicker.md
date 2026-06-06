# DateRangePicker

## What Does It Do? (Plain English)

DateRangePicker shows two months of a calendar side by side and lets a reader pick a
**span** of dates rather than a single day. The first click drops a start marker; the
second click drops an end marker; everything in between fills with a coloured band.
While only the start is set, the day under the pointer (or keyboard focus) is treated
as a *provisional* end so the band previews live before you commit. Clicking a day
that sits before the current start quietly throws the selection away and starts again
from that earlier day — the behaviour people expect from booking widgets.

The selected span is exposed as one bindable object, `{ start, end }`, where each value
is an ISO `yyyy-mm-dd` string or `null`. Optional `min` / `max` bounds disable days
outside a window. The component carries its own calendar-grid maths, so it has no date
library dependency and copies cleanly into any project.

## How It Works (Pseudo-Code)

```
state value      = { start, end }      // committed, bindable
state previewISO = null                // day under pointer / focus
state anchorISO  = left month's first day

derive effectiveEnd:
    if value.start AND not value.end AND previewISO -> previewISO
    else -> value.end

derive span:                           // ordered [lo, hi] or null
    a, b = value.start, effectiveEnd
    if not a or not b -> null
    return a <= b ? [a, b] : [b, a]

on click(day):
    if disabled(day) -> ignore
    if no start OR already have end -> value = { start: day, end: null }   // fresh range
    else if day < start            -> value = { start: day, end: null }   // reset earlier
    else                           -> value = { start, end: day }          // commit end

dayState(day):
    day == start -> 'start'
    day == end   -> 'end'
    lo < day < hi (from span) -> 'in-range'
    else -> 'none'
```

## The Core Concept: One Range, Two Sources of "End"

The trick that makes the live preview feel right is the derived `effectiveEnd`. There is
only ever one committed `value`, but the *displayed* range pulls its second endpoint from
two places depending on state:

| Phase | `value.start` | `value.end` | Displayed end comes from |
|-------|---------------|-------------|--------------------------|
| Idle | `null` | `null` | nothing — no band |
| Picking | set | `null` | `previewISO` (hover/focus) |
| Committed | set | set | `value.end` |

Because `span` is `$derived` from `effectiveEnd`, the band, the `in-range` shading and the
rounded endpoint corners all recompute automatically on every hover or focus move — no
manual DOM updates, no imperative repaint.

## CSS Animation Strategy

The visual range is pure CSS class toggling, not JavaScript-driven styling. Each day
button gets one of four classes — `--start`, `--end`, `--in-range`, or none — and the
stylesheet does the rest: endpoints use the accent colour with the inner corners squared
off (`border-top-right-radius: 0` on the start, the mirror on the end) so a continuous
band reads as one shape. Hover and selection transitions are short `background-color`
fades, and the entire transition set is removed under `prefers-reduced-motion: reduce`.
Theme colours are CSS custom properties on the root, flipped wholesale inside a
`prefers-color-scheme: dark` block.

## State Flow Diagram

```
        ┌────────────┐  click day A   ┌──────────────────┐
        │   IDLE     │ ─────────────► │  START SET        │
        │ start=null │                │ start=A, end=null │
        │ end=null   │ ◄───────────── │                   │
        └────────────┘  click B<A     └──────────────────┘
              ▲          (resets to B)        │
              │                               │ hover/focus C
              │                               ▼
              │                       ┌──────────────────┐
              │   click new day       │  PREVIEW          │
              │   (start set)         │ band = [A..C]     │
              │ ◄──────────────────── │ (uncommitted)     │
              │                       └──────────────────┘
              │                               │ click B≥A
              │                               ▼
              │                       ┌──────────────────┐
              └────────────────────── │  COMMITTED        │
                  click any day        │ start=A, end=B    │
                  starts fresh range   └──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `{ start: string \| null; end: string \| null }` | `{ start: null, end: null }` | Bindable selected range as ISO `yyyy-mm-dd` strings (or `null`). |
| `min` | `string \| null` | `null` | Earliest selectable ISO date (inclusive); earlier days are disabled. |
| `max` | `string \| null` | `null` | Latest selectable ISO date (inclusive); later days are disabled. |
| `initialMonth` | `string \| null` | `null` | ISO date whose month opens on the left panel. Falls back to `value.start`, then today. |
| `weekStartsOn` | `0 \| 1` | `1` | First column of the week: `0` = Sunday, `1` = Monday. |

## Edge Cases

| Case | Behaviour |
|------|-----------|
| Click a day earlier than the current start | Selection resets — that earlier day becomes the new start, end cleared. |
| Hover with no start committed | No preview band appears; `effectiveEnd` stays `null`. |
| `min` later than `max` | Every day fails at least one bound and is disabled; nothing is selectable (caller's mis-config). |
| Selecting the same day twice | Start and end collapse to one day; `span` is `[d, d]`, shown as a single endpoint. |
| Arrow-key past the visible months | The anchor month auto-shifts so the focused day stays on screen, then focus follows it. |
| Disabled day clicked or arrowed onto | Click is ignored; the button is `disabled` so it cannot receive focus or commit. |
| `initialMonth` omitted with an existing `value.start` | The left panel opens on the start's month rather than today. |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, scoped CSS, and inline SVG chevrons.
All calendar maths (month grids, weekday offset, ISO formatting, bound comparison) is
implemented locally with the native `Date` object so the component stays copy-paste
portable — no `date-fns`, no `dayjs`, no icon library.

## File Structure

```
src/lib/components/
  DateRangePicker.svelte      ← component (logic + scoped styles + doc header)
  DateRangePicker.md          ← this explainer (rendered in the page shell)
  DateRangePicker.test.ts     ← vitest + @testing-library/svelte behaviour tests
src/routes/daterangepicker/
  +page.svelte                ← demo page (playground, pre-filled, bounded variants)
```
