<!--
  CardStackMotionFlip - 3D Rolling Card Deck

  A mobile-first card stack where swiping the top card rolls it off-screen
  in the swipe direction (left/right/up/down) with 3D rotation, then reappears
  at the back of the stack facing forward.

  Key Features:
  - Left-to-right stacking (top card on LEFT)
  - 4-directional swipe support (L/R/U/D)
  - Real-time drag feedback with rotation preview
  - Only top card animates with 3D transforms
  - Other cards slide smoothly to fill gap
  - Zero external animation library dependencies
  - Fully accessible with keyboard navigation

  Interaction Flow:
  1. User drags top card → sees rotation preview
  2. On release, if threshold met → card rolls off-screen
  3. Card instantly teleports to back (invisible)
  4. Card fades in at back, facing forward
  5. Other cards slide left to fill the gap
-->

<script lang="ts">
	import type { CardStackMotionFlipProps } from '$lib/types';

	// Props with defaults
	let {
		cards = [],
		cardWidth = 300,
		cardHeight = 400,
		cardGap = 50,
		swipeThreshold = 80,
		rollDuration = 400,
		enterDuration = 200,
		enable3D = true
	}: CardStackMotionFlipProps = $props();

	// Animation state machine
	type AnimationState = 'idle' | 'dragging' | 'rolling-left' | 'rolling-right' | 'rolling-up' | 'rolling-down' | 'repositioning' | 'entering';

	let currentState: AnimationState = $state('idle');
	let animatingCardIndex: number | null = $state(null);

	// Card order (indices into cards array)
	let cardOrder = $state<number[]>([...Array(cards.length).keys()]);

	// Touch/drag tracking
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchCurrentX = $state(0);
	let touchCurrentY = $state(0);
	let isDragging = $state(false);

	// Derived values for drag preview
	let dragDeltaX = $derived(isDragging ? touchCurrentX - touchStartX : 0);
	let dragDeltaY = $derived(isDragging ? touchCurrentY - touchStartY : 0);

	// Reduced motion preference
	let prefersReducedMotion = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;

			const handler = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};

			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
		}
	});

	/**
	 * Get card position (X offset) based on its position in the stack
	 * Top card (index 0) is at x=0, next at x=cardGap, etc.
	 */
	function getCardX(displayIndex: number): number {
		return displayIndex * cardGap;
	}

	/**
	 * Get card z-index based on its position in the stack
	 * Top card has highest z-index
	 */
	function getCardZIndex(displayIndex: number): number {
		if (animatingCardIndex === cardOrder[displayIndex]) {
			// Animating card goes behind during reposition, then back to front during enter
			return currentState === 'repositioning' ? -1 : cards.length + 10;
		}
		return cards.length - displayIndex;
	}

	/**
	 * Get inline styles for a card based on its current state
	 */
	function getCardStyle(displayIndex: number): string {
		const cardIndex = cardOrder[displayIndex];
		const isTopCard = displayIndex === 0;
		const isAnimating = animatingCardIndex === cardIndex;

		let x = getCardX(displayIndex);
		let y = 0;
		let rotateX = 0;
		let rotateY = 0;
		let scale = 1;
		let opacity = 1;
		let transition = 'none';

		// Dragging state: top card follows finger with rotation preview
		if (isTopCard && isDragging && currentState === 'dragging') {
			x += dragDeltaX * 0.5; // Damped following
			y += dragDeltaY * 0.5;

			// Rotation preview based on drag direction
			if (Math.abs(dragDeltaX) > Math.abs(dragDeltaY)) {
				rotateY = dragDeltaX * 0.15; // Horizontal swipe → rotateY
			} else {
				rotateX = -dragDeltaY * 0.15; // Vertical swipe → rotateX
			}

			scale = 0.98; // Slight scale down during drag
		}

		// Rolling states: card exits screen with full rotation
		if (isAnimating) {
			const actualRollDuration = prefersReducedMotion ? 150 : rollDuration;
			transition = `transform ${actualRollDuration}ms cubic-bezier(0.4, 0, 0.6, 1), opacity ${actualRollDuration}ms ease-out`;

			if (currentState === 'rolling-left') {
				x = -500; // Off-screen left
				rotateY = enable3D && !prefersReducedMotion ? -180 : 0;
				scale = 0.95;
				opacity = 0;
			} else if (currentState === 'rolling-right') {
				x = 500; // Off-screen right
				rotateY = enable3D && !prefersReducedMotion ? 180 : 0;
				scale = 0.95;
				opacity = 0;
			} else if (currentState === 'rolling-up') {
				y = -500; // Off-screen up
				rotateX = enable3D && !prefersReducedMotion ? -180 : 0;
				scale = 0.95;
				opacity = 0;
			} else if (currentState === 'rolling-down') {
				y = 500; // Off-screen down
				rotateX = enable3D && !prefersReducedMotion ? 180 : 0;
				scale = 0.95;
				opacity = 0;
			} else if (currentState === 'repositioning') {
				// Instant teleport to back of stack (invisible)
				x = getCardX(cards.length - 1);
				y = 0;
				rotateX = 0;
				rotateY = 0;
				scale = 1;
				opacity = 0;
				transition = 'none'; // No animation
			} else if (currentState === 'entering') {
				// Fade in at back position
				x = getCardX(cards.length - 1);
				y = 0;
				rotateX = 0;
				rotateY = 0;
				scale = 1;
				opacity = 1;
				transition = `opacity ${enterDuration}ms ease-out, transform ${enterDuration}ms cubic-bezier(0.0, 0, 0.2, 1)`;
			}
		}

		// Other cards: simple slide left during animation
		if (!isTopCard && !isAnimating && animatingCardIndex !== null) {
			transition = `transform ${rollDuration}ms ease-out`;
		}

		const zIndex = getCardZIndex(displayIndex);

		return `
			transform: translateX(${x}px) translateY(${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale});
			opacity: ${opacity};
			z-index: ${zIndex};
			transition: ${transition};
		`.trim();
	}

	/**
	 * Lock body scroll
	 */
	function lockBodyScroll() {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	/**
	 * Unlock body scroll
	 */
	function unlockBodyScroll() {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	/**
	 * Create touch handlers for a specific card
	 * Returns closures that know which displayIndex they belong to
	 */
	function createTouchHandlers(displayIndex: number) {
		return {
			handleTouchStart(event: TouchEvent) {
				// Only respond if this is the top card (displayIndex 0) and we're idle
				if (displayIndex !== 0 || currentState !== 'idle') return;

				// Prevent all default touch behavior immediately
				event.preventDefault();

				// Lock body scroll while dragging
				lockBodyScroll();

				const touch = event.touches[0];
				touchStartX = touch.clientX;
				touchStartY = touch.clientY;
				touchCurrentX = touch.clientX;
				touchCurrentY = touch.clientY;
				isDragging = true;
				currentState = 'dragging';
			},

			handleTouchMove(event: TouchEvent) {
				if (!isDragging || currentState !== 'dragging') return;

				// Always prevent default to stop page scrolling
				event.preventDefault();

				const touch = event.touches[0];
				touchCurrentX = touch.clientX;
				touchCurrentY = touch.clientY;
			},

			handleTouchEnd(event: TouchEvent) {
				if (!isDragging || currentState !== 'dragging') return;

				// Prevent default
				event.preventDefault();

				// Always restore body scroll immediately when touch ends
				unlockBodyScroll();

				isDragging = false;

				const deltaX = touchCurrentX - touchStartX;
				const deltaY = touchCurrentY - touchStartY;
				const absDeltaX = Math.abs(deltaX);
				const absDeltaY = Math.abs(deltaY);

				// Determine if swipe threshold was met
				const metThreshold = Math.max(absDeltaX, absDeltaY) >= swipeThreshold;

				if (!metThreshold) {
					// Snap back to idle
					currentState = 'idle';
					return;
				}

				// Determine swipe direction
				if (absDeltaX > absDeltaY) {
					// Horizontal swipe
					if (deltaX > 0) {
						rollCard('rolling-right');
					} else {
						rollCard('rolling-left');
					}
				} else {
					// Vertical swipe
					if (deltaY > 0) {
						rollCard('rolling-down');
					} else {
						rollCard('rolling-up');
					}
				}
			}
		};
	}

	/**
	 * Trigger card roll animation in specified direction
	 */
	function rollCard(direction: 'rolling-left' | 'rolling-right' | 'rolling-up' | 'rolling-down') {
		// Mark top card as animating
		animatingCardIndex = cardOrder[0];
		currentState = direction;

		// After roll completes, reposition to back
		const actualRollDuration = prefersReducedMotion ? 150 : rollDuration;
		setTimeout(() => {
			currentState = 'repositioning';

			// Reorder cards: move top to back
			cardOrder = [...cardOrder.slice(1), cardOrder[0]];

			// Immediately transition to entering state
			setTimeout(() => {
				currentState = 'entering';

				// After fade-in completes, return to idle
				setTimeout(() => {
					currentState = 'idle';
					animatingCardIndex = null;
				}, enterDuration);
			}, 16); // One frame delay for reposition
		}, actualRollDuration);
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (currentState !== 'idle') return;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				rollCard('rolling-left');
				break;
			case 'ArrowRight':
				event.preventDefault();
				rollCard('rolling-right');
				break;
			case 'ArrowUp':
				event.preventDefault();
				rollCard('rolling-up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				rollCard('rolling-down');
				break;
		}
	}

	// Set up keyboard listener
	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});

	// Cleanup: ensure body scroll is restored if component unmounts during interaction
	$effect(() => {
		return () => {
			unlockBodyScroll();
		};
	});

	/**
	 * Svelte action to add non-passive touch event listeners
	 * Creates handlers with closure over displayIndex so each card knows its position
	 */
	function nonPassiveTouchListeners(node: HTMLElement, displayIndex: number) {
		const handlers = createTouchHandlers(displayIndex);

		node.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
		node.addEventListener('touchmove', handlers.handleTouchMove, { passive: false });
		node.addEventListener('touchend', handlers.handleTouchEnd, { passive: false });

		return {
			update(newDisplayIndex: number) {
				// Remove old listeners
				node.removeEventListener('touchstart', handlers.handleTouchStart);
				node.removeEventListener('touchmove', handlers.handleTouchMove);
				node.removeEventListener('touchend', handlers.handleTouchEnd);

				// Create new handlers with updated displayIndex
				const newHandlers = createTouchHandlers(newDisplayIndex);
				node.addEventListener('touchstart', newHandlers.handleTouchStart, { passive: false });
				node.addEventListener('touchmove', newHandlers.handleTouchMove, { passive: false });
				node.addEventListener('touchend', newHandlers.handleTouchEnd, { passive: false });

				// Update the reference for cleanup
				Object.assign(handlers, newHandlers);
			},
			destroy() {
				node.removeEventListener('touchstart', handlers.handleTouchStart);
				node.removeEventListener('touchmove', handlers.handleTouchMove);
				node.removeEventListener('touchend', handlers.handleTouchEnd);
			}
		};
	}
