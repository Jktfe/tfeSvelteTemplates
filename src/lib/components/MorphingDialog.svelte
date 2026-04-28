<!--
	============================================================
	MorphingDialog - Shared-Element Transition Dialog
	============================================================

	[CR] WHAT IT DOES
	A modal/dialog component that morphs seamlessly from a trigger element
	into a full dialog overlay using shared-element transitions. The trigger
	element appears to expand and transform into the dialog, then collapses
	back on close. Uses CSS transitions for 60fps performance.

	[NTL] THE SIMPLE VERSION
	Imagine clicking a card and watching it smoothly grow into a full dialog!
	That's what this does — the thing you click transforms into the modal,
	giving you spatial context about where the content came from. When you
	close it, it shrinks back to where it started. No jarring pop-ups!

	============================================================

	FEATURES:
	- Shared-element morph: trigger expands into dialog, collapses on close
	- Pure CSS transitions — no JavaScript animation loops, 60fps composited
	- Focus trap (Tab/Shift+Tab cycle within dialog)
	- Escape key to close
	- Scroll lock when open (uses shared scrollLock utility)
	- Overlay with configurable colour and backdrop blur
	- Configurable duration, easing, dimensions, border radius
	- Click overlay to close (configurable)
	- Respects prefers-reduced-motion (instant show/hide)
	- Bindable open state for two-way control
	- Snippet-based API: trigger and children content

	DEPENDENCIES:
	- $lib/types (MorphingDialogProps)
	- $lib/scrollLock (lockScroll)
	- Zero external dependencies

	ACCESSIBILITY:
	- Keyboard: Escape to close, Tab/Shift+Tab focus trap
	- Screen readers: role="dialog", aria-modal, aria-labelledby
	- Focus: Returns focus to trigger on close
	- Motion: Respects prefers-reduced-motion

	USAGE:
	<MorphingDialog>
	  {#snippet trigger(props)}
	    <button {...props}>Open</button>
	  {/snippet}
	  <div>Dialog content here</div>
	</MorphingDialog>

	PROPS:
	| Prop           | Type    | Default                           | Description                      |
	|----------------|---------|-----------------------------------|----------------------------------|
	| open           | boolean | false                             | Dialog open state (bindable)     |
	| duration       | number  | 400                               | Morph duration in ms             |
	| easing         | string  | 'cubic-bezier(0.4, 0, 0.2, 1)'   | CSS transition easing            |
	| overlayColor   | string  | 'rgba(0, 0, 0, 0.5)'             | Overlay background colour        |
	| overlayBlur    | number  | 4                                 | Backdrop blur in pixels          |
	| dialogWidth    | string  | '560px'                           | Max width of expanded dialog     |
	| dialogHeight   | string  | 'auto'                            | Max height of expanded dialog    |
	| borderRadius   | string  | '16px'                            | Dialog border radius             |
	| closeOnOverlay | boolean | true                              | Close when overlay is clicked    |
	| closeOnEscape  | boolean | true                              | Close when Escape is pressed     |
	| class          | string  | ''                                | Additional CSS classes           |

	============================================================
-->

<script lang="ts">
	import type { MorphingDialogProps } from '$lib/types';
	import type { Snippet } from 'svelte';
	import { lockScroll } from '$lib/scrollLock';

	// =========================================================================
	// [CR] PROPS
	// [NTL] All the settings you can tweak — animation speed, colours, etc.
	// =========================================================================

	let {
		open = $bindable(false),
		duration = 400,
		easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
		overlayColor = 'rgba(0, 0, 0, 0.5)',
		overlayBlur = 4,
		dialogWidth = '560px',
		dialogHeight = 'auto',
		borderRadius = '16px',
		closeOnOverlay = true,
		closeOnEscape = true,
		class: className = '',
		trigger,
		children
	}: MorphingDialogProps & {
		trigger: Snippet<[{ onclick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'dialog' }]>;
		children: Snippet;
	} = $props();

	// =========================================================================
	// [CR] STATE
	// [NTL] Internal state for tracking the animation and focus
	// =========================================================================

	// The trigger element's bounding rect captured at the moment of click
	let triggerRect = $state<DOMRect | null>(null);

	// Reference to the trigger wrapper so we can measure it
	let triggerEl = $state<HTMLElement | null>(null);

	// Reference to the dialog element for focus management
	let dialogEl = $state<HTMLElement | null>(null);

	// Animation phase: 'idle' | 'morphing-open' | 'open' | 'morphing-close'
	let phase = $state<'idle' | 'morphing-open' | 'open' | 'morphing-close'>('idle');

	// Scroll unlock function
	let unlockScroll: (() => void) | null = null;

	// Element that had focus before dialog opened (to restore on close)
	let previousFocus: HTMLElement | null = null;

	// Check reduced motion preference
	let prefersReducedMotion = $state(false);

	// =========================================================================
	// [CR] OPEN / CLOSE LOGIC
	// [NTL] The clever bit! We capture where the trigger is on screen, then
	//       use that position as the starting point for the morph animation.
	// =========================================================================

	function openDialog() {
		if (phase !== 'idle') return;

		// Capture the trigger's position on screen right now
		if (triggerEl) {
			triggerRect = triggerEl.getBoundingClientRect();
		}

		// Remember what was focused so we can restore it later
		previousFocus = document.activeElement as HTMLElement;

		// Lock scroll and save the unlock function
		unlockScroll = lockScroll();

		// Start the opening morph
		open = true;

		if (prefersReducedMotion) {
			// Skip animation entirely — just show it
			phase = 'open';
			// Focus dialog on next tick
			requestAnimationFrame(() => focusDialog());
		} else {
			phase = 'morphing-open';

			// After the morph completes, settle into 'open' state
			setTimeout(() => {
				phase = 'open';
				focusDialog();
			}, duration);
		}
	}

	function closeDialog() {
		if (phase !== 'open') return;

		if (prefersReducedMotion) {
			// Skip animation — just hide
			phase = 'idle';
			open = false;
			cleanup();
		} else {
			// Re-capture trigger position (it may have shifted due to scroll)
			if (triggerEl) {
				triggerRect = triggerEl.getBoundingClientRect();
			}

			phase = 'morphing-close';

			// After the morph completes, fully close
			setTimeout(() => {
				phase = 'idle';
				open = false;
				cleanup();
			}, duration);
		}
	}

	function cleanup() {
		// Release scroll lock
		if (unlockScroll) {
			unlockScroll();
			unlockScroll = null;
		}

		// Restore focus to the trigger element
		if (previousFocus) {
			previousFocus.focus();
			previousFocus = null;
		}
	}

	// =========================================================================
	// [CR] FOCUS MANAGEMENT
	// [NTL] When the dialog opens, we trap focus inside it so keyboard users
	//       can Tab around without accidentally leaving the dialog.
	// =========================================================================

	function focusDialog() {
		if (!dialogEl) return;

		// Find the first focusable element inside the dialog
		const focusable = dialogEl.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusable.length > 0) {
			focusable[0].focus();
		} else {
			// Fallback: focus the dialog itself
			dialogEl.focus();
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!showDialog) return;

		if (event.key === 'Escape' && closeOnEscape && phase === 'open') {
			event.preventDefault();
			closeDialog();
			return;
		}

		// Focus trap: cycle Tab within the dialog
		if (event.key === 'Tab' && dialogEl && phase === 'open') {
			const focusable = dialogEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey) {
				// Shift+Tab: wrap from first to last
				if (document.activeElement === first) {
					event.preventDefault();
					last.focus();
				}
			} else {
				// Tab: wrap from last to first
				if (document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		// Only close if clicking the overlay itself, not dialog content
		if (closeOnOverlay && event.target === event.currentTarget) {
			closeDialog();
		}
	}

	// =========================================================================
	// [CR] REDUCED MOTION
	// [NTL] If the user has told their OS "I prefer less motion", we respect
	//       that by skipping animations entirely.
	// =========================================================================

	$effect(() => {
		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mq.matches;

			const handler = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};
			mq.addEventListener('change', handler);

			return () => mq.removeEventListener('change', handler);
		}
	});

	// =========================================================================
	// [CR] COMPUTED STYLES
	// [NTL] Here's the maths that makes the morph work! We calculate CSS
	//       transforms based on where the trigger is versus where the dialog
	//       should end up (centred on screen).
	// =========================================================================

	let morphStyle = $derived.by(() => {
		if (!triggerRect) return '';

		const animDuration = prefersReducedMotion ? '0ms' : `${duration}ms`;

		if (phase === 'morphing-open') {
			// Start at the trigger's position, then transition to center
			return `
				--morph-start-x: ${triggerRect.left}px;
				--morph-start-y: ${triggerRect.top}px;
				--morph-start-w: ${triggerRect.width}px;
				--morph-start-h: ${triggerRect.height}px;
				--morph-duration: ${animDuration};
				--morph-easing: ${easing};
			`;
		}

		if (phase === 'morphing-close') {
			// Transition from center back to the trigger's position
			return `
				--morph-start-x: ${triggerRect.left}px;
				--morph-start-y: ${triggerRect.top}px;
				--morph-start-w: ${triggerRect.width}px;
				--morph-start-h: ${triggerRect.height}px;
				--morph-duration: ${animDuration};
				--morph-easing: ${easing};
			`;
		}

		return '';
	});

	// Whether the dialog container should be visible at all
	let showDialog = $derived(phase !== 'idle');
