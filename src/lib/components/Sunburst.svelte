<!--
/**
 * Sunburst - Interactive hierarchical radial visualization
 *
 * Features:
 * - SVG-based zoomable sunburst chart
 * - Click on segments to zoom in and explore deeper levels
 * - Click on center to zoom out to parent level
 * - Smooth animated transitions between zoom states
 * - Tooltips showing node details on hover
 * - Optional text labels on segments (hidden for small arcs)
 * - Customisable colour scheme
 * - Zero external dependencies - fully portable
 * - Accessibility with ARIA labels and keyboard navigation
 *
 * Perfect for:
 * - File system visualizations
 * - Organisational hierarchies
 * - Budget/expense breakdowns
 * - Sales data by region/product
 * - Any hierarchical data with proportional values
 *
 * Technical Implementation:
 * - D3-style partition layout computed manually
 * - Arc generator using SVG path commands
 * - CSS transitions for smooth animations
 * - Svelte 5 runes for reactive state
 * - Pointer events for unified input handling
 *
 * @component
 * @example
 * ```svelte
 * <Sunburst
 *   data={hierarchicalData}
 *   width={500}
 *   height={500}
 *   onNodeClick={(node) => console.log('Clicked:', node.name)}
 * />
 * ```
 */
-->

<script lang="ts">
	import type { SunburstProps, SunburstNode, SunburstArcNode } from '$lib/types';
	import { SUNBURST_COLOR_SCHEME } from '$lib/constants';

	/**
	 * Component props with defaults
	 */
	let {
		data,
		width = 500,
		height = 500,
		colorScheme = SUNBURST_COLOR_SCHEME,
		showLabels = true,
		labelMinAngle = 10,
		animationDuration = 750,
		onNodeClick,
		tooltipFormatter,
		class: className = ''
	}: SunburstProps = $props();

	/**
	 * Component state
	 */
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	let containerEl = $state<HTMLDivElement | undefined>();

	// Current zoom focus node - null means showing from root
	let focusNode = $state<SunburstArcNode | null>(null);

	// ==========================================================================
	// CONSTANTS
	// ==========================================================================

	const TWO_PI = 2 * Math.PI;
	const LABEL_MIN_ANGLE_RAD = (labelMinAngle * Math.PI) / 180;

	// ==========================================================================
	// HIERARCHY COMPUTATION
	// ==========================================================================

	/**
	 * Calculate the total value of a node and its descendants
	 * Leaf nodes use their value property; parent nodes sum children
	 */
	function computeValue(node: SunburstNode): number {
		if (!node.children || node.children.length === 0) {
			return node.value ?? 1;
		}
		return node.children.reduce((sum, child) => sum + computeValue(child), 0);
	}

	/**
	 * Build the arc node tree with computed positions
	 * Uses a partition layout algorithm (similar to D3's partition)
	 *
	 * @param node - Source node
	 * @param depth - Current depth level
	 * @param x0 - Start angle (radians)
	 * @param x1 - End angle (radians)
	 * @param parent - Parent arc node
	 * @param colorIndex - Index for colour assignment
	 */
	function buildArcTree(
		node: SunburstNode,
		depth: number,
		x0: number,
		x1: number,
		parent: SunburstArcNode | null,
		colorIndex: number
	): SunburstArcNode {
		const totalValue = computeValue(node);

		// Inherit colour from parent or assign from scheme
		const color =
			node.color ?? (parent?.color ?? colorScheme[colorIndex % colorScheme.length]);

		const arcNode: SunburstArcNode = {
			...node,
			color,
			x0,
			x1,
			y0: depth,
			y1: depth + 1,
			depth,
			parent,
			children: undefined
		};

		if (node.children && node.children.length > 0) {
			let currentAngle = x0;
			const angleRange = x1 - x0;

			arcNode.children = node.children.map((child, i) => {
				const childValue = computeValue(child);
				const childAngle = (childValue / totalValue) * angleRange;
				const childNode = buildArcTree(
					child,
					depth + 1,
					currentAngle,
					currentAngle + childAngle,
					arcNode,
					depth === 0 ? i : colorIndex // Assign new colour only at first level
				);
				currentAngle += childAngle;
				return childNode;
			});
		}

		return arcNode;
	}

	/**
	 * Compute the arc tree from data
	 * Reactive to data changes
	 */
	let arcTree = $derived.by(() => {
		return buildArcTree(data, 0, 0, TWO_PI, null, 0);
	});

	/**
	 * Flatten the tree into an array of all nodes for rendering
	 */
	function flattenTree(node: SunburstArcNode): SunburstArcNode[] {
		const result: SunburstArcNode[] = [node];
		if (node.children) {
			for (const child of node.children) {
				result.push(...flattenTree(child));
			}
		}
		return result;
	}

	/**
	 * Get all nodes as flat array
	 */
	let allNodes = $derived.by(() => {
		return flattenTree(arcTree);
	});

	/**
	 * Calculate max depth for radius scaling
	 */
	let maxDepth = $derived.by(() => {
		return Math.max(...allNodes.map((n) => n.y1));
	});

	// ==========================================================================
	// ZOOM/FOCUS HANDLING
	// ==========================================================================

	/**
	 * Get the current focus node for zoom calculations
	 * Defaults to root if no focus is set
	 */
	let currentFocus = $derived.by(() => {
		return focusNode ?? arcTree;
	});

	/**
	 * Calculate visible nodes based on current focus
	 * Shows only 2 levels at a time (like D3 zoomable sunburst)
	 */
	let visibleNodes = $derived.by(() => {
		const focus = currentFocus;
		const focusDepth = focus.depth;

		return allNodes.filter((node) => {
			// Show nodes at focus level and 2 levels deeper
			const relativeDepth = node.depth - focusDepth;
			if (relativeDepth < 0 || relativeDepth > 2) return false;

			// Check if node is descendant of focus
			let ancestor: SunburstArcNode | null = node;
			while (ancestor) {
				if (ancestor.id === focus.id) return true;
				ancestor = ancestor.parent;
			}
			return false;
		});
	});

	// ==========================================================================
	// ARC PATH GENERATION
	// ==========================================================================

	/**
	 * Convert polar coordinates to cartesian
	 */
	function polarToCartesian(
		cx: number,
		cy: number,
		radius: number,
		angleRad: number
	): { x: number; y: number } {
		return {
			x: cx + radius * Math.sin(angleRad),
			y: cy - radius * Math.cos(angleRad)
		};
	}

	/**
	 * Generate SVG arc path for a node
	 * Transforms node coordinates based on current focus for zoom effect
	 *
	 * @param node - The arc node to render
	 * @param cx - Center X coordinate
	 * @param cy - Center Y coordinate
	 * @param maxRadius - Maximum radius of the chart
	 */
	function getArcPath(
		node: SunburstArcNode,
		cx: number,
		cy: number,
		maxRadius: number
	): string {
		const focus = currentFocus;

		// Transform angles relative to focus node
		const focusX0 = focus.x0;
		const focusXRange = focus.x1 - focus.x0;

		// Normalise angle to 0-2π range based on focus
		const x0 = ((node.x0 - focusX0) / focusXRange) * TWO_PI;
		const x1 = ((node.x1 - focusX0) / focusXRange) * TWO_PI;

		// Transform radius - focus node becomes inner ring
		const focusY0 = focus.y0;
		const focusYRange = maxDepth - focusY0;

		const y0Norm = (node.y0 - focusY0) / focusYRange;
		const y1Norm = (node.y1 - focusY0) / focusYRange;

		const innerRadius = y0Norm * maxRadius;
		const outerRadius = y1Norm * maxRadius;

		// Handle very small arcs
		if (x1 - x0 < 0.001) return '';
		if (outerRadius < 1) return '';

		// Calculate arc points
		const innerStart = polarToCartesian(cx, cy, innerRadius, x0);
		const innerEnd = polarToCartesian(cx, cy, innerRadius, x1);
		const outerStart = polarToCartesian(cx, cy, outerRadius, x0);
		const outerEnd = polarToCartesian(cx, cy, outerRadius, x1);

		// Determine if arc is more than 180 degrees
		const largeArcFlag = x1 - x0 > Math.PI ? 1 : 0;

		// Build SVG path
		// Move to outer start, arc to outer end, line to inner end, arc to inner start, close
		const path = [
			`M ${outerStart.x} ${outerStart.y}`,
			`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
			'Z'
		].join(' ');

		return path;
	}

	/**
	 * Get label position and visibility for a node
	 */
	function getLabelInfo(
		node: SunburstArcNode,
		cx: number,
		cy: number,
		maxRadius: number
	): { x: number; y: number; angle: number; visible: boolean } {
		const focus = currentFocus;

		// Transform angles relative to focus
		const focusX0 = focus.x0;
		const focusXRange = focus.x1 - focus.x0;

		const x0 = ((node.x0 - focusX0) / focusXRange) * TWO_PI;
		const x1 = ((node.x1 - focusX0) / focusXRange) * TWO_PI;

		// Transform radius
		const focusY0 = focus.y0;
		const focusYRange = maxDepth - focusY0;

		const y0Norm = (node.y0 - focusY0) / focusYRange;
		const y1Norm = (node.y1 - focusY0) / focusYRange;

		const midAngle = (x0 + x1) / 2;
		const midRadius = ((y0Norm + y1Norm) / 2) * maxRadius;

		const pos = polarToCartesian(cx, cy, midRadius, midAngle);

		// Determine visibility based on arc size
		const angleSize = x1 - x0;
		const visible = angleSize > LABEL_MIN_ANGLE_RAD && midRadius > 20;

		// Rotate text to follow arc (convert to degrees)
		let angle = (midAngle * 180) / Math.PI;
		// Flip text if on left side to keep it readable
		if (angle > 90 && angle < 270) {
			angle += 180;
		}

		return { x: pos.x, y: pos.y, angle, visible };
	}

	// ==========================================================================
	// EVENT HANDLERS
	// ==========================================================================

	/**
	 * Handle click on a segment
	 * - If clicking on focus node or its direct parent, zoom out
	 * - If clicking on a node with children, zoom in
	 * - Fire callback for any click
	 */
	function handleClick(node: SunburstArcNode) {
		// Fire callback
		onNodeClick?.(node);

		// Don't zoom into leaf nodes
		if (!node.children || node.children.length === 0) return;

		// If clicking on current focus, zoom out to parent
		if (focusNode && node.id === focusNode.id && node.parent) {
			focusNode = node.parent.parent ? node.parent : null;
			return;
		}

		// Zoom into this node
		focusNode = node;
	}

	/**
	 * Handle click on center circle (zoom out)
	 */
	function handleCenterClick() {
		if (focusNode) {
			focusNode = focusNode.parent;
		}
	}

	/**
	 * Show tooltip on hover
	 */
	function showTooltipHandler(event: MouseEvent, node: SunburstArcNode) {
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const tooltipX = event.clientX - rect.left;
		const tooltipY = event.clientY - rect.top;

		const value = computeValue(node);
		const text = tooltipFormatter
			? tooltipFormatter(node)
			: `${node.name}: ${value.toLocaleString()}`;

		tooltip = {
			visible: true,
			x: tooltipX,
			y: tooltipY - 10,
			text
		};
	}

	/**
	 * Hide tooltip
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeyDown(event: KeyboardEvent, node: SunburstArcNode) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick(node);
		} else if (event.key === 'Escape' && focusNode) {
			event.preventDefault();
			handleCenterClick();
		}
	}

	// ==========================================================================
	// DERIVED DIMENSIONS
	// ==========================================================================

	let cx = $derived(width / 2);
	let cy = $derived(height / 2);
	let maxRadius = $derived(Math.min(width, height) / 2 - 10);

	/**
	 * Current path label for breadcrumb display
	 */
	let pathLabel = $derived.by(() => {
		if (!focusNode) return data.name;

		const path: string[] = [];
		let current: SunburstArcNode | null = focusNode;
		while (current) {
			path.unshift(current.name);
			current = current.parent;
		}
		return path.join(' / ');
	});
</script>

<div
	bind:this={containerEl}
	class="sunburst-container {className}"
	role="region"
	aria-label="Sunburst chart: {data.name}"
>
	<!-- Breadcrumb path -->
	<div class="breadcrumb" aria-live="polite">
		{pathLabel}
		{#if focusNode}
			<button class="zoom-out-btn" onclick={handleCenterClick} aria-label="Zoom out to parent">
				← Back
			</button>
		{/if}
	</div>

	<!-- SVG Chart -->
	<svg {width} {height} viewBox="0 0 {width} {height}" class="sunburst-svg">
		<!-- Arcs -->
		<g class="arcs">
			{#each visibleNodes as node (node.id)}
				{@const path = getArcPath(node, cx, cy, maxRadius)}
				{@const labelInfo = getLabelInfo(node, cx, cy, maxRadius)}
				{@const hasChildren = node.children && node.children.length > 0}

				{#if path}
					<path
						d={path}
						fill={node.color}
						class="arc"
						class:clickable={hasChildren}
						style="--animation-duration: {animationDuration}ms"
						role="button"
						tabindex={hasChildren ? 0 : -1}
						aria-label="{node.name}: {computeValue(node).toLocaleString()}"
						onclick={() => handleClick(node)}
						onmouseenter={(e) => showTooltipHandler(e, node)}
						onmouseleave={hideTooltip}
						onkeydown={(e) => handleKeyDown(e, node)}
					/>
				{/if}
			{/each}
		</g>

		<!-- Labels -->
		{#if showLabels}
			<g class="labels" aria-hidden="true">
				{#each visibleNodes as node (node.id)}
					{@const labelInfo = getLabelInfo(node, cx, cy, maxRadius)}

					{#if labelInfo.visible}
						<text
							x={labelInfo.x}
							y={labelInfo.y}
							transform="rotate({labelInfo.angle}, {labelInfo.x}, {labelInfo.y})"
							class="label"
							style="--animation-duration: {animationDuration}ms"
						>
							{node.name}
						</text>
					{/if}
				{/each}
			</g>
		{/if}

		<!-- Center circle (click to zoom out) -->
		{#if focusNode}
			<circle
				{cx}
				{cy}
				r={maxRadius * 0.15}
				class="center-circle"
				role="button"
				tabindex="0"
				aria-label="Click to zoom out"
				onclick={handleCenterClick}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleCenterClick();
					}
				}}
			/>
			<text x={cx} y={cy} class="center-text" aria-hidden="true">
				↑
			</text>
		{/if}
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
</div>

<style>
	/**
	 * Container styling
	 */
	.sunburst-container {
		display: inline-block;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		user-select: none;
		-webkit-user-select: none;
	}

	/**
	 * Breadcrumb path display
	 */
	.breadcrumb {
		font-size: 14px;
		color: #374151;
		padding: 8px 12px;
		background: #f3f4f6;
		border-radius: 6px;
		margin-bottom: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.zoom-out-btn {
		background: #e5e7eb;
		border: none;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 13px;
		cursor: pointer;
		color: #374151;
		transition: background-color 0.15s ease;
	}

	.zoom-out-btn:hover {
		background: #d1d5db;
	}

	/**
	 * SVG container
	 */
	.sunburst-svg {
		display: block;
	}

	/**
	 * Arc segments
	 */
	.arc {
		stroke: #fff;
		stroke-width: 1px;
		transition:
			d var(--animation-duration, 750ms) ease-out,
			opacity 0.2s ease;
		opacity: 0.9;
	}

	.arc:hover {
		opacity: 1;
	}

	.arc.clickable {
		cursor: pointer;
	}

	.arc.clickable:focus {
		outline: none;
	}

	.arc.clickable:focus-visible {
		stroke: #1d4ed8;
		stroke-width: 3px;
	}

	/**
	 * Text labels on segments
	 */
	.label {
		font-size: 11px;
		fill: #fff;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition:
			x var(--animation-duration, 750ms) ease-out,
			y var(--animation-duration, 750ms) ease-out,
			opacity 0.2s ease;
	}

	/**
	 * Center circle for zooming out
	 */
	.center-circle {
		fill: #f9fafb;
		stroke: #d1d5db;
		stroke-width: 2px;
		cursor: pointer;
		transition: fill 0.2s ease;
	}

	.center-circle:hover {
		fill: #e5e7eb;
	}

	.center-circle:focus {
		outline: none;
	}

	.center-circle:focus-visible {
		stroke: #1d4ed8;
		stroke-width: 3px;
	}

	.center-text {
		font-size: 18px;
		fill: #6b7280;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}

	/**
	 * Tooltip styling
	 */
	.tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 13px;
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
	 * Accessibility: Respect reduced motion preference
	 */
	@media (prefers-reduced-motion: reduce) {
		.arc,
		.label {
			transition: opacity 0.2s ease;
		}

		.center-circle,
		.zoom-out-btn {
			transition: none;
		}
	}

	/**
	 * Dark mode support
	 */
	@media (prefers-color-scheme: dark) {
		.breadcrumb {
			background: #374151;
			color: #f3f4f6;
		}

		.zoom-out-btn {
			background: #4b5563;
			color: #f3f4f6;
		}

		.zoom-out-btn:hover {
			background: #6b7280;
		}

		.center-circle {
			fill: #1f2937;
			stroke: #4b5563;
		}

		.center-circle:hover {
			fill: #374151;
		}

		.center-text {
			fill: #9ca3af;
		}
	}
</style>
