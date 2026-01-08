<!--
  ============================================================
  BeforeAfter - Interactive Image Comparison Slider
  ============================================================

  [CR] WHAT IT DOES
  Interactive before/after comparison with a draggable divider. Uses CSS
  clip-path for GPU-accelerated image clipping and Pointer Events API for
  unified mouse/touch/pen handling across all devices.

  [NTL] THE SIMPLE VERSION
  Drag the slider left and right to compare two images! Like wiping a window
  to reveal what's behind it. Great for showing "before and after" photos
  of anything from home renovations to photo edits.

  ✨ FEATURES
  • CSS-based clipping for smooth image reveals
  • Draggable divider with mouse and touch support
  • Unified pointer events for all input types
  • Keyboard navigation with arrow keys
  • Customisable aspect ratio and styling
  • Optional labels for before/after sides
  • Smooth CSS transitions during interaction

  ♿ ACCESSIBILITY
  • Keyboard: Arrow Left/Right to move divider
  • Screen readers: ARIA labels describe position
  • Focus: Visible focus ring on container
  • Motion: Respects prefers-reduced-motion

  📦 DEPENDENCIES
  Zero external dependencies - fully portable!

  ⚠️ WARNINGS
  - state_referenced_locally: initialPosition captured once (intentional - we want
    the initial value, not reactive updates to it after mount)
  - a11y_no_noninteractive_tabindex: Container needs tabindex for keyboard nav
  - a11y_no_noninteractive_element_interactions: Required for drag/keyboard interaction

  🎨 USAGE
  <BeforeAfter
    beforeImage="https://example.com/before.jpg"
    afterImage="https://example.com/after.jpg"
    beforeLabel="Before"
    afterLabel="After"
  />

  📋 PROPS
  | Prop           | Type     | Default   | Description                    |
  |----------------|----------|-----------|--------------------------------|
  | beforeImage    | string   | required  | URL of the "before" image      |
  | afterImage     | string   | required  | URL of the "after" image       |
  | beforeAlt      | string   | 'Before'  | Alt text for before image      |
  | afterAlt       | string   | 'After'   | Alt text for after image       |
  | beforeLabel    | string   | undefined | Optional label overlay         |
  | afterLabel     | string   | undefined | Optional label overlay         |
  | aspectRatio    | string   | '16/9'    | CSS aspect-ratio value         |
  | width          | string   | '100%'    | Container width                |
  | initialPosition| number   | 50        | Starting divider position (%)  |
  | disabled       | boolean  | false     | Disable interaction            |
  | dividerColor   | string   | '#ffffff' | Divider line colour            |
  | dividerWidth   | number   | 2         | Divider line width (px)        |
  | handleSize     | number   | 48        | Handle circle diameter (px)    |
  | handleColor    | string   | '#ffffff' | Handle background colour       |
  | onChange       | function | undefined | Callback when position changes |

  ============================================================
-->

