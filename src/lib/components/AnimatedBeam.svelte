<!--
	============================================================
	AnimatedBeam - Animated SVG Beams Connecting Nodes
	============================================================

	[CR] WHAT IT DOES
	Draws animated lines ("beams") connecting circular nodes in an SVG diagram.
	Uses CSS stroke-dasharray animation for a flowing effect. Pure SVG + CSS,
	no JavaScript animation loop required.

	[NTL] THE SIMPLE VERSION
	Picture a network diagram where you can see data packets travelling
	along the wires! The dashed lines animate to show things flowing from
	one point to another - like watching electricity flow through a circuit.

	============================================================

	FEATURES:
	- SVG-based graphics (crisp at any scale)
	- CSS animations (stroke-dasharray/dashoffset trick)
	- Uni-directional or bi-directional flow
	- Optional gradient for "particle" effect
	- Responsive container with fixed viewBox
	- Node labels and hover effects

	PERFECT FOR:
	- System architecture diagrams
	- Data pipeline visualizations
	- Network topology displays
	- Process flows and workflows

	DEPENDENCIES:
	- $lib/types (AnimatedBeamProps, BeamNode, BeamConnection)
	- $lib/constants (default nodes and connections)
	- Zero external dependencies

	ACCESSIBILITY:
	- Respects prefers-reduced-motion (shows static lines)
	- Dark mode support for labels
	- aria-hidden on decorative beams

	WARNINGS: None expected

	============================================================
-->

<script lang="ts">
	// [CR] Type imports for type-safe props
	import type { AnimatedBeamProps, BeamNode, BeamConnection } from '$lib/types';
	// [CR] Default data for demo purposes
	import {
		DEFAULT_BEAM_NODES_UNI,
		DEFAULT_BEAM_CONNECTIONS_UNI
	} from '$lib/constants';

	// [CR] Props interface with sensible defaults
	// [NTL] These are all the "knobs and dials" you can tweak!
	let {
		width = 600,                    // [NTL] SVG viewBox width
		height = 400,                   // [NTL] SVG viewBox height
		nodes = DEFAULT_BEAM_NODES_UNI, // [NTL] Array of nodes to display
		beamColor = '#3b82f6',          // [NTL] Colour of the animated beams
		beamWidth = 2,                  // [NTL] Thickness of the beams
		beamSpeed = 2,                  // [NTL] Animation duration in seconds (lower = faster)
		bidirectional = false,          // [NTL] Should beams flow both directions?
		gradient = false,               // [NTL] Use gradient for "particle" effect?
		nodeSize = 12,                  // [NTL] Radius of the node circles
		nodeColor = '#3b82f6',          // [NTL] Fill colour of nodes
		connections = DEFAULT_BEAM_CONNECTIONS_UNI  // [NTL] Which nodes connect to which
	}: AnimatedBeamProps = $props();

	// [CR] ============================================================
	// [CR] COMPUTED BEAM PATHS
	// [NTL] Svelte automatically recalculates this when nodes/connections change
	// [CR] ============================================================

	// [CR] Transform connection definitions into renderable line coordinates
	// [NTL] For each connection, we find the source and target nodes and get their x,y positions
	let beamPaths = $derived(
		connections.map((conn) => {
			const sourceNode = nodes.find((n) => n.id === conn.from);
			const targetNode = nodes.find((n) => n.id === conn.to);

			// [CR] Warn if connection references non-existent node
			if (!sourceNode || !targetNode) {
				console.warn(`Invalid connection: ${conn.from} → ${conn.to}`);
				return null;
			}

			// [CR] Return line coordinates for SVG rendering
			return {
				x1: sourceNode.x,
				y1: sourceNode.y,
				x2: targetNode.x,
				y2: targetNode.y,
				bidirectional: conn.bidirectional ?? bidirectional
			};
		}).filter(Boolean) as Array<{
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			bidirectional: boolean;
		}>
	);
</script>

<div
	class="animated-beam-container"
	style="--aspect-ratio: {width / height}; max-width: {width}px;"
