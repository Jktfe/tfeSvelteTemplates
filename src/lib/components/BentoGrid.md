# BentoGrid

A flexible, responsive grid system inspired by "Bento box" designs. Tiles can span multiple columns and rows, automatically reflowing on smaller screens for optimal viewing.

## Features

- **Responsive CSS Grid**: Uses native CSS Grid for high-performance layouts that adapt to any screen size.
- **Custom Spans**: Control how many columns and rows each tile occupies.
- **Interactive Tiles**: Supports hover effects and can act as links with full keyboard accessibility.
- **Subtle Imagery**: Optional background image support with opacity control for readability.
- **Dark Mode**: Built-in support for dark mode aesthetics.
- **Zero Dependencies**: Pure Svelte 5 and CSS.

## Usage

```svelte
<script>
  import BentoGrid from '$lib/components/BentoGrid.svelte';

  const items = [
    {
      id: 1,
      title: 'Main Feature',
      description: 'Important highlight',
      icon: '⭐',
      colSpan: 2,
      rowSpan: 2
    },
    {
      id: 2,
      title: 'Sub-item',
      icon: '📊'
    }
  ];
</script>

<BentoGrid {items} cols={3} gap={16} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BentoItem[]` | `FALLBACK_BENTO_ITEMS` | Array of tile objects to display |
| `cols` | `number` | `3` | Maximum columns at large screen sizes |
| `gap` | `number \| string` | `16` | Space between tiles in pixels or CSS units |
| `class` | `string` | `''` | Additional CSS classes for the container |
| `itemClass` | `string` | `''` | Global tile CSS classes |

## BentoItem Interface

```typescript
export interface BentoItem {
  id: string | number;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  colSpan?: number;
  rowSpan?: number;
  class?: string;
  href?: string;
}
```

## Accessibility

- **Semantic Markup**: Uses `<a>` for links and `<div>` for static content.
- **Keyboard Navigation**: Tiles with `href` are focusable and can be activated via Enter or Space.
- **Aria Labels**: Icons are marked with `aria-hidden="true"`.
- **Motion Sensitivity**: Hover animations are disabled when `prefers-reduced-motion` is active.

## Design Best Practices

1. **Balance**: Use larger tiles (higher `colSpan` or `rowSpan`) for your most important features.
2. **Contrast**: Use the `class` property on items to apply subtle background colors for distinction.
3. **Responsive Spans**: Note that on mobile (below 768px), tiles automatically collapse to a single column for better readability.
