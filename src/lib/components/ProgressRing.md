---
title: ProgressRing
description: Circular SVG progress indicator with determinate and indeterminate modes plus a centred label snippet.
category: Helpful UX
author: AntClaude
---

# ProgressRing

Two indicators in one tiny component:

- **Determinate** — pass a `value` from 0 to 100 and the ring fills smoothly.
- **Indeterminate** — set `indeterminate` and the ring spins to communicate "still working, no progress info".

The centre is a snippet, so you can render the percent number, an icon, or anything else.

## Key Features

- Determinate (0–100, animated) and indeterminate (spinning) modes
- Configurable size and stroke thickness
- Custom track / progress colours via props
- Centred label snippet (typography is yours to control)
- ARIA-compliant — `role="progressbar"` with `aria-valuenow / valuemin / valuemax / valuetext`
- Indeterminate mode correctly omits `aria-valuenow` per the ARIA spec
- Honours `prefers-reduced-motion` (slow spin instead of pause)
- Zero dependencies, pure SVG + CSS animation

## Usage

```svelte
<script lang="ts">
  import ProgressRing from '$lib/components/ProgressRing.svelte';
</script>

<!-- Determinate with a label -->
<ProgressRing value={75} ariaLabel="Upload progress">
  {#snippet label()}<strong>75%</strong>{/snippet}
</ProgressRing>

<!-- Indeterminate -->
<ProgressRing indeterminate ariaLabel="Loading data" />

<!-- Custom palette -->
<ProgressRing
  value={42}
  progressColor="#22c55e"
  trackColor="#dcfce7"
  size={96}
  stroke={8}
/>
```

## Props

| Prop            | Type      | Default     | Description |
|-----------------|-----------|-------------|-------------|
| `value`         | `number`  | `0`         | Progress 0–100 (ignored in indeterminate mode). |
| `indeterminate` | `boolean` | `false`     | Spin without a fixed value. |
| `size`          | `number`  | `64`        | Diameter in px. |
| `stroke`        | `number`  | `6`         | Ring thickness in px. |
| `trackColor`    | `string`  | `'#e2e8f0'` | Background ring colour. |
| `progressColor` | `string`  | `'#3b82f6'` | Foreground stroke colour. |
| `ariaLabel`     | `string`  | `undefined` | Accessible label. |
| `label`         | `Snippet` | `undefined` | Centred label content. |
| `class`         | `string`  | `''`        | Extra classes. |

## When to use

- File uploads, downloads, sync indicators
- Quota / completeness gauges (e.g., profile completion %)
- Loading states where you can't tell users *how* long it'll take
- Steppers and onboarding completion meters

## When not to use

- Linear progress (e.g., a long form) — use a horizontal bar instead
- Multi-segment progress — use a stacked bar / dashboard primitive
- Brief async ops (<300ms) — a button-level inline spinner is friendlier
