<!--
/**
 * AnimatedBeam - Animated beams connecting circular nodes
 *
 * Features:
 * - SVG-based graphics for crisp rendering at any scale
 * - Pure CSS animations using stroke-dasharray/stroke-dashoffset
 * - Three animation patterns: uni-directional, bi-directional, multi-input
 * - Customisable node positions, colours, beam speed
 * - Optional gradient effect for flowing particle appearance
 * - Responsive container with fixed viewBox
 * - Accessible with reduced motion support
 * - Zero external dependencies
 *
 * Perfect for:
 * - System architecture diagrams (services, APIs, data flow)
 * - Data pipeline visualizations (ETL processes, transformations)
 * - Network topology displays (connections, traffic patterns)
 * - Process flows (workflows, decision trees)
 *
 * Technical Implementation:
 * - SVG <line> elements for beam connections
 * - CSS keyframe animations for flowing effect
 * - Svelte 5 $derived rune for computed beam paths
 * - TailwindCSS for minimal layout utilities
 * - Respects prefers-reduced-motion preference
 *
 * Animation Patterns:
 * 1. Uni-Directional: Beams flow in one direction (source → target)
 * 2. Bi-Directional: Beams travel both ways simultaneously
 * 3. Gradient: Flowing particle effect using SVG linearGradient
 *
 * @component
 * @example
 * ```svelte
 * <AnimatedBeam
 *   nodes={[
 *     { id: 'a', x: 100, y: 200, label: 'Source' },
 *     { id: 'b', x: 500, y: 200, label: 'Target' }
 *   ]}
 *   connections={[{ from: 'a', to: 'b' }]}
 *   beamColor="#3b82f6"
 *   beamSpeed={2}
 * />
 * ```
 */
-->

<script lang="ts">
	import type { AnimatedBeamProps, BeamNode, BeamConnection } from '$lib/types';
	import {
		DEFAULT_BEAM_NODES_UNI,
		DEFAULT_BEAM_CONNECTIONS_UNI
	} from '$lib/constants';

	/**
	 * Component props with defaults
	 */
	let {
		width = 600,
		height = 400,
		nodes = DEFAULT_BEAM_NODES_UNI,
		beamColor = '#3b82f6',
		beamWidth = 2,
		beamSpeed = 2,
		bidirectional = false,
		gradient = false,
		nodeSize = 12,
		nodeColor = '#3b82f6',
		connections = DEFAULT_BEAM_CONNECTIONS_UNI
	}: AnimatedBeamProps = $props();

	/**
	 * Computed beam path data from nodes and connections
	 * Creates array of line coordinates for rendering
	 */
	let beamPaths = $derived(
		connections.map((conn) => {
			const sourceNode = nodes.find((n) => n.id === conn.from);
			const targetNode = nodes.find((n) => n.id === conn.to);

			if (!sourceNode || !targetNode) {
				console.warn(`Invalid connection: ${conn.from} → ${conn.to}`);
				return null;
			}

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
	/**
	 * Container positioning with responsive sizing
	 * Uses CSS aspect-ratio for proper scaling on all viewports
	 */
	.animated-beam-container {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: var(--aspect-ratio);
	}

	/**
	 * Beam animation: Uni-directional flow
	 * Uses stroke-dasharray to create dashed line, then animates
	 * stroke-dashoffset to create flowing effect from source to target
	 */
	.beam {
		stroke-dasharray: 8 8;
		stroke-linecap: round;
		animation: beam-flow var(--beam-duration, 2s) linear infinite;
	}

	/**
	 * Beam animation: Bi-directional flow
	 * Reverses the animation direction for opposite flow
	 */
	.beam.bidirectional {
		animation: beam-flow-reverse var(--beam-duration, 2s) linear infinite;
	}

	/**
	 * Keyframe: Forward beam flow (source → target)
	 * Animates from 100 to 0 to create forward motion
	 */
	@keyframes beam-flow {
		from {
			stroke-dashoffset: 100;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	/**
	 * Keyframe: Reverse beam flow (target → source)
	 * Animates from 0 to 100 for backward motion
	 */
	@keyframes beam-flow-reverse {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: 100;
		}
	}

	/**
	 * Node styling
	 * Drop shadow for depth, smooth scale transition on hover
	 */
	.node {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		transition: transform 0.2s ease;
		cursor: default;
	}

	.node:hover {
		transform: scale(1.2);
	}

	/**
	 * Node label styling
	 * Positioned above node with readable contrast
	 */
	.node-label {
		font-size: 14px;
		font-weight: 500;
		fill: #374151;
		user-select: none;
		pointer-events: none;
	}

	/**
	 * Accessibility: Respect reduced motion preference
	 * Disable animations for users who prefer reduced motion
	 */
	@media (prefers-reduced-motion: reduce) {
		.beam {
			animation: none;
			stroke-dasharray: none;
		}
	}

	/**
	 * Dark mode support (optional)
	 * Adjust label colour for better contrast
	 */
	@media (prefers-color-scheme: dark) {
		.node-label {
			fill: #f3f4f6;
		}
	}

	/**
	 * Mobile responsive adjustments
	 * Smaller labels for better fit on narrow viewports
	 */
	@media (max-width: 640px) {
		.node-label {
			font-size: 10px;
		}
	}
</style>
