---
name: NoiseField
category: Helpful UX
author: antclaude
status: shipped
---

# NoiseField

Ambient grain / film-noise / TV-static overlay. Wrap any region (hero, card, full page) and a single SVG `<feTurbulence>` + `<feColorMatrix>` filter renders a noise pattern, layered over the slotted content via `mix-blend-mode: overlay`. The overlay can shimmer (CSS-translated SVG with `steps()` easing) for a 24-fps film-grain feel, or stay completely static.

Pure SVG + CSS — no `requestAnimationFrame`, no canvas, no JS frame loop, no resize observer. The filter chain is GPU-composited and the shimmer is a single keyframe-driven transform.

Composes naturally with colour fields and ambient backdrops: `MeshGradient` (drifting blobs + grain on top for a 35mm-film-still look), `ElectricBorder` (perimeter arcs + interior film texture), `AuroraBackdrop` (gradient sky + analog grain).

## Key features

- **Three intensities** — `fine` / `medium` / `coarse`. Each preset bundles `feTurbulence`'s `baseFrequency` and `numOctaves` so grain size and richness scale together.
- **Three modes** — `mono` (achromatic white noise), `chroma` (saturated RGB grain — slight cyan/red bias), `retro` (chromatic + a 1px-on / 2px-off scanline overlay via `repeating-linear-gradient`).
- **Animated shimmer** — when `animated` is true (default), the overlay translates on a 5-stop CSS keyframe with `steps(8)` easing. Stuttering snap motion reads like discrete film frames, not a smooth slide.
- **SSR-safe filter ID** — a static fallback `nf-static` ID is rendered server-side; `onMount` swaps it for a unique `nf-N` ID via the module-scoped counter. Hydration mismatch never visible to the user.
- **Pure helpers exported** from the module-script (`pickIntensity`, `pickMode`, `isValidIntensity`, `isValidMode`, `clamp01`, `nextFilterId`, `isReducedMotion`) — directly unit-testable without rendering.
- **prefers-reduced-motion safe** — the `animated` flag short-circuits at mount-time when `(prefers-reduced-motion: reduce)` matches; a CSS `@media` rule belt-and-braces the animation off if the JS probe ever drifts.
- **SR-friendly** — slotted content stays in the DOM and a11y tree. The overlay layer is `aria-hidden`, `pointer-events: none`, stacked on top via `z-index: 1`. Focus, click and keyboard interaction with the wrapped child are unaffected.

## Usage

```svelte
<script>
	import NoiseField from '$lib/components/NoiseField.svelte';
</script>

<NoiseField>
	<section class="hero">…</section>
</NoiseField>

<NoiseField intensity="coarse" mode="retro" opacity={0.5}>
	<article class="terminal">…</article>
</NoiseField>

<NoiseField intensity="fine" mode="chroma" animated={false}>
	<div class="card">…</div>
</NoiseField>
```

## Props

| Prop        | Type                              | Default      | Notes                                                              |
| ----------- | --------------------------------- | ------------ | ------------------------------------------------------------------ |
| `intensity` | `'fine' \| 'medium' \| 'coarse'`  | `'medium'`   | Bundles `baseFrequency` + `numOctaves`.                            |
| `mode`      | `'mono' \| 'chroma' \| 'retro'`   | `'mono'`     | Colour-matrix preset; `retro` adds a scanline overlay.             |
| `animated`  | `boolean`                         | `true`       | Auto-disables under `prefers-reduced-motion: reduce`.              |
| `opacity`   | `number`                          | `0.4`        | Overlay opacity. Clamped to `[0, 1]`. NaN/±Infinity become `0`.    |
| `class`     | `string`                          | `''`         | Extra classes on the wrapper.                                      |
| `children`  | `Snippet`                         | _(required)_ | Content to wrap. Stays interactive.                                |

Unknown intensity / mode values fall back to `medium` / `mono`.

## Intensity table

| Intensity | baseFrequency | numOctaves | Vibe                              |
| --------- | ------------- | ---------- | --------------------------------- |
| `fine`    | `1.6`         | `2`        | Tight, dense grain — 35mm-film    |
| `medium`  | `0.85`        | `3`        | Editorial default — soft texture  |
| `coarse`  | `0.4`         | `4`        | Chunky, organic — VHS / analog    |

