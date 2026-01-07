<!--
	============================================================
	ScratchToReveal - Interactive Scratch Card Component
	============================================================

	[CR] WHAT IT DOES
	Canvas-based scratch-off component that reveals hidden content when
	the user "scratches" the surface. Uses HTML5 Canvas with 'destination-out'
	compositing to erase pixels, revealing content underneath. Supports mouse,
	touch, and pen input via unified Pointer Events API.

	[NTL] THE SIMPLE VERSION
	It's like a real lottery scratch card! Drag your finger (or mouse)
	across the grey area to reveal what's hidden underneath. Once you've
	scratched enough away, the full prize/message is revealed. You can
	also skip the scratching or reset it to scratch again!

	============================================================

	FEATURES:
	- Canvas-based scratch mechanics (HTML5 Canvas API)
	- Unified pointer events (mouse, touch, pen)
	- Auto-reveal when threshold percentage is scratched
	- Skip button to reveal instantly
	- Reset to scratch again
	- Keyboard shortcuts (Space/Enter to skip, R to reset)
	- Progress bar showing scratch percentage
	- Customisable scratch surface (colour, image, text overlay)
	- Customisable brush (size, shape)
	- Retina-ready (device pixel ratio scaling)

	PERFECT FOR:
	- Lottery / scratch card games
	- Marketing reveals (coupon codes, discounts)
	- Interactive content (hidden messages, easter eggs)
	- Quiz answer reveals
	- E-commerce deal reveals

	DEPENDENCIES:
	- $lib/types (ScratchToRevealProps)
	- Zero external dependencies - pure Canvas API

	ACCESSIBILITY:
	- Keyboard: Space/Enter to skip, R to reset
	- Screen readers: ARIA live regions announce progress
	- Focus indicators on wrapper and buttons
	- Respects prefers-reduced-motion

	WARNINGS (Safe to ignore):
	- state_referenced_locally: width/height initialised from props
	- a11y_no_noninteractive_tabindex: Intentional for keyboard accessibility
	- a11y_no_noninteractive_element_interactions: Required for keyboard events
	- element_invalid_self_closing_tag: Style preference, no runtime impact

	============================================================
-->

