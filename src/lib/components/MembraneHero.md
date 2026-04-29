---
name: MembraneHero
category: Statement Sections
author: AntClaude
status: stable
---

# MembraneHero

A statement-piece full-bleed editorial hero. CSS conic + radial gradient
mesh sits behind everything, displaced by inline-SVG `<feTurbulence>` +
`<feDisplacementMap>` so the surface ripples like a fluid film. A focal
dot drifts along a Lissajous curve overlaid above the membrane. On top
sits an editorial layout: eyebrow tag pill, large display `<h1>`,
single-line subhead, and two CTA buttons.

ReactBits-tier visual hook in pure Svelte 5 — zero external runtime
dependencies, no GSAP, no images, no font CDN.

## When to use

- SaaS landing-page hero, product launch page, season campaign
- Documentation site index where you want a quiet but distinct opening
- Any context where a single full-bleed statement reads better than a
  grid of cards

## When not to use

- A page that already has another statement section above the fold
- The headline must be more than ~60 characters — the per-glyph deal-in
  becomes janky on long strings
- The page is on an older browser without SVG filter support (IE11) —
  the membrane will just render as a flat conic gradient

## Usage

```svelte
<script lang="ts">
	import MembraneHero from '$lib/components/MembraneHero/MembraneHero.svelte';
</script>

<MembraneHero />
```

With prop overrides:

```svelte
<MembraneHero
	palette="sunset"
	eyebrow="Launch week"
	headline="Ship a story, not a stack"
	subhead="Editorial layouts for product launches and announcements."
	primaryCta="Read the launch"
	secondaryCta="Browse archives"
	primaryHref="/launch"
	secondaryHref="/archive"
/>
```

## Props

| Prop            | Type                                | Default                                          |
| --------------- | ----------------------------------- | ------------------------------------------------ |
| `palette`       | `'aurora' \| 'sunset' \| 'polar'`   | `'aurora'`                                       |
| `eyebrow`       | `string`                            | `'Now in beta'`                                  |
| `headline`      | `string`                            | `'A new kind of canvas'`                         |
| `subhead`       | `string`                            | `'Hand-crafted primitives, zero runtime cost.'`  |
| `primaryCta`    | `string`                            | `'Start building'`                               |
| `secondaryCta`  | `string`                            | `'See the docs'`                                 |
| `primaryHref`   | `string`                            | `'#'`                                            |
| `secondaryHref` | `string`                            | `'#'`                                            |
| `showDot`       | `boolean`                           | `true`                                           |
| `class`         | `string`                            | `''` (extra class on the root section)           |

### Palette presets

- **aurora** — teal `#0d9488` → violet `#7c3aed` → amber `#f59e0b`,
  amber dot accent. Reads as a quiet northern-lights wash.
- **sunset** — rose `#f43f5e` → amber `#f59e0b` → indigo `#4338ca`,
  peach dot accent. Warm and editorial.
- **polar** — slate `#1e293b` → sky `#0ea5e9` → cyan `#67e8f9`,
  ice dot accent. Quiet, technical, brand-neutral.

## Accessibility

- The headline is rendered in a real `<h1>` so screen readers see it in
  document outline. The `.mh-sr-only` span carries the full string;
  individual `.mh-glyph` spans are aria-hidden so the headline isn't
  announced one-letter-per-element.
- The eyebrow pill carries an explicit `aria-label="Tag: <eyebrow>"`.
- The membrane SVG and focal Lissajous dot are `aria-hidden="true"`.
- CTAs are real `<a>` tags with descriptive labels.

## Reduced motion

When `prefers-reduced-motion: reduce` is set:

- The SVG `<feTurbulence>` `<animate>` element is omitted (frozen seed
  — the surface still ripples once but no longer breathes).
- The Lissajous focal-dot drift loop exits on the next animation frame.
- All CSS animations on glyphs / eyebrow / subhead / CTAs are disabled.

The deal-in does not replay on subsequent renders — the layout simply
mounts complete.

## Asset notes

The membrane is a CSS conic gradient + two overlay radial gradients,
displaced by an inline SVG filter. No external images, no font CDN, no
GSAP, no Three.js. The whole hero adds **~6 KB** compressed to a
SvelteKit route.

The `<feTurbulence>` is set to `type="fractalNoise"` with two octaves
and `seed="7"` so server and client render identically (with the
`<animate>` removed, which only kicks in on the client).

## M2 / M3 roadmap

- **M2** — Custom palette via `{ from, via, to, accent }` prop instead
  of a named preset. Mouse-parallax on the membrane (cursor pushes the
  surface). Optional light-theme variant.
- **M3** — Scroll-progress-bound turbulence intensity (page scrolling
  pulses the warp). Optional second focal dot at a phase offset.
