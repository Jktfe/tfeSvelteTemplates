---
title: Slider
description: Continuous-value range input with styled track and thumb, two-way binding, three sizes, three variants, optional value bubble, and full keyboard a11y.
category: Helpful UX
author: AntClaude
---

# Slider

A continuous-value range input — volume, brightness, opacity, price filters. Built on a native `<input type="range">` so keyboard a11y is free: arrow keys step, Home/End jump to min/max, PageUp/PageDown for big-step.

## Key Features

- **`bind:value`** — two-way binding via Svelte 5's `$bindable`, plus an `onChange` callback for analytics or persistence.
- **Native `<input type="range">`** — clean ARIA semantics (role="slider"), built-in keyboard support, no shim required.
- **Three sizes** — `sm`, `md`, `lg`.
- **Three variants** — `default` (blue), `success` (green), `danger` (red).
- **Optional value bubble** — floats above the thumb showing the current value.
- **`formatValue` callback** — render the bubble as a percentage, currency, time, anything.
- **Custom step + min/max** — fine-grained or coarse selection.
- **Disabled state** — uses the real `disabled` attribute.
- **Reduced-motion aware** — disables thumb-grow animation.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import Slider from '$lib/components/Slider.svelte';

  let volume = $state(50);
  let opacity = $state(1);
</script>

<!-- two-way bind -->
<Slider bind:value={volume} label="Volume" min={0} max={100} />

<!-- value bubble + custom format -->
<Slider
  bind:value={opacity}
  label="Opacity"
  min={0}
  max={1}
  step={0.05}
  showValue
  formatValue={(v) => `${Math.round(v * 100)}%`}
/>

<!-- success variant, large -->
<Slider bind:value={brightness} label="Brightness" variant="success" size="lg" />

<!-- disabled -->
<Slider value={50} label="System reserved" disabled />
```

## Props

| Prop          | Type                                  | Default     | Description |
|---------------|---------------------------------------|-------------|-------------|
| `value`       | `number`                              | `0`         | Current value. Use `bind:value` for two-way sync. |
| `min`         | `number`                              | `0`         | Minimum value. |
| `max`         | `number`                              | `100`       | Maximum value. |
| `step`        | `number`                              | `1`         | Granularity. Use fractions for fine control (`0.05`). |
| `label`       | `string`                              | `''`        | Visible label rendered above the track. |
| `showValue`   | `boolean`                             | `false`     | Whether to render the value bubble above the thumb. |
| `size`        | `'sm' \| 'md' \| 'lg'`                | `'md'`      | Track + thumb size. |
| `variant`     | `'default' \| 'success' \| 'danger'`  | `'default'` | Fill colour. |
| `disabled`    | `boolean`                             | `false`     | Sets the real `disabled` attribute. |
| `id`          | `string`                              | auto        | `id` on the input (used by the label). |
| `ariaLabel`   | `string`                              | —           | aria-label for sliders without a visible label. Defaults to `'Slider'`. |
| `formatValue` | `(v: number) => string`               | —           | Custom formatter for the value bubble. |
| `onChange`    | `(value: number) => void`             | —           | Fires after each change with the new value. |
| `class`       | `string`                              | `''`        | Extra classes on the wrapper. |

## Keyboard

Native browser semantics — no shim required:

- `←` / `→` / `↑` / `↓` — step by `step`
- `Home` / `End` — jump to `min` / `max`
- `PageUp` / `PageDown` — large step (typically 10% of range)
- `Tab` — moves focus

## When to use

- Volume, brightness, opacity, zoom controls
- Price-range filters
- Numeric form inputs where the user wants to feel the range
- Any continuous-value input where the value is more important than the precise number

## When not to use

- Binary on/off — use **Switch**.
- A few discrete options — use **SegmentedControl** or **FilterChips**.
- Ordinal value 1–5 with semantic meaning (rating) — use **RatingStars**.
- Read-only progress indicator — use **ProgressBar**.
- Precise numeric entry where typing is faster — use a regular number input.
