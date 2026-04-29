---
title: VariableProximity
description: Cursor-reactive typography that morphs variable-font axes (wght/wdth/slnt/opsz) per letter as the pointer approaches.
category: Typography
author: Claude
---

# VariableProximity

A typography primitive that maps **cursor proximity** onto **variable-font axes**. As the pointer hovers nearer a letter, that letter morphs along configurable axes — heavier, wider, slanted, optically larger — with smooth CSS transitions doing the interpolation. Every other letter stays at its base value, so the phrase ripples like an organic spotlight rather than animating uniformly.

Unlike time-based typography effects (Typewriter, ScrambledText, ShinyText, TrueFocus), `VariableProximity` is **purely spatial** — there is no animation loop and no setInterval. The letters only move when the cursor moves, which means the component costs nothing when the user isn't interacting.

## Key Features

- **Cursor-reactive per-letter morphing**: each letter independently interpolates between `base` and `peak` along every configured axis, weighted by a falloff curve from the cursor.
- **Multi-axis simultaneity**: animate `wght`, `wdth`, `slnt`, and `opsz` together — write your own `AxisRange[]` or use the sensible default (`wght: 400→800`, `wdth: 100→125`).
- **Three falloff curves**: `linear` (triangular), `quadratic` (smooth shoulder, default), `gaussian` (narrow bell).
- **rAF-throttled pointer pipeline**: pointermove events coalesce into one DOM-write pass per frame — no thrash even on dense paragraphs.
- **CSS does the easing**: per-letter inline `font-variation-settings` is set once per frame; the visual smoothing comes from a CSS `transition` on `font-variation-settings` (configurable via `transitionMs`).
- **Variable-font detection**: `CSS.supports('font-variation-settings', '"wght" 400')` gates the interactive path. On older engines the text simply renders statically — no broken state.
- **Keyboard parity**: focusing the wrapper places a virtual cursor at its centre, so keyboard users see a peak-centred preview.
- **Accessibility-first**: the wrapper carries the full string as `aria-label`, per-letter spans are `aria-hidden`. Screen readers hear "Welcome aboard", not "W-e-l-c-o-m-e".
- **Reduced-motion respect**: `prefers-reduced-motion: reduce` short-circuits the interactive path and disables the transition.
- **Surrogate-pair safe**: `splitToLetters` uses `Array.from(text)` so emoji and combined glyphs render as one token, not two broken halves.
- **Zero external dependencies**.

## Usage

### Default (weight + width on hover)

```svelte
<script lang="ts">
  import VariableProximity from '$lib/components/VariableProximity.svelte';
</script>

<h1 class="display-1">
  <VariableProximity text="Type that breathes." />
</h1>
```

### Slant-only italic-on-approach

```svelte
<VariableProximity
  text="Lean in to read me."
  axes={[{ axis: 'slnt', base: 0, peak: -12 }]}
  radius={140}
/>
```

### Condensed-to-expanded width emphasis

```svelte
<VariableProximity
  text="Stretch across the page"
  axes={[{ axis: 'wdth', base: 75, peak: 125 }]}
  radius={160}
  falloffCurve="gaussian"
/>
```

### Multi-axis hero with optical sizing

```svelte
<VariableProximity
  text="Premium typography, on demand."
  axes={[
    { axis: 'wght', base: 350, peak: 900 },
    { axis: 'wdth', base: 100, peak: 130 },
    { axis: 'opsz', base: 24, peak: 96 }
  ]}
  radius={150}
  transitionMs={200}
/>
```

## Props

