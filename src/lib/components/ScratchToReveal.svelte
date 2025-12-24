<!--
/**
 * ScratchToReveal - Interactive scratch-off component revealing hidden content
 *
 * Features:
 * - Canvas-based scratch mechanics with HTML5 Canvas API
 * - Unified pointer events for mouse, touch, and pen input
 * - Progressive reveal with customizable threshold
 * - Auto-reveal option when threshold is reached
 * - Skip and reset functionality
 * - Keyboard shortcuts for accessibility
 * - Progress tracking with optional visual indicator
 * - Customizable scratch surface (color, image, text overlay)
 * - Customizable brush (size, shape)
 * - Zero external dependencies
 *
 * Perfect for:
 * - Gamification (lottery cards, scratch prizes, mystery reveals)
 * - Marketing (coupon codes, promotional offers, discount reveals)
 * - Interactive Content (hidden messages, easter eggs)
 * - Education (quiz answers, learning reveals)
 * - E-commerce (deal reveals, flash sales)
 *
 * Technical Implementation:
 * - Single canvas with 'destination-out' compositing for erasing
 * - RAF-based drawing for 60fps smooth scratching
 * - Pixel sampling for efficient progress calculation
 * - Device pixel ratio scaling for crisp Retina rendering
 * - Pointer capture for smooth dragging
 * - Touch-action CSS to prevent scroll during scratch
 * - Svelte 5 runes ($state, $derived, $effect) for reactivity
 * - ARIA labels and live regions for screen readers
 * - Respects prefers-reduced-motion preference
 *
 * @component
 * @example
 * ```svelte
 * <ScratchToReveal
 *   scratchText="Scratch Here!"
 *   revealThreshold={70}
 *   showProgress={true}
 * >
 *   <div class="prize">You won £50!</div>
 * </ScratchToReveal>
 * ```
 */
-->

