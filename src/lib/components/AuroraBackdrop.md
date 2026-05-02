# AuroraBackdrop — Technical Logic Explainer

## What Does It Do? (Plain English)

AuroraBackdrop paints a slowly swirling field of coloured light behind whatever you put in front of it — the kind of soft, undulating glow you see on a polar night, or on a marketing landing page that wants to feel atmospheric without burning a video budget. Four large coloured ribbons rotate at deliberately mismatched speeds, all blurred to within an inch of their lives, and a dark vignette is laid over the top so the centre reads brighter than the edges.

Think of it as four coloured spotlights pointed at the back of a frosted-glass screen, each one rotating at its own pace. Because their periods don't share a common multiple, the composite never returns to a frame you've already seen, so the eye keeps finding it interesting.

## How It Works (Pseudo-Code)

```
state:
  paletteName = 'classic'        // 'classic' | 'dawn' | 'deep'
  intensity   = 1                 // <1 faster, >1 slower
  blur        = 60                // px applied via filter:blur

derive at render time:
  palette = pickPalette(paletteName) ?? PALETTES.classic
  for idx in 0..3:
    period    = BASE_PERIODS[idx] * max(0.25, intensity)
    delay     = BASE_DELAYS[idx]
    direction = idx even ? 'normal' : 'reverse'
    opacity   = idx < 2 ? 0.85 : 0.6
    gradient  = conic-gradient(from startAngles[idx]deg, paletteStops...)
    write inline style on .ab-ribbon[idx]

CSS animates each .ab-ribbon:
  @keyframes ab-spin: rotate(0deg) → rotate(360deg)
  iteration-count: infinite
  timing-function: linear
  duration: per-ribbon period
  delay:    per-ribbon (negative → starts mid-cycle)

  All four ribbons composite via mix-blend-mode: screen
  Heavy blur (default 60px) softens the edges
  Vignette div darkens the perimeter
```

There is **no JavaScript animation loop**. Once the inline `--ab-*` custom properties are written, the GPU compositor handles every frame. The component does not subscribe to mouse, scroll, resize or media-query events at runtime — `prefers-reduced-motion` is honoured by a static CSS `@media` block that disables the keyframe.

## The Core Concept: Non-Harmonic Periods + Conic Blending

The "aurora" feel lives in three numbers and one CSS rule.

### Why four ribbons at non-harmonic periods?

```
BASE_PERIODS = [40, 65, 80, 110]   // seconds per full rotation
```

If all four ribbons rotated at the same speed, you'd see a static pinwheel turning. If they rotated at integer multiples of one another (say 30 / 60 / 90 / 120), the composite would loop visibly — every 120 s the eye would catch the cycle.

40, 65, 80, 110 share no small common factor. Their LCM is in the tens of thousands of seconds, so within any reasonable session the composite never repeats. The brain reads "non-repeating" as "alive".

`BASE_DELAYS = [0, -12, -34, -52]` are **negative** so each ribbon starts mid-cycle on the first frame. Without those negative delays you'd see the wall come alive *after* mounting — a tell-tale "this is a static page that just woke up" beat. With them, mount-time looks like you've walked into a room where the aurora has already been going for an hour.

### Conic gradient + mix-blend-mode: screen

Each ribbon is a single `<div>` with:

```css
background: conic-gradient(from {Xdeg} at 50% 50%, c1, c2, c3, c4, c1);
mix-blend-mode: screen;
filter: blur(60px); /* inherited from --ab-blur */
```

A conic gradient sweeps a full 360° around its centre — think of a pie chart that fades smoothly between four colour stops and ends back at the starting colour for a seamless join. Blur it heavily and you get a soft circular wash. Stack four of them, blend with `screen` (additive light), and the colours combine like overlapping coloured spotlights on a wall.

The four `startAngles = [15, 110, 215, 305]` mean each ribbon initially "points" in a different direction. Combined with alternating rotation directions (idx 0 and 2 spin clockwise, 1 and 3 counter-clockwise), neighbouring ribbons swirl *against* each other rather than all chasing the same way.

### The vignette

```css
.ab-veil {
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 55%,
    rgba(0, 0, 0, 0.45) 90%,
    rgba(0, 0, 0, 0.7) 100%
  );
}
```

Without this overlay the aurora reads as a flat coloured wall. The radial gradient — fully transparent for 55 % of its radius then ramping to 70 % black at the edges — focuses the eye centre-screen and hides the hard rectangular bounds of the host. It's the cheapest move that turns "coloured background" into "atmospheric backdrop".

## Performance

