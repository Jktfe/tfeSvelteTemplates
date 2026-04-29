---
title: ShinyText
description: Wrap a string of text in a CSS gradient that has a brighter "shine" sweeping across the letters. Pure CSS keyframe animation, two configurable colours, LR/RL direction, loop or one-shot, prefers-reduced-motion safe.
category: Helpful UX
author: tfeClaude
---

# ShinyText

A small, decorative typography primitive — wraps a string of text in a CSS gradient and animates a brighter "shine" band sweeping through the letterforms. The whole effect is one keyframe animation; no JavaScript runs after mount, so it is safe to drop many on a page.

Inspired by [reactbits.dev's _ShinyText_](https://reactbits.dev/), rebuilt as a portable Svelte 5 component with zero dependencies.

## Key Features

- **Pure CSS** — single `@keyframes shiny-sweep` block, GPU-accelerated `background-position`, no rAF, no JS interval.
- **Configurable colours** — `baseColor` (resting) and `shineColor` (highlight) take any CSS colour value (hex, `rgb()`, `hsl()`, `var(...)`).
- **Direction control** — `direction="lr"` or `"rl"` toggles the visual sweep without swapping keyframes (uses CSS `animation-direction`).
- **Loop or one-shot** — `loop={false}` runs the animation exactly once and settles.
- **Optional start delay** — chain ShinyText elements with staggered `delay` for sequenced reveals.
- **Reduced-motion safe** — `@media (prefers-reduced-motion: reduce)` suppresses the animation entirely; the text settles in its base colour.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no animation library.

## Usage

```svelte
<script lang="ts">
  import ShinyText from '$lib/components/ShinyText.svelte';
</script>

<!-- Default: white shine on slate-400 base, 3-second loop -->
<ShinyText text="Premium" />

<!-- Brand-coloured CTA shimmer -->
<ShinyText
  text="Get Started →"
  shineColor="#fbbf24"
  baseColor="#475569"
  duration={2.5} />

<!-- One-shot reveal with a delay (great for hero entrances) -->
<ShinyText
  text="Welcome"
  loop={false}
  delay={0.4}
  direction="lr" />
```

Wrap inside any heading or layout element you like — `ShinyText` renders an inline-block `<span>` and inherits the surrounding font size, weight, and family.

```svelte
<h1 class="hero-title">
  Build something <ShinyText text="extraordinary" shineColor="#a78bfa" />
</h1>
```

## Props

| Prop         | Type                | Default     | Description                                           |
|--------------|---------------------|-------------|-------------------------------------------------------|
| `text`       | `string`            | required    | The text to display                                   |
| `baseColor`  | `string`            | `'#94a3b8'` | Resting (non-shine) text colour                       |
| `shineColor` | `string`            | `'#ffffff'` | Bright highlight colour                               |
| `duration`   | `number`            | `3`         | Seconds for one full sweep                            |
| `direction`  | `'lr' \| 'rl'`      | `'lr'`      | Sweep direction (left-to-right or right-to-left)      |
| `loop`       | `boolean`           | `true`      | Repeat indefinitely (`false` = one-shot)              |
| `delay`      | `number`            | `0`         | Seconds before the first sweep begins                 |
| `class`      | `string`            | `''`        | Extra CSS classes appended to the wrapper             |

## Distinct From

- **`ShineBorder`** animates a *border*, leaving the text colour untouched.
- **`Typewriter`** types characters one at a time; the gradient stays still.
- **`Marquee`** scrolls a whole element across the viewport; ShinyText never moves the text itself, only the paint inside it.

## Accessibility

- The wrapped text is a real text node, so screen readers read it normally — no `aria-hidden`, no `aria-live` games are required.
- `@media (prefers-reduced-motion: reduce)` removes the animation and the gradient entirely; the text rests in `baseColor` for users who prefer not to see motion.
- Purely decorative — no focus, role, or interaction semantics are introduced.

## Performance Notes

- `background-position` animation is composited on the GPU; the layout, paint, and composite costs do not scale with text length.
- A reasonable upper bound is "anywhere a heading fits" — this is not designed for animating long paragraphs (which would also be unkind to readers).
- The component never reads layout, never observes resize, and never uses `requestAnimationFrame`.

## Implementation Notes

The animation slides a 200%-wide linear gradient (base → shine → base) across an `inline-block` span. `background-clip: text` together with `-webkit-text-fill-color: transparent` clips the visible gradient to the letter glyphs. Direction is controlled by `animation-direction: normal | reverse` rather than two keyframe blocks — this keeps the CSS small and side-steps a Safari/older-WebKit quirk where CSS custom properties inside `@keyframes` could fail to resolve.
