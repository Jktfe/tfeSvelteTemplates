# CalendarHeatmap - Technical Logic Explainer

## What Does It Do? (Plain English)

CalendarHeatmap displays a year's worth of activity as coloured squares - just like GitHub's contribution graph! Each day is a small square, and the colour intensity shows how much activity happened on that day.

**Think of it like:** A calendar where instead of dates, each day is coloured from light grey (no activity) to dark green (maximum activity). Hover over any day to see the exact date and value.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. CALCULATE start and end dates (default: past 365 days)
  2. BUILD grid of weeks (52 columns) and days (7 rows)
  3. MAP activity data to each cell
  4. GENERATE colour for each cell based on value

FOR each day in the range:
  1. FIND the matching data point (if any)
  2. CALCULATE which "level" (0-4) it belongs to
  3. ASSIGN colour from the gradient
  4. POSITION in the correct week column and day row

WHEN user hovers over a cell:
  1. SHOW tooltip with date and value
  2. HIGHLIGHT the cell

WHEN user clicks a cell:
  1. CALL the onCellClick handler with date and value

WHEN user navigates with keyboard:
  1. Arrow keys MOVE between cells
  2. Enter/Space SELECT the current cell
```

---

## The Core Concept

### Grid Layout

The calendar is arranged as a grid where:
- **Columns** = Weeks (52-53 per year)
- **Rows** = Days of the week (Sunday to Saturday)
- **Cells** = Individual days

```
       Week 1   Week 2   Week 3   ...   Week 52
Sun    [  ]     [  ]     [  ]           [  ]
Mon    [  ]     [  ]     [##]           [  ]
Tue    [  ]     [  ]     [  ]           [##]
Wed    [  ]     [##]     [  ]           [  ]
Thu    [  ]     [  ]     [##]           [  ]
Fri    [##]     [  ]     [  ]           [##]
Sat    [  ]     [  ]     [  ]           [  ]

[  ] = Empty/low activity
[##] = High activity
```

---

## Colour Calculation

The component uses a **discrete level system** (not a continuous gradient):

```
Value Range → Level → Colour
───────────────────────────────
0           → 0     → #ebedf0 (empty)
1-2         → 1     → #9be9a8 (light green)
3-5         → 2     → #40c463 (medium green)
6-8         → 3     → #30a14e (dark green)
9+          → 4     → #216e39 (darkest green)
```

The thresholds are calculated dynamically based on the maximum value in your data.

---

## Position Calculation

Each cell's position is calculated using:

```
WEEK_NUMBER = (daysSinceStart / 7) rounded down
DAY_OF_WEEK = date.getDay() (0 = Sunday, 6 = Saturday)

X_POSITION = leftMargin + (WEEK_NUMBER × (cellSize + cellGap))
Y_POSITION = topMargin + (DAY_OF_WEEK × (cellSize + cellGap))
```

---

## Data Format

The component expects data in this simple format:

```javascript
[
  { date: "2024-01-15", value: 5 },
  { date: "2024-01-16", value: 0 },
  { date: "2024-01-17", value: 12 },
  // ... more days
]
```

Missing dates are treated as value `0`.

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Up | Move to previous day (same week) |
| Arrow Down | Move to next day (same week) |
| Arrow Left | Move to same day, previous week |
| Arrow Right | Move to same day, next week |
| Enter/Space | Select focused cell |

---

## Performance Notes

- **SVG Rendering:** Uses SVG `<rect>` elements for crisp rendering at any size
- **Virtual Grid:** Only renders visible cells (empty weeks are skipped)
- **CSS Transitions:** Hover effects use CSS for 60fps smoothness
- **Data Lookup:** Uses a Map for O(1) date-to-value lookups

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| No data provided | All cells render as empty (level 0) |
| Missing dates | Missing days show as empty |
| Future dates | Still rendered if within range |
| Leap years | February 29 correctly handled |
| Timezone issues | Dates parsed in local timezone |

---

## What This Component Does NOT Do

- Does not fetch data (you provide it)
- Does not animate cell colour changes
- Does not support multiple years in one view
- Does not have zoom/drill-down features

---

## Dependencies

**Zero external dependencies.**

This component uses only:
- Svelte 5 (`$props()`, `$state()`, `$derived()` runes)
- Standard SVG elements
- CSS custom properties

---

## File Structure

```
CalendarHeatmap.svelte      # The component
CalendarHeatmap.test.ts     # Unit tests
CalendarHeatmap.md          # This explainer
```

---

*Last updated: 26 December 2025*
