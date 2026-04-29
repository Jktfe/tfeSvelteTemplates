---
name: GlitchText
category: Helpful UX
author: antclaude
status: shipped
---

# GlitchText

RGB-channel-split text glitch primitive. Renders text with cyan/magenta offset clones drifting behind the base layer plus an occasional clip-path "tear" band that slices a horizontal strip and shoves it sideways. Asset-free, pure CSS pseudo-elements + clip-path + minimal JS for the timing loop.

Cyberpunk / Y2K-broadcast / VHS-tear aesthetics. Composes well with `CRTScreen` (frame the glitched headline) or any heavy-weight typeface. Pairs naturally with the wider text-effect taxonomy already shipped: `ShinyText` (shimmer pass), `ScrambledText` (glyph-shuffle reveal), `TrueFocus` (focus-ring reveal), `VariableProximity` (cursor-driven font weight), `NeonSign` (glowing tube), `Typewriter` (typing reveal).

## Key features

- **Three intensities** — `subtle` / `moderate` / `wild`. Each preset balances RGB-clone offset, tear cadence and opacity so a single intensity prop does the right thing without prop-soup.
- **Three triggers** — `auto` (start on mount), `hover` (toggle on hover/focus, keyboard-parity), `viewport` (start on first IntersectionObserver entry, then disconnect).
- **Pure helpers exported** from the module-script (`pickIntensity`, `jitterOffset`, `tearBand`, `scheduleNextTear`, `pickTrigger`, `isReducedMotion`) — all directly unit-testable without rendering.
- **Deterministic per-seed jitter** — `jitterOffset` and `tearBand` are pure functions of an integer seed; same seed always yields the same offsets, which makes the visual stable enough not to feel like white noise.
- **prefers-reduced-motion safe** — `start()` checks `isReducedMotion()` and refuses to spin the rAF loop; the stylesheet also hides clones and tear via `@media (prefers-reduced-motion: reduce)` as belt + braces.
- **SR-friendly** — base text remains a real DOM text node; clones are CSS pseudo-elements (invisible to AT); tear band is `aria-hidden`.

## Usage

```svelte
<script>
	import GlitchText from '$lib/components/GlitchText.svelte';
</script>

<GlitchText text="GLITCHED" intensity="moderate" trigger="auto" />
<GlitchText text="HOVER ME" intensity="wild" trigger="hover" />
<GlitchText text="ONSCREEN" intensity="subtle" trigger="viewport" />
```

## Props

| Prop        | Type                              | Default      | Notes                                                              |
| ----------- | --------------------------------- | ------------ | ------------------------------------------------------------------ |
| `text`      | `string`                          | _(required)_ | Visible text. Used both as the DOM text node and the clone source. |
| `intensity` | `'subtle' \| 'moderate' \| 'wild'` | `'moderate'` | Tunes RGB-clone offset, tear cadence and clone opacity.            |
| `trigger`   | `'auto' \| 'hover' \| 'viewport'` | `'auto'`     | When the glitch starts.                                            |

Unknown intensity / trigger values fall back to `moderate` / `auto`.

## Intensity table

| Intensity  | offsetMax (px) | tearMs | jitterMs (cadence) | clone opacity |
| ---------- | -------------- | ------ | ------------------ | ------------- |
| `subtle`   | 1              | 80     | 700                | 0.45          |
| `moderate` | 3              | 130    | 380                | 0.65          |
| `wild`     | 6              | 200    | 220                | 0.85          |

Tear cadence varies in `[0.5x, 1.5x]` of `jitterMs` per cycle so the tears don't beat in time.

## Triggers

- **`auto`** — calls `start()` on `onMount`. Effect runs continuously while the component is in the DOM.
- **`hover`** — `start()` on `mouseenter` / `focusin`, `stop()` on `mouseleave` / `focusout`. Keyboard-parity via focus events. Resting state is clean text (no rAF, no timers).
- **`viewport`** — uses `IntersectionObserver` to fire `start()` on first intersection, then disconnects the observer (one-shot). Useful for hero sections that should glitch into life on scroll.

In all cases, `stop()` runs on component destroy to cancel rAF + clear timers + reset visuals.

## Distinct from

- **`ShinyText`** — shimmer-pass highlight sweep over text. GlitchText is RGB-split + clip-path tear, no shimmer.
- **`ScrambledText`** — glyph-shuffle reveal toward target text. GlitchText preserves the text exactly; only the visual rendering distorts.
- **`TrueFocus`** — focus-ring reveal over a word. GlitchText is whole-string distortion.
- **`VariableProximity`** — per-glyph font-weight reactive to cursor proximity. GlitchText is timing-driven, no cursor input.
- **`NeonSign`** — glowing neon-tube text + flicker. GlitchText is digital-distortion glitch, no glow.
- **`Typewriter`** — character-by-character typing reveal. GlitchText is steady-state distortion of present text.
- **`CRTScreen`** — frame wrapper with scanline + chromatic-aberration overlay. GlitchText is per-text, no frame; composes well with CRTScreen wrapping it.

## Pure helpers (module-script exports)

- `pickIntensity(name)` — returns `{ offsetMax, tearMs, jitterMs, opacity }`. Falls back to `moderate`.
- `jitterOffset(intensity, seed)` — returns `{ dx, dy }` integer px offsets in `[-offsetMax, offsetMax]`. Deterministic per seed.
- `tearBand(intensity, seed)` — returns `{ top, height, dx }` (top in `[0, 80]`%, height in `[5, 30]`%, dx in roughly `[-4*offsetMax, 4*offsetMax]` px). Deterministic per seed.
- `scheduleNextTear(intensity, now)` — returns ms-until-next-tear, in `[0.5*jitterMs, 1.5*jitterMs]`.
- `pickTrigger(name)` — returns `'auto' | 'hover' | 'viewport'`. Falls back to `'auto'`.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The visible text is rendered as a normal DOM text node inside `.glitch-base` and is read by screen readers normally.
- RGB clones are CSS `::before` / `::after` pseudo-elements rendered from `attr(data-text)` — invisible to assistive tech.
- Tear band is `aria-hidden`.
- The wrapper has `svelte-ignore a11y_no_static_element_interactions` because the hover handlers only fire when `trigger === 'hover'` and `focusin` / `focusout` provide keyboard parity. The SR-readable text content path is unaffected.
- `prefers-reduced-motion: reduce` disables both the JS animation loop and the CSS clone/tear rendering.

## Performance

- One `requestAnimationFrame` loop per active component when running. Frame work is integer math and CSS variable updates — no layout thrash.
- Tear timer is a single `setTimeout` chain with no per-frame DOM churn (the band is one absolutely-positioned span, mounted only while visible).
- `viewport` trigger disconnects its `IntersectionObserver` on first intersection; `hover` and `auto` triggers don't allocate one at all.
- All timers / rAF / observers are torn down in `onDestroy`.

## Recipes

- **Cyberpunk hero**: `<CRTScreen profile="amber"><GlitchText text="SYSTEM ONLINE" intensity="wild" /></CRTScreen>`
- **Tasteful brand glitch**: large display type, `intensity="subtle"`, `trigger="viewport"`. Glitches once on scroll-in, settles to clean.
- **Hover-only headline**: nav link or button label with `trigger="hover"`. Rests clean, glitches on focus/hover for keyboard + mouse parity.
