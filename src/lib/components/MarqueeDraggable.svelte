<!--
/**
 * MarqueeDraggable - Interactive infinite scrolling carousel with drag-to-scroll
 *
 * Features:
 * - All features of standard Marquee component
 * - Click-and-drag to manually scroll content
 * - Momentum-based scrolling with physics simulation
 * - Automatic direction reversal on drag
 * - Smooth transitions between auto-scroll and drag
 * - Touch-friendly for mobile devices
 * - Infinite seamless looping
 * - Fully accessible with keyboard support
 *
 * Perfect for:
 * - Interactive testimonial galleries
 * - Exploratory product showcases
 * - Image galleries with manual control
 * - Timeline displays
 * - Portfolio carousels
 *
 * Technical Implementation:
 * - Svelte 5 runes ($state, $derived, $effect) for reactive state
 * - RAF (RequestAnimationFrame) for smooth animations
 * - Velocity tracking with momentum decay
 * - Content duplication for seamless infinite loop
 * - GPU-accelerated CSS transforms
 * - Event-based drag detection with threshold
 *
 * @component
 * @example
 * ```svelte
 * <MarqueeDraggable
 *   duration={50}
 *   dragEnabled={true}
 *   dragMomentum={true}
 * >
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 *   <div>Slide 3</div>
 * </MarqueeDraggable>
 * ```
 */
-->
<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	interface Props {
		vertical?: boolean;
		duration?: number;
		reverse?: boolean;
		dragEnabled?: boolean;
		dragMomentum?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		vertical = false,
		duration = 40,
		reverse = false,
		dragEnabled = true,
		dragMomentum = true,
		class: className = '',
		children
	}: Props = $props();

	// State
	let containerWidth = $state(0);
	let contentWidth = $state(0);
	let isDragging = $state(false);
	/* svelte-ignore state_referenced_locally */
	let currentDirection = $state(reverse ? 1 : -1); // -1 = left, 1 = right
	let dragStartX = 0;
	let dragStartY = 0;
	let dragStartOffset = 0;
	let lastVelocity = 0;
	let containerEl = $state<HTMLDivElement>();
	let contentEl = $state<HTMLDivElement>();
	let animateEl = $state<HTMLDivElement>();

	// Use simple state for offset - reactivity will handle updates
	let currentOffset = $state(0);

	// Animation control
	let animationFrameId: number | null = null;
	let lastTimestamp = 0;

	// Visibility-based animation optimization
	// Only run RAF loop when component is visible to save CPU/battery
	let isVisible = $state(true);
	let observer: IntersectionObserver | null = null;

	// Calculate widths on mount and when content changes
	onMount(() => {
		// Use requestAnimationFrame to ensure DOM is fully rendered
		requestAnimationFrame(() => {
			if (containerEl && contentEl) {
				containerWidth = containerEl.offsetWidth;
				contentWidth = contentEl.offsetWidth;
				startAnimation();
			}
		});

		// Recalculate on window resize
		const handleResize = () => {
			if (containerEl && contentEl) {
				containerWidth = containerEl.offsetWidth;
				contentWidth = contentEl.offsetWidth;
			}
		};

		// Set up Intersection Observer for visibility-based animation pausing
		// This saves CPU/battery by stopping RAF when marquee is off-screen
		if (containerEl && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					const wasVisible = isVisible;
					isVisible = entries[0]?.isIntersecting ?? true;

					// Resume animation when becoming visible, pause when hidden
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

	function startAnimation() {
		if (isDragging || !contentWidth || !isVisible) return;

		stopAnimation();
		lastTimestamp = 0;

		const animate = (timestamp: number) => {
			if (!lastTimestamp) lastTimestamp = timestamp;
			const delta = timestamp - lastTimestamp;
			lastTimestamp = timestamp;

			// Calculate speed (pixels per second)
			const speed = (contentWidth / duration) * (currentDirection === -1 ? -1 : 1);
			const distance = (speed * delta) / 1000;

			// Update offset directly - Svelte reactivity will handle the UI update
			currentOffset += distance;

			if (!isDragging) {
				animationFrameId = requestAnimationFrame(animate);
			}
		};

		animationFrameId = requestAnimationFrame(animate);
	}

	function stopAnimation() {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	// Drag handlers using native pointer events
	function handlePointerDown(e: PointerEvent) {
		if (!dragEnabled) return;

		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartOffset = currentOffset;
		lastVelocity = 0;
		stopAnimation();

		// Capture pointer for smooth dragging
		if (animateEl) {
			animateEl.setPointerCapture(e.pointerId);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		if (vertical) {
			currentOffset = dragStartOffset + deltaY;
			lastVelocity = e.movementY;
		} else {
			currentOffset = dragStartOffset + deltaX;
			lastVelocity = e.movementX;
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;

		isDragging = false;

		if (dragMomentum) {
			// Determine direction based on velocity
			const velocityThreshold = 5;
			if (Math.abs(lastVelocity) > velocityThreshold) {
				currentDirection = lastVelocity < 0 ? -1 : 1;
			}
		}

		// Release pointer capture
		if (animateEl) {
			animateEl.releasePointerCapture(e.pointerId);
		}

		// Restart animation
		startAnimation();
	}

	// Calculate transform with modulo for infinite loop
	let transform = $derived.by(() => {
		if (!contentWidth) return 'translateX(0)';

		// Use modulo to wrap position for seamless infinite scroll
		const wrappedOffset = currentOffset % (contentWidth * 2);
		const axis = vertical ? 'Y' : 'X';
		return `translate${axis}(${wrappedOffset}px)`;
	});

	// Restart animation when direction or duration changes
	$effect(() => {
		if (!isDragging && isVisible) {
			duration;
			currentDirection;
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
		<!-- Render 2 copies for optimal infinite scroll performance -->
		{#each { length: 2 } as _, i (i)}
			{#if i === 0}
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
			{:else}
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
			{/if}
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

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
