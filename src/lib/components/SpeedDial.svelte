<!--
/**
 * SpeedDial - Floating action button with expandable action menu
 *
 * Features:
 * - Multiple layout types: linear, circle, semi-circle, quarter-circle
 * - Four directional support: up, down, left, right
 * - Staggered entrance/exit animations with configurable delay
 * - Optional modal mask/backdrop
 * - Tooltips with auto-positioning based on direction
 * - Full keyboard navigation (Tab, Enter, Escape)
 * - ARIA compliance for accessibility
 * - XSS-safe SVG icon rendering via DOMPurify
 * - Respects reduced motion preferences
 * - Bindable isOpen state for programmatic control
 *
 * Perfect for:
 * - Mobile-first floating action buttons (FAB)
 * - Quick action menus in dashboards
 * - Context-specific tool palettes
 * - Social sharing buttons
 * - Creative/design tool interfaces
 *
 * Technical Implementation:
 * - Pure CSS animations with GPU-accelerated transforms
 * - Trigonometric positioning for circular layouts
 * - CSS custom properties for dynamic positioning
 * - Focus trap within action items when open (Tab cycles through items)
 * - Click-outside detection for auto-close
 * - SVG icons sanitized with DOMPurify to prevent XSS attacks
 *
 * Layout Types:
 * - linear: Items in a straight line (default)
 * - circle: Items in full 360° around button
 * - semi-circle: Items in 180° arc
 * - quarter-circle: Items in 90° arc (perfect for corners)
 *
 * @component
 * @example
 * ```svelte
 * <script>
 *   const actions = [
 *     { id: 'edit', label: 'Edit', icon: '✏️', onclick: () => console.log('Edit') },
 *     { id: 'delete', label: 'Delete', icon: '🗑️', onclick: () => console.log('Delete') },
 *     { id: 'share', label: 'Share', icon: '🔗', onclick: () => console.log('Share') }
 *   ];
 * </script>
 *
 * <SpeedDial {actions} direction="up" type="linear" />
 * ```
 */
-->

