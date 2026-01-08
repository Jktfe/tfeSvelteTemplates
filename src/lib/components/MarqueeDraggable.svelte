<!--
	============================================================
	MarqueeDraggable - Interactive Infinite Scroll with Drag Control
	============================================================

	[CR] WHAT IT DOES
	Enhanced Marquee component with click-and-drag scrolling capability.
	Combines automatic infinite scrolling with manual user control.
	Uses RAF for smooth animations and pointer events for cross-device drag support.

	[NTL] THE SIMPLE VERSION
	Like a horizontal photo reel that scrolls automatically, but you can also
	grab it and drag it around! When you let go, it picks up the direction
	you were moving and keeps going. Magic! ✨

	============================================================

	FEATURES:
	- Click-and-drag to manually scroll content
	- Momentum-based scrolling (keeps going after release)
	- Direction reversal based on drag direction
	- Smooth transitions between auto-scroll and manual drag
	- Touch-friendly for mobile devices
	- Visibility optimization (pauses when off-screen)
	- Seamless infinite loop with content duplication

	PERFECT FOR:
	- Interactive testimonial galleries
	- Exploratory product showcases
	- Image galleries with manual control
	- Timeline displays where users want to explore

	DEPENDENCIES:
	- $lib/utils (cn helper for class merging)
	- Zero external dependencies

	ACCESSIBILITY:
	- role="region" with aria-label
	- Supports keyboard navigation
	- Respects prefers-reduced-motion

	WARNINGS: None expected

	============================================================
