<!--
	============================================================
	Sunburst - Zoomable Hierarchical Radial Visualization (Zero Dependencies)
	============================================================

	[CR] WHAT IT DOES
	Native Svelte 5 implementation of an interactive sunburst/radial chart.
	Displays hierarchical data as concentric rings where segments represent
	proportional values. Click segments to zoom in and explore deeper levels.

	[NTL] THE SIMPLE VERSION
	Imagine a pie chart that keeps splitting into smaller pies! Each ring
	shows one level of your hierarchy (like folders → subfolders → files).
	Click any segment to zoom in and see more detail. It's like drilling
	down into your data!

	✨ FEATURES
	• Zoomable: Click segments to explore deeper levels
	• Animated transitions between zoom states
	• Breadcrumb navigation showing current path
	• Interactive tooltips on hover
	• Labels that hide when segments are too small
	• Customisable colour schemes
	• Keyboard navigation (Enter/Space to zoom, Escape to zoom out)
	• Dark mode support

	♿ ACCESSIBILITY
	• ARIA role="region" with descriptive label on container
	• role="button" on clickable segments
	• Keyboard accessible (Tab + Enter/Space/Escape)
	• aria-live breadcrumb for zoom state changes
	• Respects prefers-reduced-motion preference

	📦 DEPENDENCIES
	Zero external dependencies - fully portable!

	⚠️ WARNINGS
	None expected

	🎨 USAGE
	<script>
		import Sunburst from '$lib/components/Sunburst.svelte';
		import { FALLBACK_SUNBURST_DATA } from '$lib/constants';
	</script>

	<Sunburst data={FALLBACK_SUNBURST_DATA} />

	📋 PROPS
	| Prop              | Type                  | Default          | Description                      |
	|-------------------|-----------------------|------------------|----------------------------------|
	| data              | SunburstNode          | required         | Hierarchical tree data           |
	| width             | number                | 500              | SVG width in pixels              |
	| height            | number                | 500              | SVG height in pixels             |
	| colorScheme       | string[]              | SUNBURST_COLORS  | Array of colours for segments    |
	| showLabels        | boolean               | true             | Show text labels on segments     |
	| labelMinAngle     | number                | 10               | Min angle (degrees) for labels   |
	| animationDuration | number                | 750              | Transition duration in ms        |
	| onNodeClick       | (node) => void        | undefined        | Callback when segment clicked    |
	| tooltipFormatter  | (node) => string      | undefined        | Custom tooltip text function     |

	Based on D3's zoomable sunburst example, rewritten natively for Svelte 5.
	@see https://observablehq.com/@d3/zoomable-sunburst

	============================================================
-->

