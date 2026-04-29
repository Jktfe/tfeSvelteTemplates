---
name: PixelTrail
category: Helpful UX
author: antclaude
status: shipped
---

# PixelTrail

Cursor-tracked decaying pixel-trail wrapper. Wrap any region (hero, card, page section) and small square "pixels" follow the cursor as it moves, fading + scaling + drifting on a CSS keyframe before self-cleaning. Pure CSS animation with a self-clean `setTimeout` per pixel — no `requestAnimationFrame` loop, no resize observer, zero per-frame JS.

Distance-throttled spawn (one pixel per ~`throttlePx` units of cursor travel) means trail density stays consistent at any mouse speed: slow drags don't pile pixels at one point, fast flicks don't leave gaps.

Composes naturally with hero text, dark canvases, and other ambient primitives — pair with `MeshGradient` (drifting blob backdrop + cursor pixel trail) or `ElectricBorder` (border arcs + interior trail) for layered ambient interactivity.

## Key features

- **Three sizes** — `small` (4px) / `medium` (8px) / `large` (16px). Each preset bundles the pixel size and the per-spawn distance threshold so density and grain scale together.
- **Three palettes** — `mono-white` (clean editorial), `cyber-cyan` (cool sci-fi neon), `sunset-warm` (warm yellow→orange→pink gradient cycle). Each palette has a coordinated `box-shadow` colour for the per-pixel halo.
- **Distance-throttled spawn** — `distanceSquared` against the last spawn point, comparing against `throttlePx²` to skip spawn when the cursor hasn't travelled far enough. No sqrt cost.
- **Trail-length cap** — oldest pixels are evicted (FIFO `shift`) when `pixels.length` exceeds the cap. Prevents memory growth on long uninterrupted drags.
- **Self-cleaning pixels** — each pixel registers a `setTimeout` for `duration + 60ms` to remove itself from state once the CSS keyframe finishes. No global cleanup loop.
- **Pure helpers exported** from the module-script (`pickSize`, `pickPalette`, `clamp01`, `clampPositive`, `distanceSquared`, `nextTrailId`, `isReducedMotion`) — directly unit-testable without rendering.
- **Per-instance unique pixel IDs** — module-scoped counter via `nextTrailId()` keeps Svelte `{#each}` keys stable across mounts/unmounts without crypto or `Math.random()`.
- **prefers-reduced-motion safe** — `isReducedMotion()` is read on mount; under reduced motion, the mousemove handler short-circuits before allocating any state, and the stylesheet has a CSS-layer fallback hiding any pixel that somehow lands in the DOM.
- **SR-friendly** — slotted content stays in the DOM and a11y tree. The trail layer is `aria-hidden`, `pointer-events: none`, stacked on top of the content via `z-index: 1`. Focus, click and keyboard interaction with the wrapped child are unaffected.

## Usage

```svelte
<script>
	import PixelTrail from '$lib/components/PixelTrail.svelte';
</script>

<PixelTrail>
	<section class="hero">…</section>
</PixelTrail>

<PixelTrail size="large" palette="cyber-cyan" trailLength={32}>
	<article>…</article>
</PixelTrail>

<PixelTrail size="small" palette="sunset-warm" duration={1000}>
	<div class="dark-canvas">…</div>
</PixelTrail>
```

## Props

| Prop          | Type                                            | Default        | Notes                                                              |
| ------------- | ----------------------------------------------- | -------------- | ------------------------------------------------------------------ |
| `size`        | `'small' \| 'medium' \| 'large'`                | `'medium'`     | Pixel size + spawn-distance threshold.                             |
| `palette`     | `'mono-white' \| 'cyber-cyan' \| 'sunset-warm'` | `'mono-white'` | Cycled colour set + shadow halo.                                   |
| `trailLength` | `number`                                        | `16`           | FIFO cap on live pixels. Clamped to `[0, 64]`.                     |
| `duration`    | `number`                                        | `700`          | Pixel lifetime in ms. Clamped to `[0, 2000]`.                      |
| `class`       | `string`                                        | `''`           | Extra classes on the wrapper.                                      |
| `children`    | `Snippet`                                       | _(required)_   | Content to wrap. Stays interactive.                                |

Unknown size / palette values fall back to `medium` / `mono-white`.

## Size table

| Size     | px  | throttlePx |
| -------- | --- | ---------- |
| `small`  | 4   | 6          |
| `medium` | 8   | 10         |
| `large`  | 16  | 18         |

