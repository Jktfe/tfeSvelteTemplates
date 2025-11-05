<!--
	CardStackAdvanced Component - Precise Card Fan with Keyboard Support

	An enhanced version of CardStack with precise rotation values and keyboard navigation.
	Uses pre-calculated rotation angles for more natural card fanning.

	FEATURES:
	- All features from CardStack
	- Precise rotation calculations using pre-defined angles
	- Keyboard navigation (arrow keys)
	- Longer animation duration for smoother transitions
	- Enhanced visual styling (backdrop blur, stronger shadows)

	USAGE:
	<CardStackAdvanced
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

	KEYBOARD CONTROLS:
	- Right Arrow: Navigate to next card
	- Left Arrow: Navigate to previous card
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
	let velocity = $state(0); // Track drag velocity (for future enhancements)

	/**
	 * Precise rotation angles for each card position
	 * These values create a more natural, hand-tuned fan effect
	 * Calculated based on design specifications
	 *
	 * Index 0 (front card) = 39.5°, gradually decreases to nearly flat at the back
	 */
	const rotations = [
		39.5, 37.5, 28.96, 32.31, 25.61, 24.3, 15.11, 16.33, 11.22, 1.52, 4.99
	];

	/**
	 * Get the rotation angle for a card at a specific offset position
	 */
	function getRotation(index: number): number {
		if (index < rotations.length) {
			return rotations[index];
		}
		// Cards beyond our rotation array are laid flat
		return 0;
	}

	/**
	 * Calculate the transform properties for each card based on its position
	 * Similar to basic CardStack but with precise rotation values
	 */
	function getCardTransform(index: number): { scale: number; rotation: number; opacity: number } {
		const offset = index - currentIndex;

		// Hide cards that are behind the current card
		if (offset < 0) return { scale: 0, rotation: 0, opacity: 0 };

		// Precise scale values for each position (0-10)
		// Creates a smoother, more controlled size progression
		const scales = [0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94];
		const baseScale = scales[offset] ?? 0.94;
		const scale = Math.min(baseScale, 0.94);

		// Get pre-defined rotation for this card position
		// Reduced drag influence (0.05 vs 0.1) for more subtle feedback
		const baseRotation = getRotation(offset);
		const rotation = baseRotation + (isDragging ? (dragCurrent.x - dragStart.x) * 0.05 : 0);

		// Fade out cards beyond 9 positions
		const opacity = offset > 9 ? 0 : 1;

		return { scale, rotation, opacity };
	}

	/**
	 * MOUSE INTERACTION HANDLERS (Desktop)
	 * Similar to basic version but with velocity tracking
	 */

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // Only respond to left click
		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		dragCurrent = { ...dragStart };
		velocity = 0; // Reset velocity on new drag
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		dragCurrent = { x: e.clientX, y: e.clientY };
	}

	function handleMouseUp(_e: MouseEvent) {
		if (!isDragging) return;
		isDragging = false;

		const deltaX = dragCurrent.x - dragStart.x;
		const threshold = 40; // Slightly higher threshold for more deliberate actions

		// Drag right = next card, drag left = previous card
		if (deltaX > threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaX < -threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	/**
	 * TOUCH INTERACTION HANDLERS (Mobile)
	 * Vertical swiping for mobile devices
	 */

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		dragCurrent = { ...dragStart };
		velocity = 0;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	function handleTouchEnd(_e: TouchEvent) {
		if (!isDragging) return;
		isDragging = false;

		const deltaY = dragCurrent.y - dragStart.y;
		const threshold = 40;

		// Mobile: swipe up = next card, swipe down = prev card
		if (deltaY < -threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaY > threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	/**
	 * KEYBOARD NAVIGATION
	 * Arrow keys for accessibility and desktop convenience
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (e.key === 'ArrowLeft' && currentIndex > 0) {
			currentIndex--;
		}
	}

	// Set up global event listeners on component mount
	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('keydown', handleKeyDown);

		// Clean up event listeners when component is destroyed
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('keydown', handleKeyDown);
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
	role="button"
	aria-label="Card stack"
	tabindex="0"
>
	<!-- Render each card with its calculated transform -->
	{#each cards as card, index (index)}
		{@const transform = getCardTransform(index)}
		<div
			class="card-wrapper"
			class:dragging={isDragging}
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
				<!-- draggable="false" prevents default browser drag behaviour -->
				{#if card.image}
					<img src={card.image} alt={card.title} class="card-image" draggable="false" />
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
		outline: none; /* Remove focus outline (keyboard navigation still works) */
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
		/* Longer transition (0.5s) for smoother, more elegant animations */
		transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Smooth bounce effect */
		will-change: transform, opacity; /* Optimise for animation performance */
	}

	/* Disable transitions during active dragging for immediate feedback */
	.card-wrapper.dragging {
		transition: none;
	}

	/* The actual card content container */
	.card {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 16px; /* Slightly larger radius than basic version */
		overflow: hidden;
		background: #f5f5f5;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); /* Stronger, more dramatic shadow */
		backdrop-filter: blur(10px); /* Add blur effect for depth */
	}

	/* Background image styling */
	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover; /* Ensure image fills card without distortion */
		user-select: none;
		-webkit-user-drag: none; /* Prevent image dragging in WebKit browsers */
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
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* Stronger shadow for better readability */
		letter-spacing: 0.5px; /* Slightly wider letter spacing */
	}

	/* Card content area (positioned at bottom with gradient) */
	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		/* More sophisticated gradient with multiple stops */
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.8) 100%);
		color: white;
		z-index: 10;
		font-size: 14px;
		line-height: 1.5;
	}

	/* MOBILE RESPONSIVE STYLES */
	@media (max-width: 768px) {
		.stack-container {
			width: 100%;
			max-width: 320px;
			height: 420px;
		}

		/* Force centre-bottom pivot for mobile (override inline styles) */
		.card-wrapper {
			transform-origin: 50% 100% !important;
		}

		/* Larger border radius on mobile */
		.card {
			border-radius: 20px;
		}

		/* Smaller title on mobile */
		.card-title {
			font-size: 20px;
		}
	}
</style>
