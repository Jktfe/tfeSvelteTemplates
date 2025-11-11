<script lang="ts">
	/**
	 * Expandable Sankey Diagram Component
	 *
	 * Interactive hierarchical flow visualization with expand/collapse functionality.
	 * Built with Unovis (@unovis/svelte) for smooth animated transitions.
	 *
	 * Features:
	 * - Click expandable nodes to reveal/hide children
	 * - Colour-coded flows inherited from source nodes
	 * - Smooth animated transitions between states
	 * - Hierarchical parent-child relationships
	 * - Mouse-tracking tooltips (provided by Unovis)
	 *
	 * Usage:
	 * ```svelte
	 * <ExpandableSankey
	 *   nodes={sankeyData.nodes}
	 *   links={sankeyData.links}
	 *   height={600}
	 * />
	 * ```
	 *
	 * @component
	 */

	import { VisSingleContainer, VisSankey } from '@unovis/svelte';
	import { Sankey, FitMode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts';
	import { createSankeyData } from './sankeyData';
	import type { SankeyNode, ExpandableSankeyProps } from '$lib/types';

	let { nodes, links, height = 600 }: ExpandableSankeyProps = $props();

	// Create the expandable data manager with all nodes and links
	// This handles visibility logic based on expanded state
	const sankeyData = createSankeyData(nodes, links);

	// Reactive data object for VisSingleContainer
	// Must be reassigned to trigger Svelte 5 reactivity after expand/collapse
	let data = $state(sankeyData);

	/**
	 * Toggle expand/collapse state of a node
	 * Called when user clicks on an expandable node
	 *
	 * @param n - The node that was clicked
	 */
	function toggleGroup(n: SankeyNode): void {
		if (n.expandable) {
			if (n.expanded) {
				sankeyData.collapse(n);
			} else {
				sankeyData.expand(n);
			}
			// Reassign to trigger Svelte 5 reactivity
			data = sankeyData;
		}
	}

	/**
	 * Unovis Sankey callbacks for custom styling and interactivity
	 */
	const callbacks = {
		/**
		 * Colour each link based on its source node
		 * This creates colour-coded flows throughout the diagram
		 */
		linkColor: (d: any): string => {
			const sourceNode = data.nodes.find((n) => n.id === d.source.id);
			return sourceNode?.color ?? '#ccc';
		},

		/**
		 * Show pointer cursor for expandable nodes
		 * Visual indication that the node is clickable
		 */
		nodeCursor: (d: SankeyNode) => (d.expandable ? 'pointer' : null),

		/**
		 * Event handlers for node interactions
		 */
		events: {
			[Sankey.selectors.node]: {
				click: toggleGroup
			}
		}
	};
</script>

<!--
	Container for the Sankey diagram
	Full width with fixed height and subtle background/border
-->
<div style="width: 100%; height: {height}px; background: #f5f5f5; border: 2px solid #ddd;">
	<VisSingleContainer {data} {height}>
		<VisSankey
			{...callbacks}
			labelFit={FitMode.Wrap}
			labelMaxWidth={150}
			labelVerticalAlign={VerticalAlign.Middle}
			nodePadding={20}
			subLabelPlacement={SankeySubLabelPlacement.Inline}
		/>
	</VisSingleContainer>
</div>

<style>
	/**
	 * Container styles
	 * Basic block display - all sizing handled inline for flexibility
	 */
	div {
		display: block;
	}
</style>
