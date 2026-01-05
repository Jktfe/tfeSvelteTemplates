# StaggeredMenu

## What It Does

StaggeredMenu creates an animated navigation menu where items fly in one after another with cascading delays, creating a smooth waterfall effect. Perfect for mobile menus, dropdowns, and sidebar navigation with visual flair.

**Think of it like:** When you flip through a deck of cards, releasing them one at a time - each menu item appears with a slight delay after the previous one, creating a pleasing ripple effect.

---

## Quick Start

```svelte
<script>
  import StaggeredMenu from '$lib/components/StaggeredMenu.svelte';

  const menuItems = [
    { href: '/', label: 'Home', active: true },
    { href: '/about', label: 'About', icon: '👤' },
    { href: '/contact', label: 'Contact', icon: '📧' }
  ];
</script>

<StaggeredMenu items={menuItems} />
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[]` | required | Array of menu items to display |
| `isOpen` | `boolean` | `true` | Whether menu is visible (bindable) |

### MenuItem Interface

```typescript
interface MenuItem {
  label: string;      // Display text
  href: string;       // Link URL
  icon?: string;      // Optional emoji or icon character
  active?: boolean;   // Whether this is the current page
}
```

---

## Usage Examples

### Basic Menu

```svelte
<script>
  const items = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
</script>

<StaggeredMenu {items} />
```

### With Icons

```svelte
<script>
  const items = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/logout', label: 'Logout', icon: '🚪' }
  ];
</script>

<StaggeredMenu {items} />
```

### With Active State

```svelte
<script>
  import { page } from '$app/stores';

  const items = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  // Mark current page as active
  $: activeItems = items.map(item => ({
    ...item,
    active: $page.url.pathname === item.href
  }));
</script>

<StaggeredMenu items={activeItems} />
```

### Toggleable Menu (Mobile)

```svelte
<script>
  let menuOpen = $state(false);

  const items = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' }
  ];
</script>

<!-- Hamburger button -->
<button onclick={() => menuOpen = !menuOpen}>
  {menuOpen ? '✕' : '☰'}
</button>

<!-- Menu (controlled by isOpen binding) -->
<StaggeredMenu {items} bind:isOpen={menuOpen} />
```

---

## Animation Details

### Stagger Effect

Each menu item has two animations:

1. **CSS Animation** (persistent):
   - Fade in from `opacity: 0` to `opacity: 1`
   - Translate from `-10px` to `0` (slide down)
   - Delay calculated: `index × 50ms`

2. **Svelte Transition** (on mount):
   - Fly in from top (`y: -10`)
   - Duration: 300ms
   - Delay: `index × 50ms`

**Result**: Smooth cascading entrance where Item 1 appears immediately, Item 2 appears 50ms later, Item 3 appears 100ms later, etc.

### Configuration

```css
/* Stagger delay calculated per item */
style="--stagger-delay: {index * 0.05}s"
```

To change the delay between items, modify the multiplier:
- **Faster**: `index * 0.03s` (30ms gaps)
- **Slower**: `index * 0.1s` (100ms gaps)

---

## Visual States

### Default Link
```css
color: #4a5568;           /* Grey */
background: transparent;
```

### Hover
```css
color: #146ef5;                          /* Blue */
background: rgba(20, 110, 245, 0.05);   /* Light blue tint */
transform: translateY(-1px);             /* Subtle lift */
```

### Active (Current Page)
```css
color: #146ef5;           /* Blue */
font-weight: 600;         /* Bolder text */
/* Plus gradient underline */
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **Navigation landmark** | `<nav aria-label="Main navigation">` |
| **Current page** | `aria-current="page"` on active link |
| **Icon hiding** | Icons have `aria-hidden="true"` |
| **Keyboard nav** | Standard link focus with visible outline |
| **Focus indicators** | 2px blue outline with offset |

---

## Responsive Behaviour

### Desktop (≥769px)
- **Layout**: Horizontal row (`flex-direction: row`)
- **Gap**: 2rem between items
- **Padding**: 0.75rem × 1.25rem per link

### Mobile (≤768px)
- **Layout**: Vertical column (`flex-direction: column`)
- **Gap**: 0.5rem between items
- **Padding**: 1rem × 1.5rem per link
- **Full width**: Links span entire container

---

## Common Integration Patterns

### In a Navbar

```svelte
<header>
  <nav class="navbar">
    <a href="/" class="logo">MyApp</a>
    <StaggeredMenu {items} />
  </nav>
</header>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
  }
</style>
```

### As Dropdown Menu

```svelte
<div class="dropdown">
  <button onclick={() => dropdownOpen = !dropdownOpen}>
    Menu ▼
  </button>

  {#if dropdownOpen}
    <div class="dropdown-panel">
      <StaggeredMenu {items} bind:isOpen={dropdownOpen} />
    </div>
  {/if}
</div>

<style>
  .dropdown-panel {
    position: absolute;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>
```

### Mobile Sidebar

```svelte
<div class="sidebar" class:open={sidebarOpen}>
  <StaggeredMenu {items} bind:isOpen={sidebarOpen} />
</div>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    background: white;
    transition: left 0.3s ease;
    z-index: 1000;
  }

  .sidebar.open {
    left: 0;
  }
</style>
```

---

## Performance Notes

- **Zero JavaScript animation**: Uses CSS keyframes for smooth performance
- **GPU-accelerated**: `transform` properties use hardware acceleration
- **No layout thrashing**: Animations don't trigger reflows
- **Lightweight**: ~60 lines of code, no external dependencies

---

## Reduced Motion Support

The CSS animation respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .menu-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

Users who prefer reduced motion see instant menu display without animations.

---

## Customisation

### Change Stagger Timing

```svelte
<!-- Faster cascade (30ms between items) -->
{#each items as item, index}
  <li style="--stagger-delay: {index * 0.03}s">
    <!-- ... -->
  </li>
{/each}
```

### Change Animation Direction

```svelte
<!-- Slide in from bottom instead -->
in:fly={{ y: 10, duration: 300, delay: index * 50 }}
```

### Change Active Link Style

```css
.menu-link.active::after {
  /* Solid underline instead of gradient */
  background: #146ef5;
}
```

---

## Dependencies

**Zero external dependencies** (except Svelte's built-in transitions).

Uses only:
- Svelte 5 runes (`$props`, `$bindable`)
- Svelte's `fly` transition (built-in)
- Standard CSS animations
- Semantic HTML

---

## Related Components

- **Navbar**: Often contains StaggeredMenu
- **SpeedDial**: Another animated menu pattern
- **Mobile navigation**: Common use case

---

*Documentation created: 3 January 2026*
