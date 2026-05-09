<!--
	===========================================================
	PICASSO PORTFOLIO
	===========================================================
	WHAT
	A scroll-driven editorial portfolio. Each "painting" is a grid of
	colour fields that dissect outward, then reassemble into the canvas
	as the panel scrolls into view. Title + caption fade in alongside.

	WHY
	Editorial portfolio sections, art-directed about pages, or any
	"these are my works" feature where the kinetic dissect/reassemble
	earns its place over a static gallery.

	FEATURES
	- IntersectionObserver triggers each painting's animation when it
	  scrolls into view (no ScrollTrigger plugin needed)
	- GSAP timeline drives the dissect → reassemble sequence (stagger,
	  power3.out easing) plus the title + caption fade-up
	- Each painting is a 4×4 grid of colour fields drawn from a per-
	  painting palette; the dissect spreads them outward, the reassemble
	  pulls them back into place
	- Honours prefers-reduced-motion (paints the assembled state
	  immediately, no animation)

	ACCESSIBILITY
	- Each painting wrapped in <figure> + <figcaption>
	- The grid swatches carry aria-hidden — purely decorative
	- Title is a real <h3>; caption is real <p>

	DEPENDENCIES
	`gsap` core (already a project dep) for the timeline.
	`IntersectionObserver` for the scroll trigger.

	USAGE
	<PicassoPortfolio paintings={works} />

	PROPS
	See `PicassoPortfolioProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { PicassoPortfolioProps, PicassoPainting } from '$lib/types';

	let {
		paintings,
		gridSize = 4,
		duration = 1.4,
		ariaLabel = 'Picasso portfolio',
		class: className = ''
	}: PicassoPortfolioProps = $props();

	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;
	let panelRefs: HTMLElement[] = $state([]);
	// Plain Set — only `has`/`add` lookups, no Svelte reactivity needed on its members.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const triggered = new Set<number>();

	function buildSwatches(painting: PicassoPainting): { bg: string; row: number; col: number }[] {
		const cells: { bg: string; row: number; col: number }[] = [];
		const palette = painting.palette;
		for (let r = 0; r < gridSize; r += 1) {
			for (let c = 0; c < gridSize; c += 1) {
				// Deterministic colour pick: weave through the palette by row+col
				const colour = palette[(r * gridSize + c) % palette.length];
				cells.push({ bg: colour, row: r, col: c });
			}
		}
		return cells;
	}

	function animatePanel(index: number) {
		if (triggered.has(index)) return;
		triggered.add(index);
		const panel = panelRefs[index];
		if (!panel || !gsapInstance || prefersReduced) return;
		const swatches = panel.querySelectorAll<HTMLElement>('.pp-swatch');
		const title = panel.querySelector('.pp-title');
		const caption = panel.querySelector('.pp-caption');
		// Stagger the dissect→reassemble path:
		// 1. immediately: each swatch starts displaced + transparent (handled inline below by inline transform)
		// 2. tween each back to its grid slot with stagger
		const tl = gsapInstance.timeline();
		tl.fromTo(
			swatches,
			{
				x: (i: number) => Math.cos((i * 137.5 * Math.PI) / 180) * 110,
				y: (i: number) => Math.sin((i * 137.5 * Math.PI) / 180) * 110,
				opacity: 0,
				scale: 0.4,
				rotation: (i: number) => (i % 2 === 0 ? 18 : -18)
			},
			{
				x: 0,
				y: 0,
				opacity: 1,
				scale: 1,
				rotation: 0,
				duration,
				ease: 'power3.out',
				stagger: { each: 0.04, from: 'random' }
			},
			0
		);
		if (title) tl.fromTo(title, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.45);
		if (caption) tl.fromTo(caption, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.6);
	}

	function registerPanel(node: HTMLElement, index: number) {
		panelRefs[index] = node;
		return {
			destroy() {
				panelRefs[index] = undefined as unknown as HTMLElement;
			}
		};
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Hoist the observer out of the async IIFE so the onMount cleanup
		// returned below actually disconnects it on unmount.
		let observer: IntersectionObserver | null = null;

		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced || typeof IntersectionObserver === 'undefined') return;
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							const idx = Number(entry.target.getAttribute('data-painting-index'));
							if (!Number.isNaN(idx)) animatePanel(idx);
						}
					}
				},
				{ threshold: 0.4 }
			);
			for (const panel of panelRefs) {
				if (panel) observer.observe(panel);
			}
		})();

		return () => {
			observer?.disconnect();
		};
	});
</script>

<section class="picasso-portfolio {className}" aria-label={ariaLabel}>
	{#each paintings as painting, i (painting.id)}
		<figure
			class="pp-panel"
			class:pp-panel--reduced={prefersReduced}
			data-painting-index={i}
			use:registerPanel={i}
		>
			<div
				class="pp-grid"
				style="--pp-grid-size: {gridSize};"
				aria-hidden="true"
			>
				{#each buildSwatches(painting) as cell, idx (idx)}
					<span
						class="pp-swatch"
						style="
							grid-column: {cell.col + 1};
							grid-row: {cell.row + 1};
							background: {cell.bg};
						"
					></span>
				{/each}
			</div>
			<figcaption class="pp-meta">
				{#if painting.scene}<span class="pp-scene">{painting.scene}</span>{/if}
				<h3 class="pp-title">{painting.title}</h3>
				{#if painting.caption}<p class="pp-caption">{painting.caption}</p>{/if}
			</figcaption>
		</figure>
	{/each}
</section>

<style>
	.picasso-portfolio {
		display: flex;
		flex-direction: column;
		gap: 5rem;
		padding: 2.5rem 0;
	}

	.pp-panel {
		margin: 0;
		display: grid;
		gap: 1.5rem;
		justify-items: center;
		text-align: center;
	}

	.pp-grid {
		display: grid;
		grid-template-columns: repeat(var(--pp-grid-size, 4), 64px);
		grid-template-rows: repeat(var(--pp-grid-size, 4), 64px);
		gap: 6px;
		padding: 12px;
		background: var(--pp-frame, color-mix(in srgb, currentColor 6%, transparent));
		border-radius: 8px;
		box-shadow: 0 24px 56px -24px rgba(15, 23, 42, 0.45);
	}

	.pp-swatch {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 4px;
		will-change: transform, opacity;
	}

	.pp-meta {
		display: grid;
		gap: 0.5rem;
		max-width: 560px;
	}

	.pp-scene {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--pp-muted, #94a3b8);
	}

	.pp-title {
		margin: 0;
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--pp-title-fg, #0f172a);
	}

	.pp-caption {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--pp-caption-fg, #475569);
	}

	@media (prefers-color-scheme: dark) {
		.picasso-portfolio {
			--pp-title-fg: #f1f5f9;
			--pp-caption-fg: #cbd5e1;
			--pp-muted: #94a3b8;
			--pp-frame: rgba(148, 163, 184, 0.12);
		}
	}

	:global(.dark) .picasso-portfolio {
		--pp-title-fg: #f1f5f9;
		--pp-caption-fg: #cbd5e1;
		--pp-muted: #94a3b8;
		--pp-frame: rgba(148, 163, 184, 0.12);
	}

	/* Reduced-motion fallback paints the assembled state immediately. */
	.pp-panel--reduced .pp-swatch {
		transform: none !important;
		opacity: 1 !important;
	}

	@media (max-width: 640px) {
		.pp-grid {
			grid-template-columns: repeat(var(--pp-grid-size, 4), 48px);
			grid-template-rows: repeat(var(--pp-grid-size, 4), 48px);
		}
	}
</style>
