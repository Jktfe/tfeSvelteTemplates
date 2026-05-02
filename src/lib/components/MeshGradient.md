# MeshGradient — Technical Logic Explainer

## What Does It Do? (Plain English)

MeshGradient is the soft, smoky animated wash you've seen on Stripe, Linear and Vercel marketing pages. A handful of large, brightly coloured blobs drift slowly across the host — each one is a single CSS `radial-gradient` circle — and the whole layer is blurred so heavily that the blobs bleed into one another instead of reading as individual shapes. The result is a continuously-shifting cloud of colour that the eye reads as ambient atmosphere rather than as moving objects.

Think of dropping a few coloured ink droplets into a shallow tray of milky water and lightly tilting the tray. The droplets drift, blur into each other, and never quite settle — that's the visual the component is going for.

## How It Works (Pseudo-Code)

```
state:
  palette    = 'sunset'          // one of 6 named palettes
  blobCount  = 5                  // 1..12 blobs
  blur       = 80                 // host-level blur in px
  opacity    = 0.7                // 0..1
  speed      = 1                  // 0 freezes, 2 = double speed

derive at render time:
  activePalette = pickPalette(palette)
  blobs[]       = buildBlobLayout(blobCount, palette):
    for i in 0..count-1:
      pos      = blobPosition(i, count)        // golden-angle spiral
      anim     = blobAnimation(i, count)       // negative delay + per-i duration
      size     = blobSize(count)               // 1 blob = 90%, 12 = 52%
      color    = blobColor(i, palette)         // cycles through palette[5]
      push BlobLayout
  safeBlur, safeOpacity, speedFactor = clamps

render:
  host div with --mesh-blur, --mesh-opacity, --mesh-speed
  for each blob:
    div with --blob-x, --blob-y, --blob-size, --blob-color,
             --blob-delay, --blob-duration

CSS animates each .mesh-gradient__blob:
  @keyframes mesh-drift: 0/25/50/75/100% translate(±8%, ±10%)
  duration: var(--blob-duration) * var(--mesh-speed)
  delay:    var(--blob-delay)            // negative → starts mid-cycle
  ease-in-out, infinite

  Heavy filter:blur on the HOST (not on each blob) means
  all blobs composite through one shared blur layer →
  they bleed into one another → soft mesh feel.
```

No `requestAnimationFrame`. No `IntersectionObserver`. No `ResizeObserver`. The component is a pure function from props to inline-styled DOM; the GPU does every frame.

## The Core Concept: Golden-Angle Spiral Placement

Naïve blob placement (random, or grid) produces lumpy washes — clusters of colour next to bare patches. The component instead places blobs along a **golden-angle (Fibonacci) spiral**, the same algorithm sunflower seeds and pinecones use to pack themselves uniformly without forming a regular grid pattern.

```
goldenAngle = 137.5077640500378°    // most-irrational angle
for i in 0..count-1:
  angleRad      = i * goldenAngle * π / 180
  ratio         = sqrt((i + 0.5) / count)   // 0..1, even area coverage
  radiusPercent = 38                         // never closer than 12% to edge
  xPercent      = 50 + cos(angleRad) * ratio * radiusPercent
  yPercent      = 50 + sin(angleRad) * ratio * radiusPercent
```

Two ideas combine here:

1. **`goldenAngle`** — the most irrational rotation. Rotating by exactly 137.5°… each step means consecutive points never align radially, so you never get a "spoke" pattern.
2. **`sqrt((i + 0.5) / count)`** — a square-root radius. Plain `i / count` would crowd the centre and leave the edges empty (because area scales with r²). The square root cancels the area term so each blob lands in roughly equal area.

A single blob (`count = 1`) sits at the centre. Five blobs spread out along the spiral. Twelve blobs fill the host evenly. No grid, no clusters, no symmetry that the eye could lock onto.

```
1 blob:        5 blobs:           12 blobs:
                 ●                    ●  ●
   ●           ●   ●               ● ● ● ●
                 ●  ●                ● ●
                                   ●  ●  ●
                                     ●  ●
```

## CSS Animation Strategy

Two design choices keep the layer cheap and the visual right:

### Blur lives on the host, not on each blob

```css
.mesh-gradient {
  filter: blur(var(--mesh-blur, 80px));
  isolation: isolate;
}
.mesh-gradient__blob {
  background: radial-gradient(circle, var(--blob-color), transparent 75%);
  /* no filter:blur here */
}
```

If each blob carried its own `filter:blur`, you'd see five fuzzy circles. By blurring the *parent*, the unblurred blobs paint into the same compositor layer first, then the whole thing blurs — so the colour at any point is a weighted sum of nearby blob centres. That's the difference between "mesh gradient" and "five fuzzy dots".

### Per-blob desync via duration + negative delay

```ts
durationMs = baseDurationMs + i * 1500       // each blob runs slightly slower
delayMs    = -(i * baseDurationMs) / count   // negative → starts mid-cycle
```

The 1500 ms per-index stagger means after one cycle each blob has accumulated a different drift, and the negative delay means blob `i` starts at phase `-i/count` of its loop — so on the first paint they're already at five different points around the cycle. There's no visible "everyone restarts at zero" beat the way there would be with shared timing.

