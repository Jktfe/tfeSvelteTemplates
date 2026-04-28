---
title: StatCard
description: Single-metric KPI card with auto-coloured trend. Supports metrics where down is good (load time, errors).
category: Data Visualisation
author: AntClaude
---

# StatCard

A single-metric KPI card with an automatically coloured trend indicator. Pairs neatly with `BadgePill` and other dashboard primitives.

The clever bit: `positiveDirection` lets you flip the sentiment colour map. For most metrics, "up" is good (revenue, signups, retention). For others — page load time, error counts, churn — "down" is good. Setting `positiveDirection="down"` swaps the colour scheme so a downward trend reads green.

## Key Features

- **Auto-coloured delta** — green for positive sentiment, red for negative, grey for flat
- **Sentiment-aware** — `positiveDirection` inverts the colour map for "lower is better" metrics
- **Three sizes** — `sm` for sidebars, `md` for grids, `lg` for hero metrics
- **Optional icon** snippet for the header
- **Accessible** — colour is never the only signal (always paired with ↑ / ↓ / — glyphs); a hidden screen-reader sentence describes the trend in plain English
- **Tabular numerals** — values and deltas align cleanly when stacked
- **Zero dependencies**

## Usage

```svelte
<script lang="ts">
  import StatCard from '$lib/components/StatCard.svelte';
</script>

<!-- Revenue rising — up is good — green -->
<StatCard
  title="Revenue"
  value="£12,450"
  delta={8.2}
  deltaSuffix="%"
  deltaLabel="vs last week"
/>

<!-- Page load time falling — down is good — green -->
<StatCard
  title="Page load time"
  value="1.4s"
  delta={-12}
  deltaSuffix="%"
  deltaLabel="vs last week"
  positiveDirection="down"
/>

<!-- Flat — neutral grey -->
<StatCard
  title="Active users"
  value={4271}
  delta={0}
  deltaLabel="no change"
/>

<!-- With an icon -->
<StatCard title="Followers" value={1840} delta={3.1} deltaSuffix="%">
  {#snippet icon()}👥{/snippet}
</StatCard>
```

## Props

| Prop                | Type                  | Default     | Description |
|---------------------|-----------------------|-------------|-------------|
| `title`             | `string`              | `''`        | Metric label, rendered as a small uppercase header. |
| `value`             | `string \| number`     | `''`        | The big number (pre-format currency/percent in the caller). |
| `delta`             | `number`              | `undefined` | Trend value — sign drives the arrow direction. |
| `deltaSuffix`       | `string`              | `''`        | E.g. `'%'` or `' pts'`. |
| `deltaLabel`        | `string`              | `''`        | Context line in the footer (e.g. `'vs last week'`). |
| `positiveDirection` | `'up' \| 'down'`       | `'up'`      | Which trend direction is considered "good". |
| `size`              | `'sm' \| 'md' \| 'lg'` | `'md'`      | Card size. |
| `icon`              | `Snippet`             | `undefined` | Leading icon snippet. |
| `class`             | `string`              | `''`        | Extra container classes. |

## When to use

- Dashboard overview rows — revenue / users / conversion / churn
- Sidebar quick stats
- Hero metric on a marketing page
- Comparison cards in A/B test results

## When not to use

- Multi-series charts — use a real chart library
- Time-series data — pair with a sparkline component
- Interactive drill-down — wrap a StatCard in your own button if you need clickable behaviour
