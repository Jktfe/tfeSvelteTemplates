# DataVizInspector - Technical Logic Explainer

## What Does It Do? (Plain English)

DataVizInspector scores chart specifications against practical quality checks before they ship: does the chart have a title, any data, a source, alt text, units and (where needed) a colour legend? Pick a chart from the list and it shows a 0–100 score, a verdict of ready, review or blocked, and a pass/review checklist explaining each rule.

**Think of it like:** a pre-flight checklist for charts. The pilot does not take off until every line is ticked, and the list says why each line matters.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. RECEIVE specs (DataVizSpec[])
  2. EFFECT: IF no activeTitle AND specs exist → activeTitle = specs[0].title

DERIVED:
  active  = spec whose title == activeTitle, else specs[0]
  checks  = dataVizChecks(active)          # six { label, pass, reason }
  score   = round(passed / 6 × 100)
  verdict = score ≥ 90 → 'ready'
            score ≥ 60 → 'review'
            else       → 'blocked'

ON chart button click:
  activeTitle = spec.title                 # report re-derives
```

---

## The Core Concept: Six Rules, One Score

`dataVizChecks(spec)` is a pure function returning six checks in a fixed order:

| Check | Passes when | Why it matters |
|-------|-------------|----------------|
| Title | `title.trim()` is not empty | Readers need a visible chart title. |
| Rows | `rowCount > 0` | A chart with no data is a broken chart. |
| Source | `hasSource` | Source metadata should travel with the chart. |
| Alt text | `hasAltText` | Visuals need accessible summaries. |
| Units | `hasUnits` | Axes and measures should expose units. |
| Legend | `chartType === 'table'` or `hasColorLegend` | Grouped visual encodings need a visible legend; tables do not. |

Because there are exactly six checks, the score only takes a handful of values:

```
passes:   6     5     4     3     2     1     0
score:  100    83    67    50    33    17     0
verdict: ready │ review    │ blocked ──────────────
```

So "ready" really means *every* check passes — one miss drops a chart to review.

### Exported helpers

| Export | Purpose |
|--------|---------|
| `dataVizChecks(spec)` | Returns the six `DataVizCheck` rows for a spec. |
| `dataVizScore(spec)` | Returns the rounded 0–100 pass percentage. |
| `dataVizVerdict(score)` | Maps a score to `'ready'`, `'review'` or `'blocked'`. |

---

## State Flow Diagram

```
   ┌──────────────────────┐   specs arrive    ┌──────────────────────┐
   │  NO SELECTION        │ ────────────────▶ │  INSPECTING          │
   │  activeTitle = ''    │   effect picks    │  active spec report  │
   └──────────────────────┘   specs[0]        │  score · verdict     │
                                              └──────────┬───────────┘
                                                         │ click another chart
                                                         ▼
                                              ┌──────────────────────┐
                                              │  RE-DERIVE           │
                                              │  checks → score →    │──▶ INSPECTING
                                              │  verdict class       │
                                              └──────────────────────┘

   verdict → .vi-report--ready | --review | --blocked (colour of the report)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `specs` | `DataVizSpec[]` | — (required) | Chart specs with `title`, `chartType`, `rowCount`, `hasSource`, `hasAltText`, `hasUnits` and `hasColorLegend`. |
| `title` | `string` | `'Data viz inspector'` | Heading above the inspector. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `specs` is empty | The chart list is empty and no report renders. |
| Two specs share a title | Titles are used as keys and selection ids — keep them unique. |
| Selected spec removed from `specs` | Falls back to the first spec. |
| `chartType` is `'table'` | The legend check passes automatically. |
| Title is only whitespace | The title check fails. |
| Large `rowCount` | Shown with `toLocaleString()` (for example `12,480 rows`). |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$state`, `$derived`, `$effect`, `$props`) and scoped CSS.

---

## File Structure

```
src/lib/components/DataVizInspector.svelte     # implementation + exported scoring helpers
src/lib/components/DataVizInspector.md         # this file (rendered inside ComponentPageShell)
src/lib/components/DataVizInspector.test.ts    # vitest unit tests
src/routes/datavizinspector/+page.svelte       # demo page
```
