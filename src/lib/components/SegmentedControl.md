---
title: SegmentedControl
description: iOS-style joined picker for mutually-exclusive options. Single-select with sliding indicator, native radio semantics, and custom palette support.
category: Helpful UX
author: AntClaude
---

# SegmentedControl

A row of mutually-exclusive options visually joined into one control. Use it when one of N options is always active and the joined look reads as "pick one of these" — e.g., view modes (List / Grid / Cards), time ranges (1D / 1W / 1M), or simple tabs.

## Key Features

- Single-select only (the joined affordance implies "one of these")
- Sliding indicator animates between segments
- Equal-width segments by default (toggle off for content-fit)
- Two sizes: `sm` / `md`
- Custom active palette via CSS vars
- Optional icons per segment
- Native `<input type="radio">` — browsers handle ←/→/↑/↓ and Home/End for free
- Honours `prefers-reduced-motion`
- Zero dependencies

## Usage

```svelte
<script lang="ts">
  import SegmentedControl from '$lib/components/SegmentedControl.svelte';

  let view = $state<'list' | 'grid' | 'cards'>('list');

  const options = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'cards', label: 'Cards' }
  ];
</script>

<!-- Basic with bind -->
<SegmentedControl {options} bind:value={view} ariaLabel="View mode" />

<!-- With icons -->
<SegmentedControl
  options={[
    { value: 'list', label: 'List', icon: '☰' },
    { value: 'grid', label: 'Grid', icon: '▦' }
  ]}
  bind:value={view}
/>

<!-- Custom palette + content-width segments -->
<SegmentedControl
  {options}
  bind:value={view}
  equalWidth={false}
  activeBg="#7c3aed"
  activeText="#ffffff"
/>
```

## Props

| Prop          | Type                              | Default                        | Description |
|---------------|-----------------------------------|--------------------------------|-------------|
| `options`     | `{ value, label, icon? }[]`       | required                       | Segments. |
| `value`       | `string`                          | required (bindable)            | Selected value. |
| `size`        | `'sm' \| 'md'`                    | `'md'`                         | Control height. |
| `equalWidth`  | `boolean`                         | `true`                         | All segments same width. |
| `activeBg`    | `string`                          | `'#ffffff'`                    | Active indicator background. |
| `activeText`  | `string`                          | `'#1f2937'`                    | Active label text colour. |
| `ariaLabel`   | `string`                          | `'Segmented control'`          | radiogroup label. |
| `name`        | `string`                          | auto-generated                 | Radio group name (only set if you have multiple controls on one page). |
| `onChange`    | `(value: string) => void`         | `—`                            | Fires after selection changes. |
| `class`       | `string`                          | `''`                           | Extra classes. |

## When to use

- View mode switchers (List / Grid / Cards)
- Time range selectors (1D / 1W / 1M / 1Y)
- Two-to-five mutually exclusive options that share a domain
- Simple tab bars where the panel below is always one of these

## When not to use

- Independent boolean filters — use `FilterChips`
- More than ~6 options — segments become cramped; use a dropdown or tabs
- Options that aren't mutually exclusive — use `FilterChips` (multi-select)
- Long labels that need to wrap — segments hate wrapping; use a select