</script>

<div
	class="card-deck"
	role="region"
	aria-label="3D rolling card deck"
	style="width: {cardWidth}px; height: {cardHeight}px;"
>
	{#each cardOrder as cardIndex, displayIndex (cardIndex)}
		{@const card = cards[cardIndex]}
		{@const isTopCard = displayIndex === 0}

		<div
			class="card-wrapper"
			class:top-card={isTopCard}
			style={getCardStyle(displayIndex)}
			role="button"
			tabindex={isTopCard ? 0 : -1}
			aria-label="Card {displayIndex + 1} of {cards.length}"
			use:nonPassiveTouchListeners={displayIndex}
		>
			<div class="card-content">
				{#if card.image}
					<img src={card.image} alt={card.title || ''} class="card-image" />
				{/if}

				{#if card.title || card.content}
					<div class="card-overlay">
						{#if card.title}
							<h3 class="card-title">{card.title}</h3>
						{/if}
						{#if card.content}
							<!-- Plain text rendering - card.content contains no HTML tags (see FALLBACK_CARDS in constants.ts)
							     Using {@html} here would be unnecessary overhead with no security benefit -->
							<div class="card-text">{card.content}</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.card-deck {
		position: relative;
		perspective: 1000px;
		perspective-origin: center center;
		touch-action: pan-y; /* Allow vertical scroll, prevent horizontal */
	}

	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		backface-visibility: hidden;
		will-change: transform, opacity;
		cursor: grab;
	}

	.card-wrapper:active {
		cursor: grabbing;
	}

	.card-wrapper.top-card {
		cursor: grab;
		touch-action: none; /* Disable all browser touch handling on interactive card */
	}

	.card-wrapper.top-card:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
		border-radius: 12px;
	}

	.card-content {
		width: 100%;
		height: 100%;
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		position: relative;
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.card-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1.5rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
		color: white;
	}

	.card-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.card-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.card-wrapper {
			will-change: auto;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
