<!--
	===========================================================
	DRAG GALLERY
	===========================================================
	WHAT
	A fan-stacked product slider you can drag (mouse, touch, or trackpad)
	with momentum. Release and the deck flicks with inertia, then settles
	on the nearest card. Click a card to select it.

	WHY
	E-commerce hero carousels, photo portfolios, "next product" panels.
	Reads kinetic on hover/touch but defaults to a calm static state.

	FEATURES
	- Native pointer events (no GSAP business plugins)
	- Velocity tracking + rAF inertia decay
	- Snap-to-nearest on release
	- Keyboard parity (Arrow keys + Home/End)
	- prefers-reduced-motion: removes inertia, snaps directly

	ACCESSIBILITY
	- role="listbox" on the wrapper, role="option" on each card
	- aria-selected reflects the active card
	- Tab focuses the gallery, ArrowLeft/Right + Home/End navigate
	- Cards have visible focus rings via focus-visible

	DEPENDENCIES
	`gsap` core (already a project dep) drives the entrance card stagger and
	the snap-on-release ease (gsap.to with power3.out). Native pointer events
	+ rAF own the velocity sampling and inertia decay; gsap takes over for
	the final settle so the eased curve matches the rest of the suite.

	USAGE
	<DragGallery items={products} onSelect={(item) => …} />

	PROPS
	See `DragGalleryProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { DragGalleryProps } from '$lib/types';

	let {
		items,
		initialIndex = 0,
		cardWidth = 220,
		cardGap = 32,
		ariaLabel = 'Drag gallery',
		onSelect,
		class: className = ''
	}: DragGalleryProps = $props();

	let trackEl: HTMLDivElement | undefined = $state();
	// svelte-ignore state_referenced_locally
	let activeIndex = $state(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
	let offset = $state(0);
	let dragging = $state(false);
	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;

	let pointerStartX = 0;
	let offsetStart = 0;
	let velocity = 0;
	let lastMoveTime = 0;
	let lastMoveX = 0;
	let inertiaRaf = 0;

	const stride = $derived(cardWidth + cardGap);
	const minOffset = $derived(-(items.length - 1) * stride);

	function snapTo(index: number) {
		const clamped = Math.min(Math.max(0, index), Math.max(0, items.length - 1));
		activeIndex = clamped;
		const target = -clamped * stride;
		// GSAP-eased snap when the runtime is loaded; otherwise fall back to a
		// direct offset write (jumps to position; CSS holds the resting state).
		if (gsapInstance && !prefersReduced && Math.abs(target - offset) > 0.5) {
			gsapInstance.to(
				{ value: offset },
				{
					value: target,
					duration: 0.55,
					ease: 'power3.out',
					onUpdate() {
						offset = (this.targets()[0] as { value: number }).value;
					}
				}
			);
		} else {
			offset = target;
		}
		onSelect?.(items[clamped], clamped);
	}

	function nearestIndex(off: number): number {
		return Math.round(-off / stride);
	}

	function clampOffset(off: number): number {
		return Math.max(minOffset, Math.min(0, off));
	}

	function startInertia() {
		if (prefersReduced) {
			snapTo(nearestIndex(offset));
			return;
		}
		const tick = () => {
			if (Math.abs(velocity) < 0.5) {
				snapTo(nearestIndex(offset));
				return;
			}
			offset = clampOffset(offset + velocity);
			velocity *= 0.93;
			inertiaRaf = requestAnimationFrame(tick);
		};
		if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
		inertiaRaf = requestAnimationFrame(tick);
	}

	function handlePointerDown(event: PointerEvent) {
		if (inertiaRaf) {
			cancelAnimationFrame(inertiaRaf);
			inertiaRaf = 0;
		}
		dragging = true;
		pointerStartX = event.clientX;
		offsetStart = offset;
		lastMoveTime = event.timeStamp;
		lastMoveX = event.clientX;
		velocity = 0;
		(event.target as Element).setPointerCapture?.(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		const dx = event.clientX - pointerStartX;
		offset = clampOffset(offsetStart + dx);
		const dt = event.timeStamp - lastMoveTime;
		if (dt > 0) {
			velocity = ((event.clientX - lastMoveX) / dt) * 16;
		}
		lastMoveTime = event.timeStamp;
		lastMoveX = event.clientX;
	}

	function handlePointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		(event.target as Element).releasePointerCapture?.(event.pointerId);
		startInertia();
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				snapTo(activeIndex - 1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				snapTo(activeIndex + 1);
				break;
			case 'Home':
				event.preventDefault();
				snapTo(0);
				break;
			case 'End':
				event.preventDefault();
				snapTo(items.length - 1);
				break;
		}
	}

	function handleCardClick(index: number) {
		if (Math.abs(velocity) > 1 || dragging) return;
		snapTo(index);
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		offset = -activeIndex * stride;
		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced) return;
			// Entrance: stagger the cards in via gsap.from so the deck arrives
			// already kinetic instead of static.
			const cards = document.querySelectorAll<HTMLElement>('.drag-gallery .dg-card');
			if (cards.length > 0) {
				gsapInstance.from(cards, {
					y: 20,
					opacity: 0,
					duration: 0.55,
					ease: 'power3.out',
					stagger: 0.05
				});
			}
		})();
		return () => {
			if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
		};
	});
</script>

<div
	class="drag-gallery {className}"
	class:drag-gallery--dragging={dragging}
	role="listbox"
	aria-label={ariaLabel}
	tabindex="0"
	onkeydown={handleKeydown}
	style="--card-width: {cardWidth}px; --card-gap: {cardGap}px;"
>
	<div
		bind:this={trackEl}
		class="dg-track"
		style="transform: translate3d({offset}px, 0, 0);"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		{#each items as item, i (item.id)}
			{@const distance = i - activeIndex}
			<button
				type="button"
				class="dg-card"
				class:dg-card--active={i === activeIndex}
				role="option"
				aria-selected={i === activeIndex}
				aria-label={item.title}
				onclick={() => handleCardClick(i)}
				style="
					--distance: {distance};
					--rotate: {distance * 4}deg;
					--scale: {i === activeIndex ? 1 : 0.92};
					--opacity: {Math.max(0.35, 1 - Math.abs(distance) * 0.18)};
				"
			>
				{#if item.image}
					<img class="dg-card-image" src={item.image} alt={item.alt ?? item.title} />
				{:else}
					<span class="dg-card-placeholder" aria-hidden="true"></span>
				{/if}
				<span class="dg-card-meta">
					{#if item.eyebrow}<span class="dg-eyebrow">{item.eyebrow}</span>{/if}
					<span class="dg-title">{item.title}</span>
					{#if item.subtitle}<span class="dg-subtitle">{item.subtitle}</span>{/if}
				</span>
			</button>
		{/each}
	</div>
	<div class="dg-controls" aria-hidden="true">
		<span class="dg-position">{activeIndex + 1} / {items.length}</span>
	</div>
</div>

<style>
	.drag-gallery {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem 0;
		overflow: hidden;
		outline: none;
		touch-action: pan-y;
	}

	.drag-gallery:focus-visible {
		outline: 2px solid var(--dg-focus, #146ef5);
		outline-offset: 4px;
		border-radius: 8px;
	}

	.dg-track {
		display: flex;
		gap: var(--card-gap, 32px);
		padding: 0 calc(50% - var(--card-width, 220px) / 2);
		will-change: transform;
		cursor: grab;
		user-select: none;
	}

	.drag-gallery--dragging .dg-track {
		cursor: grabbing;
	}

	.dg-card {
		flex: 0 0 var(--card-width, 220px);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 12px;
		background: var(--dg-card-bg, #ffffff);
		color: var(--dg-card-fg, #0f172a);
		cursor: pointer;
		transform: rotate(var(--rotate, 0)) scale(var(--scale, 1));
		opacity: var(--opacity, 1);
		transition: transform 0.45s cubic-bezier(0.16, 0.84, 0.32, 1),
			opacity 0.45s ease, box-shadow 0.3s ease;
		text-align: left;
		font: inherit;
	}

	.dg-card:focus-visible {
		outline: 2px solid var(--dg-focus, #146ef5);
		outline-offset: 2px;
	}

	.dg-card--active {
		box-shadow: 0 24px 48px -16px rgba(15, 23, 42, 0.25);
	}

	.dg-card-image {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		border-radius: 8px;
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	.dg-card-placeholder {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, currentColor 12%, transparent),
			color-mix(in srgb, currentColor 4%, transparent)
		);
	}

	.dg-card-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.dg-eyebrow {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--dg-muted, #64748b);
	}

	.dg-title {
		font-size: 0.9375rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dg-subtitle {
		font-size: 0.8125rem;
		color: var(--dg-muted, #64748b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dg-controls {
		display: flex;
		justify-content: center;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: var(--dg-muted, #64748b);
		letter-spacing: 0.06em;
	}

	@media (prefers-color-scheme: dark) {
		.drag-gallery {
			--dg-card-bg: #0f172a;
			--dg-card-fg: #e2e8f0;
			--dg-muted: #94a3b8;
			--dg-focus: #60a5fa;
		}
	}

	:global(.dark) .drag-gallery {
		--dg-card-bg: #0f172a;
		--dg-card-fg: #e2e8f0;
		--dg-muted: #94a3b8;
		--dg-focus: #60a5fa;
	}

	@media (prefers-reduced-motion: reduce) {
		.dg-card,
		.dg-track {
			transition: none !important;
		}
	}
</style>
