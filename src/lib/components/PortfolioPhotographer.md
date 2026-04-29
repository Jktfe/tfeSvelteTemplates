---
name: PortfolioPhotographer
category: Statement Sections
author: AntClaude
status: stable
---

# PortfolioPhotographer

A statement-piece editorial section for a photographer's landing page.
Wireframe lens background, horizontally drifting reel of CSS-gradient
"photo" tiles, Halton-sequence focal scatter dots, and a serif display
name with sans-serif tagline overlay.

ReactBits-tier visual hook in pure Svelte 5 — zero external runtime
dependencies, no GSAP, no images, no font CDN.

## When to use

- Landing page hero for a photographer / videographer / studio site
- Portfolio index page where individual project pages live behind the
  reel tiles (M2 lightbox)
- Any context that needs a "selected works" feel without committing to
  a specific image set yet

## When not to use

- A single hero image is enough — use a plain `<header>` with a `<picture>`
- The page already has another statement section above the fold
- You need a strict static page with no animation at all

## Usage

```svelte
<script lang="ts">
	import PortfolioPhotographer from '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
</script>

<PortfolioPhotographer />
```

With custom photos, name, and tagline:

```svelte
<script lang="ts">
	import PortfolioPhotographer from '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
	import type { Photo } from '$lib/components/PortfolioPhotographer/types';

	const photos: Photo[] = [
		{
			id: 'studio-01',
			caption: 'Studio session, april',
			category: 'Studio',
			cover: { from: '#1c1917', via: '#44403c', to: '#0c0a09', accent: '#fde68a' }
		}
		// …
	];
</script>

<PortfolioPhotographer
	{photos}
	name="Your Name"
	tagline="documentary photography from the north"
	years="2014 — 2026"
	duration={48}
/>
```

## Props

| Prop      | Type             | Default                                          |
| --------- | ---------------- | ------------------------------------------------ |
| `photos`  | `Photo[]`        | `SAMPLE_PHOTOS` (14 generic gradient tiles)      |
| `name`    | `string`         | `'Aria Lindqvist'`                               |
| `tagline` | `string`         | `'photographs of light, distance, and quiet …'`  |
| `years`   | `string`         | `'2018 — 2026'`                                  |
| `dotCount` | `number`        | `24` (Halton scatter dots)                       |
| `duration` | `number`        | `36` seconds per full reel cycle                 |
| `theme`   | `'light' \| 'dark'` | `'dark'`                                       |
| `class`   | `string`         | `''` (extra class on the root section)           |

### `Photo` shape

```ts
type Photo = {
	id: string;       // kebab-case
	caption: string;  // editorial one-liner
	category: string; // tag (Landscape, Portrait, Urban, …)
	cover: { from: string; via: string; to: string; accent: string };
	src?: string;     // reserved for M2 real-image swap-in
};
```

## Accessibility

- The photographer's name renders as a real `<h1>` so screen readers
  see it in document outline
- Reel labelled `aria-label="Drifting photo reel"`
- Duplicated tiles in the seamless-loop track are `aria-hidden="true"`
  so assistive tech only enumerates the original photo set once
- Wireframe lens SVG and Halton scatter dots are decorative
  (`aria-hidden="true"`)
- Tile hover/focus brings the same lift effect, so keyboard users get
  the same visual feedback as mouse users

## Reduced motion

When `prefers-reduced-motion: reduce` is set:

- Reel drift is paused (track stays at frame 0)
- Lens ring + tick-mark rotation is off
- Halton dot pulse is off (dots remain visible at their resting opacity)
- Eyebrow pill dot pulse is off

The mount-time deal-in for the typography copy still runs because it
fires once and respects standard transition curves.

## Asset notes

Every visible "photo" is a three-stop CSS gradient with an accent
vignette. M2 will add a `Photo.src` field for real image swap-in,
keeping the gradient as a perfect-quality fallback while the image
loads.

The wireframe lens uses inline SVG (no external font, no asset) and
the Halton scatter is generated at render time from the deterministic
`halton(i, base)` helper so server and client render identically.

## M2 / M3 roadmap

- **M2** — Lightbox modal that opens from a clicked tile with a FLIP
  animation. Real-image swap-in via `Photo.src`. `?photo=id` URL sync.
- **M3** — Cursor 3D tilt on tiles. Adaptive duration based on viewport
  width. Scroll-linked drift speed.
