# DataGridAdvanced - Technical Logic Explainer

## Overview

DataGridAdvanced wraps the **SVAR Grid** library to provide enterprise-grade features: virtual scrolling for large datasets, inline editing, row selection, and CSV export. Designed for production applications.

## When to Use This vs DataGridBasic

| Scenario | Use This? |
|----------|-----------|
| 1000+ rows | ✅ Yes - virtual scrolling |
| Need inline editing | ✅ Yes |
| Bundle size matters | ❌ No - ~155KB |
| Learning exercise | ❌ No - use Basic |
| Copy-paste portable | ❌ No - needs SVAR |

## Architecture

```
Your Data (Employee[])
         ↓
DataGridAdvanced (wrapper)
         ↓
    [Transform columns to SVAR format]
    [Configure editing, selection, theming]
         ↓
SVAR Grid (renders everything)
         ↓
Virtual DOM (only visible rows rendered)
```

## Key Features Explained

### 1. Virtual Scrolling

Only renders rows currently visible in the viewport. Scroll through 10,000 rows smoothly because only ~20-30 are actually in the DOM at any time.

### 2. Column Auto-Generation

If no columns provided, generates them from data structure:

```typescript
// Pseudocode
for each key in data[0]:
  create column {
    id: key,
    header: formatHeader(key),  // camelCase → "Camel Case"
    width: calculateWidth(key),
    editor: inferEditor(value)  // number → 'number', date → 'date'
  }
```

### 3. Inline Editing

SVAR Grid provides multiple editor types:

| Editor | For | Input |
|--------|-----|-------|
| `text` | Strings | Text input |
| `number` | Numbers | Number input |
| `date` | Dates | Date picker |
| `select` | Enums | Dropdown |

### 4. Select Field Options

The grid supports dropdown editors with predefined options:

```typescript
// From constants.ts
DEPARTMENT_OPTIONS_GRID = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'sales', label: 'Sales' },
  // ...
]
```

### 5. CSV Export

One-click export of visible data:

```typescript
// Export logic (simplified)
headers = columns.map(c => c.header).join(',')
rows = data.map(row =>
  columns.map(c => row[c.id]).join(',')
)
download(headers + '\n' + rows.join('\n'))
```

## State Management

Component manages minimal state - SVAR Grid handles the heavy lifting:

| State | Purpose |
|-------|---------|
| `searchQuery` | Global filter input |
| `localData` | Working copy of data |

## SVAR Grid Column Format

Our `DataGridColumn` → SVAR format transformation:

```typescript
// Our format
{ id: 'salary', header: 'Salary', type: 'number', editable: true }

// SVAR format
{ id: 'salary', header: 'Salary', editor: 'number', sort: true, filter: true }
```

## Theming

Two built-in themes from SVAR:

- **Willow** (light) - Clean, professional
- **WillowDark** (dark) - Easy on eyes

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Employee[]` | `[]` | Array of row objects |
| `columns` | `DataGridColumn[]` | auto | Column definitions |
| `editable` | `boolean` | `false` | Enable inline editing |
| `selectable` | `boolean` | `false` | Enable row selection |
| `pageSize` | `number` | `20` | Rows per page |
| `exportable` | `boolean` | `false` | Show export button |
| `theme` | `string` | `'willow'` | 'willow' or 'willowDark' |

## Events

| Event | Payload | When |
|-------|---------|------|
| `edit` | `{ row, column, value }` | Cell edited |
| `selection` | `row[]` | Selection changed |

## Security

All string values are HTML-escaped before rendering via `escapeHtml()` to prevent XSS attacks.

## Dependencies

```bash
bun add @svar-ui/svelte-grid
```

Bundle impact: ~155KB (minified)