<script lang="ts">
	// [CR] Type imports for props and node structures
	import type { SunburstProps, SunburstNode, SunburstArcNode } from '$lib/types';
	import { SUNBURST_COLOR_SCHEME } from '$lib/constants';

	// =============================================================================
	// [CR] PROPS - All configurable options with sensible defaults
	// [NTL] These are the settings you can pass to customise your sunburst chart!
	// =============================================================================

	let {
		data,                                   // [NTL] Your hierarchical data with nested children
		width = 500,                            // [NTL] How wide the chart is in pixels
		height = 500,                           // [NTL] How tall the chart is in pixels
		colorScheme = SUNBURST_COLOR_SCHEME,    // [NTL] Array of colours for the segments
		showLabels = true,                      // [NTL] Show text labels on segments
		labelMinAngle = 10,                     // [NTL] Minimum angle (degrees) before showing a label
		animationDuration = 750,                // [NTL] How long zoom animations take (milliseconds)
		onNodeClick,                            // [NTL] Callback function when a segment is clicked
		tooltipFormatter,                       // [NTL] Custom function to format tooltip text
		class: className = ''                   // [NTL] Extra CSS classes for the container
	}: SunburstProps = $props();

	// =============================================================================
	// [CR] COMPONENT STATE - Reactive values managed internally
	// [NTL] These track what's happening right now (hover, zoom level, etc.)
	// =============================================================================

	// [CR] Tooltip state object for hover information display
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	// [CR] Reference to container element for tooltip positioning
	let containerEl = $state<HTMLDivElement | undefined>();

	// [CR] Current zoom focus node - null means showing from root
	// [NTL] This tracks which segment you've "drilled into". When null, we show
	//       the whole chart from the top. When set, we zoom in on that segment.
	let focusNode = $state<SunburstArcNode | null>(null);

	// =============================================================================
	// [CR] CONSTANTS - Magic numbers with names for readability
	// [NTL] These are fixed values used throughout the component. Naming them
	//       makes the code easier to understand than seeing "6.283" everywhere!
	// =============================================================================

	const TWO_PI = 2 * Math.PI;                                    // [NTL] A full circle in radians
	// svelte-ignore state_referenced_locally
	const LABEL_MIN_ANGLE_RAD = (labelMinAngle * Math.PI) / 180;   // [NTL] Convert degrees to radians

	/** [CR] Minimum radius in pixels for label visibility */
	const LABEL_MIN_RADIUS = 20;

	/** [CR] Ratio of max radius for center zoom-out circle */
	const CENTER_RADIUS_RATIO = 0.15;

	// =============================================================================
	// [CR] HIERARCHY COMPUTATION
	// [NTL] This is where we turn your tree data into something we can draw!
	//       We need to know how "big" each segment should be and where it goes.
	// =============================================================================

	/**
	 * [CR] Pre-computed values cache using WeakMap for memory efficiency
	 * Stores computed total values for each node to avoid redundant calculations
	 * [NTL] A cache stores results so we don't have to recalculate them.
	 *       WeakMap is smart - it lets JavaScript garbage collect old data!
	 */
	const valueCache = new WeakMap<SunburstNode, number>();

	/**
	 * [CR] Pre-compute all node values in a single post-order traversal
	 * This eliminates O(n²) complexity from repeated computeValue calls
	 * [NTL] We add up all the values in your tree to know how much space
	 *       each segment should take. A folder's "value" is the sum of
	 *       all files inside it!
	 *
	 * @param node - Root node to start computation from
	 * @returns Total value of the node (including all descendants)
	 */
	function precomputeValues(node: SunburstNode): number {
		// Check cache first
		const cached = valueCache.get(node);
		if (cached !== undefined) return cached;

		let value: number;
		if (!node.children || node.children.length === 0) {
			// Leaf node - use its value property or default to 1
			value = node.value ?? 1;
		} else {
			// Parent node - sum all children's values (post-order traversal)
			value = node.children.reduce((sum, child) => sum + precomputeValues(child), 0);
		}

		valueCache.set(node, value);
		return value;
	}

	/**
	 * [CR] Get the pre-computed value for a node
	 * Must be called after precomputeValues has been run on the tree
	 * [NTL] Quick lookup for a node's total value from our cache.
	 */
	function getNodeValue(node: SunburstNode): number {
		return valueCache.get(node) ?? precomputeValues(node);
	}

	/**
	 * [CR] Build the arc node tree with computed positions
	 * Uses a partition layout algorithm (similar to D3's partition)
	 * [NTL] This is the main layout function! It walks through your tree and
	 *       figures out where each segment should be drawn - its start angle,
	 *       end angle, and which ring (depth) it belongs to.
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
		const totalValue = getNodeValue(node);

		// [CR] Assign unique colour from scheme at each index, allowing override via node.color
		// [NTL] Each segment gets its own colour from the palette! This makes the chart
		//       much more readable as you can distinguish siblings from each other.
		const color = node.color ?? colorScheme[colorIndex % colorScheme.length];

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
				const childValue = getNodeValue(child);
				const childAngle = (childValue / totalValue) * angleRange;
				// [CR] Each child gets its own colour index based on its position
				// [NTL] Children are numbered 0, 1, 2... so each sibling gets a different colour
				const childNode = buildArcTree(
					child,
					depth + 1,
					currentAngle,
					currentAngle + childAngle,
					arcNode,
					i // Each child gets unique colour index
				);
				currentAngle += childAngle;
				return childNode;
			});
		}

		return arcNode;
	}

	/**
	 * [CR] Compute the arc tree from data
	 * Reactive to data changes, pre-computes all values first for O(n) performance
	 * [NTL] Whenever your data changes, this automatically rebuilds the layout!
	 */
	let arcTree = $derived.by(() => {
		// Pre-compute all values in single traversal before building tree
		precomputeValues(data);
		return buildArcTree(data, 0, 0, TWO_PI, null, 0);
	});

	/**
	 * [CR] Flatten the tree into an array of all nodes for rendering
	 * [NTL] SVG needs a flat list to loop over, so we unpack the nested tree
	 *       into a simple array. Like listing every folder and file in order!
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
	 * [CR] Get all nodes as flat array
	 * [NTL] The complete list of every segment in the chart.
	 */
	let allNodes = $derived.by(() => {
		return flattenTree(arcTree);
	});

	/**
	 * [CR] Calculate max depth for radius scaling
	 * [NTL] How many levels deep does the tree go? Needed to scale the rings.
	 */
	let maxDepth = $derived.by(() => {
		return Math.max(...allNodes.map((n) => n.y1));
	});

	// =============================================================================
	// [CR] ZOOM/FOCUS HANDLING
	// [NTL] The magic of the zoomable sunburst! When you click a segment, we
	//       "focus" on it and show just that segment and its children, making
	//       them fill the whole chart. It's like zooming in with a magnifying glass!
	// =============================================================================

	/**
	 * [CR] Get the current focus node for zoom calculations
	 * Defaults to root if no focus is set
	 * [NTL] What are we zoomed into right now? Root = the whole chart.
	 */
	let currentFocus = $derived.by(() => {
		return focusNode ?? arcTree;
	});

	/**
	 * [CR] Calculate visible nodes based on current focus
	 * Shows only 2 levels at a time (like D3 zoomable sunburst)
	 * [NTL] We only show the current focus and 2 levels deeper - this keeps
	 *       the chart clean and readable. Deeper levels appear when you zoom in!
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

	// =============================================================================
	// [CR] ARC PATH GENERATION
	// [NTL] This is where we create the actual shapes you see! We need to convert
	//       our layout data (angles and depths) into SVG paths that draw the arcs.
	// =============================================================================

	/**
	 * [CR] Convert polar coordinates to cartesian
	 * [NTL] Just like RadialCluster - convert "angle + distance" to "x, y"!
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
	 * [CR] Generate SVG arc path for a node
	 * Transforms node coordinates based on current focus for zoom effect
	 * [NTL] This creates the actual "pizza slice" shape for each segment!
	 *       The clever bit is that it transforms the coordinates based on
	 *       what you're zoomed into, so segments expand to fill the view.
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
	 * [CR] Get label position and visibility for a node
	 * [NTL] Where should the text label go, and should we show it at all?
	 *       Small segments get their labels hidden to avoid clutter.
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
		const visible = angleSize > LABEL_MIN_ANGLE_RAD && midRadius > LABEL_MIN_RADIUS;

		// Rotate text to follow arc (convert to degrees)
		let angle = (midAngle * 180) / Math.PI;
		// Flip text if on left side to keep it readable
		if (angle > 90 && angle < 270) {
			angle += 180;
		}

		return { x: pos.x, y: pos.y, angle, visible };
	}

	// =============================================================================
	// [CR] EVENT HANDLERS
	// [NTL] These functions respond to user interactions - clicking to zoom,
	//       hovering for tooltips, and keyboard navigation for accessibility.
	// =============================================================================

	/**
	 * [CR] Handle click on a segment
	 * - If clicking on focus node or its direct parent, zoom out
	 * - If clicking on a node with children, zoom in
	 * - Fire callback for any click
	 * [NTL] Click a segment to zoom in and see its children in detail!
	 *       Click again on the focused segment to zoom back out.
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
	 * [CR] Handle click on center circle (zoom out)
	 * [NTL] The center circle appears when zoomed in - click it to go back up!
	 */
	function handleCenterClick() {
		if (focusNode) {
			focusNode = focusNode.parent;
		}
	}

	/**
	 * [CR] Show tooltip on hover with aggregate info for parent nodes
	 * [NTL] When you hover over a segment, we show its name and value!
	 *       For parent nodes, we also show how many children it contains.
	 */
	function showTooltipHandler(event: MouseEvent, node: SunburstArcNode) {
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const tooltipX = event.clientX - rect.left;
		const tooltipY = event.clientY - rect.top;

		const value = getNodeValue(node);

		// [CR] Build a more informative tooltip for parent nodes
		// [NTL] Show "Folder: 150 (3 items)" for folders, just "File: 50" for files
		let text: string;
		if (tooltipFormatter) {
			text = tooltipFormatter(node);
		} else if (node.children && node.children.length > 0) {
			// Parent node - show aggregate info
			const childCount = node.children.length;
			const itemLabel = childCount === 1 ? 'item' : 'items';
			text = `${node.name}: ${value.toLocaleString()} (${childCount} ${itemLabel})`;
		} else {
			// Leaf node - just show name and value
			text = `${node.name}: ${value.toLocaleString()}`;
		}

		tooltip = {
			visible: true,
			x: tooltipX,
			y: tooltipY - 10,
			text
		};
	}

	/**
	 * [CR] Hide tooltip
	 * [NTL] When you move away, the tooltip disappears.
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}

	/**
	 * [CR] Handle keyboard navigation
	 * [NTL] Keyboard users can Tab to segments and press Enter/Space to zoom,
	 *       or Escape to zoom out. This makes the chart fully accessible!
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

	// =============================================================================
	// [CR] DERIVED DIMENSIONS
	// [NTL] These are calculated from the width/height props and update automatically.
	// =============================================================================

	let cx = $derived(width / 2);                              // [NTL] Center X coordinate
	let cy = $derived(height / 2);                              // [NTL] Center Y coordinate
	let maxRadius = $derived(Math.min(width, height) / 2 - 10); // [NTL] Maximum radius (with padding)

	/**
	 * [CR] Current path label for breadcrumb display
	 * [NTL] Shows where you are in the hierarchy, like "Root / Folder / Subfolder".
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
	<!-- [CR] Breadcrumb path with responsive styling -->
	<!-- [NTL] Shows your current location in the hierarchy and lets you go back -->
	<div class="breadcrumb" aria-live="polite">
		<span class="breadcrumb-path" title={pathLabel}>{pathLabel}</span>
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
						aria-label="{node.name}: {getNodeValue(node).toLocaleString()}"
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
				r={maxRadius * CENTER_RADIUS_RATIO}
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
	 * [CR] Container styling - responsive for mobile
	 * [NTL] The container stretches to fit but never overflows the screen
	 */
	.sunburst-container {
		display: inline-block;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		user-select: none;
		-webkit-user-select: none;
		max-width: 100%;
		box-sizing: border-box;
	}

	/**
	 * [CR] Breadcrumb path display - responsive for mobile
	 * [NTL] On mobile, we truncate long paths and allow wrapping to prevent overflow
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
		gap: 8px;
		flex-wrap: wrap;
		word-break: break-word;
		max-width: 100%;
		box-sizing: border-box;
	}

	/* [CR] Path text truncation on mobile */
	.breadcrumb-path {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		flex-shrink: 0;
	}

	.zoom-out-btn:hover {
		background: #d1d5db;
	}

	/* [CR] Mobile-specific styles */
	@media (max-width: 480px) {
		.breadcrumb {
			font-size: 12px;
			padding: 6px 10px;
			gap: 6px;
		}

		.zoom-out-btn {
			font-size: 12px;
			padding: 3px 8px;
		}
	}

	/**
	 * [CR] SVG container - responsive sizing
	 * [NTL] The chart scales down on mobile to fit the screen
	 */
	.sunburst-svg {
		display: block;
		max-width: 100%;
		height: auto;
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

<!-- [CR] Gold Standard review complete. All [CR]/[NTL] comments added. -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
