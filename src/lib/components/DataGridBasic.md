# DataGridBasic - Technical Logic Explainer

## Overview

DataGridBasic is a **zero-dependency** data grid implementing sorting, filtering, and pagination using pure Svelte 5 reactivity. It's designed to be copy-paste ready into any project.

## The Flow: How Data Moves Through the Grid

```
Raw Data Array
     ↓
[1. Filter] → Search text filters across all columns
     ↓
[2. Sort] → Click column header to sort filtered results
     ↓
[3. Paginate] → Slice into pages of configurable size
     ↓
Rendered Rows
```

## Key Concepts

### 1. Derived Chains (Reactive Pipelines)

The grid uses chained `$derived()` runes that automatically recompute:

```
data → filteredData() → sortedData() → paginatedData()
```

When ANY upstream value changes (filter text, sort column, page number), downstream values automatically update. This is Svelte 5's reactive magic!

### 2. Global Search Filter

The filter searches **all columns** for matches:

```typescript
// Pseudocode for filtering
for each row in data:
  for each column in columns:
    if column.value contains searchText:
      include row in results
      break  // Found match, no need to check other columns
```

### 3. Sorting Logic

Column headers toggle through states: `unsorted → ascending → descending → ascending...`

```typescript
// Sort comparison (simplified)
if column is numeric:
  compare as numbers (a - b)
else:
  compare as strings (localeCompare)

if direction is 'desc':
  reverse the order
```

### 4. Pagination Math

```typescript
totalPages = ceil(totalRows / pageSize)
startIndex = (currentPage - 1) * pageSize
endIndex = startIndex + pageSize
displayedRows = sortedData.slice(startIndex, endIndex)
```

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `sortColumn` | `string \| null` | Currently sorted column ID |
| `sortDirection` | `'asc' \| 'desc'` | Sort order |
| `filterText` | `string` | Search box value |
| `currentPage` | `number` | Active page (1-indexed) |

## Performance Considerations

- **Dataset Limits**: Works well up to ~500 rows. Beyond that, consider DataGridAdvanced with virtual scrolling.
- **No Debounce on Filter**: Filters on every keystroke. For large datasets, add debounce.
- **Full Re-render**: Changes to sort/filter/page cause full table re-render.

## Accessibility Features

| Feature | Implementation |
|---------|---------------|
| Sortable columns | `aria-sort="ascending/descending/none"` |
| Keyboard nav | Tab to headers, Enter to sort |
| Results count | Screen reader announcement |
| Pagination | `aria-label` on all buttons |

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Employee[]` | `[]` | Array of row objects |
| `columns` | `DataGridColumn[]` | required | Column definitions |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `filterable` | `boolean` | `true` | Show search input |
| `pageSize` | `number` | `10` | Rows per page (0 = all) |
| `striped` | `boolean` | `true` | Alternating row colors |
| `hoverable` | `boolean` | `true` | Highlight on hover |
| `compact` | `boolean` | `false` | Dense row padding |

## Column Definition

```typescript
interface DataGridColumn {
  id: string;          // Must match data key
  header: string;      // Display text
  width?: number;      // Pixel width (optional)
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  formatter?: (value: any) => string;  // Custom display
}
```

## Security

All cell content is sanitized using `sanitizeClassName()` to prevent XSS attacks when rendering custom formatters.