<script lang="ts">
	// =========================================================================
	// [CR] IMPORTS
	// Type-only import keeps bundle size minimal - no runtime code imported
	// =========================================================================
	import type { BeforeAfterProps } from '$lib/types';

	// =========================================================================
	// [CR] COMPONENT PROPS
	// Using Svelte 5's $props() rune for type-safe prop destructuring
	// [NTL] These are all the settings you can pass to customise the slider!
	// =========================================================================
	let {
		// [CR] Required props - the two images to compare
		beforeImage,
		afterImage,

		// [CR] Alt text for accessibility - screen readers announce these
		// [NTL] Important for blind users to understand what the images show!
		beforeAlt = 'Before',
		afterAlt = 'After',

		// [CR] Optional labels that appear in corners of each panel
		beforeLabel,
		afterLabel,

		// [CR] Container sizing - CSS aspect-ratio keeps images proportional
		// [NTL] 16/9 is the same shape as a widescreen TV!
		aspectRatio = '16/9',
		width = '100%',

		// [CR] Initial divider position as percentage (0-100)
		// [NTL] 50 means it starts right in the middle
		initialPosition = 50,

		// [CR] Disabled state prevents all interaction
		disabled = false,

		// [CR] Divider styling - passed to CSS custom properties
		dividerColor = '#ffffff',
		dividerWidth = 2,
		handleSize = 48,
		handleColor = '#ffffff',

		// [CR] Optional callback fired whenever position changes
		// [NTL] Lets parent components react to slider movement
		onChange,

		// [CR] Additional CSS classes - renamed to avoid reserved word
		class: className = ''
	}: BeforeAfterProps = $props();

	// =========================================================================
	// [CR] COMPONENT STATE
	// Using Svelte 5's $state() rune for reactive variables
	// [NTL] These are the component's "memory" - things that can change!
	// =========================================================================

	// [CR] Reference to container element for position calculations
	let containerEl = $state<HTMLDivElement | undefined>();

	// [CR] Track whether user is currently dragging the divider
	// [NTL] This is how we know when to move the slider vs when to ignore mouse moves
	let isDragging = $state(false);

	// [CR] Current divider position as percentage (0-100)
	// [NTL] This single number controls everything - images clip, handle moves!
	// svelte-ignore state_referenced_locally
	let dividerPosition = $state(initialPosition);

	// =========================================================================
	// [CR] DERIVED VALUES
	// Computed from state using $derived() - automatically update when deps change
	// [NTL] These are calculated values that Svelte keeps in sync automatically!
	// =========================================================================

	// [CR] Toggle CSS class during drag to disable transitions
	// [NTL] Without this, the slider would feel "laggy" because of animation delay
	let handleClass = $derived(isDragging ? 'divider-handle dragging' : 'divider-handle');

	// [CR] CSS clip-path values using inset() function
	// inset(top right bottom left) - clips from edges
	// [NTL] This is the magic! We're literally cutting the images like paper scissors
	// Before image: cut from right edge → shows left portion
	// After image: cut from left edge → shows right portion
	let beforeClip = $derived(`inset(0 ${100 - dividerPosition}% 0 0)`);
	let afterClip = $derived(`inset(0 0 0 ${dividerPosition}%)`);

	// =========================================================================
	// [CR] SIDE EFFECTS
	// $effect() runs whenever dependencies change - like useEffect in React
	// =========================================================================

	// [CR] Notify parent component of position changes via callback
	// [NTL] This lets the page showing the component know where the slider is
	$effect(() => {
		onChange?.(dividerPosition);
	});

	// =========================================================================
	// [CR] POINTER EVENT HANDLERS
	// Using Pointer Events API for unified mouse/touch/pen support
	// [NTL] One set of code handles mouse, touchscreen, AND stylus pens!
	// =========================================================================

	/**
	 * [CR] Pointer down: Initiate drag interaction
	 * - Sets dragging flag to enable move tracking
	 * - Captures pointer to receive events even outside element
	 * - Immediately updates position (don't wait for first move)
	 *
	 * [NTL] When you press down on the slider, we:
	 * 1. Remember you're dragging
	 * 2. "Grab" the pointer so we track it everywhere
	 * 3. Jump the slider to where you clicked
	 */
	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;

		isDragging = true;
		// [CR] setPointerCapture ensures we receive events even if pointer leaves element
		// [NTL] Like a magnet that keeps the slider attached to your finger!
		containerEl?.setPointerCapture(e.pointerId);
		updateDividerPosition(e);
	}

	/**
	 * [CR] Pointer move: Update position while dragging
	 * Only processes when isDragging is true (initiated by pointerdown)
	 *
	 * [NTL] As you drag, we constantly update where the divider line appears
	 */
	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updateDividerPosition(e);
	}

	/**
	 * [CR] Pointer up: End drag interaction
	 * - Clears dragging flag
	 * - Releases pointer capture
	 *
	 * [NTL] When you let go, we stop tracking and "release" the pointer
	 */
	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;

		isDragging = false;
		containerEl?.releasePointerCapture(e.pointerId);
	}

	/**
	 * [CR] Calculate divider position from pointer coordinates
	 * Converts clientX (viewport pixels) → percentage (0-100)
	 *
	 * [NTL] This is the maths bit! We figure out where your finger is
	 * relative to the container, then convert that to a percentage.
	 */
	function updateDividerPosition(e: PointerEvent) {
		if (!containerEl) return;

		// [CR] getBoundingClientRect gives us the element's position and size
		const rect = containerEl.getBoundingClientRect();

		// [CR] Calculate X position relative to container's left edge
		const x = e.clientX - rect.left;

		// [CR] Convert to percentage and clamp to 0-100 range
		// [NTL] Math.max and Math.min stop the slider going off the edges!
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
		dividerPosition = percentage;
	}

	// =========================================================================
	// [CR] KEYBOARD ACCESSIBILITY
	// WCAG 2.1 requires all functionality be available via keyboard
	// [NTL] Not everyone uses a mouse - arrow keys let keyboard users compare too!
	// =========================================================================

	/**
	 * [CR] Handle arrow key navigation for accessibility
	 * - Arrow Left: Decrease position by 1%
	 * - Arrow Right: Increase position by 1%
	 * - Other keys: Ignored (don't preventDefault)
	 *
	 * [NTL] Each arrow press moves the slider 1% - tap repeatedly or hold down!
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (e.key === 'ArrowLeft') {
			e.preventDefault(); // [CR] Prevent page scroll
			dividerPosition = Math.max(0, dividerPosition - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			dividerPosition = Math.min(100, dividerPosition + 1);
		}
	}
</script>
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerEl}
	class="before-after-container {className}"
	class:dragging={isDragging}
	style:aspect-ratio={aspectRatio}
	style:width={typeof width === 'number' ? `${width}px` : width}
	role="application"
	aria-label="Before and after comparison. Use arrow keys or drag to compare."
	tabindex="0"
	onkeydown={handleKeyDown}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
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
	<!-- [CR] Pointer events now handled by container for better mobile UX -->
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
	/* =========================================================================
	   [CR] CONTAINER STYLES
	   The main wrapper that holds everything together
	   [NTL] This is the "frame" that contains both images and the slider
	   ========================================================================= */

	.before-after-container {
		position: relative; /* [CR] Enables absolute positioning of children */
		overflow: hidden; /* [CR] Hides any overflow from clip-path edges */
		user-select: none; /* [CR] Prevents text selection during drag */
		-webkit-user-select: none; /* [CR] Safari prefix for older versions */
		cursor: col-resize; /* [NTL] The left-right resize cursor hints at the interaction! */
		touch-action: none; /* [CR] Prevents browser scroll/zoom during touch drag on mobile */
	}

	/* [CR] During drag, ensure immediate response without transition delays */
	.before-after-container.dragging {
		cursor: grabbing;
	}

	/* [CR] Focus ring for keyboard users - WCAG 2.4.7 Focus Visible */
	.before-after-container:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* =========================================================================
	   [CR] IMAGE PANELS
	   Both panels occupy the full container and overlap completely
	   [NTL] Like two photos stacked on top of each other!
	   ========================================================================= */

	.before-panel,
	.after-panel {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* [CR] clip-path is applied via inline style for dynamic values */
	}

	/* [CR] Images fill panels completely with cover sizing
	   [NTL] object-fit: cover ensures images scale nicely without distortion */
	.comparison-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block; /* [CR] Removes inline image spacing */
	}

	/* =========================================================================
	   [CR] PANEL LABELS
	   Optional overlays showing "Before" / "After" text
	   [NTL] These help users understand which side is which!
	   ========================================================================= */

	.panel-label {
		position: absolute;
		top: 16px;
		padding: 8px 16px;
		background: rgba(0, 0, 0, 0.7); /* [CR] Semi-transparent for readability */
		color: white;
		font-size: 14px;
		font-weight: 500;
		border-radius: 4px;
		pointer-events: none; /* [CR] Labels don't intercept clicks */
		user-select: none;
	}

	.before-label {
		left: 16px; /* [NTL] Before label sits in top-left corner */
	}

	.after-label {
		right: 16px; /* [NTL] After label sits in top-right corner */
	}

	/* =========================================================================
	   [CR] DIVIDER HANDLE
	   The draggable vertical line with circular grab handle
	   [NTL] This is the "slider" users drag left and right!
	   ========================================================================= */

	.divider-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		transform: translateX(-50%); /* [CR] Centers handle on the percentage position */
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		transition: left 0.1s ease-out; /* [NTL] Smooth movement when not dragging */
		touch-action: none; /* [CR] Prevents browser scroll during touch drag */
		z-index: 10;
	}

	/* [CR] Remove transition during drag for immediate feedback
	   [NTL] Makes the slider feel "snappy" and responsive to your finger */
	.divider-handle.dragging {
		transition: none;
	}

	/* [CR] Vertical divider line using CSS pseudo-element
	   [NTL] The white line that splits the two images */
	.divider-handle::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: var(--divider-width, 2px); /* [CR] CSS custom property for dynamic width */
		background: var(--divider-color, #ffffff);
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.3); /* [CR] Subtle shadow for visibility */
	}

	/* [CR] Circular grab handle with arrow icon
	   [NTL] The round button in the middle you grab to drag */
	.handle {
		position: relative;
		z-index: 10;
		border-radius: 50%; /* [CR] Makes it circular */
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
		color: #333; /* [CR] Dark colour for the arrow icon */
	}

	/* [CR] Visual feedback on hover - grows slightly */
	.handle:hover {
		transform: scale(1.1);
	}

	/* [CR] Visual feedback on press - shrinks slightly */
	.handle:active {
		transform: scale(0.95);
	}

	/* =========================================================================
	   [CR] ACCESSIBILITY - REDUCED MOTION
	   WCAG 2.3.3: Users can disable animations
	   [NTL] Some people get dizzy from animations - this respects their settings!
	   ========================================================================= */

	@media (prefers-reduced-motion: reduce) {
		.divider-handle {
			transition: none;
		}
		.handle {
			transition: none;
		}
	}

	/* =========================================================================
	   [CR] MOBILE RESPONSIVE
	   Smaller labels on mobile devices
	   [NTL] Makes labels fit better on phone screens!
	   ========================================================================= */

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

<!-- [CR] Component complete and reviewed. [NTL] This file is ready to use! -->
<!-- Claude is happy that this file is mint. Signed off 26.12.25. -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