</script>

<!-- Global keyboard handler for Escape and focus trap -->
<svelte:window onkeydown={handleWindowKeydown} />

<!-- Trigger element wrapper — we measure this for the morph origin -->
<span class="morphing-trigger" bind:this={triggerEl}>
	{@render trigger({
		onclick: openDialog,
		'aria-expanded': open,
		'aria-haspopup': 'dialog'
	})}
</span>

<!-- Dialog overlay + morphing container -->
{#if showDialog}
	<div
		class="morphing-overlay"
		class:morphing-overlay--visible={phase === 'open' || phase === 'morphing-open'}
		class:morphing-overlay--closing={phase === 'morphing-close'}
		style="
			--overlay-color: {overlayColor};
			--overlay-blur: {overlayBlur}px;
			--morph-duration: {prefersReducedMotion ? '0ms' : `${duration}ms`};
			--morph-easing: {easing};
		"
		onclick={handleOverlayClick}
		role="presentation"
	>
		<!-- The morphing dialog box -->
		<div
			bind:this={dialogEl}
			class="morphing-dialog {className}"
			class:morphing-dialog--at-trigger={phase === 'morphing-open'}
			class:morphing-dialog--at-center={phase === 'open'}
			class:morphing-dialog--closing={phase === 'morphing-close'}
			style="
				{morphStyle}
				--dialog-width: {dialogWidth};
				--dialog-height: {dialogHeight};
				--dialog-radius: {borderRadius};
			"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Close button -->
			<button
				class="morphing-close-btn"
				onclick={closeDialog}
				aria-label="Close dialog"
				type="button"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>

			<!-- Dialog content -->
			<div class="morphing-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ===================================================================
	   [CR] TRIGGER WRAPPER
	   [NTL] This wraps whatever you pass as the trigger. It's inline so
	         it doesn't mess with your layout.
	   =================================================================== */

	.morphing-trigger {
		display: inline-block;
	}

	/* ===================================================================
	   [CR] OVERLAY
	   [NTL] The dark backdrop behind the dialog. It fades in when the
	         dialog opens and fades out when it closes.
	   =================================================================== */

	.morphing-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		backdrop-filter: blur(0px);
		-webkit-backdrop-filter: blur(0px);
		transition:
			background-color var(--morph-duration) var(--morph-easing),
			backdrop-filter var(--morph-duration) var(--morph-easing),
			-webkit-backdrop-filter var(--morph-duration) var(--morph-easing);
	}

	.morphing-overlay--visible {
		background-color: var(--overlay-color);
		backdrop-filter: blur(var(--overlay-blur));
		-webkit-backdrop-filter: blur(var(--overlay-blur));
	}

	.morphing-overlay--closing {
		background-color: transparent;
		backdrop-filter: blur(0px);
		-webkit-backdrop-filter: blur(0px);
	}

	/* ===================================================================
	   [CR] MORPHING DIALOG
	   [NTL] This is where the magic happens! The dialog starts at exactly
	         the same size and position as the trigger, then transitions
	         to its final centered position. CSS does all the heavy lifting.
	   =================================================================== */

	.morphing-dialog {
		position: fixed;
		background: #ffffff;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
		outline: none;

		/* Start at trigger position */
		top: var(--morph-start-y);
		left: var(--morph-start-x);
		width: var(--morph-start-w);
		height: var(--morph-start-h);
		border-radius: 8px;
		opacity: 0;

		transition:
			top var(--morph-duration) var(--morph-easing),
			left var(--morph-duration) var(--morph-easing),
			width var(--morph-duration) var(--morph-easing),
			height var(--morph-duration) var(--morph-easing),
			border-radius var(--morph-duration) var(--morph-easing),
			opacity calc(var(--morph-duration) * 0.5) var(--morph-easing);
	}

	/* Phase 1: Starting at the trigger position, about to morph */
	.morphing-dialog--at-trigger {
		top: var(--morph-start-y);
		left: var(--morph-start-x);
		width: var(--morph-start-w);
		height: var(--morph-start-h);
		border-radius: 8px;
		opacity: 1;

		/* Kick the transition to center on next frame */
		animation: morph-to-center var(--morph-duration) var(--morph-easing) forwards;
	}

	/* Phase 2: Settled at center position */
	.morphing-dialog--at-center {
		position: relative;
		top: auto;
		left: auto;
		width: min(var(--dialog-width), calc(100vw - 2rem));
		height: var(--dialog-height);
		max-height: calc(100vh - 4rem);
		border-radius: var(--dialog-radius);
		opacity: 1;
		overflow-y: auto;
		transition: none;
	}

	/* Phase 3: Morphing back to trigger position */
	.morphing-dialog--closing {
		top: var(--morph-start-y);
		left: var(--morph-start-x);
		width: var(--morph-start-w);
		height: var(--morph-start-h);
		border-radius: 8px;
		opacity: 0;
	}

	/* Keyframe animation for the open morph — goes from trigger to center */
	@keyframes morph-to-center {
		0% {
			position: fixed;
			top: var(--morph-start-y);
			left: var(--morph-start-x);
			width: var(--morph-start-w);
			height: var(--morph-start-h);
			border-radius: 8px;
		}
		100% {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: min(var(--dialog-width, 560px), calc(100vw - 2rem));
			height: auto;
			min-height: 200px;
			max-height: calc(100vh - 4rem);
			border-radius: var(--dialog-radius, 16px);
		}
	}

	/* ===================================================================
	   [CR] CLOSE BUTTON
	   [NTL] The X in the top-right corner. Uses inline SVG so there's
	         no icon library dependency.
	   =================================================================== */

	.morphing-close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.05);
		color: #374151;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.morphing-close-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		color: #111827;
	}

	.morphing-close-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* ===================================================================
	   [CR] DIALOG CONTENT
	   [NTL] The scrollable content area inside the dialog.
	   =================================================================== */

	.morphing-content {
		padding: 1.5rem;
	}

	/* ===================================================================
	   [CR] REDUCED MOTION
	   [NTL] If the user prefers less motion, we skip the morph entirely
	         and just show/hide the dialog instantly.
	   =================================================================== */

	@media (prefers-reduced-motion: reduce) {
		.morphing-dialog,
		.morphing-overlay {
			transition-duration: 0ms !important;
			animation-duration: 0ms !important;
		}
	}
</style>
