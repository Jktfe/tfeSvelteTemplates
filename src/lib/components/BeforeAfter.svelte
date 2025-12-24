<!--
/**
 * BeforeAfter - Interactive before/after comparison with draggable divider
 *
 * Features:
 * - CSS-based clipping for smooth image reveals
 * - Draggable divider with mouse and touch support
 * - Unified pointer events for all input types
 * - Keyboard navigation with arrow keys
 * - Customisable aspect ratio and styling
 * - Optional labels for before/after sides
 * - Smooth CSS transitions during interaction
 * - Zero external dependencies
 *
 * Perfect for:
 * - Product improvements (before/after comparisons)
 * - Image editing (original vs. edited)
 * - Design iterations (old vs. new designs)
 * - Specification contrasts (standard vs. premium)
 * - Quality comparisons (low vs. high quality)
 * - A/B testing visualizations
 *
 * Technical Implementation:
 * - CSS clip-path for GPU-accelerated image clipping
 * - Pointer Events API for unified mouse/touch/pen handling
 * - Svelte 5 runes ($state, $derived) for reactivity
 * - CSS custom properties for dynamic styling
 * - ARIA labels and keyboard support for accessibility
 * - Respects prefers-reduced-motion preference
 *
 * @component
 * @example
 * ```svelte
 * <BeforeAfter
 *   beforeImage="https://example.com/before.jpg"
 *   afterImage="https://example.com/after.jpg"
 *   beforeLabel="Before"
 *   afterLabel="After"
 *   aspectRatio="16/9"
 * />
 * ```
 */
-->

