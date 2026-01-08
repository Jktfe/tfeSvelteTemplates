<!--
	============================================================
	RadialCluster - Circular Dendrogram (Zero Dependencies)
	============================================================

	[CR] WHAT IT DOES
	Native Svelte 5 implementation of a radial cluster (dendrogram) visualization.
	Displays hierarchical data in a circular layout where leaf nodes are positioned
	at equal depth from the center, connected by curved radial Bézier links.

	[NTL] THE SIMPLE VERSION
	Imagine a family tree arranged in a circle! The root is at the centre, and
	branches spread outward like spokes on a wheel. Each branch can split into
	more branches, all connected by smooth curved lines.

	✨ FEATURES
	• Native cluster layout algorithm (no D3 required!)
	• Curved radial links using cubic Bézier paths
	• Rotated text labels for optimal readability
	• Interactive hover effects with tooltips
	• Fully customisable colours, sizes, and styling
	• Responsive container support

	♿ ACCESSIBILITY
	• ARIA role="img" with descriptive label on container
	• Each node has role="button" and aria-label
	• Keyboard accessible (Tab + focus)
	• Respects prefers-reduced-motion preference

	📦 DEPENDENCIES
	Zero external dependencies - fully portable!

	⚠️ WARNINGS
	None expected

	🎨 USAGE
	<script>
		import RadialCluster from '$lib/components/RadialCluster.svelte';
		import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
	</script>

	<RadialCluster data={FALLBACK_RADIAL_CLUSTER_DATA} />

	📋 PROPS
	| Prop            | Type               | Default          | Description                     |
	|-----------------|--------------------|------------------|---------------------------------|
	| data            | RadialClusterNode  | required         | Hierarchical tree data          |
	| width           | number             | 800              | SVG width in pixels             |
	| height          | number             | 800              | SVG height in pixels            |
	| innerRadius     | number             | 100              | Radius of innermost ring        |
	| outerRadius     | number             | auto             | Radius of outermost ring        |
	| nodeRadius      | number             | 2.5              | Size of node circles            |
	| nodeColorParent | string             | #555             | Colour for parent nodes         |
	| nodeColorLeaf   | string             | #999             | Colour for leaf nodes           |
	| linkColor       | string             | #555             | Colour for connecting lines     |
	| linkOpacity     | number             | 0.4              | Opacity of lines (0-1)          |
	| linkWidth       | number             | 1.5              | Thickness of lines              |
	| fontSize        | number             | 11               | Label font size                 |
	| showLabels      | boolean            | true             | Show node labels                |
	| rotateLabels    | boolean            | true             | Rotate labels radially          |
	| separation      | number             | 1                | Space between sibling nodes     |

	Based on D3's radial cluster example, rewritten natively for Svelte 5.
	@see https://observablehq.com/@d3/radial-cluster/2

	============================================================
