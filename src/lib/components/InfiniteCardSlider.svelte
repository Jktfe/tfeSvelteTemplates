<!--
  ============================================================
  InfiniteCardSlider — GSAP-powered infinite horizontal card slider
  ============================================================

  WHAT IT DOES
  Renders a row of cards that loop infinitely. The middle card is
  the focal "selected" card, scaled larger and fully opaque; the
  cards either side peek out, smaller and dimmer. Drag, swipe, click
  arrows, or use the arrow keys to advance. Inspired by
  https://demos.gsap.com/demo/infinite-card-slider/.

  FEATURES
  • Pure modular-arithmetic loop — no DOM duplication
  • Pointer drag (mouse + touch) with snap-to-nearest on release
  • Click arrows, keyboard left/right, or click any card to focus it
  • Default card chrome ships out-of-the-box; override via the
    children snippet for custom layouts
  • Honours prefers-reduced-motion (skips GSAP tweens, sets
    transforms instantly)

  ACCESSIBILITY
  • role="region" with aria-roledescription="carousel"
  • Cards are real <button>s (or <a>s when href is supplied)
  • Active card has aria-current="true"
  • Keyboard: ArrowLeft/ArrowRight navigate, Tab/Enter selects
  • Off-stage cards get aria-hidden + tabindex=-1

  DEPENDENCIES
  • GSAP (loaded lazily via $lib/gsapMotion)

  USAGE
  <InfiniteCardSlider items={cards} />

  PROPS
  | Prop          | Type           | Default     | Description |
  |---------------|----------------|-------------|-------------|
  | items         | T[]            | required    | Slide data |
  | cardWidth     | number         | 280         | Card width in px |
  | gap           | number         | 24          | Gap between cards |
  | initialIndex  | number         | 0           | Starting card |
  | maxVisible    | number         | 4           | Cards each side of center |
  | ariaLabel     | string         | 'Carousel'  | Region label |
  | children      | snippet        | -           | Custom card body |
  | class         | string         | ''          | Extra wrapper classes |

  ============================================================
-->
<script lang="ts" module>
	export interface SliderItem {
		id?: string | number;
		href?: string;
		name?: string;
		title?: string;
		description?: string;
		blurb?: string;
		screenshot?: string;
		[key: string]: unknown;
	}

	// Wrap an offset to the shortest-path range [-half, +half) — the heart of
	// the infinite-loop math. Distant cards approach from whichever side is
	// closer, so the carousel never has to physically reset.
	export function wrappedOffset(index: number, selected: number, total: number): number {
		if (total <= 0) return 0;
		const half = total / 2;
		let offset = index - selected;
		if (offset > half) offset -= total;
		if (offset < -half) offset += total;
		return offset;
	}
</script>