<script lang="ts">
	import type { ScratchToRevealProps } from '$lib/types';

	// [CR] Props with sensible defaults for scratch card appearance and behaviour
	// [NTL] All the settings you can tweak - scratch colour, brush size, when to auto-reveal, etc.
	let {
		scratchColor = '#999999',      // [NTL] The grey "scratch off" coating colour
		scratchImage,                   // [NTL] Optional: use an image instead of solid colour
		scratchText,                    // [NTL] Optional: text like "SCRATCH HERE!" on top
		scratchTextColor = '#ffffff',   // [NTL] Colour of the overlay text
		scratchTextSize = '24px',       // [NTL] Size of the overlay text
		revealThreshold = 70,           // [NTL] % that must be scratched before auto-reveal (70%)
		autoReveal = true,              // [NTL] Whether to auto-reveal when threshold is hit
		brushSize = 40,                 // [NTL] How big the "scratch" circle is in pixels
		brushShape = 'circle',          // [NTL] Shape of scratch: 'circle' or 'square'
		width = 'auto',                 // [NTL] Width - 'auto' measures from content
		height = 'auto',                // [NTL] Height - 'auto' measures from content
		showProgress = false,           // [NTL] Show progress bar below?
		progressColor = '#3b82f6',      // [NTL] Colour of the progress bar
		allowReset = true,              // [NTL] Can users scratch again?
		resetButtonText = 'Reset',      // [NTL] Text on reset button
		skipText = 'Skip',              // [NTL] Text on skip button (or null to hide)
		onReveal,                       // [NTL] Callback when fully revealed
		onProgress,                     // [NTL] Callback with progress percentage
		disabled = false,               // [NTL] Disable scratching
		class: className = '',          // [NTL] Extra CSS classes
		children                        // [NTL] The hidden content to reveal
	}: ScratchToRevealProps = $props();

	// [CR] Component state - tracks canvas, scratching progress, and reveal status
	// [NTL] These are the "behind the scenes" values that make everything work
	let canvasEl = $state<HTMLCanvasElement | undefined>();       // [CR] Canvas DOM element reference
	let containerEl = $state<HTMLDivElement | undefined>();       // [CR] Container for measuring content
	let ctx: CanvasRenderingContext2D | null = null;              // [CR] Canvas 2D drawing context
	let isScratching = $state(false);                             // [NTL] Is user currently scratching?
	let scratchPercentage = $state(0);                            // [NTL] How much has been scratched (0-100)
	let isFullyRevealed = $state(false);                          // [NTL] Is content fully revealed?
	// svelte-ignore state_referenced_locally
	let canvasWidth = $state(width === 'auto' ? 0 : width);       // [CR] Calculated canvas width
	// svelte-ignore state_referenced_locally
	let canvasHeight = $state(height === 'auto' ? 0 : height);    // [CR] Calculated canvas height
	let rafId: number | null = null;                              // [CR] RequestAnimationFrame ID for smooth drawing
	let resizeObserver: ResizeObserver | null = null;             // [CR] Observer for auto-sizing

	// [CR] Auto-measure content dimensions when width/height is 'auto'
	// [NTL] When you don't specify a size, we figure out how big the hidden content is
	$effect(() => {
		if ((width === 'auto' || height === 'auto') && containerEl) {
			const contentEl = containerEl.querySelector('.revealed-content');
			if (!contentEl) return;

			// [CR] ResizeObserver efficiently tracks content size changes
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const { width: w, height: h } = entry.contentRect;
					if (width === 'auto' && w > 0) canvasWidth = w;
					if (height === 'auto' && h > 0) canvasHeight = h;

					// [CR] Reinitialize canvas when dimensions change
					if (canvasWidth > 0 && canvasHeight > 0) {
						initializeCanvas();
					}
				}
			});

			resizeObserver.observe(contentEl);

			// [CR] Cleanup: disconnect observer when component unmounts
			return () => {
				if (resizeObserver) {
					resizeObserver.disconnect();
					resizeObserver = null;
				}
			};
		}
	});

	// [CR] Initialize canvas with scratch surface
	// [NTL] This draws the grey (or image) coating that users will scratch off
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

	// [CR] Draw overlay text on scratch surface (e.g., "SCRATCH HERE!")
	// [NTL] Adds helpful text like "Scratch Here!" on top of the grey coating
	function drawOverlayText() {
		if (scratchText && ctx) {
			ctx.fillStyle = scratchTextColor;
			ctx.font = `bold ${scratchTextSize} sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(scratchText, canvasWidth / 2, canvasHeight / 2);
		}
	}

	// [CR] Pointer down handler - starts scratching and captures pointer
	// [NTL] When you press down on the scratch card, this kicks off the scratching!
	function handlePointerDown(e: PointerEvent) {
		if (disabled || isFullyRevealed) return;

		isScratching = true;
		canvasEl?.setPointerCapture(e.pointerId);
		scratch(e);
	}

	// [CR] Pointer move handler - continues scratching while pointer is down
	// [NTL] As you drag your finger/mouse, this keeps scratching away!
	function handlePointerMove(e: PointerEvent) {
		if (!isScratching || disabled) return;
		scratch(e);
	}

	// [CR] Pointer up handler - stops scratching and calculates progress
	// [NTL] When you lift your finger, we check how much you've scratched!
	function handlePointerUp(e: PointerEvent) {
		if (!isScratching) return;

		isScratching = false;
		canvasEl?.releasePointerCapture(e.pointerId);

		// Calculate progress and check for auto-reveal
		updateProgress();
	}

	// [CR] Core scratch drawing function - uses RAF for 60fps smooth animation
	// [CR] Erases pixels using 'destination-out' compositing (makes pixels transparent)
	// [NTL] This is the actual "eraser" that removes the grey coating pixel by pixel!
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

	// [CR] Calculate scratch percentage using pixel sampling (every 4th pixel for perf)
	// [NTL] Counts transparent vs opaque pixels to figure out the scratch percentage
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

	// [CR] Reveal all content immediately - clears canvas and triggers callback
	// [NTL] The "skip" button uses this to instantly reveal everything!
	function revealAll() {
		if (!ctx || !canvasEl) return;

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		isFullyRevealed = true;
		scratchPercentage = 100;
		onReveal?.();
	}

	// [CR] Reset scratch surface - re-initializes canvas with fresh coating
	// [NTL] The "reset" button uses this so you can scratch again!
	function reset() {
		isFullyRevealed = false;
		scratchPercentage = 0;
		initializeCanvas();
	}

	// [CR] Keyboard event handler for accessibility (Space/Enter = skip, R = reset)
	// [NTL] Keyboard users can press Space to skip or R to reset - no mouse needed!
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			revealAll();
		} else if (e.key === 'r' && allowReset && isFullyRevealed) {
			e.preventDefault();
			reset();
		}
	}

	// [CR] Handle explicit dimensions - init canvas when user provides fixed width/height
	// [NTL] When you set a specific size (not 'auto'), we set up the canvas right away
	$effect(() => {
		if (width !== 'auto') canvasWidth = width;
		if (height !== 'auto') canvasHeight = height;

		if (canvasEl && canvasWidth > 0 && canvasHeight > 0) {
			initializeCanvas();
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<div
	class="scratch-to-reveal-wrapper {className}"
	role="application"
	aria-label="Scratch to reveal hidden content. Press Space or Enter to skip scratching."
	tabindex="0"
	onkeydown={handleKeyDown}
>
	<!-- Interactive scratch area (canvas + content) -->
	<div bind:this={containerEl} class="scratch-area">
		<!-- Revealed content - only constrain dimensions when explicit values provided -->
		<!-- [CR] When width/height are 'auto', let content size naturally so we can measure it -->
		<div
			class="revealed-content"
			class:visible={isFullyRevealed}
			style:width={width !== 'auto' ? `${canvasWidth}px` : undefined}
			style:height={height !== 'auto' ? `${canvasHeight}px` : undefined}
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
	 * [CR] Using inline-flex ensures container shrinks to fit content exactly,
	 * preventing canvas alignment issues where container was larger than content
	 */
	.scratch-area {
		position: relative;
		display: inline-flex;
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

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
