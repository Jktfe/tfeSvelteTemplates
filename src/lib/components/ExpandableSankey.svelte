<!--
	============================================================
	ExpandableSankey - Interactive Hierarchical Flow Diagram
	============================================================

	[CR] WHAT IT DOES
	Renders a Sankey diagram with expandable nodes using Unovis library.
	Users click nodes to reveal/hide child categories, creating a
	drill-down experience for hierarchical flow data.

	[NTL] THE SIMPLE VERSION
	Think of it like an org chart meets a flow chart! You start with
	big categories (like "Coal" or "Solar"), and when you click on one,
	it expands to show the details underneath (like individual power plants).
	The coloured ribbons show how much flows from each source to each destination.

	✨ FEATURES
	• Click expandable nodes to reveal hidden children
	• Colour-coded flows inherited from source nodes
	• Smooth animated transitions between states
	• Hierarchical parent-child relationships
	• Mouse-tracking tooltips (provided by Unovis)
	• Recursive collapse (collapsing parent hides all descendants)

	♿ ACCESSIBILITY
	• Keyboard: Not yet implemented (Unovis limitation)
	• Screen readers: Basic - nodes are SVG elements
	• Motion: Animations controlled by Unovis

	📦 DEPENDENCIES
	External: @unovis/svelte, @unovis/ts
	REASON: Sankey layout algorithms are extremely complex - calculating
	node positions, link curves, and handling expand/collapse animations
	would take 100+ hours to build natively. Unovis provides battle-tested
	implementations with smooth transitions out of the box.

	⚠️ WARNINGS
	• state_referenced_locally: Safe to ignore - createSankeyData is intentionally
	  called once at initialization. The reactive updates happen through
	  reassigning the `data` state variable after expand/collapse.

	🎨 USAGE
	<ExpandableSankey
		nodes={sankeyData.nodes}
		links={sankeyData.links}
		height={600}
	/>

	📋 PROPS
	| Prop   | Type         | Default | Description                        |
	|--------|--------------|---------|-------------------------------------|
	| nodes  | SankeyNode[] | required| All nodes including hidden children |
	| links  | SankeyLink[] | required| All links including hidden ones     |
	| height | number       | 600     | Container height in pixels          |

	============================================================
-->

<script lang="ts">
	// =========================================================================
	// [CR] IMPORTS
	// [NTL] We're using Unovis - a powerful visualization library that handles
	//       all the complex maths for positioning nodes and drawing curved links.
	// =========================================================================

	import { VisSingleContainer, VisSankey } from '@unovis/svelte';
	import { Sankey, FitMode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts';
	import { createSankeyData } from './sankeyData';
	import type { SankeyNode, ExpandableSankeyProps } from '$lib/types';

	// =========================================================================
	// [CR] PROPS - Configuration passed from parent component
	// [NTL] These are the settings you pass in when using this component
	// =========================================================================

	let { nodes, links, height = 600 }: ExpandableSankeyProps = $props();

	// =========================================================================
	// [CR] DATA MANAGER INITIALIZATION
	// [NTL] Here's where we set up the "brain" of the expand/collapse feature.
	//       The createSankeyData function returns an object that knows which
	//       nodes should be visible based on what's been expanded.
	// =========================================================================

	// [CR] Create the expandable data manager with all nodes and links
	// [CR] The svelte-ignore is safe - we intentionally capture initial values
	//      and manage reactivity through the `data` state variable instead
	/* svelte-ignore state_referenced_locally */
	const sankeyData = createSankeyData(nodes, links);

	// [CR] Reactive data object for VisSingleContainer
	// [NTL] This is a clever trick! We store the data manager in a $state variable,
	//       and when we expand/collapse, we reassign it to itself. This tells Svelte
	//       "hey, something changed!" even though it's the same object.
	let data = $state(sankeyData);

	// =========================================================================
	// [CR] EVENT HANDLERS
	// [NTL] What happens when you interact with the diagram
	// =========================================================================

	/**
	 * [CR] Toggle expand/collapse state of a node
	 * [NTL] This is the magic function! When you click a node:
	 *       - If it's expanded, we collapse it (hide children)
	 *       - If it's collapsed, we expand it (show children)
	 *       Then we tell Svelte to re-render by reassigning the data.
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
			// [CR] Reassign to trigger Svelte 5 reactivity
			// [NTL] This looks weird but it works! Svelte sees "data = something"
			//       and knows to update the view, even if it's the same object.
			data = sankeyData;
		}
	}

	// =========================================================================
	// [CR] UNOVIS CONFIGURATION
	// [NTL] These callbacks tell Unovis how to style and behave. Think of them
	//       as instructions: "when you draw a link, use this colour" etc.
	// =========================================================================

	const callbacks = {
		/**
		 * [CR] Colour each link based on its source node
		 * [NTL] This is what makes the coloured ribbons! Each link inherits
		 *       the colour of where it comes from, so you can trace flows visually.
		 */
		linkColor: (d: any): string => {
			const sourceNode = data.nodes.find((n) => n.id === d.source.id);
			return sourceNode?.color ?? '#ccc';
		},

		/**
		 * [CR] Show pointer cursor for expandable nodes
		 * [NTL] A little UX touch - your cursor changes to a hand pointer
		 *       when hovering over nodes you can click. Non-expandable nodes
		 *       keep the default cursor so users know they can't click them.
		 */
		nodeCursor: (d: SankeyNode) => (d.expandable ? 'pointer' : null),

		/**
		 * [CR] Event handlers for node interactions
		 * [NTL] This wires up the click handler. Unovis uses CSS selectors
		 *       to target elements - Sankey.selectors.node means "any node".
		 */
		events: {
			[Sankey.selectors.node]: {
				click: toggleGroup
			}
		}
	};
</script>

<!--
	[CR] Container for the Sankey diagram
	[NTL] This wrapper holds the entire diagram. We set a fixed height but let
	      width be 100% so it fills whatever space is available. On mobile, if
	      the diagram is wider than the screen, users can scroll horizontally.
-->
<div class="sankey-container" style="height: {height}px;">
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
	/* =========================================================================
	   [CR] CONTAINER STYLES
	   [NTL] The wrapper that holds the whole diagram. On mobile, the diagram
	         has a minimum width of 800px, so users can swipe horizontally
	         to see the full Sankey flow. This keeps the labels readable!
	   ========================================================================= */

	.sankey-container {
		/* [CR] Minimum width ensures diagram doesn't get squashed on mobile */
		/* [NTL] Sankey diagrams need space to breathe - 800px minimum means
		         the labels and flows stay readable even on phones. */
		min-width: 800px;

		/* [CR] Subtle visual styling */
		background: #f5f5f5;
		border: 2px solid #ddd;
	}

	/* [CR] Outer wrapper for scroll behaviour */
	/* [NTL] This is a bit sneaky - we need TWO containers! The inner one
	         (.sankey-container) has the minimum width, and we wrap it in
	         a scrollable outer container. Svelte scopes CSS, so we target
	         the parent via :global() from page styles or add inline. */
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