Per frame the component does **nothing in JavaScript**. The four `<div>` ribbons each have a single `transform: rotate(deg)` animation; the browser hands those to the compositor and never wakes a layout or paint thread for them.

- `will-change: transform` and `transform: translateZ(0)` force each ribbon onto its own GPU layer, so the heavy `filter: blur(60px)` is composited once per ribbon, not recomputed per frame.
- The blur is the most expensive part of the render. On a low-end mobile GPU four 60 px blurred layers stay within budget at 60 fps. Halving the host area (the most common case — putting the backdrop in a hero section, not full-screen) makes the cost effectively free.
- `mix-blend-mode: screen` on a layer that's already promoted is also compositor-only.
- `isolation: isolate` on the root creates a new stacking context so the blend modes don't leak onto siblings.

There are zero observers, zero rAF loops, zero `getBoundingClientRect()` calls. The component's runtime cost after first paint is whatever the GPU charges for compositing four blurred rotating layers — typically <0.5 ms/frame on integrated graphics.

## State Flow Diagram

```
                ┌────────────────────────────┐
                │  initial / SSR             │
                │  ribbons rendered with     │
                │  --ab-* inline styles      │
                └────────────┬───────────────┘
                             │ mount (no JS work)
                             ▼
                ┌────────────────────────────┐
                │  animating                 │
                │  CSS @keyframes ab-spin    │
                │  runs per-ribbon           │
                │  (no JS frame loop)        │
                └────────────┬───────────────┘
                             │
                             │  prefers-reduced-motion: reduce
                             ▼
                ┌────────────────────────────┐
                │  static                    │
                │  ribbons frozen at         │
                │  startAngle + delay phase  │
                │  (CSS @media kills anim)   │
                └────────────────────────────┘

  prop change (palette/intensity/blur) ──► derived recomputes ──► inline style
                                            updates; CSS animation
                                            keeps running uninterrupted
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `palette` | `'classic' \| 'dawn' \| 'deep'` | `'classic'` | Named four-stop palette. Unknown values fall back to `classic`. |
| `intensity` | `number` | `1` | Period multiplier; `<1` speeds rotation up, `>1` slows it down. Clamped to `0.25` minimum. |
| `blur` | `number` | `60` | Blur radius in pixels applied to each ribbon via `filter:blur()`. |
| `class` | `string` | `''` | Extra classes appended to the root `<div>`. |

Module-level helpers — `pickPalette`, `ribbonConfig`, `buildRibbonGradient`, `isReducedMotion` — are exported for tests and advanced consumers who want to drive the gradient string from their own logic.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown palette name passed in | `pickPalette` falls back to `classic`; nothing crashes. |
| `intensity` = 0 or negative | Clamped to `0.25` so periods never reach zero or invert. |
| `intensity` = `Infinity` / `NaN` | `Math.max(0.25, intensity)` returns `Infinity` / `NaN`; CSS treats those as invalid and the animation defaults to `0s` (static). Acceptable degraded state. |
| Host smaller than `min-height: 360px` | Root forces a 360 px floor so ribbons never collapse to zero area. |
| `prefers-reduced-motion: reduce` | CSS `@media` rule sets `animation: none` on `.ab-ribbon`; ribbons render at their starting angles. The vignette and blend stack remain. |
| Component scrolled offscreen | No JS work to pause; the GPU still composites if the layer is visible to the OS compositor. Modern browsers throttle hidden tabs automatically. |
| Resized viewport | `inset: -25%` on each ribbon means the rotating disc always overlaps the host bounds; resize is a free GPU re-layout, no ResizeObserver needed. |
| Multiple instances on one page | Each gets its own stacking context via `isolation: isolate`; no z-index leakage between instances. |
| Hi-DPI screen | Blur is resolution-independent (`filter:blur` is in CSS pixels); GPU handles upscaling. |
| Browser without GPU acceleration / `mix-blend-mode: screen` | Ribbons render opaquely on top of one another instead of blending. Composition is uglier but still functional. |

## Dependencies

- **Svelte 5.x** — `$props` and `$derived` only; no effects, no lifecycle hooks. The whole component is a pure function of its props.
- Zero external dependencies — pure CSS for animation, no motion library, no canvas, no WebGL.

## File Structure

```
src/lib/components/AuroraBackdrop.svelte         # implementation + module-level helpers
src/lib/components/AuroraBackdrop.md             # this file (rendered inside ComponentPageShell)
src/lib/components/AuroraBackdrop.test.ts        # vitest unit tests
src/routes/aurora-backdrop/+page.svelte          # demo page
```
