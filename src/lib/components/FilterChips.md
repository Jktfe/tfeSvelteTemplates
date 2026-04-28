---
title: FilterChips
description: Toggleable chip row for filtering content. Multi-select by default with optional single-select, removable, and 'All' reset modes. Real buttons with aria-pressed.
category: Helpful UX
author: AntClaude
---

# FilterChips

A row of small toggleable pills used to filter content (blog tags, product facets, search categories). Each chip is a real `<button>` with `aria-pressed` for state.

## Key Features

- Multi-select (default) or single-select mode
- Optional "All" reset chip
- Optional removable mode with a × on each active chip
- Optional count badges next to labels
- Three sizes: `sm` / `md` / `lg`
- Custom active palette (background + text)
- Wraps onto multiple rows on narrow screens
- ARIA: `role="group"` + `aria-pressed` per chip
- Honours `prefers-reduced-motion`
- Zero dependencies — pure CSS + inline SVG

## Usage

```svelte
<script lang="ts">
  import FilterChips from '$lib/components/FilterChips.svelte';

  let selected = $state<string[]>(['design']);

  const options = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering', count: 12 },
    { value: 'marketing', label: 'Marketing', count: 4 }
  ];
</script>

<!-- Multi-select with bind -->
<FilterChips {options} bind:selected />

<!-- Single-select with 'All' reset -->
<FilterChips {options} mode="single" showAll bind:selected />

<!-- Removable: × appears on each active chip -->
<FilterChips {options} removable bind:selected onRemove={(v) => console.log('removed', v)} />

<!-- Custom palette -->
<FilterChips {options} bind:selected activeBg="#7c3aed" activeText="#ffffff" />
```

## Props

| Prop          | Type                              | Default     | Description |
|---------------|-----------------------------------|-------------|-------------|
| `options`     | `{ value, label, count? }[]`      | required    | Chip data. |
| `selected`    | `string[]`                        | `[]`        | Selected values (bindable). |
| `mode`        | `'multi' \| 'single'`             | `'multi'`   | Selection behaviour. |
| `size`        | `'sm' \| 'md' \| 'lg'`            | `'md'`      | Chip size. |
| `removable`   | `boolean`                         | `false`     | Show × on each active chip. |
| `onRemove`    | `(value: string) => void`         | `—`         | Fired when × is clicked. |
| `showAll`     | `boolean`                         | `false`     | Show 'All' reset chip. |
| `allLabel`    | `string`                          | `'All'`     | Label for the reset chip. |
| `activeBg`    | `string`                          | `'#1f2937'` | Active chip background. |
| `activeText`  | `string`                          | `'#ffffff'` | Active chip text colour. |
| `ariaLabel`   | `string`                          | `'Filters'` | Group label. |
| `onChange`    | `(selected: string[]) => void`    | `—`         | Selection changed. |
| `class`       | `string`                          | `''`        | Extra classes. |

## When to use

- Blog or article tag filters
- Product category facets
- Active search filters that the user can dismiss individually
- Any small set (2–12) of independent boolean filters

## When not to use

- Mutually exclusive options where the chips should look joined — use `SegmentedControl`
- Long lists (20+) — use a multi-select dropdown or autocomplete
- Mode switching where one of N is always active and the user can't deselect — use `SegmentedControl`
