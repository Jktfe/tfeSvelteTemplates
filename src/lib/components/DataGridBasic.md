# DataGridBasic — Technical Logic Explainer

## What Does It Do? (Plain English)

DataGridBasic turns an array of objects into a proper table: click a header to sort, type in the search box to narrow the rows, and flip through pages when there are too many to show at once. It's one Svelte file with no external packages, so you can copy it into any project and read every line.

**Think of it like:** a paper ledger with a very patient clerk. You say "sort by salary" or "only the rows mentioning Leeds", and the clerk rewrites the page for you — the ledger itself never changes.

---

## How It Works (Pseudo-Code)

```
state:
  sortColumn    = null          # which column id is sorted
  sortDirection = 'asc'
  filterText    = ''
  currentPage   = 1

derived (recomputed only when their inputs change):
  filteredData  = filterText ? rows where ANY column contains filterText : data
  sortedData    = sortColumn ? copy(filteredData).sort(compare) : filteredData
  totalPages    = pageSize > 0 ? ceil(sortedData.length / pageSize) : 1
  paginatedData = pageSize > 0 ? slice of sortedData for currentPage : sortedData
  pageWindow    = up to 7 page numbers: first, neighbours of current, last

events:
  on header click / Enter / Space:
    if column is not sortable: ignore
    if same column: flip sortDirection
    else: sortColumn = column, sortDirection = 'asc'
    currentPage = 1

  on search input:
    filterText = value
    currentPage = 1                # effect: new search starts from the top

  when data shrinks and currentPage > totalPages:
    currentPage = totalPages       # effect: never strand the user on an empty page

render each cell:
  cellRenderer? → {@html sanitizeHTML(renderer(value, row))}
  formatter?    → text(formatter(value, row))
  type number   → value.toLocaleString('en-GB')
  type date     → dd/mm/yyyy
  otherwise     → String(value)
```

---

## The Core Concept: A Three-Stage `$derived` Pipeline

The whole grid is three pure transformations chained together:

```
 data ──▶ filteredData ──▶ sortedData ──▶ paginatedData ──▶ <tbody>
            ▲                 ▲               ▲
        filterText      sortColumn,      currentPage,
                        sortDirection     pageSize
```

Because each stage is its own `$derived.by`, Svelte only re-runs the stages downstream of whatever changed:

- Clicking **Next page** re-slices `paginatedData` — the filter and sort don't run again.
- Clicking a **header** re-sorts, then re-slices — the filter doesn't run again.
- Typing in **search** re-runs all three, because everything downstream depends on it.

The sort always works on a copy (`[...filteredData].sort(...)`), so the caller's array is never mutated. Comparison rules:

| Values | Comparison |
|---|---|
| Both numbers | Numeric (`a - b`) |
| Anything else | Lower-cased string compare |
| `null` / `undefined` | Always sink to the bottom, in both directions |

---

## Theming

DataGridBasic follows the project convention in `docs/THEMING.md`: every colour is a CSS custom property with a light default on `.datagrid-basic-wrapper`, and chrome tokens flip under `prefers-color-scheme: dark`. The accent is brand and deliberately stays the same on both schemes.

| Property | Light | Dark | Used by |
|---|---|---|---|
| `--dgb-bg` | `#ffffff` | `#1f2937` | Table background |
| `--dgb-header-bg` | `#f9fafb` | `#111827` | Header row |
| `--dgb-header-hover-bg` | `#f3f4f6` | `#1f2937` | Sortable header hover |
| `--dgb-stripe-bg` | `#f9fafb` | `#111827` | Even rows when `striped` |
| `--dgb-row-hover-bg` | `#f3f4f6` | `#374151` | Row hover when `hoverable` |
| `--dgb-border` | `#e5e7eb` | `#374151` | Table frame, row dividers |
| `--dgb-input-border` | `#d1d5db` | `#4b5563` | Search box, page buttons |
| `--dgb-input-bg` | `#ffffff` | `#1f2937` | Search box |
| `--dgb-header-fg` | `#374151` | `#f9fafb` | Header text |
| `--dgb-cell-fg` | `#1f2937` | `#e5e7eb` | Cell text |
| `--dgb-muted-fg` | `#6b7280` | `#9ca3af` | Result count, "Showing x–y of z" |
| `--dgb-empty-fg` | `#9ca3af` | `#6b7280` | Empty-state message |
| `--dgb-button-bg` / `-fg` / `-hover-bg` | white / slate / grey | slate / white / grey | Pagination buttons |
| `--dgb-accent` *(brand)* | `#146ef5` | *unchanged* | Focus ring, sorted arrow, active page |
| `--dgb-on-accent` *(brand)* | `#ffffff` | *unchanged* | Active page text |
| `--dgb-focus-ring` *(brand)* | `rgba(20,110,245,.2)` | *unchanged* | Search focus halo |