<script lang="ts">
	import type { ScratchToRevealProps } from '$lib/types';

	/**
	 * Component props with defaults
	 */
	let {
		scratchColor = '#999999',
		scratchImage,
		scratchText,
		scratchTextColor = '#ffffff',
		scratchTextSize = '24px',
		revealThreshold = 70,
		autoReveal = true,
		brushSize = 40,
		brushShape = 'circle',
		width = 'auto',
		height = 'auto',
		showProgress = false,
		progressColor = '#3b82f6',
		allowReset = true,
		resetButtonText = 'Reset',
		skipText = 'Skip',
		onReveal,
		onProgress,
		disabled = false,
		class: className = '',
		children
	}: ScratchToRevealProps = $props();

	/**
	 * Component state
	 */
	let canvasEl = $state<HTMLCanvasElement | undefined>();
	let containerEl = $state<HTMLDivElement | undefined>();
	let ctx: CanvasRenderingContext2D | null = null;
	let isScratching = $state(false);
	let scratchPercentage = $state(0);
	let isFullyRevealed = $state(false);
	let canvasWidth = $state(width === 'auto' ? 0 : width);
	let canvasHeight = $state(height === 'auto' ? 0 : height);
	let rafId: number | null = null;
	let resizeObserver: ResizeObserver | null = null;

	/**
	 * Auto-measure content dimensions when width/height is 'auto'
	 * Uses ResizeObserver for reactive updates when content size changes
	 */
	$effect(() => {
		if ((width === 'auto' || height === 'auto') && containerEl) {
			const contentEl = containerEl.querySelector('.revealed-content');
			if (!contentEl) return;

			// Use ResizeObserver for reactive dimension updates
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const { width: w, height: h } = entry.contentRect;
					if (width === 'auto' && w > 0) canvasWidth = w;
					if (height === 'auto' && h > 0) canvasHeight = h;

					// Re-initialize canvas when dimensions change
					if (canvasWidth > 0 && canvasHeight > 0) {
						initializeCanvas();
					}
				}
			});

			resizeObserver.observe(contentEl);

			// Cleanup on unmount
			return () => {
				if (resizeObserver) {
					resizeObserver.disconnect();
					resizeObserver = null;
				}
			};
		}
	});

	/**
	 * Initialize canvas with scratch surface
	 * - Scales canvas for device pixel ratio (Retina displays)
	 * - Draws scratch surface (color or image)
	 * - Renders overlay text if provided
	 */
	function initializeCanvas() {
		if (!canvasEl || canvasWidth <= 0 || canvasHeight <= 0) return;

		ctx = canvasEl.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		// Scale for device pixel ratio (crisp on Retina)
		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = canvasWidth * dpr;
		canvasEl.height = canvasHeight * dpr;
		canvasEl.style.width = `${canvasWidth}px`;
		canvasEl.style.height = `${canvasHeight}px`;
		ctx.scale(dpr, dpr);

		// Draw scratch surface
		if (scratchImage) {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				if (ctx) {
					ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
					drawOverlayText();
				}
			};
			img.src = scratchImage;
		} else {
			ctx.fillStyle = scratchColor;
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
			drawOverlayText();
		}
	}

	/**
	 * Draw overlay text on scratch surface
	 */
	function drawOverlayText() {
		if (scratchText && ctx) {
			ctx.fillStyle = scratchTextColor;
			ctx.font = `bold ${scratchTextSize} sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(scratchText, canvasWidth / 2, canvasHeight / 2);
		}
	}

	/**
	 * Pointer down event handler
	 * Starts scratching and captures pointer for smooth dragging
	 */
	function handlePointerDown(e: PointerEvent) {
		if (disabled || isFullyRevealed) return;

		isScratching = true;
		canvasEl?.setPointerCapture(e.pointerId);
		scratch(e);
	}

	/**
	 * Pointer move event handler
	 * Continues scratching while pointer is down
	 */
	function handlePointerMove(e: PointerEvent) {
		if (!isScratching || disabled) return;
		scratch(e);
	}

	/**
	 * Pointer up event handler
	 * Stops scratching, releases pointer capture, and calculates progress
	 */
	function handlePointerUp(e: PointerEvent) {
		if (!isScratching) return;

		isScratching = false;
		canvasEl?.releasePointerCapture(e.pointerId);

		// Calculate progress and check for auto-reveal
		updateProgress();
	}

	/**
	 * Scratch drawing function
	 * Uses RAF for 60fps smooth animation
	 * Erases pixels at pointer location using 'destination-out' compositing
	 */
	function scratch(e: PointerEvent) {
		if (!ctx || !canvasEl || rafId) return;

		rafId = requestAnimationFrame(() => {
			const rect = canvasEl!.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Erase mode: 'destination-out' removes pixels
			ctx!.globalCompositeOperation = 'destination-out';
			ctx!.beginPath();

			if (brushShape === 'circle') {
				ctx!.arc(x, y, brushSize / 2, 0, Math.PI * 2);
			} else {
				ctx!.rect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
			}

			ctx!.fill();
			rafId = null;
		});
	}

	/**
	 * Calculate scratch percentage using pixel sampling
	 * Samples every 4th pixel for 4x performance gain
	 * Only runs on pointer up to avoid frequent recalculation
	 */
	function updateProgress() {
		if (!ctx || !canvasEl) return;

		const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
		const pixels = imageData.data;
		const sampleRate = 4; // Check every 4th pixel
		let transparentCount = 0;
		let totalSamples = 0;

		for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
			totalSamples++;
			// Check alpha channel (pixels[i+3])
			if (pixels[i + 3] === 0) transparentCount++;
		}

		scratchPercentage = totalSamples > 0 ? (transparentCount / totalSamples) * 100 : 0;
		onProgress?.(scratchPercentage);

		// Auto-reveal if threshold reached
		if (autoReveal && scratchPercentage >= revealThreshold) {
			revealAll();
		}
	}

	/**
	 * Reveal all content immediately
	 * Clears entire canvas and marks as fully revealed
	 */
	function revealAll() {
		if (!ctx || !canvasEl) return;

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		isFullyRevealed = true;
		scratchPercentage = 100;
		onReveal?.();
	}

	/**
	 * Reset scratch surface to initial state
	 * Re-initializes canvas with fresh scratch surface
	 */
	function reset() {
		isFullyRevealed = false;
		scratchPercentage = 0;
		initializeCanvas();
	}

	/**
	 * Keyboard event handler for accessibility
	 * Space/Enter: Skip to reveal all
	 * 'r' key: Reset (if allowed)
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			revealAll();
		} else if (e.key === 'r' && allowReset && isFullyRevealed) {
			e.preventDefault();
			reset();
		}
	}

	/**
	 * Handle explicit dimensions (when not 'auto')
	 * Initializes canvas immediately when user provides fixed width/height
	 */
	$effect(() => {
		if (width !== 'auto') canvasWidth = width;
		if (height !== 'auto') canvasHeight = height;

		if (canvasEl && canvasWidth > 0 && canvasHeight > 0) {
			initializeCanvas();
		}
	});
</script>

<div
	class="scratch-to-reveal-wrapper {className}"
	role="application"
	aria-label="Scratch to reveal hidden content. Press Space or Enter to skip scratching."
	tabindex="0"
	onkeydown={handleKeyDown}
>
	<!-- Interactive scratch area (canvas + content) -->
	<div bind:this={containerEl} class="scratch-area">
		<!-- Revealed content (constrained by explicit dimensions) -->
		<div
			class="revealed-content"
			class:visible={isFullyRevealed}
			style:width="{canvasWidth}px"
			style:height="{canvasHeight}px"
		>
			{#if children}
				{@render children()}
			{/if}
		</div>

		<!-- Scratch canvas overlay -->
		{#if !isFullyRevealed}
			<canvas
				bind:this={canvasEl}
				class="scratch-canvas"
				width={canvasWidth}
				height={canvasHeight}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerUp}
				style:cursor={disabled ? 'not-allowed' : 'pointer'}
			/>
		{/if}
	</div>

	<!-- Controls section (below scratch area) -->
	<div class="scratch-controls">
		<!-- Progress bar -->
		{#if showProgress && !isFullyRevealed}
			<div class="progress-container" aria-hidden="true">
				<div
					class="progress-bar"
					style:width="{scratchPercentage}%"
					style:background-color={progressColor}
				/>
			</div>
		{/if}

		<!-- Action buttons -->
		<div class="actions">
			{#if !isFullyRevealed && skipText}
				<button onclick={revealAll} class="skip-button" aria-label="Skip scratching and reveal content">
					{skipText}
				</button>
			{/if}

			{#if isFullyRevealed && allowReset}
				<button onclick={reset} class="reset-button" aria-label="Reset to scratch again">
					{resetButtonText}
				</button>
			{/if}
		</div>
	</div>

	<!-- Screen reader announcements -->
	<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
		{#if isFullyRevealed}
			Content revealed
		{:else if scratchPercentage > 0}
			{Math.round(scratchPercentage)}% revealed
		{/if}
	</div>
</div>

<style>
	/**
	 * Wrapper container with flexbox column layout
	 * Separates scratch area from controls
	 */
	.scratch-to-reveal-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		user-select: none;
		-webkit-user-select: none;
		outline: none;
	}

	.scratch-to-reveal-wrapper:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/**
	 * Scratch area container
	 * Contains revealed content and canvas only
	 */
	.scratch-area {
		position: relative;
		display: block;
	}

	/**
	 * Revealed content styling
	 * Constrained by explicit dimensions, always visible underneath canvas
	 * Canvas erasing reveals this content
	 */
	.revealed-content {
		display: block;
		opacity: 1;
		pointer-events: none;
		overflow: hidden;
	}

	.revealed-content.visible {
		pointer-events: auto;
	}

	/**
	 * Scratch canvas overlay
	 * Positioned absolutely over revealed content within scratch-area
	 * touch-action: none prevents page scrolling during scratch
	 */
	.scratch-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		touch-action: none;
		-webkit-touch-callout: none;
	}

	/**
	 * Controls section positioned below scratch area
	 * Uses normal flow (not absolute positioning)
	 */
	.scratch-controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 12px;
		width: 100%;
	}

	/**
	 * Progress bar container and indicator
	 * Shows scratch percentage visually below scratch area
	 */
	.progress-container {
		width: 100%;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		overflow: hidden;
		border-radius: 2px;
	}

	.progress-bar {
		height: 100%;
		transition: width 0.2s ease;
	}

	/**
	 * Action buttons (skip, reset)
	 * Positioned below scratch area using flexbox
	 */
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}

	button {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: background 0.2s, transform 0.1s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	button:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: translateY(-1px);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
	}

	button:active {
		transform: translateY(0);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	button:focus-visible {
		outline: 2px solid #ffffff;
		outline-offset: 2px;
	}

	/**
	 * Screen reader only content
	 * Visually hidden but accessible to assistive technology
	 */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/**
	 * Accessibility: Respect reduced motion preference
	 * Disable transitions for users who prefer reduced motion
	 */
	@media (prefers-reduced-motion: reduce) {
		.progress-bar {
			transition: none;
		}

		button {
			transition: none;
		}
	}

	/**
	 * Mobile responsive adjustments
	 * Smaller buttons and touch-friendly sizing
	 */
	@media (max-width: 640px) {
		.actions {
			bottom: 12px;
			right: 12px;
		}

		button {
			padding: 6px 12px;
			font-size: 12px;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 24.12.25. -->
