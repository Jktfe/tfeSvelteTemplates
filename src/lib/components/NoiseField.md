# NoiseField — Technical Logic Explainer

## What Does It Do? (Plain English)

NoiseField wraps any region and lays a film-grain / TV-static / paper-texture overlay on top of it. The grain can be fine and tight (35 mm film), medium and editorial, or chunky and analog (VHS). It can shimmer at a 24-fps stutter, like discrete film frames sliding past, or stay completely still like a printed texture. It can render as monochrome white, saturated chromatic noise, or a chromatic-plus-scanlines retro CRT look.

Think of it as a sheet of grainy tracing paper laid over your design, with the option of a tiny stage hand jiggling it back and forth.

## How It Works (Pseudo-Code)

```
state:
  intensity     = 'medium'   // 'fine' | 'medium' | 'coarse'
  mode          = 'mono'     // 'mono' | 'chroma' | 'retro'
  animated      = true
  opacity       = 0.4
  filterId      = 'nf-static'  // SSR placeholder
  reducedMotion = false

derive:
  intensityConfig = pickIntensity(intensity)  // { baseFrequency, numOctaves }
  safeMode        = pickMode(mode)
  safeOpacity     = clamp01(opacity)
  isAnimated      = animated && !reducedMotion

onMount:
  filterId      = nextFilterId('nf')           // 'nf-1', 'nf-2', ... unique
  reducedMotion = isReducedMotion()

render:
  div.noisefield-wrapper
    div.noisefield-content { @render children() }
    div.noisefield-overlay (aria-hidden, mix-blend-mode: overlay)
      svg 120% × 120% at -10%/-10%
        <filter id={filterId}>
          <feTurbulence type="fractalNoise"
                        baseFrequency={cfg.baseFrequency}
                        numOctaves={cfg.numOctaves}
                        seed=3 />
          <feColorMatrix values=...                   // mono | chroma | retro
        </filter>
        <rect width=100% height=100% filter="url(#nf-N)" />
      [if mode==='retro']
        ::after { background: repeating-linear-gradient(...) }  // scanlines

CSS shimmer (when animated):
  @keyframes noisefield-shimmer steps(8):
    5 waypoints, transform: translate(±2%, ±1%) and back to 0
  animation: noisefield-shimmer 2.4s steps(8) infinite
  // steps(8) = 8 discrete frames per cycle, no smoothing
  // → looks like 24fps film, not silky 60fps slide
```

The component runs **zero JS frame loops**. The only JavaScript work is mount-time: probe reduced-motion and assign a unique filter ID. After that, the SVG renderer and the CSS compositor handle everything.

## The Core Concept: feTurbulence + Stepped Animation

Two ideas combine to produce the visual.

### feTurbulence — procedural noise on the GPU

```svg
<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="3" />
```

`feTurbulence` generates a Perlin-noise field — a smooth, organic, randomly-shaped image where nearby pixels have similar values, but the field as a whole has no repeating pattern. Two parameters tune it:

- **`baseFrequency`** — how *coarse* the noise is. Low values produce big blobs of darkness and lightness; high values produce fine-grained crinkle. The component flips this counter-intuitively: `fine` mode uses **higher** frequency (`1.6`) for tight grain; `coarse` mode uses **lower** frequency (`0.4`) for big chunky grain.
- **`numOctaves`** — how many layers of noise are summed together at half-scale each. More octaves means richer detail (multiple sizes of grain visible at once) but slightly more expensive to compute. The component scales octaves with intensity: 2 → 3 → 4 from fine to coarse.

`seed=3` makes the noise field **deterministic**. Server and client render the same first frame; multiple instances on the same page render the same noise (which is what you want — different seeds would produce different "grain" on each, breaking visual consistency).

### feColorMatrix — colour mode switching

`feTurbulence` produces a grayscale field. `feColorMatrix` re-colours it without changing its shape:

```svg
<!-- mono: all channels = 1, alpha preserved -->
<feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 1 0" />

<!-- chroma: slight R/B amplification, neutral G -->
<feColorMatrix type="matrix" values="1.2 0 0 0 0   0 1.0 0 0 0   0 0 1.4 0 0   0 0 0 1 0" />

<!-- retro: cyan-shifted with channel mix and small additive offset -->
<feColorMatrix type="matrix" values="0.7 0 0 0 0.1   0 0.9 0 0 0.15   0 0 1.0 0 0.2   0 0 0 1 0" />
```

The matrix is a 4 × 5 transform on `[R, G, B, A]` (with the 5th column being a constant offset added in). Mono crushes RGB to white, alpha kept. Chroma scales channels independently for a saturated look. Retro adds a small constant offset (the `0.1 / 0.15 / 0.2` last column) to push the noise toward cyan.

### Stepped animation = film-frame stutter

```css
.noisefield-overlay.animated svg {
  animation: noisefield-shimmer 2.4s steps(8) infinite;
}
```

`steps(8)` is the unusual choice. Most CSS animations use `ease`, `linear`, or a `cubic-bezier` for smooth interpolation. `steps(8)` does the opposite — it divides the 2.4 s cycle into 8 discrete frames and snaps between them with no easing. The result reads as a film projector advancing through individual frames, not as a silky slide.

The keyframe itself is just five offset waypoints:

```css
@keyframes noisefield-shimmer {
  0%, 100% { transform: translate(0, 0); }
  20%      { transform: translate(-2%, 1%); }
  40%      { transform: translate(1%, -2%); }
  60%      { transform: translate(-1%, -1%); }
  80%      { transform: translate(2%, 0); }
}
```

The 120 % oversize on the SVG (positioned at `-10%, -10%`) means even a 2 % translate never reveals an empty edge. The translate is on the SVG host, not the noise itself — the filter chain doesn't recompute, only the composited output slides. This is what keeps the animation cheap.

