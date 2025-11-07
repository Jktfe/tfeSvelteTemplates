<!--
	CardStackMotionFlip Component - Interactive Card Stack with FLIP Layout Animations

	Enhanced version with smooth FLIP-based layout animations and 3D roll effect.
	Features seamless position transitions, staggered animations, and deck-shuffling aesthetic.

	FEATURES:
	- FLIP layout animations for smooth position changes
	- 3D rotation effects (rotateY) during card cycling
	- Staggered card movements with configurable delay
	- Scale effects during roll animation
	- Keyboard navigation (arrow keys to cycle)
	- Touch-optimised swipe gestures
	- Respects prefers-reduced-motion accessibility setting
	- Fully accessible with semantic elements and ARIA labels

	USAGE:
	<CardStackMotionFlip
		cards={[
			{ image: '/path/to/image.jpg', title: 'Card Title', content: 'Description' },
			// ... more cards
		]}
		cardWidth={300}
		cardHeight={400}
		flipDuration={0.5}
		staggerDelay={0.05}
		enable3D={true}
	/>

	PROPS:
	- cards: Array of card objects with { image, title, content }
	- cardWidth: Width of each card in pixels (default: 300)
	- cardHeight: Height of each card in pixels (default: 400)
	- flipDuration: Duration of FLIP animations in seconds (default: 0.5)
	- staggerDelay: Delay between card animations in seconds (default: 0.05)
	- enable3D: Enable 3D transforms (default: true)
	- reducedMotion: Respect prefers-reduced-motion (default: true)

	KEYBOARD CONTROLS:
	- Right Arrow: Move front card to back
	- Left Arrow: Move back card to front

	TOUCH GESTURES:
	- Swipe Left: Move front card to back
	- Swipe Right: Move back card to front
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
		flipDuration = 0.5,
		staggerDelay = 0.05,
		enable3D = true,
		reducedMotion = true
	}: CardStackMotionProps = $props();

	// Reactive state
	let hoveredIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(null);
	let cardOrder = $state([...Array(cards.length).keys()]); // [0, 1, 2, 3, ...]
	let isAnimating = $state(false);
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let prefersReducedMotion = $state(false);

	// Animation state for tracking which cards are rolling
	let rollingCardIndex = $state<number | null>(null);

	/**
	 * Cycle the front card to the back with FLIP animation
	 * Creates the "roll over" effect
	 */
	function cycleForward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;
		rollingCardIndex = cardOrder[0];

		// Move first card to end
		const first = cardOrder[0];
		cardOrder = [...cardOrder.slice(1), first];

		// Reset animation flag and rolling index after transition
		setTimeout(
			() => {
				isAnimating = false;
				rollingCardIndex = null;
			},
			prefersReducedMotion ? 300 : (flipDuration + staggerDelay * cards.length) * 1000
		);
	}

	/**
	 * Cycle the back card to the front
	 * Reverse of cycleForward
	 */
	function cycleBackward() {
		if (isAnimating || cardOrder.length === 0) return;
		isAnimating = true;
		rollingCardIndex = cardOrder[cardOrder.length - 1];

		// Move last card to beginning
		const last = cardOrder[cardOrder.length - 1];
		cardOrder = [last, ...cardOrder.slice(0, -1)];

		// Reset animation flag and rolling index after transition
		setTimeout(
			() => {
				isAnimating = false;
				rollingCardIndex = null;
			},
			prefersReducedMotion ? 300 : (flipDuration + staggerDelay * cards.length) * 1000
		);
	}

	/**
	 * Handle touch start event for mobile swipe detection
	 */
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	/**
	 * Handle touch move event - prevent default for horizontal swipes
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
				cycleBackward();
			} else {
				cycleForward();
			}
		}
	}

	/**
	 * Handle keyboard navigation events
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
	// Media query change handler needs to be defined outside onMount for cleanup
	let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

	onMount(() => {
		// Check for reduced motion preference
		if (reducedMotion && window.matchMedia) {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;

			// Listen for changes
			mediaQueryListener = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};
			mediaQuery.addEventListener('change', mediaQueryListener);
		}

		// Keyboard listener
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			if (reducedMotion && window.matchMedia && mediaQueryListener) {
				const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
				mediaQuery.removeEventListener('change', mediaQueryListener);
			}
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
	function getZIndex(cardIndex: number, displayIndex: number): number {
		if (selectedIndex === displayIndex) return cards.length + 20;
		if (hoveredIndex === displayIndex) return cards.length + 5;
		// Card being rolled goes to back
		if (rollingCardIndex === cardIndex) return -1;
		return displayIndex + 1;
	}

	/**
	 * Determine if card is currently rolling
	 */
	function isRolling(cardIndex: number): boolean {
		return rollingCardIndex === cardIndex;
	}

	/**
	 * Get transition configuration with stagger
	 */
	function getTransition(displayIndex: number) {
		if (prefersReducedMotion) {
			return {
				duration: 0.2
			};
		}

		return {
			layout: {
				duration: flipDuration
			},
			rotateY: {
				duration: flipDuration * 1.2,
				delay: displayIndex * staggerDelay
			},
			scale: {
				duration: flipDuration,
				delay: displayIndex * staggerDelay
			},
			z: {
				duration: flipDuration,
				delay: displayIndex * staggerDelay
			}
		};
	}

	/**
	 * Get class string for card wrapper
	 */
	function getCardClass(cardIndex: number, displayIndex: number): string {
		const classes = ['card-wrapper'];
		if (hoveredIndex === displayIndex && selectedIndex !== displayIndex) classes.push('hovered');
		if (selectedIndex === displayIndex) classes.push('selected');
		if (isRolling(cardIndex)) classes.push('rolling');
		return classes.join(' ');
	}
