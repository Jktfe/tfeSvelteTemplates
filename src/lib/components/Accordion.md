---
title: Accordion
description: Stack of expandable panels — click a header to reveal or hide its content. Single or multiple-open mode, smooth grid-row height animation, native button + region semantics.
category: Helpful UX
author: AntClaude
---

# Accordion

A stack of expandable panels. Click a header to reveal its content. Use it when you have dense, optional information (FAQs, settings groups, "what's in the box" lists) that would overwhelm the page if shown all at once.

## Key Features

- Single (default) or multiple-open mode
- Optional "always one open" rule (`preventCollapseLast`) for settings panels
- `defaultOpen` for initial expanded items
- Smooth expand/collapse via `grid-template-rows: 0fr ↔ 1fr` (no `max-height` jank, works for any content height with zero JS measurement)
- Chevron rotates 180° on open
- Two sizes: `sm` / `md`
- Optional bordered variant
- Honours `prefers-reduced-motion`
- Zero dependencies

## Usage

```svelte
<script lang="ts">
  import Accordion from '$lib/components/Accordion.svelte';

  const faqs = [
    { id: 'shipping', title: 'How long does shipping take?', content: '3–5 business days within the UK.' },
    { id: 'returns',  title: 'What is your returns policy?',  content: '30 days, full refund, no questions asked.' },
    { id: 'support',  title: 'How do I contact support?',     content: 'Email support@example.com or use the chat widget.' }
  ];
</script>

<!-- Single mode (FAQ-style — only one open at a time) -->
<Accordion items={faqs} />

<!-- Multiple open at once -->
<Accordion items={faqs} multiple />

<!-- Always-one-open settings panel -->
<Accordion items={faqs} preventCollapseLast defaultOpen={['shipping']} />

<!-- Compact, borderless -->
<Accordion items={faqs} size="sm" bordered={false} />
```

## Props

| Prop                  | Type                                  | Default       | Description |
|-----------------------|---------------------------------------|---------------|-------------|
| `items`               | `{ id, title, content, disabled? }[]` | required      | Panels to render. |
| `multiple`            | `boolean`                             | `false`       | Allow multiple open at once. |
| `defaultOpen`         | `string[]`                            | `[]`          | Initially open item ids. |
| `preventCollapseLast` | `boolean`                             | `false`       | In single mode, prevent closing the last open panel. |
| `size`                | `'sm' \| 'md'`                        | `'md'`        | Header padding + font scale. |
| `bordered`            | `boolean`                             | `true`        | Show borders around each item. |
| `ariaLabel`           | `string`                              | `'Accordion'` | aria-label on the wrapper. |
| `onToggle`            | `(id: string, isOpen: boolean) => void` | `—`         | Fires after a header is clicked. |
| `class`               | `string`                              | `''`          | Extra classes on the wrapper. |

## When to use

- FAQs and help docs
- Settings panels grouped by section
- Long forms split into collapsible sections
- "What's included" / "Specs" / "Reviews" tabs on product pages

## When not to use

- A single piece of conditional content — use a disclosure (`<details>`) or just hide/show
- Mutually-exclusive options that don't have content bodies — use `SegmentedControl`
- Independent on/off toggles — use a switch or `FilterChips`
- When all the content matters and should be visible — don't hide it behind a click

## Accessibility notes

The component uses native `<button>` elements with `aria-expanded` and `aria-controls`, and `role="region"` panels with `aria-labelledby`. Browsers handle Tab/Enter/Space natively — no custom keyboard shim needed. The chevron icon is decorative (`aria-hidden="true"`).

If you have many panels, consider grouping them into multiple Accordions with clear headings rather than one giant list — screen reader users navigate by region, and a labelled wrapper helps.