The keyframe itself is intentionally cheap:

```css
@keyframes mesh-drift {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
  25%      { transform: translate(-50%, -50%) translate(8%, -6%); }
  50%      { transform: translate(-50%, -50%) translate(-4%, 10%); }
  75%      { transform: translate(-50%, -50%) translate(-7%, -4%); }
}
```

Five waypoints, all on `transform` (compositor-only, no layout). The `-50%, -50%` is the centring anchor; the second `translate` is the drift.

## Performance

- **DOM cost** — one `<div>` per blob. Default 5 blobs = 5 nodes. Maximum 12.
- **Frame cost** — zero JS work per frame. Each blob has one composited transform animation; the host has one blur filter. The GPU handles all of it.
- **`will-change: transform`** on each blob promotes them onto their own layer so the host blur can composite them efficiently.
- **`isolation: isolate`** on the host creates a stacking context so the blur and any future `mix-blend-mode` don't leak onto siblings.
- **Speed multiplier via `--mesh-speed`** — `animation-duration: calc(var(--blob-duration) * var(--mesh-speed))`. Setting `speed=0` results in `--mesh-speed: '0'`, which CSS treats as `0s` duration and effectively freezes the animation.
- **No observers or rAF** — resize is handled implicitly by percentage-based positioning; offscreen pages are throttled by the browser's compositor.
- **SSR-safe** — `buildBlobLayout` is deterministic, so server output matches the first client paint exactly. No flash of unstyled blobs.

## State Flow Diagram

```
                  ┌────────────────────────────┐
                  │  initial / SSR             │
                  │  buildBlobLayout returns   │
                  │  deterministic positions   │
                  │  inline styles written     │
                  └────────────┬───────────────┘
                               │ mount (no JS work)
                               ▼
                  ┌────────────────────────────┐
                  │  drifting                  │
                  │  CSS @keyframes mesh-drift │
                  │  per blob, desync'd        │
                  └────────────┬───────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            │ speed prop = 0   │ palette/blobCount│ prefers-reduced-motion
            │                  │ change            │  reduce
            ▼                  ▼                  ▼
       ┌──────────┐     ┌──────────────┐    ┌──────────────┐
       │ frozen   │     │ re-derive    │    │ static       │
       │ duration │     │ buildBlob…   │    │ animation    │
       │ → 0s     │     │ inline styles│    │ : none       │
       └──────────┘     │ updated; CSS │    │ transform    │
                        │ keeps running│    │ frozen       │
                        └──────────────┘    └──────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `palette` | `'sunset' \| 'aurora' \| 'ember' \| 'cosmic' \| 'mint' \| 'monochrome'` | `'sunset'` | Named 5-colour palette. Unknown names fall back to `sunset`. |
| `blobCount` | `number` | `5` | Number of blobs to render. Floored and clamped to `[1, 12]`. |
| `blur` | `number` | `80` | Host-level blur radius in px. Clamped to `[0, ∞)`; `NaN` falls back to `80`. |
| `opacity` | `number` | `0.7` | Container opacity. Clamped to `[0, 1]`; `NaN` becomes `0`. |
| `speed` | `number` | `1` | Animation-duration multiplier (inverted: `1/speed`). `0` freezes; `2` runs double-time. |
| `class` | `string` | `''` | Extra classes on the host. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `blobCount` = 0 / negative / `NaN` | Clamped to 1 — a single blob renders dead centre. |
| `blobCount` = 13+ | Clamped to 12. Beyond 12 the wash becomes mush; the cap is a quality decision. |
| Unknown palette name | `pickPalette` falls back to `sunset`. |
| `opacity` = `Infinity` / `NaN` | Coerced to `0` — host becomes invisible rather than throwing. |
| `speed` = 0 | `--mesh-speed: '0'` → CSS `animation-duration: calc(N * 0) = 0s` → blobs freeze at their delay-offset positions. |
| `prefers-reduced-motion: reduce` | `@media` rule sets `animation: none !important` and resets transforms; static mesh remains. |
| Host scrolled offscreen | Browser's compositor throttles or skips the layer. No JS work to pause. |
| Resized viewport | Blob positions are percentage-based; no recomputation needed. No `ResizeObserver`. |
| Hi-DPI / retina | Blur is in CSS pixels and resolution-independent; GPU upscales. |
| Multiple instances stacked | `isolation: isolate` on each gives them independent stacking contexts; blurs do not leak. |
| Browser without GPU acceleration | The `filter: blur(80px)` on the host falls back to CPU and may stutter; lower `blur` to ~30 for older devices. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`. Module-script helpers (`buildBlobLayout`, `clamp01`, `clampInt`, etc.) are pure functions exported for the test suite.
- Zero external dependencies — pure CSS keyframes, no animation library, no canvas.

## File Structure

```
src/lib/components/MeshGradient.svelte         # implementation + module-level helpers
src/lib/components/MeshGradient.md             # this file (rendered inside ComponentPageShell)
src/lib/components/MeshGradient.test.ts        # vitest unit tests
src/lib/components/MeshGradientTestHarness.test.svelte  # render-test harness
src/routes/meshgradient/+page.svelte           # demo page
```
