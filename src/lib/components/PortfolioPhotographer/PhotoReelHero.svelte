<!--
	PhotoReelHero — top half of the PortfolioPhotographer showcase.

	A wireframe lens background sits behind a horizontally drifting
	reel of CSS-gradient "photo" tiles. A scatter of small Halton-
	sequence dots converges around the centre to suggest a focal
	point. Editorial display name + tagline overlay the whole thing.

	M1 only: drift + lens + scatter + copy. The lightbox modal,
	cursor 3D tilt, and real-image swap-in API are M2/M3.

	REDUCED MOTION
	- prefers-reduced-motion → drift is paused, lens rotation off,
	  scatter dots static (still positioned via Halton, just no pulse).
	- Hover-to-pause still works for everyone.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Photo } from './types';
	import { haltonPoint } from './types';

	interface Props {
		photos: Photo[];
		name?: string;
		tagline?: string;
		years?: string;
		dotCount?: number;
		/** Seconds per full reel cycle. Larger = slower drift. */
		duration?: number;
	}

	let {
		photos,
		name = 'Aria Lindqvist',
		tagline = 'photographs of light, distance, and quiet rooms',
		years = '2018 — 2026',
		dotCount = 24,
		duration = 36
	}: Props = $props();

	// Duplicate the photo set so the track tiles seamlessly when
	// translateX hits -50%. The keyframe loops back to 0% which
	// re-shows the same content because the track is 200% wide.
	const reelTrack = $derived([...photos, ...photos]);

	// Halton scatter — deterministic so server + client render the same dots.
	const scatterDots = $derived(
		Array.from({ length: dotCount }, (_, i) => {
			const p = haltonPoint(i);
			// Pull dots toward the centre using a simple ease so dense in middle, sparse at edges.
			const cx = 0.5 + (p.x - 0.5) * 0.7;
			const cy = 0.5 + (p.y - 0.5) * 0.7;
			const size = 2 + (i % 4); // 2..5px
			const delay = (i * 137) % 1800; // ms, golden-angle-ish distribution
			return { cx, cy, size, delay };
		})
	);

	let prefersReducedMotion = $state(false);
	let mounted = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const onMq = () => (prefersReducedMotion = mq.matches);
		mq.addEventListener('change', onMq);
		requestAnimationFrame(() => (mounted = true));
		return () => mq.removeEventListener('change', onMq);
	});
</script>

<header
	class="prh-stage"
	class:prh-mounted={mounted}
	class:prh-instant={prefersReducedMotion}
	style="--prh-duration: {duration}s;"
	aria-roledescription="photographer reel"
