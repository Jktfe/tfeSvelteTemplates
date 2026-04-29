---
title: AuroraBackdrop
description: Full-bleed pure-CSS aurora backdrop — four conic-gradient ribbons stack with mix-blend-mode screen and rotate at non-harmonic periods, fading at the corners through a soft radial veil. Three named palettes (classic / dawn / deep), zero JS in the steady state, prefers-reduced-motion safe.
category: Statement Sections
author: antclaude
status: stable
---

# AuroraBackdrop

A full-bleed ambient backdrop — four CSS conic-gradient ribbons stack on top of one another, each rotating at a deliberately non-harmonic period (40 s / 65 s / 80 s / 110 s) with alternating directions and staggered phase offsets. Mix-blend-mode `screen` makes the colours bloom into one another, and a soft radial veil fades the corners so the wall reads as a self-contained luminous patch rather than wallpaper.

Pairs naturally with text overlays — drop a `<ShinyText>` or `<TrueFocus>` headline above an `<AuroraBackdrop>` and you have a ready-made statement hero. Asset-free: no images, no fonts, no animation library.

## Key Features

- **Pure CSS** — single `@keyframes ab-spin` block per ribbon, GPU-accelerated `transform: rotate()`, no rAF, no JS interval.
- **Three palettes** — `classic` (cyan / violet / emerald / sky), `dawn` (rose / amber / coral / plum), `deep` (sky / slate / cyan / indigo). Pass an unknown name and the component falls back to `classic` instead of crashing.
- **Non-harmonic motion** — the four ribbon periods (40, 65, 80, 110) share no small common factor, so the composite never visibly loops. Alternating `animation-direction` per ribbon swirls neighbouring layers against each other.
- **Configurable intensity** — `intensity={0.5}` halves all periods (more energetic), `intensity={2}` doubles them (more meditative). A safe minimum prevents periods from collapsing to ~0.
- **Configurable blur** — `blur={60}` is the default in pixels; raise to soften the ribbons further (more ambient, less defined), lower for a sharper galactic-band look.
- **Reduced-motion safe** — `@media (prefers-reduced-motion: reduce)` removes the animation entirely; the wall settles in a static composition that is still legible as a deliberate frame.
- **Decorative by design** — the wrapper carries `aria-hidden="true"` so screen readers ignore it; pair with real content above.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no animation library.

## Usage

```svelte
<script lang="ts">
  import AuroraBackdrop from '$lib/components/AuroraBackdrop.svelte';
  import ShinyText from '$lib/components/ShinyText.svelte';
</script>

<!-- Default: classic palette, full-bleed ambient -->
<section class="hero">
  <AuroraBackdrop />
  <h1>The story we tell</h1>
</section>

<!-- Dawn palette, more energetic motion -->
<AuroraBackdrop palette="dawn" intensity={0.6} />

<!-- Deep palette, softer blur, calmer rotation -->
<AuroraBackdrop palette="deep" intensity={1.5} blur={90} />

<!-- Compose with a text component for a statement hero -->
<section class="hero">
  <AuroraBackdrop palette="classic" />
  <div class="hero-text">
    <ShinyText text="A new kind of canvas" shineColor="#fff" />
  </div>
</section>
```

`AuroraBackdrop` fills its parent — give the parent `position: relative` and a fixed height (or `min-height: 100vh`), and stack any foreground content above it with `z-index`.

## Props

| Prop        | Type                              | Default     | Description                                                  |
|-------------|-----------------------------------|-------------|--------------------------------------------------------------|
| `palette`   | `'classic' \| 'dawn' \| 'deep'`   | `'classic'` | Named palette. Unknown names fall back to `classic`.         |
| `intensity` | `number`                          | `1`         | Period multiplier — `<1` faster, `>1` slower. Min 0.25×.     |
| `blur`      | `number` (px)                     | `60`        | Per-ribbon CSS `filter: blur()` amount.                      |
| `class`     | `string`                          | `''`        | Extra CSS classes appended to the `.ab-root` wrapper.        |

## Palette set

| Name      | Stops                                      | Base       | Mood              |
|-----------|--------------------------------------------|------------|-------------------|
| `classic` | cyan → violet → emerald → sky              | near-black | aurora-borealis   |
| `dawn`    | rose → amber → coral → plum                | dark plum  | sunrise warmth    |
| `deep`    | sky → slate → cyan → indigo                | very dark  | deep-ocean / outer space |

## Distinct From

- **`MembraneHero`** — also full-bleed but warps a *single* CSS gradient via inline-SVG `<feTurbulence>` + `<feDisplacementMap>`. AuroraBackdrop instead stacks four pure-CSS conic gradients with rotation; no SVG filter chain.
- **`Cardwall`** — structured tile grid on a perspective plane. AuroraBackdrop is amorphous gradient ribbons.
- **`ShineBorder`** — animates a *border* on a single element. AuroraBackdrop is the backdrop, not a border.
- **`PortfolioPhotographer`** — editorial photo-reel hero with foreground content. AuroraBackdrop is intentionally backgroundless content-free.

## Accessibility

- The wrapper carries `aria-hidden="true"` so assistive tech ignores it. Place real headings, paragraphs, and CTAs *above* the backdrop using normal flow + `z-index`.
- No focusable elements, no keyboard handlers, no aria-live regions — this is purely decorative paint.
- `@media (prefers-reduced-motion: reduce)` removes all rotation animations. The wall settles into a static frame that still composes the four ribbons as a single luminous patch.
- The radial veil keeps the corners dark, which gives foreground white text adequate contrast in most cases. If you place light text directly over the centre of the wall, layer your own translucent dark scrim before the text element.

## Performance Notes

- Four CSS animations per backdrop. Each ribbon is its own composited layer (`will-change: transform`), so rotation is GPU-only — no per-frame paint.
- The blur filter is the most expensive part. Modern GPUs handle 60 px Gaussian blur on a full-bleed surface comfortably; if you target lower-end mobile, lower `blur` to 30–40 px or drop the ribbon count by editing the component locally.
- The component never reads layout, never observes resize, and never uses `requestAnimationFrame`.
- All four ribbon configs are computed once at mount via `$derived` — no per-frame JS.

## Implementation Notes

- Each ribbon is a single `<div class="ab-ribbon">` with a `conic-gradient` background and a CSS keyframe animation on `transform: rotate()`. The four start angles (15°, 110°, 215°, 305°) plus the staggered negative `animation-delay` values give every ribbon a different starting position on first paint, so the wall reads as alive immediately rather than spinning up from a single uniform frame.
- The veil overlay is a single `radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.45) 90%, rgba(0,0,0,0.7) 100%)`. It sits above the ribbons with `z-index: 1` and `pointer-events: none`, so it never interferes with a foreground click target.
- The ribbon container is sized `inset: -25%` so the rotating gradient never reveals an empty corner — when a ribbon spins, its bounding box always stays larger than the visible area.
- Pure helpers (`pickPalette`, `ribbonConfig`, `buildRibbonGradient`, `isReducedMotion`) are exported from the `<script module>` block so the test suite can assert palette resolution, period maths, and the conic-gradient CSS string without rendering a component.