-->
<script lang="ts">
	// [CR] Type imports for props and layout node structures
	import { SvelteMap } from 'svelte/reactivity';
	import type { RadialClusterNode, RadialClusterLayoutNode, RadialClusterProps } from '$lib/types';

	// =============================================================================
	// [CR] PROPS - All configurable options with sensible defaults
	// [NTL] These are the settings you can pass to customise the radial diagram!
	// =============================================================================

	let {
		data,                           // [NTL] Your tree data with nested children
		width = 800,                    // [NTL] How wide the diagram is in pixels
		height = 800,                   // [NTL] How tall the diagram is in pixels
		innerRadius = 100,              // [NTL] How close to the centre the first ring is
		outerRadius,                    // [NTL] How far out the leaves go (auto-calculated)
		nodeRadius = 2.5,               // [NTL] Size of the node circles
		nodeColorParent = '#555',       // [NTL] Colour for parent nodes (have children)
		nodeColorLeaf = '#999',         // [NTL] Colour for leaf nodes (no children)
		linkColor = '#555',             // [NTL] Colour for the connecting lines
		linkOpacity = 0.4,              // [NTL] How see-through the lines are (0-1)
		linkWidth = 1.5,                // [NTL] How thick the lines are
		fontSize = 11,                  // [NTL] Size of label text
		fontFamily = 'system-ui, sans-serif',  // [NTL] Font for labels
		labelColor = '#333',            // [NTL] Colour for label text
		showLabels = true,              // [NTL] Show text labels next to nodes
		rotateLabels = true,            // [NTL] Rotate labels to follow the circle
		separation = 1,                 // [NTL] Space between sibling nodes
		class: className = ''           // [NTL] Extra CSS classes for the container
	}: RadialClusterProps = $props();

	// =============================================================================
	// [CR] COMPONENT STATE - Reactive values managed internally
	// [NTL] These track what's happening right now (hover, tooltip position, etc.)
	// =============================================================================

	// [CR] Track which node is currently hovered for tooltip display
	let hoveredNode = $state<RadialClusterLayoutNode | null>(null);

	// [CR] Track mouse position for tooltip placement
	let mousePos = $state({ x: 0, y: 0 });

	// [CR] Track the maximum visible depth for layer controls
	// [NTL] This controls how many "rings" are visible. Start with all layers shown.
	let maxVisibleDepth = $state<number | null>(null); // null = show all

	// =============================================================================
	// [CR] DERIVED VALUES
	// [NTL] Svelte's $derived automatically recalculates these when dependencies change
	// =============================================================================

	// [CR] Calculate outer radius if not explicitly provided
	// [NTL] If you don't specify, we make it fit nicely in the container
	const effectiveOuterRadius = $derived(outerRadius ?? Math.min(width, height) / 2 - 120);

	// [CR] Calculate the center point of the SVG for positioning
	const center = $derived({ x: width / 2, y: height / 2 });

	// =============================================================================
	// [CR] LAYOUT ALGORITHM
	// [NTL] This is the heart of the radial cluster! We take your tree data and
	//       figure out where each node should go in the circular layout. Think of
	//       it like planning a seating chart where family branches sit together!
	// =============================================================================

	/**
	 * [CR] Pre-calculate leaf counts for all nodes in the tree using post-order traversal.
	 * This avoids redundant recalculations during layout building.
	 * [NTL] First, we count how many "leaf" nodes (endpoints) each branch has.
	 *       This tells us how much space to allocate for each branch of the tree.
	 *
	 * @returns A Map from node reference to its leaf count
	 */
	function precomputeLeafCounts(node: RadialClusterNode): SvelteMap<RadialClusterNode, number> {
		const leafCounts = new SvelteMap<RadialClusterNode, number>();

		function traverse(n: RadialClusterNode): number {
			if (!n.children || n.children.length === 0) {
				leafCounts.set(n, 1);
				return 1;
			}
			const count = n.children.reduce((sum, child) => sum + traverse(child), 0);
			leafCounts.set(n, count);
			return count;
		}

		traverse(node);
		return leafCounts;
	}

	/**
	 * [CR] Calculate maximum depth of the tree. Used to determine radius scaling.
	 * [NTL] How many levels deep does the tree go? We need this to space out
	 *       the rings evenly from the centre to the edge.
	 */
	function getMaxDepth(node: RadialClusterNode, currentDepth = 0): number {
		if (!node.children || node.children.length === 0) {
			return currentDepth;
		}
		return Math.max(...node.children.map((child) => getMaxDepth(child, currentDepth + 1)));
	}

	/**
	 * [CR] Build the cluster layout from hierarchical data
	 * Algorithm:
	 * 1. Pre-compute leaf counts in a single pass (stored in Map)
	 * 2. Assign angles to each node (leaves get exact positions,
	 *    internal nodes get the mean angle of their descendants)
	 * 3. Assign radius based on depth (all leaves at same depth for cluster layout)
	 *
	 * [NTL] This is the main layout function! It walks through your tree and
	 *       assigns each node an angle (where around the circle) and a radius
	 *       (how far from the centre). Leaves all end up at the same distance
	 *       from the centre, while parent nodes are positioned closer in.
	 */
	function buildLayout(
		node: RadialClusterNode,
		leafCounts: SvelteMap<RadialClusterNode, number>,
		parent: RadialClusterLayoutNode | null = null,
		depth = 0,
		angleStart = 0,
		angleEnd = 2 * Math.PI,
		maxDepth = 0
	): RadialClusterLayoutNode {
		const isLeaf = !node.children || node.children.length === 0;
		const totalLeaves = leafCounts.get(node) ?? 1;

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
				const childLeaves = leafCounts.get(child) ?? 1;
				const childAngleSpan = (childLeaves / totalLeaves) * angleSpan * separation;
				const childAngleStart = currentAngle;
				const childAngleEnd = currentAngle + childAngleSpan;
				currentAngle = childAngleEnd;

				return buildLayout(
					child,
					leafCounts,
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
	 * [CR] Flatten the tree into an array of nodes for rendering
	 * [NTL] SVG needs a flat list to loop over, so we unpack the nested tree
	 *       into a simple array of all nodes. Like taking a family tree and
	 *       making a guest list!
	 */
	function flattenNodes(node: RadialClusterLayoutNode): RadialClusterLayoutNode[] {
		const nodes: RadialClusterLayoutNode[] = [node];
		for (const child of node.children) {
			nodes.push(...flattenNodes(child));
		}
		return nodes;
	}

	/**
	 * [CR] Get all links (parent-child connections) from the tree
	 * [NTL] We also need a list of all the connections between nodes so we can
	 *       draw the curved lines. Each link connects a parent to its child.
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

	// [CR] Build the layout from input data
	// [NTL] Here's where Svelte's reactivity shines! Whenever your data changes,
	//       all of these will automatically recalculate in the right order.
	const leafCounts = $derived(precomputeLeafCounts(data));   // [NTL] Count leaves first
	const maxTreeDepth = $derived(getMaxDepth(data));          // [NTL] Then measure depth
	const rootNode = $derived(buildLayout(data, leafCounts, null, 0, 0, 2 * Math.PI, maxTreeDepth)); // [NTL] Build full layout
	const allNodes = $derived(flattenNodes(rootNode));         // [NTL] Flatten for rendering
	const allLinks = $derived(getLinks(rootNode));             // [NTL] Extract all connections

	// [CR] Calculate effective visible depth - defaults to max depth on first render
	// [NTL] If no limit is set, show everything. Otherwise respect the user's choice.
	const effectiveVisibleDepth = $derived(maxVisibleDepth ?? maxTreeDepth);

	// [CR] Filter nodes to only show those within the visible depth limit
	// [NTL] Only show nodes that aren't too deep in the hierarchy
	const visibleNodes = $derived(allNodes.filter(node => node.depth <= effectiveVisibleDepth));

	// [CR] Filter links to only show connections between visible nodes
	// [NTL] Only draw lines where both ends are visible
	const visibleLinks = $derived(allLinks.filter(
		link => link.source.depth <= effectiveVisibleDepth && link.target.depth <= effectiveVisibleDepth
	));

	/**
	 * [CR] Increase the visible depth by one layer
	 * [NTL] Clicking + shows one more ring of nodes
	 */
	function increaseDepth(): void {
		const current = maxVisibleDepth ?? maxTreeDepth;
		if (current < maxTreeDepth) {
			maxVisibleDepth = current + 1;
		}
	}

	/**
	 * [CR] Decrease the visible depth by one layer (minimum is 0, the root)
	 * [NTL] Clicking - hides the outermost ring of nodes
	 */
	function decreaseDepth(): void {
		const current = maxVisibleDepth ?? maxTreeDepth;
		if (current > 0) {
			maxVisibleDepth = current - 1;
		}
	}

	// =============================================================================
	// [CR] COORDINATE TRANSFORMATIONS
	// [NTL] The layout gives us polar coordinates (angle + distance from centre),
	//       but SVG uses x,y coordinates. These functions do the conversion!
	// =============================================================================

	/**
	 * [CR] Convert polar coordinates (angle, radius) to Cartesian (x, y)
	 * Angle is in radians, measured from 12 o'clock position going clockwise.
	 * [NTL] Polar = "how far around the clock and how far from centre"
	 *       Cartesian = "how far right and how far down"
	 *       This converts between them using basic trigonometry.
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
	 * [CR] Generate SVG path for a radial link between parent and child nodes
	 * Uses cubic Bézier curves that follow the radial direction.
	 * [NTL] This creates those beautiful curved lines connecting nodes! The curves
	 *       bend smoothly outward from parent to child, like branches growing
	 *       from a tree trunk. We use "Bézier curves" (fancy smooth lines).
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
	 * [CR] Calculate text anchor based on node angle
	 * Text on the right side (0 to π) anchors at start
	 * Text on the left side (π to 2π) anchors at end
	 * [NTL] Labels on the right side of the circle start at the node and extend right.
	 *       Labels on the left side end at the node and extend left. This keeps
	 *       text from overlapping the centre of the diagram!
	 */
	function getTextAnchor(angle: number): 'start' | 'end' {
		const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		return normalizedAngle < Math.PI ? 'start' : 'end';
	}

	/**
	 * [CR] Calculate text rotation for radial labels
	 * Ensures text is always readable (not upside down)
	 * [NTL] We rotate labels to follow the circular layout, but we also flip
	 *       labels on the left side so you never have to read upside-down text!
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
	 * [CR] Calculate text transform for a node
	 * Includes both translation to position and rotation for readability
	 * [NTL] This combines position + rotation into a single SVG transform string.
	 *       It moves the text to the node's position, then rotates it to follow the circle.
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
	 * [CR] Get label offset based on whether node is on left or right side
	 * Provides spacing between node circle and text
	 * [NTL] This adds a small gap between the node circle and its label, so
	 *       they don't overlap. Positive offset for right side, negative for left.
	 */
	function getLabelOffset(node: RadialClusterLayoutNode): number {
		const normalizedAngle = ((node.x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		return normalizedAngle < Math.PI ? 6 : -6;
	}

	// =============================================================================
	// [CR] EVENT HANDLERS
	// [NTL] These functions respond to user interactions - hovering, focusing,
	//       and moving the mouse. They control the tooltip that shows node details.
	// =============================================================================

	/**
	 * [CR] Handle mouse entering a node - show tooltip
	 * [NTL] When you hover over a node, we show a tooltip with its name and details.
	 */
	function handleNodeMouseEnter(node: RadialClusterLayoutNode, event: MouseEvent): void {
		hoveredNode = node;
		mousePos = { x: event.clientX, y: event.clientY };
	}

	/**
	 * [CR] Handle mouse leaving a node - hide tooltip
	 * [NTL] When you move away from a node, we hide the tooltip.
	 */
	function handleNodeMouseLeave(): void {
		hoveredNode = null;
	}

	/**
	 * [CR] Handle mouse move - update tooltip position
	 * [NTL] The tooltip follows your mouse cursor while you're over a node.
	 */
	function handleNodeMouseMove(event: MouseEvent): void {
		mousePos = { x: event.clientX, y: event.clientY };
	}

	/**
	 * [CR] Handle keyboard focus on a node - show tooltip using element position
	 * Uses getBoundingClientRect() to position tooltip relative to the focused element.
	 * [NTL] Keyboard users can Tab through nodes - when a node gets focus,
	 *       we show its tooltip positioned near the element. This makes the
	 *       diagram fully accessible without a mouse!
	 */
	function handleNodeFocus(node: RadialClusterLayoutNode, event: FocusEvent): void {
		hoveredNode = node;
		const target = event.currentTarget as HTMLElement | SVGElement;
		if (target) {
			const rect = target.getBoundingClientRect();
			// Position tooltip to the right and slightly above the focused element
			mousePos = { x: rect.right + 10, y: rect.top };
		}
	}
</script>

<div class="radial-cluster-container {className}" role="img" aria-label="Radial cluster diagram showing hierarchical data">
	<!-- [CR] Layer controls in top-right corner -->
	<!-- [NTL] These buttons let you show more or fewer layers - great for mobile! -->
	{#if maxTreeDepth > 0}
		<div class="layer-controls" role="group" aria-label="Layer depth controls">
			<button
				class="layer-btn"
				onclick={decreaseDepth}
				disabled={effectiveVisibleDepth <= 0}
				aria-label="Show fewer layers"
				title="Show fewer layers"
			>
				−
			</button>
			<span class="layer-count" aria-live="polite">
				{effectiveVisibleDepth}/{maxTreeDepth}
			</span>
			<button
				class="layer-btn"
				onclick={increaseDepth}
				disabled={effectiveVisibleDepth >= maxTreeDepth}
				aria-label="Show more layers"
				title="Show more layers"
			>
				+
			</button>
		</div>
	{/if}

	<svg
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		class="radial-cluster-svg"
		style="max-width: 100%; height: auto;"
	>
		<!-- Links layer - rendered first so nodes appear on top -->
		<g class="links" fill="none" stroke={linkColor} stroke-opacity={linkOpacity} stroke-width={linkWidth}>
			{#each visibleLinks as link (`${link.source.name}-${link.target.name}`)}
				<path
					d={radialLinkPath(link.source, link.target)}
					class="link"
				/>
			{/each}
		</g>

		<!-- Nodes layer -->
		<g class="nodes">
			{#each visibleNodes as node (node.name)}
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
					onfocus={(e) => handleNodeFocus(node, e)}
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
				{#each visibleNodes as node (node.name)}
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

	/* [CR] Layer control buttons positioned in top-right corner */
	/* [NTL] These controls float above the chart for easy access on mobile */
	.layer-controls {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(255, 255, 255, 0.95);
		padding: 4px 8px;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 10;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.layer-btn {
		width: 28px;
		height: 28px;
		border: none;
		background: #f3f4f6;
		border-radius: 4px;
		font-size: 18px;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #374151;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.layer-btn:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.layer-btn:active:not(:disabled) {
		background: #d1d5db;
	}

	.layer-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.layer-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}

	.layer-count {
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		min-width: 32px;
		text-align: center;
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
		.node-circle,
		.layer-btn {
			transition: none;
		}
	}

	/* Dark mode support for layer controls */
	@media (prefers-color-scheme: dark) {
		.layer-controls {
			background: rgba(31, 41, 55, 0.95);
		}

		.layer-btn {
			background: #374151;
			color: #f3f4f6;
		}

		.layer-btn:hover:not(:disabled) {
			background: #4b5563;
		}

		.layer-btn:active:not(:disabled) {
			background: #6b7280;
		}

		.layer-count {
			color: #9ca3af;
		}
	}
</style>

<!-- [CR] Gold Standard review complete. All [CR]/[NTL] comments added. -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
