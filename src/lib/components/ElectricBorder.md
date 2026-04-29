---
name: ElectricBorder
category: Helpful UX
author: antclaude
status: shipped
---

# ElectricBorder

Animated electric-arc border wrapper. Wraps any element with a crackling, jagged border that pulses like a Tesla coil. Uses an SVG `feTurbulence` + `feDisplacementMap` filter to distort a stroked rectangle, with `<animate>` driving the turbulence frequency for the live crackling motion. Pure SVG + CSS — zero deps, single inline element, no rAF loop.

Composes naturally with any wrapped content (cards, badges, hero text, photos). Pairs well with `Tilt3D` (3D rotation + electric border = sci-fi UI panel feel), `HoloCard` (foil surface + electric border = double premium), and `MagicCard` (cursor spotlight + ambient electric ring).

## Key features

- **Three intensities** — `mild` / `crackling` / `lightning`. Each preset balances frequency, distortion scale, animation speed, stroke width, and glow blur. Higher intensity = denser crackling, longer arcs, brighter halo.
- **Three palettes** — `electric-blue` (cyan + sapphire halo), `plasma-purple` (orchid + violet halo), `volt-yellow` (electric yellow + amber halo). Each closes the visual gap between stroke colour and ambient glow for the unified arc-discharge look.
- **Pure SVG-filter math** — no canvas, no WebGL, no per-frame JS. The `<animate>` element drives the turbulence frequency up and down, and the displacement map distorts the stroked rect in real-time. Browser handles the entire animation on the GPU.
- **Pure helpers exported** from the module-script (`pickIntensity`, `pickPalette`, `clamp01`, `clampPositive`, `nextFilterId`, `frequencyValuesString`, `isReducedMotion`) — all directly unit-testable without rendering.
- **Per-instance filter IDs** — every render generates a unique filter ID via a module-scoped counter, so multiple ElectricBorder instances on the same page don't collide on the SVG `<defs>` namespace.
- **prefers-reduced-motion safe** — `isReducedMotion()` is read on mount; under reduced motion the `<animate>` element is removed entirely, the displacement scale falls to zero, and the glow halo shrinks. Stylesheet has a CSS-layer fallback via `@media (prefers-reduced-motion: reduce)` as belt + braces.
- **SR-friendly** — slotted content stays in the DOM and a11y tree. The SVG border layer is `aria-hidden`, `pointer-events: none`, and stacked on top of the content via `z-index`. Focus, click and keyboard interaction with the wrapped child are unaffected.

## Usage

```svelte
<script>
	import ElectricBorder from '$lib/components/ElectricBorder.svelte';
</script>

<ElectricBorder intensity="crackling" palette="electric-blue">
	<article class="card">…</article>
</ElectricBorder>

<ElectricBorder intensity="lightning" palette="volt-yellow" radius={24}>
	<button class="cta">Charge up</button>
</ElectricBorder>
```

## Composition with Tilt3D

```svelte
<script>
	import ElectricBorder from '$lib/components/ElectricBorder.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<Tilt3D maxTilt={14}>
	<ElectricBorder intensity="lightning" palette="plasma-purple" radius={20}>
		<div class="hologram-panel">…</div>
	</ElectricBorder>
</Tilt3D>
```

Tilt3D handles X/Y rotation toward the cursor; ElectricBorder handles ambient crackling around the perimeter. Together they give the full sci-fi-UI-panel feel.

## Props

| Prop        | Type                                                | Default            | Notes                                                          |
| ----------- | --------------------------------------------------- | ------------------ | -------------------------------------------------------------- |
| `intensity` | `'mild' \| 'crackling' \| 'lightning'`              | `'crackling'`      | Tunes frequency, distortion scale, animation speed, glow blur. |
| `palette`   | `'electric-blue' \| 'plasma-purple' \| 'volt-yellow'` | `'electric-blue'` | Stroke + glow colour set.                                      |
| `radius`    | `number`                                            | `12`               | Wrapper border-radius in pixels.                               |
| `children`  | `Snippet`                                           | _(required)_       | Content to wrap. Stays in the DOM and a11y tree.               |

Unknown intensity / palette values fall back to `crackling` / `electric-blue`.

## Intensity table

| Intensity   | frequency | distortion | animSpeed (s) | strokeWidth | glowBlur |
| ----------- | --------- | ---------- | ------------- | ----------- | -------- |
| `mild`      | 0.015     | 3          | 5             | 2           | 4        |
| `crackling` | 0.030     | 6          | 3             | 2           | 8        |
| `lightning` | 0.060     | 12         | 1.5           | 3           | 14       |

Frequency drives `feTurbulence`'s `baseFrequency` — higher = denser noise field, more crackle. Distortion drives `feDisplacementMap`'s `scale` — higher = longer jagged arcs. animSpeed is the period of one full frequency-pump cycle (low → high → low).

## Palette table

