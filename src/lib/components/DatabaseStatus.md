# DatabaseStatus

## What It Does

DatabaseStatus displays a visual badge showing where a page's data came from: a live Neon database, demo fixture constants, a failed database query (with fixtures served instead), or intentionally static demo data. Perfect for demo applications showing graceful degradation patterns.

**Think of it like:** A traffic light indicator - green means "database connected", yellow means "using demo fixtures", red means "the database was configured but the query failed", and grey means "this page never uses a database".

---

## Quick Start

```svelte
<script>
  let { data } = $props();
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} />
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `usingDatabase` | `boolean` | required | Whether DATABASE_URL is configured and active. Used to pick `database` vs `fallback` when `source` is omitted. |
| `source` | `'database' \| 'fallback' \| 'error' \| 'static'` | derived from `usingDatabase` | Explicit state, normally `DataSourceResult.source`. Takes precedence over `usingDatabase`. |
| `message` | `string` | `''` | Optional detail (e.g. the error message) shown as the badge's `title` tooltip. |
| `class` | `string` | `''` | Additional CSS classes for styling |

---

## Usage Examples

### Basic Usage (in a route)

```svelte
<!-- src/routes/cardstack/+page.svelte -->
<script>
  import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

  let { data } = $props();
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} />
```

### Server-Side Connection Check

Server utilities return a `DataSourceResult<T>` (see `src/lib/server/dataSource.ts`), which already carries everything the badge needs:

```typescript
// src/routes/cardstack/+page.server.ts
import { loadCardsFromDatabase } from '$lib/server/cards';

export const load: PageServerLoad = async () => {
  const result = await loadCardsFromDatabase();

  return {
    cards: result.data,
    usingDatabase: result.usingDatabase,
    source: result.source,
    message: result.message
  };
};
```

```svelte
<DatabaseStatus
  usingDatabase={data.usingDatabase}
  source={data.source}
  message={data.message}
/>
```

### In a Page Header

```svelte
<header class="page-header">
  <h1>Component Demo</h1>
  <DatabaseStatus usingDatabase={data.usingDatabase} />
</header>
```

### With Custom Styling

```svelte
<DatabaseStatus
  usingDatabase={data.usingDatabase}
  class="header-badge"
/>

<style>
  :global(.header-badge) {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
</style>
```

---

## Visual States

### Connected (Database Active)
- **Icon**: 🟢 (green circle)
- **Colour**: Green background with dark green text
- **Label**: "Database Connected"

### Fallback (Using Constants)
- **Icon**: 🟡 (yellow circle)
- **Colour**: Yellow background with amber text
- **Label**: "Demo Fixture Data"

### Error (Query Failed, Fixtures Served)
- **Icon**: 🔴 (red circle)
- **Colour**: Red background with dark red text
- **Label**: "Database Error - Demo Fixtures"

### Static (No Database By Design)
- **Icon**: ⚪ (white circle)
- **Colour**: Slate background with grey text
- **Label**: "Static Demo Data"

In dark mode (`prefers-color-scheme: dark`) each state keeps its hue but switches to translucent tints so the pill does not glare on dark chrome.

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **ARIA live region** | `role="status"` with `aria-live="polite"` |
| **Screen readers** | Icon hidden with `aria-hidden="true"`, meaningful label text |
| **Keyboard** | Not focusable (informational display only) |
| **State changes** | Announced automatically by screen readers via live region |
| **Reduced motion** | Colour transitions are switched off under `prefers-reduced-motion: reduce` |

---

## Styling

The component uses **scoped CSS** with pill-shaped badge design:

### Connected State
```css
background: #f0fdf4;      /* Light green */
border-color: #86efac;    /* Green border */
color: #166534;           /* Dark green text */
```

### Fallback State
```css
background: #fefce8;      /* Light yellow */
border-color: #fde047;    /* Yellow border */
color: #854d0e;           /* Amber text */
```

### Transitions
Only the properties that actually change between states are animated:

```css
transition:
  background-color 0.3s ease,
  border-color 0.3s ease,
  color 0.3s ease;

@media (prefers-reduced-motion: reduce) {
  .database-status { transition: none; }
}
```

Listing the properties (rather than `transition: all`) stops the padding and font-size from animating when the mobile breakpoint kicks in.

---

## Integration Pattern

DatabaseStatus works with the graceful fallback pattern used throughout the TFE Svelte Templates library:

```svelte
<!-- 1. Server utility checks DATABASE_URL (getConfiguredDatabaseUrl) -->
<!-- 2. Returns a DataSourceResult: database rows OR fallback constants -->
<!-- 3. The page load passes result.source / usingDatabase / message to the client -->

<!-- Client-side (+page.svelte) -->
<script>
  import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
  let { data } = $props();
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} source={data.source} message={data.message} />
```

---

## Responsive Behaviour

**Mobile (≤640px)**:
- Smaller font size (0.75rem)
- Reduced padding (0.375rem 0.75rem)
- Smaller icon (0.875rem)

**Desktop**:
- Standard font size (0.875rem)
- Standard padding (0.5rem 1rem)
- Standard icon (1rem)

---

## Common Use Cases

1. **Development**: Show when working without database setup
2. **Demos**: Indicate data source to viewers
3. **Templates**: Educational pattern for resilient architecture
4. **Testing**: Visual confirmation of data source

---

## Dependencies

**Zero external dependencies.**

Uses only:
- Svelte 5 (`$props`, `$derived` runes)
- Standard CSS
- Emoji for icons

---

## Related Components

- **AuthStatus**: Shows authentication state (same design pattern)
- **Server utilities**: `loadCardsFromDatabase()`, `loadTestimonialsFromDatabase()`, etc.
- **FALLBACK_* constants**: Data sources when database unavailable

