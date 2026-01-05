# DataGridFilters

## What It Does

DataGridFilters provides a comprehensive, collapsible filtering interface for data grids with multi-select checkboxes, range sliders, and date pickers. It demonstrates advanced state management with Svelte 5 and reactive filter counting.

**Think of it like:** The filter panel you see on shopping websites - tick boxes for categories, price sliders, date ranges - all working together to narrow down results.

---

## Quick Start

```svelte
<script>
  import DataGridFilters from '$lib/components/DataGridFilters.svelte';

  function handleFiltersChange(filters) {
    console.log('Active filters:', filters);
    // Apply filters to your data grid
  }
</script>

<DataGridFilters
  departments={['Engineering', 'Sales', 'Marketing']}
  statuses={['active', 'on-leave', 'inactive']}
  salaryRange={{ min: 30000, max: 150000 }}
  onFiltersChange={handleFiltersChange}
/>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `departments` | `string[]` | `[]` | Available department options for filtering |
| `statuses` | `string[]` | `[]` | Available status options for filtering |
| `salaryRange` | `{min, max}` | `{min:30000, max:150000}` | Salary range boundaries |
| `initiallyExpanded` | `boolean` | `false` | Whether filter panel starts expanded |
| `onFiltersChange` | `(filters) => void` | - | Callback when filters change |

---

## Filter Values Structure

The component returns a `DataGridFilterValues` object:

```typescript
interface DataGridFilterValues {
  departments: string[];     // Selected departments
  statuses: string[];        // Selected statuses
  salaryMin: number;         // Minimum salary threshold
  salaryMax: number;         // Maximum salary threshold
  hireDateFrom: string;      // Start date (YYYY-MM-DD)
  hireDateTo: string;        // End date (YYYY-MM-DD)
}
```

---

## Usage Examples

### With DataGridBasic

```svelte
<script>
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import DataGridFilters from '$lib/components/DataGridFilters.svelte';

  let employees = $state([/* employee data */]);
  let filters = $state({});

  // Apply filters to data
  let filteredEmployees = $derived(() => {
    return employees.filter(emp => {
      // Department filter
      if (filters.departments?.length > 0 &&
          !filters.departments.includes(emp.department)) {
        return false;
      }

      // Status filter
      if (filters.statuses?.length > 0 &&
          !filters.statuses.includes(emp.status)) {
        return false;
      }

      // Salary range
      if (emp.salary < filters.salaryMin || emp.salary > filters.salaryMax) {
        return false;
      }

      // Hire date range
      if (filters.hireDateFrom && emp.hireDate < filters.hireDateFrom) {
        return false;
      }
      if (filters.hireDateTo && emp.hireDate > filters.hireDateTo) {
        return false;
      }

      return true;
    });
  });
</script>

<DataGridFilters
  departments={['Engineering', 'Sales', 'Marketing', 'HR']}
  statuses={['active', 'on-leave', 'inactive']}
  salaryRange={{ min: 30000, max: 150000 }}
  initiallyExpanded={true}
  onFiltersChange={(f) => filters = f}
/>

<DataGridBasic data={filteredEmployees()} columns={columns} />
```

### Initially Collapsed with Active Count

```svelte
<DataGridFilters
  departments={uniqueDepartments}
  statuses={uniqueStatuses}
  initiallyExpanded={false}
  onFiltersChange={applyFilters}
/>
<!-- Shows: "Filters (3)" badge when 3 filters are active -->
```

### Dynamic Options from Data

```svelte
<script>
  let employees = $state([/* data */]);

  // Extract unique values for filter options
  let departments = $derived(() => {
    return [...new Set(employees.map(e => e.department))];
  });

  let statuses = $derived(() => {
    return [...new Set(employees.map(e => e.status))];
  });

  let salaryRange = $derived(() => {
    const salaries = employees.map(e => e.salary);
    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  });
</script>

<DataGridFilters
  departments={departments()}
  statuses={statuses()}
  salaryRange={salaryRange()}
  onFiltersChange={handleFilters}
