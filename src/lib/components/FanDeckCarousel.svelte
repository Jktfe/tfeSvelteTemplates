<script lang="ts" module>
	export interface FanDeckItem {
		title: string;
		eyebrow?: string;
		description: string;
		tone?: string;
	}

	export interface DeckTransform {
		x: number;
		y: number;
		rotation: number;
		scale: number;
		opacity: number;
		zIndex: number;
	}

	export function normalizeIndex(index: number, total: number): number {
		if (total <= 0) return 0;
		return ((index % total) + total) % total;
	}

	export function deckTransform(index: number, selectedIndex: number, total: number): DeckTransform {
		const half = total / 2;
		let offset = index - selectedIndex;
		if (offset > half) offset -= total;
		if (offset < -half) offset += total;
		const clamped = Math.max(-4, Math.min(4, offset));

		return {
			x: clamped * 74,
			y: Math.abs(clamped) * 16,
			rotation: clamped * 8,
			scale: index === selectedIndex ? 1 : Math.max(0.74, 0.92 - Math.abs(clamped) * 0.04),
			opacity: Math.abs(offset) > 4 ? 0 : Math.max(0.32, 1 - Math.abs(clamped) * 0.13),
			zIndex: 100 - Math.abs(clamped)
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion, type Gsap } from '$lib/gsapMotion';

	interface Props {
		items?: FanDeckItem[];
		class?: string;
		initialIndex?: number;
	}

	const fallbackItems: FanDeckItem[] = [
		{
			eyebrow: 'Reveal',
			title: 'Sequence',
			description: 'Staggered entry timelines for hero copy, controls, and cards.',
			tone: '#2563eb'
		},
		{
			eyebrow: 'Text',
			title: 'Shock',
			description: 'Letter-level impact motion with variable-weight styling.',
			tone: '#db2777'
		},
		{
			eyebrow: 'Canvas',
			title: 'Kinetic',
			description: 'Pointer trails, click bursts, and bounded particle fields.',
			tone: '#0891b2'
		},
		{
			eyebrow: 'Deck',
			title: 'Fan',
			description: 'Generic content carousel with physical fan spacing.',
			tone: '#ea580c'
		}
	];

	let { items = fallbackItems, class: className = '', initialIndex = 0 }: Props = $props();

	let selectedIndex = $state(0);
	let gsapInstance: Gsap | null = null;
	let cards: Array<HTMLElement | undefined> = [];
	const selected = $derived(items[selectedIndex]);

	function cardRef(node: HTMLElement, index: number) {
		cards[index] = node;

		return {
			destroy() {
				if (cards[index] === node) {
					cards[index] = undefined;
				}
			}
		};
	}

	function animateDeck() {
		if (!gsapInstance || prefersReducedMotion()) return;
		for (const [index, card] of cards.entries()) {
			if (!card) continue;
			const transform = deckTransform(index, selectedIndex, items.length);
			gsapInstance.to(card, {
				x: transform.x,
				y: transform.y,
				rotation: transform.rotation,
				scale: transform.scale,
				opacity: transform.opacity,
				zIndex: transform.zIndex,
				duration: 0.55,
				ease: 'power3.out'
			});
		}
	}

	function select(index: number) {
		selectedIndex = normalizeIndex(index, items.length);
		animateDeck();
	}

	function next() {
		select(selectedIndex + 1);
	}

	function previous() {
		select(selectedIndex - 1);
	}

	onMount(() => {
		let cancelled = false;

		void (async () => {
			const gsap = await loadGsap();
			if (cancelled) return;
			gsapInstance = gsap;
			selectedIndex = normalizeIndex(initialIndex, items.length);
			animateDeck();
		})();

		return () => {
			cancelled = true;
			if (gsapInstance) gsapInstance.killTweensOf(cards.filter((card): card is HTMLElement => Boolean(card)));
		};
	});
</script>

<section
	class={`fan-deck-carousel ${className}`}
	aria-label="GSAP fan deck carousel"
>
	<div class="deck-stage">
		{#each items as item, index (item.title)}
			{@const transform = deckTransform(index, selectedIndex, items.length)}
			<button
				use:cardRef={index}
				type="button"
				class:selected={index === selectedIndex}
				class="deck-card"
				style="
					--tone: {item.tone ?? '#2563eb'};
					transform: translate({transform.x}px, {transform.y}px) rotate({transform.rotation}deg) scale({transform.scale});
					opacity: {transform.opacity};
					z-index: {transform.zIndex};
				"
				aria-pressed={index === selectedIndex}
				onclick={() => select(index)}
			>
				<span>{item.eyebrow ?? `Item ${index + 1}`}</span>
				<strong>{item.title}</strong>
				<small>{item.description}</small>
			</button>
		{/each}
	</div>

	<div class="deck-copy" aria-live="polite">
		<p>{selected?.eyebrow}</p>
		<h3>{selected?.title}</h3>
		<span>{selected?.description}</span>
	</div>

	<div class="deck-controls">
		<button type="button" onclick={previous} aria-label="Previous fan deck item">←</button>
		<button type="button" onclick={next} aria-label="Next fan deck item">→</button>
	</div>
</section>

<style>
	.fan-deck-carousel {
		width: 100%;
		display: grid;
		gap: 1.25rem;
		justify-items: center;
		overflow: hidden;
		color: #101828;
	}

	.deck-stage {
		position: relative;
		width: min(100%, 720px);
		height: 310px;
		display: grid;
		place-items: center;
		overflow: hidden;
		contain: paint;
		perspective: 1200px;
	}

	.deck-card {
		position: absolute;
		width: min(220px, 56vw);
		aspect-ratio: 0.72;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 0.45rem;
		padding: 1rem;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 8px;
		background: linear-gradient(150deg, color-mix(in srgb, var(--tone), white 18%), #ffffff 56%);
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
		color: #111827;
		text-align: left;
		transform-origin: 50% 100%;
		cursor: pointer;
		will-change: transform, opacity;
	}

	.deck-card.selected {
		border-color: color-mix(in srgb, var(--tone), black 12%);
		box-shadow: 0 28px 70px rgba(15, 23, 42, 0.22);
	}

	.deck-card span {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--tone), black 24%);
	}

	.deck-card strong {
		font-size: 1.6rem;
		line-height: 1;
	}

	.deck-card small {
		font-size: 0.82rem;
		line-height: 1.35;
		color: #475569;
	}

	.deck-copy {
		max-width: 520px;
		text-align: center;
	}

	.deck-copy p,
	.deck-copy h3,
	.deck-copy span {
		margin: 0;
	}

	.deck-copy p {
		color: #2563eb;
		font-size: 0.78rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.deck-copy h3 {
		font-size: clamp(1.6rem, 4vw, 2.4rem);
	}

	.deck-copy span {
		display: block;
		color: #475569;
		line-height: 1.5;
	}

	.deck-controls {
		display: flex;
		gap: 0.75rem;
	}

	.deck-controls button {
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid #d7deea;
		border-radius: 999px;
		background: #ffffff;
		color: #111827;
		font-size: 1.25rem;
		cursor: pointer;
	}

	@media (prefers-reduced-motion: reduce) {
		.deck-card {
			transition: none;
		}
	}

	@media (max-width: 760px) {
		.deck-stage {
			height: 280px;
		}

		.deck-card {
			width: min(190px, 52vw);
		}
	}
</style>
