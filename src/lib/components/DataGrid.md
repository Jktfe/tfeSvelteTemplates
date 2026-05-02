# DataGrid — Technical Logic Explainer

## What Does It Do? (Plain English)

A spreadsheet for the web. Pass it an array of objects and a column definition, and it renders a sortable, filterable, paginated table with sensible defaults. Click a column header to sort. Type in the search box to filter across every column at once. Flip between pages with the arrow controls.

The library actually ships **two** implementations behind the same conceptual surface — `DataGridBasic` is a zero-dependency, copy-paste-ready primitive sized for human-scale data (under ~500 rows), and `DataGridAdvanced` is a typed wrapper around SVAR Grid for serious workloads (virtual scrolling, inline editing, 10 000+ rows). They share the `DataGridColumn` shape and an `Employee[]`-style data array, so you can prototype with Basic and graduate to Advanced without rewriting your column config.

This document covers `DataGridBasic` as the canonical implementation; the **Distinct From DataGridAdvanced** deep-dive below explains when and why to switch.

## How It Works (Pseudo-Code)

```
state:
  sortColumn      : string | null = null
  sortDirection   : 'asc' | 'desc' = 'asc'
  filterText      : string = ''
  currentPage     : number = 1

derive filteredData:
  if !filterable or filterText is empty:
    return data
  term = filterText.toLowerCase()
  return data.filter(row =>
    columns.some(col => String(row[col.id]).toLowerCase().includes(term))
  )

derive sortedData:
  if !sortable or sortColumn is null:
    return filteredData
  copy = [...filteredData]
  copy.sort((a, b) =>
    null/undefined are pushed to the end
    if both numbers: numeric compare
    else: lowercased string compare
    flip sign when sortDirection === 'desc'
  )
  return copy

derive paginatedData:
  if pageSize === 0: return sortedData          // "show everything"
  start = (currentPage - 1) * pageSize
  return sortedData.slice(start, start + pageSize)

events:
  on header click(col):
    if col === sortColumn: flip direction
    else: sortColumn = col, direction = 'asc'
    currentPage = 1                              // reset to first page

  on search input change:
    filterText updates (two-way bind)
    $effect resets currentPage = 1

  on Enter pressed on focused header:
    same as header click

render:
  filter input (if filterable)
  table with thead + tbody (paginatedData)
  pagination controls (if pageSize > 0 and totalPages > 1)
```

The whole pipeline is **filter → sort → paginate**, expressed as three chained `$derived` values. Each step recomputes only when its inputs change, so typing in the filter does not re-sort if the sort column hasn't moved — Svelte 5's reactivity tracks the dependencies for free.

## Core Concept: The Filter→Sort→Paginate Pipeline

Every data-grid library boils down to three transforms applied in this exact order. The order matters:

1. **Filter first.** If you sort first, you're spending CPU ordering rows the user is about to hide. Filtering is O(n) over `data.length × columns.length`; sorting is O(n log n). Doing the cheap O(n) cull first means the expensive O(n log n) operates on a smaller array.
2. **Sort second.** Sorting after filtering means the comparator only runs on visible rows. With 500 rows of employee data and ~10 columns, that's ~5 000 string comparisons per sort — well under one millisecond on any modern machine.
3. **Paginate last.** Pagination is a single `slice()` — O(pageSize), not O(n). It must come last because changing page should not retrigger sort or filter; reactive caching means it doesn't.

The comparator handles three cases:

```
if either value is null/undefined → push to end (regardless of direction)
if both values are numbers        → return a - b (or b - a for desc)
otherwise                         → lowercased string compare
```

Numeric branch matters: `String(1000) < String(9)` is `true` because `'1' < '9'` lexicographically. If we naively coerced everything to strings, salary-sort would put £1 000 above £900. The `typeof === 'number'` check on both sides catches that.

