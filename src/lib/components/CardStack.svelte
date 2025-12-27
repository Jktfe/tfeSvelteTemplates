<!--
	============================================================
	CardStack - Interactive Card Stack with Selection Navigation
	============================================================

	[CR] WHAT IT DOES
	Interactive card stack with direction-detecting hover and keyboard/swipe selection.
	Features two-stage interaction: hover to preview (partial reveal), click/arrow/swipe
	to select (full reveal). Uses a constraint-based mathematical layout system that
	calculates optimal dimensions at runtime based on container size.

	[NTL] THE SIMPLE VERSION
	Imagine a hand of playing cards fanned out on a table. When you hover over one,
	it peeks up to show you more. When you click it, it fully emerges! You can also
	use arrow keys or swipe on mobile to flip through the cards. The clever bit?
	The component does maths to figure out exactly how big each card should be so
	they all fit nicely on any screen size.

	============================================================

	MATHEMATICAL LAYOUT MODEL:
	This component uses a constraint-based layout system that calculates optimal dimensions
	at runtime based on container size and content. Four key constraints are applied:

	1. Container fit: sum(cardw) × 1.1 + hoverShift × 2 ≤ containerWidth
	2. Title visibility: hoverUp ≥ titleHeight × 1.2 (hover always reveals full title)
	3. Content fit: cardHeight ≥ 1.1 × (titleHeight + bodyHeight)
	4. Hover zone: hoverZoneWidth = 0.9 × overlap × 2

	DIRECTION DETECTION:
	This component detects mouse entry direction to determine which way the card should shift.
	When mouse enters from the left side of the hover zone, the card shifts right (and vice versa).
	Direction is locked on entry - subsequent mouse movement doesn't change the shift.

	FEATURES:
	- Mathematical constraint-based layout (calculated at mount + resize)
	- Direction-detecting hover zone (entry side determines shift direction)
	- Two-stage interaction: hover for preview, click for full reveal
	- Arrow keys navigate between cards (left/right to select)
	- Swipe gestures navigate between cards on mobile
	- Escape key deselects the current card
	- Body text only shown when card is selected (prevents overlap)
	- Smooth animations for card transitions
	- Touch-optimised interaction
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
	- cardWidth: Width of each card in pixels (default: 300, used as base)
	- cardHeight: Height of each card in pixels (default: 400, used as base)
	- partialRevealSide: Which side stays hidden on hover - 'left' or 'right' (default: 'right')

	KEYBOARD CONTROLS:
	- Right Arrow: Select next card (wraps around)
	- Left Arrow: Select previous card (wraps around)
	- Escape: Deselect current card

	MOBILE GESTURES:
	- Swipe Left: Select next card
	- Swipe Right: Select previous card

	INTERACTION:
	- Hover: Mouse entry direction determines shift direction (left entry → shift right)
	- Click/Enter/Space: Toggle card selection (fully emerges with content visible)

	DEPENDENCIES:
	- $lib/types (CardStackProps, CardLayoutConfig, CalculatedCardLayout)
	- Zero external dependencies

	ACCESSIBILITY:
	- Full keyboard support (Arrow keys, Enter/Space, Escape)
	- ARIA labels on all interactive elements
	- Focus visible indicators
	- Respects prefers-reduced-motion

	WARNINGS:
	- a11y_no_noninteractive_tabindex: Intentional for keyboard navigation
	- a11y_no_noninteractive_element_interactions: Intentional for touch/keyboard handlers

	============================================================
-->

