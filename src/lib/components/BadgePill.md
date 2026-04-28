---
title: BadgePill
description: Compact rounded pill for status, categories, counts and tags. 3 variants × 6 tones × 3 sizes from one prop set.
category: Helpful UX
author: AntClaude
---

# BadgePill

A small rounded pill for status indicators, category tags, counts, and dismissible tag pickers. Three visual *variants* (solid / soft / outline) crossed with six semantic *tones* (neutral / info / success / warning / danger / brand) and three sizes give you 54 ready-made looks from a single component.

## Key Features

- **Three orthogonal axes** — variant (visual weight) × tone (semantic role) × size
- **Optional status dot** — auto-coloured with `currentColor`
- **Dismissible mode** — built-in × button with `onDismiss` callback
- **Snippet or label prop** — use whichever fits the call site
- **Zero dependencies** — pure Svelte 5 + scoped CSS
- **Accessible** — real `<button>` for dismiss, ARIA-correct, focus-visible ring
- **Reduced-motion aware** — transitions disable cleanly

## Usage

```svelte
<script lang="ts">
  import BadgePill from '$lib/components/BadgePill.svelte';
</script>

<!-- Status pills -->
<BadgePill label="Active" tone="success" dot />
<BadgePill label="Pending" tone="warning" dot />
<BadgePill label="Failed" tone="danger" dot />

<!-- Solid for high contrast (dark backgrounds, hero areas) -->
<BadgePill label="New" tone="brand" variant="solid" />

<!-- Outline for understated UI (nested in cards) -->
<BadgePill label="v2.4.1" tone="neutral" variant="outline" size="sm" />

<!-- Dismissible tag picker -->
<BadgePill
  label="Frontend"
  tone="info"
  dismissible
  onDismiss={() => removeTag('frontend')}
/>

<!-- Custom snippet content -->
<BadgePill tone="brand">
  ✨ <strong>Pro</strong>
</BadgePill>
```

## Props

| Prop          | Type                                                                  | Default     | Description |
|---------------|-----------------------------------------------------------------------|-------------|-------------|
| `label`       | `string`                                                              | `undefined` | Text content (or use children snippet). |
| `tone`        | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'brand'` | `'neutral'` | Semantic colour role. |
| `variant`     | `'solid' \| 'soft' \| 'outline'`                                       | `'soft'`    | Visual weight. |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                 | `'md'`      | Pill size. |
| `dot`         | `boolean`                                                             | `false`     | Show leading status dot. |
| `dismissible` | `boolean`                                                             | `false`     | Show trailing × button. |
| `onDismiss`   | `() => void`                                                          | `undefined` | Called when × is clicked. |
| `class`       | `string`                                                              | `''`        | Extra container classes. |
| `children`    | `Snippet`                                                             | `undefined` | Custom content (overrides label). |

## When to use

- Status indicators (Active / Pending / Failed) on cards and rows
- Category tags on blog posts, product cards, kanban tickets
- Count badges (e.g. "3 unread") next to navigation items
- Removable filter chips in search bars (use `dismissible`)
- Version, environment, or feature-flag tags

## When not to use

- Long-form labels — pills should be 1–3 words
- Interactive choices — use a real `<button>` with toggle state instead
- Primary calls-to-action — use a button component
- Nested status containers — pills should be leaves, not containers
