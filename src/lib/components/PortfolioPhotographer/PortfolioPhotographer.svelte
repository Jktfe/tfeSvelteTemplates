<!--
	============================================================
	PortfolioPhotographer — Editorial photographer-portfolio hero
	============================================================

	A statement-piece section for a photographer's landing page.
	Combines a wireframe-lens background, a horizontally-drifting
	reel of "photo" tiles, and a serif display name + tagline
	overlay.

	M1 SCOPE
	- Drifting reel of CSS-gradient placeholder photos
	- Wireframe lens + Halton-scatter focal dots
	- Editorial typography (serif name, sans tagline, eyebrow pill)
	- Hover/focus pause-on-reel
	- prefers-reduced-motion: drift + lens rotation + dot pulse off,
	  layout intact, hover-pause still works
	- Asset-free (no external images, no font CDN, no GSAP)

	M2/M3 (NOT IN THIS COMPONENT YET)
	- Lightbox modal opening from a clicked tile
	- Real-image swap-in via `Photo.src`
	- Cursor 3D tilt on tiles
	- ?photo=id URL sync

	USAGE
		<PortfolioPhotographer />

		<PortfolioPhotographer
			photos={myPhotos}
			name="Aria Lindqvist"
			tagline="photographs of light, distance, and quiet rooms"
			years="2018 — 2026" />

	PROPS
	| Prop      | Type      | Default                    |
	|-----------|-----------|----------------------------|
	| photos    | Photo[]   | SAMPLE_PHOTOS              |
	| name      | string    | 'Aria Lindqvist'           |
	| tagline   | string    | 'photographs of light, …'  |
	| years     | string    | '2018 — 2026'              |
	| dotCount  | number    | 24                         |
	| duration  | number    | 36 (seconds per cycle)     |
	| theme     | 'light'\|'dark' | 'dark'               |
	| class     | string    | ''                         |

	ACCESSIBILITY
	- Real <h1> with the photographer's name
	- Reel labelled `aria-label="Drifting photo reel"`
	- Halton scatter dots are decorative (`aria-hidden`)
	- Wireframe lens SVG is `aria-hidden`
	- Duplicated tiles in the marquee are `aria-hidden` so screen
	  readers only see the original photo set once

	DEPENDENCIES
	- Subcomponents: PhotoReelHero
	- Types/data: types.ts, photos.ts
	- Zero external runtime dependencies
	============================================================
-->
<script lang="ts">
	import PhotoReelHero from './PhotoReelHero.svelte';
	import { SAMPLE_PHOTOS } from './photos';
	import type { Photo } from './types';

	interface Props {
		photos?: Photo[];
		name?: string;
		tagline?: string;
		years?: string;
		dotCount?: number;
		duration?: number;
		theme?: 'light' | 'dark';
		class?: string;
	}

	let {
		photos = SAMPLE_PHOTOS,
		name = 'Aria Lindqvist',
		tagline = 'photographs of light, distance, and quiet rooms',
		years = '2018 — 2026',
		dotCount = 24,
		duration = 36,
		theme = 'dark',
		class: extraClass = ''
	}: Props = $props();
</script>

<section class="pp-root pp-{theme} {extraClass}">
	<div class="pp-glow pp-glow-1" aria-hidden="true"></div>
	<div class="pp-glow pp-glow-2" aria-hidden="true"></div>

	<PhotoReelHero {photos} {name} {tagline} {years} {dotCount} {duration} />
</section>

<style>
	/*
	 * Theming notes (see docs/THEMING.md):
	 * - Chrome (background, body text) flips with the theme prop.
	 * - Brand glows (warm amber + cool purple) stay identity-bearing across
	 *   schemes — exposed as --pp-glow-warm / --pp-glow-cool so a consumer
	 *   can override per-theme without forking the component.
	 */
	.pp-root {
		--pp-glow-warm: rgba(245, 158, 11, 0.45);
		--pp-glow-cool: rgba(124, 58, 237, 0.4);
		--pp-bg-from: #1c1917;
		--pp-bg-to: #0c0a09;
		--pp-fg: #f5f5f4;

		position: relative;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		min-height: clamp(420px, 60vh, 720px);
		overflow: hidden;
		isolation: isolate;
		background: radial-gradient(ellipse at 50% 30%, var(--pp-bg-from) 0%, var(--pp-bg-to) 70%);
		color: var(--pp-fg);
	}

	.pp-light {
		--pp-bg-from: #fafaf9;
		--pp-bg-to: #e7e5e4;
		--pp-fg: #1c1917;
		/* Bumped from 0.18 / 0.14 — the original values disappeared on a
		   bright page; these read clearly without overpowering the copy. */
		--pp-glow-warm: rgba(245, 158, 11, 0.32);
		--pp-glow-cool: rgba(124, 58, 237, 0.24);
	}

	.pp-glow {
		position: absolute;
		pointer-events: none;
		filter: blur(90px);
		opacity: 0.5;
		z-index: 0;
	}
	.pp-glow-1 {
		top: 12%;
		left: 8%;
		width: 360px;
		height: 360px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--pp-glow-warm) 0%, transparent 70%);
	}
	.pp-glow-2 {
		bottom: 14%;
		right: 6%;
		width: 420px;
		height: 420px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--pp-glow-cool) 0%, transparent 70%);
	}

	.pp-root :global(.prh-stage) {
		position: relative;
		z-index: 1;
	}
</style>