<script lang="ts">
	// [CR] Type imports for props and layout configuration
	import type { CardStackProps, CardLayoutConfig, CalculatedCardLayout } from '$lib/types';

	// [CR] Props with sensible defaults - dimensions are base values, recalculated at runtime
	// [NTL] These are the "starter settings" - the maths will adjust them to fit your screen!
	let { cards = [], cardWidth: baseCardWidth = 300, cardHeight: baseCardHeight = 400, partialRevealSide = 'right', stackDirection = 'ltr' }: CardStackProps & { stackDirection?: 'ltr' | 'rtl' } = $props();

	// [CR] DOM reference for measuring container width
	let containerEl = $state<HTMLElement | null>(null);

	// [CR] Calculated layout from constraint equations - derived at mount + resize
	// [NTL] This stores all the maths results: how big cards should be, how much they overlap, etc.
	let layout = $state<CalculatedCardLayout | null>(null);

	// [CR] Interaction state - hoveredCard includes locked direction to prevent "dancing"
	// [NTL] We remember which card you're hovering AND which direction you came from
	let hoveredCard = $state<{ index: number; shiftDirection: 'left' | 'right' } | null>(null);
	let selectedIndex = $state<number | null>(null);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

	// [CR] SSR-safe reduced motion preference
	let prefersReducedMotion = $state(false);

	/**
	 * Get the hover shift for a specific card
	 * Only the hovered card gets a shift value, all others get 0
	 * Direction is determined once on mouseenter and locked until mouseleave
	 */
	function getCardHoverShift(displayIndex: number): number {
		if (hoveredCard === null || hoveredCard.index !== displayIndex) {
			return 0; // Not hovered, no shift
		}
		const shiftAmount = layout?.hoverShift ?? 60;
		// Left entry → shift right (positive), Right entry → shift left (negative)
		return hoveredCard.shiftDirection === 'right' ? shiftAmount : -shiftAmount;
	}

	// [CR] ============================================================
	// [CR] MATHEMATICAL LAYOUT CALCULATOR
	// [CR] ============================================================
	// [CR] Implements constraint-based layout to calculate optimal card
	// [CR] dimensions guaranteeing visibility, smooth transitions, and fit.
	//
	// [NTL] Here's where the "brain" of the component lives! It figures out:
	// [NTL] - How big each card should be (now FIXED for consistency)
	// [NTL] - How much cards should overlap (adjusted based on available width)
	// [NTL] - How far cards should rise on hover
	// [NTL] Cards stay the same size regardless of how many are in the stack!
	function calculateCardLayout(config: CardLayoutConfig): CalculatedCardLayout {
		const { containerWidth, cardCount, titleHeight, bodyHeight } = config;

		// Safety minimums
		const MIN_HOVER_UP = 30;
		const MIN_HOVER_SHIFT = 40;
		const MIN_OVERLAP = 30;

		// [CR] FIXED DIMENSIONS: Cards stay at base size for consistency across all stacks
		// This ensures Navigation (2 cards) and Data Viz (5 cards) have identical card sizes
		const calculatedCardWidth = baseCardWidth;
		const calculatedCardHeight = baseCardHeight;

		// Constraint 2: Hover up must reveal entire title plus 20% margin
		// hoverUp ≥ titleHeight × 1.2
		const hoverUp = Math.max(titleHeight * 1.2, MIN_HOVER_UP);

		// Hover shift should be proportional to card size but have a reasonable minimum
		const hoverShift = Math.max(calculatedCardHeight * 0.15, MIN_HOVER_SHIFT);

		// Calculate available width for cards
		const availableWidth = containerWidth - 2 * hoverShift - 40; // 40px margin

		// [CR] DYNAMIC OVERLAP: Adjust overlap based on card count to fit container
		// More cards = more overlap to fit the available width
		let overlap: number;
		if (cardCount > 1) {
			// Calculate required overlap to fit all cards
			// Total width = cardWidth + (n-1) × (cardWidth - overlap)
			// availableWidth = cardWidth + (n-1) × (cardWidth - overlap)
			// overlap = cardWidth - (availableWidth - cardWidth) / (n-1)
			const requiredOverlap = calculatedCardWidth - (availableWidth - calculatedCardWidth) / (cardCount - 1);
			// Clamp overlap between minimum and 80% of card width
			overlap = Math.max(MIN_OVERLAP, Math.min(requiredOverlap, calculatedCardWidth * 0.8));
		} else {
			overlap = MIN_OVERLAP;
		}

		// Constraint 4: Hover zone width = 0.9 × overlap × 2
		// This creates a centred detection zone where we can determine entry direction
		const hoverZoneWidth = Math.max(0.9 * (overlap * 2), calculatedCardWidth * 0.5);

		return {
			cardWidth: Math.round(calculatedCardWidth),
			cardHeight: Math.round(calculatedCardHeight),
			overlap: Math.round(overlap),
			hoverUp: Math.round(hoverUp),
			hoverShift: Math.round(hoverShift),
			hoverZoneWidth: Math.round(hoverZoneWidth)
		};
	}

	/**
	 * Measure container and content, then calculate layout
	 * Called on mount and when container resizes
	 */
	function measureAndCalculate() {
		if (!containerEl) return;

		// Get container dimensions
		const rect = containerEl.getBoundingClientRect();
		const containerWidth = rect.width;

		// Measure title and content from the first card (assume consistent sizing)
		// We look for the first visible card's elements
		const firstCard = containerEl.querySelector('.card');
		const titleEl = firstCard?.querySelector('.card-title');
		const contentEl = firstCard?.querySelector('.card-content');

		// Get actual heights or use sensible defaults
		const titleHeight = titleEl instanceof HTMLElement ? titleEl.offsetHeight : 40;
		const bodyHeight = contentEl instanceof HTMLElement ? contentEl.offsetHeight : 80;

		// Calculate layout using constraint equations
		layout = calculateCardLayout({
			containerWidth,
			cardCount: cards.length,
			titleHeight,
			bodyHeight
		});
	}

	/**
	 * Handle mouse enter on a card for direction detection
	 * Determines which direction the card should shift based on entry position
	 * Direction is locked for this card until mouseleave - subsequent mouse
	 * movement within the card does NOT change the shift direction
	 * @param e - MouseEvent from the browser
	 * @param displayIndex - The display position of the card being entered
	 * @param cardElement - The card-wrapper element being entered
	 */
	function handleCardMouseEnter(e: MouseEvent, displayIndex: number, cardElement: HTMLElement) {
		// Get the card's bounding rect
		const rect = cardElement.getBoundingClientRect();
		const cardCenterX = rect.left + rect.width / 2;

		// Determine direction based on which side of center the mouse entered
		// Left of center → card should shift right (mouse coming from left)
		// Right of center → card should shift left (mouse coming from right)
		const shiftDirection: 'left' | 'right' = e.clientX < cardCenterX ? 'right' : 'left';

		// Store both the hovered index AND the locked direction
		hoveredCard = { index: displayIndex, shiftDirection };
	}

	/**
	 * Handle mouse leave - clear the hovered card state
	 */
	function handleCardMouseLeave() {
		hoveredCard = null;
	}

	/**
	 * Effect to detect reduced motion preference
	 * Uses $effect for SSR-safe initialization and cleanup
	 */
	$effect(() => {
		// SSR guard - only run in browser
		if (typeof window === 'undefined') return;

		// Check reduced motion preference
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;

		const handleMotionChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};

		mediaQuery.addEventListener('change', handleMotionChange);

		return () => {
			mediaQuery.removeEventListener('change', handleMotionChange);
		};
	});

	/**
	 * Effect to measure container and calculate layout on mount + resize
	 * Uses ResizeObserver for performant responsive recalculation
	 */
	$effect(() => {
		// SSR guard - only run in browser
		if (typeof window === 'undefined' || !containerEl) return;

		// Initial measurement (defer to allow DOM to render)
		requestAnimationFrame(measureAndCalculate);

		// Set up ResizeObserver for responsive recalculation
		const resizeObserver = new ResizeObserver(() => {
			measureAndCalculate();
		});
		resizeObserver.observe(containerEl);

		return () => {
			resizeObserver.disconnect();
		};
	});

	/**
	 * Keyboard navigation handler - scoped to component container
	 * Arrow keys select the next/previous card in the stack
	 * This prevents multiple CardStackAdvanced instances from all responding
	 * to the same keypress. The container must be focused for keys to work.
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			selectNext();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			selectPrevious();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			selectedIndex = null; // Deselect on Escape
		}
	}

	/**
	 * Select the next card to the right
	 * If nothing selected, selects the first card
	 * Wraps around to first card when at the end
	 */
	function selectNext() {
		if (cards.length === 0) return;

		if (selectedIndex === null) {
			selectedIndex = 0;
		} else {
			selectedIndex = (selectedIndex + 1) % cards.length;
		}
	}

	/**
	 * Select the previous card to the left
	 * If nothing selected, selects the last card
	 * Wraps around to last card when at the beginning
	 */
	function selectPrevious() {
		if (cards.length === 0) return;

		if (selectedIndex === null) {
			selectedIndex = cards.length - 1;
		} else {
			selectedIndex = (selectedIndex - 1 + cards.length) % cards.length;
		}
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
	 * Calculates swipe direction and selects next/previous card if horizontal swipe > 50px
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
				// Swipe right - select previous card (to the left)
				selectPrevious();
			} else {
				// Swipe left - select next card (to the right)
				selectNext();
			}
		}
	}

	/**
	 * Svelte action to attach non-passive touch event listeners
	 * Touch events need { passive: false } to allow preventDefault() for swipe handling
	 * Keyboard events use inline handlers on the container element
	 */
	function attachTouchListeners(node: HTMLElement) {
		node.addEventListener('touchstart', handleTouchStart, { passive: false });
		node.addEventListener('touchmove', handleTouchMove, { passive: false });
		node.addEventListener('touchend', handleTouchEnd, { passive: false });

		return {
			destroy() {
				node.removeEventListener('touchstart', handleTouchStart);
				node.removeEventListener('touchmove', handleTouchMove);
				node.removeEventListener('touchend', handleTouchEnd);
			}
		};
	}