<script lang="ts">
	import type {
		SpeedDialProps,
		SpeedDialAction,
		SpeedDialDirection,
		SpeedDialType
	} from '$lib/types';
	import { sanitizeSVG } from '$lib/utils';

	/**
	 * Props for SpeedDial component
	 * All props have sensible defaults for immediate use
	 */
	let {
		actions = [],
		direction = 'up',
		type = 'linear',
		radius = 80,
		transitionDelay = 30,
		showTooltip = true,
		tooltipPosition = 'auto',
		mask = false,
		disabled = false,
		buttonIcon,
		buttonLabel = 'Open menu',
		class: className = '',
		isOpen = $bindable(false)
	}: SpeedDialProps = $props();

	/**
	 * Reference to the container for click-outside detection
	 */
	let containerRef: HTMLDivElement | undefined = $state();

	/**
	 * Reference to the main trigger button for focus management
	 */
	let triggerButtonRef: HTMLButtonElement | undefined = $state();

	/**
	 * References to action buttons for focus trapping
	 * Note: Array may contain null/undefined refs if actions change dynamically
	 */
	let actionButtonRefs: (HTMLButtonElement | null)[] = $state([]);

	/**
	 * Derived list of valid, enabled action buttons for focus trapping
	 * Filters out stale refs and disabled buttons automatically
	 */
	let enabledActionButtons = $derived(
		actionButtonRefs.filter((btn): btn is HTMLButtonElement => btn !== null && !btn?.disabled)
	);

	/**
	 * Toggle the SpeedDial open/closed state
	 */
	function toggle(): void {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	/**
	 * Close the SpeedDial and return focus to trigger button
	 */
	function close(): void {
		isOpen = false;
		// Return focus to the trigger button
		triggerButtonRef?.focus();
	}

	/**
	 * Handle action item click
	 * Executes the action's onclick callback and closes the menu
	 */
	function handleActionClick(action: SpeedDialAction): void {
		if (!action.disabled && action.onclick) {
			action.onclick();
		}
		close();
	}

	/**
	 * Handle keyboard navigation with focus trapping
	 * - Escape: Close menu
	 * - Tab/Shift+Tab: Cycle through action items (trapped when open)
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (!isOpen) return;

		if (event.key === 'Escape') {
			close();
			event.preventDefault();
			return;
		}

		// Focus trapping within action items (uses derived enabledActionButtons)
		if (event.key === 'Tab' && enabledActionButtons.length > 0) {
			const currentIndex = enabledActionButtons.findIndex((btn) => btn === document.activeElement);

			if (event.shiftKey) {
				// Shift+Tab: Move backwards
				if (currentIndex <= 0) {
					// At first item or trigger, wrap to last
					event.preventDefault();
					enabledActionButtons[enabledActionButtons.length - 1]?.focus();
				}
			} else {
				// Tab: Move forwards
				if (currentIndex === enabledActionButtons.length - 1) {
					// At last item, wrap to first
					event.preventDefault();
					enabledActionButtons[0]?.focus();
				} else if (currentIndex === -1 && document.activeElement === triggerButtonRef) {
					// From trigger, go to first action
					event.preventDefault();
					enabledActionButtons[0]?.focus();
				}
			}
		}
	}

	/**
	 * Handle click outside to close
	 * Checks that click is outside container AND not on the trigger button
	 * (prevents race condition where opening click immediately closes menu)
	 */
	function handleClickOutside(event: MouseEvent): void {
		const target = event.target as Node;
		// Ignore clicks on the trigger button (handled by toggle)
		if (triggerButtonRef?.contains(target)) {
			return;
		}
		// Close if click is outside the container
		if (containerRef && !containerRef.contains(target)) {
			close();
		}
	}

	/**
	 * Safely render icon content
	 * Sanitizes SVG/HTML to prevent XSS attacks
	 */
	function getSafeIcon(icon: string): string {
		if (icon.startsWith('<')) {
			// Sanitize any HTML/SVG content
			return sanitizeSVG(icon);
		}
		return icon;
	}

	/**
	 * Check if icon is HTML/SVG (needs {@html} rendering)
	 */
	function isHtmlIcon(icon: string): boolean {
		return icon.startsWith('<');
	}

	/**
	 * Calculate position for each action item based on layout type and direction
	 * Returns CSS custom properties for positioning
	 */
	function getItemPosition(index: number, total: number): string {
		const itemRadius = radius;

		if (type === 'linear') {
			// Linear layout: items in a straight line
			const offset = (index + 1) * 60; // 60px spacing between items
			switch (direction) {
				case 'up':
					return `--item-x: 0px; --item-y: -${offset}px;`;
				case 'down':
					return `--item-x: 0px; --item-y: ${offset}px;`;
				case 'left':
					return `--item-x: -${offset}px; --item-y: 0px;`;
				case 'right':
					return `--item-x: ${offset}px; --item-y: 0px;`;
			}
		}

		// Circular layouts use trigonometry
		let startAngle: number;
		let angleSpan: number;

		if (type === 'circle') {
			// Full circle: 360°
			startAngle = getStartAngle(direction);
			angleSpan = 360;
		} else if (type === 'semi-circle') {
			// Half circle: 180°
			startAngle = getSemiCircleStart(direction);
			angleSpan = 180;
		} else {
			// Quarter circle: 90°
			startAngle = getQuarterCircleStart(direction);
			angleSpan = 90;
		}

		// Calculate angle for this item
		const angleStep = total > 1 ? angleSpan / (total - 1) : 0;
		const angle = startAngle + index * angleStep;
		const radians = (angle * Math.PI) / 180;

		const x = Math.cos(radians) * itemRadius;
		const y = Math.sin(radians) * itemRadius;

		return `--item-x: ${x.toFixed(2)}px; --item-y: ${-y.toFixed(2)}px;`;
	}

	/**
	 * Get start angle for full circle based on direction
	 */
	function getStartAngle(dir: SpeedDialDirection): number {
		switch (dir) {
			case 'up':
				return 90;
			case 'down':
				return -90;
			case 'left':
				return 180;
			case 'right':
				return 0;
		}
	}

	/**
	 * Get start angle for semi-circle based on direction
	 */
	function getSemiCircleStart(dir: SpeedDialDirection): number {
		switch (dir) {
			case 'up':
				return 0; // 0° to 180° (bottom-left to bottom-right, curving up)
			case 'down':
				return 180; // 180° to 360° (top-left to top-right, curving down)
			case 'left':
				return 90; // 90° to 270° (top to bottom, curving left)
			case 'right':
				return -90; // -90° to 90° (bottom to top, curving right)
		}
	}

	/**
	 * Get start angle for quarter-circle based on direction
	 * Perfect for positioning in corners
	 */
	function getQuarterCircleStart(dir: SpeedDialDirection): number {
		switch (dir) {
			case 'up':
				return 45; // Upper-left to upper-right
			case 'down':
				return 225; // Lower-right to lower-left
			case 'left':
				return 135; // Upper-left to lower-left
			case 'right':
				return -45; // Lower-right to upper-right
		}
	}

	/**
	 * Get tooltip position based on direction or explicit setting
	 */
	function getTooltipPosition(): 'left' | 'right' | 'top' | 'bottom' {
		if (tooltipPosition !== 'auto') {
			return tooltipPosition;
		}

		// Auto-position based on direction
		switch (direction) {
			case 'up':
				return 'left';
			case 'down':
				return 'right';
			case 'left':
				return 'top';
			case 'right':
				return 'bottom';
		}
	}

	/**
	 * Effect to add/remove click outside listener
	 */
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal mask/backdrop (optional) -->
<!-- Escape key handled at window level via handleKeydown -->
{#if mask && isOpen}
	<div class="speed-dial-mask" onclick={close} aria-hidden="true"></div>
{/if}

<div
	class="speed-dial {className}"
	class:is-open={isOpen}
	class:is-disabled={disabled}
	bind:this={containerRef}
>
	<!-- Action items container -->
	<div class="speed-dial-actions" class:is-visible={isOpen}>
		{#each actions as action, index}
			<button
				class="speed-dial-action {action.class || ''}"
				class:is-disabled={action.disabled}
				style="{getItemPosition(index, actions.length)} --delay: {index * transitionDelay}ms;"
				onclick={() => handleActionClick(action)}
				disabled={action.disabled || !isOpen}
				aria-label={action.label}
				tabindex={isOpen ? 0 : -1}
				bind:this={actionButtonRefs[index]}
			>
				<!-- Icon: Support for emoji or sanitized SVG -->
				<span class="action-icon" aria-hidden="true">
					{#if isHtmlIcon(action.icon)}
						{@html getSafeIcon(action.icon)}
					{:else}
						{action.icon}
					{/if}
				</span>

				<!-- Tooltip -->
				{#if showTooltip}
					<span class="action-tooltip tooltip-{getTooltipPosition()}" role="tooltip">
						{action.label}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Main trigger button -->
	<button
		class="speed-dial-button"
		onclick={toggle}
		disabled={disabled}
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-label={buttonLabel}
		bind:this={triggerButtonRef}
	>
		{#if buttonIcon}
			<!-- Custom icon (sanitized) -->
			<span class="button-icon" aria-hidden="true">
				{#if isHtmlIcon(buttonIcon)}
					{@html getSafeIcon(buttonIcon)}
				{:else}
					{buttonIcon}
				{/if}
			</span>
		{:else}
			<!-- Default plus/close icon (rotates on open) -->
			<svg
				class="button-icon-svg"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		{/if}
	</button>
</div>

<style>
	/**
	 * SpeedDial Container
	 * Positions the component and establishes stacking context
	 */
	.speed-dial {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.speed-dial.is-disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	/**
	 * Modal Mask/Backdrop
	 * Semi-transparent overlay behind the menu
	 */
	.speed-dial-mask {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 998;
		animation: mask-fade-in 0.2s ease-out;
	}

	@keyframes mask-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/**
	 * Main Trigger Button
	 * The primary FAB that opens/closes the menu
	 */
	.speed-dial-button {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #146ef5, #667eea);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 4px 12px rgba(20, 110, 245, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
		z-index: 1000;
		position: relative;
	}

	.speed-dial-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow:
			0 6px 16px rgba(20, 110, 245, 0.4),
			0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.speed-dial-button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.speed-dial-button:focus-visible {
		outline: 3px solid rgba(20, 110, 245, 0.5);
		outline-offset: 3px;
	}

	.speed-dial-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/**
	 * Button Icon
	 * Rotates 45° when menu is open (turns + into ×)
	 */
	.button-icon,
	.button-icon-svg {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.speed-dial.is-open .button-icon,
	.speed-dial.is-open .button-icon-svg {
		transform: rotate(45deg);
	}

	.button-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	/**
	 * Actions Container
	 * Holds all action items, positioned absolutely around the main button
	 */
	.speed-dial-actions {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.speed-dial-actions.is-visible {
		pointer-events: auto;
	}

	/**
	 * Individual Action Button
	 * Each action item in the menu
	 */
	.speed-dial-action {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		background: white;
		color: #333;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.15),
			0 1px 3px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
		transform: translate(-50%, -50%) scale(0);
		opacity: 0;
		z-index: 999;
		transition-delay: var(--delay, 0ms);
	}

	/* Positioned state when menu is open */
	.speed-dial-actions.is-visible .speed-dial-action {
		transform: translate(calc(-50% + var(--item-x, 0px)), calc(-50% + var(--item-y, 0px))) scale(1);
		opacity: 1;
	}

	.speed-dial-action:hover:not(:disabled) {
		background: #f5f5f5;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.2),
			0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translate(calc(-50% + var(--item-x, 0px)), calc(-50% + var(--item-y, 0px)))
			scale(1.1);
	}

	.speed-dial-action:active:not(:disabled) {
		transform: translate(calc(-50% + var(--item-x, 0px)), calc(-50% + var(--item-y, 0px)))
			scale(0.95);
	}

	.speed-dial-action:focus-visible {
		outline: 3px solid rgba(20, 110, 245, 0.5);
		outline-offset: 2px;
	}

	.speed-dial-action.is-disabled,
	.speed-dial-action:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/**
	 * Action Icon
	 */
	.action-icon {
		font-size: 1.25rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-icon :global(svg) {
		width: 20px;
		height: 20px;
	}

	/**
	 * Tooltips
	 * Labels that appear on hover, positioned based on direction
	 */
	.action-tooltip {
		position: absolute;
		padding: 6px 12px;
		background: #333;
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 4px;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
		z-index: 1001;
	}

	/* Tooltip arrow */
	.action-tooltip::before {
		content: '';
		position: absolute;
		border: 5px solid transparent;
	}

	/* Tooltip positions */
	.tooltip-left {
		right: calc(100% + 10px);
		top: 50%;
		transform: translateY(-50%) translateX(5px);
	}

	.tooltip-left::before {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-left-color: #333;
	}

	.tooltip-right {
		left: calc(100% + 10px);
		top: 50%;
		transform: translateY(-50%) translateX(-5px);
	}

	.tooltip-right::before {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-right-color: #333;
	}

	.tooltip-top {
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%) translateY(5px);
	}

	.tooltip-top::before {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-top-color: #333;
	}

	.tooltip-bottom {
		top: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%) translateY(-5px);
	}

	.tooltip-bottom::before {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-bottom-color: #333;
	}

	/* Show tooltip on hover */
	.speed-dial-action:hover .action-tooltip,
	.speed-dial-action:focus-visible .action-tooltip {
		opacity: 1;
	}

	.speed-dial-action:hover .tooltip-left,
	.speed-dial-action:focus-visible .tooltip-left {
		transform: translateY(-50%) translateX(0);
	}

	.speed-dial-action:hover .tooltip-right,
	.speed-dial-action:focus-visible .tooltip-right {
		transform: translateY(-50%) translateX(0);
	}

	.speed-dial-action:hover .tooltip-top,
	.speed-dial-action:focus-visible .tooltip-top {
		transform: translateX(-50%) translateY(0);
	}

	.speed-dial-action:hover .tooltip-bottom,
	.speed-dial-action:focus-visible .tooltip-bottom {
		transform: translateX(-50%) translateY(0);
	}

	/**
	 * Reduced Motion Support
	 * Respects user preference for reduced animations
	 */
	@media (prefers-reduced-motion: reduce) {
		.speed-dial-button,
		.speed-dial-action,
		.button-icon,
		.button-icon-svg,
		.action-tooltip {
			transition-duration: 0.1s;
		}

		.speed-dial-mask {
			animation-duration: 0.1s;
		}
	}

	/**
	 * Dark Mode Support
	 * Adjusts colours for dark theme (via CSS custom properties or media query)
	 */
	@media (prefers-color-scheme: dark) {
		.speed-dial-action {
			background: #2d2d2d;
			color: #fff;
		}

		.speed-dial-action:hover:not(:disabled) {
			background: #3d3d3d;
		}
	}
</style>
