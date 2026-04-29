---
title: ScrambledText
description: Reveal a string by scrambling each character through a configurable pool of glyphs, then settling on the final letter. Pure JS state machine on requestAnimationFrame, deterministic-friendly helpers, prefers-reduced-motion safe.
category: Helpful UX
author: tfeClaude
---

# ScrambledText

A typography reveal that turns plain text into a "decoding terminal" effect — every character starts as a random glyph from a configurable pool and then snaps to its final letter at a per-character settle time. Two reveal orders (left-to-right, random), optional replay-on-hover, optional start delay.

Inspired by [reactbits.dev's _ScrambledText_](https://reactbits.dev/), rebuilt as a portable Svelte 5 component with zero dependencies.

## Key Features

- **Pure JS state machine** — one `requestAnimationFrame` loop while scrambling, cleared on completion. No per-letter components, no DOM diffing — a single text node is updated each frame.
- **Configurable scramble pool** — defaults to `A–Z` + `0–9`. Pass any string (Cyrillic, katakana, glyph cipher, custom emoji set) to change the cipher feel.
- **Two reveal orders** — `'left-to-right'` lands characters in reading order; `'random'` jitters each character into a random slot inside the duration window.
- **Replay on hover** — set `replayOnHover` to re-scramble the text whenever the pointer enters.
- **Auto-start or trigger later** — `autoStart={false}` settles to the final text immediately so you can choreograph timing yourself (e.g. via `replayOnHover`).
- **Optional start delay** — chain multiple `ScrambledText` reveals in sequence.
- **Reduced-motion safe** — `prefers-reduced-motion: reduce` skips the animation; the text renders in its final form. No flicker, no half-states.
- **Spaces preserved** — whitespace never scrambles, so word boundaries stay readable mid-reveal. Reads less like noise, more like a message coming into focus.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no animation library.
- **Pure helpers exported** — `pickScrambleChar`, `computeSettleTimes`, `getDisplayString`, `isScrambleComplete` are exported from the `module` script and unit-tested with deterministic rng.

## Usage

```svelte
<script lang="ts">
  import ScrambledText from '$lib/components/ScrambledText.svelte';
</script>

<!-- Default: left-to-right reveal over 1.5s -->
<ScrambledText text="Hello, world" />

<!-- Random reveal, hover to replay -->
<ScrambledText
  text="DECODED"
  duration={2000}
  order="random"
  replayOnHover />

<!-- Sequenced one-shots with delay (great for hero entrances) -->
<ScrambledText text="Ready." duration={900} />
<ScrambledText text="Set."   duration={900} delay={400} />
<ScrambledText text="Go."    duration={900} delay={800} />
```

Drop inside any heading or layout element — `ScrambledText` renders an inline-block span and inherits the surrounding font, weight, and size.

```svelte
<h1 class="hero-title">
  We <ScrambledText text="ENGINEER" pool="01" duration={2200} /> outcomes.
</h1>
```

## Props

| Prop            | Type                              | Default                                | Description                                                |
|-----------------|-----------------------------------|----------------------------------------|------------------------------------------------------------|
| `text`          | `string`                          | required                               | The final string                                           |
| `duration`      | `number`                          | `1500`                                 | Total scramble length in ms                                |
| `pool`          | `string`                          | `A–Z` + `0–9`                          | Characters to pick from while scrambling                   |
| `order`         | `'left-to-right' \| 'random'`     | `'left-to-right'`                      | Per-char settle order                                      |
| `replayOnHover` | `boolean`                         | `false`                                | Restart the scramble on `pointerenter`                     |
| `autoStart`     | `boolean`                         | `true`                                 | Run the scramble on mount (else settle to text immediately)|
| `delay`         | `number`                          | `0`                                    | Ms to wait before the first tick                           |
| `class`         | `string`                          | `''`                                   | Extra CSS classes appended to the wrapper                  |

## Distinct From

- **`Typewriter`** types one character at a time, in order — never scrambles or shows non-final glyphs.
- **`ShinyText`** recolours letters via a sweeping gradient — the glyphs themselves never change.
- **`Marquee`** scrolls a whole element across the viewport — the text content stays the same.
- **`MorphingDialog`** transitions between two layouts — operates at the layout level, not the character level.

## Accessibility

- The wrapper carries an `aria-label` set to the **final** text, so screen readers announce the destination string immediately — they never read the noisy scrambled state.
- The visible text node is `aria-hidden="true"` (decorative).
- `@media (prefers-reduced-motion: reduce)` is respected on mount: the animation is skipped and the text renders in its final form. JS-level check + no CSS animations means there is no fallback flicker.
- Purely decorative — no focus, role, or interaction semantics are introduced (with one exception: pointer events for `replayOnHover`).

## Performance Notes

- **One `requestAnimationFrame` loop** while scrambling, cancelled on completion.
- **One text node** is updated each frame; no per-letter spans, no DOM diff per character. The DOM cost stays flat with text length.
- No layout reads, no `ResizeObserver`, no scroll listeners.
- Suitable for headings and short labels. For multi-line paragraphs the effect would be illegible — and unkind to readers — so use it sparingly.

## Implementation Notes

The character-settle math is split into pure helpers, exposed via the `module` script, so unit tests can pass a deterministic rng (e.g. `() => 0`) and assert that:

- `computeSettleTimes(4, 1000, 'left-to-right')` returns `[250, 500, 750, 1000]`
- `getDisplayString('CAT', [50, 200, 400], 100, 'X', () => 0)` returns `'CXX'` (first char settled, others scrambling)
- spaces are preserved at every elapsed time
- `isScrambleComplete(...)` flips `true` exactly once `elapsed` meets the largest settle time

This split keeps the component file itself a thin shell:

1. Build `settleTimes` once at start.
2. rAF loop ticks `elapsed`.
3. Each tick computes the visible string from `(text, settleTimes, elapsed, pool)`.
4. On completion, snap to `text` and cancel the loop.

No DOM diffing, no per-letter component, just a single text node updated each frame.
