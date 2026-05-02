# EqualizerBars — Technical Logic Explainer

## What Does It Do? (Plain English)

EqualizerBars is a row of vertical bars whose heights oscillate in a coordinated wave that looks like an audio spectrum analyser frozen in motion. It is a compact "this thing is alive / streaming / processing" indicator — useful next to live audio, voice transcripts, AI generation status lights, or anywhere a static "loading…" feels too quiet. Four visual variants give different rhythms (smooth sine, peak-biased FFT, binary high/low, sparse heartbeat double-spike), and an `active` prop freezes the bars at a deterministic seeded silhouette for "idle" states.

It is decorative only — no value semantics, no input, ignored by keyboard and pointer. The wrapper carries `role="img"` plus a configurable `aria-label` so screen readers can describe it as a single visual element rather than reading individual bars.

## How It Works (Pseudo-Code)

```
on render:
  read props: bars, variant, speed, color, active, height, seed, ariaLabel

derived:
  safeBars   = clampBars(bars)        // [1, 64]
  safeSpeed  = clampSpeed(speed)      // [0.25, 4]
  safeHeight = clampHeight(height)    // [16, 256] px
  safeVariant= pickVariant(variant)
  safeColor  = (color === 'auto') ? 'currentColor' : color
  heights    = seededHeights(safeBars, seed)   // deterministic [0.15, 1] per bar

  baseDurationS = 1.2 / safeSpeed
  staggerStepS  = baseDurationS * 0.09

state:
  runAnimation = true     // SSR default, flipped by onMount

on mount:
  runAnimation = active && !isReducedMotion()

effect:
  if !active: runAnimation = false

render:
  div.eq-wrapper role="img" aria-label
    data-equalizerbars-variant={safeVariant}
    data-equalizerbars-active={active && runAnimation}
    style="--eq-color, --eq-height, --eq-duration, --eq-stagger"
    for each height h, index i:
      span.eq-bar.eq-running={active && runAnimation}
        style="--eq-idx, --eq-static-h: {h * 100}%"

CSS variant blocks (one keyframe per variant):
  .eq-wrapper[data-equalizerbars-variant='equalizer'] .eq-running {
    animation: eq-osc-equalizer var(--eq-duration) ease-in-out infinite alternate;
    animation-delay: calc(var(--eq-idx) * var(--eq-stagger) * -1);
  }
  ... and similar for spectrum, pulse, heartbeat
```

## The Core Concept: Phased Identical Animations Look Like A Coordinated Wave

The "wave" you see across the bars is a visual side-effect of a simpler trick: every bar runs the *same* CSS keyframe, but each starts at a different phase by way of a negative `animation-delay`.

```
bar 0: animation-delay = 0ms     (starts at frame 0)
bar 1: animation-delay = -100ms  (acts as if it started 100ms ago — already 100ms into the keyframe)
bar 2: animation-delay = -200ms  (already 200ms in)
bar i: animation-delay = -i × stagger × 1000ms
```

CSS treats negative delays as "the animation has already been playing" — the browser jumps the bar straight to the keyframe value at that offset. Because every bar is on the same loop period but at a different phase, they read as a moving wave even though there is no shared timeline anywhere.

```
   bar 0 phase 0%     ▆
   bar 1 phase 8%     ▇
   bar 2 phase 17%    █
   bar 3 phase 25%    ▇
   bar 4 phase 33%    ▆
   bar 5 phase 42%    ▄
   bar 6 phase 50%    ▂
   ...
```

Each variant's keyframe expresses a different waveform:

- **`equalizer`** — `0% scaleY(0.18) → 50% scaleY(0.65) → 100% scaleY(1)` with `ease-in-out alternate` (so the bar bounces between low and high). Smooth sine-flavoured idle.
- **`spectrum`** — `0% / 35% / 65% / 100%` keyframe with peak at 35% and dip at 65%. Looks like a real FFT readout where mid frequencies dominate.
- **`pulse`** — `0% / 50% / 100%` with `steps(2, jump-none)` easing — binary high/low, no in-between values. Looks digital.
- **`heartbeat`** — `0% / 8% / 16% / 24% / 32% / 100%` curve with a quick double-spike then a long flat dwell. EKG-style.

The seeded RNG (`seededHeights`) is mulberry32-derived — small, fast, deterministic. Same seed always produces the same silhouette, important for SSR / hydration parity. The function is exported from `<script module>` so unit tests can verify exact values.

```
   active = true                  active = false
   ▃▆▇█▇▆▃▂▄▆▆▄▂              ▃ ▆ ▇ █ ▇ ▆ ▃ ▂ ▄ ▆ ▆ ▄ ▂
   ▆█▆▄▃▂▄▆█▇▆▄              (frozen at seeded heights;
   wave moves left-to-right     no animation)
```

## CSS Animation Strategy

One keyframe per variant, attached via attribute selector on the wrapper:

```css
.eq-wrapper[data-equalizerbars-variant='equalizer'] .eq-running {
  animation: eq-osc-equalizer var(--eq-duration, 1.2s) ease-in-out infinite alternate;
  animation-delay: calc(var(--eq-idx) * var(--eq-stagger, 0.1s) * -1);
}

@keyframes eq-osc-equalizer {
  0%   { transform: scaleY(0.18); }
  50%  { transform: scaleY(0.65); }
  100% { transform: scaleY(1);    }
}
```

