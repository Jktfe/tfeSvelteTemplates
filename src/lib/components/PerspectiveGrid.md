---
name: PerspectiveGrid
category: Helpful UX
author: antclaude
status: shipped
---

# PerspectiveGrid

Ambient 3D-perspective grid backdrop. Wrap any region (hero, terminal, marketing card, full page) and two infinite grid planes — floor and optional ceiling — drift toward the viewer through a single CSS keyframe. The classic synthwave / TRON / arcade-tunnel look, achieved with `transform-style: preserve-3d`, two `repeating-linear-gradient` planes and a `mask-image` horizon fade. No canvas, no WebGL, no `requestAnimationFrame`.

Composes naturally with the rest of the ambient backdrop family: `MeshGradient` (drifting blobs **behind** the grid for a sunset-over-tunnel look), `NoiseField` (grain **on top** for a 16mm-camera-on-arcade-screen feel), `ElectricBorder` (perimeter arcs around a perspective-grid card), `AuroraBackdrop` (gradient sky with grid receding into it).

## Key features

- **Three intensities** — `calm` / `standard` / `rush`. Each preset bundles drift duration, cell size and line opacity so a single prop tunes everything in proportion.
- **Three modes** — `mono` (achromatic white grid), `neon` (cyan floor + magenta ceiling, both with a soft drop-shadow glow), `wireframe` (hairline 0.5px lines, no glow).
- **Optional ceiling plane** — `ceiling={true}` mirrors the floor above the viewer; the surface becomes a tunnel. Off by default — most uses are floor-only.
- **Pure CSS animation** — drift comes from a `background-position` keyframe, not `transform: translateZ()`, because a 1-cell shift is naturally periodic and loops seamlessly.
- **Pure helpers exported** from the module-script (`pickIntensity`, `pickMode`, `isValidIntensity`, `isValidMode`, `clamp01`, `isReducedMotion`) — directly unit-testable without rendering.
- **prefers-reduced-motion safe** — `onMount` flips the `runAnimation` state to false when the media query matches; a CSS `@media (prefers-reduced-motion: reduce)` rule disables the keyframe in case the JS probe ever drifts. The grid still renders — statically.
- **SR-friendly** — slotted content stays in the DOM and the a11y tree. The grid layer is `aria-hidden`, `pointer-events: none`, stacked behind the slot via `z-index`. Focus, click and keyboard interaction with the wrapped child are unaffected.

## Usage

```svelte
<script>
	import PerspectiveGrid from '$lib/components/PerspectiveGrid.svelte';
</script>

<PerspectiveGrid>
	<section class="hero">…</section>
</PerspectiveGrid>

<PerspectiveGrid intensity="rush" mode="neon" ceiling>
	<article class="terminal">…</article>
</PerspectiveGrid>

<PerspectiveGrid intensity="calm" mode="wireframe" animated={false}>
	<div class="card">…</div>
</PerspectiveGrid>
```

## Props

| Prop        | Type                                  | Default      | Notes                                                              |
| ----------- | ------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `intensity` | `'calm' \| 'standard' \| 'rush'`      | `'standard'` | Bundles drift duration + cell size + line opacity.                 |
| `mode`      | `'mono' \| 'neon' \| 'wireframe'`     | `'mono'`     | Colour preset; `neon` adds drop-shadow glow.                       |
| `ceiling`   | `boolean`                             | `false`      | Mirror plane above the floor for a tunnel effect.                  |
| `animated`  | `boolean`                             | `true`       | Auto-disables under `prefers-reduced-motion: reduce`.              |
| `opacity`   | `number`                              | `1`          | Stage opacity. Clamped to `[0, 1]`. NaN/±Infinity become `0`.      |
| `class`     | `string`                              | `''`         | Extra classes on the wrapper.                                      |
| `children`  | `Snippet`                             | _(required)_ | Content to wrap. Stays interactive and stacked above the grid.     |

Unknown intensity / mode values fall back to `standard` / `mono`.

## Intensity table

