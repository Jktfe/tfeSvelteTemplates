---
title: Breadcrumbs
description: Hierarchical path navigation with smart truncation, ARIA-correct semantics, and customisable separators.
category: Navigation
author: AntClaude
---

# Breadcrumbs

A semantic breadcrumb trail. Renders an ordered list from a conceptual root (e.g. Home) to the current page. The last item is plain text with `aria-current="page"` — it's not a link because it represents the page the user is already on. Long trails collapse the middle into a `…` marker so the row stays single-line on narrow screens.

## Key Features

- **Semantic structure** — `<nav aria-label="Breadcrumb">` wrapper around an `<ol>`, links for navigable items, plain text for the current page.
- **`aria-current="page"`** on the final crumb so assistive tech announces "current page".
- **Hidden separators** — `aria-hidden="true"` on every `/` so screen readers don't read "slash" between items.
- **Smart truncation** — `maxVisible` collapses the middle; first and last are always preserved.
- **Customisable separator** — string of your choice (`/`, `›`, `→`, `·`, etc.).
- **Custom aria-label** — i18n friendly.
- **Reduced-motion aware** — disables hover transitions.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Navigation', href: '/components/navigation' },
    { label: 'Breadcrumbs' } // last item — no href, current page
  ];
</script>

<Breadcrumbs items={trail} />

<!-- custom separator -->
<Breadcrumbs items={trail} separator="›" />

<!-- collapse middle when path is long -->
<Breadcrumbs items={veryLongTrail} maxVisible={4} />
```

## Props

| Prop          | Type                              | Default        | Description |
|---------------|-----------------------------------|----------------|-------------|
| `items`       | `Crumb[]`                         | —              | Trail of crumbs. Last is treated as current page. |
| `separator`   | `string`                          | `'/'`          | Character or short string between items. |
| `maxVisible`  | `number`                          | `0`            | Max items to render. `0` = no truncation. When `items.length > maxVisible`, renders first + ellipsis + last `(maxVisible - 2)`. |
| `ariaLabel`   | `string`                          | `'Breadcrumb'` | aria-label on wrapper `<nav>`. |
| `class`       | `string`                          | `''`           | Extra classes on the `<nav>`. |

### `Crumb` shape

```ts
type Crumb = {
  label: string;   // visible text
  href?: string;   // optional; intermediate crumbs without href render as plain spans
};
```

The **last item is always rendered as plain text**, regardless of whether it has an `href`. This matches WAI-ARIA breadcrumb pattern guidance.

## When to use

- Deeply nested information architectures (admin dashboards, file systems, taxonomy pages).
- E-commerce category pages where users want to step back up the tree.
- Documentation sites with section/sub-section/page hierarchies.

## When not to use

- Flat sites with only one or two levels — breadcrumbs add noise without giving the user useful orientation.
- Apps where the back button is the primary navigation pattern (mobile, single-task flows).
- When the path doesn't represent a true hierarchy — use a tab bar or step indicator instead.
