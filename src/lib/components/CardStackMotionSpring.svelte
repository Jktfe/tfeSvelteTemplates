<!--
	CardStackMotionSpring Component - Interactive Card Stack with Spring Physics

	Enhanced version with smooth spring-based animations using @humanspeak/svelte-motion.
	Features elastic hover effects, drag-to-cycle functionality, and natural physics-based transitions.

	FEATURES:
	- Spring physics with configurable stiffness and damping
	- Drag-to-cycle with momentum (pull and release to navigate)
	- Elastic hover effects (bouncy, natural motion)
	- Keyboard navigation (arrow keys to cycle)
	- Touch-optimised interaction with velocity tracking
	- Respects prefers-reduced-motion accessibility setting
	- Fully accessible with semantic elements and ARIA labels

	USAGE:
	<CardStackMotionSpring
		cards={[
			{ image: '/path/to/image.jpg', title: 'Card Title', content: 'Description' },
			// ... more cards
		]}
		cardWidth={300}
		cardHeight={400}
		springStiffness={300}
		springDamping={30}
		dragEnabled={true}
	/>

	PROPS:
	- cards: Array of card objects with { image, title, content }
	- cardWidth: Width of each card in pixels (default: 300)
	- cardHeight: Height of each card in pixels (default: 400)
	- springStiffness: Spring stiffness for physics (default: 300)
	- springDamping: Spring damping to control bounce (default: 30)
	- dragEnabled: Enable drag-to-cycle (default: true)
	- reducedMotion: Respect prefers-reduced-motion (default: true)

	KEYBOARD CONTROLS:
	- Right Arrow: Move front card to back
	- Left Arrow: Move back card to front

	DRAG INTERACTION:
	- Drag horizontally to cycle cards
	- Drag threshold: 100px to trigger cycle
	- Velocity-based momentum for fast swipes
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import type { Card, CardStackMotionProps } from '$lib/types';

	// Component props with default values
	let {
		cards = [],
		cardWidth = 300,
		cardHeight = 400,
		springStiffness = 300,
		springDamping = 30,
		dragEnabled = true,
		reducedMotion = true
	}: CardStackMotionProps = $props();

	// Reactive state
	let hoveredIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(null);
	let cardOrder = $state([...Array(cards.length).keys()]); // [0, 1, 2, 3, ...]
	let isAnimating = $state(false);
	let prefersReducedMotion = $state(false);

	// Derived values for motion
	const springConfig = $derived({
		type: 'spring' as const,
		stiffness: prefersReducedMotion ? 500 : springStiffness,
		damping: prefersReducedMotion ? 50 : springDamping
	});

	/**
	 * Cycle the front card to the back
	 * Creates the "roll over" effect with spring physics
	 */
	function cycleForward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;

		// Move first card to end
		const first = cardOrder[0];
		cardOrder = [...cardOrder.slice(1), first];

		// Reset animation flag after transition
		setTimeout(
			() => {
				isAnimating = false;
			},
			prefersReducedMotion ? 200 : 600
		);
	}

	/**
	 * Cycle the back card to the front
	 * Reverse of cycleForward
	 */
	function cycleBackward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;

		// Move last card to beginning
		const last = cardOrder[cardOrder.length - 1];
		cardOrder = [last, ...cardOrder.slice(0, -1)];

		// Reset animation flag after transition
		setTimeout(
			() => {
				isAnimating = false;
			},
			prefersReducedMotion ? 200 : 600
		);
	}

	/**
	 * Handle drag end event
	 * Cycles cards based on drag distance and velocity
	 * @param info - Drag info with offset and velocity
	 */
	function handleDragEnd(info: any) {
		const { offset, velocity } = info;
		const swipeThreshold = 100;
		const velocityThreshold = 500;

		// Check if drag distance or velocity exceeds threshold
		if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
			if (offset.x > 0 || velocity.x > 0) {
				// Dragged right - cycle backward
				cycleBackward();
			} else {
				// Dragged left - cycle forward
				cycleForward();
			}
		}
	}

	/**
	 * Handle keyboard navigation events
	 * Right arrow: cycle forward, Left arrow: cycle backward
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			cycleForward();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			cycleBackward();
		}
	}

	/**
	 * Check for reduced motion preference on mount
	 */
	onMount(() => {
		// Check for reduced motion preference
		if (reducedMotion && window.matchMedia) {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;

			// Listen for changes
			const handleChange = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};
			mediaQuery.addEventListener('change', handleChange);

			// Cleanup
			return () => {
				mediaQuery.removeEventListener('change', handleChange);
			};
		}

		// Keyboard listener
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	/**
	 * Calculate card position based on index
	 */
	function getCardX(displayIndex: number): number {
		return displayIndex * -50; // Overlap cards by 50px
	}

	/**
	 * Calculate z-index for proper stacking
	 */
	function getZIndex(displayIndex: number): number {
		if (selectedIndex === displayIndex) return cards.length + 20;
		if (hoveredIndex === displayIndex) return cards.length + 5;
		return displayIndex + 1;
	}

	/**
	 * Get class string for card wrapper
	 */
	function getCardClass(displayIndex: number): string {
		const classes = ['card-wrapper'];
		if (hoveredIndex === displayIndex && selectedIndex !== displayIndex) classes.push('hovered');
		if (selectedIndex === displayIndex) classes.push('selected');
		return classes.join(' ');
	}
</script>

<!-- Main container that holds all cards -->
<div class="stack-container" role="region" aria-label="Card stack with spring motion">
	<div class="cards-wrapper">
		<!-- Render each card in current order -->
		{#each cardOrder as cardIndex, displayIndex (cardIndex)}
			{@const card = cards[cardIndex]}
			<motion.div
				animate={{
					x: getCardX(displayIndex),
					y: selectedIndex === displayIndex ? -40 : hoveredIndex === displayIndex ? -30 : 0,
					scale: selectedIndex === displayIndex ? 1.1 : hoveredIndex === displayIndex ? 1.05 : 1
				}}
				transition={springConfig}
				drag={dragEnabled && !isAnimating ? 'x' : false}
				dragConstraints={{ left: -200, right: 200 }}
				dragElastic={0.2}
				onDragEnd={(_event: PointerEvent, info: any) => handleDragEnd(info)}
				class={getCardClass(displayIndex)}
				style="
					z-index: {getZIndex(displayIndex)};
					width: {cardWidth}px;
					height: {cardHeight}px;
				"
				role="button"
				tabindex="0"
				onmouseenter={() => (hoveredIndex = displayIndex)}
				onmouseleave={() => (hoveredIndex = null)}
				onclick={() => (selectedIndex = selectedIndex === displayIndex ? null : displayIndex)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						selectedIndex = selectedIndex === displayIndex ? null : displayIndex;
					}
				}}
				aria-label="Card {displayIndex + 1} of {cards.length}: {card?.title || 'Untitled'}"
				aria-pressed={selectedIndex === displayIndex}
			>
					<div class="card">
						<!-- Background image (if provided) -->
						{#if card?.image}
							<img
								src={card.image}
								alt={card.title
									? `${card.title} - Image ${displayIndex + 1}`
									: `Card image ${displayIndex + 1} of ${cards.length}`}
								class="card-image"
								draggable="false"
							/>
						{/if}

						<!-- Card title overlay (if provided) -->
						{#if card?.title}
							<div class="card-title">{card.title}</div>
						{/if}

						<!-- Card content with gradient background (if provided) -->
						{#if card?.content}
							<div class="card-content">
								{@html card.content}
							</div>
						{/if}
					</div>
			</motion.div>
		{/each}
	</div>

	<!-- Interaction hint -->
	<div class="interaction-hint" aria-hidden="true">
		<span>← Drag or use arrow keys to cycle →</span>
	</div>
</div>

<style>
	/* Container that holds the card stack */
	.stack-container {
		width: 100%;
		padding: 4rem 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		outline: none;
		position: relative;
	}

	/* Wrapper for cards with horizontal layout */
	.cards-wrapper {
		display: flex;
		align-items: center;
		padding: 2rem 2rem 2rem 0;
		gap: 0;
		justify-content: center;
		max-width: 100%;
		overflow: visible;
		position: relative;
		height: 450px; /* Fixed height to prevent layout shift */
	}

	/* Individual card wrapper with spring motion */
	.card-wrapper {
		/* Reset button defaults */
		border: none;
		padding: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: inherit;
		outline: none;

		/* Card wrapper styling */
		position: absolute;
		cursor: grab;
		will-change: transform;
		display: block;
	}

	.card-wrapper:active {
		cursor: grabbing;
	}

	/* Focus visible for keyboard navigation */
	.card-wrapper:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
	}

	/* The actual card content container */
	.card {
		width: 100%;
		height: 100%;
		border-radius: 20px;
		overflow: hidden;
		background: white;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		transition: box-shadow 0.3s ease;
		position: relative;
	}

	/* Enhanced shadow on hover */
	.card-wrapper.hovered .card {
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	/* Maximum shadow on selected */
	.card-wrapper.selected .card {
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
	}

	/* Background image styling */
	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		pointer-events: none;
		-webkit-user-drag: none;
	}

	/* Card title overlay */
	.card-title {
		position: absolute;
		top: 20px;
		left: 24px;
		font-size: 24px;
		font-weight: 700;
		z-index: 10;
		color: white;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		letter-spacing: 0.5px;
		pointer-events: none;
	}

	/* Card content area */
	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 0, 0, 0.6) 60%,
			rgba(0, 0, 0, 0.8) 100%
		);
		color: white;
		z-index: 10;
		font-size: 14px;
		line-height: 1.5;
		pointer-events: none;
	}

	/* Interaction hint */
	.interaction-hint {
		margin-top: 2rem;
		padding: 0.75rem 1.5rem;
		background: rgba(102, 126, 234, 0.1);
		border-radius: 9999px;
		color: #667eea;
		font-size: 14px;
		font-weight: 600;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.stack-container:hover .interaction-hint {
		opacity: 1;
	}

	/* MOBILE RESPONSIVE STYLES */
	@media (max-width: 768px) {
		.stack-container {
			padding: 2rem 0.5rem;
		}

		.cards-wrapper {
			padding: 1rem 0.5rem;
			height: 350px;
		}

		.card-title {
			font-size: 18px;
		}

		.card-content {
			font-size: 12px;
			padding: 16px;
		}

		.interaction-hint {
			font-size: 12px;
			padding: 0.5rem 1rem;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.card-wrapper {
			transition: transform 0.2s ease;
		}
	}
</style>
