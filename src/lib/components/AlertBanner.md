---
title: AlertBanner
description: Inline page banner for info, success, warning, or error states. Optional title, dismissable, and action slot. Sensible ARIA roles per variant.
category: Helpful UX
author: AntClaude
---

# AlertBanner

An inline status banner that lives in the document flow. Use it to communicate state directly on the page — distinct from a Toast (which floats and auto-dismisses).

## Key Features

- Four variants: `info`, `success`, `warning`, `error` (each gets its own colour palette and inline SVG icon)
- Optional `title` (bold) and `message` body
- Optional dismiss button (`×`) that fires `onDismiss`
- Optional `children` snippet for inline action(s) like links or buttons
- ARIA: `role="alert"` for `warning` / `error` (assertive), `role="status"` for `info` / `success` (polite)
- Honours `prefers-reduced-motion`
- Pure inline SVG, zero dependencies

## Usage

```svelte
<script lang="ts">
  import AlertBanner from '$lib/components/AlertBanner.svelte';

  let shown = $state(true);
</script>

<!-- Info / success / warning / error -->
<AlertBanner variant="success" title="Saved!" message="Your changes are live." />

<!-- Dismissable -->
{#if shown}
  <AlertBanner
    variant="error"
    title="Save failed"
    message="We couldn't reach the server. Try again."
    dismissable
    onDismiss={() => (shown = false)}
  />
{/if}

<!-- With inline action (default children) -->
<AlertBanner variant="warning" title="Trial ends in 3 days">
  <a href="/billing" class="underline">Upgrade now →</a>
</AlertBanner>
```

## Props

| Prop          | Type                                       | Default  | Description |
|---------------|--------------------------------------------|----------|-------------|
| `variant`     | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Visual + a11y role. |
| `title`       | `string`                                   | `''`     | Optional bold heading. |
| `message`     | `string`                                   | `''`     | Optional body text. |
| `dismissable` | `boolean`                                  | `false`  | Show × button. |
| `onDismiss`   | `() => void`                               | `—`      | Fired when × is clicked. |
| `children`    | `Snippet`                                  | `—`      | Optional action area (links/buttons). |
| `class`       | `string`                                   | `''`     | Extra classes. |

## When to use

- Form-level success/error feedback after a submit
- Page-level notices ("Trial ends in 3 days", "New version available")
- Empty-section warnings ("No items match your filters")
- Compliance / consent notices that need to stay put

## When not to use

- Ephemeral, transient confirmations — use `ToastNotification`
- Per-field validation errors — keep those next to the field
- Modal-blocking errors that require a decision — use a confirm dialog