`throttlePx` is the minimum cursor travel between two spawns. Slightly larger than `px` so adjacent pixels overlap a touch — gives the trail a continuous appearance instead of a dotted line.

## Palette table

| Palette        | Colours                                | Shadow                       | Vibe                                |
| -------------- | -------------------------------------- | ---------------------------- | ----------------------------------- |
| `mono-white`   | `#ffffff`, `#f0f0f5`, `#dcdce6`        | `rgba(255, 255, 255, 0.6)`   | Clean editorial, dark-canvas pairs.  |
| `cyber-cyan`   | `#00f0ff`, `#00bfff`, `#0080ff`        | `rgba(0, 191, 255, 0.7)`     | Sci-fi terminal, Tron neon.          |
| `sunset-warm`  | `#ffea00`, `#ff8c00`, `#ff3d6e`        | `rgba(255, 140, 0, 0.7)`     | Warm gradient cycle, marketing.      |

Colours cycle through the array via `colorIndex % colors.length` so a single drag traverses the gradient.

## Distinct from

- **`ClickSpark`** — radial particle burst on `click`. PixelTrail follows the cursor continuously on `mousemove`. Different trigger, different motion shape.
- **`MagnetGrid`** — force-field grid where dots shift toward/away from the cursor. PixelTrail spawns transient pixels that fade out — no persistent grid.
- **`MagneticButton`** — single element translates toward cursor. PixelTrail spawns a stream of independent ephemeral elements.
- **`MagicCard`** — cursor-following spotlight on a single card surface. PixelTrail emits discrete pixels rather than a smooth gradient.
- **`MeshGradient`** — ambient blob backdrop with no input. PixelTrail is purely input-driven.
- **`ElectricBorder`** — ambient SVG-filter perimeter crackle. PixelTrail is interior-area cursor-trail.

## Pure helpers (module-script exports)

- `pickSize(name)` — returns `{ px, throttlePx }`. Falls back to `medium`.
- `pickPalette(name)` — returns `{ colors, shadow }`. Falls back to `mono-white`.
- `clamp01(n)` — clamps to `[0, 1]`; treats `NaN`/`±Infinity` as `0`.
- `clampPositive(n, max?)` — clamps to `[0, max]` with the same guard.
- `distanceSquared(x1, y1, x2, y2)` — squared Euclidean distance; squared form skips the sqrt for threshold comparisons.
- `nextTrailId(prefix?)` — module-scoped counter for unique per-pixel IDs across instances.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The slotted content is rendered as the primary content of the wrapper and is read by screen readers normally.
- The trail layer is `aria-hidden`, `pointer-events: none`, stacked via `z-index: 1`. Invisible to assistive tech.
- Under `prefers-reduced-motion: reduce`: the mousemove handler short-circuits before any allocation, no pixels are spawned, and the stylesheet has a CSS-layer fallback that hides any pixel that would somehow reach the DOM.
- The wrapper is role-neutral (no `role` attribute set) — it inherits whatever role the slotted content has.

## Performance

- Zero per-frame JS. The mousemove handler does a single comparison against the squared distance threshold and either spawns one DOM node or returns immediately.
- Each pixel is one `<span>` with a CSS keyframe animation. No JS animation loop.
- FIFO eviction keeps live pixel count bounded at `trailLength` (default 16), so the trail layer is always small.
- `box-shadow` is the only mildly-expensive CSS — measured fine on commodity hardware at default sizes. Drop palette to `mono-white` and size to `small` if running on weaker GPUs.
- No canvas, no WebGL, no rAF, no resize observer. Steady-state cost is whatever the browser pays to composite ~16 small spans.

## Recipes

- **Hero ambient trail**: `<PixelTrail size="medium" palette="mono-white"><section class="hero">…</section></PixelTrail>`.
- **Cyber CTA panel**: `<PixelTrail size="small" palette="cyber-cyan" trailLength={32}><article class="terminal-panel">…</article></PixelTrail>`.
- **Marketing landing**: `<PixelTrail size="large" palette="sunset-warm" duration={1000}><div class="hero-warm">…</div></PixelTrail>`.
- **Composed with MeshGradient**: `<MeshGradient palette="dawn"><PixelTrail palette="mono-white"><div class="hero">…</div></PixelTrail></MeshGradient>`.
- **Composed with ElectricBorder**: `<ElectricBorder intensity="mild" palette="electric-blue"><PixelTrail size="small" palette="cyber-cyan"><div class="card">…</div></PixelTrail></ElectricBorder>`.