<script lang="ts">
	import type { BeforeAfterProps } from '$lib/types';

	/**
	 * Component props with defaults
	 */
	let {
		beforeImage,
		afterImage,
		beforeAlt = 'Before',
		afterAlt = 'After',
		beforeLabel,
		afterLabel,
		aspectRatio = '16/9',
		width = '100%',
		initialPosition = 50,
		disabled = false,
		dividerColor = '#ffffff',
		dividerWidth = 2,
		handleSize = 48,
		handleColor = '#ffffff',
		onChange,
		class: className = ''
	}: BeforeAfterProps = $props();

	/**
	 * Component state
	 */
	let containerEl = $state<HTMLDivElement | undefined>();
	let isDragging = $state(false);
	let dividerPosition = $state(initialPosition);

	/**
	 * Derived values for CSS
	 */
	// Handle class: disable transitions during drag for immediate feedback
	let handleClass = $derived(isDragging ? 'divider-handle dragging' : 'divider-handle');

	// Clip-path values: before image clips from right, after image clips from left
	let beforeClip = $derived(`inset(0 ${100 - dividerPosition}% 0 0)`);
	let afterClip = $derived(`inset(0 0 0 ${dividerPosition}%)`);

	/**
	 * Fire onChange callback when position changes
	 */
	$effect(() => {
		onChange?.(dividerPosition);
	});

	/**
	 * Pointer down event handler
	 * Starts dragging and captures pointer for smooth interaction
	 */
	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;

		isDragging = true;
		containerEl?.setPointerCapture(e.pointerId);
		updateDividerPosition(e);
	}

	/**
	 * Pointer move event handler
	 * Updates divider position while dragging
	 */
	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updateDividerPosition(e);
	}

	/**
	 * Pointer up event handler
	 * Stops dragging and releases pointer capture
	 */
	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;

		isDragging = false;
		containerEl?.releasePointerCapture(e.pointerId);
	}

	/**
	 * Update divider position from pointer coordinates
	 * Calculates percentage based on pointer X position
	 */
	function updateDividerPosition(e: PointerEvent) {
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
		dividerPosition = percentage;
	}

	/**
	 * Keyboard event handler for accessibility
	 * Arrow Left: Move divider left (decrease position)
	 * Arrow Right: Move divider right (increase position)
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			dividerPosition = Math.max(0, dividerPosition - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			dividerPosition = Math.min(100, dividerPosition + 1);
		}
	}
</script>

<div
	bind:this={containerEl}
	class="before-after-container {className}"
	style:aspect-ratio={aspectRatio}
	style:width={typeof width === 'number' ? `${width}px` : width}
	role="application"
	aria-label="Before and after comparison. Use arrow keys or drag to compare."
	tabindex="0"
	onkeydown={handleKeyDown}
>
	<!-- Before panel (clipped from right based on divider position) -->
	<div class="before-panel" style:clip-path={beforeClip}>
		<img src={beforeImage} alt={beforeAlt} class="comparison-image" />
		{#if beforeLabel}
			<div class="panel-label before-label">{beforeLabel}</div>
		{/if}
	</div>

	<!-- After panel (clipped from left based on divider position) -->
	<div class="after-panel" style:clip-path={afterClip}>
		<img src={afterImage} alt={afterAlt} class="comparison-image" />
		{#if afterLabel}
			<div class="panel-label after-label">{afterLabel}</div>
		{/if}
	</div>

	<!-- Draggable divider -->
	<div
		class={handleClass}
		style:left="{dividerPosition}%"
		style:--divider-color={dividerColor}
		style:--divider-width="{dividerWidth}px"
		role="separator"
		aria-label="Draggable divider. Position: {Math.round(dividerPosition)}%"
		aria-valuenow={Math.round(dividerPosition)}
		aria-valuemin={0}
		aria-valuemax={100}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<div
			class="handle"
			style:width="{handleSize}px"
			style:height="{handleSize}px"
			style:background={handleColor}
		>
			<!-- Arrow icon: left-right arrows -->
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M18 8L22 12L18 16" />
				<path d="M6 8L2 12L6 16" />
				<line x1="2" y1="12" x2="22" y2="12" />
			</svg>
		</div>
	</div>
</div>

<style>
	/**
	 * Container positioning with responsive sizing
	 * Uses CSS aspect-ratio for proper scaling
	 */
	.before-after-container {
		position: relative;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
		cursor: col-resize;
	}

	.before-after-container:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/**
	 * Both panels fill container
	 * Positioned absolutely to overlap
	 */
	.before-panel,
	.after-panel {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/**
	 * Images fill panels with object-fit cover
	 * Ensures proper scaling and cropping
	 */
	.comparison-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/**
	 * Optional labels positioned in corners
	 * Semi-transparent background for readability
	 */
	.panel-label {
		position: absolute;
		top: 16px;
		padding: 8px 16px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		font-size: 14px;
		font-weight: 500;
		border-radius: 4px;
		pointer-events: none;
		user-select: none;
	}

	.before-label {
		left: 16px;
	}

	.after-label {
		right: 16px;
	}

	/**
	 * Draggable divider handle
	 * Positioned absolutely at divider position
	 * touch-action: none prevents scroll during drag
	 */
	.divider-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		transition: left 0.1s ease-out;
		touch-action: none;
		z-index: 10;
	}

	/**
	 * Disable transitions during active drag
	 * Provides immediate visual feedback
	 */
	.divider-handle.dragging {
		transition: none;
	}

	/**
	 * Vertical divider line
	 * Uses CSS custom properties for dynamic styling
	 */
	.divider-handle::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: var(--divider-width, 2px);
		background: var(--divider-color, #ffffff);
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
	}

	/**
	 * Circular handle with arrows
	 * Positioned on top of divider line
	 */
	.handle {
		position: relative;
		z-index: 10;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
		color: #333;
	}

	.handle:hover {
		transform: scale(1.1);
	}

	.handle:active {
		transform: scale(0.95);
	}

	/**
	 * Respect reduced motion preference
	 * Disable animations for accessibility
	 */
	@media (prefers-reduced-motion: reduce) {
		.divider-handle {
			transition: none;
		}
		.handle {
			transition: none;
		}
	}

	/**
	 * Mobile responsive adjustments
	 * Smaller labels and better touch targets
	 */
	@media (max-width: 640px) {
		.panel-label {
			font-size: 12px;
			padding: 6px 12px;
			top: 12px;
		}

		.before-label {
			left: 12px;
		}

		.after-label {
			right: 12px;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 24.12.25. -->
