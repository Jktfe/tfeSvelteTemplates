# DataGrid Column Styling & Formatting Guide

This guide demonstrates how to apply custom styling and formatting to DataGrid columns using the utilities provided in `src/lib/dataGridFormatters.ts`.

## Table of Contents

- [Overview](#overview)
- [Column Configuration Options](#column-configuration-options)
- [Formatter Functions](#formatter-functions)
- [Styling Functions](#styling-functions)
- [Renderer Functions](#renderer-functions)
- [Usage Examples](#usage-examples)
- [Creating Custom Formatters](#creating-custom-formatters)

## Overview

The DataGrid components (both Basic and Advanced) support three types of customisation for columns:

1. **`formatter`** - Transforms the cell value for display (returns string)
2. **`cellStyle`** - Applies inline CSS styles to cells (returns CSS string)
3. **`cellRenderer`** - Generates custom HTML for cells (returns HTML string)

All three can be used together or independently.

## Column Configuration Options

### Enhanced DataGridColumn Interface

```typescript
interface DataGridColumn {
  id: string;                                    // Column identifier
  header: string;                                // Column header text
  width?: number | 'auto';                       // Column width
  sortable?: boolean;                            // Enable sorting
  filterable?: boolean;                          // Enable filtering
  editable?: boolean;                            // Enable inline editing
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';

  // NEW: Formatting and styling options
  formatter?: (value: any, row?: any) => string;     // Format value as text
  cellStyle?: (value: any, row?: any) => string;     // Inline CSS styles
  cellClass?: (value: any, row?: any) => string;     // CSS class names
  cellRenderer?: (value: any, row?: any) => string;  // Custom HTML
}
```

## Formatter Functions

### Currency Formatters

#### `formatCurrency(value)`
Standard UK currency formatting with thousands separators.

```typescript
import { formatCurrency } from '$lib/dataGridFormatters';

{
  id: 'salary',
  header: 'Salary',
  type: 'number',
  formatter: formatCurrency
}
// Output: £75,000
```

#### `formatCurrencyDecimals(value)`
UK currency with 2 decimal places.

```typescript
{
  id: 'price',
  header: 'Price',
  formatter: formatCurrencyDecimals
}
// Output: £75,000.00
```

#### `formatCurrencyCompact(value)`
Compact notation with K/M abbreviations.

```typescript
import { formatCurrencyCompact } from '$lib/dataGridFormatters';

{
  id: 'revenue',
  header: 'Revenue',
  type: 'number',
  formatter: formatCurrencyCompact
}
// Output: £75K, £1.5M, £2.3B
```

### Percentage Formatters

#### `formatPercentage(value, decimals?)`
Format number (0-100 range) as percentage.

```typescript
import { formatPercentage } from '$lib/dataGridFormatters';

{
  id: 'completion',
  header: 'Progress',
  formatter: (value) => formatPercentage(value, 1)
}
// Output: 87.5%
```

#### `formatPercentageFromDecimal(value, decimals?)`
Format decimal (0-1 range) as percentage.

```typescript
{
  id: 'efficiency',
  header: 'Efficiency',
  formatter: (value) => formatPercentageFromDecimal(value, 2)
}
// Output: 87.50% (from 0.875)
```

### Date Formatters

#### `formatDateUK(value)`
UK date format (DD/MM/YYYY).

```typescript
import { formatDateUK } from '$lib/dataGridFormatters';

{
  id: 'startDate',
  header: 'Start Date',
  formatter: formatDateUK
}
// Output: 15/03/2020
```

#### `formatDateRelative(value)`
Relative time format.

```typescript
import { formatDateRelative } from '$lib/dataGridFormatters';

{
  id: 'hireDate',
  header: 'Tenure',
  formatter: formatDateRelative
}
// Output: "2 years ago", "3 months ago", "Yesterday"
```

### Number Formatters

#### `formatNumber(value)`
Number with thousands separators.

```typescript
import { formatNumber } from '$lib/dataGridFormatters';

{
  id: 'quantity',
  header: 'Quantity',
  formatter: formatNumber
}
// Output: 1,234,567
```

#### `formatNumberCompact(value)`
Compact number notation.

```typescript
import { formatNumberCompact } from '$lib/dataGridFormatters';

{
  id: 'views',
  header: 'Views',
  formatter: formatNumberCompact
}
// Output: 1.5M, 750K
```

## Styling Functions

### Gradient Styling

#### `createGradientStyle(min, max, colorLow, colorHigh)`
Creates background gradient based on value range.

```typescript
import { createGradientStyle } from '$lib/dataGridFormatters';

{
  id: 'salary',
  header: 'Salary',
  type: 'number',
  formatter: formatCurrency,
  cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
}
// Low values: red background
// High values: green background
// Interpolated colours in between
```

**Parameters:**
- `min` - Minimum value for gradient (0%)
- `max` - Maximum value for gradient (100%)
- `colorLow` - Hex colour for low values (default: `#ef4444` red)
- `colorHigh` - Hex colour for high values (default: `#22c55e` green)

#### `createTextColorGradient(min, max, colorLow, colorHigh)`
Same as above but only changes text colour (no background).

```typescript
import { createTextColorGradient } from '$lib/dataGridFormatters';

{
  id: 'score',
  header: 'Score',
  cellStyle: createTextColorGradient(0, 100, '#dc2626', '#16a34a')
}
```

### Conditional Styling

#### `createConditionalStyle(conditions)`
Apply different styles based on conditions.

```typescript
import { createConditionalStyle } from '$lib/dataGridFormatters';

{
  id: 'salary',
  header: 'Salary',
  cellStyle: createConditionalStyle([
    {
      condition: (value) => value < 50000,
      style: 'color: #dc2626; font-weight: bold;'
    },
    {
      condition: (value) => value >= 100000,
      style: 'color: #16a34a; font-weight: bold;'
    }
  ])
}
```

#### `createConditionalClass(conditions)`
Apply different CSS classes based on conditions.

```typescript
import { createConditionalClass } from '$lib/dataGridFormatters';

{
  id: 'status',
  header: 'Status',
  cellClass: createConditionalClass([
    { condition: (v) => v === 'active', class: 'status-active' },
    { condition: (v) => v === 'inactive', class: 'status-inactive' }
  ])
}
```

## Renderer Functions

Renderers generate custom HTML for cells. They're more powerful than formatters but require sanitised inputs.

### Status Badges

#### `createStatusBadge(statusConfig)`
Render colourful status badges.

```typescript
import { createStatusBadge } from '$lib/dataGridFormatters';

{
  id: 'status',
  header: 'Status',
  cellRenderer: createStatusBadge({
    'active': { color: '#22c55e', label: 'Active' },
    'on-leave': { color: '#f59e0b', label: 'On Leave' },
    'inactive': { color: '#ef4444', label: 'Inactive' }
  })
}
```

**Output:**
- Rounded pill-shaped badges
- Custom background colours
- White text
- Uppercase labels

### Icon Indicators

#### `createIconRenderer(ranges)`
Render icons based on value ranges.

```typescript
import { createIconRenderer } from '$lib/dataGridFormatters';

{
  id: 'salary',
  header: 'Level',
  cellRenderer: createIconRenderer([
    { max: 50000, icon: '📉', color: '#ef4444', label: 'Entry' },
    { max: 100000, icon: '📊', color: '#f59e0b', label: 'Mid' },
    { max: Infinity, icon: '📈', color: '#22c55e', label: 'Senior' }
  ])
}
```

**Output:** Icon + coloured label

### Progress Bars

#### `createProgressBar(min, max, color?)`
Render inline progress bars.

```typescript
import { createProgressBar } from '$lib/dataGridFormatters';

{
  id: 'completion',
  header: 'Progress',
  cellRenderer: createProgressBar(0, 100, '#3b82f6')
}
```

**Output:** Visual progress bar with percentage

## Usage Examples

### Example 1: Salary Column with Gradient

```typescript
import { formatCurrencyCompact, createGradientStyle } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  {
    id: 'salary',
    header: 'Salary',
    width: 130,
    type: 'number',
    formatter: formatCurrencyCompact,
    cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
  }
];
```

**Result:**
- Displays as "£75K" or "£1.5M"
- Background colour transitions from red (low) to green (high)
- White text for readability
- Rounded corners

### Example 2: Status Column with Badges

```typescript
import { createStatusBadge } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  {
    id: 'status',
    header: 'Status',
    width: 120,
    cellRenderer: createStatusBadge({
      'active': { color: '#22c55e', label: 'Active' },
      'on-leave': { color: '#f59e0b', label: 'On Leave' },
      'inactive': { color: '#ef4444', label: 'Inactive' },
      'pending': { color: '#6b7280', label: 'Pending' }
    })
  }
];
```

**Result:**
- Green pill for "Active"
- Orange pill for "On Leave"
- Red pill for "Inactive"
- Grey pill for "Pending"

### Example 3: Multiple Salary Columns

Show salary in different formats side-by-side:

```typescript
import { formatCurrency, formatCurrencyCompact, createGradientStyle } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  // Full format
  {
    id: 'salary',
    header: 'Salary (Full)',
    width: 130,
    type: 'number',
    formatter: formatCurrency
  },
  // Compact format with gradient
  {
    id: 'salary',
    header: 'Salary (Compact)',
    width: 130,
    type: 'number',
    formatter: formatCurrencyCompact,
    cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
  },
  // Performance indicator
  {
    id: 'salary',
    header: 'Level',
    width: 140,
    cellRenderer: createIconRenderer([
      { max: 50000, icon: '📉', color: '#ef4444', label: 'Entry' },
      { max: 80000, icon: '➡️', color: '#f59e0b', label: 'Mid' },
      { max: 110000, icon: '📊', color: '#3b82f6', label: 'Senior' },
      { max: Infinity, icon: '📈', color: '#22c55e', label: 'Executive' }
    ])
  }
];
```

### Example 4: Date Column with Relative Time

```typescript
import { formatDateUK, formatDateRelative } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  // Standard UK format
  {
    id: 'hireDate',
    header: 'Hire Date',
    width: 110,
    type: 'date',
    formatter: formatDateUK
  },
  // Relative time
  {
    id: 'hireDate',
    header: 'Tenure',
    width: 120,
    formatter: formatDateRelative
  }
];
```

**Result:**
- First column: "15/03/2020"
- Second column: "4 years ago"

### Example 5: Conditional Text Colour

```typescript
import { formatNumber, createConditionalStyle } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  {
    id: 'stock',
    header: 'Stock Level',
    type: 'number',
    formatter: formatNumber,
    cellStyle: createConditionalStyle([
      {
        condition: (value) => value < 10,
        style: 'color: #dc2626; font-weight: bold;' // Red for low stock
      },
      {
        condition: (value) => value < 50,
        style: 'color: #f59e0b; font-weight: 600;' // Orange for medium
      },
      {
        condition: (value) => value >= 50,
        style: 'color: #16a34a;' // Green for high stock
      }
    ])
  }
];
```

## Creating Custom Formatters

### Simple Formatter

```typescript
function formatPhoneNumber(value: string): string {
  if (!value) return '—';

  // Format +44 20 7946 0958 as +44 (20) 7946-0958
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/);

  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }

  return value;
}

// Use in column definition
{
  id: 'phone',
  header: 'Phone',
  formatter: formatPhoneNumber
}
```

### Formatter with Parameters

```typescript
function createCurrencyFormatter(currencySymbol: string, locale: string) {
  return (value: any): string => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '—';

    return `${currencySymbol}${num.toLocaleString(locale)}`;
  };
}

// Use in column definition
{
  id: 'price',
  header: 'Price (USD)',
  formatter: createCurrencyFormatter('$', 'en-US')
}
```

### Row-Aware Formatter

Access the entire row data:

```typescript
function formatFullName(value: any, row?: any): string {
  if (!row) return value;
  return `${row.firstName} ${row.lastName}`;
}

// Use in column definition
{
  id: 'firstName', // Can use any column ID
  header: 'Full Name',
  formatter: formatFullName
}
```

### Custom Style Function

```typescript
function createHeatmapStyle(min: number, max: number) {
  return (value: any): string => {
    if (value === null || value === undefined) return '';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '';

    const normalized = (num - min) / (max - min);
    const opacity = 0.2 + (normalized * 0.8); // 20% to 100% opacity

    return `background-color: rgba(59, 130, 246, ${opacity}); font-weight: 600;`;
  };
}

// Use in column definition
{
  id: 'temperature',
  header: 'Temperature',
  cellStyle: createHeatmapStyle(-10, 40)
}
```

### Custom Renderer

```typescript
function renderRating(value: any): string {
  if (!value) return '—';
  const rating = Math.min(5, Math.max(0, Math.round(value)));
  const filled = '⭐'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);

  return `<span style="color: #f59e0b; letter-spacing: 2px;">${filled}${empty}</span>`;
}

// Use in column definition
{
  id: 'rating',
  header: 'Rating',
  cellRenderer: renderRating
}
```

## Best Practices

### 1. Performance Considerations

- **Formatters** are fast - use liberally
- **Styles** add minimal overhead
- **Renderers** generate HTML - use for complex visualisations only
- Avoid complex calculations in formatters (pre-calculate if possible)

### 2. Combining Features

You can combine formatter + cellStyle:

```typescript
{
  id: 'salary',
  header: 'Salary',
  formatter: formatCurrencyCompact,              // Display as £75K
  cellStyle: createGradientStyle(30000, 150000)  // Colour gradient
}
```

### 3. Null/Undefined Handling

Always handle null/undefined values:

```typescript
function myFormatter(value: any): string {
  if (value === null || value === undefined) return '—'; // Em dash
  // ... rest of logic
}
```

### 4. Type Safety

Use TypeScript types for better IDE support:

```typescript
import type { DataGridColumn } from '$lib/types';

const columns: DataGridColumn[] = [
  // TypeScript will validate your column definitions
];
```

### 5. Accessibility

- Use semantic HTML in renderers
- Ensure colour contrast ratios meet WCAG standards
- Provide text alternatives for icon-only indicators

### 6. Theming

Consider dark mode when choosing colours:

```typescript
// Good: Use CSS custom properties
cellStyle: 'background: var(--accent-color); color: var(--accent-text);'

// Better: Detect colour scheme
cellStyle: (value) => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const bgColor = isDark ? '#3b82f6' : '#60a5fa';
  return `background-color: ${bgColor};`;
}
```

## Available Formatters Quick Reference

| Function | Input | Output Example |
|----------|-------|----------------|
| `formatCurrency` | 75000 | £75,000 |
| `formatCurrencyDecimals` | 75000 | £75,000.00 |
| `formatCurrencyCompact` | 1500000 | £1.5M |
| `formatPercentage` | 87.5 | 87.5% |
| `formatPercentageFromDecimal` | 0.875 | 87.5% |
| `formatDateUK` | Date object | 15/03/2020 |
| `formatDateRelative` | Date object | 2 years ago |
| `formatNumber` | 1234567 | 1,234,567 |
| `formatNumberCompact` | 1500000 | 1.5M |

## Styling Function Quick Reference

| Function | Purpose | Parameters |
|----------|---------|------------|
| `createGradientStyle` | Background gradient | min, max, colorLow, colorHigh |
| `createTextColorGradient` | Text colour gradient | min, max, colorLow, colorHigh |
| `createConditionalStyle` | Conditional styles | conditions[] |
| `createConditionalClass` | Conditional classes | conditions[] |

## Renderer Function Quick Reference

| Function | Purpose | Output |
|----------|---------|--------|
| `createStatusBadge` | Coloured status pills | HTML badge |
| `createIconRenderer` | Icon + label by range | Icon + text |
| `createProgressBar` | Visual progress bar | HTML progress bar |

---

For more examples, see the **Styled & Formatted** tab in the DataGrid demo page at `/datagrid`.
