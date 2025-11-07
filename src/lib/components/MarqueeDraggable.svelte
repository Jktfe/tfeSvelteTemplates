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

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			stopAnimation();
		};
	});

	function startAnimation() {
		if (isDragging || !contentWidth) return;

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
		if (!isDragging) {
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
