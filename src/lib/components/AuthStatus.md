# AuthStatus

## What It Does

AuthStatus displays a visual badge showing whether Clerk authentication is configured and active. It follows the same design pattern as DatabaseStatus for consistency, using colour-coded pills with emoji icons to indicate the auth state at a glance.

**Think of it like:** A status light on your dashboard that shows "green = auth enabled" or "grey = running in demo mode".

---

## Quick Start

```svelte
<script>
  let { data } = $props();
</script>

<AuthStatus isConfigured={data.isConfigured} />
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isConfigured` | `boolean` | required | Whether Clerk authentication keys are configured |
| `class` | `string` | `''` | Additional CSS classes for styling |

---

## Usage Examples

### Basic Usage (in a route)

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import AuthStatus from '$lib/components/AuthStatus.svelte';

  let { data } = $props();
</script>

<AuthStatus isConfigured={data.isConfigured} />
```

### Server-Side Configuration Check

```typescript
// src/routes/+layout.server.ts
export const load = async ({ locals }) => {
  const isConfigured = !!locals.auth();
  return { isConfigured };
};
```

### In a Header/Navbar

```svelte
<nav>
  <div class="status-indicators">
    <DatabaseStatus usingDatabase={data.usingDatabase} />
    <AuthStatus isConfigured={data.isConfigured} />
  </div>
</nav>
```

### With Custom Styling

```svelte
<AuthStatus
  isConfigured={data.isConfigured}
  class="my-custom-badge"
/>

<style>
  :global(.my-custom-badge) {
    margin-left: 1rem;
  }
</style>
```

---

## Visual States

### Configured (Auth Enabled)
- **Icon**: 🔐 (locked padlock)
- **Colour**: Green background with dark green text
- **Label**: "Auth Enabled"
- **Tooltip**: "Clerk authentication is configured and active"

### Demo Mode (Not Configured)
- **Icon**: 🔓 (unlocked padlock)
- **Colour**: Grey background with grey text
- **Label**: "Auth Demo Mode"
- **Tooltip**: "Running without Clerk keys - configure in .env"

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **ARIA live region** | `role="status"` with `aria-live="polite"` |
| **Tooltip** | `title` attribute with descriptive text |
| **Screen readers** | Icon hidden with `aria-hidden="true"`, meaningful label text |
| **Keyboard** | Not focusable (informational display only) |
| **Reduced motion** | Hover animations disabled via `@media (prefers-reduced-motion: reduce)` |

---

## Styling

The component uses **scoped CSS** with no external dependencies. Key design tokens:

### Configured State
```css
background: #f0fdf4;      /* Light green */
border-color: #86efac;    /* Green border */
color: #166534;           /* Dark green text */
```

### Demo Mode State
```css
background: #f3f4f6;      /* Light grey */
border-color: #d1d5db;    /* Grey border */
color: #6b7280;           /* Grey text */
```

### Hover Effect
```css
transform: translateY(-1px);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

---

## Integration Pattern

AuthStatus is designed to work with the Clerk authentication system:

```svelte
<!-- 1. Configure Clerk in hooks.server.ts -->
<!-- 2. Check auth status in layout server -->
<!-- 3. Pass status to client components -->

<!-- +layout.server.ts -->
<script lang="ts">
  export const load = async ({ locals }) => {
    const auth = locals.auth();
    return {
      isConfigured: !!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
      userId: auth?.userId
    };
  };
</script>

<!-- +layout.svelte -->
<script>
  import AuthStatus from '$lib/components/AuthStatus.svelte';
  let { data } = $props();
</script>

<header>
  <AuthStatus isConfigured={data.isConfigured} />
</header>
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

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Dependencies

**Zero external dependencies.**

Uses only:
- Svelte 5 (`$props`, `$derived` runes)
- Standard CSS
- Emoji for icons (no icon library required)

---

## Related Components

- **DatabaseStatus**: Shows database connection state (same design pattern)
- **Navbar**: Common location for status indicators
- **Layout components**: Typically used in headers or footers

---

*Documentation created: 3 January 2026*