</script>

<!-- Main container that holds all cards -->
<div
	class="stack-container"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="region"
	aria-label="Card stack with FLIP motion"
>
	<div class="cards-wrapper" style="perspective: 1200px;">
		<!-- Render each card in current order -->
		{#each cardOrder as cardIndex, displayIndex (cardIndex)}
			{@const card = cards[cardIndex]}
			{@const rolling = isRolling(cardIndex)}
			<motion.div
				layout
				animate={{
					x: getCardX(displayIndex),
					y: selectedIndex === displayIndex ? -40 : hoveredIndex === displayIndex ? -30 : 0,
					scale:
						selectedIndex === displayIndex
							? 1.1
							: hoveredIndex === displayIndex
								? 1.05
								: rolling
									? 0.8
									: 1,
					rotateY: enable3D && rolling && !prefersReducedMotion ? 180 : 0,
					z: rolling ? -100 * cards.length : -100 * displayIndex
				}}
				transition={getTransition(displayIndex)}
				class={getCardClass(cardIndex, displayIndex)}
				style="
					z-index: {getZIndex(cardIndex, displayIndex)};
					width: {cardWidth}px;
					height: {cardHeight}px;
				"
				role="button"
				tabindex="0"
				onmouseenter={() => (hoveredIndex = displayIndex)}
				onmouseleave={() => (hoveredIndex = null)}
				onclick={() => (selectedIndex = selectedIndex === displayIndex ? null : displayIndex)}
				onkeydown={(e: KeyboardEvent) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						selectedIndex = selectedIndex === displayIndex ? null : displayIndex;
					}
				}}
				aria-label="Card {displayIndex + 1} of {cards.length}: {card?.title || 'Untitled'}"
				aria-pressed={selectedIndex === displayIndex}
			>
					<div class="card {rolling ? 'rolling' : ''}">
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
		<span>← Swipe or use arrow keys to cycle →</span>
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
		touch-action: pan-y;
	}

	/* Wrapper for cards with 3D perspective */
	.cards-wrapper {
		display: flex;
		align-items: center;
		padding: 2rem 2rem 2rem 0;
		gap: 0;
		justify-content: center;
		max-width: 100%;
		overflow: visible;
		position: relative;
		height: 450px;
		transform-style: preserve-3d;
	}

	/* Individual card wrapper with FLIP animation */
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
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
		cursor: pointer;
		will-change: transform;
		transform-style: preserve-3d;
		display: block;
	}

	/* Focus visible for keyboard navigation */
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
	.card-wrapper:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
	}

	/* Rolling card styling */
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
	.card-wrapper.rolling {
		pointer-events: none;
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
		backface-visibility: hidden;
	}

	/* Enhanced shadow on hover */
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
	.card-wrapper.hovered .card,
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
	.card-wrapper:hover .card {
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	/* Maximum shadow on selected */
	/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
	.card-wrapper.selected .card {
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
	}

	/* Reduced shadow when rolling */
	.card.rolling {
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
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
		/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
		.card-wrapper {
			transition: transform 0.2s ease;
		}

		.cards-wrapper {
			perspective: none;
		}

		/* svelte-ignore css-unused-selector - Applied dynamically via getCardClass() */
		.card-wrapper {
			transform-style: flat;
		}
	}
</style>
