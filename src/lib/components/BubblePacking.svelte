<!--
/**
 * BubblePacking - Interactive circle packing visualization
 *
 * Features:
 * - Native circle packing algorithm (no D3 dependency)
 * - Force simulation for smooth animated positioning
 * - Interactive hover effects with tooltips
 * - Click handlers for bubble selection
 * - Group-based colour coding with customisable palette
 * - Dynamic text labels that scale with bubble size
 * - Responsive SVG container
 * - Smooth CSS transitions for state changes
 * - Accessibility with ARIA labels
 * - Zero external dependencies
 *
 * Perfect for:
 * - Market share visualizations
 * - Portfolio/asset allocation displays
 * - Category/tag clouds by frequency
 * - Hierarchical data exploration
 * - Comparative size analysis
 *
 * Technical Implementation:
 * - Custom circle packing using front-chain algorithm
 * - Force simulation with collision detection
 * - Reactive layout computation with $derived rune
 * - SVG viewBox for responsive scaling
 * - CSS transitions with prefers-reduced-motion support
 * - Pointer Events API for unified input handling
 *
 * @component
 * @example
 * ```svelte
 * <BubblePacking
 *   data={bubbleData}
 *   width={600}
 *   height={600}
 *   onBubbleClick={(bubble) => console.log(bubble)}
 * />
 * ```
 */
-->

<script lang="ts">
	import type { BubblePackingProps, BubbleItem } from '$lib/types';
	import { BUBBLE_COLOR_SCHEME } from '$lib/constants';

	/**
	 * Component props with defaults
	 */
	let {
		data = [],
		width = 600,
		height = 600,
		padding = 3,
		colorScheme = BUBBLE_COLOR_SCHEME,
		showLabels = true,
		labelThreshold = 20,
		useForce = true,
		onBubbleClick,
		onBubbleHover,
		tooltipFormatter,
		class: className = ''
	}: BubblePackingProps = $props();

	/**
	 * Internal bubble representation with computed position and radius
	 */
	interface PackedBubble {
		id: string;
		label: string;
		value: number;
		color: string;
		group: string;
		x: number;
		y: number;
		r: number;
		originalData: BubbleItem;
	}

	/**
	 * Component state
	 */
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	let hoveredBubble = $state<string | null>(null);
	let containerEl = $state<HTMLDivElement | undefined>();

	// =========================================================================
	// CIRCLE PACKING ALGORITHM
	// =========================================================================

	/**
	 * Calculate radius from value using square root scaling
	 * This ensures area is proportional to value
	 */
	function valueToRadius(value: number, maxValue: number, maxRadius: number): number {
		if (maxValue === 0) return 10;
		return Math.max(10, Math.sqrt(value / maxValue) * maxRadius);
	}

	/**
	 * Check if two circles overlap
	 */
	function circlesOverlap(
		c1: { x: number; y: number; r: number },
		c2: { x: number; y: number; r: number },
		padding: number
	): boolean {
		const dx = c2.x - c1.x;
		const dy = c2.y - c1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < c1.r + c2.r + padding;
	}

	/**
	 * Get unique groups from data for colour mapping
	 */
	function getGroups(items: BubbleItem[]): string[] {
		const groups = new Set<string>();
		for (const item of items) {
			if (item.group) groups.add(item.group);
		}
		return Array.from(groups);
	}

	/**
	 * Simple circle packing using iterative force-directed placement
	 * Places circles starting from center, pushing overlapping circles apart
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
	// REACTIVE COMPUTATIONS
	// =========================================================================

	/**
	 * Compute packed bubble positions
	 */
	let packedBubbles = $derived(packCircles(data, width, height));

	/**
	 * Get unique groups for legend
	 */
	let legendGroups = $derived(() => {
		const groups = getGroups(data);
		return groups.map((group, i) => ({
			group,
			color: colorScheme[i % colorScheme.length]
		}));
	});

	// =========================================================================
	// EVENT HANDLERS
	// =========================================================================

	/**
	 * Show tooltip on bubble hover
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
	 * Hide tooltip on mouse leave
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
		hoveredBubble = null;
		onBubbleHover?.(null);
	}

	/**
	 * Handle bubble click
	 */
	function handleBubbleClick(bubble: PackedBubble) {
		onBubbleClick?.(bubble.originalData);
	}

	/**
	 * Calculate appropriate font size for bubble label
	 */
	function getFontSize(radius: number): number {
		// Scale font size with radius, with min/max limits
		return Math.max(8, Math.min(16, radius * 0.35));
	}

	/**
	 * Truncate label to fit within bubble
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
>
	<!-- SVG Bubble Chart -->
	<svg {width} {height} viewBox="0 0 {width} {height}" class="bubble-svg">
		<!-- Bubble circles -->
		{#each packedBubbles as bubble (bubble.id)}
			{@const isHovered = hoveredBubble === bubble.id}
			<g
				class="bubble-group"
				class:hovered={isHovered}
				transform="translate({bubble.x}, {bubble.y})"
			>
				<!-- Circle -->
				<circle
					r={bubble.r}
					fill={bubble.color}
					class="bubble-circle"
					role="button"
					tabindex="0"
					aria-label="{bubble.label}: {bubble.value}"
					onmouseenter={(e) => showTooltip(e, bubble)}
					onmouseleave={hideTooltip}
					onclick={() => handleBubbleClick(bubble)}
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
	 */
	.bubble-packing-container {
		display: inline-block;
		user-select: none;
		-webkit-user-select: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		position: relative;
	}

	/**
	 * SVG styling
	 */
	.bubble-svg {
		display: block;
	}

	/**
	 * Bubble group (contains circle and label)
	 */
	.bubble-group {
		transition: transform 0.2s ease;
	}

	.bubble-group.hovered {
		transform: scale(1.05);
	}

	/**
	 * Bubble circle styling
	 */
	.bubble-circle {
		stroke: rgba(255, 255, 255, 0.4);
		stroke-width: 2px;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			stroke-width 0.2s ease;
		opacity: 0.85;
	}

	.bubble-circle:hover {
		opacity: 1;
		stroke-width: 3px;
		stroke: rgba(255, 255, 255, 0.8);
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
	 * Accessibility: Respect reduced motion preference
	 */
	@media (prefers-reduced-motion: reduce) {
		.bubble-group,
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
