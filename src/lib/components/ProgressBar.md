---
title: ProgressBar
description: Linear progress indicator — determinate (0–100) or indeterminate animated stripe. Uses a hidden-but-accessible native progress element so screen readers announce percent automatically.
category: Helpful UX
author: AntClaude
---

# ProgressBar

A horizontal bar that fills to show how much of a task is done. Use it for uploads, downloads, multi-step flows where progress is quantifiable, or as an indeterminate "still working" indicator when you can't estimate.

## Key Features

- Determinate (`value` 0–100) or indeterminate (`value={null}`) modes
- Three sizes (`sm` / `md` / `lg`)
- Four variants (`default`, `success`, `warning`, `danger`)
- Optional value label — `above`, `inline`, or `none`
- Custom percent formatter (e.g. "3 of 5 steps")
- Custom `max` (default 100)
- Auto "complete" state at 100%
- Honours `prefers-reduced-motion`
- Zero dependencies

## Usage

```svelte
<script lang="ts">
  import ProgressBar from '$lib/components/ProgressBar.svelte';
</script>

<!-- Determinate -->
<ProgressBar value={40} ariaLabel="Upload progress" />

<!-- Indeterminate -->
<ProgressBar value={null} ariaLabel="Loading" />

<!-- With label above and a custom formatter -->
<ProgressBar
  value={3}
  max={5}
  showValue="above"
  ariaLabel="Onboarding"
  format={(v, m) => `${v} of ${m} steps`}
/>

<!-- Variant + inline label -->
<ProgressBar value={92} variant="success" showValue="inline" size="lg" />
```

## Props

| Prop        | Type                                            | Default      | Description |
|-------------|-------------------------------------------------|--------------|-------------|
| `value`     | `number \| null`                                | `0`          | Current progress; `null` activates indeterminate mode. |
| `max`       | `number`                                        | `100`        | Maximum value. |
| `size`      | `'sm' \| 'md' \| 'lg'`                          | `'md'`       | Bar height (4px / 8px / 12px). |
| `variant`   | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'`  | Colour scheme. |
| `showValue` | `'above' \| 'inline' \| 'none'`                 | `'none'`     | Where the label sits. |
| `format`    | `(value: number, max: number) => string`        | percent fn   | Custom label formatter. |
| `ariaLabel` | `string`                                        | `'Progress'` | Forwarded to the native `<progress>` for SR announcement. |
| `class`     | `string`                                        | `''`         | Extra classes on the wrapper. |

## When to use

- File upload / download progress
- Multi-step wizards where you want a continuous progress line in addition to step labels
- "Still working" indicator when you can't estimate (indeterminate)
- Quota / capacity displays (used vs max)

## When not to use

- Discrete steps with clear labels — use `Stepper` (1 → 2 → 3)
- Page navigation — use `Pagination`
- Circular fixed-size progress — use `ProgressRing`
- Placeholder while content loads — use `SkeletonLoader`

## Accessibility notes

The component renders a real `<progress>` element under the hood — visually hidden but exposed to assistive tech. Screen readers announce the percent automatically (e.g. "40 percent"). The visible bar is a styled `<div>` because native `<progress>` styling is inconsistent across browsers.

For indeterminate mode, omit a numeric value (`value={null}`); SR announces "loading" or similar without a percent. The stripe animation respects `prefers-reduced-motion` — under that setting it falls back to a soft full-width fill rather than animating.
