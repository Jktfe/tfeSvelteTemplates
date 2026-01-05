# DatabaseStatus

## What It Does

DatabaseStatus displays a visual badge showing whether the application is connected to a Neon database or using fallback data from constants. Perfect for demo applications showing graceful degradation patterns.

**Think of it like:** A traffic light indicator -  green means "database connected", yellow means "using offline data".

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
| `usingDatabase` | `boolean` | required | Whether DATABASE_URL is configured and active |
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

```typescript
// src/routes/cardstack/+page.server.ts
import { loadCardsFromDatabase } from '$lib/server/cards';

export const load: PageServerLoad = async () => {
  const cards = await loadCardsFromDatabase();
  const usingDatabase = !!process.env.DATABASE_URL;

  return { cards, usingDatabase };
};
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
- **Label**: "Using Fallback Data"

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **ARIA live region** | `role="status"` with `aria-live="polite"` |
| **Screen readers** | Icon hidden with `aria-hidden="true"`, meaningful label text |
| **Keyboard** | Not focusable (informational display only) |
| **State changes** | Announced automatically by screen readers via live region |

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

---

## Integration Pattern

DatabaseStatus works with the graceful fallback pattern used throughout the TFE Svelte Templates library:

```svelte
<!-- 1. Server utility checks DATABASE_URL -->
<!-- 2. Returns database data OR fallback constants -->
<!-- 3. Pass connection status to client -->

<!-- Server-side (+page.server.ts) -->
<script lang="ts">
  import { loadCardsFromDatabase } from '$lib/server/cards';

  export const load = async () => {
    const cards = await loadCardsFromDatabase();
    const usingDatabase = !!process.env.DATABASE_URL;

    return { cards, usingDatabase };
  };
</script>

<!-- Client-side (+page.svelte) -->
<script>
  import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
  let { data } = $props();
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} />
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

---

*Documentation created: 3 January 2026*
