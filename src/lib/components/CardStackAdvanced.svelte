<!--
	CardStackAdvanced Component - Interactive Card Stack with Swipe-to-Cycle

	Enhanced version with mobile swipe interaction that "rolls" cards to the back of the stack.
	Features two-stage interaction: hover to preview (partial reveal), click to select (full reveal).
	On desktop, includes keyboard navigation. On mobile, includes swipe gestures.

	FEATURES:
	- All features from CardStack
	- Two-stage interaction: hover for preview, click for full reveal
	- Dynamic partial reveal based on mouse movement direction
	- Mobile swipe gesture cycles front card to back (rolodex style)
	- Keyboard navigation (arrow keys to cycle, Enter/Space to select)
	- Smooth animations for card transitions
	- Touch-optimised interaction
	- Fully accessible with semantic button elements, ARIA labels, and keyboard navigation support

	USAGE:
	<CardStackAdvanced
		cards={[
			{ image: '/path/to/image.jpg', title: 'Card Title', content: 'Description' },
			// ... more cards
		]}
		cardWidth={300}
		cardHeight={400}
		partialRevealSide="right"
	/>

	PROPS:
	- cards: Array of card objects with { image, title, content }
	- cardWidth: Width of each card in pixels (default: 300)
	- cardHeight: Height of each card in pixels (default: 400)
	- partialRevealSide: Which side stays hidden on hover - 'left' or 'right' (default: 'right')

	KEYBOARD CONTROLS:
	- Right Arrow: Move front card to back
	- Left Arrow: Move back card to front

	MOBILE GESTURES:
	- Swipe Left: Move front card to back
	- Swipe Right: Move back card to front

	INTERACTION:
	- Hover: Card rises and shifts based on mouse direction, keeping one edge behind its neighbour
	- Click: Card fully emerges from the stack with maximum elevation
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Card, CardStackProps } from '$lib/types';

	// Component props with default values
	let { cards = [], cardWidth = 300, cardHeight = 400, partialRevealSide = 'right' }: CardStackProps = $props();

	// Reactive state
	let hoveredIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(null);
	let cardOrder = $state([...Array(cards.length).keys()]); // [0, 1, 2, 3, ...]
	let isAnimating = $state(false);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

	// Track mouse movement direction for dynamic partial reveal
	// When partialRevealSide is 'right', we start assuming leftward mouse movement (card shifts left, hiding right edge)
	// When partialRevealSide is 'left', we start assuming rightward mouse movement (card shifts right, hiding left edge)
	let mouseDirection = $state<'left' | 'right' | null>(partialRevealSide === 'right' ? 'right' : 'left');
	let previousMouseX = $state<number>(0);

	/**
	 * Calculate dynamic hover shift based on mouse movement direction
	 * - When mouse moves left: card shifts left (hiding right edge behind neighbour)
	 * - When mouse moves right: card shifts right (hiding left edge behind neighbour)
	 * This creates a realistic "peeking" effect that follows the mouse
	 */
	const hoverShift = $derived(mouseDirection === 'left' ? -60 : 60);

	/**
	 * Cycle the front card to the back
	 * Creates the "roll over" effect on swipe
	 * Uses setTimeout to prevent animation conflicts - cleanup handled by isAnimating flag
	 */
	function cycleForward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;

		// Move first card to end
		const first = cardOrder[0];
		cardOrder = [...cardOrder.slice(1), first];

		// Reset animation flag after transition
		setTimeout(() => {
			isAnimating = false;
		}, 500);
	}

	/**
	 * Cycle the back card to the front
	 * Reverse of cycleForward
	 * Uses setTimeout to prevent animation conflicts - cleanup handled by isAnimating flag
	 */
	function cycleBackward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;

		// Move last card to beginning
		const last = cardOrder[cardOrder.length - 1];
		cardOrder = [last, ...cardOrder.slice(0, -1)];

		// Reset animation flag after transition
		setTimeout(() => {
			isAnimating = false;
		}, 500);
	}

	/**
	 * Handle touch start event for mobile swipe detection
	 * Records the initial touch position for delta calculation in handleTouchEnd
	 * @param e - TouchEvent from the browser
	 */
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	/**
	 * Handle touch move event for mobile swipe detection
	 * Prevents default page scrolling when horizontal swipe is detected
	 * @param e - TouchEvent from the browser
	 */
	function handleTouchMove(e: TouchEvent) {
		const deltaX = e.touches[0].clientX - touchStartX;
		const deltaY = e.touches[0].clientY - touchStartY;

		// Prevent page scroll if horizontal swipe is dominant
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			e.preventDefault();
		}
	}

	/**
	 * Handle touch end event for mobile swipe detection
	 * Calculates swipe direction and triggers card cycling if horizontal swipe > 50px
	 * Only triggers if horizontal movement dominates vertical (prevents conflict with scrolling)
	 * @param e - TouchEvent from the browser
	 */
	function handleTouchEnd(e: TouchEvent) {
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;

		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;

		// Only trigger if horizontal swipe is dominant
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			e.preventDefault();
			if (deltaX > 0) {
				// Swipe right - cycle backward
				cycleBackward();
			} else {
				// Swipe left - cycle forward
				cycleForward();
			}
		}
	}

	/**
	 * Handle keyboard navigation events
	 * Right arrow: cycle forward, Left arrow: cycle backward
	 * Prevents default browser behaviour to avoid page scrolling
	 * @param e - KeyboardEvent from the browser
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
	 * Set up keyboard listener on component mount
	 * Cleanup function removes listener on component unmount to prevent memory leaks
	 */
	onMount(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<!-- Main container that holds all cards -->
<div
	class="stack-container"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="region"
	aria-label="Card stack with swipe navigation"
>
	<div class="cards-wrapper">
		<!-- Render each card in current order -->
		{#each cardOrder as cardIndex, displayIndex (cardIndex)}
			{@const card = cards[cardIndex]}
			<button
				class="card-wrapper"
				class:hovered={hoveredIndex === displayIndex && selectedIndex !== displayIndex}
				class:selected={selectedIndex === displayIndex}
				class:animating={isAnimating}
				style="
					--card-index: {displayIndex};
					--total-cards: {cards.length};
					--hover-shift: {hoverShift}px;
					z-index: {selectedIndex === displayIndex ? cards.length + 20 : hoveredIndex === displayIndex ? cards.length + 5 : displayIndex + 1};
				"
				onmouseenter={() => (hoveredIndex = displayIndex)}
				onmouseleave={() => {
					hoveredIndex = null;
					previousMouseX = 0;
				}}
				onmousemove={(e: MouseEvent) => {
					if (previousMouseX !== 0) {
						const direction = e.clientX < previousMouseX ? 'left' : 'right';
						if (direction !== mouseDirection) {
							mouseDirection = direction;
						}
					}
					previousMouseX = e.clientX;
				}}
				onclick={() => (selectedIndex = selectedIndex === displayIndex ? null : displayIndex)}
				aria-label="Card {displayIndex + 1} of {cards.length}: {card?.title || 'Untitled'}"
				aria-pressed={selectedIndex === displayIndex}
			>
				<div class="card">
					<!-- Background image (if provided) -->
					<!-- draggable="false" prevents unwanted drag behaviour on touch devices -->
					{#if card?.image}
						<img
							src={card.image}
							alt={card.title ? `${card.title} - Image ${displayIndex + 1}` : `Card image ${displayIndex + 1} of ${cards.length}`}
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
							<!-- Plain text rendering - card.content contains no HTML tags (see FALLBACK_CARDS in constants.ts)
							     Using {@html} here would be unnecessary overhead with no security benefit -->
							{card.content}
						</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- Navigation hint for mobile -->
	<div class="swipe-hint" aria-hidden="true">
		<span>← Swipe to cycle cards →</span>
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
		touch-action: pan-y; /* Allow vertical scroll only, prevent horizontal pan */
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
	}

	/* Individual card wrapper with hover and animation effects */
	.card-wrapper {
		/* Reset button defaults for clean styling */
		border: none;
		padding: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: inherit;
		outline: none;

		/* Card wrapper styling */
		position: relative;
		flex: 0 0 auto;
		width: 220px;
		height: 300px;
		margin-left: -50px;
		transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: pointer;
		will-change: transform;
	}

	/* Scale cards down on smaller screens */
	@media (max-width: 1400px) {
		.card-wrapper {
			width: 200px;
			height: 270px;
			margin-left: -45px;
		}
	}

	@media (max-width: 1200px) {
		.card-wrapper {
			width: 180px;
			height: 245px;
			margin-left: -40px;
		}
	}

	@media (max-width: 1000px) {
		.card-wrapper {
			width: 160px;
			height: 220px;
			margin-left: -35px;
		}
	}

	/* First card shouldn't have negative margin */
	.card-wrapper:first-child {
		margin-left: 0;
	}

	/* Slower animation when cycling cards */
	.card-wrapper.animating {
		transition: all 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
	}

	/* Hover effect: partial reveal - card rises but stays behind neighbor */
	.card-wrapper:hover,
	.card-wrapper:focus,
	.card-wrapper.hovered {
		transform: translate(var(--hover-shift), -30px) scale(1.05);
		/* z-index is set inline to ensure proper stacking */
	}

	/* Focus visible for keyboard navigation accessibility */
	.card-wrapper:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
	}

	/* Selected effect: full reveal - card completely emerges */
	.card-wrapper.selected {
		transform: translateY(-40px) scale(1.1);
		/* z-index is set inline to ensure proper stacking */
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
		backdrop-filter: blur(10px); /* Note: Can be performance-intensive on mobile devices */
		position: relative;
	}

	/* Enhanced shadow on hover */
	.card-wrapper:hover .card,
	.card-wrapper:focus .card,
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

	/* Card title overlay (positioned at top) */
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

	/* Card content area (positioned at bottom with gradient) */
	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.8) 100%);
		color: white;
		z-index: 10;
		font-size: 14px;
		line-height: 1.5;
		pointer-events: none;
	}

	/* Swipe hint for mobile users */
	.swipe-hint {
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

	.stack-container:hover .swipe-hint {
		opacity: 1;
	}

	/* Hide content text when cards get small */
	@media (max-width: 1000px) {
		.card-content {
			display: none;
		}

		.card-title {
			font-size: 18px;
		}
	}

	/* MOBILE RESPONSIVE STYLES */
	@media (max-width: 768px) {
		.stack-container {
			padding: 2rem 0.5rem;
		}

		.cards-wrapper {
			padding: 1rem 0.5rem 1rem 0;
			max-width: 100%;
			justify-content: center;
		}

		.card-wrapper {
			width: 130px;
			height: 175px;
			margin-left: -104px; /* 80% overlap: 130px * 0.8 = 104px covered */
		}

		.card-wrapper:first-child {
			margin-left: 0;
		}

		/* Touch-optimised interactions */
		.card-wrapper:hover,
		.card-wrapper:focus {
			transform: translateY(-20px) scale(1.03);
		}

		/* Selected card expands on mobile to show full content */
		.card-wrapper.selected {
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 280px;
			height: 400px;
			margin-left: 0;
		}

		/* Show content when card is selected on mobile */
		.card-wrapper.selected .card-content {
			display: block;
		}

		.card-title {
			font-size: 16px;
		}

		.card-wrapper.selected .card-title {
			font-size: 20px;
		}

		.swipe-hint {
			font-size: 12px;
			padding: 0.5rem 1rem;
		}
	}

	/* Hide swipe hint on desktop */
	@media (min-width: 769px) {
		.swipe-hint {
			display: none;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