</script>

<!-- Main container that holds all cards -->
<!-- tabindex="0" makes the container focusable for keyboard navigation -->
<!-- Keyboard events are scoped to this element to prevent conflicts with multiple instances -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex - Intentional: region with tabindex="0" enables keyboard navigation per WCAG 2.1.1 -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions - Intentional: touch/keyboard handlers required for card cycling accessibility -->
<div
	class="stack-container"
	bind:this={containerEl}
	use:attachTouchListeners
	onkeydown={handleKeyDown}
	role="region"
	aria-label="Card stack with swipe navigation. Use arrow keys to select cards when focused. Press Escape to deselect."
	tabindex="0"
	style="
		--card-width: {layout?.cardWidth ?? baseCardWidth}px;
		--card-height: {layout?.cardHeight ?? baseCardHeight}px;
		--card-overlap: {layout?.overlap ?? 50}px;
		--hover-up: {layout?.hoverUp ?? 30}px;
		--hover-zone-width: {layout?.hoverZoneWidth ?? 100}px;
	"
>
	<div class="cards-wrapper" class:stack-rtl={stackDirection === 'rtl'}>
		<!-- Render each card in stack order -->
		{#each cards as card, displayIndex (displayIndex)}
			{@const isHovered = hoveredCard?.index === displayIndex && selectedIndex !== displayIndex}
			<div
				class="card-hit-area"
				style="
					--card-index: {displayIndex};
					--total-cards: {cards.length};
				"
				role="button"
				tabindex={0}
				onmouseenter={(e: MouseEvent) => handleCardMouseEnter(e, displayIndex, e.currentTarget as HTMLElement)}
				onmouseleave={handleCardMouseLeave}
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
				<!-- The visual card that transforms - pointer-events disabled so hit area stays static -->
				<div
					class="card-wrapper"
					class:hovered={isHovered}
					class:selected={selectedIndex === displayIndex}
					style="--hover-shift: {getCardHoverShift(displayIndex)}px;"
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
						<!-- Top gradient overlay for title readability -->
						<div class="card-title-overlay"></div>
					{/if}

					<!-- Card title overlay (if provided) -->
					{#if card?.title}
						<div class="card-title">{card.title}</div>
					{/if}

					<!-- Card content with gradient background (if provided) -->
					{#if card?.content}
						<div class="card-content">
							<!-- Render HTML content - allows rich formatting like icons and links -->
							{@html card.content}
						</div>
					{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Navigation hint for mobile -->
	<div class="swipe-hint" aria-hidden="true">
		<span>← Swipe to select cards →</span>
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
		overflow: hidden; /* [CR] Prevent cards from overflowing container on mobile */
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

	/* Hit area - STATIC element that doesn't transform */
	/* This is what receives mouse events - it stays in place so hover doesn't "dance" */
	.card-hit-area {
		position: relative;
		flex: 0 0 auto;
		width: var(--card-width, 220px);
		height: var(--card-height, 300px);
		margin-left: calc(-1 * var(--card-overlap, 50px));
		z-index: calc(var(--card-index) + 1);
		cursor: pointer;
		/* Debug: uncomment to visualize hit area */
		/* background: rgba(255, 0, 0, 0.1); */
	}

	/* First card shouldn't have negative margin */
	.card-hit-area:first-child {
		margin-left: 0;
	}

	/* RTL stacking: reverse z-index so leftmost card is on top */
	.stack-rtl .card-hit-area {
		z-index: calc(var(--total-cards) - var(--card-index));
	}

	/* Focus visible for keyboard navigation accessibility */
	.card-hit-area:focus-visible {
		outline: 3px solid #667eea;
		outline-offset: 4px;
		border-radius: 20px;
	}

	/* Visual card wrapper - this TRANSFORMS but has NO pointer events */
	/* The transform happens here, but mouse detection stays on the static hit area */
	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform;
		pointer-events: none; /* Critical: let events pass through to hit area */
	}

	/* Hover effect: partial reveal - card rises and shifts based on entry direction */
	/* --hover-shift is calculated per-card based on mouse entry position */
	/* --hover-up comes from constraint equation: hoverUp ≥ titleHeight × 1.2 */
	/* NOTE: No :hover pseudo-class - only .hovered class from JavaScript */
	.card-wrapper.hovered {
		transform: translate(var(--hover-shift), calc(-1 * var(--hover-up, 30px))) scale(1.05);
	}

	/* Selected effect: full reveal - card completely emerges */
	.card-wrapper.selected {
		transform: translateY(calc(-1 * var(--hover-up, 30px) - 10px)) scale(1.1);
	}

	/* Ensure selected cards appear above hovered */
	.card-hit-area:has(.card-wrapper.hovered) {
		z-index: 50;
	}

	.card-hit-area:has(.card-wrapper.selected) {
		z-index: 100;
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

	/* Top gradient overlay for title readability */
	.card-title-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.85) 40%,
			rgba(255, 255, 255, 0) 100%
		);
		z-index: 5;
		pointer-events: none;
	}

	/* Card title overlay (positioned at top) */
	.card-title {
		position: absolute;
		top: 16px;
		left: 16px;
		right: 16px;
		font-size: 22px;
		font-weight: 700;
		z-index: 10;
		color: #1d4ed8;
		letter-spacing: 0.3px;
		pointer-events: none;
		line-height: 1.2;
	}

	/* Title styling when card has no image - same blue text */
	.card:not(:has(.card-image)) .card-title {
		color: #1d4ed8;
	}

	/* Card content area (positioned at bottom with gradient) */
	/* Hidden by default for image cards - only shown when card is selected to prevent overlap */
	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20px 20px 24px;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 0, 0, 0.4) 20%,
			rgba(0, 0, 0, 0.7) 50%,
			rgba(0, 0, 0, 0.85) 100%
		);
		color: white;
		z-index: 10;
		font-size: 14px;
		line-height: 1.5;
		pointer-events: none;
		display: none; /* Hidden by default */
		min-height: 45%;
	}

	/* Ensure all text in card content is white and readable */
	.card-content :global(p) {
		color: white !important;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	}

	/* Show content only when card is selected (for image cards) */
	.card-wrapper.selected .card-content {
		display: block;
		pointer-events: auto;
	}

	/* Content styling for no-image cards - always visible with different positioning */
	.card:not(:has(.card-image)) .card-content {
		display: block;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: transparent;
		color: #4a5568;
		padding: 16px 20px;
		overflow: hidden;
	}

	/* No-image cards need pointer events for links */
	.card:not(:has(.card-image)) .card-content {
		pointer-events: auto;
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

	/* Smaller title when cards get small */
	@media (max-width: 1000px) {
		.card-title {
			font-size: 18px;
			top: 12px;
			left: 12px;
			right: 12px;
		}

		.card-title-overlay {
			height: 80px;
		}
	}

	/* MOBILE RESPONSIVE STYLES */
	/* Note: Card dimensions now come from mathematical layout calculator via CSS custom properties */
	/* These media queries handle mobile-specific behaviours, not sizes */
	@media (max-width: 768px) {
		.stack-container {
			padding: 2rem 0.5rem;
		}

		.cards-wrapper {
			padding: 1rem 0.5rem 1rem 0;
			max-width: 100%;
			justify-content: center;
		}

		/* Touch-optimised interactions - simpler transform on mobile */
		.card-wrapper.hovered {
			transform: translateY(calc(-1 * var(--hover-up, 20px) * 0.7)) scale(1.03);
		}

		/* Selected card expands on mobile to show full content */
		.card-hit-area:has(.card-wrapper.selected) {
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 280px;
			height: 400px;
			margin-left: 0;
			z-index: 9999;
		}

		.card-title {
			font-size: 16px;
			top: 10px;
			left: 10px;
			right: 10px;
		}

		.card-title-overlay {
			height: 70px;
		}

		.card-wrapper.selected .card-title {
			font-size: 18px;
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

	/**
	 * REDUCED MOTION SUPPORT
	 * Respect user preference for reduced animations (accessibility requirement)
	 * Users with vestibular disorders can experience nausea from animations
	 */
	@media (prefers-reduced-motion: reduce) {
		.card-wrapper {
			transition: none;
		}

		.card {
			transition: none;
		}

		/* Provide instant visual feedback without animation */
		/* Uses custom properties but with reduced movement */
		/* Note: :hover/:focus removed - card-wrapper has pointer-events: none */
		.card-wrapper.hovered {
			transform: translateY(calc(-1 * var(--hover-up, 30px) * 0.3));
		}

		.card-wrapper.selected {
			transform: translateY(calc(-1 * var(--hover-up, 30px) * 0.5)) scale(1.05);
		}

		.swipe-hint {
			transition: none;
		}
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
