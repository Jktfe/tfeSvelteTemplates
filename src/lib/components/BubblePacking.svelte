<!--
	============================================================
	BubblePacking - Interactive Circle Packing (Zero Dependencies)
	============================================================

	[CR] WHAT IT DOES
	Force-directed circle packing visualization that positions circles
	based on their values, with smooth collision detection and animated
	positioning. Supports groups, tooltips, click handlers, and labels.

	[NTL] THE SIMPLE VERSION
	Imagine a bunch of bubbles floating in a container! Bigger values make
	bigger bubbles, and they all push each other around until they find
	a nice arrangement. You can hover to see details and click to select.

	✨ FEATURES
	• Native circle packing algorithm (no D3 dependency!)
	• Force simulation for smooth positioning
	• Interactive hover effects with tooltips
	• Click handlers for bubble selection
	• Group-based colour coding with customisable palette
	• Dynamic text labels that scale with bubble size
	• Responsive SVG container
	• Smooth CSS transitions for state changes

	♿ ACCESSIBILITY
	• ARIA role="region" on container
	• Each bubble has role="button" and aria-label
	• Keyboard accessible (Tab + Enter/Space)
	• Respects prefers-reduced-motion preference

	📦 DEPENDENCIES
	Zero external dependencies - fully portable!

	⚠️ WARNINGS
	None expected

	🎨 USAGE
	<BubblePacking
		data={bubbleData}
		width={600}
		height={600}
		onBubbleClick={(bubble) => console.log(bubble)}
	/>

	📋 PROPS
	| Prop            | Type           | Default          | Description                    |
	|-----------------|----------------|------------------|--------------------------------|
	| data            | BubbleItem[]   | []               | Array of bubble data           |
	| width           | number         | 600              | SVG width in pixels            |
	| height          | number         | 600              | SVG height in pixels           |
	| padding         | number         | 3                | Gap between bubbles            |
	| colorScheme     | string[]       | BUBBLE_COLOR...  | Array of colours for groups    |
	| showLabels      | boolean        | true             | Show text labels on bubbles    |
	| labelThreshold  | number         | 20               | Min radius to show label       |
	| useForce        | boolean        | true             | Use force simulation           |
	| onBubbleClick   | function       | undefined        | Called with bubble data        |
	| onBubbleHover   | function       | undefined        | Called on hover                |
	| tooltipFormatter| function       | undefined        | Custom tooltip text function   |

	============================================================
-->