The filter is a *substring contains* against every column. It's deliberately not regex — regex injection from a user-typed search box is a footgun, and most users want "find the row that mentions Sarah" not "match this pattern". Lowercase both sides so `"sarah"` matches `"Sarah Johnson"`.

## Performance: Where The Budget Goes

DataGridBasic renders **every visible row in the DOM**. With `pageSize = 10`, that's 10 `<tr>` × 10 `<td>` = 100 DOM nodes per page. The browser handles this without blinking.

The bottleneck moves as the dataset grows:

- **0–100 rows, no pagination:** Trivial. Filter+sort run in microseconds. Render the whole table at once.
- **100–500 rows with pagination:** Comfortable zone. Filter scans every row but only paginated rows render. Switching pages is a `slice` and a re-render of 10 nodes.
- **500–2 000 rows with pagination:** Still works, but the filter scan starts to be perceptible (~5 ms with 10 columns). Acceptable for admin interfaces; consider debouncing the search input by 100 ms if your users type fast.
- **2 000+ rows:** This is the wall. Every keystroke triggers a full filter scan over thousands of rows. The DOM is fine — pagination keeps render counts low — but the JS is starting to compete with input latency. **Switch to DataGridAdvanced**, which uses virtual scrolling and indexed filtering.

There is no virtual scrolling in Basic. Adding it would more than double the component's complexity and erase the "copy-paste, no dependencies" promise. The point of Basic is that it's small, readable, and good enough for the 80 % case.

## Distinct From DataGridAdvanced

`DataGridBasic` and `DataGridAdvanced` share a column-definition shape and a data-array contract, but they're tuned for different jobs:

| Concern | DataGridBasic | DataGridAdvanced |
|---|---|---|
| Bundle cost | ~10 KB, zero deps | +~155 KB (SVAR Grid) |
| Dataset size | Up to ~500 rows | 10 000+ rows |
| Rendering | Every paginated row in DOM | Virtual scrolling — only visible rows |
| Editing | Read-only | Inline editing (text, number, date, select) |
| Selection | None | Single or multi-row |
| Export | None | CSV export built in |
| Accessibility | Hand-rolled, predictable | WAI-ARIA from library |
| Portability | Copy the file, done | Requires `@svar-ui/svelte-grid` install |

The wrapper pattern in `DataGridAdvanced` translates the `DataGridColumn[]` shape into SVAR's expected column format on the way in, and surfaces selection/edit events back out. That means a column config written for Basic works in Advanced: you can prototype on a 50-row fixture in Basic, drop in Advanced once production data shows up, and not rewrite anything.

If you find yourself wanting to add inline editing or virtual scrolling to Basic, **stop and switch to Advanced.** That's exactly the seam those features were given a separate component for.

## State Flow Diagram

```
                ┌─────────────────────┐
                │  initial render     │
                │  data=[...] given   │
                │  sortColumn=null    │
                │  filterText=''      │
                │  currentPage=1      │
                └──────────┬──────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         user types    user clicks   user clicks
         in search     header        page button
              │            │            │
              ▼            ▼            ▼
       filterText      flip dir or    currentPage
       updated         set new col    updated
       currentPage←1   currentPage←1
              │            │            │
              └────────────┴────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ filter→sort→    │
                  │ paginate runs   │  (Svelte $derived chain)
                  │ render updates  │
                  └─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ table reflects  │
                  │ new state       │
                  └─────────────────┘
```

There is no "loading" state in Basic — it's synchronous over an in-memory array. If you need async loading, do it in `+page.server.ts` and pass the resolved array as `data`.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | `[]` | Array of records. Each row is an object whose keys match `column.id` values. |
| `columns` | `DataGridColumn[]` | required | Column definitions. See `DataGridColumn` below. |
| `sortable` | `boolean` | `true` | Master switch for header-click sorting. Per-column `sortable: false` overrides. |
| `filterable` | `boolean` | `true` | Show the global search input. |
| `pageSize` | `number` | `10` | Rows per page. `0` disables pagination (renders everything). |
| `striped` | `boolean` | `true` | Alternating row backgrounds for scanability. |
| `hoverable` | `boolean` | `true` | Row hover highlight. |
| `compact` | `boolean` | `false` | Smaller cell padding for dense tables. |