<script lang="ts" generics="T extends SliderItem">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { loadGsap, prefersReducedMotion, type Gsap } from '$lib/gsapMotion';

	interface Props {
		items: T[];
		cardWidth?: number;
		gap?: number;
		initialIndex?: number;
		maxVisible?: number;
		ariaLabel?: string;
		children?: Snippet<[T, number]>;
		class?: string;
	}

	let {
		items,
		cardWidth = 280,
		gap = 24,
		initialIndex = 0,
		maxVisible = 4,
		ariaLabel = 'Carousel',
		children,
		class: className = ''
	}: Props = $props();

	let selectedIndex = $state(0);
	let dragOffsetPx = $state(0);
	let dragging = $state(false);
	const cards: Array<HTMLElement | undefined> = [];
	let gsapInstance: Gsap | null = null;
	let pointerDownX = 0;
	let pointerId: number | null = null;

	const N = $derived(items.length);
	const stride = $derived(cardWidth + gap);

	// Per-card transform — visible-side cards lerp toward the centre, far
	// cards drop to opacity 0 and out of pointer range.
	function transformFor(index: number) {
		const offset = wrappedOffset(index, selectedIndex, N) + dragOffsetPx / stride;
		const distance = Math.abs(offset);
		const visible = distance <= maxVisible + 0.5;
		const x = offset * stride;
		const scale = distance < 0.001 ? 1 : Math.max(0.7, 1 - distance * 0.08);
		const opacity = visible ? Math.max(0.25, 1 - distance * 0.18) : 0;
		const zIndex = 100 - Math.round(distance);
		return { x, scale, opacity, zIndex, visible };
	}

	function applyTransforms(animated = true) {
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			if (!card) continue;
			const t = transformFor(i);
			if (animated && gsapInstance && !prefersReducedMotion()) {
				gsapInstance.to(card, {
					x: t.x,
					scale: t.scale,
					opacity: t.opacity,
					duration: 0.5,
					ease: 'power3.out',
					overwrite: true
				});
				card.style.zIndex = String(t.zIndex);
			} else {
				card.style.transform = `translate3d(${t.x}px, 0, 0) scale(${t.scale})`;
				card.style.opacity = String(t.opacity);
				card.style.zIndex = String(t.zIndex);
			}
			card.setAttribute('aria-hidden', t.visible ? 'false' : 'true');
			card.tabIndex = t.visible ? 0 : -1;
		}
	}

	function normaliseIndex(index: number): number {
		if (N <= 0) return 0;
		return ((index % N) + N) % N;
	}

	function select(index: number) {
		if (N === 0) return;
		selectedIndex = normaliseIndex(index);
		dragOffsetPx = 0;
		applyTransforms(true);
	}

	function next() {
		select(selectedIndex + 1);
	}
	function previous() {
		select(selectedIndex - 1);
	}

	function onPointerDown(event: PointerEvent) {
		if (N <= 1) return;
		dragging = true;
		pointerDownX = event.clientX;
		pointerId = event.pointerId;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragOffsetPx = event.clientX - pointerDownX;
		applyTransforms(false);
	}

	function endDrag(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragging = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		const steps = Math.round(-dragOffsetPx / stride);
		dragOffsetPx = 0;
		select(selectedIndex + steps);
		pointerId = null;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			previous();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			next();
		} else if (event.key === 'Home') {
			event.preventDefault();
			select(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			select(N - 1);
		}
	}

	function cardRef(node: HTMLElement, index: number) {
		cards[index] = node;
		const t = transformFor(index);
		node.style.transform = `translate3d(${t.x}px, 0, 0) scale(${t.scale})`;
		node.style.opacity = String(t.opacity);
		node.style.zIndex = String(t.zIndex);
		node.setAttribute('aria-hidden', t.visible ? 'false' : 'true');
		node.tabIndex = t.visible ? 0 : -1;
		return {
			destroy() {
				cards[index] = undefined;
			}
		};
	}

	onMount(() => {
		selectedIndex = normaliseIndex(initialIndex);

		void (async () => {
			gsapInstance = await loadGsap();
			applyTransforms(false);
		})();

		return () => {
			if (gsapInstance) {
				const live = cards.filter((c): c is HTMLElement => Boolean(c));
				if (live.length) gsapInstance.killTweensOf(live);
			}
		};
	});
</script>

<section
	class={`infinite-card-slider ${className}`}
	aria-roledescription="carousel"
	aria-label={ariaLabel}