Override for one area of your app (the doubled class beats Svelte's scoped specificity):

```css
.reports :global(.datagrid-basic-wrapper.datagrid-basic-wrapper) {
  --dgb-accent: #0f766e;
  --dgb-header-bg: #f0fdfa;
}
```

---

## Performance

| Dataset | Experience |
|---|---|
| ≤ 500 rows | Instant. The sweet spot. |
| 500 – 2 000 rows | Fine; search runs a full scan per keystroke. Add a debounce if it feels sticky. |
| 2 000+ rows | Switch to **DataGridAdvanced** — virtual scrolling keeps the DOM small and the search pass is the only cost. |

Pagination is what keeps the DOM cheap: only `pageSize` rows are ever rendered. `pageSize={0}` renders everything, so reserve it for small tables.

---

## State Flow Diagram

```
                 ┌──────────────────────────┐
                 │ idle                     │
                 │ sortColumn=null, page=1  │
                 └────────────┬─────────────┘
          ┌───────────────────┼────────────────────┐
     type in search      header click/Enter/Space   page button
          │                   │                    │
          ▼                   ▼                    ▼
   filterText=value    same col? flip dir     currentPage=n
   currentPage=1       new col? set, 'asc'         │
          │            currentPage=1               │
          └───────────────────┼────────────────────┘
                              ▼
               filter ─▶ sort ─▶ paginate ─▶ render
                              │
                 data prop shrinks below current page
                              ▼
                    currentPage = totalPages
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` (`T extends object`) | `[]` | Rows to display; keys match `column.id`. |
| `columns` | `DataGridColumn[]` | required | Column definitions (header, width, type, formatter, cellStyle, cellClass, cellRenderer). |
| `sortable` | `boolean` | `true` | Header-click sorting; a column's `sortable: false` opts it out. |
| `filterable` | `boolean` | `true` | Show the global search box. |
| `pageSize` | `number` | `10` | Rows per page; `0` disables pagination. |
| `striped` | `boolean` | `true` | Alternating row backgrounds. |
| `hoverable` | `boolean` | `true` | Highlight the row under the pointer. |
| `compact` | `boolean` | `false` | Tighter cell padding for dense tables. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `data` is empty | One full-width "No data available" cell; pagination hidden. |
| Search matches nothing | "No results found"; the count reads `0 results`. |
| `null` / `undefined` in the sorted column | Sorted to the bottom in both directions. |
| Mixed numbers and strings in one column | Falls back to lower-cased string comparison. |
| Parent narrows `data` while you're on page 5 of 5 | `currentPage` clamps to the new last page. |
| Rows without an `id` | `{#each}` keys fall back to the row index. |
| Two columns share an `id` (e.g. salary shown three ways) | Both render; keys include the column index so nothing collides. |
| `cellClass` returns odd characters | `sanitizeClassName` strips everything except letters, digits, `-`, `_` and spaces. |
| `cellRenderer` returns HTML | Rendered via `{@html sanitizeHTML(...)}`. `sanitizeHTML` is currently a pass-through seam — only feed it developer-authored HTML. |
| `prefers-reduced-motion: reduce` | Hover/background transitions are switched off. |

---

## Dependencies

- **Svelte 5.x** — `$state`, `$derived.by` and `$effect` drive the filter → sort → paginate pipeline.
- **`$lib/dataGridFormatters.sanitizeClassName`** — one-line class-name sanitiser for `cellClass` output.
- **`$lib/utils.sanitizeHTML`** — the seam for `cellRenderer` HTML (pass-through today; swap in `sanitize-html` before rendering user content).
- Zero external packages.

---

## File Structure

```
src/lib/components/DataGridBasic.svelte      # implementation
src/lib/components/DataGridBasic.md          # this file
src/lib/components/DataGridBasic.test.ts     # vitest unit + interaction tests
src/lib/components/DataGrid.md               # family overview (rendered on /datagrid)
src/lib/dataGridFormatters.ts                # formatCurrency, createStatusBadge, sanitizeClassName, …
src/lib/types.ts                             # DataGridColumn, DataGridBasicProps
src/routes/datagrid/+page.svelte             # demo page (playground + variants)
```
