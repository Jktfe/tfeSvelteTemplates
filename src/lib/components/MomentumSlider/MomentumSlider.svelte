<!--
	===========================================================
	MOMENTUM SLIDER
	===========================================================
	WHAT
	An editorial 3D carousel: horizontal cards with perspective depth,
	momentum scrolling on drag, and a modal handshake that expands the
	active card into a centred overlay when clicked.

	WHY
	Editorial product showcases, hero "scenes" rotators, and gallery-grade
	portfolio pages — anywhere you want a single arresting deck the user
	can flick through and dive into.

	FEATURES
	- Native pointer drag + rAF momentum decay (no GSAP business plugins
	  required for the inertia)
	- GSAP timeline drives the modal handshake (card → expanded overlay
	  + backdrop fade) with `power3.out` ease
	- Perspective depth: each card scales/rotates based on its distance
	  from the active index
	- Snap-to-nearest on release with eased `gsap.to`
	- Keyboard parity: ArrowLeft/Right + Home/End + Enter to expand,
	  Escape to close
	- Honours prefers-reduced-motion (snaps directly, no momentum, no
	  modal scale-in)

	ACCESSIBILITY
	- role="region" on the wrapper; aria-roledescription="carousel"
	- Each card is a <button> with aria-label = title
	- Modal overlay is role="dialog" aria-modal="true" with focus trap
	- Backdrop click + Escape close the modal

	DEPENDENCIES
	`gsap` core (already a project dep) for snap easing + the modal
	handshake timeline. Native pointer events + rAF for the velocity
	sampling and inertia decay.

	USAGE
	<MomentumSlider items={scenes} />

	PROPS
	See `MomentumSliderProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { MomentumSliderProps, MomentumSliderItem } from '$lib/types';

	let {
		items,
		initialIndex = 0,
		cardWidth = 280,
		cardGap = 32,
		ariaLabel = 'Momentum slider',
		onSelect,
		onExpand,
		class: className = ''
	}: MomentumSliderProps = $props();

	let trackEl: HTMLDivElement | undefined = $state();
	let modalEl: HTMLDivElement | undefined = $state();
	let backdropEl: HTMLDivElement | undefined = $state();
	let lastFocusedEl: HTMLElement | null = null;
	// svelte-ignore state_referenced_locally
	let activeIndex = $state(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
	let offset = $state(0);
	let dragging = $state(false);
	let expanded = $state<MomentumSliderItem | null>(null);
	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;
	let dragStartX = 0;
	let offsetStart = 0;
	let velocity = 0;
	let lastMoveTime = 0;
	let lastMoveX = 0;
	let inertiaRaf = 0;

	const stride = $derived(cardWidth + cardGap);
	const minOffset = $derived(-(items.length - 1) * stride);

	function clampOffset(off: number): number {
		return Math.max(minOffset, Math.min(0, off));
	}

	function nearestIndex(off: number): number {
		return Math.round(-off / stride);
	}

	function snapTo(index: number) {
		const clamped = Math.min(Math.max(0, index), Math.max(0, items.length - 1));
		activeIndex = clamped;
		const target = -clamped * stride;
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
		dragStartX = event.clientX;
		offsetStart = offset;
		lastMoveTime = event.timeStamp;
		lastMoveX = event.clientX;
		velocity = 0;
		(event.target as Element).setPointerCapture?.(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		const dx = event.clientX - dragStartX;
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

	function expand(index: number) {
		if (Math.abs(velocity) > 1 || dragging) return;
		const item = items[index];
		// Capture the invoking element so close() can restore focus.
		lastFocusedEl = (typeof document !== 'undefined'
			? (document.activeElement as HTMLElement | null)
			: null);
		expanded = item;
		onExpand?.(item, index);
		// Modal handshake: backdrop fade + modal scale-in via gsap timeline.
		// Focus the close button on mount so keyboard users land inside the dialog.
		requestAnimationFrame(() => {
			if (!modalEl) return;
			const closeBtn = modalEl.querySelector<HTMLButtonElement>('.ms-modal-close');
			closeBtn?.focus();
			if (gsapInstance && !prefersReduced && backdropEl) {
				const tl = gsapInstance.timeline();
				tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
				tl.fromTo(
					modalEl,
					{ scale: 0.92, opacity: 0, y: 12 },
					{ scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
					0.05
				);
			}
		});
	}

	function handleDialogKeydown(event: KeyboardEvent) {
		// Escape closes the modal whether the focus is on the close button,
		// inside the modal body, or on the dialog itself.
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}
		// Tab cycles inside the modal — focus never escapes back to the deck.
		if (!modalEl || event.key !== 'Tab') return;
		const focusable = modalEl.querySelectorAll<HTMLElement>(
			'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;
		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	function close() {
		const restoreFocus = () => {
			lastFocusedEl?.focus?.();
			lastFocusedEl = null;
		};
		if (!gsapInstance || prefersReduced) {
			expanded = null;
			requestAnimationFrame(restoreFocus);
			return;
		}
		const localBackdrop = backdropEl;
		const localModal = modalEl;
		const tl = gsapInstance.timeline({
			onComplete: () => {
				expanded = null;
				requestAnimationFrame(restoreFocus);
			}
		});
		if (localModal) tl.to(localModal, { scale: 0.95, opacity: 0, y: 8, duration: 0.3, ease: 'power2.in' }, 0);
		if (localBackdrop) tl.to(localBackdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.05);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (expanded) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			}
			return;
		}
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
			case 'Enter':
				event.preventDefault();
				expand(activeIndex);
				break;
		}
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		offset = -activeIndex * stride;
		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced) return;
			const cards = document.querySelectorAll<HTMLElement>('.momentum-slider .ms-card');
			if (cards.length > 0) {
				gsapInstance.from(cards, {
					y: 24,
					opacity: 0,
					duration: 0.6,
					ease: 'power3.out',
					stagger: 0.06
				});
			}
		})();
		return () => {
			if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- The carousel wrapper is keyboard-interactive (Arrow keys / Home/End /
     Enter to expand / Escape to close). role="region" + aria-roledescription
     keeps the semantic anchor; tabindex enables focus for keydown. -->
<div
	class="momentum-slider {className}"
	class:momentum-slider--dragging={dragging}
	role="region"
	aria-roledescription="carousel"
	aria-label={ariaLabel}
	tabindex="0"
	onkeydown={handleKeydown}
	style="--card-width: {cardWidth}px; --card-gap: {cardGap}px;"
>
	<div
		bind:this={trackEl}
		class="ms-track"
		style="transform: translate3d({offset}px, 0, 0);"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		{#each items as item, i (item.id)}
			{@const distance = i - activeIndex}
			{@const absDist = Math.abs(distance)}
			<button
				type="button"
				class="ms-card"
				class:ms-card--active={i === activeIndex}
				aria-label={item.title}
				aria-current={i === activeIndex ? 'true' : undefined}
				onclick={() => (i === activeIndex ? expand(i) : snapTo(i))}
				style="
					--rotate: {distance * -8}deg;
					--scale: {Math.max(0.78, 1 - absDist * 0.06)};
					--opacity: {Math.max(0.35, 1 - absDist * 0.18)};
					--shadow-strength: {i === activeIndex ? 1 : 0};
				"
			>
				{#if item.image}
					<img class="ms-card-image" src={item.image} alt={item.alt ?? item.title} />
				{:else}
					<span
						class="ms-card-placeholder"
						aria-hidden="true"
						style={item.color ? `--ms-tint: ${item.color};` : ''}
					></span>
				{/if}
				<span class="ms-card-meta">
					{#if item.eyebrow}<span class="ms-eyebrow">{item.eyebrow}</span>{/if}
					<span class="ms-title">{item.title}</span>
					{#if item.subtitle}<span class="ms-subtitle">{item.subtitle}</span>{/if}
				</span>
			</button>
		{/each}
	</div>

	<div class="ms-readout" aria-live="polite">{activeIndex + 1} / {items.length}</div>
</div>

{#if expanded}
	<div bind:this={backdropEl} class="ms-backdrop" onclick={close} aria-hidden="true"></div>
	<div
		bind:this={modalEl}
		class="ms-modal"
		role="dialog"
		aria-modal="true"
		aria-label={expanded.title}
		onkeydown={handleDialogKeydown}
		tabindex="-1"
	>
		{#if expanded.image}
			<img class="ms-modal-image" src={expanded.image} alt={expanded.alt ?? expanded.title} />
		{:else}
			<div
				class="ms-modal-placeholder"
				aria-hidden="true"
				style={expanded.color ? `--ms-tint: ${expanded.color};` : ''}
			></div>
		{/if}
		<div class="ms-modal-meta">
			{#if expanded.eyebrow}<p class="ms-modal-eyebrow">{expanded.eyebrow}</p>{/if}
			<h3 class="ms-modal-title">{expanded.title}</h3>
			{#if expanded.description}<p class="ms-modal-text">{expanded.description}</p>{/if}
			<button type="button" class="ms-modal-close" onclick={close}>Close</button>
		</div>
	</div>
{/if}

<style>
	.momentum-slider {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 2rem 0;
		perspective: 1200px;
		outline: none;
		touch-action: pan-y;
		/* Container the track inside the wrapper width so the flex track
		   doesn't grow to content-width and push the active card off-screen
		   on narrow viewports. */
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}

	.momentum-slider:focus-visible {
		outline: 2px solid var(--ms-focus, #146ef5);
		outline-offset: 4px;
		border-radius: 8px;
	}

	.ms-track {
		display: flex;
		gap: var(--card-gap, 32px);
		padding: 0 calc(50% - var(--card-width, 280px) / 2);
		transform-style: preserve-3d;
		cursor: grab;
		user-select: none;
	}

	.momentum-slider--dragging .ms-track {
		cursor: grabbing;
	}

	.ms-card {
		flex: 0 0 var(--card-width, 280px);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		border-radius: 14px;
		background: var(--ms-card-bg, #fefefe);
		color: var(--ms-card-fg, #0f172a);
		transform: rotateY(var(--rotate, 0)) scale(var(--scale, 1));
		transform-origin: center center;
		opacity: var(--opacity, 1);
		box-shadow: 0 calc(28px * var(--shadow-strength, 0)) 64px -20px rgba(15, 23, 42, 0.32);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.ms-card:focus-visible {
		outline: 2px solid var(--ms-focus, #146ef5);
		outline-offset: 2px;
	}

	.ms-card-image,
	.ms-card-placeholder {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		border-radius: 10px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--ms-tint, currentColor) 18%, transparent),
			color-mix(in srgb, var(--ms-tint, currentColor) 6%, transparent)
		);
		object-fit: cover;
	}

	.ms-card-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.ms-eyebrow {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ms-muted, #64748b);
	}

	.ms-title {
		font-size: 1rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ms-subtitle {
		font-size: 0.8125rem;
		color: var(--ms-muted, #64748b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ms-readout {
		text-align: center;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: var(--ms-muted, #64748b);
		letter-spacing: 0.06em;
	}

	.ms-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(7, 8, 16, 0.7);
		opacity: 0;
		cursor: pointer;
	}

	.ms-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 1001;
		width: min(560px, calc(100vw - 2rem));
		max-height: calc(100vh - 2rem);
		overflow: auto;
		transform: translate(-50%, -50%);
		background: var(--ms-card-bg, #ffffff);
		color: var(--ms-card-fg, #0f172a);
		border-radius: 16px;
		box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.45);
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
		opacity: 0;
	}

	.ms-modal-image,
	.ms-modal-placeholder {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 12px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--ms-tint, currentColor) 25%, transparent),
			color-mix(in srgb, var(--ms-tint, currentColor) 8%, transparent)
		);
	}

	.ms-modal-meta {
		display: grid;
		gap: 0.5rem;
	}

	.ms-modal-eyebrow {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ms-muted, #64748b);
	}

	.ms-modal-title {
		margin: 0;
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.ms-modal-text {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--ms-muted, #64748b);
	}

	.ms-modal-close {
		justify-self: end;
		padding: 0.5rem 0.875rem;
		border-radius: 8px;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.ms-modal-close:focus-visible {
		outline: 2px solid var(--ms-focus, #146ef5);
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.momentum-slider,
		.ms-modal {
			--ms-card-bg: #0f172a;
			--ms-card-fg: #e2e8f0;
			--ms-muted: #94a3b8;
			--ms-focus: #60a5fa;
		}
	}

	:global(.dark) .momentum-slider,
	:global(.dark) .ms-modal {
		--ms-card-bg: #0f172a;
		--ms-card-fg: #e2e8f0;
		--ms-muted: #94a3b8;
		--ms-focus: #60a5fa;
	}

	@media (prefers-reduced-motion: reduce) {
		.ms-card,
		.ms-modal,
		.ms-backdrop {
			transition: none !important;
		}
	}
</style>