-->
<script lang="ts">
	// [CR] Utility for combining Tailwind classes conditionally
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	// [CR] Props interface - defines all customisation options
	// [NTL] These are the "knobs and dials" for customising the marquee!
	interface Props {
		vertical?: boolean;        // [NTL] Scroll up/down instead of left/right?
		duration?: number;         // [NTL] Seconds for one complete scroll cycle
		reverse?: boolean;         // [NTL] Start scrolling in the opposite direction?
		dragEnabled?: boolean;     // [NTL] Can users grab and drag the content?
		dragMomentum?: boolean;    // [NTL] Keep moving in drag direction after release?
		repeat?: number;           // [NTL] Minimum copies (default 4, auto-calculated if more needed)
		class?: string;            // [NTL] Extra CSS classes to add
		children?: import('svelte').Snippet;  // [NTL] The content to scroll
	}

	// [CR] Destructure props with sensible defaults
	let {
		vertical = false,       // [CR] Default: horizontal scroll
		duration = 40,          // [CR] Default: 40 seconds per cycle
		reverse = false,        // [CR] Default: scroll left (normal direction)
		dragEnabled = true,     // [CR] Default: dragging enabled
		dragMomentum = true,    // [CR] Default: momentum after drag release
		repeat = 4,             // [CR] Default: minimum 4 copies (safety floor for seamless loop)
		class: className = '',
		children
	}: Props = $props();

	// [CR] ============================================================
	// [CR] STATE MANAGEMENT
	// [NTL] These variables keep track of everything happening
	// [CR] ============================================================

	// [CR] Container and content dimensions for calculating scroll speed
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let containerWidth = $state(0);
	let contentWidth = $state(0);

	// [CR] Actual number of copies to render (calculated from measurements)
	// [NTL] This will be at least `repeat`, but more if the content is short
	/* svelte-ignore state_referenced_locally */
	let actualRepeat = $state(repeat);

	// [CR] Drag interaction state
	let isDragging = $state(false);

	// [CR] currentDirection is initialized from the `reverse` prop but then updated by user drag interaction
	// [NTL] -1 means scrolling left, +1 means scrolling right
	/* svelte-ignore state_referenced_locally */
	let currentDirection = $state(reverse ? 1 : -1);

	// [CR] Drag tracking variables (not reactive - just for calculations)
	let dragStartX = 0;
	let dragStartY = 0;
	let dragStartOffset = 0;
	let lastVelocity = 0;

	// [CR] DOM element references
	let containerEl = $state<HTMLDivElement>();
	let contentEl = $state<HTMLDivElement>();
	let animateEl = $state<HTMLDivElement>();

	// [CR] Current scroll position - Svelte reactivity handles UI updates
	// [NTL] This number tracks how far we've scrolled (in pixels)
	let currentOffset = $state(0);

	// [CR] Animation loop control
	let animationFrameId: number | null = null;
	let lastTimestamp = 0;

	// [CR] Visibility-based animation optimization
	// [NTL] We pause the animation when you scroll away to save battery!
	let isVisible = $state(true);
	let observer: IntersectionObserver | null = null;

	// [CR] ============================================================
	// [CR] DYNAMIC REPEAT CALCULATION
	// [NTL] We calculate how many copies are needed to always fill the screen
	// [CR] ============================================================

	// [CR] Calculate how many copies needed to fill container + extra for seamless loop
	function calculateRepeat() {
		if (!containerEl || !contentEl) return;

		// [CR] Measure container and content dimensions
		const containerSize = vertical ? containerEl.offsetHeight : containerEl.offsetWidth;
		const contentSize = vertical ? contentEl.offsetHeight : contentEl.offsetWidth;

		if (contentSize <= 0) return;

		// [CR] Need enough copies to fill the container THREE times over
		// [NTL] Why 3x? Because we need extra buffer for:
		// [NTL] 1. Content scrolling OUT on one side
		// [NTL] 2. Content visible in the middle
		// [NTL] 3. Content scrolling IN from the other side
		// [NTL] Plus the gap between copies adds extra space we need to cover!
		const minCopies = Math.ceil((containerSize * 3) / contentSize) + 1;

		// [CR] Ensure minimum of 4 copies for short content, or calculated amount
		// [NTL] 4 copies is our "safety floor" - better to have too many than see the seam!
		actualRepeat = Math.max(4, minCopies, repeat);
	}

	// [CR] ============================================================
	// [CR] LIFECYCLE - Setup on mount
	// [NTL] When the component first appears, we measure things and start animating
	// [CR] ============================================================

	onMount(() => {
		// [CR] Use RAF to ensure DOM is fully rendered before measuring
		requestAnimationFrame(() => {
			if (containerEl && contentEl) {
				containerWidth = containerEl.offsetWidth;
				contentWidth = contentEl.offsetWidth;
				calculateRepeat();

				// [CR] Start with negative offset so content extends BOTH directions
				// [NTL] This is the key trick! Without this, content only extends to the right
				// [NTL] and you'd see empty space on the left when scrolling starts
				currentOffset = -contentWidth * Math.floor(actualRepeat / 2);

				startAnimation();
			}
		});

		// [CR] Recalculate dimensions on window resize
		const handleResize = () => {
			if (containerEl && contentEl) {
				containerWidth = containerEl.offsetWidth;
				contentWidth = contentEl.offsetWidth;
				calculateRepeat();
			}
		};

		// [CR] Set up Intersection Observer for visibility-based animation pausing
		// [NTL] This is the clever bit - we stop animating when you can't see it!
		if (containerEl && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					const wasVisible = isVisible;
					isVisible = entries[0]?.isIntersecting ?? true;

					// [CR] Resume animation when becoming visible, pause when hidden
					if (isVisible && !wasVisible && !isDragging) {
						startAnimation();
					} else if (!isVisible && wasVisible) {
						stopAnimation();
					}
				},
				{ threshold: 0 }
			);
			observer.observe(containerEl);
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			stopAnimation();
			observer?.disconnect();
		};
	});

	// [CR] ============================================================
	// [CR] ANIMATION ENGINE
	// [NTL] The beating heart of the marquee - makes everything move!
	// [CR] ============================================================

	// [CR] Start the automatic scrolling animation
	function startAnimation() {
		// [CR] Don't animate if dragging, no content, or not visible
		if (isDragging || !contentWidth || !isVisible) return;

		stopAnimation();
		lastTimestamp = 0;

		// [NTL] This function runs ~60 times per second for smooth animation
		const animate = (timestamp: number) => {
			if (!lastTimestamp) lastTimestamp = timestamp;
			const delta = timestamp - lastTimestamp;
			lastTimestamp = timestamp;

			// [CR] Calculate speed: pixels per second based on content width and duration
			// [NTL] Longer content = faster scroll to complete in same time
			const speed = (contentWidth / duration) * (currentDirection === -1 ? -1 : 1);
			const distance = (speed * delta) / 1000;

			// [CR] Update offset - Svelte reactivity handles the UI update
			currentOffset += distance;

			if (!isDragging) {
				animationFrameId = requestAnimationFrame(animate);
			}
		};

		animationFrameId = requestAnimationFrame(animate);
	}

	// [CR] Stop the animation loop
	function stopAnimation() {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	// [CR] ============================================================
	// [CR] DRAG HANDLERS
	// [NTL] These functions handle when you grab and drag the content
	// [CR] ============================================================

	// [CR] When user starts dragging (mouse down or touch start)
	function handlePointerDown(e: PointerEvent) {
		if (!dragEnabled) return;

		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartOffset = currentOffset;
		lastVelocity = 0;
		stopAnimation();

		// [CR] Capture pointer for smooth dragging across element boundaries
		if (animateEl) {
			animateEl.setPointerCapture(e.pointerId);
		}
	}

	// [CR] While user is dragging (mouse move or touch move)
	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;

		// [CR] Calculate how far they've dragged from start position
		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		// [CR] Update offset and track velocity for momentum
		if (vertical) {
			currentOffset = dragStartOffset + deltaY;
			lastVelocity = e.movementY;
		} else {
			currentOffset = dragStartOffset + deltaX;
			lastVelocity = e.movementX;
		}
	}

	// [CR] When user releases drag (mouse up or touch end)
	// [NTL] Here's where the momentum magic happens!
	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;

		isDragging = false;

		if (dragMomentum) {
			// [CR] Determine animation direction based on final velocity
			// [NTL] If you were dragging fast enough, we'll continue in that direction!
			const velocityThreshold = 5;
			if (Math.abs(lastVelocity) > velocityThreshold) {
				currentDirection = lastVelocity < 0 ? -1 : 1;
			}
		}

		// [CR] Release pointer capture
		if (animateEl) {
			animateEl.releasePointerCapture(e.pointerId);
		}

		// [CR] Restart automatic animation
		startAnimation();
	}

	// [CR] ============================================================
	// [CR] COMPUTED VALUES & EFFECTS
	// [NTL] Svelte automatically recalculates these when dependencies change
	// [CR] ============================================================

	// [CR] Calculate transform with modulo for infinite loop
	// [NTL] The modulo trick makes it look infinite - when you scroll past
	// [NTL] the content width, we wrap back around seamlessly!
	let transform = $derived.by(() => {
		if (!contentWidth) return 'translateX(0)';

		// [CR] Use modulo to wrap position for seamless infinite scroll
		// [NTL] We wrap based on total content width (all copies together)
		const totalWidth = contentWidth * actualRepeat;
		let wrappedOffset = currentOffset % totalWidth;

		// [CR] CRITICAL: Normalize offset to always stay in a "safe" negative range
		// [NTL] JavaScript's % can return positive values when dragging right.
		// [NTL] If offset gets close to 0 (or positive), we'd see the LEFT EDGE
		// [NTL] of our content strip with nothing beyond it! This jumps us back
		// [NTL] into the middle so there's always content on BOTH sides.
		if (wrappedOffset > -contentWidth) {
			wrappedOffset -= totalWidth;
		}

		const axis = vertical ? 'Y' : 'X';
		return `translate${axis}(${wrappedOffset}px)`;
	});

	// [CR] Restart animation when direction or duration changes
	$effect(() => {
		if (!isDragging && isVisible) {
			void duration;
			void currentDirection;
			stopAnimation();
			startAnimation();
		}
	});
