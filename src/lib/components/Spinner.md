---
title: Spinner
description: Indeterminate loading indicator with four visual variants (ring, dots, bars, pulse), three sizes, and a respectful prefers-reduced-motion fallback. Pure CSS keyframes, zero dependencies.
category: Helpful UX
author: AntClaude
---

# Spinner

A drop-in indeterminate loading indicator. Use it whenever you want to signal "something is happening" but you don't yet know how long it will take. For determinate progress (loaded 60% of N MB), reach for [`ProgressBar`](./ProgressBar.svelte) or [`ProgressRing`](./ProgressRing.svelte) instead.

## Key Features

- Four visual variants — pick the one that matches your product's tone:
  - **`ring`** — classic 270° rotating arc. Universally recognised.
  - **`dots`** — three bouncing dots. Friendlier, lower-stakes feel.
  - **`bars`** — vertical bars in a wave. Audio / processing vibe.
  - **`pulse`** — concentric expanding rings. Calm, ambient, good for background activity.
- Three sizes (`sm` / `md` / `lg`) — sized in `em` so each variant scales uniformly.
- Inherits parent text colour by default (`currentColor`). Drop the spinner inside any text-coloured element (`<button class="text-blue-500">…`) and it picks up the hue with no extra prop.
- Optional visible `label` renders a caption next to the spinner. Always exposed to assistive tech via `aria-label` even when the label is hidden.
- Pure CSS `@keyframes` — no JS animation loop, no `requestAnimationFrame`, no cleanup on unmount.
- Honours `prefers-reduced-motion: reduce` automatically: drops the spin / bounce / wave / pulse and falls back to a calm opacity fade that still signals activity without triggering vestibular discomfort.
- Zero dependencies, fully copy-paste portable.

## Usage

```svelte
<script lang="ts">
  import Spinner from '$lib/components/Spinner.svelte';
</script>

<!-- Default (ring, md, currentColor) -->
<Spinner />

<!-- Inside a button while submitting -->
<button class="loading" disabled>
  <Spinner size="sm" />
  Submitting…
</button>

<!-- Centred page-level loading -->
<Spinner size="lg" variant="dots" label="Loading data" />

<!-- Custom colour -->
<Spinner color="#10b981" />

<!-- Bars / pulse -->
<Spinner variant="bars" size="lg" />
<Spinner variant="pulse" size="lg" />
```

## Props

| Prop        | Type                                          | Default        | Description |
|-------------|-----------------------------------------------|----------------|-------------|
| `variant`   | `'ring' \| 'dots' \| 'bars' \| 'pulse'`       | `'ring'`       | Visual style of the spinner. |
| `size`      | `'sm' \| 'md' \| 'lg'`                        | `'md'`         | Visual size. Drives a font-size on the wrapper so children scale uniformly. |
| `color`     | `string` (any CSS colour)                     | `currentColor` | Override the inherited text colour. Forwarded as the `--spinner-color` custom property. |
| `label`     | `string`                                      | `''`           | Optional visible caption rendered next to the animation. |
| `ariaLabel` | `string`                                      | `'Loading'`    | Used as `aria-label` only when no visible `label` is set. |
| `class`     | `string`                                      | `''`           | Extra classes on the wrapper. |

## When to use

- Any in-progress operation of unknown / variable duration: form submission, background fetch, file upload (where you don't have byte-level progress), an API call that hasn't started streaming yet.
- Inside a button while the user waits for the action to confirm.
- As a small inline indicator next to a row in a list (e.g. "saving this row…").
- As a full-page centred indicator before a route's content has resolved.

## When not to use

- You know the percentage complete → use [`ProgressBar`](./ProgressBar.svelte) (linear) or [`ProgressRing`](./ProgressRing.svelte) (circular). A determinate indicator gives users far better information than an indeterminate spinner.
- Content is loading and you want to show a placeholder of the *shape* of the missing content → use [`SkeletonLoader`](./SkeletonLoader.svelte). Skeletons reduce perceived wait time better than spinners do.
- An operation takes more than ~10 seconds without feedback → spinners get *anxiety-inducing* past that. Show meaningful progress, time-remaining, or a status message.
- Decorative animation only → spinners signal "wait", which carries semantic weight. Use a regular animated element instead.

## Accessibility notes

- The wrapper has `role="status"` so screen readers announce it as a status region.
- `aria-live="polite"` surfaces the label without interrupting the user's current reading flow.
- The visible `label` (if set) is preferred for `aria-label` to avoid the screen reader saying the same thing twice.
- The animated SVG / span elements are `aria-hidden="true"` — they're decorative; the textual label is what's announced.
- `prefers-reduced-motion: reduce` is respected at the CSS layer: animations fall back to a calm opacity fade.
- The spinner inherits `currentColor` by default, so it picks up the contrast story of its parent text colour automatically — no separate "what colour against what background" decision required.