| Palette         | Stroke    | Glow      | Highlight | Vibe                                 |
| --------------- | --------- | --------- | --------- | ------------------------------------ |
| `electric-blue` | `#00bfff` | `#0080ff` | `#ffffff` | Tesla-coil sapphire arc.             |
| `plasma-purple` | `#c77dff` | `#9d00ff` | `#ff00ff` | Cyberpunk neon plasma.               |
| `volt-yellow`   | `#ffea00` | `#ffd60a` | `#ffffff` | High-voltage caution / lightning.    |

Highlight is reserved for future inner-glow stops; current build uses only stroke + glow for the layered drop-shadow halo.

## Distinct from

- **`ShineBorder`** — single linear-gradient sweeping horizontally across a static border. ElectricBorder uses an SVG `feTurbulence + feDisplacementMap` filter to jaggedly distort a stroked rect. Different math, different aesthetic — ShineBorder is "glittery chrome trim", ElectricBorder is "live electrical arc".
- **`HoloCard`** — cursor-driven conic-gradient foil filling the entire surface. ElectricBorder is border-only and ambient (no cursor reactivity). They compose: ElectricBorder around a HoloCard gives a foiled card with a crackling perimeter.
- **`NeonSign`** — glowing tube-letterform around _text_. ElectricBorder is border-only around _any wrapped element_. NeonSign emits a smooth steady glow; ElectricBorder emits a jagged crackling arc.
- **`MagicCard`** — cursor-following spotlight on a single card. ElectricBorder has no cursor reactivity; it's an ambient effect.
- **`RippleGrid`** — concentric expanding rings filling a grid. ElectricBorder is a single distorted border around one element.
- **`AnimatedBeam`** — animated beam connecting two anchor points. ElectricBorder loops around a single element's perimeter.
- **`MagneticButton`** — element translates toward cursor. ElectricBorder is static-position ambient effect.
- **`Tilt3D`** — element rotates in 3D toward cursor. ElectricBorder has no rotation. They compose for the sci-fi-panel feel.
- **`Spinner.pulse`** — concentric loading rings with no border. ElectricBorder isn't a loading state.

## Pure helpers (module-script exports)

- `pickIntensity(name)` — returns `{ frequency, distortion, animSpeed, strokeWidth, glowBlur }`. Falls back to `crackling`.
- `pickPalette(name)` — returns `{ stroke, glow, highlight }`. Falls back to `electric-blue`.
- `clamp01(n)` — clamps to `[0, 1]`; treats `NaN` and `±Infinity` as `0`.
- `clampPositive(n, max?)` — clamps to `[0, max]` with the same NaN/Infinity guard.
- `nextFilterId(prefix?)` — module-scoped counter for unique SVG filter IDs across instances.
- `frequencyValuesString(base)` — returns the 3-stop semicolon-separated string for `<animate>` `values` attribute. First and last stops match for seamless loop; peak is `~base * 2.2` capped at `1`.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The slotted content is rendered as the primary content of the wrapper and is read by screen readers normally.
- The SVG border layer is `aria-hidden`, `pointer-events: none`, stacked on top of the content via `z-index`. Invisible to assistive tech.
- Under `prefers-reduced-motion: reduce`: the `<animate>` element is removed (no DOM-level animation), `feDisplacementMap`'s scale drops to zero (no visual jitter), the glow blur shrinks (calmer halo), and the stylesheet caps the drop-shadow at a static low-key blur.
- The wrapper is role-neutral (no `role` attribute set) — it inherits whatever role makes sense from the slotted content.

## Performance

- Zero per-frame JS work. Animation is driven entirely by the SVG `<animate>` element, which the browser handles on the GPU.
- Single `feTurbulence` + `feDisplacementMap` filter pair per instance. Filter is scoped to the SVG layer only, so the wrapped content is never re-rasterised.
- Stroke uses `vector-effect="non-scaling-stroke"` so the border thickness stays consistent regardless of the wrapper's aspect ratio. Rect dimensions are in viewBox units (stretched), stroke is in screen pixels.
- Drop-shadow halo is a single CSS `filter: drop-shadow()` on the SVG layer, GPU-composited.
- No canvas, no WebGL, no rAF, no resize observer. Steady-state cost is whatever the SVG filter takes per frame, and browsers cache that aggressively.

## Recipes

- **Sci-fi panel hero**: `<Tilt3D maxTilt={14}><ElectricBorder intensity="lightning" palette="plasma-purple" radius={20}><div class="panel">…</div></ElectricBorder></Tilt3D>`.
- **Charge-up CTA**: `<ElectricBorder intensity="crackling" palette="volt-yellow" radius={28}><button class="cta">Charge up</button></ElectricBorder>`.
- **Premium-rare card**: `<HoloCard intensity="cosmic" palette="rainbow"><ElectricBorder intensity="mild" palette="electric-blue" radius={16}><img src="/legendary.png" alt="" /></ElectricBorder></HoloCard>`.
- **Live-status pill**: `<ElectricBorder intensity="mild" palette="electric-blue" radius={999}><span class="badge">⚡ LIVE</span></ElectricBorder>`.
- **Hologram panel**: `<ElectricBorder intensity="lightning" palette="electric-blue" radius={4}><div class="hologram">…</div></ElectricBorder>`.