/>
```

---

## Features

### Active Filter Count
- Displays badge with number of active filters
- A filter is "active" when it differs from default state
- Badge appears next to "Filters" heading

### Clear All Filters
- Button appears when any filters are active
- Resets all filters to default state
- Triggers `onFiltersChange` callback

### Collapsible Panel
- Click "Filters" heading to expand/collapse
- Remembers state within session
- Smooth slide-down animation
- `aria-expanded` for screen readers

### Multi-Select Checkboxes
- Select multiple departments
- Select multiple statuses
- Independent selection (not mutually exclusive)

### Range Sliders
- Minimum and maximum salary sliders
- Live value display with currency formatting (£)
- £5,000 step increments (configurable)
- Visual feedback with blue thumbs

### Date Range Picker
- Native HTML5 date inputs
- "From" and "To" date selection
- No external date picker library required

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **Expandable region** | `aria-expanded` and `aria-controls` attributes |
| **Filter groups** | `role="group"` with `aria-label` |
| **Active count** | `aria-label` on badge (e.g., "3 active filters") |
| **Clear button** | `aria-label="Clear all filters"` |
| **Form controls** | Proper `<label>` associations |
| **Focus indicators** | Blue rings on all interactive elements |

---

## Styling

### Filter Header
```css
background: white;
border: 1px solid #e5e7eb;
padding: 1rem 1.25rem;
```

### Active Filters Badge
```css
background: #146ef5;      /* Blue */
color: white;
border-radius: 12px;
min-width: 1.5rem;
```

### Clear Button
```css
background: #f3f4f6;      /* Light grey */
border: 1px solid #d1d5db;
/* Hover: Darker grey */
```

### Range Slider Thumbs
```css
background: #146ef5;      /* Blue */
width: 18px;
height: 18px;
border-radius: 50%;
```

---

## Responsive Behaviour

**Desktop**:
- Filter groups in CSS Grid (auto-fit, min 250px)
- Date inputs side-by-side

**Mobile (≤768px)**:
- Single column layout
- Date inputs stacked vertically
- Full-width checkboxes

---

## State Management Pattern

The component uses Svelte 5's reactive runes for efficient state tracking:

```typescript
// Filter state
let filters = $state<DataGridFilterValues>({
  departments: [],
  statuses: [],
  salaryMin: salaryRange.min,
  salaryMax: salaryRange.max,
  hireDateFrom: '',
  hireDateTo: ''
});

// Count active filters reactively
let activeFilterCount = $derived(() => {
  let count = 0;
  if (filters.departments.length > 0) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.salaryMin !== salaryRange.min ||
      filters.salaryMax !== salaryRange.max) count++;
  if (filters.hireDateFrom || filters.hireDateTo) count++;
  return count;
});

// Notify parent on changes
$effect(() => {
  const _ = JSON.stringify(filters);
  onFiltersChange?.(filters);
});
```

---

## Common Patterns

### Debounced Filter Application

```svelte
<script>
  import { debounce } from '$lib/utils';

  let filters = $state({});

  const applyFilters = debounce((f) => {
    // Expensive filtering operation
    filteredData = performComplexFilter(data, f);
  }, 300);
</script>

<DataGridFilters onFiltersChange={applyFilters} />
```

### Persisting Filters in URL

```svelte
<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  function handleFiltersChange(filters) {
    const params = new URLSearchParams();

    if (filters.departments.length > 0) {
      params.set('dept', filters.departments.join(','));
    }
    if (filters.salaryMin) {
      params.set('salMin', filters.salaryMin.toString());
    }

    goto(`?${params.toString()}`, { replaceState: true });
  }
</script>
```

---

## Dependencies

**Zero external dependencies.**

Uses only:
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$bindable`)
- Standard HTML form elements
- Scoped CSS
- Native date picker

---

## Related Components

- **DataGridBasic**: Self-contained data grid (works great together)
- **DataGridAdvanced**: Production grid with SVAR Grid
- **Form components**: Uses similar patterns for inputs

---

*Documentation created: 3 January 2026*
