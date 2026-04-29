---
title: TrueFocus
description: Cycle through highlighting one word at a time in a phrase using a single morphing focus box that slides and resizes between words. Configurable cycle pace, hover-to-pause, click-to-pin, prefers-reduced-motion safe.
category: Helpful UX
author: tfeClaude
---

# TrueFocus

A typography emphasiser that draws attention to one word at a time inside a phrase. A single absolutely-positioned focus box morphs from word to word — sliding its position and resizing its width/height — so the highlight feels like a moving spotlight rather than a flicker of separate borders.

Inspired by [reactbits.dev's _True Focus_](https://reactbits.dev/), rebuilt as a portable Svelte 5 component with zero dependencies.

## Key Features

- **Single morphing focus box** — width, height, x, y all animate with one CSS transition. No per-word borders, no DOM duplication, no React-reconciler-style flicker.
- **Configurable cycle pace** — `cycleDuration` controls how long each word stays in focus before the indicator slides on.
- **Two cycle orders** — `'sequential'` reads naturally word-by-word; `'random'` jumps the focus around for a more poetic, scattered emphasis.
- **Hover to pause** — set `pauseOnHover` and the cycle stops while the pointer is over the phrase. Walks away → cycle resumes.
- **Click to pin** — clicking a word freezes the focus on it. Click the pinned word again to release. Keyboard users get the same behaviour via Enter/Space (each word is `role="button"` and `tabindex="0"`).
- **Re-measures on layout change** — a `ResizeObserver` watches the wrapper, so when fonts load, the container resizes, or the text wraps to a new line, the focus box snaps to the right place.
- **Reduced-motion safe** — `prefers-reduced-motion: reduce` disables the morph transition. The indicator still appears (so the active word is visible) but jumps directly between positions.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no animation library.
- **Pure helpers exported** — `splitWords`, `cycleNext`, `padRect`, `buildIndicatorStyle` are exported from the `module` script and unit-tested with deterministic rng.

## Usage

```svelte
<script lang="ts">
  import TrueFocus from '$lib/components/TrueFocus.svelte';
</script>

<!-- Default: sequential cycle, 1.5s per word, indigo focus box -->
<TrueFocus text="True focus on the present" />

<!-- Brand-coloured, slower pace, sequential -->
<TrueFocus
  text="Build something extraordinary."
  cycleDuration={1800}
  color="#a855f7"
  glow={true} />

<!-- Random order — gives a poetic, scattered emphasis -->
<TrueFocus
  text="The mind moves in many directions"
  order="random"
  cycleDuration={1200} />

<!-- Disable autoStart and let users tab through to pin manually -->
<TrueFocus text="Pin a word with click or Enter" autoStart={false} />
```

Drop inside any heading or layout — `TrueFocus` renders an inline-block span and inherits the surrounding font, weight, and size.

```svelte
<h1 class="hero-title">
  <TrueFocus text="Make every word count" color="#fbbf24" />
</h1>
```

## Props

| Prop            | Type                            | Default     | Description                                            |
|-----------------|---------------------------------|-------------|--------------------------------------------------------|
| `text`          | `string`                        | required    | The phrase, split on whitespace                        |
| `cycleDuration` | `number`                        | `1500`      | Ms each word stays in focus before the indicator moves |
| `color`         | `string`                        | `'#4338ca'` | Focus-box border + glow colour (any CSS colour)        |
| `glow`          | `boolean`                       | `true`      | Whether to add a soft `box-shadow` halo                |
| `order`         | `'sequential' \| 'random'`      | `'sequential'` | Cycle order                                         |
| `pauseOnHover`  | `boolean`                       | `true`      | Stop the cycle while the pointer is over the phrase    |
| `autoStart`     | `boolean`                       | `true`      | Begin cycling on mount                                 |
| `paddingX`      | `number`                        | `8`         | Horizontal padding inside the focus box (px)           |
| `paddingY`      | `number`                        | `4`         | Vertical padding inside the focus box (px)             |
| `class`         | `string`                        | `''`        | Extra CSS classes appended to the wrapper              |

## Distinct From

- **`Typewriter`** types characters one at a time — TrueFocus reveals nothing; the words are all visible from the start.
- **`ScrambledText`** scrambles glyphs before settling — TrueFocus never touches the glyphs, just the surrounding indicator.
- **`ShinyText`** sweeps a continuous gradient through the letters — TrueFocus is discrete and word-anchored.
- **`Marquee`** scrolls a whole element across the viewport — TrueFocus stays in place; only the highlight moves.

`TrueFocus` operates at the word level, leaving the typography untouched.

## Accessibility

- The phrase is one real text node split into spans — screen readers announce it as one continuous string.
- The focus indicator is decorative (`aria-hidden="true"`); the words themselves carry the meaning.
- Each word is `role="button"` with `tabindex="0"`, so keyboard users can Tab to a word and press Enter or Space to pin it. A dashed `outline: 2px dashed currentColor` on `:focus-visible` makes the keyboard target obvious without competing with the cycling focus box.
- `@media (prefers-reduced-motion: reduce)` removes the morph transition. JS-level check + CSS `@media` is belt-and-braces — there is no fallback flicker.
- The cycle is paused while the user hovers the phrase (when `pauseOnHover` is on) and is paused indefinitely while a word is pinned, so users always have time to read.

## Performance Notes

- One indicator element. Position and size animate via CSS transitions on `transform`, `width`, `height` — all GPU-composited, no layout thrash per frame.
- The cycle is a single `setInterval`. It pauses cheaply (just a flag check inside the callback) on hover or pin.
- `ResizeObserver` fires only when the wrapper actually changes size, so quiet pages cost nothing after mount.
- Text length scales linearly only in the number of word spans (one per token); the indicator is a single element regardless.

## Implementation Notes

The maths is split into pure helpers exposed via the `module` script:

- `splitWords(text)` collapses runs of whitespace and returns the word tokens.
- `cycleNext(current, total, order, rng?)` picks the next index — `'sequential'` wraps cleanly, `'random'` avoids landing back on the current word.
- `padRect(rect, paddingX, paddingY)` expands a measured bounding box outwards, giving the indicator breathing room.
- `buildIndicatorStyle(rect, color, glow)` produces the inline `style` string with `translate3d` (GPU-friendly), `width`, `height`, `border-color`, and an optional `box-shadow` halo.

The component itself is a thin shell:

1. Render each word as a span and grab refs into a `Map<index, HTMLElement>`.
2. On mount, measure the active word relative to the wrapper. Apply the resulting rect via `buildIndicatorStyle` to the single indicator element.
3. A `setInterval` ticks the active index forward (or randomly). Pause if hovering or pinned.
4. A `ResizeObserver` re-measures on wrapper resize so the indicator stays glued to the right word when the layout reflows.
5. CSS transitions on `transform`, `width`, `height` on the indicator give the morph for free.
