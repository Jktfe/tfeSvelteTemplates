---
title: ClickSpark
description: Wrap any element to fire a configurable particle burst from the click point. Pure CSS keyframe animation, no rAF, four spark shapes, and prefers-reduced-motion suppresses the burst entirely.
category: Helpful UX
author: tfeClaude
---

# ClickSpark

A drop-in decorative wrapper that turns any clickable element into a delight moment — every click sprays a configurable burst of particles outward from the click point. Inspired by reactbits.dev's _ClickSpark_, rebuilt as a portable Svelte 5 component with no dependencies and a deliberately small surface area.

## Key Features

- **Wrap anything** — buttons, links, cards, images. The wrapped child keeps its native role and click semantics.
- **Four spark shapes** — `dot`, `plus`, `line`, `star` (all CSS-only, no SVG required).
- **Composable** — multiple rapid clicks create independent bursts. Each self-cleans on its own timer; no global state or rAF loop.
- **Configurable** — count, colour, size, spread radius, duration, easing.
- **Reduced-motion respectful** — when the user prefers reduced motion, the click handler short-circuits and no burst is spawned.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no external animation library.

## Usage

```svelte
<script lang="ts">
  import ClickSpark from '$lib/components/ClickSpark.svelte';
</script>

<ClickSpark>
  <button>Click me</button>
</ClickSpark>
```

### Custom palette + count

```svelte
<ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
  <button class="cta">Try the demo</button>
</ClickSpark>
```

### Bigger, slower, with line streaks

```svelte
<ClickSpark sparkSize={14} spreadRadius={120} duration={900} shape="line">
  <a href="/about">About →</a>
</ClickSpark>
```

### Wrap a card or image

The wrapper is `display: inline-block` and inherits the child's footprint, so it works equally well around a card:

```svelte
<ClickSpark sparkColor="#22d3ee" shape="plus">
  <article class="feature-card">
    <h3>Features</h3>
    <p>Click anywhere on the card.</p>
  </article>
</ClickSpark>
```

## Props

| Prop           | Type                                        | Default                          | Description |
|----------------|---------------------------------------------|----------------------------------|-------------|
| `sparkColor`   | `string`                                    | `'#ffffff'`                      | Any CSS colour. Applied via `--color` custom property. |
| `sparkCount`   | `number`                                    | `8`                              | Number of particles per click. Distributed evenly around 360°. |
| `sparkSize`    | `number`                                    | `10`                             | Particle size in px. |
| `spreadRadius` | `number`                                    | `60`                             | How far each particle flies, in px. |
| `duration`     | `number`                                    | `500`                            | Burst lifetime in ms. |
| `easing`       | `string`                                    | `'cubic-bezier(0.25, 1, 0.5, 1)'` | CSS easing for the fly-out. |
| `shape`        | `'dot' \| 'plus' \| 'line' \| 'star'`       | `'dot'`                          | Particle shape. |
| `class`        | `string`                                    | `''`                             | Extra classes on the wrapper. |
| `children`     | `Snippet`                                   | required                         | Element(s) to wrap. |

## Exports

`ClickSpark.svelte` also exports a small helper for tests / advanced consumers:

```ts
import { getSparkAngles } from '$lib/components/ClickSpark.svelte';

getSparkAngles(8); // [0, 45, 90, 135, 180, 225, 270, 315]
```

## When to use

- Premium CTAs (sign-up buttons, pricing tiers, "Get started" links)
- Confirmation moments (likes, votes, "send" buttons in a chat)
- Decorative interactions on marketing pages
- Easter-egg flair on logos or hero illustrations

## When not to use

- Form submit buttons in production data-entry flows — visual noise during high-frequency clicks can be disorienting.
- Anywhere the click frequency is high (e.g. a numpad) — bursts compose, but visually they get chaotic.
- Inside table cells / list items where the wrapper's `inline-block` layout could disrupt grid alignment — wrap an inner span instead.

## Accessibility notes

- The wrapper carries no ARIA role and is not focusable. Keyboard users interact with the wrapped child as normal.
- Sparks are `aria-hidden="true"` and `pointer-events: none`, so they never appear in the AT tree and never swallow clicks meant for the child.
- `prefers-reduced-motion: reduce` triggers two safeguards:
  1. `handleClick` early-returns before pushing a burst into state, so no burst DOM is created.
  2. A defensive `@media (prefers-reduced-motion: reduce)` rule in the scoped CSS hides any spark elements that might already be in flight if the preference flips mid-burst.
- The wrapper's click listener fires before the wrapped child's listener (via bubbling), so the child's click handler still runs normally.

## Why CSS keyframes instead of rAF / spring physics

Each spark only needs to do one thing: fly outward in a straight line and fade. A CSS keyframe animation is the right tool — the browser owns the rendering pipeline, individual sparks don't need per-frame state, and the animation runs on the compositor for smoothness. We use `transform: rotate(var(--angle)) translateX(var(--distance))` so each spark's local X axis points outward and we get unique directions for free without per-spark trigonometry.

## Distinct from

- **AnimatedBeam** — directional beam between two anchors. ClickSpark is radial outward from a click.
- **MagneticButton** — cursor-attract effect on hover. ClickSpark fires on click, not hover.
- **Spinner** — indeterminate loading indicator. ClickSpark is interaction feedback, not status.
- **ShineBorder / MagicCard** — ambient/hover decoration on the bounding box. ClickSpark is a one-shot burst tied to the click point.