| Prop            | Type                                          | Default                                                                | Description                                                                                                  |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `text`          | `string`                                      | required                                                               | The phrase to render. Whitespace is preserved; surrogate pairs (e.g. emoji) are kept as single tokens.       |
| `radius`        | `number`                                      | `120`                                                                  | The pointer-distance (px) at which the falloff reaches zero. Larger values give a wider influence area.      |
| `falloffCurve`  | `'linear' \| 'quadratic' \| 'gaussian'`       | `'quadratic'`                                                          | How proximity maps onto axis interpolation. Quadratic is the most flattering default; gaussian is the punchiest. |
| `axes`          | `AxisRange[]`                                 | `[{ axis: 'wght', base: 400, peak: 800 }, { axis: 'wdth', base: 100, peak: 125 }]` | The variable-font axes to animate. Order does not matter; both `base→peak` (ascending) and `base→peak` descending (e.g. slnt going negative) are supported. |
| `transitionMs`  | `number`                                      | `150`                                                                  | The CSS transition duration (ms) that smooths the per-letter `font-variation-settings` writes between frames. |
| `class`         | `string`                                      | `''`                                                                   | Additional class names to append to the wrapper element. Useful for sizing/colour at the call-site.          |

## Types

```typescript
export type Axis = 'wght' | 'wdth' | 'slnt' | 'opsz';
export type FalloffCurve = 'linear' | 'quadratic' | 'gaussian';

export interface AxisRange {
  /** The axis tag (e.g. 'wght', 'wdth', 'slnt', 'opsz'). */
  axis: Axis;
  /** The value when the cursor is far away (proximity = 0). */
  base: number;
  /** The value when the cursor is directly on the letter (proximity = 1). */
  peak: number;
}
```

## Pure helpers (exported from the module-script)

These are exported so they can be unit-tested without a DOM and reused in custom variants. Import them alongside the component:

```typescript
import VariableProximity, {
  distance,
  falloff,
  axisInterpolate,
  buildVariationSettings,
  isVariableFontSupported,
  splitToLetters,
  type AxisRange
} from '$lib/components/VariableProximity.svelte';
```

| Helper                                                                       | Returns                                                       | Notes                                                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `distance(p1, p2)`                                                           | `number`                                                      | Plain Euclidean distance between two `{ x, y }` points. Symmetric, sign-safe.    |
| `falloff(d, radius, curve)`                                                  | `number` in `[0, 1]`                                          | `1` at the centre, `0` at and beyond `radius`. Defensive against radius ≤ 0.     |
| `axisInterpolate(t, base, peak)`                                             | `number`                                                      | Unclamped linear interpolation. `t=0`→base, `t=1`→peak, `t=0.5`→midpoint.        |
| `buildVariationSettings(axes, proximity)`                                    | `string` (CSS `font-variation-settings` value)                | Two-decimal precision, comma-separated, ready to drop into inline style.        |
| `isVariableFontSupported()`                                                  | `boolean`                                                     | `CSS.supports('font-variation-settings', '"wght" 400')`. Safe in SSR (returns `false`). |
| `splitToLetters(text)`                                                       | `{ char: string; isSpace: boolean }[]`                        | Surrogate-pair safe via `Array.from`. Whitespace flagged for separate rendering. |

## How it works

1. **Mount**: split the text into per-letter tokens with `splitToLetters`. Each non-space char becomes a `<span class="letter">`; spaces become `<span class="space">` (no font-variation work needed).
2. **Register**: every letter span registers its DOM node into a `SvelteMap<number, HTMLElement>` via `bind:this={ getter, setter }`. (We use `SvelteMap` from `svelte/reactivity` so mutations emit Svelte 5 reactivity signals — a plain `Map` would not.)
3. **Pointer move**: a `pointermove` listener records the cursor's `{ x, y }` and schedules a single rAF callback per frame. No matter how many events fire, only one DOM-write pass happens per repaint.
4. **Per-letter compute**: in the rAF callback, for each registered letter we compute its centre via `getBoundingClientRect`, run `distance` against the cursor, feed it through `falloff(d, radius, curve)` to get a 0..1 proximity, then call `buildVariationSettings(axes, proximity)` to produce a CSS `font-variation-settings` string. The string is written as inline `style.fontVariationSettings`.
5. **CSS transition**: the wrapper's `--vp-transition-ms` CSS custom property drives a `transition: font-variation-settings <ms> ease-out` on every letter. The browser smooths between successive frame values without any JS tween.
6. **Pointer leave / blur**: when the cursor leaves or focus is lost, all letters reset to proximity = 0 (their base values) in a single batched write.

