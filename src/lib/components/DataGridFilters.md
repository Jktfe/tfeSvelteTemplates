# DataGridFilters — Technical Logic Explainer

## What Does It Do? (Plain English)

DataGridFilters is a fold-away panel of structured filters for tabular data: tick departments and statuses, drag a salary range, pick a hire-date window. Every change is handed to your code as a plain object — the panel never filters anything itself, so it works just as well in front of DataGridBasic, DataGridAdvanced or a server query.

**Think of it like:** the filter sidebar on a shopping site. It remembers what you've ticked and tells the shop; the shop decides which products to show.

---

## How It Works (Pseudo-Code)

```
on mount:
  filters = { departments: [], statuses: [],
              salaryMin: salaryRange.min, salaryMax: salaryRange.max,
              hireDateFrom: '', hireDateTo: '' }
  isExpanded = initiallyExpanded
  uid = $props.id()                       # unique ids per instance

derived:
  activeFilterCount = number of filter TYPES that differ from the empty state (0–4)

effect (runs on mount and after every change):
  onFiltersChange($state.snapshot(filters))   # plain object, not the live proxy

events:
  toggle button     → isExpanded = !isExpanded
  tick checkbox     → add/remove the value from departments / statuses
  drag min slider   → salaryMin = v; if v > salaryMax: salaryMax = v
  drag max slider   → salaryMax = v; if v < salaryMin: salaryMin = v
  pick "Hired from" → hireDateFrom = date   ("Hired to" picker gets min = that date)
  pick "Hired to"   → hireDateTo = date     ("Hired from" picker gets max = that date)
  Clear all         → filters = empty state
```

---

## The Core Concept: The Panel Owns UI State, the Parent Owns Meaning

The panel's only job is to produce a `DataGridFilterValues` object:

```ts
interface DataGridFilterValues {
  departments: string[];   // [] = no department filter
  statuses: string[];      // [] = no status filter
  salaryMin: number;       // === salaryRange.min means "no lower bound"
  salaryMax: number;       // === salaryRange.max means "no upper bound"
  hireDateFrom: string;    // '' or 'yyyy-mm-dd'
  hireDateTo: string;      // '' or 'yyyy-mm-dd'
}
```

Applying it is a one-liner-per-rule in the parent:

```svelte
<script lang="ts">
  import DataGridFilters from '$lib/components/DataGridFilters.svelte';
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import type { DataGridColumn, DataGridFilterValues, Employee } from '$lib/types';

  let { data } = $props();
  let filters = $state<DataGridFilterValues | null>(null);

  const visible = $derived(
    data.employees.filter((e: Employee) => {
      if (!filters) return true;
      if (filters.departments.length && !filters.departments.includes(e.department)) return false;
      if (filters.statuses.length && !filters.statuses.includes(e.status)) return false;
      if (e.salary < filters.salaryMin || e.salary > filters.salaryMax) return false;
      const hired = new Date(e.hireDate).toISOString().slice(0, 10);
      if (filters.hireDateFrom && hired < filters.hireDateFrom) return false;
      if (filters.hireDateTo && hired > filters.hireDateTo) return false;
      return true;
    })
  );

  const columns: DataGridColumn[] = [
    { id: 'firstName', header: 'First name' },
    { id: 'department', header: 'Department' },
    { id: 'salary', header: 'Salary', type: 'number' }
  ];
</script>

<DataGridFilters
  departments={['Engineering', 'Sales', 'Marketing']}
  statuses={['active', 'on-leave', 'inactive']}
  onFiltersChange={(next) => (filters = next)}
/>
<DataGridBasic data={visible} {columns} />
```

Two design choices make this safe:

- **Snapshots, not proxies.** `$state.snapshot(filters)` both subscribes the effect to every nested field *and* hands the parent a plain object. The parent can store, mutate or serialise it without reaching back into the panel's state.
- **The empty state is the bounds.** "No salary filter" is simply `salaryMin === salaryRange.min && salaryMax === salaryRange.max`, so the parent's `salary < min || salary > max` test needs no special case.

---

## Recipes

**Debounce an expensive filter pass**

```svelte
<script lang="ts">
  import type { DataGridFilterValues } from '$lib/types';

  let pending: ReturnType<typeof setTimeout> | undefined;
  let filters = $state<DataGridFilterValues | null>(null);

  function queue(next: DataGridFilterValues) {
    clearTimeout(pending);
    pending = setTimeout(() => (filters = next), 250);
  }
</script>

<DataGridFilters departments={['Engineering', 'Sales']} onFiltersChange={queue} />
```

