---
title: RatingStars
description: Interactive 1–N star rating with hover preview, read-only display mode, and full keyboard accessibility via real radio inputs.
category: Helpful UX
author: AntClaude
---

# RatingStars

A row of stars for rating things. Real `<input type="radio">` elements under the hood, so you get keyboard arrow-key navigation and screen-reader support for free.

## Key Features

- Click to rate, hover to preview the new value
- Configurable scale (default 5, any max works)
- Read-only mode for displaying existing ratings (supports half stars via fractional `value`)
- Custom filled / empty colours
- Configurable star size in px
- ARIA: `radiogroup` in interactive mode, `img` with "Rated X out of Y" in read-only
- Visible focus ring for keyboard users
- Honours `prefers-reduced-motion`
- Zero dependencies — pure inline SVG + scoped CSS

## Usage

```svelte
<script lang="ts">
  import RatingStars from '$lib/components/RatingStars.svelte';

  let rating = $state(3);
</script>

<!-- Interactive -->
<RatingStars value={rating} onChange={(v) => (rating = v)} />

<!-- Read-only with half-star value -->
<RatingStars value={4.5} readonly />

<!-- Custom scale -->
<RatingStars value={7} max={10} />

<!-- Custom palette -->
<RatingStars
  value={4}
  filledColor="#ef4444"
  emptyColor="#fee2e2"
  size={32}
/>
```

## Props

| Prop          | Type                  | Default     | Description |
|---------------|-----------------------|-------------|-------------|
| `value`       | `number`              | `0`         | Current rating (0..max). Fractional values render half-stars in read-only mode. |
| `max`         | `number`              | `5`         | Number of stars. |
| `readonly`    | `boolean`             | `false`     | Disable interaction. |
| `size`        | `number`              | `28`        | Star size in px. |
| `name`        | `string`              | auto        | Radio group name (auto-generated). |
| `filledColor` | `string`              | `'#fbbf24'` | Filled star colour. |
| `emptyColor`  | `string`              | `'#e5e7eb'` | Empty star colour. |
| `ariaLabel`   | `string`              | `'Rating'`  | Group label for screen readers. |
| `onChange`    | `(v: number) => void` | `undefined` | Fired when user picks a value. |
| `class`       | `string`              | `''`        | Extra classes. |

## When to use

- Product / restaurant / movie ratings
- Customer satisfaction (CSAT) prompts
- Quick feedback widgets after a task completes
- Any 1–N preference scale

## When not to use

- Non-uniform scales (e.g. "poor / good / great") — use a SegmentedControl
- Sliders for continuous values — use a RangeSlider
- Boolean preferences — use a Toggle or Like button