`DataGridColumn`:

```typescript
interface DataGridColumn {
  id: string;                                    // matches data row key
  header: string;                                // display text
  width?: number | 'auto';                       // px or 'auto'
  sortable?: boolean;                            // per-column override (default: true)
  filterable?: boolean;                          // reserved for future use
  type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'select';
  formatter?: (value: any, row?: any) => string; // text output
  cellRenderer?: (value: any, row?: any) => string; // HTML output (sanitised)
  cellStyle?: (value: any, row?: any) => string; // inline style string
  cellClass?: (value: any, row?: any) => string; // sanitised class names
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `data` array | Renders a "No data available" cell spanning all columns. Pagination controls are hidden. |
| Filter returns zero rows | Renders "No results found". Filter result count shows `0 results`. |
| `pageSize: 0` | Pagination disabled; `paginatedData` returns the full sorted+filtered set. |
| Mixed types in a sort column | Numbers compared numerically when both are numbers; otherwise falls through to string compare on the lowercased values. |
| `null` or `undefined` in a sort column | Sorted to the end regardless of direction. |
| Duplicate `column.id` entries | Both render; second column's sort/filter still works. The Svelte `{#each}` key includes the column index so there are no key collisions. |
| `cellRenderer` returns HTML with a `<script>` tag | Sanitised through `sanitizeHTML` before `{@html}` — XSS-safe. |
| `cellClass` returns malicious-looking class names | Run through `sanitizeClassName` to strip anything other than valid CSS class characters. |
| Rapid typing in the filter | `$effect` resets `currentPage` to 1 on each change. Filter result count and rendered rows update on every keystroke (no debounce — add one if your dataset is >2 000 rows). |
| Sort applied, then filter narrows results | Sort persists; sort then runs over the new filtered set. Page resets to 1. |
| Row with no `id` field | `{#each}` falls back to row index for the key. Stable as long as the array order doesn't change mid-render. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect` for the filter/sort/paginate pipeline. The chained `$derived` is what makes the pipeline efficient.
- **`$lib/utils.sanitizeHTML`** — DOMPurify wrapper for `cellRenderer` HTML output. XSS protection is non-negotiable when rendering untrusted column output.
- **`$lib/dataGridFormatters.sanitizeClassName`** — strips non-class-name characters from `cellClass` output.
- Zero external rendering dependencies. The whole component is one `.svelte` file plus its types — copy-paste portable.

`DataGridAdvanced` adds:

- **`@svar-ui/svelte-grid`** — virtual scrolling, inline editing, advanced filters. Justified because rolling these features by hand is a 100+ hour project and the library is well-maintained.

## File Structure

```
src/lib/components/DataGridBasic.svelte         # the lightweight implementation
src/lib/components/DataGridBasic.test.ts        # unit tests
src/lib/components/DataGridAdvanced.svelte      # SVAR Grid wrapper
src/lib/components/DataGridAdvanced.test.ts     # unit tests
src/lib/components/DataGridFilters.svelte       # advanced filter UI
src/lib/components/DataGrid.md                  # this file
src/lib/dataGridFormatters.ts                   # sanitizeClassName, formatCurrency, etc.
src/lib/server/dataGrid.ts                      # loadEmployeesFromDatabase + fallback
src/routes/datagrid/+page.svelte                # demo page
src/routes/datagrid/+page.server.ts             # SSR data load
src/lib/types.ts                                # DataGridColumn, DataGridBasicProps, DataGridAdvancedProps, Employee
src/lib/constants.ts                            # FALLBACK_EMPLOYEES
database/schema_datagrid.sql                    # employees table schema
```
