<!--
	============================================================
	Timeline - Animated Event Timeline Component
	============================================================

	[CR] WHAT IT DOES
	Displays events/milestones in a chronological timeline with smooth entrance
	animations powered by anime.js. Supports vertical and horizontal layouts
	with alternating or fixed alignment.

	[NTL] THE SIMPLE VERSION
	Think of a project roadmap or a history page showing important dates!
	Events appear one by one with nice animations, connected by a line
	showing the flow of time. You can click on events for more details.

	============================================================

	FEATURES:
	- Vertical and horizontal orientations
	- Alternating, left, or right alignment
	- Smooth entrance animations via anime.js
	- Progress indicator for completed milestones
	- Custom date formatting or relative dates
	- Customisable colours for line and markers
	- Click handlers for interactive timelines
	- Accessible with proper ARIA attributes
	- Respects prefers-reduced-motion

	DEPENDENCIES:
	External: animejs - REASON: Complex sequenced animations would be
	significantly more work to implement natively, and anime.js provides
	excellent easing, staggering, and timeline sequencing out of the box.

	ACCESSIBILITY:
	- Keyboard: Tab to navigate, Enter/Space to activate events
	- Screen readers: Semantic list structure, aria-labels for dates
	- Motion: Respects prefers-reduced-motion

	USAGE:
	<Timeline
		events={timelineEvents}
		orientation="vertical"
		alignment="alternate"
		animation="slide"
	/>

	PROPS:
	| Prop              | Type                     | Default      | Description                       |
	|-------------------|--------------------------|--------------|-----------------------------------|
	| events            | TimelineEvent[]          | required     | Array of events to display        |
	| orientation       | 'vertical'/'horizontal'  | 'vertical'   | Layout direction                  |
	| alignment         | 'left'/'right'/'alternate' | 'alternate' | Item alignment (vertical only)   |
	| animation         | 'fade'/'slide'/'scale'/'none' | 'slide' | Entrance animation style         |
	| animationDuration | number                   | 600          | Animation duration in ms          |
	| animationDelay    | number                   | 100          | Delay between item animations     |
	| lineColor         | string                   | '#e2e8f0'    | Connecting line colour            |
	| markerColor       | string                   | '#146ef5'    | Default marker colour             |
	| showProgress      | boolean                  | false        | Show completion progress          |
	| dateFormat        | function/'relative'      | undefined    | Date formatting function          |
	| onEventClick      | function                 | undefined    | Click handler for events          |

	WARNINGS:
	None expected - component is self-contained

	============================================================
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, stagger } from 'animejs';
	import type { TimelineProps, TimelineEvent } from '$lib/types';

	// [CR] Extend base props with Svelte 5 patterns
	interface Props extends TimelineProps {}

	// [CR] Destructure props with sensible defaults using Svelte 5 $props() rune
	let {
		events, // [NTL] Your array of milestone events - required!
		orientation = 'vertical', // [NTL] Stack vertically or horizontally
		alignment = 'alternate', // [NTL] Items on left, right, or alternating sides
		animation = 'slide', // [NTL] How items appear: slide, fade, scale, or none
		animationDuration = 600, // [NTL] How long each animation takes (milliseconds)
		animationDelay = 100, // [NTL] Gap between each item's animation
		lineColor = '#e2e8f0', // [NTL] The colour of the connecting line
		markerColor = '#146ef5', // [NTL] Default colour for the timeline dots
		showProgress = false, // [NTL] Show a filled line for completed events?
		dateFormat, // [NTL] How to format dates - function or 'relative'
		onEventClick // [NTL] Your function to handle event clicks
	}: Props = $props();

	// ==========================================================================
	// STATE & REFS
	// ==========================================================================

	let timelineRef: HTMLDivElement | null = null;
	let hasAnimated = $state(false);
	let prefersReducedMotion = $state(false);

	// ==========================================================================
	// HELPER FUNCTIONS
	// ==========================================================================

	/**
	 * [CR] Format a date based on the dateFormat prop
	 * [NTL] This turns dates into readable strings like "15 Jan 2024" or "2 days ago"
	 */
	function formatDate(date: Date | string): string {
		const dateObj = typeof date === 'string' ? new Date(date) : date;

		if (dateFormat === 'relative') {
			return getRelativeTime(dateObj);
		}

		if (typeof dateFormat === 'function') {
			return dateFormat(dateObj);
		}

		// [NTL] Default format: "15 Jan 2024"
		return dateObj.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	/**
	 * [CR] Get relative time string (e.g., "2 days ago", "in 3 months")
	 * [NTL] Makes dates feel more natural - "yesterday" is friendlier than "27 Dec 2024"
	 */
	function getRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays === -1) return 'Yesterday';

		const absDays = Math.abs(diffDays);
		const suffix = diffDays > 0 ? 'from now' : 'ago';

		if (absDays < 7) {
			return `${absDays} day${absDays > 1 ? 's' : ''} ${suffix}`;
		}

		const weeks = Math.round(absDays / 7);
		if (absDays < 30) {
			return `${weeks} week${weeks > 1 ? 's' : ''} ${suffix}`;
		}

		const months = Math.round(absDays / 30);
		if (absDays < 365) {
			return `${months} month${months > 1 ? 's' : ''} ${suffix}`;
		}

		const years = Math.round(absDays / 365);
		return `${years} year${years > 1 ? 's' : ''} ${suffix}`;
	}

	/**
	 * [CR] Determine alignment class for an item based on index
	 * [NTL] In 'alternate' mode, odd items go left, even go right
	 */
	function getAlignmentClass(index: number): string {
		if (alignment === 'alternate') {
			return index % 2 === 0 ? 'align-left' : 'align-right';
		}
		return `align-${alignment}`;
	}

	/**
	 * [CR] Handle event click with keyboard support
	 */
	function handleEventClick(event: TimelineEvent): void {
		if (onEventClick) {
			onEventClick(event);
		}
	}

	/**
	 * [CR] Handle keyboard activation
	 */
	function handleKeyDown(e: KeyboardEvent, event: TimelineEvent): void {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleEventClick(event);
		}
	}

	/**
	 * [CR] Calculate progress percentage based on completed events
	 */
	function getProgressPercentage(): number {
		if (!showProgress || events.length === 0) return 0;
		const completedCount = events.filter((e) => e.completed).length;
		return (completedCount / events.length) * 100;
	}

	/**
	 * [CR] Run entrance animations using anime.js
	 * [NTL] This is where the magic happens! Anime.js staggers the animations
	 * so each event appears one after another with a nice flow
	 */
	function animateEntrance(): void {
		if (hasAnimated || prefersReducedMotion || animation === 'none') {
			hasAnimated = true;
			return;
		}

		const items = timelineRef?.querySelectorAll('.timeline-item');
		if (!items || items.length === 0) return;

		// [CR] Define animation properties based on selected animation type
		// [NTL] anime.js v4 uses 'animate' function with slightly different API
		if (animation === 'fade') {
			animate(items, {
				opacity: [0, 1],
				duration: animationDuration,
				delay: stagger(animationDelay),
				ease: 'outQuad'
			});
		} else if (animation === 'slide') {
			// For slide, we animate each item individually based on alignment
			items.forEach((el, i) => {
				const alignClass = el.classList.contains('align-right') ? 1 : -1;
				animate(el, {
					opacity: [0, 1],
					translateX: [alignClass * 50, 0],
					duration: animationDuration,
					delay: i * animationDelay,
					ease: 'outQuad'
				});
			});
		} else if (animation === 'scale') {
			animate(items, {
				opacity: [0, 1],
				scale: [0.8, 1],
				duration: animationDuration,
				delay: stagger(animationDelay),
				ease: 'outQuad'
			});
		}

		// [CR] Animate the progress line if enabled
		if (showProgress) {
			const progressLine = timelineRef?.querySelector('.timeline-progress');
			if (progressLine) {
				const scaleProps =
					orientation === 'vertical' ? { scaleY: [0, 1] } : { scaleX: [0, 1] };
				animate(progressLine, {
					...scaleProps,
					duration: animationDuration * 2,
					delay: animationDelay * events.length,
					ease: 'outQuad'
				});
			}
		}

		hasAnimated = true;
	}

	// ==========================================================================
	// LIFECYCLE
	// ==========================================================================

	onMount(() => {
		// [CR] Check for reduced motion preference
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;

		// [CR] Set up intersection observer for scroll-triggered animation
		// [NTL] We wait until the timeline scrolls into view before animating
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !hasAnimated) {
					animateEntrance();
				}
			},
			{ threshold: 0.1 }
		);

		if (timelineRef) {
			observer.observe(timelineRef);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<!-- [CR] Main timeline container -->
<div
	bind:this={timelineRef}
	class="timeline timeline--{orientation}"
	role="list"
	aria-label="Timeline of events"
	style="
		--line-color: {lineColor};
		--marker-color: {markerColor};
		--progress-percent: {getProgressPercentage()}%;
	"
>
	<!-- [CR] The connecting line (background) -->
	<div class="timeline-line" aria-hidden="true"></div>

	<!-- [CR] Progress overlay (if enabled) -->
	{#if showProgress}
		<div
			class="timeline-progress"
			aria-hidden="true"
			style="--progress: {getProgressPercentage()}%"
		></div>
	{/if}

	<!-- [CR] Timeline events -->
	{#each events as event, index (event.id)}
		{@const isClickable = !!onEventClick || !!event.href}
		{@const alignClass = getAlignmentClass(index)}

		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="timeline-item {alignClass}"
			class:timeline-item--completed={event.completed}
			class:timeline-item--clickable={isClickable}
			role="listitem"
			tabindex={isClickable ? 0 : undefined}
			onclick={() => isClickable && handleEventClick(event)}
			onkeydown={(e) => isClickable && handleKeyDown(e, event)}
			style={animation === 'none' || prefersReducedMotion ? '' : 'opacity: 0;'}
		>
			<!-- [CR] The marker dot on the timeline -->
			<div
				class="timeline-marker"
				style={event.color ? `background-color: ${event.color}` : ''}
				aria-hidden="true"
			>
				{#if event.icon}
					<span class="timeline-marker-icon">{event.icon}</span>
				{:else if event.completed}
					<span class="timeline-marker-check">✓</span>
				{/if}
			</div>

			<!-- [CR] Event content card -->
			<div class="timeline-content">
				<!-- Date -->
				<time class="timeline-date" datetime={String(event.date)}>
					{formatDate(event.date)}
				</time>

				<!-- Title -->
				<h3 class="timeline-title">
					{#if event.href}
						<a href={event.href} class="timeline-link">{event.title}</a>
					{:else}
						{event.title}
					{/if}
				</h3>

				<!-- Description -->
				{#if event.description}
					<p class="timeline-description">{event.description}</p>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	/* ==========================================================================
	 * BASE TIMELINE STYLES
	 * [CR] Core structure for both orientations
	 * ========================================================================== */

	.timeline {
		position: relative;
		padding: 2rem 0;
	}

	/* [CR] The main connecting line */
	.timeline-line {
		position: absolute;
		background-color: var(--line-color, #e2e8f0);
	}

	/* [CR] Progress overlay on the line */
	.timeline-progress {
		position: absolute;
		background-color: var(--marker-color, #146ef5);
		transform-origin: top;
	}

	/* ==========================================================================
	 * VERTICAL ORIENTATION
	 * [CR] Default layout - events stacked vertically with line on the side
	 * ========================================================================== */

	.timeline--vertical {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding-left: 50%;
	}

	.timeline--vertical .timeline-line {
		left: 50%;
		top: 2rem;
		bottom: 2rem;
		width: 3px;
		transform: translateX(-50%);
	}

	.timeline--vertical .timeline-progress {
		left: 50%;
		top: 2rem;
		width: 3px;
		height: var(--progress, 0%);
		transform: translateX(-50%);
	}

	/* [CR] Timeline item positioning */
	.timeline--vertical .timeline-item {
		position: relative;
		display: flex;
		align-items: flex-start;
		width: 100%;
	}

	.timeline--vertical .timeline-item.align-left {
		flex-direction: row-reverse;
		padding-right: calc(50% + 2rem);
		padding-left: 0;
		margin-left: -50%;
		text-align: right;
	}

	.timeline--vertical .timeline-item.align-right {
		flex-direction: row;
		padding-left: 2rem;
		padding-right: 0;
	}

	/* [CR] Marker positioned on the line */
	.timeline--vertical .timeline-marker {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
	}

	.timeline--vertical .timeline-item.align-left .timeline-marker,
	.timeline--vertical .timeline-item.align-right .timeline-marker {
		left: 50%;
	}

	/* ==========================================================================
	 * HORIZONTAL ORIENTATION
	 * [CR] Events arranged horizontally with line at the top
	 * ========================================================================== */

	.timeline--horizontal {
		display: flex;
		gap: 2rem;
		padding: 4rem 2rem 2rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
	}

	.timeline--horizontal .timeline-line {
		left: 2rem;
		right: 2rem;
		top: 1.5rem;
		height: 3px;
	}

	.timeline--horizontal .timeline-progress {
		left: 2rem;
		top: 1.5rem;
		height: 3px;
		width: var(--progress, 0%);
		transform-origin: left;
	}

	.timeline--horizontal .timeline-item {
		flex: 0 0 280px;
		display: flex;
		flex-direction: column;
		align-items: center;
		scroll-snap-align: start;
		text-align: center;
	}

	.timeline--horizontal .timeline-marker {
		margin-bottom: 1.5rem;
	}

	/* ==========================================================================
	 * MARKER STYLES
	 * [CR] The dots/circles on the timeline
	 * [NTL] These are the visual anchors that mark each event
	 * ========================================================================== */

	.timeline-marker {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background-color: var(--marker-color, #146ef5);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow:
			0 0 0 4px #ffffff,
			0 2px 8px rgba(0, 0, 0, 0.15);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.timeline-marker-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.timeline-marker-check {
		color: white;
		font-size: 0.875rem;
		font-weight: 700;
	}

	/* [CR] Completed event marker styling */
	.timeline-item--completed .timeline-marker {
		background-color: #10b981;
	}

	/* [CR] Hover state for clickable items */
	.timeline-item--clickable .timeline-marker {
		cursor: pointer;
	}

	.timeline-item--clickable:hover .timeline-marker,
	.timeline-item--clickable:focus .timeline-marker {
		transform: scale(1.1);
		box-shadow:
			0 0 0 4px #ffffff,
			0 4px 12px rgba(0, 0, 0, 0.2);
	}

	/* ==========================================================================
	 * CONTENT CARD STYLES
	 * [CR] The event information displayed next to each marker
	 * ========================================================================== */

	.timeline-content {
		flex: 1;
		max-width: 350px;
	}

	.timeline-date {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--marker-color, #146ef5);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.timeline-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
		line-height: 1.3;
	}

	.timeline-link {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.timeline-link:hover,
	.timeline-link:focus {
		color: var(--marker-color, #146ef5);
	}

	.timeline-description {
		font-size: 0.9375rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	/* ==========================================================================
	 * CLICKABLE ITEM STYLES
	 * [CR] Interactive styling for clickable timeline items
	 * ========================================================================== */

	.timeline-item--clickable {
		cursor: pointer;
		outline: none;
	}

	.timeline-item--clickable:focus-visible {
		outline: 2px solid var(--marker-color, #146ef5);
		outline-offset: 4px;
		border-radius: 4px;
	}

	.timeline-item--clickable:hover .timeline-content,
	.timeline-item--clickable:focus .timeline-content {
		transform: translateY(-2px);
	}

	.timeline-content {
		transition: transform 0.2s ease;
	}

	/* ==========================================================================
	 * RESPONSIVE STYLES
	 * [CR] Adjust layout for smaller screens
	 * ========================================================================== */

	@media (max-width: 768px) {
		/* [CR] Force left alignment on mobile for vertical timeline */
		.timeline--vertical {
			padding-left: 3rem;
		}

		.timeline--vertical .timeline-line {
			left: 1.25rem;
		}

		.timeline--vertical .timeline-progress {
			left: 1.25rem;
		}

		.timeline--vertical .timeline-item,
		.timeline--vertical .timeline-item.align-left,
		.timeline--vertical .timeline-item.align-right {
			flex-direction: row;
			padding-left: 2rem;
			padding-right: 0;
			margin-left: 0;
			text-align: left;
		}

		.timeline--vertical .timeline-marker,
		.timeline--vertical .timeline-item.align-left .timeline-marker,
		.timeline--vertical .timeline-item.align-right .timeline-marker {
			left: 1.25rem;
			transform: translateX(-50%);
		}

		.timeline-content {
			max-width: none;
		}

		/* [CR] Smaller markers on mobile */
		.timeline-marker {
			width: 2rem;
			height: 2rem;
		}

		.timeline-marker-icon {
			font-size: 0.875rem;
		}
	}

	/* ==========================================================================
	 * REDUCED MOTION
	 * [CR] Disable animations for users who prefer reduced motion
	 * ========================================================================== */

	@media (prefers-reduced-motion: reduce) {
		.timeline-item {
			opacity: 1 !important;
			transform: none !important;
		}

		.timeline-marker,
		.timeline-content {
			transition: none !important;
		}
	}
</style>