>
	<!-- Wireframe lens — purely decorative, behind everything. -->
	<svg
		class="prh-lens"
		viewBox="0 0 200 200"
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true"
	>
		<g class="prh-lens-rings">
			<circle cx="100" cy="100" r="90" />
			<circle cx="100" cy="100" r="70" />
			<circle cx="100" cy="100" r="48" />
			<circle cx="100" cy="100" r="28" />
			<circle cx="100" cy="100" r="12" />
		</g>
		<g class="prh-lens-cross">
			<line x1="0" y1="100" x2="200" y2="100" />
			<line x1="100" y1="0" x2="100" y2="200" />
			<line x1="20" y1="100" x2="34" y2="100" stroke-width="2" />
			<line x1="166" y1="100" x2="180" y2="100" stroke-width="2" />
			<line x1="100" y1="20" x2="100" y2="34" stroke-width="2" />
			<line x1="100" y1="166" x2="100" y2="180" stroke-width="2" />
		</g>
		<g class="prh-lens-marks">
			{#each Array.from({ length: 24 }, (_, i) => i) as i (i)}
				{@const angle = (i / 24) * Math.PI * 2}
				{@const x1 = 100 + Math.cos(angle) * 92}
				{@const y1 = 100 + Math.sin(angle) * 92}
				{@const x2 = 100 + Math.cos(angle) * 96}
				{@const y2 = 100 + Math.sin(angle) * 96}
				<line {x1} {y1} {x2} {y2} />
			{/each}
		</g>
	</svg>

	<!-- Halton scatter — converges toward the focal point. -->
	<div class="prh-scatter" aria-hidden="true">
		{#each scatterDots as dot, i (i)}
			<span
				class="prh-dot"
				style="
					left: {(dot.cx * 100).toFixed(2)}%;
					top: {(dot.cy * 100).toFixed(2)}%;
					width: {dot.size}px;
					height: {dot.size}px;
					animation-delay: {dot.delay}ms;
				"
			></span>
		{/each}
	</div>

	<!-- Drifting reel of photo tiles. -->
	<div class="prh-reel" aria-label="Drifting photo reel">
		<div class="prh-reel-track">
			{#each reelTrack as photo, i (i)}
				<figure
					class="prh-tile"
					style="
						--prh-from: {photo.cover.from};
						--prh-via: {photo.cover.via};
						--prh-to: {photo.cover.to};
						--prh-accent: {photo.cover.accent};
					"
					aria-hidden={i >= photos.length}
				>
					<span class="prh-tile-art" aria-hidden="true">
						<span class="prh-tile-dot"></span>
					</span>
					<figcaption class="prh-tile-caption">
						<span class="prh-tile-cat">{photo.category}</span>
						<span class="prh-tile-title">{photo.caption}</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>

	<!-- Hero typography overlay. -->
	<div class="prh-copy">
		<p class="prh-eyebrow"><span class="prh-eyebrow-dot"></span>Selected works · {years}</p>
		<h1 class="prh-name">{name}</h1>
		<p class="prh-tagline">{tagline}</p>
	</div>
</header>

<style>
	.prh-stage {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		padding: 4rem 1.5rem 3rem;
		isolation: isolate;
		overflow: hidden;
		color: inherit;
	}

	/* ---- Wireframe lens ----------------------------------------- */
	.prh-lens {
		position: absolute;
		top: 50%;
		left: 50%;
		width: min(110vh, 110vw);
		height: min(110vh, 110vw);
		transform: translate(-50%, -50%);
		z-index: 0;
		opacity: 0.18;
		stroke: currentColor;
		fill: none;
		stroke-width: 0.5;
		mix-blend-mode: lighten;
	}
	.prh-lens-rings {
		animation: prh-spin 90s linear infinite;
		transform-origin: 100px 100px;
	}
	.prh-lens-marks {
		animation: prh-spin 240s linear infinite reverse;
		transform-origin: 100px 100px;
	}
	@keyframes prh-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ---- Halton scatter ----------------------------------------- */
	.prh-scatter {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}
	.prh-dot {
		position: absolute;
		transform: translate(-50%, -50%);
		border-radius: 9999px;
		background: currentColor;
		opacity: 0.18;
		animation: prh-pulse 4.8s ease-in-out infinite;
	}
	@keyframes prh-pulse {
		0%,
		100% {
			opacity: 0.08;
			transform: translate(-50%, -50%) scale(0.8);
		}
		50% {
			opacity: 0.32;
			transform: translate(-50%, -50%) scale(1.2);
		}
	}

	/* ---- Drifting reel ------------------------------------------ */
	.prh-reel {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 100%;
		overflow: hidden;
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 12%,
			#000 88%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 12%,
			#000 88%,
			transparent 100%
		);
		padding: 1rem 0;
	}
	.prh-reel-track {
		display: flex;
		flex-wrap: nowrap;
		width: max-content;
		gap: 1rem;
		animation: prh-drift var(--prh-duration, 36s) linear infinite;
		will-change: transform;
	}
	.prh-reel:hover .prh-reel-track,
	.prh-reel:focus-within .prh-reel-track {
		animation-play-state: paused;
	}
	@keyframes prh-drift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	.prh-tile {
		position: relative;
		flex: 0 0 auto;
		width: clamp(160px, 18vw, 240px);
		aspect-ratio: 3 / 4;
		margin: 0;
		border-radius: 0.6rem;
		overflow: hidden;
		background:
			radial-gradient(
				120% 80% at 30% 10%,
				color-mix(in srgb, var(--prh-accent) 30%, transparent) 0%,
				transparent 60%
			),
			linear-gradient(
				160deg,
				var(--prh-from) 0%,
				var(--prh-via) 55%,
				var(--prh-to) 100%
			);
		box-shadow:
			0 12px 40px -16px rgba(0, 0, 0, 0.35),
			inset 0 0 0 1px color-mix(in srgb, currentColor 8%, transparent);
		transform: translateY(0) scale(1);
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.prh-tile:hover,
	.prh-tile:focus-visible {
		transform: translateY(-6px) scale(1.02);
		outline: none;
	}

	.prh-tile-art {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.prh-tile-dot {
		width: 10px;
		height: 10px;
		border-radius: 9999px;
		background: var(--prh-accent);
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--prh-accent) 40%, transparent),
			0 0 0 8px color-mix(in srgb, var(--prh-accent) 14%, transparent);
		opacity: 0.85;
	}

	.prh-tile-caption {
		position: absolute;
		left: 0.75rem;
		right: 0.75rem;
		bottom: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
		text-align: left;
		color: color-mix(in srgb, white 92%, transparent);
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
	}
	.prh-tile-cat {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	.prh-tile-title {
		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1.25;
	}

	/* ---- Hero typography ---------------------------------------- */
	.prh-copy {
		position: relative;
		z-index: 3;
		text-align: center;
		max-width: 800px;
		margin-top: 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	.prh-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		padding: 0.4rem 0.9rem;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 500;
		color: color-mix(in srgb, currentColor 75%, transparent);
		background: color-mix(in srgb, currentColor 6%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		border-radius: 9999px;
		font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
	}
	.prh-eyebrow-dot {
		display: inline-block;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: currentColor;
		opacity: 0.55;
		animation: prh-eyepulse 2.4s ease-in-out infinite;
	}
	@keyframes prh-eyepulse {
		0%,
		100% {
			opacity: 0.35;
			transform: scale(0.85);
		}
		50% {
			opacity: 0.85;
			transform: scale(1.1);
		}
	}
	.prh-name {
		margin: 0;
		font-family: ui-serif, 'Iowan Old Style', 'Times New Roman', serif;
		font-weight: 500;
		font-size: clamp(2.5rem, 7vw, 5rem);
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.prh-tagline {
		margin: 0;
		font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
		font-size: clamp(0.95rem, 1.4vw, 1.15rem);
		line-height: 1.5;
		max-width: 32ch;
		color: color-mix(in srgb, currentColor 70%, transparent);
	}

	/* ---- Reduced motion / instant ------------------------------- */
	.prh-instant .prh-reel-track {
		animation: none;
	}
	.prh-instant .prh-lens-rings,
	.prh-instant .prh-lens-marks {
		animation: none;
	}
	.prh-instant .prh-dot {
		animation: none;
		opacity: 0.18;
		transform: translate(-50%, -50%) scale(1);
	}
	.prh-instant .prh-eyebrow-dot {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.prh-reel-track,
		.prh-lens-rings,
		.prh-lens-marks,
		.prh-dot,
		.prh-eyebrow-dot {
			animation: none !important;
		}
	}

	/* ---- Mount-time deal-in ------------------------------------- */
	.prh-stage:not(.prh-mounted):not(.prh-instant) .prh-copy {
		opacity: 0;
		transform: translateY(8px);
	}
	.prh-copy {
		transition:
			opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s,
			transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
	}
</style>