| Intensity  | durationS | cellPx | lineOpacity | Vibe                                |
| ---------- | --------- | ------ | ----------- | ----------------------------------- |
| `calm`     | `18`      | `80`   | `0.35`      | Slow ambient drift — meditative     |
| `standard` | `9`       | `60`   | `0.55`      | Editorial default — readable motion |
| `rush`     | `4`       | `50`   | `0.85`      | Tunnel-rush / arcade attack-screen  |

Duration shrinks and opacity grows as you move from calm to rush — the grid both moves faster and asserts itself more visibly.

## Mode table

| Mode        | Line colour                            | Extra effect                                        | Vibe                                |
| ----------- | -------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| `mono`      | Pure white (`#ffffff`)                 | —                                                   | Clean editorial / technical drawing |
| `neon`      | Cyan floor + magenta ceiling           | `drop-shadow()` glow on each plane                  | Synthwave / 80s arcade              |
| `wireframe` | White at 85% alpha, 0.5px hairline     | —                                                   | Architectural blueprint / data-vis  |

## Distinct from

- **`MeshGradient`** — colour-blob backdrop, no input, no geometry. PerspectiveGrid is *geometric structure*. They COMPOSE — a colour-mesh under a perspective grid is a strong marketing hero.
- **`NoiseField`** — achromatic / chromatic grain *texture*. PerspectiveGrid is *line-based geometry*. They COMPOSE — grid + noise reads as VHS-arcade.
- **`AuroraBackdrop`** — gradient-sweep ambient wash. PerspectiveGrid carries explicit lines and motion direction.
- **`ElectricBorder`** — perimeter SVG-filter arcs. PerspectiveGrid fills the *interior* and is input-blind.
- **`Tilt3D`** — cursor-driven 3D tilt of the wrapped content itself. PerspectiveGrid is an *ambient* 3D scene that ignores the cursor.
- **`OrbitalRing`** — circular layout of children around a centre. PerspectiveGrid is a flat receding plane.

## Pure helpers (module-script exports)

- `pickIntensity(name)` — returns `{ durationS, cellPx, lineOpacity }`. Falls back to `standard`.
- `pickMode(name)` — returns `'mono' | 'neon' | 'wireframe'`. Falls back to `mono`.
- `isValidIntensity(name)` — type guard for intensity names.
- `isValidMode(name)` — type guard for mode names.
- `clamp01(n)` — clamps to `[0, 1]`; treats `NaN` / `±Infinity` / non-numeric input as `0`.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The slotted content is rendered as the primary content of the wrapper and is read by screen readers normally.
- The grid layer is `aria-hidden`, `pointer-events: none`, stacked via `z-index`. Invisible to assistive tech.
- Under `prefers-reduced-motion: reduce`: the `animated` prop is forced false on mount, the CSS `@media` query disables the keyframe even if the prop slips through, and the grid still renders — just statically. The geometry is part of the *appearance*, not the *motion*; users who want structure without motion still see it.
- The wrapper carries no `role` attribute — it inherits whatever role the slotted content has.

## Performance

- Two DOM nodes for the grid (1 floor, +1 ceiling if enabled) plus one stage and one 3D context. No per-cell DOM.
- Drift is a single `background-position` keyframe on a `will-change: background-position` plane. GPU-composited.
- Horizon fade is a static `mask-image: linear-gradient(...)` — no runtime cost.
- The 300% × 300% plane size is enough to cover the viewport at any aspect ratio after the 75° tilt; oversize prevents edge reveal during drift.

## Recipes

- **Synthwave hero**: `<PerspectiveGrid intensity="rush" mode="neon" ceiling><section>…</section></PerspectiveGrid>`.
- **Editorial backdrop with grain**: `<PerspectiveGrid intensity="standard" mode="mono"><NoiseField intensity="medium" mode="mono"><div>…</div></NoiseField></PerspectiveGrid>`.
- **Static technical-drawing card**: `<PerspectiveGrid intensity="calm" mode="wireframe" animated={false}><article>…</article></PerspectiveGrid>`.
- **Arcade attack-screen**: `<PerspectiveGrid intensity="rush" mode="neon" ceiling><pre class="terminal">…</pre></PerspectiveGrid>`.
- **Marketing landing combined with mesh gradient**: stack `<MeshGradient>` underneath the page content, then wrap the hero only in `<PerspectiveGrid mode="wireframe">` for a soft sky + crisp floor.