**Mirror filters into the URL**

```ts
import { goto } from '$app/navigation';

function syncUrl(f: DataGridFilterValues) {
  const params = new URLSearchParams();
  if (f.departments.length) params.set('dept', f.departments.join(','));
  if (f.hireDateFrom) params.set('from', f.hireDateFrom);
  goto(`?${params}`, { replaceState: true, keepFocus: true, noScroll: true });
}
```

---

## Theming

Tokens follow `docs/THEMING.md`: chrome flips under `prefers-color-scheme: dark`; the accent is brand and stays put.

| Property | Light | Dark | Used by |
|---|---|---|---|
| `--dgf-surface` | `#ffffff` | `#1f2937` | Panel background |
| `--dgf-border` | `#e5e7eb` | `#374151` | Frame, header divider |
| `--dgf-fg` / `--dgf-label-fg` / `--dgf-body-fg` / `--dgf-muted-fg` | slate scale | light scale | Titles, legends, options, sub-labels |
| `--dgf-input-bg` / `--dgf-input-border` | `#ffffff` / `#d1d5db` | `#111827` / `#4b5563` | Date inputs, Clear button |
| `--dgf-track` | `#e5e7eb` | `#374151` | Slider track |
| `--dgf-button-bg` / `-hover-bg` / `-hover-border` | light greys | dark greys | Clear all |
| `--dgf-accent` *(brand)* | `#146ef5` | *unchanged* | Badge, slider thumb, checkbox tint, focus |
| `--dgf-accent-hover` / `--dgf-on-accent` / `--dgf-focus-ring` *(brand)* | — | *unchanged* | Hover thumb, badge text, date focus halo |

```css
.hr-dashboard :global(.filters-container.filters-container) {
  --dgf-accent: #7c3aed;
}
```

---

## State Flow Diagram

```
   ┌───────────┐  toggle   ┌──────────┐
   │ collapsed │ ────────▶ │ expanded │
   │ (default) │ ◀──────── │          │
   └─────┬─────┘  toggle   └────┬─────┘
         │                      │ tick / drag / pick date
         │                      ▼
         │              ┌───────────────┐
         │              │ filters change│── snapshot ──▶ onFiltersChange
         │              └──────┬────────┘
         │                     │ activeFilterCount > 0
         │                     ▼
         │           badge + "Clear all" visible
         │                     │ Clear all
         └──────────────◀──────┘ filters = empty state (panel stays open)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `departments` | `string[]` | `[]` | Department checkbox options; the group is hidden when empty. |
| `statuses` | `string[]` | `[]` | Status checkbox options; the group is hidden when empty. |
| `salaryRange` | `{ min: number; max: number }` | `{ min: 30000, max: 150000 }` | Slider bounds, which also define the "no salary filter" state. |
| `salaryStep` | `number` | `5000` | Step size for both salary sliders. |
| `initiallyExpanded` | `boolean` | `false` | Start with the panel open. |
| `onFiltersChange` | `(filters: DataGridFilterValues) => void` | — | Receives a plain snapshot on mount and after every change. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Min slider dragged past max | Max moves with it (and vice versa) — the range can never invert. |
| "Hired from" later than "Hired to" | The pickers constrain each other via `min` / `max`; typed values still pass through, so validate on the server if it matters. |
| Two panels on one page | `$props.id()` gives every control a unique `id`; labels and `aria-controls` stay correct. |
| `departments` / `statuses` empty | Those groups aren't rendered; salary and date groups always are. |
| Parent mutates the emitted object | No effect on the panel — it received a snapshot. |
| `salaryRange` prop changes after mount | The current selection is kept; "Clear all" resets to the new bounds. |
| `onFiltersChange` omitted | The panel still works as a standalone UI (useful in storybooks). |
| `prefers-reduced-motion: reduce` | Reveal animation and chevron/hover transitions are disabled. |

---

## Dependencies

- **Svelte 5.20+** — `$state`, `$derived.by`, `$effect`, `$state.snapshot` and `$props.id()`.
- **`$lib/types`** — type-only import of `DataGridFilterValues`.
- Zero external packages; native `<input type="range">`, `<input type="date">` and `<fieldset>`.

---

## File Structure

```
src/lib/components/DataGridFilters.svelte     # implementation
src/lib/components/DataGridFilters.md         # this file
src/lib/components/DataGridFilters.test.ts    # panel, filter values, snapshot, clamp, clear-all tests
src/lib/types.ts                              # DataGridFilterValues
src/routes/datagrid/+page.svelte              # demo: filters wired into DataGridAdvanced
```