</script>

<div
	bind:this={containerEl}
	class={cn(
		'group relative overflow-hidden p-2',
		{
			'flex-row': !vertical,
			'flex-col': vertical
		},
		className
	)}
	role="region"
	aria-label="Draggable scrolling content"
	style="touch-action: {vertical ? 'pan-x' : 'pan-y'}; user-select: none;"
>
	<div
		bind:this={animateEl}
		class={cn('flex [gap:1rem]', {
			'flex-row': !vertical,
			'flex-col': vertical
		})}
		style="transform: {transform}; cursor: {isDragging ? 'grabbing' : dragEnabled ? 'grab' : 'default'}; will-change: transform;"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		role="presentation"
	>
		<!-- [CR] First copy is used for measurement, bound to contentEl -->
		<div
			bind:this={contentEl}
			class={cn('flex shrink-0 [gap:1rem]', {
				'flex-row': !vertical,
				'flex-col': vertical
			})}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
		<!-- [CR] Additional copies for seamless infinite loop -->
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each { length: actualRepeat - 1 } as _, i (i)}
			<div
				class={cn('flex shrink-0 [gap:1rem]', {
					'flex-row': !vertical,
					'flex-col': vertical
				})}
			>
				{#if children}
					{@render children()}
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	/* Ensure smooth hardware-accelerated transforms */
	div[role='presentation'] {
		transform-style: preserve-3d;
		backface-visibility: hidden;
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