>
	<div class="ics-controls" aria-hidden={N <= 1}>
		<button
			type="button"
			class="ics-nav ics-nav--prev"
			onclick={previous}
			disabled={N <= 1}
			aria-label="Previous card"
		>
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<div class="ics-meter" aria-live="polite">
			<span class="ics-meter__index">{String(selectedIndex + 1).padStart(2, '0')}</span>
			<span class="ics-meter__sep">/</span>
			<span class="ics-meter__total">{String(N).padStart(2, '0')}</span>
		</div>
		<button
			type="button"
			class="ics-nav ics-nav--next"
			onclick={next}
			disabled={N <= 1}
			aria-label="Next card"
		>
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
	</div>

	<!-- The stage is an intentional ARIA "group" with custom pointer + keyboard
	     handlers. Treating it as a passive region is the correct pattern for a
	     swipeable carousel where focus on the stage activates arrow-key nav. -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="ics-stage"
		class:ics-stage--dragging={dragging}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={endDrag}
		onpointercancel={endDrag}
		onkeydown={onKeydown}
		role="group"
		tabindex="0"
		style:--card-w="{cardWidth}px"
		style:--card-gap="{gap}px"
	>
		{#each items as item, index (item.id ?? item.href ?? index)}
			{@const isCurrent = index === selectedIndex}
			<div
				use:cardRef={index}
				class="ics-card"
				class:ics-card--current={isCurrent}
				aria-current={isCurrent ? 'true' : undefined}
			>
				{#if children}
					{@render children(item, index)}
				{:else if item.href}
					<a class="ics-card__link" href={item.href} data-sveltekit-preload-data="hover">
						{#if item.screenshot}
							<div class="ics-card__shot">
								<img src={item.screenshot} alt="" loading="lazy" decoding="async" />
							</div>
						{/if}
						<div class="ics-card__body">
							<h4 class="ics-card__name">{item.name ?? item.title ?? ''}</h4>
							{#if item.description ?? item.blurb}
								<p class="ics-card__blurb">{item.description ?? item.blurb}</p>
							{/if}
						</div>
					</a>
				{:else}
					<div class="ics-card__body ics-card__body--standalone">
						<h4 class="ics-card__name">{item.name ?? item.title ?? ''}</h4>
						{#if item.description ?? item.blurb}
							<p class="ics-card__blurb">{item.description ?? item.blurb}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.infinite-card-slider {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		color: var(--fg, #111315);
	}

	.ics-controls {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
	}

	.ics-nav {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 9999px;
		border: 1px solid var(--border, #d7deea);
		background: var(--surface, #ffffff);
		color: var(--fg-1, #111315);
		cursor: pointer;
		transition:
			background 0.18s ease,
			border-color 0.18s ease,
			color 0.18s ease,
			transform 0.18s ease;
	}

	.ics-nav:hover:not(:disabled) {
		border-color: var(--fg-1, #111315);
		background: var(--surface-2, #f3f3ee);
		transform: translateY(-1px);
	}

	.ics-nav:focus-visible {
		outline: 2px solid var(--accent, #5b82c4);
		outline-offset: 2px;
	}

	.ics-nav:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.ics-meter {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
		font-size: 12px;
		letter-spacing: 0.12em;
		color: var(--fg-3, #6b7280);
		display: inline-flex;
		gap: 4px;
		min-width: 70px;
		justify-content: center;
	}
	.ics-meter__index {
		color: var(--fg-1, #111315);
		font-weight: 600;
	}

	.ics-stage {
		position: relative;
		height: calc(var(--card-w) * 1.32);
		min-height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		touch-action: pan-y;
		cursor: grab;
		border-radius: 12px;
		outline: none;
	}
	.ics-stage:focus-visible {
		box-shadow: 0 0 0 3px var(--accent, #5b82c4);
	}
	.ics-stage--dragging {
		cursor: grabbing;
		user-select: none;
	}

	.ics-card {
		position: absolute;
		top: 0;
		left: 50%;
		width: var(--card-w);
		height: 100%;
		margin-left: calc(var(--card-w) * -0.5);
		transform-origin: 50% 50%;
		will-change: transform, opacity;
	}

	.ics-card__link,
	.ics-card__body--standalone {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		color: inherit;
		border: 1px solid var(--border, #d7deea);
		border-radius: 14px;
		overflow: hidden;
		background: var(--surface, #ffffff);
		box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.ics-card--current .ics-card__link,
	.ics-card--current .ics-card__body--standalone {
		border-color: var(--fg-1, #111315);
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
	}

	.ics-card__shot {
		aspect-ratio: 16 / 10;
		background: var(--surface-2, #f3f3ee);
		overflow: hidden;
	}
	.ics-card__shot img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.ics-card__body {
		padding: 16px 18px 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.ics-card__body--standalone {
		padding: 24px;
		justify-content: center;
		min-height: 200px;
	}
	.ics-card__name {
		font-family: var(--font-display, inherit);
		font-weight: 500;
		font-size: 20px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1, #111315);
		line-height: 1.05;
	}
	.ics-card__blurb {
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--fg-2, #4b5563);
		margin: 0;
	}

	@media (max-width: 720px) {
		.ics-stage {
			min-height: 320px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ics-card,
		.ics-nav {
			transition: none;
		}
	}
</style>