## Accessibility

- **Screen readers**: the wrapper has `aria-label={text}`, every letter span has `aria-hidden="true"`. Screen readers announce the full phrase as one continuous string.
- **Keyboard**: the wrapper is `tabindex="0"`. On focus, a virtual cursor is placed at the wrapper's centre so keyboard users see a balanced peak across the phrase. On blur, letters reset.
- **Reduced motion**: when `prefers-reduced-motion: reduce` is set, the interactive path is disabled — the text renders statically at base values, and the CSS transition is removed.
- **Variable-font fallback**: when the browser does not support `font-variation-settings` (rare, but old Edge/Safari < 11), the component renders statically. No JS errors, no broken layout.

## Performance

- **Suitable for**: phrases up to ~200 characters across multiple lines. The cost per frame is `O(n)` letters × one `getBoundingClientRect` + one `style.fontVariationSettings` write.
- **Considerations**: `getBoundingClientRect` is cheap on modern engines (cached layout) but is still a layout read. For very long paragraphs, consider chunking or measuring rects once on mount and reusing them, accepting that they go stale on resize.
- **Idle cost is zero**: no animation runs when the cursor isn't moving. A static page with this component on it consumes no CPU.

## Font requirements

This component shines when paired with a true variable font. Falls back to system stack:

```css
font-family:
  'Inter Variable',
  'Roboto Flex',
  'Segoe UI Variable Display',
  'Segoe UI Variable',
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

- **macOS / iOS**: SF Pro is variable (wght, wdth, opsz).
- **Windows 11+**: Segoe UI Variable supports wght, opsz.
- **Android 12+**: Roboto Flex supports the full axis set.
- **Self-host options**: [Inter Variable](https://rsms.me/inter/) (wght, slnt), [Roboto Flex](https://github.com/TypeNetwork/Roboto-Flex) (full set), [Recursive](https://www.recursive.design/) (wght, slnt, mono, casl).

If you load a custom variable font, place it in `static/fonts/` and reference it from your `app.css` — `VariableProximity` will pick it up via the cascade.

## Testing

Run unit tests with:

```bash
bun run test src/lib/components/VariableProximity.test.ts
```

The test file covers:
- All six pure helpers, including edge cases (empty axes, descending ranges, surrogate pairs, defensive radius).
- Component rendering (letter/space span counts, ARIA attributes, custom class append, empty text).
- The `--vp-transition-ms` CSS custom property is wired correctly.

## When to reach for it

- **Hero headlines** that need to feel premium without a heavy GIF or Lottie.
- **Magazine-style pull quotes** where the eye should follow the cursor across a phrase.
- **Brand statement components** where a logo couldn't carry the moment alone.
- **Editorial buttons** — set a wider `radius` than the button's bounding box, and the type leans towards the cursor before the user clicks.

## When *not* to reach for it

- **Long-form body text**: the per-letter span machinery hurts text selection ergonomics. Keep this for short, punchy phrases.
- **Buttons with a single word**: the effect is most visible across a phrase. A one-word button is better served by a more conventional hover state.
- **Non-Latin scripts where letter rhythm doesn't translate**: the splitter is grapheme-aware (Array.from), but languages where typography breathes at the syllable rather than letter level may want a different primitive.

## Inspiration

The interaction draws from the [reactbits.dev — Variable Proximity](https://reactbits.dev/) demo, but rebuilt as a portable Svelte 5 primitive with no React, no Framer Motion, and no font-loading magic — just the system variable stack, CSS transitions, and ~12KB of inspectable Svelte.
