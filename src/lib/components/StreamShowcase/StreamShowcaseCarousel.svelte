<!--
	StreamShowcaseCarousel — fan layout with click/drag/keyboard control.

	Renders `count` cards (default 10) arranged around a shared pivot
	point below the deck so they splay out like a hand of cards. Source
	playlists are looped — passing 5 unique playlists with count=10 will
	repeat each playlist twice.

	Active card is full-colour at z-30; side cards progressively
	desaturate and shrink. Click any side card to bring it to centre.
	Drag horizontally to rotate the whole fan; release to snap to the
	nearest card. Keyboard ←/→/Home/End/Enter all wired.

	NO modal, NO video, NO URL sync — those land in M2/M3.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Playlist } from './types';
	import { fanAngle, wrapIndex } from './types';

	interface Props {
		playlists: Playlist[];
		count?: number;
		active?: number;
		spread?: number;
		pivotOffset?: number;
		onActiveChange?: (next: number) => void;
		onSelect?: (playlist: Playlist, indexInFan: number) => void;
	}

	let {
		playlists,
		count = 10,
		active = $bindable(0),
		spread = 5,
		pivotOffset = 720,
		onActiveChange,
		onSelect
	}: Props = $props();

	// Fan cards: looped slice of playlists, length === count.
	const fanCards = $derived(
		Array.from({ length: count }, (_, i) => playlists[i % playlists.length] ?? playlists[0])
	);

	let internalActive = $state(
		untrack(() => Math.min(Math.max(0, Math.floor(count / 2)), count - 1))
	);
	$effect(() => {
		// keep `active` and internalActive in sync (one-way: prop → internal).
		if (active !== internalActive) internalActive = active;
	});

	let dragRotation = $state(0); // deg, current preview rotation while dragging
	let dragging = $state(false);
	let dragStartX = 0;
	let dragStartId: number | null = null;
	let prefersReducedMotion = $state(false);
	let mounted = $state(false);
	let cardEls = $state<(HTMLButtonElement | null)[]>([]);
	let containerEl: HTMLElement | undefined;

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const onMq = () => (prefersReducedMotion = mq.matches);
		mq.addEventListener('change', onMq);
		requestAnimationFrame(() => (mounted = true));
		return () => mq.removeEventListener('change', onMq);
	});

	function setActive(next: number) {
		const wrapped = wrapIndex(next, count);
		if (wrapped === internalActive) return;
		internalActive = wrapped;
		active = wrapped;
		onActiveChange?.(wrapped);
		// Move keyboard focus to the now-active card so screen-reader / tab order tracks visually.
		queueMicrotask(() => cardEls[wrapped]?.focus({ preventScroll: true }));
	}

	function handleCardClick(i: number) {
		if (i !== internalActive) {
			setActive(i);
			return;
		}
		const playlist = fanCards[i];
		if (playlist) onSelect?.(playlist, i);
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowRight':
				e.preventDefault();
				setActive(internalActive + 1);
				break;
			case 'ArrowLeft':
				e.preventDefault();
				setActive(internalActive - 1);
				break;
			case 'Home':
				e.preventDefault();
				setActive(0);
				break;
			case 'End':
				e.preventDefault();
				setActive(count - 1);
				break;
			case 'Enter':
			case ' ': {
				e.preventDefault();
				const playlist = fanCards[internalActive];
				if (playlist) onSelect?.(playlist, internalActive);
				break;
			}
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return; // primary button only
		if (prefersReducedMotion) return; // no drag-rotate in reduced motion
		const target = e.currentTarget as HTMLElement;
		dragStartId = e.pointerId;
		dragStartX = e.clientX;
		dragRotation = 0;
		dragging = true;
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// ignore — older browsers without pointer capture API
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || dragStartId !== e.pointerId) return;
		// Map horizontal movement to fan rotation. 240px ≈ 1 spread step.
		dragRotation = ((e.clientX - dragStartX) / 240) * spread;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragging || dragStartId !== e.pointerId) return;
		const target = e.currentTarget as HTMLElement;
		try {
			target.releasePointerCapture(e.pointerId);
		} catch {
			// noop
		}
		// Decide snap: every full `spread` of drag advances by 1.
		const steps = Math.round(-dragRotation / spread);
		if (steps !== 0) setActive(internalActive + steps);
		dragRotation = 0;
		dragging = false;
		dragStartId = null;
	}

	function handlePointerCancel() {
		dragRotation = 0;
		dragging = false;
		dragStartId = null;
	}

	function transformFor(i: number): string {
		const baseAngle = fanAngle(i, internalActive, spread);
		const angle = baseAngle + dragRotation;
		const dist = Math.abs(i - internalActive);
		const scale = 1 - dist * 0.05;
		return `rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
	}

	function styleFor(i: number): string {
		const dist = Math.abs(i - internalActive);
		const grayscale = Math.min(0.65, dist * 0.18);
		const brightness = 1 - dist * 0.06;
		const opacity = Math.max(0.45, 1 - dist * 0.08);
		const z = 30 - dist;
		return `filter: grayscale(${grayscale}) brightness(${brightness}); opacity: ${opacity}; z-index: ${z};`;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="ssc-stage"
	class:ssc-mounted={mounted}
	class:ssc-dragging={dragging}
	class:ssc-instant={prefersReducedMotion}
	role="region"
	aria-label="Playlist fan carousel"
	aria-roledescription="carousel"
	bind:this={containerEl}
	onkeydown={handleKeydown}
>
	<div
		class="ssc-fan"
		style="--ssc-pivot-offset: {pivotOffset}px;"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
	>
		{#each fanCards as playlist, i (i)}
			{@const isActive = i === internalActive}
			<button
				type="button"
				class="ssc-card"
				class:ssc-card-active={isActive}
				bind:this={cardEls[i]}
				style="
					transform: {transformFor(i)};
					{styleFor(i)};
					transition-delay: {mounted ? '0ms' : `${i * 60}ms`};
					--ssc-from: {playlist.cover.from};
					--ssc-to: {playlist.cover.to};
					--ssc-accent: {playlist.cover.accent};
				"
				aria-current={isActive ? 'true' : undefined}
				aria-label="{playlist.title} — {playlist.tag}, {playlist.episodeCount} episodes"
				tabindex={isActive ? 0 : -1}
				onclick={() => handleCardClick(i)}
			>
				<span class="ssc-card-art" aria-hidden="true">
					<span class="ssc-card-art-noise"></span>
					<span class="ssc-card-art-glow"></span>
				</span>
				<span class="ssc-card-meta">
					<span class="ssc-card-tag">{playlist.tag}</span>
					<span class="ssc-card-title">{playlist.title}</span>
					<span class="ssc-card-count">{playlist.episodeCount} episodes</span>
				</span>
				<span class="ssc-card-edge"></span>
			</button>
		{/each}
	</div>

	<div class="ssc-controls" aria-hidden="true">
		<button
			type="button"
			class="ssc-arrow"
			onclick={() => setActive(internalActive - 1)}
			aria-label="Previous playlist"
			tabindex="-1"
		>
			<svg viewBox="0 0 24 24" width="18" height="18">
				<path
					d="M15 6l-6 6 6 6"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
		<span class="ssc-counter">
			{internalActive + 1} <span>/</span> {count}
		</span>
		<button
			type="button"
			class="ssc-arrow"
			onclick={() => setActive(internalActive + 1)}
			aria-label="Next playlist"
			tabindex="-1"
		>
			<svg viewBox="0 0 24 24" width="18" height="18">
				<path
					d="M9 6l6 6-6 6"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>

	<p class="ssc-hint" aria-hidden="true">
		<kbd>←</kbd> <kbd>→</kbd> to browse · <kbd>Enter</kbd> to select · drag to spin
	</p>
</div>

<style>
	.ssc-stage {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 50vh;
		padding: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 4vw, 1.5rem) clamp(2rem, 6vw, 4rem);
		color: inherit;
		overflow: hidden;
	}

	.ssc-fan {
		position: relative;
		width: clamp(220px, 28vw, 280px);
		height: clamp(300px, 42vw, 380px);
		margin-top: 1rem;
		touch-action: pan-y;
		cursor: grab;
	}
	.ssc-dragging .ssc-fan {
		cursor: grabbing;
	}

	.ssc-card {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1.25rem;
		text-align: left;
		font: inherit;
		color: inherit;
		background: linear-gradient(155deg, var(--ssc-from) 0%, var(--ssc-to) 100%);
		border-radius: 1rem;
		border: 1px solid color-mix(in srgb, #fff 12%, transparent);
		box-shadow:
			0 30px 60px -25px color-mix(in srgb, var(--ssc-from) 80%, transparent),
			0 4px 12px -4px color-mix(in srgb, var(--ssc-from) 40%, transparent);
		transform-origin: 50% calc(100% + var(--ssc-pivot-offset));
		transform: rotate(0) scale(1);
		transition:
			transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 600ms ease,
			opacity 600ms ease,
			box-shadow 600ms ease,
			z-index 0s 300ms;
		cursor: pointer;
		overflow: hidden;
		/* Initial hidden state for the deal-out entrance. */
		opacity: 0 !important;
	}
	.ssc-mounted .ssc-card {
		opacity: 1 !important;
	}
	.ssc-dragging .ssc-card {
		transition-duration: 0ms !important;
	}

	.ssc-card-active {
		box-shadow:
			0 36px 80px -20px color-mix(in srgb, var(--ssc-from) 90%, transparent),
			0 8px 20px -4px color-mix(in srgb, var(--ssc-from) 40%, transparent);
	}

	.ssc-card-art {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: screen;
	}
	.ssc-card-art-noise {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				circle at 20% 25%,
				color-mix(in srgb, var(--ssc-accent) 30%, transparent) 0%,
				transparent 45%
			),
			radial-gradient(
				circle at 80% 80%,
				color-mix(in srgb, var(--ssc-accent) 18%, transparent) 0%,
				transparent 45%
			);
		opacity: 0.7;
	}
	.ssc-card-art-glow {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			transparent 0%,
			color-mix(in srgb, #000 35%, transparent) 100%
		);
	}

	.ssc-card-meta {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		z-index: 2;
	}
	.ssc-card-tag {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ssc-accent);
		opacity: 0.9;
	}
	.ssc-card-title {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.1;
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
	.ssc-card-count {
		font-size: 0.75rem;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}
	.ssc-card-edge {
		position: absolute;
		inset: auto 1rem 1rem auto;
		width: 1.75rem;
		height: 1.75rem;
		background: color-mix(in srgb, #fff 18%, transparent);
		border: 1px solid color-mix(in srgb, #fff 25%, transparent);
		border-radius: 9999px;
		pointer-events: none;
	}
	.ssc-card-edge::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-30%, -50%);
		border-left: 7px solid #fff;
		border-top: 5px solid transparent;
		border-bottom: 5px solid transparent;
	}

	.ssc-controls {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.5rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, currentColor 65%, transparent);
	}
	.ssc-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		background: color-mix(in srgb, currentColor 6%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 9999px;
		color: inherit;
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
	}
	.ssc-arrow:hover {
		background: color-mix(in srgb, currentColor 12%, transparent);
		border-color: color-mix(in srgb, currentColor 22%, transparent);
		transform: scale(1.05);
	}
	.ssc-counter {
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
	}
	.ssc-counter span {
		opacity: 0.4;
		margin: 0 0.15rem;
	}

	.ssc-hint {
		margin: 1.25rem 0 0;
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: color-mix(in srgb, currentColor 55%, transparent);
	}
	.ssc-hint kbd {
		display: inline-block;
		padding: 0.1rem 0.4rem;
		margin: 0 0.1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.7rem;
		background: color-mix(in srgb, currentColor 8%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
		border-radius: 0.3rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.ssc-card {
			transition: filter 0.2s ease, opacity 0.2s ease !important;
		}
	}
</style>
