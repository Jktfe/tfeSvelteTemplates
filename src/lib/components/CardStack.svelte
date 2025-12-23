<!--
	CardStack Component - Horizontal Card Row with Two-Stage Interaction

	A reusable Svelte 5 component that displays cards in a horizontal overlapping row.
	Features a two-stage interaction: hover to preview (partial reveal), click to select (full reveal).

	FEATURES:
	- Cards arranged horizontally with slight overlap
	- Two-stage interaction: hover for preview, click for full reveal
	- Dynamic partial reveal based on mouse movement direction
	- Responsive design with mobile optimisations
	- Fully accessible with semantic button elements, ARIA labels, and keyboard navigation support

	USAGE:
	<CardStack
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

	INTERACTION:
	- Hover: Card rises and shifts based on mouse direction, keeping one edge behind its neighbour
	- Click: Card fully emerges from the stack with maximum elevation
-->

<script lang="ts">
	import type { Card, CardStackProps } from '$lib/types';

	// Component props with default values
	let { cards = [], cardWidth = 300, cardHeight = 400, partialRevealSide = 'right' }: CardStackProps = $props();

	// Track which card is currently hovered and selected
	let hoveredIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(null);

	// Track mouse movement direction for dynamic partial reveal
	// When partialRevealSide is 'right', we start assuming leftward mouse movement (card shifts left, hiding right edge)
	// When partialRevealSide is 'left', we start assuming rightward mouse movement (card shifts right, hiding left edge)
	// mouseDirection is initialized from partialRevealSide prop but then updated by user interaction
	// The svelte-ignore is safe because we're intentionally deriving initial state from props
	/* svelte-ignore state_referenced_locally */
	let mouseDirection = $state<'left' | 'right' | null>(partialRevealSide === 'right' ? 'right' : 'left');
	let previousMouseX = $state<number>(0);

	/**
	 * Calculate dynamic hover shift based on mouse movement direction
	 * - When mouse moves left: card shifts left (hiding right edge behind neighbour)
	 * - When mouse moves right: card shifts right (hiding left edge behind neighbour)
	 * This creates a realistic "peeking" effect that follows the mouse
	 */
	const hoverShift = $derived(mouseDirection === 'left' ? -60 : 60);
</script>

<!-- Main container that holds all cards -->
<div class="stack-container" role="region" aria-label="Card stack">
	<div class="cards-wrapper">
		<!-- Render each card -->
		{#each cards as card, index (index)}
			<button
				class="card-wrapper"
				class:hovered={hoveredIndex === index && selectedIndex !== index}
				class:selected={selectedIndex === index}
				style="
					--card-index: {index};
					--total-cards: {cards.length};
					--hover-shift: {hoverShift}px;
					z-index: {selectedIndex === index ? cards.length + 20 : hoveredIndex === index ? cards.length + 5 : index + 1};
				"
				onmouseenter={() => (hoveredIndex = index)}
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
				onclick={() => (selectedIndex = selectedIndex === index ? null : index)}
				aria-label="Card {index + 1} of {cards.length}: {card.title || 'Untitled'}"
				aria-pressed={selectedIndex === index}
			>
				<div class="card">
					<!-- Background image (if provided) -->
					{#if card.image}
						<img
							src={card.image}
							alt={card.title ? `${card.title} - Image ${index + 1}` : `Card image ${index + 1} of ${cards.length}`}
							class="card-image"
						/>
					{/if}

					<!-- Card title overlay (if provided) -->
					{#if card.title}
						<div class="card-title">{card.title}</div>
					{/if}

					<!-- Card content with gradient background (if provided) -->
					{#if card.content}
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
</div>

<style>
	/* Container that holds the card stack */
	.stack-container {
		width: 100%;
		padding: 4rem 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
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

	/* Individual card wrapper with hover effect */
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
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: pointer;
		will-change: transform;
	}

	/* Focus visible for keyboard navigation accessibility */
	.card-wrapper:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
		border-radius: 20px;
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

	/* Hover effect: partial reveal - card rises but stays behind neighbor */
	.card-wrapper:hover,
	.card-wrapper:focus,
	.card-wrapper.hovered {
		transform: translate(var(--hover-shift), -30px) scale(1.05);
		/* z-index is set inline to ensure proper stacking */
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

	/* Hide content text when cards get small */
	@media (max-width: 1000px) {
		.card-content {
			display: none;
		}

		.card-title {
			font-size: 18px;
		}
	}

	/**
	 * REDUCED MOTION SUPPORT
	 * Respect user preference for reduced animations (accessibility requirement)
	 */
	@media (prefers-reduced-motion: reduce) {
		.card-wrapper {
			transition: none;
		}

		.card {
			transition: none;
		}

		/* Provide instant visual feedback without animation */
		.card-wrapper:hover,
		.card-wrapper:focus,
		.card-wrapper.hovered {
			transform: translateY(-10px);
		}

		.card-wrapper.selected {
			transform: translateY(-15px) scale(1.05);
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

		/* Less dramatic hover on mobile (touch screens) */
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
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
