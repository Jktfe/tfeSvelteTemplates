---
title: Pagination
description: Page-number navigation with smart ellipsis, two-way bindable page state, ARIA-correct buttons and disabled-edge behaviour.
category: Helpful UX
author: AntClaude
---

# Pagination

A focused page-number navigation control. Renders Prev / page-numbers / Next, collapses long ranges with an ellipsis (e.g. `1 … 4 5 6 … 20`), and supports two-way `bind:page` for direct binding to your data store. Useful next to search results, paginated tables, gallery pages, and any list that benefits from shareable URLs over infinite scroll.

## Key Features

- **Smart ellipsis** — always shows first, last, current, and a configurable number of sibling pages.
- **`bind:page`** — two-way binding via Svelte 5's `$bindable`, plus an `onChange` callback for analytics or URL updates.
- **Edge handling** — Prev is disabled on page 1, Next on the last page (real `disabled` attribute, not `aria-disabled`).
- **ARIA correct** — wrapper `<nav aria-label="Pagination">`, each number is a real `<button>` with `aria-label="Go to page N"`, active button gets `aria-current="page"`.
- **Two sizes** — `sm`, `md`.
- **i18n friendly** — `prevLabel`, `nextLabel`, and `ariaLabel` are all overridable.
- **Reduced-motion aware** — disables button transitions.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import Pagination from '$lib/components/Pagination.svelte';

  let page = $state(1);
</script>

<!-- two-way binding -->
<Pagination bind:page totalPages={42} />

<!-- controlled with callback -->
<Pagination page={5} totalPages={42} onChange={(p) => goTo(p)} />

<!-- compact, wider middle -->
<Pagination bind:page totalPages={42} siblings={2} size="sm" />
```

## Props

| Prop         | Type                       | Default        | Description |
|--------------|----------------------------|----------------|-------------|
| `page`       | `number`                   | `1`            | Current page (1-indexed). Use `bind:page` for two-way sync. |
| `totalPages` | `number`                   | `1`            | Total page count. |
| `siblings`   | `number`                   | `1`            | Pages either side of current to render. |
| `size`       | `'sm' \| 'md'`             | `'md'`         | Padding + font scale. |
| `prevLabel`  | `string`                   | `'Prev'`       | Label for the previous-page button. |
| `nextLabel`  | `string`                   | `'Next'`       | Label for the next-page button. |
| `ariaLabel`  | `string`                   | `'Pagination'` | aria-label on the wrapper `<nav>`. |
| `onChange`   | `(page: number) => void`   | —              | Fires after a navigation click. |
| `class`      | `string`                   | `''`           | Extra classes on the `<nav>`. |

## Ellipsis algorithm

Given current page `c`, total pages `t`, sibling count `s`, the visible window is `1, …, leftSib..rightSib, …, t` where:

- `leftSib = max(c - s, 1)`, `rightSib = min(c + s, t)`
- If `t ≤ 2s + 5`, render all numbers (no ellipsis).
- If `c` is near the start (no left dots needed), render `1..2s+3, …, t`.
- If `c` is near the end (no right dots needed), render `1, …, t-2s-2..t`.
- Otherwise render `1, …, leftSib..rightSib, …, t`.

This is the same algorithm used by Material UI / Mantine and matches what users intuitively expect from a pagination row.

## When to use

- Search results, paginated tables, gallery pages.
- Anywhere you want shareable URLs (`?page=5`) over infinite scroll.
- Admin dashboards where users jump to specific page numbers.

## When not to use

- Streams of personalised content (Twitter-style timeline) — infinite scroll suits those.
- Tiny lists where pagination would be visual noise — surface the whole list.
- Cursor-paginated APIs that don't expose total counts — use a Prev/Next-only control instead.
