<!--
	===========================================================
	GSAP TIMELINE
	===========================================================
	WHAT
	A GSAP-driven sibling of the native Timeline component. Same
	TimelineEvent[] prop interface — drop-in compatible — but the
	entrance animation is staged by `gsap.timeline()` with a
	ScrollTrigger-equivalent IntersectionObserver and a slightly
	more cinematic motion vocabulary (per-item slide + rotate +
	progress-line draw).

	WHY
	When the design system already speaks GSAP, picking the GSAP
	variant keeps the easing curves consistent with the rest of the
	suite. Use the native Timeline when zero external deps matter;
	use this one when you'd benefit from gsap.timeline composition.

	FEATURES
	- Same `TimelineEvent[]` data shape as the native Timeline
	- IntersectionObserver fires the entry; gsap.timeline composes the
	  per-item stagger + the progress-line draw + the connector dots
	- Light + dark via CSS theme tokens (matches the native Timeline
	  fix landed in F)
	- Honours prefers-reduced-motion (renders the assembled state)
	- Mobile-first: collapses to single-column at ≤ 640px

	ACCESSIBILITY
	- role="list" + role="listitem" per event (button when onEventClick)
	- Each event uses <time datetime="...">
	- Markers carry aria-hidden

	DEPENDENCIES
	`gsap` core (already a project dep). No business plugins.

	USAGE
	<GsapTimeline events={milestones} />

	PROPS
	See `GsapTimelineProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { GsapTimelineProps, TimelineEvent } from '$lib/types';

	let {
		events,
		alignment = 'alternate',
		showProgress = false,
		dateFormat,
		onEventClick,
		ariaLabel = 'GSAP timeline',
		class: className = ''
	}: GsapTimelineProps = $props();

	let rootEl: HTMLElement | undefined = $state();
	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;
	let played = false;

	function formatDate(date: Date | string): string {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		if (typeof dateFormat === 'function') return dateFormat(dateObj);
		return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function getAlignmentClass(index: number): string {
		if (alignment === 'alternate') return index % 2 === 0 ? 'gt-item--left' : 'gt-item--right';
		return `gt-item--${alignment}`;
	}

	function handleClick(event: TimelineEvent) {
		onEventClick?.(event);
	}

	function handleKey(e: KeyboardEvent, event: TimelineEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(event);
		}
	}

	function progressPercent(): number {
		if (!showProgress || events.length === 0) return 0;
		const completed = events.filter((e) => e.completed).length;
		return (completed / events.length) * 100;
	}

	function play() {
		if (played || !rootEl || !gsapInstance) return;
		played = true;
		const items = rootEl.querySelectorAll<HTMLElement>('.gt-item');
		const markers = rootEl.querySelectorAll<HTMLElement>('.gt-marker');
		const progress = rootEl.querySelector<HTMLElement>('.gt-progress');
		const tl = gsapInstance.timeline();
		tl.fromTo(
			items,
			{ y: 22, opacity: 0 },
			{
				y: 0,
				opacity: 1,
				duration: 0.65,
				ease: 'power3.out',
				stagger: { each: 0.08 }
			},
			0
		);
		tl.fromTo(
			markers,
			{ scale: 0, rotation: -45 },
			{
				scale: 1,
				rotation: 0,
				duration: 0.55,
				ease: 'back.out(1.6)',
				stagger: { each: 0.08 }
			},
			0.05
		);
		if (showProgress && progress) {
			tl.fromTo(
				progress,
				{ scaleY: 0 },
				{ scaleY: 1, duration: 0.9, ease: 'power2.inOut' },
				0
			);
		}
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Hoist the observer out of the async IIFE so the cleanup return below
		// actually disconnects on unmount.
		let observer: IntersectionObserver | null = null;

		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced || !rootEl || typeof IntersectionObserver === 'undefined') {
				played = true;
				return;
			}
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0]?.isIntersecting) {
						play();
						observer?.disconnect();
					}
				},
				{ threshold: 0.15 }
			);
			observer.observe(rootEl);
		})();

		return () => {
			observer?.disconnect();
		};
	});
</script>

<div
	bind:this={rootEl}
	class="gsap-timeline {className}"
	class:gsap-timeline--reduced={prefersReduced}
	role="list"
	aria-label={ariaLabel}
	style="--gt-progress: {progressPercent()}%;"
>
	<div class="gt-line" aria-hidden="true"></div>
	{#if showProgress}
		<div class="gt-progress" aria-hidden="true"></div>
	{/if}
	{#each events as event, index (event.id)}
		<!-- href-only events stay normal listitems containing a real <a>; the
		     wrapper only becomes a button when there's an onEventClick handler. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="gt-item {getAlignmentClass(index)}"
			class:gt-item--completed={event.completed}
			class:gt-item--clickable={!!onEventClick}
			role={onEventClick ? 'button' : 'listitem'}
			tabindex={onEventClick ? 0 : undefined}
			onclick={() => onEventClick && handleClick(event)}
			onkeydown={(e) => onEventClick && handleKey(e, event)}
		>
			<div
				class="gt-marker"
				style={event.color ? `background: ${event.color};` : ''}
				aria-hidden="true"
			>
				{#if event.icon}<span class="gt-icon">{event.icon}</span>
				{:else if event.completed}<span class="gt-check">✓</span>{/if}
			</div>
			<div class="gt-content">
				<time class="gt-date" datetime={String(event.date)}>{formatDate(event.date)}</time>
				<h3 class="gt-title">
					{#if event.href}<a class="gt-link" href={event.href}>{event.title}</a>
					{:else}{event.title}{/if}
				</h3>
				{#if event.description}<p class="gt-description">{event.description}</p>{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.gsap-timeline {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
		padding: 2rem 0;
		padding-left: 50%;
	}

	.gt-line {
		position: absolute;
		left: 50%;
		top: 2rem;
		bottom: 2rem;
		width: 3px;
		background: var(--gt-line, color-mix(in srgb, currentColor 14%, transparent));
		transform: translateX(-50%);
	}

	.gt-progress {
		position: absolute;
		left: 50%;
		top: 2rem;
		width: 3px;
		height: var(--gt-progress, 0%);
		background: var(--gt-marker, #146ef5);
		transform-origin: top;
		transform: translateX(-50%) scaleY(0);
	}

	.gt-item {
		position: relative;
		display: flex;
		align-items: flex-start;
		width: 100%;
	}

	.gt-item--left {
		flex-direction: row-reverse;
		padding-right: calc(50% + 2rem);
		padding-left: 0;
		margin-left: -50%;
		text-align: right;
	}

	.gt-item--right {
		padding-left: 2rem;
	}

	.gt-marker {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: var(--gt-marker, #146ef5);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #fff;
		box-shadow: 0 0 0 4px var(--gt-marker-ring, #ffffff), 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.gt-item--completed .gt-marker {
		background: #10b981;
	}

	.gt-icon {
		font-size: 1rem;
	}

	.gt-check {
		font-size: 0.875rem;
		font-weight: 700;
	}

	.gt-content {
		flex: 1;
		max-width: 350px;
	}

	.gt-date {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gt-marker, #146ef5);
		margin-bottom: 0.5rem;
	}

	.gt-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--gt-title, #1e293b);
	}

	.gt-link {
		color: inherit;
		text-decoration: none;
	}

	.gt-link:hover,
	.gt-link:focus-visible {
		color: var(--gt-marker, #146ef5);
	}

	.gt-description {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--gt-description, #64748b);
	}

	.gt-item--clickable {
		cursor: pointer;
	}

	.gt-item--clickable:focus-visible {
		outline: 2px solid var(--gt-marker, #146ef5);
		outline-offset: 4px;
		border-radius: 4px;
	}

	@media (prefers-color-scheme: dark) {
		.gsap-timeline {
			--gt-title: #f1f5f9;
			--gt-description: #cbd5e1;
			--gt-marker-ring: #0f172a;
			--gt-line: rgba(148, 163, 184, 0.25);
		}
	}

	:global(.dark) .gsap-timeline {
		--gt-title: #f1f5f9;
		--gt-description: #cbd5e1;
		--gt-marker-ring: #0f172a;
		--gt-line: rgba(148, 163, 184, 0.25);
	}

	/* Reduced-motion fallback: paint the assembled state immediately. */
	.gsap-timeline--reduced .gt-item,
	.gsap-timeline--reduced .gt-marker {
		opacity: 1 !important;
		transform: translateX(-50%) !important;
	}

	.gsap-timeline--reduced .gt-item {
		transform: none !important;
	}

	.gsap-timeline--reduced .gt-progress {
		transform: translateX(-50%) scaleY(1) !important;
	}

	@media (max-width: 640px) {
		.gsap-timeline {
			padding-left: 3rem;
		}

		.gt-line,
		.gt-progress {
			left: 1.25rem;
		}

		.gt-item,
		.gt-item--left,
		.gt-item--right {
			flex-direction: row;
			padding-left: 2rem;
			padding-right: 0;
			margin-left: 0;
			text-align: left;
		}

		.gt-marker,
		.gt-item--left .gt-marker,
		.gt-item--right .gt-marker {
			left: 1.25rem;
			transform: translateX(-50%);
		}

		.gt-content {
			max-width: none;
		}
	}
</style>