### The retro scanline overlay

Mode `retro` adds a sibling pseudo-element with a hard-edged stripe pattern:

```css
.noisefield-overlay.retro::after {
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.22) 0px,
    rgba(0, 0, 0, 0.22) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: multiply;
}
```

A 1 px-on / 2 px-off stripe pattern. `mix-blend-mode: multiply` darkens whatever's beneath, which combines with the chromatic noise to produce the classic CRT-bleed-through look without a separate render pass.

## Performance

- **One `<svg>` per instance**, containing one `<filter>` and one `<rect>`. No SVG DOM is added or removed during animation.
- **Filter computation runs on the GPU** (in modern browsers' SVG renderer). `feTurbulence` is the only meaningfully expensive primitive; with 2–4 octaves on a single full-bleed surface it's a few ms per filter recomputation, well within budget.
- **Filter recomputes only when its inputs change** — `baseFrequency` and `numOctaves` are static once computed from `intensity`. The shimmer animation translates the SVG host, not the filter inputs, so the filter is computed once and its output is shifted.
- **`mix-blend-mode: overlay` on the overlay** is compositor-only — the GPU multiplies the noise into the underlying content without re-painting the source.
- **No observers, no rAF, no resize handlers.** The 120 % SVG sizing makes layout-invariant.
- **`steps(8)` animation** has 8 discrete states per cycle; the GPU only composites a new frame at each step (every 300 ms), so the animation is cheaper than a smooth 60 fps transform would be.

## State Flow Diagram

```
              ┌──────────────────────────────┐
              │  SSR / first paint           │
              │  filterId = 'nf-static'      │
              │  reducedMotion = false       │
              │  noise renders with mono     │
              │  colour matrix               │
              └────────────┬─────────────────┘
                           │ onMount
                           ▼
              ┌──────────────────────────────┐
              │  filterId = nextFilterId()   │
              │  reducedMotion = probed      │
              └────────────┬─────────────────┘
                           │
              ┌────────────┴────────────────┐
              │                              │
              │ animated && !reducedMotion   │ animated=false OR reducedMotion
              ▼                              ▼
       ┌──────────────┐               ┌──────────────┐
       │  shimmering  │               │  static      │
       │  .animated   │               │  no .animated│
       │  on overlay; │               │  class;      │
       │  steps(8)    │               │  noise frozen│
       │  keyframe    │               │  at 0,0      │
       └──────────────┘               └──────────────┘

  prefers-reduced-motion: reduce  ──►  CSS @media kills shimmer keyframe
                                       (belt-and-braces alongside JS)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'fine' \| 'medium' \| 'coarse'` | `'medium'` | Bundles `feTurbulence` `baseFrequency` and `numOctaves`. Unknown names fall back to `medium`. |
| `mode` | `'mono' \| 'chroma' \| 'retro'` | `'mono'` | Colour-matrix preset; `retro` adds a scanline overlay. Unknown names fall back to `mono`. |
| `animated` | `boolean` | `true` | Auto-disabled if `prefers-reduced-motion: reduce`. |
| `opacity` | `number` | `0.4` | Overlay opacity. Clamped to `[0, 1]`; `NaN` / `±Infinity` collapse to `0`. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | optional | Content to wrap. Stays interactive. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown `intensity` or `mode` | Falls back to `medium` / `mono` via `pickIntensity` / `pickMode`. |
| `opacity` = `NaN` / `±Infinity` | `clamp01` returns `0` — overlay invisible rather than throwing. |
| `prefers-reduced-motion: reduce` set on mount | `isAnimated` derives `false`; CSS `@media` rule also kills the shimmer keyframe as a guard. Static grain remains. |
| Multiple instances on one page | Each gets a unique filter ID via `nextFilterId('nf')` — no SVG ID collisions. |
| Component scrolled offscreen | Browser throttles the compositor layer; CSS animation pauses naturally on hidden tabs. |
| Wrapper resized | SVG is sized at `120% × 120%` — naturally adapts to any wrapper size. No `ResizeObserver` needed. |
| Hi-DPI / retina | `feTurbulence` is resolution-independent; noise scales with the SVG's CSS pixels. The `chroma` and `retro` modes can show colour fringing at very high DPI on some browsers; `mono` is the most robust at extreme resolutions. |
| GPU acceleration unavailable | `feTurbulence` falls back to CPU; cost rises but stays usable. Drop `intensity` to `coarse` for cheaper octaves. |
| Browser without SVG filters (IE11) | `<filter>` is ignored; the `<rect>` renders as a black square. The `mix-blend-mode: overlay` makes that imperceptible. |
| `mode="retro"` on a Safari version without `mix-blend-mode: multiply` | Scanline overlay renders at full opacity instead of multiplying — uglier but still visible. Modern Safari (≥15) supports it. |
| `children` not provided | `{#if children}` guard skips the content slot; only the noise overlay renders. Useful for full-page background grain. |
| Component used inside a position-fixed container | Fine — the SVG host is `position: absolute; inset: 0` relative to the wrapper, not the viewport. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, snippets. Module-script exports (`pickIntensity`, `pickMode`, `clamp01`, `nextFilterId`, etc.) for unit testing.
- Zero external dependencies — inline SVG filter, CSS keyframes. No image assets, no canvas, no animation library.

## File Structure

```
src/lib/components/NoiseField.svelte         # implementation + module-level helpers
src/lib/components/NoiseField.md             # this file (rendered inside ComponentPageShell)
src/lib/components/NoiseField.test.ts        # vitest unit tests
src/lib/components/NoiseFieldTestHarness.test.svelte  # render-test harness
src/routes/noisefield/+page.svelte           # demo page
```