Several deliberate choices:

- **`scaleY` from `transform-origin: 50% 100%`** rather than animating `height`. Scale is GPU-composited; height triggers layout. The bars all anchor to the bottom and grow upward.
- **`infinite alternate`** so the bar bounces between the two endpoint keyframes without a snap-back stutter.
- **Per-bar `--eq-idx` index**, multiplied into the stagger inline. This is what gives each bar its phase offset without the JS knowing about it.

Inactive bars switch off the `.eq-running` class. Their height comes from `--eq-static-h` (a percentage based on the seeded RNG) and no transform is applied — so they sit at deterministic heights without any animation.

```css
.eq-bar:not(.eq-running) {
  height: var(--eq-static-h, 50%);
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .eq-running {
    animation: none !important;
    transform: none;
    height: var(--eq-static-h, 50%);
  }
}
```

The `@media` rule is the catch-all — even if the JS gate didn't run (SSR-only, or an exception in matchMedia), the user's preference still wins.

## Performance

- **Steady state**: zero JS work. All animation is CSS keyframes running on the GPU compositor. The `<span>` count is `bars` (max 64).
- **Mount cost**: trivial. Compute `seededHeights` (one mulberry32 step per bar — ~64 multiplications at the cap) and read `matchMedia` once.
- **Per render**: derived values recompute when props change. The wrapper re-emits its CSS variables; CSS picks up the new duration / colour and the running animations adopt the new values without restart.
- **No canvas, no Web Audio** — this is a *pretend* equaliser, not a real one. Real audio reactivity would need an AudioContext + AnalyserNode wrapper component (out of scope here).

## State Flow Diagram

```
              ┌────────────────────────────┐
              │  initial render (SSR)      │
              │  runAnimation = true       │  ← optimistic; matches client default
              │  bars render with anim     │
              └──────────────┬─────────────┘
                             │ onMount
                             ▼
              ┌────────────────────────────┐
              │  capability check          │
              │  active && !reducedMotion? │
              └──────┬─────────────┬───────┘
                     │ yes         │ no
                     ▼             ▼
              ┌──────────────┐  ┌──────────────────┐
              │  ANIMATED    │  │  STATIC          │
              │  .eq-running │  │  no .eq-running  │
              │  CSS waves   │  │  seeded heights  │
              └──────┬───────┘  └──────┬───────────┘
                     │ active prop flips false       │
                     ▼                                ▼
                  STATIC                      ANIMATED (if active flips true)

  prefers-reduced-motion: reduce → STATIC, locked by @media rule
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bars` | `number` | `12` | Bar count. Floored, clamped to `[1, 64]`. |
| `variant` | `'equalizer' \| 'spectrum' \| 'pulse' \| 'heartbeat'` | `'equalizer'` | Animation rhythm. Unknown → `'equalizer'`. |
| `speed` | `number` | `1` | Multiplier; higher = faster cycle. Clamped to `[0.25, 4]`. |
| `color` | `string` | `'auto'` | `'auto'` uses `currentColor`. Otherwise any CSS colour. |
| `active` | `boolean` | `true` | When false, bars freeze at seeded heights — the "idle" silhouette. |
| `height` | `number` | `48` | Wrapper height in pixels. Clamped to `[16, 256]`. |
| `seed` | `number` | `1` | Seed for the inactive silhouette. Same seed = same shape. |
| `ariaLabel` | `string` | `'Audio visualisation'` | Screen-reader description. |
| `class` | `string` | `''` | Extra wrapper classes. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `bars = 0` or non-finite | `clampBars` returns the default 12. Never renders zero bars from a malformed prop. |
| `speed = 0` | Clamped to 0.25 — bars still animate, just slowly. |
| `active` flips at runtime | Effect drops `runAnimation` to false and the `.eq-running` class is removed; bars snap to seeded heights without restart. |
| `prefers-reduced-motion: reduce` | Bars render at seeded heights; no animation. Stylesheet-level `@media` is the safety net. |
| Same `seed` across instances | Same silhouette. Use `seed = Date.now()` or a per-component constant to vary. |
| Very large `bars` (e.g. 64) | 64 spans render fine. The `gap: 3px` between bars makes them increasingly thin in a fixed-width host. |
| Colour rapidly changes via prop | `--eq-color` updates inline; existing animations continue with the new colour. No flash, no restart. |
| `variant` rapidly changes via prop | The selector swaps; the new keyframe takes over from the bar's current phase. There is a slight jump because the keyframes have different shapes — acceptable for occasional toggling, jarring if animated continuously. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$effect`, `$props`, `onMount`.
- **`<script module>`** exports — `pickVariant`, `clampSpeed`, `clampBars`, `clampHeight`, `seededHeights`, `isValidVariant`, `isReducedMotion`. All pure, testable without a DOM. The mulberry32-style RNG keeps SSR / client renders identical.
- **Zero external libraries** — no audio library, no animation library. Pure CSS keyframes.

## File Structure

```
src/lib/components/EqualizerBars.svelte       # implementation
src/lib/components/EqualizerBars.md           # this explainer
src/lib/components/EqualizerBars.test.ts      # unit tests for exported helpers
src/routes/equalizerbars/+page.svelte         # demo page
```
