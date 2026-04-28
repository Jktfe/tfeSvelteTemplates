---
title: SkeletonLoader
description: Three-shape primitive for content placeholders that pre-render layout while data loads.
category: Helpful UX
author: AntClaude
---

# SkeletonLoader

A tiny primitive that renders a soft grey shape with optional pulse / shimmer animation. Compose lots of them to pre-figure cards, lists, dashboards while data is in flight — the layout stays put when the real content arrives.

## Key Features

- **Three shapes** — `text` (rounded line), `circle` (avatars), `rect` (cards / images / buttons)
- **Sensible defaults** per shape — `text` is `0.875rem` tall, `circle` defaults to a `2.5rem` round, `rect` is `8rem` tall
- **Two animations** — `pulse` (gentle fade) or `shimmer` (sweeping highlight). `none` disables motion.
- **Honours `prefers-reduced-motion`** — animation stops automatically for users who request it
- **Decorative by default** — `aria-hidden="true"`. Communicate loading state via the parent's `aria-busy` or a sr-only message.
- **Zero dependencies**, pure CSS animations

## Usage

```svelte
<script lang="ts">
  import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';
</script>

<!-- Single text line -->
<SkeletonLoader />

<!-- Avatar -->
<SkeletonLoader shape="circle" width="48px" height="48px" />

<!-- Hero image -->
<SkeletonLoader shape="rect" width="100%" height="240px" />

<!-- Composed card placeholder -->
<div class="card" aria-busy="true">
  <SkeletonLoader shape="rect" height="160px" />
  <div class="card-body">
    <SkeletonLoader width="70%" />
    <SkeletonLoader width="40%" />
    <SkeletonLoader />
    <SkeletonLoader width="85%" />
  </div>
</div>
```

## Props

| Prop        | Type                              | Default  | Description |
|-------------|-----------------------------------|----------|-------------|
| `shape`     | `'text' \| 'circle' \| 'rect'`     | `'text'` | Geometry primitive |
| `width`     | `string`                          | `'100%'` | CSS width (any unit). Defaults to height for circles. |
| `height`    | `string`                          | `undefined` | Defaults differ per shape. |
| `radius`    | `string`                          | `undefined` | Override border-radius. Circles default to `50%`. |
| `animation` | `'pulse' \| 'shimmer' \| 'none'`   | `'pulse'`| Animation style. `none` disables motion. |
| `class`     | `string`                          | `''`     | Extra classes. |

## Accessibility tips

The component is decorative (`aria-hidden="true"`) so it never speaks to screen readers directly. Communicate the *loading state* on the surrounding region instead:

```svelte
<section aria-busy={loading} aria-live="polite">
  {#if loading}
    <SkeletonLoader shape="rect" height="120px" />
    <span class="sr-only">Loading orders…</span>
  {:else}
    <!-- real content -->
  {/if}
</section>
```

## When to use

- Loading lists, cards, dashboards before data arrives
- Image placeholders before the image has decoded
- Any region where layout shift would be jarring

## When not to use

- Quick async ops (<200ms) — a spinner is friendlier than a flash of skeletons
- Errored states — switch to an `EmptyState` with a retry CTA
- Indefinite loading — give the user some signal of progress (spinner, stage labels)
