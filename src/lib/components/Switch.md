---
title: Switch
description: iOS-style boolean toggle with sliding thumb, two-way binding, three sizes, variants, and accessible role="switch" semantics.
category: Helpful UX
author: AntClaude
---

# Switch

A boolean toggle for binary state — notifications on/off, dark mode, public/private, etc. Uses a native `<button role="switch">` so screen readers announce "switch, on" / "switch, off" without any custom keyboard shim — the browser already maps Space and Enter to button click.

## Key Features

- **`bind:checked`** — two-way binding via Svelte 5's `$bindable`, plus an `onChange` callback for analytics or persistence.
- **`role="switch"` + `aria-checked`** — clean ARIA semantics, no hidden checkbox hack.
- **Three sizes** — `sm`, `md`, `lg`.
- **Three variants** — `default` (blue), `success` (green), `danger` (red) for the on-state colour.
- **Optional label** — renders left or right of the track, both clickable.
- **Disabled state** — uses the real `disabled` attribute (not aria-disabled).
- **Reduced-motion aware** — disables the thumb-slide transition.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import Switch from '$lib/components/Switch.svelte';

  let notifications = $state(true);
  let darkMode = $state(false);
</script>

<!-- two-way bind -->
<Switch bind:checked={notifications} label="Email notifications" />

<!-- onChange callback -->
<Switch
  checked={darkMode}
  label="Dark mode"
  onChange={(v) => { darkMode = v; persistTheme(v); }}
/>

<!-- success variant, large -->
<Switch bind:checked={isPublic} label="Public" variant="success" size="lg" />

<!-- disabled -->
<Switch checked={true} label="Account verified" disabled />
```

## Props

| Prop            | Type                          | Default     | Description |
|-----------------|-------------------------------|-------------|-------------|
| `checked`       | `boolean`                     | `false`     | Current state. Use `bind:checked` for two-way sync. |
| `label`         | `string`                      | `''`        | Visible label text. Click flips the switch. |
| `labelPosition` | `'left' \| 'right'`           | `'right'`   | Side of the track to render the label on. |
| `size`          | `'sm' \| 'md' \| 'lg'`        | `'md'`      | Track + thumb size. |
| `variant`       | `'default' \| 'success' \| 'danger'` | `'default'` | On-state track colour. |
| `disabled`      | `boolean`                     | `false`     | Sets the real `disabled` attribute. |
| `id`            | `string`                      | auto        | `id` on the button (used by the label). |
| `ariaLabel`     | `string`                      | —           | aria-label for buttons without a visible label. Defaults to `'Toggle'` when no label is provided. |
| `onChange`      | `(checked: boolean) => void`  | —           | Fires after each toggle with the new value. |
| `class`         | `string`                      | `''`        | Extra classes on the wrapper. |

## Keyboard

`Tab` moves focus to the switch. `Space` or `Enter` toggles it. No custom shim needed — these are the browser defaults for `<button>`.

## When to use

- Any binary on/off setting where the user expects an immediate effect (no separate Save button).
- Settings panels, profile preferences, feature flags, theme selection.

## When not to use

- When the change shouldn't take effect until the user confirms — use a checkbox + Save button instead. Switch implies "applies immediately".
- When you have more than two options — use SegmentedControl or FilterChips.
- When you need an ordinal value (1–5) — use RatingStars or a Slider.
