---
title: CopyButton
description: One-click copy-to-clipboard with a brief "Copied!" confirmation, three variants and three sizes, accessible via aria-live.
category: Helpful UX
author: AntClaude
---

# CopyButton

A focused button that copies a string to the clipboard via the `navigator.clipboard` API and flips its label to a confirmation for a configurable duration. Useful next to code blocks, share URLs, API keys, and invite codes.

## Key Features

- **Three variants** — `text` (label only), `icon` (clipboard glyph only), `both` (default).
- **Three sizes** — `sm`, `md`, `lg`.
- **Configurable feedback** — `copiedLabel` and `copiedDuration` let you match brand voice and lifecycle.
- **`onCopy` callback** — fires after a successful write, ideal for analytics or toasts.
- **Accessible** — `aria-live="polite"` region announces the success state to screen readers; the icon swap to a checkmark gives non-text feedback for users who can see it.
- **Reduced-motion aware** — disables the colour transition.
- **Zero dependencies** — Svelte 5 runes only.

## Usage

```svelte
<script lang="ts">
  import CopyButton from '$lib/components/CopyButton.svelte';
</script>

<CopyButton value="hello" />

<CopyButton
  value={apiKey}
  variant="icon"
  ariaLabel="Copy API key"
/>

<CopyButton
  value={inviteUrl}
  label="Copy invite"
  copiedLabel="Sent to clipboard"
  copiedDuration={1500}
  onCopy={(v) => console.log('copied', v)}
/>
```

## Props

| Prop            | Type                              | Default     | Description |
|-----------------|-----------------------------------|-------------|-------------|
| `value`         | `string`                          | required    | The text to copy. |
| `label`         | `string`                          | `'Copy'`    | Idle button text. |
| `copiedLabel`   | `string`                          | `'Copied!'` | Success label after a click. |
| `variant`       | `'text' \| 'icon' \| 'both'`      | `'both'`    | Visual treatment. |
| `size`          | `'sm' \| 'md' \| 'lg'`            | `'md'`      | Padding + font scale. |
| `copiedDuration`| `number`                          | `2000`      | ms to keep success state. |
| `ariaLabel`     | `string`                          | `label`     | Override the SR label. |
| `onCopy`        | `(value: string) => void`         | —           | Fired after a successful copy. |
| `class`         | `string`                          | `''`        | Extra classes on the button. |

## When to use

- Next to a code snippet, share URL, API key, or invite code.
- In modal headers where the user is shown a generated value.
- Inside admin dashboards to copy IDs for support tickets.

## When not to use

- For copying large structured content (blocks of code, tables) — surface a download or a markdown export instead.
- For contexts where clipboard access is denied (e.g. cross-origin iframes) without a visible fallback message.