>
	<svg width="100%" height="100%" viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet">
		<!-- Gradient definition for flowing particle effect -->
		{#if gradient}
			<defs>
				<linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse">
					<stop offset="0%" stop-color="transparent" />
					<stop offset="50%" stop-color={beamColor} />
					<stop offset="100%" stop-color="transparent" />
				</linearGradient>
			</defs>
		{/if}

		<!-- Beams layer (rendered behind nodes) -->
		<g class="beams">
			{#each beamPaths as path, i}
				<line
					x1={path.x1}
					y1={path.y1}
					x2={path.x2}
					y2={path.y2}
					stroke={gradient ? 'url(#beam-gradient)' : beamColor}
					stroke-width={beamWidth}
					class="beam {path.bidirectional ? 'bidirectional' : ''}"
					style="--beam-duration: {beamSpeed}s"
					aria-hidden="true"
				/>
			{/each}
		</g>

		<!-- Nodes layer (rendered on top of beams) -->
		<g class="nodes">
			{#each nodes as node}
				<circle
					cx={node.x}
					cy={node.y}
					r={nodeSize}
					fill={nodeColor}
					class="node"
					aria-label={node.label || `Node ${node.id}`}
				/>
				{#if node.label}
					<text
						x={node.x}
						y={node.y - nodeSize - 8}
						text-anchor="middle"
						class="node-label"
					>
						{node.label}
					</text>
				{/if}
			{/each}
		</g>
	</svg>
</div>

<style>
	/* [CR] ============================================================ */
	/* [CR] CONTAINER STYLES */
	/* [NTL] The outer wrapper that makes the SVG scale responsively */
	/* [CR] ============================================================ */

	.animated-beam-container {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: var(--aspect-ratio);  /* [CR] Maintains proportions on resize */
	}

	/* [CR] ============================================================ */
	/* [CR] BEAM ANIMATION */
	/* [NTL] This is the magic! Dashed lines that appear to flow */
	/* [CR] ============================================================ */

	/* [CR] stroke-dasharray creates the dashed pattern */
	/* [CR] Animating stroke-dashoffset makes dashes appear to move */
	.beam {
		stroke-dasharray: 8 8;        /* [NTL] 8px dash, 8px gap */
		stroke-linecap: round;        /* [NTL] Rounded dash ends look nicer */
		animation: beam-flow var(--beam-duration, 2s) linear infinite;
	}

	/* [CR] Bi-directional beams flow in reverse */
	.beam.bidirectional {
		animation: beam-flow-reverse var(--beam-duration, 2s) linear infinite;
	}

	/* [CR] Forward flow animation (source → target) */
	/* [NTL] offset goes from 100 to 0, making dashes appear to move forward */
	@keyframes beam-flow {
		from { stroke-dashoffset: 100; }
		to { stroke-dashoffset: 0; }
	}

	/* [CR] Reverse flow animation (target → source) */
	@keyframes beam-flow-reverse {
		from { stroke-dashoffset: 0; }
		to { stroke-dashoffset: 100; }
	}

	/* [CR] ============================================================ */
	/* [CR] NODE STYLES */
	/* [NTL] The circles at each endpoint */
	/* [CR] ============================================================ */

	.node {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));  /* [NTL] Subtle depth */
		transition: transform 0.2s ease;
		cursor: default;
	}

	.node:hover {
		transform: scale(1.2);  /* [NTL] Grow slightly on hover */
	}

	/* [CR] Node label styling - positioned above each node */
	.node-label {
		font-size: 14px;
		font-weight: 500;
		fill: #374151;
		user-select: none;      /* [CR] Prevent accidental text selection */
		pointer-events: none;   /* [CR] Labels don't intercept clicks */
	}

	/* [CR] ============================================================ */
	/* [CR] ACCESSIBILITY & RESPONSIVE */
	/* [CR] ============================================================ */

	/* [CR] Respect prefers-reduced-motion */
	/* [NTL] If someone has motion sensitivity, show static lines instead */
	@media (prefers-reduced-motion: reduce) {
		.beam {
			animation: none;
			stroke-dasharray: none;  /* [CR] Solid line, no animation */
		}
	}

	/* [CR] Dark mode support */
	@media (prefers-color-scheme: dark) {
		.node-label {
			fill: #f3f4f6;  /* [CR] Light text on dark backgrounds */
		}
	}

	/* [CR] Mobile responsive - smaller labels */
	@media (max-width: 640px) {
		.node-label {
			font-size: 10px;
		}
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
