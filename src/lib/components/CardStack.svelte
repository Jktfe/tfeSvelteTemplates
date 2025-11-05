<!--
	CardStack Component - Interactive Card Fan Display

	A reusable Svelte 5 component that displays cards in an interactive fan layout.
	Cards can be navigated via drag (desktop) or swipe (mobile) interactions.

	FEATURES:
	- Drag horizontally on desktop to navigate cards
	- Swipe vertically on mobile to navigate cards
	- Smooth animations with cubic-bezier easing
	- Responsive design with mobile optimisations
	- Accessible with ARIA labels

	USAGE:
	<CardStack
		cards={[
			{ image: '/path/to/image.jpg', title: 'Card Title', content: 'Description' },
			// ... more cards
		]}
		cardWidth={300}
		cardHeight={400}
	/>

	PROPS:
	- cards: Array of card objects with { image, title, content }
	- cardWidth: Width of each card in pixels (default: 300)
	- cardHeight: Height of each card in pixels (default: 400)
-->

<script lang="ts">
	import { onMount } from 'svelte';

	// Type definitions
	interface Card {
		image?: string;
		title?: string;
		content?: string;
	}

	// Component props with default values
	// cards: Array of card data objects
	// cardWidth/cardHeight: Dimensions for the card container
	let { cards = [], cardWidth = 300, cardHeight = 400 }: {
		cards?: Card[];
		cardWidth?: number;
		cardHeight?: number;
	} = $props();

	// Reactive state using Svelte 5 runes
	let currentIndex = $state(0); // Index of the currently focused card
	let isDragging = $state(false); // Whether user is currently dragging
	let dragStart = $state({ x: 0, y: 0 }); // Starting position of drag
	let dragCurrent = $state({ x: 0, y: 0 }); // Current position during drag
	let containerRef = $state<HTMLDivElement | null>(null); // Reference to container element

	/**
	 * Calculate the transform properties for each card based on its position
	 *
	 * VISUAL EFFECT:
	 * - Cards behind current are hidden (scale: 0, opacity: 0)
	 * - Current card and cards ahead fan out with increasing scale
	 * - Rotation creates the fan effect (30-45 degrees)
	 * - Cards respond to drag for dynamic rotation feedback
	 */
	function getCardTransform(index: number): { scale: number; rotation: number; opacity: number } {
		const offset = index - currentIndex;

		// Hide cards that are behind the current card
		if (offset < 0) return { scale: 0, rotation: 0, opacity: 0 };

		// Scale progression: starts at 0.34, increases by 0.084 per position, capped at 0.94
		// This creates a gradual size increase from back to front
		const baseScale = 0.34 + (offset * 0.084);
		const scale = Math.min(baseScale, 0.94);

		// Rotation creates the fan effect
		// Base rotation starts at 30° and increases 3° per position
		// During drag, rotation responds to horizontal movement for feedback
		const baseRotation = 30 + offset * 3;
		const rotation = baseRotation + (isDragging ? (dragCurrent.x - dragStart.x) * 0.1 : 0);

		// Fade out cards that are too far back (beyond 8 positions)
		const opacity = offset > 8 ? 0 : 1;

		return { scale, rotation, opacity };
	}

	/**
	 * MOUSE INTERACTION HANDLERS (Desktop)
	 * These handle horizontal dragging on desktop devices
	 */

	// Start dragging when mouse button is pressed
	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // Only respond to left click
		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		dragCurrent = { ...dragStart };
	}

	// Track mouse position during drag
	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		dragCurrent = { x: e.clientX, y: e.clientY };
	}

	// End drag and determine if we should navigate to next/previous card
	function handleMouseUp(_e: MouseEvent) {
		if (!isDragging) return;
		isDragging = false;

		const deltaX = dragCurrent.x - dragStart.x;
		const threshold = 30; // Minimum drag distance to trigger navigation

		// Drag right = next card, drag left = previous card
		if (deltaX > threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaX < -threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	/**
	 * TOUCH INTERACTION HANDLERS (Mobile)
	 * These handle vertical swiping on touch devices
	 */

	// Start touch interaction
	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		dragCurrent = { ...dragStart };
	}

	// Track finger position during swipe
	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	// End touch and determine if we should navigate
	function handleTouchEnd(_e: TouchEvent) {
		if (!isDragging) return;
		isDragging = false;

		const deltaY = dragCurrent.y - dragStart.y;
		const threshold = 30; // Minimum swipe distance to trigger navigation

		// Swipe up = next card, swipe down = previous card
		if (deltaY < -threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaY > threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	// Set up global mouse event listeners on component mount
	// These are global to track mouse movement even outside the component
	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		// Clean up event listeners when component is destroyed
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<!-- Global mousedown listener to initiate drag from anywhere -->
<svelte:document onmousedown={handleMouseDown} />

<!-- Main container that holds all cards -->
<div
	class="stack-container"
	bind:this={containerRef}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="region"
	aria-label="Card stack"
>
	<!-- Render each card with its calculated transform -->
	{#each cards as card, index (index)}
		{@const transform = getCardTransform(index)}
		<div
			class="card-wrapper"
			style="
				--scale: {transform.scale};
				--rotation: {transform.rotation}deg;
				--opacity: {transform.opacity};
				z-index: {index};
				transform: scale(var(--scale)) rotateZ(var(--rotation));
				opacity: var(--opacity);
			"
		>
			<div class="card">
				<!-- Background image (if provided) -->
				{#if card.image}
					<img src={card.image} alt={card.title} class="card-image" />
				{/if}

				<!-- Card title overlay (if provided) -->
				{#if card.title}
					<div class="card-title">{card.title}</div>
				{/if}

				<!-- Card content with gradient background (if provided) -->
				{#if card.content}
					<div class="card-content">
						{@html card.content}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	/* Global body styles - ensures no unwanted margins */
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
	}

	/* Container that holds the card stack */
	.stack-container {
		position: relative;
		width: 300px;
		height: 400px;
		perspective: 600px; /* Creates 3D perspective for rotation effect */
		cursor: grab;
		user-select: none; /* Prevent text selection during drag */
		-webkit-user-select: none;
		touch-action: none; /* Disable default touch behaviours */
	}

	/* Change cursor when actively dragging */
	.stack-container:active {
		cursor: grabbing;
	}

	/* Individual card wrapper that handles positioning and transforms */
	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-origin: 90% 90%; /* Rotation pivot point (bottom-right for fan effect) */
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Smooth bounce effect */
		will-change: transform; /* Optimise for animation performance */
	}

	/* The actual card content container */
	.card {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: white;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); /* Elevated shadow */
	}

	/* Background image styling */
	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover; /* Ensure image fills card without distortion */
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
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Ensure readability over images */
	}

	/* Card content area (positioned at bottom with gradient) */
	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
		color: white;
		z-index: 10;
	}

	/* MOBILE RESPONSIVE STYLES */
	@media (max-width: 768px) {
		.stack-container {
			width: 280px;
			height: 380px;
		}

		/* Change rotation pivot to centre-bottom for mobile */
		.card-wrapper {
			transform-origin: 50% 100%;
		}
	}
</style>