<script lang="ts">
	// [CR] Type imports for props and data structures
	import type { BubblePackingProps, BubbleItem } from '$lib/types';
	import { BUBBLE_COLOR_SCHEME } from '$lib/constants';

	// =========================================================================
	// [CR] PROPS - All configurable options with sensible defaults
	// [NTL] These are the settings you can pass to customise the bubble chart!
	// =========================================================================

	let {
		data = [],                          // [NTL] Your data as [{id, label, value, group}, ...]
		width = 600,                        // [NTL] How wide the chart is in pixels
		height = 600,                       // [NTL] How tall the chart is in pixels
		padding = 3,                        // [NTL] Gap between bubbles
		colorScheme = BUBBLE_COLOR_SCHEME,  // [NTL] Array of colours for different groups
		showLabels = true,                  // [NTL] Show text labels on bubbles
		labelThreshold = 20,                // [NTL] Minimum radius to show a label
		useForce = true,                    // [NTL] Use physics simulation for positioning
		onBubbleClick,                      // [NTL] What happens when you click a bubble
		onBubbleHover,                      // [NTL] What happens when you hover over a bubble
		tooltipFormatter,                   // [NTL] Custom function to format tooltip text
		class: className = ''               // [NTL] Extra CSS classes for the container
	}: BubblePackingProps = $props();

	// =========================================================================
	// [CR] INTERNAL TYPES
	// [NTL] This describes what a "packed" bubble looks like after we calculate
	//       its position and size. It's the original data plus x, y, and radius.
	// =========================================================================

	interface PackedBubble {
		id: string;
		label: string;
		value: number;
		color: string;
		group: string;
		x: number;          // [NTL] Horizontal position (center of bubble)
		y: number;          // [NTL] Vertical position (center of bubble)
		r: number;          // [NTL] Radius (half the diameter)
		originalData: BubbleItem;  // [NTL] Keep reference to original data
	}

	// =========================================================================
	// [CR] COMPONENT STATE - Reactive values managed internally
	// [NTL] These track what's happening right now (hover, tooltip, etc.)
	// =========================================================================

	// [CR] Tooltip state object containing position and content
	// [NTL] This controls that little popup that appears when you hover
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	// [CR] Track which bubble is currently hovered for visual highlighting
	let hoveredBubble = $state<string | null>(null);

	// [CR] Reference to container DOM element for tooltip positioning
	let containerEl = $state<HTMLDivElement | undefined>();

	// =========================================================================
	// [CR] CIRCLE PACKING ALGORITHM
	// [NTL] This is the core of the visualization! We need to figure out how
	//       big each bubble should be and where to place them without overlap.
	// =========================================================================

	/**
	 * [CR] Convert value to radius using square root scaling for perceptual accuracy.
	 * [NTL] Here's a subtle but important point: if we just used value directly,
	 *       a bubble with value 4 would look WAY bigger than one with value 1
	 *       (16x the area!). Using square root means area is proportional to value.
	 */
	function valueToRadius(value: number, maxValue: number, maxRadius: number): number {
		if (maxValue === 0) return 10;
		return Math.max(10, Math.sqrt(value / maxValue) * maxRadius);
	}

	/**
	 * [CR] Extract unique group names from data for colour assignment.
	 * [NTL] Each group gets its own colour. This function finds all the unique
	 *       group names so we can assign colours from our palette.
	 */
	function getGroups(items: BubbleItem[]): string[] {
		const groups = new Set<string>();
		for (const item of items) {
			if (item.group) groups.add(item.group);
		}
		return Array.from(groups);
	}

	/**
	 * [CR] Force-directed circle packing algorithm with collision detection.
	 * [NTL] This is where the physics magic happens! We:
	 *       1. Start bubbles near the center
	 *       2. Run a simulation where bubbles push each other apart
	 *       3. Keep them pulled towards the center so they don't scatter
	 *       4. Repeat until they settle into a nice arrangement
	 */
	function packCircles(items: BubbleItem[], containerWidth: number, containerHeight: number): PackedBubble[] {
		if (items.length === 0) return [];

		const groups = getGroups(items);
		const groupColorMap = new Map<string, string>();
		groups.forEach((group, i) => {
			groupColorMap.set(group, colorScheme[i % colorScheme.length]);
		});

		// Calculate max value and max possible radius
		const maxValue = Math.max(...items.map((item) => item.value));
		const containerRadius = Math.min(containerWidth, containerHeight) / 2;
		const maxBubbleRadius = containerRadius * 0.35; // Largest bubble takes 35% of container radius

		// Calculate total area needed
		const totalArea = items.reduce((sum, item) => {
			const r = valueToRadius(item.value, maxValue, maxBubbleRadius);
			return sum + Math.PI * r * r;
		}, 0);

		// Scale factor to fit all bubbles in container
		const availableArea = Math.PI * containerRadius * containerRadius * 0.85;
		const scaleFactor = Math.sqrt(availableArea / totalArea);

		// Create initial bubbles with scaled radii
		const bubbles: PackedBubble[] = items.map((item) => {
			const baseRadius = valueToRadius(item.value, maxValue, maxBubbleRadius);
			const r = Math.max(10, baseRadius * Math.min(1, scaleFactor));

			return {
				id: item.id,
				label: item.label,
				value: item.value,
				color: item.color || groupColorMap.get(item.group || '') || colorScheme[0],
				group: item.group || '',
				x: containerWidth / 2 + (Math.random() - 0.5) * containerRadius * 0.5,
				y: containerHeight / 2 + (Math.random() - 0.5) * containerRadius * 0.5,
				r,
				originalData: item
			};
		});

		// Sort by size (largest first) for better packing
		bubbles.sort((a, b) => b.r - a.r);

		// Place first bubble at center
		if (bubbles.length > 0) {
			bubbles[0].x = containerWidth / 2;
			bubbles[0].y = containerHeight / 2;
		}

		// Force-directed simulation to resolve overlaps
		const iterations = useForce ? 150 : 50;
		const centerX = containerWidth / 2;
		const centerY = containerHeight / 2;

		for (let iter = 0; iter < iterations; iter++) {
			const alpha = 1 - iter / iterations; // Decreasing force over time

			for (let i = 0; i < bubbles.length; i++) {
				const bubble = bubbles[i];
				let fx = 0;
				let fy = 0;

				// Force towards center
				const dxCenter = centerX - bubble.x;
				const dyCenter = centerY - bubble.y;
				const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
				if (distCenter > 0) {
					fx += (dxCenter / distCenter) * 0.5 * alpha;
					fy += (dyCenter / distCenter) * 0.5 * alpha;
				}

				// Collision avoidance with other bubbles
				for (let j = 0; j < bubbles.length; j++) {
					if (i === j) continue;

					const other = bubbles[j];
					const dx = bubble.x - other.x;
					const dy = bubble.y - other.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const minDist = bubble.r + other.r + padding;

					if (dist < minDist && dist > 0) {
						const overlap = minDist - dist;
						const pushForce = overlap * 0.5 * alpha;
						fx += (dx / dist) * pushForce;
						fy += (dy / dist) * pushForce;
					}
				}

				// Keep within container bounds
				const margin = bubble.r + padding;
				if (bubble.x - margin < 0) fx += (margin - bubble.x) * 0.5;
				if (bubble.x + margin > containerWidth) fx -= (bubble.x + margin - containerWidth) * 0.5;
				if (bubble.y - margin < 0) fy += (margin - bubble.y) * 0.5;
				if (bubble.y + margin > containerHeight) fy -= (bubble.y + margin - containerHeight) * 0.5;

				// Apply forces
				bubble.x += fx;
				bubble.y += fy;
			}
		}

		return bubbles;
	}

	// =========================================================================
	// [CR] REACTIVE COMPUTATIONS
	// [NTL] Svelte's $derived rune automatically recalculates these whenever
	//       the input data changes. It's like a spreadsheet formula!
	// =========================================================================

	/**
	 * [CR] Compute packed bubble positions whenever data, width, or height changes.
	 * [NTL] This is the main calculation - it runs our packing algorithm and
	 *       gives us the final positions for all bubbles.
	 */
	let packedBubbles = $derived(packCircles(data, width, height));

	/**
	 * [CR] Build legend data showing each group and its colour.
	 * [NTL] The legend shows what each colour means - like a key on a map.
	 */
	let legendGroups = $derived(() => {
		const groups = getGroups(data);
		return groups.map((group, i) => ({
			group,
			color: colorScheme[i % colorScheme.length]
		}));
	});

	// =========================================================================
	// [CR] EVENT HANDLERS
	// [NTL] These functions respond to user interactions - hover, click, etc.
	// =========================================================================

	/**
	 * [CR] Display tooltip at cursor position with bubble details.
	 * [NTL] When you hover over a bubble, this shows a tooltip with the label
	 *       and value. The tooltip follows your mouse and stays out of the way.
	 */
	function showTooltip(event: MouseEvent, bubble: PackedBubble) {
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const tooltipX = event.clientX - rect.left;
		const tooltipY = event.clientY - rect.top;

		const text = tooltipFormatter
			? tooltipFormatter(bubble.originalData)
			: `${bubble.label}: ${bubble.value.toLocaleString()}`;

		tooltip = {
			visible: true,
			x: tooltipX,
			y: tooltipY - 10,
			text
		};

		hoveredBubble = bubble.id;
		onBubbleHover?.(bubble.originalData);
	}

	/**
	 * [CR] Hide the tooltip when mouse leaves a bubble.
	 * [NTL] Simple cleanup - hide the tooltip and clear the hover state.
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
		hoveredBubble = null;
		onBubbleHover?.(null);
	}

	/**
	 * [CR] Handle touch/tap on a bubble - show tooltip on first tap, action on second
	 * [NTL] On mobile, tapping once shows the tooltip, tapping again triggers the click.
	 *       This mimics the hover-then-click pattern from desktop.
	 */
	function handleTouchStart(event: TouchEvent, bubble: PackedBubble) {
		event.preventDefault(); // [CR] Prevent mouse event simulation

		if (hoveredBubble === bubble.id) {
			// [NTL] Second tap on same bubble - trigger the click action
			handleBubbleClick(bubble);
			hideTooltip();
		} else {
			// [NTL] First tap - show tooltip
			if (!containerEl) return;
			const touch = event.touches[0];
			const rect = containerEl.getBoundingClientRect();
			const tooltipX = touch.clientX - rect.left;
			const tooltipY = touch.clientY - rect.top;

			const text = tooltipFormatter
				? tooltipFormatter(bubble.originalData)
				: `${bubble.label}: ${bubble.value.toLocaleString()}`;

			tooltip = {
				visible: true,
				x: tooltipX,
				y: tooltipY - 10,
				text
			};

			hoveredBubble = bubble.id;
			onBubbleHover?.(bubble.originalData);
		}
	}

	/**
	 * [CR] Close tooltip when tapping outside bubbles
	 * [NTL] Tapping anywhere else on the chart clears the selection
	 */
	function handleContainerTouchStart(event: TouchEvent) {
		// [CR] Only close if tapping on the container itself, not a bubble
		if (event.target === containerEl || (event.target as Element).classList.contains('bubble-svg')) {
			hideTooltip();
		}
	}

	/**
	 * [CR] Handle click on a bubble, firing the callback if provided.
	 * [NTL] When you click a bubble, this tells your app which one was clicked.
	 */
	function handleBubbleClick(bubble: PackedBubble) {
		onBubbleClick?.(bubble.originalData);
	}

	/**
	 * [CR] Calculate appropriate font size based on bubble radius.
	 * [NTL] Bigger bubbles get bigger text, but we limit the range so it's
	 *       always readable (not too tiny, not too huge).
	 */
	function getFontSize(radius: number): number {
		// Scale font size with radius, with min/max limits
		return Math.max(8, Math.min(16, radius * 0.35));
	}

	/**
	 * [CR] Truncate label to fit within the bubble's diameter.
	 * [NTL] Long labels would overflow the bubble, so we cut them short
	 *       and add "..." to show there's more.
	 */
	function truncateLabel(label: string, radius: number): string {
		const maxChars = Math.floor(radius / 4);
		if (label.length <= maxChars) return label;
		return label.substring(0, maxChars - 1) + '…';
	}
