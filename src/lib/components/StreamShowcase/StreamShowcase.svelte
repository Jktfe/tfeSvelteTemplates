<!--
	============================================================
	StreamShowcase — Editorial streaming-platform shelf
	============================================================

	A statement-piece section for showcasing a curated set of
	playlists in a streaming-platform style. Combines a brush-script
	hero (top half) with a 10-card fan carousel (bottom half) that
	splays cards around a shared pivot below the deck.

	M1 SCOPE
	- Brush-script title with staggered letter entrance
	- Fan carousel with click/drag/keyboard interaction
	- 5 unique playlists × 2 = 10 cards
	- Reduced-motion fallback (no entrance, no drag-rotate)
	- Asset-free (pure CSS gradients, no external images, no GSAP)

	M2/M3 (NOT IN THIS COMPONENT YET)
	- FLIP modal opening from the active card
	- YouTube iframe playback of episodes
	- ?playlist=slug URL sync

	USAGE
		<StreamShowcase />

		<StreamShowcase
			playlists={myPlaylists}
			eyebrow="Now playing"
			topLine="Build."
			bottomLine="Ship."
			onSelect={(p) => console.log('selected', p.slug)} />

	PROPS
	| Prop       | Type                       | Default                |
	|------------|----------------------------|------------------------|
	| playlists  | Playlist[]                 | SAMPLE_PLAYLISTS       |
	| count      | number                     | 10                     |
	| eyebrow    | string                     | 'Now browsing'         |
	| topLine    | string                     | 'Queue up.'            |
	| bottomLine | string                     | 'Level up.'            |
	| active     | number (bindable)          | floor(count / 2)       |
	| onSelect   | (p: Playlist, i) => void   | undefined              |
	| theme      | 'light' \| 'dark'          | 'dark'                 |
	| class      | string                     | ''                     |

	ACCESSIBILITY
	- Hero is a real <h1> with the canonical text
	- Carousel is role="region" + aria-roledescription="carousel"
	- Active card has aria-current="true" and tabindex=0
	- Inactive cards tabindex=-1 so Tab skips them
	- ←/→/Home/End/Enter all work
	- Drag does NOT replace keyboard; both are independent

	DEPENDENCIES
	- Subcomponents: StreamShowcaseHero, StreamShowcaseCarousel
	- Types/data: types.ts, playlists.ts
	- Zero external runtime dependencies
	============================================================
-->
<script lang="ts">
	import StreamShowcaseHero from './StreamShowcaseHero.svelte';
	import StreamShowcaseCarousel from './StreamShowcaseCarousel.svelte';
	import { SAMPLE_PLAYLISTS } from './playlists';
	import type { Playlist } from './types';

	interface Props {
		playlists?: Playlist[];
		count?: number;
		eyebrow?: string;
		topLine?: string;
		bottomLine?: string;
		active?: number;
		onSelect?: (playlist: Playlist, indexInFan: number) => void;
		theme?: 'light' | 'dark';
		class?: string;
	}

	let {
		playlists = SAMPLE_PLAYLISTS,
		count = 10,
		eyebrow = 'Now browsing',
		topLine = 'Queue up.',
		bottomLine = 'Level up.',
		active = $bindable(Math.floor(count / 2)),
		onSelect,
		theme = 'dark',
		class: extraClass = ''
	}: Props = $props();
</script>

<section class="ss-root ss-{theme} {extraClass}">
	<div class="ss-glow ss-glow-1" aria-hidden="true"></div>
	<div class="ss-glow ss-glow-2" aria-hidden="true"></div>

	<StreamShowcaseHero {eyebrow} {topLine} {bottomLine} />
	<StreamShowcaseCarousel {playlists} {count} bind:active {onSelect} />
</section>

<style>
	.ss-root {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		min-height: 100vh;
		overflow: hidden;
		isolation: isolate;
	}

	.ss-dark {
		background: radial-gradient(ellipse at 50% 30%, #14111d 0%, #08070d 70%);
		color: #f4f1eb;
	}
	.ss-light {
		background: radial-gradient(ellipse at 50% 30%, #fff 0%, #f4f1eb 70%);
		color: #0f172a;
	}

	.ss-glow {
		position: absolute;
		pointer-events: none;
		filter: blur(80px);
		opacity: 0.55;
		z-index: 0;
	}
	.ss-glow-1 {
		top: 8%;
		left: 12%;
		width: 360px;
		height: 360px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, transparent 70%);
	}
	.ss-glow-2 {
		bottom: 18%;
		right: 8%;
		width: 420px;
		height: 420px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, transparent 70%);
	}
	.ss-light .ss-glow-1 {
		background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
	}
	.ss-light .ss-glow-2 {
		background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%);
	}

	/* Subcomponents stack vertically inside; section provides the canvas. */
	.ss-root :global(.ssh-hero),
	.ss-root :global(.ssc-stage) {
		position: relative;
		z-index: 1;
	}
</style>