`baseFrequency` decreases as grain gets larger; `numOctaves` increases for richer detail at coarser scales.

## Mode table

| Mode     | Colour matrix                                              | Extra layer                                                    | Vibe                              |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| `mono`   | All channels collapsed to white; alpha preserved           | —                                                              | Clean editorial / black-and-white |
| `chroma` | Slight R/B amplification (`1.2 / 1.0 / 1.4` diagonal)      | —                                                              | Saturated RGB grain               |
| `retro`  | Cyan-shifted with channel mix + small offset               | 1px / 3px-period scanline `repeating-linear-gradient`           | CRT / VHS / synthwave             |

## Distinct from

- **`MeshGradient`** — colour-blob backdrop, no input, no texture. NoiseField is achromatic/chromatic *grain* — pairs with MeshGradient for a film-still effect.
- **`AuroraBackdrop`** — gradient-sweep ambient wash. NoiseField overlays *texture*, not colour.
- **`ElectricBorder`** — perimeter SVG-filter arcs. NoiseField fills the *interior* and is input-blind.
- **`ShineBorder`** / **`HoloCard`** — both are perimeter / surface gradient effects. NoiseField is grain.
- **`PixelTrail`** / **`ClickSpark`** / **`MagnetGrid`** — cursor-event primitives. NoiseField has zero input handling.

## Pure helpers (module-script exports)

- `pickIntensity(name)` — returns `{ baseFrequency, numOctaves }`. Falls back to `medium`.
- `pickMode(name)` — returns `'mono' | 'chroma' | 'retro'`. Falls back to `mono`.
- `isValidIntensity(name)` — type guard for intensity names.
- `isValidMode(name)` — type guard for mode names.
- `clamp01(n)` — clamps to `[0, 1]`; treats `NaN`/`±Infinity` as `0`.
- `nextFilterId(prefix?)` — module-scoped counter for unique filter IDs across instances.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The slotted content is rendered as the primary content of the wrapper and is read by screen readers normally.
- The overlay layer is `aria-hidden`, `pointer-events: none`, stacked via `z-index: 1`. Invisible to assistive tech.
- Under `prefers-reduced-motion: reduce`: the `animated` prop is forced false on mount, the CSS `@media` query freezes the keyframe even if the prop slips through, and the noise still renders — just statically. The grain pattern is part of the *appearance*, not the *motion*; users who want texture without motion still see it.
- The wrapper is role-neutral (no `role` attribute set) — it inherits whatever role the slotted content has.

## Performance

- One SVG element per instance with one `<filter>` + one `<rect>`. No DOM thrash.
- Filter chain (`feTurbulence` + `feColorMatrix`) is GPU-composited via `mix-blend-mode: overlay`.
- Animation is a single CSS keyframe applying a `transform: translate()` to the SVG host. No JS frame loop, no resize observer.
- Oversized SVG (120% × 120%, positioned at `-10%`/`-10%`) hides edge-reveal during the shimmer slide.
- `feTurbulence` is the only mildly-expensive primitive — measured fine on commodity hardware. Drop intensity to `coarse` (cheaper octaves) if needed.

## Recipes

- **Hero film-still**: `<NoiseField intensity="medium" mode="mono"><MeshGradient palette="aurora"><section>…</section></MeshGradient></NoiseField>`.
- **Retro CRT terminal**: `<NoiseField intensity="coarse" mode="retro" opacity={0.55}><article class="terminal">…</article></NoiseField>`.
- **Static print texture (no shimmer)**: `<NoiseField intensity="fine" animated={false} opacity={0.3}><div class="article">…</div></NoiseField>`.
- **Composed with ElectricBorder**: `<ElectricBorder><NoiseField mode="chroma" opacity={0.35}><div>…</div></NoiseField></ElectricBorder>`.
- **Background grain on the whole page**: wrap the `<main>` of a route in `<NoiseField intensity="fine">…</NoiseField>` for a subtle texture across the viewport.