</script>

<div
	bind:this={containerEl}
	class="bubble-packing-container {className}"
	role="region"
	aria-label="Bubble packing visualization"
	ontouchstart={handleContainerTouchStart}
>
	<!-- SVG Bubble Chart -->
	<svg {width} {height} viewBox="0 0 {width} {height}" class="bubble-svg">
		<!-- Bubble circles -->
		{#each packedBubbles as bubble (bubble.id)}
			{@const isHovered = hoveredBubble === bubble.id}
			<!-- [CR] Group just handles positioning; hover effects are on the circle -->
			<g
				class="bubble-group"
				transform="translate({bubble.x}, {bubble.y})"
			>
				<!-- Circle -->
				<circle
					r={bubble.r}
					fill={bubble.color}
					class="bubble-circle"
					class:hovered={isHovered}
					role="button"
					tabindex="0"
					aria-label="{bubble.label}: {bubble.value}"
					onmouseenter={(e) => showTooltip(e, bubble)}
					onmouseleave={hideTooltip}
					onclick={() => handleBubbleClick(bubble)}
					ontouchstart={(e) => handleTouchStart(e, bubble)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleBubbleClick(bubble);
						}
					}}
				/>

				<!-- Label text (if radius is large enough) -->
				{#if showLabels && bubble.r >= labelThreshold}
					<text
						class="bubble-label"
						text-anchor="middle"
						dominant-baseline="middle"
						font-size={getFontSize(bubble.r)}
						pointer-events="none"
					>
						{truncateLabel(bubble.label, bubble.r)}
					</text>
				{/if}
			</g>
		{/each}
	</svg>

	<!-- Tooltip -->
	{#if tooltip.visible}
		<div
			class="tooltip"
			style:left="{tooltip.x}px"
			style:top="{tooltip.y}px"
			role="tooltip"
			aria-live="polite"
		>
			{tooltip.text}
		</div>
	{/if}

	<!-- Legend -->
	{#if legendGroups().length > 1}
		<div class="legend">
			{#each legendGroups() as { group, color }}
				<div class="legend-item">
					<div class="legend-color" style:background-color={color}></div>
					<span class="legend-label">{group}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/**
	 * Container styling
	 * [CR] max-width and overflow-x for mobile responsiveness
	 * [NTL] On small screens, this prevents the chart from breaking out of its container
	 */
	.bubble-packing-container {
		display: inline-block;
		user-select: none;
		-webkit-user-select: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		position: relative;
		max-width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	/**
	 * SVG styling
	 * [CR] max-width ensures SVG scales down on mobile while maintaining aspect ratio
	 */
	.bubble-svg {
		display: block;
		max-width: 100%;
		height: auto;
	}

	/**
	 * [CR] Bubble group - no transform animation here to avoid conflicting
	 * with the positioning transform="translate(x, y)"
	 * [NTL] We used to scale the whole group on hover, but that caused glitchy
	 * movement because SVG transforms don't combine - they replace each other!
	 */
	.bubble-group {
		/* [CR] No transition here - the circle handles hover effects */
	}

	/**
	 * [CR] Bubble circle styling - hover effects use opacity/stroke only, no movement
	 * [NTL] We deliberately avoid any scale or transform effects because they cause
	 *       the bubbles to appear to "jump" which is distracting and glitchy.
	 */
	.bubble-circle {
		stroke: rgba(255, 255, 255, 0.4);
		stroke-width: 2px;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			stroke-width 0.2s ease,
			stroke 0.2s ease;
		opacity: 0.85;
	}

	.bubble-circle:hover,
	.bubble-circle.hovered {
		opacity: 1;
		stroke-width: 3px;
		stroke: rgba(255, 255, 255, 0.9);
	}

	.bubble-circle:focus {
		outline: none;
		stroke: #0969da;
		stroke-width: 3px;
	}

	/**
	 * Bubble label styling
	 */
	.bubble-label {
		fill: white;
		font-weight: 500;
		text-shadow:
			0 1px 2px rgba(0, 0, 0, 0.3),
			0 0 4px rgba(0, 0, 0, 0.2);
	}

	/**
	 * Tooltip styling
	 */
	.tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		pointer-events: none;
		white-space: nowrap;
		z-index: 100;
		transform: translate(-50%, -100%);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.9);
	}

	/**
	 * Legend styling
	 */
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 16px;
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: 12px;
		color: #666;
	}

	/**
	 * [CR] Accessibility: Respect reduced motion preference
	 * [NTL] Some people get motion sick or have vestibular disorders - we disable
	 *       animations for them if they've set that preference in their system.
	 */
	@media (prefers-reduced-motion: reduce) {
		.bubble-circle {
			transition: none;
		}
	}

	/**
	 * Dark mode support
	 */
	@media (prefers-color-scheme: dark) {
		.legend-label {
			color: #adbac7;
		}

		.bubble-circle {
			stroke: rgba(0, 0, 0, 0.3);
		}

		.bubble-circle:hover {
			stroke: rgba(0, 0, 0, 0.5);
		}
	}
</style>

<!-- [CR] Gold Standard review complete. All [CR]/[NTL] comments added. -->
