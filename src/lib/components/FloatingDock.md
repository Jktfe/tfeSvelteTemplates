# FloatingDock

A premium, high-interaction navigation bar inspired by the macOS dock. It features a proximity-based magnification effect where icons scale up as the mouse cursor approaches them.

## Features

- **Proximity Magnification**: Smoothly scales icons based on mouse distance using a cosine-based wave function.
- **Svelte 5 Runes**: Built with modern reactivity patterns for high-performance interactions.
- **Mobile Fallback**: Automatically switches to a simplified, scrollable navigation bar on touch devices.
- **Zero Dependencies**: Pure Svelte and CSS, no external animation libraries required.
- **Accessible**: Full keyboard navigation, ARIA roles, and respects reduced motion preferences.
- **Tooltip Support**: Built-in tooltips for clear icon identification.

## Usage

```svelte
<script>
  import FloatingDock from '$lib/components/FloatingDock.svelte';

  const items = [
    { id: 1, title: 'Home', icon: '🏠', href: '/' },
    { id: 2, title: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 3, title: 'Settings', icon: '⚙️' }
  ];
</script>

<FloatingDock {items} magnification={2} distance={140} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FloatingDockItem[]` | required | Array of navigation items |
| `magnification` | `number` | `2` | Maximum scaling factor for the hovered icon |
| `distance` | `number` | `140` | The pixel range where magnification begins |
| `class` | `string` | `''` | Additional CSS classes for the container |

## FloatingDockItem Interface

```typescript
export interface FloatingDockItem {
  id: string | number;
  title: string;
  icon: string;
  href?: string;
}
```

## Magnification Logic

The component calculates icon scale based on the horizontal distance (`dist`) from the mouse to the center of each icon:

```typescript
scale = 1 + (magnification - 1) * Math.cos((dist / distance) * (Math.PI / 2));
```

This creates a smooth, natural-feeling "wave" of magnification as the mouse moves across the dock.

## Accessibility

- **Keyboard**: Users can `Tab` through dock items. Interactive items are semantic links.
- **Screen Readers**: The dock is wrapped in a `role="navigation"` element with an appropriate `aria-label`. Icons are hidden from screen readers, with tooltips providing the necessary labels.
- **Motion**: Scaling animations and transitions are disabled if the user has `prefers-reduced-motion: reduce` enabled.
