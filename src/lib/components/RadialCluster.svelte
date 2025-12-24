<!--
  RadialCluster Component
  =======================

  A native Svelte 5 implementation of a radial cluster (dendrogram) visualization.
  Displays hierarchical data in a circular layout where leaf nodes are positioned
  at equal depth from the center, connected by curved radial links.

  Features:
  - Zero external dependencies (no D3 required)
  - Native cluster layout algorithm
  - Curved radial links using cubic Bézier paths
  - Rotated text labels for readability
  - Interactive hover effects with tooltips
  - Fully customisable colours, sizes, and styling
  - Responsive container support
  - Accessibility: ARIA labels and keyboard navigation

  Usage:
  ```svelte
  <script>
    import RadialCluster from '$lib/components/RadialCluster.svelte';
    import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
  </script>

  <RadialCluster data={FALLBACK_RADIAL_CLUSTER_DATA} />
  ```

  Based on D3's radial cluster example, rewritten natively for Svelte 5.
  @see https://observablehq.com/@d3/radial-cluster/2
-->
<script lang="ts">
	import type { RadialClusterNode, RadialClusterLayoutNode, RadialClusterProps } from '$lib/types';

	// =============================================================================
	// PROPS
	// =============================================================================

	let {
		data,
		width = 800,
		height = 800,
		innerRadius = 100,
		outerRadius,
		nodeRadius = 2.5,
		nodeColorParent = '#555',
		nodeColorLeaf = '#999',
		linkColor = '#555',
		linkOpacity = 0.4,
		linkWidth = 1.5,
		fontSize = 11,
		fontFamily = 'system-ui, sans-serif',
		labelColor = '#333',
		showLabels = true,
		rotateLabels = true,
		separation = 1,
		class: className = ''
	}: RadialClusterProps = $props();

	// =============================================================================
	// STATE
	// =============================================================================

	/** Currently hovered node for tooltip display */
	let hoveredNode = $state<RadialClusterLayoutNode | null>(null);

	/** Mouse position for tooltip positioning */
	let mousePos = $state({ x: 0, y: 0 });

	// =============================================================================
	// DERIVED VALUES
	// =============================================================================

	/** Calculate effective outer radius based on container size */
	const effectiveOuterRadius = $derived(outerRadius ?? Math.min(width, height) / 2 - 120);

	/** Center point of the visualization */
	const center = $derived({ x: width / 2, y: height / 2 });

	// =============================================================================
	// LAYOUT ALGORITHM
	// =============================================================================

	/**
	 * Count total number of leaf nodes in the tree
	 * Used to distribute leaf nodes evenly around the circle
	 */
	function countLeaves(node: RadialClusterNode): number {
		if (!node.children || node.children.length === 0) {
			return 1;
		}
		return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
	}

	/**
	 * Calculate maximum depth of the tree
	 * Used to determine radius scaling
	 */
	function getMaxDepth(node: RadialClusterNode, currentDepth = 0): number {
		if (!node.children || node.children.length === 0) {
			return currentDepth;
		}
		return Math.max(...node.children.map((child) => getMaxDepth(child, currentDepth + 1)));
	}

	/**
	 * Build the cluster layout from hierarchical data
	 *
	 * Algorithm:
	 * 1. First pass: count leaves and calculate angle span for each subtree
	 * 2. Second pass: assign angles to each node (leaves get exact positions,
	 *    internal nodes get the mean angle of their descendants)
	 * 3. Assign radius based on depth (all leaves at same depth for cluster layout)
	 */
	function buildLayout(
		node: RadialClusterNode,
		parent: RadialClusterLayoutNode | null = null,
		depth = 0,
		angleStart = 0,
		angleEnd = 2 * Math.PI,
		maxDepth = 0
	): RadialClusterLayoutNode {
		const isLeaf = !node.children || node.children.length === 0;
		const totalLeaves = countLeaves(node);

		// For cluster layout, all leaves are at the same radius (outerRadius)
		// Internal nodes are positioned proportionally by depth
		const radius = isLeaf
			? effectiveOuterRadius
			: innerRadius + (effectiveOuterRadius - innerRadius) * (depth / maxDepth);

		// Calculate angle - for leaves, use the center of their allocated space
		// For internal nodes, will be recalculated as mean of children
		let angle = (angleStart + angleEnd) / 2;

		const layoutNode: RadialClusterLayoutNode = {
			name: node.name,
			x: angle,
			y: radius,
			depth,
			parent,
			children: [],
			isLeaf
		};

		if (node.children && node.children.length > 0) {
			// Distribute angle space among children based on their leaf counts
			const angleSpan = angleEnd - angleStart;
			let currentAngle = angleStart;

			layoutNode.children = node.children.map((child) => {
				const childLeaves = countLeaves(child);
				const childAngleSpan = (childLeaves / totalLeaves) * angleSpan * separation;
				const childAngleStart = currentAngle;
				const childAngleEnd = currentAngle + childAngleSpan;
				currentAngle = childAngleEnd;

				return buildLayout(
					child,
					layoutNode,
					depth + 1,
					childAngleStart,
					childAngleEnd,
					maxDepth
				);
			});

			// Internal node angle is the mean of its children's angles
			const childAngles = layoutNode.children.map((c) => c.x);
			layoutNode.x = childAngles.reduce((a, b) => a + b, 0) / childAngles.length;
		}

		return layoutNode;
	}

	/**
	 * Flatten the tree into an array of nodes for rendering
	 */
	function flattenNodes(node: RadialClusterLayoutNode): RadialClusterLayoutNode[] {
		const nodes: RadialClusterLayoutNode[] = [node];
		for (const child of node.children) {
			nodes.push(...flattenNodes(child));
		}
		return nodes;
	}

	/**
	 * Get all links (parent-child connections) from the tree
	 */
	function getLinks(
		node: RadialClusterLayoutNode
	): Array<{ source: RadialClusterLayoutNode; target: RadialClusterLayoutNode }> {
		const links: Array<{ source: RadialClusterLayoutNode; target: RadialClusterLayoutNode }> = [];
		for (const child of node.children) {
			links.push({ source: node, target: child });
			links.push(...getLinks(child));
		}
		return links;
	}

	// Build the layout from input data
	const maxTreeDepth = $derived(getMaxDepth(data));
	const rootNode = $derived(buildLayout(data, null, 0, 0, 2 * Math.PI, maxTreeDepth));
	const allNodes = $derived(flattenNodes(rootNode));
	const allLinks = $derived(getLinks(rootNode));

	// =============================================================================
	// COORDINATE TRANSFORMATIONS
	// =============================================================================

	/**
	 * Convert polar coordinates (angle, radius) to Cartesian (x, y)
	 * Angle is in radians, measured from 12 o'clock position going clockwise
	 */
	function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
		// Rotate -90° so angle 0 is at top (12 o'clock position)
		const adjustedAngle = angle - Math.PI / 2;
		return {
			x: center.x + radius * Math.cos(adjustedAngle),
			y: center.y + radius * Math.sin(adjustedAngle)
		};
	}

	/**
	 * Generate SVG path for a radial link between parent and child nodes
	 * Uses cubic Bézier curves that follow the radial direction
	 */
	function radialLinkPath(
		source: RadialClusterLayoutNode,
		target: RadialClusterLayoutNode
	): string {
		// Get source and target positions
		const sourcePos = polarToCartesian(source.x, source.y);
		const targetPos = polarToCartesian(target.x, target.y);

		// For radial links, control points are at the same angle as the source
		// but at the target's radius (creates a nice curved connection)
		const midRadius = (source.y + target.y) / 2;
		const control1 = polarToCartesian(source.x, midRadius);
		const control2 = polarToCartesian(target.x, midRadius);

		return `M${sourcePos.x},${sourcePos.y}C${control1.x},${control1.y} ${control2.x},${control2.y} ${targetPos.x},${targetPos.y}`;
	}

	/**
	 * Calculate text anchor based on node angle
	 * Text on the right side (0 to π) anchors at start
	 * Text on the left side (π to 2π) anchors at end
	 */
	function getTextAnchor(angle: number): 'start' | 'end' {
		const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		return normalizedAngle < Math.PI ? 'start' : 'end';
	}

	/**
	 * Calculate text rotation for radial labels
	 * Ensures text is always readable (not upside down)
	 */
	function getTextRotation(angle: number): number {
		// Convert radians to degrees
		let degrees = (angle * 180) / Math.PI;
		// Adjust so 0° is at top
		degrees -= 90;
		// Flip text on left side so it's readable
		if (degrees > 90 || degrees < -90) {
			degrees += 180;
		}
		return degrees;
	}

	/**
	 * Calculate text transform for a node
	 * Includes both translation to position and rotation for readability
	 */
	function getTextTransform(node: RadialClusterLayoutNode): string {
		const pos = polarToCartesian(node.x, node.y);

		if (!rotateLabels) {
			return `translate(${pos.x}, ${pos.y})`;
		}

		const rotation = getTextRotation(node.x);
		return `translate(${pos.x}, ${pos.y}) rotate(${rotation})`;
	}

	/**
	 * Get label offset based on whether node is on left or right side
	 * Provides spacing between node circle and text
	 */
	function getLabelOffset(node: RadialClusterLayoutNode): number {
		const normalizedAngle = ((node.x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		return normalizedAngle < Math.PI ? 6 : -6;
	}

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================

	/**
	 * Handle mouse entering a node - show tooltip
	 */
	function handleNodeMouseEnter(node: RadialClusterLayoutNode, event: MouseEvent): void {
		hoveredNode = node;
		mousePos = { x: event.clientX, y: event.clientY };
	}

	/**
	 * Handle mouse leaving a node - hide tooltip
	 */
	function handleNodeMouseLeave(): void {
		hoveredNode = null;
	}

	/**
	 * Handle mouse move - update tooltip position
	 */
	function handleNodeMouseMove(event: MouseEvent): void {
		mousePos = { x: event.clientX, y: event.clientY };
	}
</script>

<div class="radial-cluster-container {className}" role="img" aria-label="Radial cluster diagram showing hierarchical data">
	<svg
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		class="radial-cluster-svg"
		style="max-width: 100%; height: auto;"
	>
		<!-- Links layer - rendered first so nodes appear on top -->
		<g class="links" fill="none" stroke={linkColor} stroke-opacity={linkOpacity} stroke-width={linkWidth}>
			{#each allLinks as link}
				<path
					d={radialLinkPath(link.source, link.target)}
					class="link"
				/>
			{/each}
		</g>

		<!-- Nodes layer -->
		<g class="nodes">
			{#each allNodes as node}
				{@const pos = polarToCartesian(node.x, node.y)}
				<g
					class="node"
					transform="translate({pos.x}, {pos.y})"
					role="button"
					tabindex="0"
					aria-label="{node.name}{node.isLeaf ? ' (leaf)' : ''}"
					onmouseenter={(e) => handleNodeMouseEnter(node, e)}
					onmouseleave={handleNodeMouseLeave}
					onmousemove={handleNodeMouseMove}
					onfocus={(e) => handleNodeMouseEnter(node, e as unknown as MouseEvent)}
					onblur={handleNodeMouseLeave}
				>
					<circle
						r={nodeRadius}
						fill={node.isLeaf ? nodeColorLeaf : nodeColorParent}
						class="node-circle"
					/>
				</g>
			{/each}
		</g>

		<!-- Labels layer - rendered last so they appear on top -->
		{#if showLabels}
			<g
				class="labels"
				font-family={fontFamily}
				font-size={fontSize}
				fill={labelColor}
			>
				{#each allNodes as node}
					{@const anchor = getTextAnchor(node.x)}
					{@const offset = getLabelOffset(node)}
					<text
						transform={getTextTransform(node)}
						text-anchor={anchor}
						dy="0.31em"
						dx={offset}
						class="label"
						class:label-leaf={node.isLeaf}
					>
						<!-- White stroke background for contrast -->
						<tspan stroke="white" stroke-width="3" paint-order="stroke">{node.name}</tspan>
					</text>
				{/each}
			</g>
		{/if}
	</svg>

	<!-- Tooltip -->
	{#if hoveredNode}
		<div
			class="tooltip"
			style="left: {mousePos.x + 10}px; top: {mousePos.y - 10}px;"
			role="tooltip"
		>
			<div class="tooltip-name">{hoveredNode.name}</div>
			<div class="tooltip-info">
				Depth: {hoveredNode.depth}
				{#if hoveredNode.isLeaf}
					<span class="tooltip-badge">Leaf</span>
				{:else}
					<span class="tooltip-badge">Children: {hoveredNode.children.length}</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.radial-cluster-container {
		position: relative;
		display: inline-block;
	}

	.radial-cluster-svg {
		display: block;
	}

	.link {
		transition: stroke-opacity 0.2s ease;
	}

	.node {
		cursor: pointer;
		outline: none;
	}

	.node:focus .node-circle,
	.node:hover .node-circle {
		stroke: #333;
		stroke-width: 2;
		r: 4;
	}

	.node-circle {
		transition: all 0.15s ease;
	}

	.label {
		pointer-events: none;
		user-select: none;
	}

	.label-leaf {
		font-weight: 400;
	}

	.tooltip {
		position: fixed;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.85);
		color: white;
		border-radius: 4px;
		font-size: 12px;
		font-family: system-ui, -apple-system, sans-serif;
		pointer-events: none;
		z-index: 1000;
		max-width: 250px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
	}

	.tooltip-name {
		font-weight: 600;
		margin-bottom: 4px;
		word-break: break-word;
	}

	.tooltip-info {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.8);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.tooltip-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 10px;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.link,
		.node-circle {
			transition: none;
		}
	}
</style>
