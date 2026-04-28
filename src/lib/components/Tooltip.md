---
title: Tooltip
description: Accessible hover/focus tooltip wrapping any trigger, with four placements, configurable delays, and rich-content support via snippet.
category: Helpful UX
author: AntClaude
---

# Tooltip

Wraps any element (button, link, icon) and shows a small floating panel with helpful text when the user hovers or focuses it. The trigger is linked to the tooltip body via `aria-describedby`, so screen readers announce the description after the element's own name. The tooltip dismisses on mouse leave, blur, or pressing Escape.

## Key Features

- **Four placements** — `top`, `right`, `bottom`, `left`.
- **Plain text or rich snippet** — pass a `text` string for simple labels, or use the `tip` snippet for multi-element content like keyboard shortcuts.
- **Hover AND focus** — works for mouse users and keyboard users alike.
- **Escape to dismiss** — keyboard users can close a tooltip without losing focus on the trigger.
- **Configurable delays** — `showDelay` (default 200ms) and `hideDelay` (default 0ms) for hover-intent control.
- **`aria-describedby` linking** — supplements the trigger's own accessible name without overwriting it.
- **Reduced-motion aware** — disables the fade animation when the user prefers it.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import Tooltip from '$lib/components/Tooltip.svelte';
</script>

<Tooltip text="Save your changes">
  <button class="save">Save</button>
</Tooltip>

<Tooltip text="Permanent action" placement="right">
  <button class="danger">Delete</button>
</Tooltip>

<Tooltip>
  {#snippet tip()}
    <strong>Pro tip</strong>: keyboard shortcut <kbd>Cmd+S</kbd>
  {/snippet}
  <button>Save</button>
</Tooltip>
```

## Props

| Prop        | Type                                       | Default | Description |
|-------------|--------------------------------------------|---------|-------------|
| `text`      | `string`                                   | `''`    | Tooltip text. Use the `tip` snippet for richer content. |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'`   | `'top'` | Side of the trigger to render on. |
| `showDelay` | `number`                                   | `200`   | ms to wait after hover/focus before showing. |
| `hideDelay` | `number`                                   | `0`     | ms to wait after leave/blur before hiding. |
| `id`        | `string`                                   | auto    | aria id linking trigger to tooltip body. |
| `class`     | `string`                                   | `''`    | Extra classes on the wrapper. |

## Snippets

| Snippet     | Description |
|-------------|-------------|
| `children`  | The trigger element (button, link, icon). Required. |
| `tip`       | Optional rich tooltip body. Overrides `text` when provided. |

## When to use

- Icon-only buttons that need a textual label for sighted users.
- Short hints alongside form inputs or table cells.
- Reminders of keyboard shortcuts on toolbar buttons.

## When not to use

- For long-form help — use a popover or a help panel that supports clicks and keyboard focus inside.
- For mobile-first surfaces — touch users get no hover; rely on labels or a "?" button instead.
- As the only mechanism conveying critical information — tooltips are supplemental.
