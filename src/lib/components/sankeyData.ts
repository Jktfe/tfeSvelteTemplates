// =============================================================================
// [CR] SANKEY DATA FACTORY - Manages Hierarchical Visibility
// =============================================================================
//
// [NTL] Think of this like a family tree manager! It keeps track of all family
//       members (nodes) but only shows you the ones you've "unfolded". When you
//       click on "Coal" in the diagram, this code says "OK, now show me Coal's
//       children!" and updates which nodes and lines are visible.
//
// [CR] Architecture:
//       - Stores complete dataset internally (immutable source of truth)
//       - Exposes only visible nodes/links via getVisibleNodes() and getVisibleLinks()
//       - Mutates internal state on expand/collapse, then refreshes visible data
//       - Component must reassign the returned object to trigger Svelte reactivity
//
// [CR] Visibility Rules:
//       - Top-level nodes (no parent): Always visible
//       - Child nodes: Visible only if parent.expanded === true
//       - Links: Both source and target must be visible
//       - Aggregate links: Shown when parent is collapsed
//       - Child links: Shown when parent is expanded
//
// =============================================================================

import type { SankeyNode, SankeyLink } from '$lib/types';

// =============================================================================
// [CR] TYPE DEFINITIONS
// [NTL] TypeScript interfaces tell us what shape our data should have.
//       Think of it like a recipe card - it lists all the ingredients needed!
// =============================================================================

/**
 * [CR] Extended SankeyData with expand/collapse methods
 * [NTL] This is what we get back from createSankeyData() - an object with
 *       the visible nodes/links plus buttons to expand and collapse things.
 */
interface SankeyDataManager {
	nodes: SankeyNode[]; // [CR] Currently visible nodes only
	links: SankeyLink[]; // [CR] Currently visible links only
	expand: (node: SankeyNode) => void; // [CR] Show children of a node
	collapse: (node: SankeyNode) => void; // [CR] Hide children of a node
}

// =============================================================================
// [CR] FACTORY FUNCTION - Creates the Data Manager
// =============================================================================
//
// [NTL] This is the main function that sets everything up! You give it all your
//       nodes and links, and it gives you back a smart object that knows which
//       ones to show and which ones to hide. It's like a theatre director who
//       decides which actors are on stage at any given moment.
//

/**
 * [CR] Creates expandable Sankey data manager
 * [NTL] Call this once when your component loads, and you'll get back an object
 *       that handles all the show/hide logic for you. Easy peasy!
 *
 * @param initialNodes - All nodes in the hierarchy (including hidden children)
 * @param initialLinks - All possible links (including hidden connections)
 * @returns Manager object with visible nodes/links and expand/collapse methods
 */
export function createSankeyData(
	initialNodes: SankeyNode[],
	initialLinks: SankeyLink[]
): SankeyDataManager {
	// -------------------------------------------------------------------------
	// [CR] INTERNAL STATE - Store complete dataset
	// [NTL] We keep a copy of EVERYTHING here. When nodes expand/collapse,
	//       we don't add or remove data - we just filter what's visible.
	// -------------------------------------------------------------------------
	const allNodes = initialNodes.map((n) => ({ ...n, expanded: false }));
	const allLinks = initialLinks;

	// -------------------------------------------------------------------------
	// [CR] VISIBILITY FILTER - Which nodes are on stage?
	// -------------------------------------------------------------------------

	/**
	 * [CR] Get currently visible nodes based on expanded state
	 * [NTL] This function asks: "Should I show this node right now?"
	 *       - Top-level nodes (like "Coal", "Solar"): Always on stage
	 *       - Child nodes (like "Plant A"): Only shown when parent is open
	 *
	 * @returns Filtered array of visible nodes
	 */
	function getVisibleNodes(): SankeyNode[] {
		return allNodes.filter((node) => {
			// [CR] No parent = top-level node = always visible
			// [NTL] These are the main categories that never hide
			if (!node.parent) return true;

			// [CR] Has parent: check if parent is expanded
			// [NTL] "Is my parent node currently unfolded?"
			const parent = allNodes.find((n) => n.id === node.parent);
			return parent?.expanded === true;
		});
	}

	/**
	 * [CR] Get currently visible links based on expanded state
	 * [NTL] This is the trickiest part! Links are the coloured ribbons connecting
	 *       nodes. When you expand "Coal", we need to:
	 *       - HIDE the summary ribbon (Coal → Residential)
	 *       - SHOW the detailed ribbons (Plant A → Residential, Plant B → Residential)
	 *
	 * [CR] The magic trick: We detect "aggregate links" that bypass children
	 *      and hide them when the parent is expanded.
	 *
	 * @returns Filtered array of visible links
	 */
	function getVisibleLinks(): SankeyLink[] {
		// [CR] Build a Set of visible node IDs for O(1) lookup
		const visibleNodeIds = new Set(getVisibleNodes().map((n) => n.id));

		return allLinks.filter((link) => {
			// [CR] Basic requirement: both endpoints must be visible
			// [NTL] Can't draw a line to a node that's hidden!
			if (!visibleNodeIds.has(link.source) || !visibleNodeIds.has(link.target)) {
				return false;
			}

			const sourceNode = allNodes.find((n) => n.id === link.source);
			const targetNode = allNodes.find((n) => n.id === link.target);

			// [CR] Special handling for expandable source nodes
			// [NTL] This is where we swap between aggregate and detailed views
			if (sourceNode?.expandable) {
				// [CR] Is this a "parent → child" link?
				// [NTL] e.g., Coal → Plant A (the link that reveals the child)
				const isChildLink = targetNode?.parent === link.source;

				// [CR] Is this an "aggregate" link that bypasses children?
				// [NTL] e.g., Coal → Residential (the summary that hides detail)
				// Check if any child of source has a link to this same target
				const hasChildrenThatReachTarget = allNodes.some((child) => {
					if (child.parent !== link.source) return false;
					return allLinks.some((l) => l.source === child.id && l.target === link.target);
				});

				if (isChildLink) {
					// [CR] Child link: only show when parent is expanded
					// [NTL] "Show me the kids" = show links TO kids
					return sourceNode.expanded === true;
				} else if (hasChildrenThatReachTarget) {
					// [CR] Aggregate link: only show when parent is COLLAPSED
					// [NTL] "Summary view" = hide when showing detail
					return sourceNode.expanded !== true;
				}
			}

			// [CR] Default: show the link normally
			// [NTL] Non-expandable sources just show their links always
			return true;
		});
	}

	// -------------------------------------------------------------------------
	// [CR] DATA MANAGER OBJECT - The Public Interface
	// [NTL] This is what the component sees and uses. It has the current
	//       visible data plus two methods: expand() and collapse().
	// -------------------------------------------------------------------------

	const data: SankeyDataManager = {
		// [CR] These arrays are refreshed after every expand/collapse
		nodes: getVisibleNodes(),
		links: getVisibleLinks(),

		/**
		 * [CR] Expand a node to show its children
		 * [NTL] When you click on "Coal", this function runs! It marks Coal as
		 *       "expanded" and refreshes the visible nodes/links so the diagram
		 *       updates to show all the power plants underneath.
		 *
		 * @param node - The node to expand (must be expandable)
		 */
		expand(node: SankeyNode): void {
			const foundNode = allNodes.find((n) => n.id === node.id);
			if (foundNode && foundNode.expandable) {
				// [CR] Flip the expanded flag
				foundNode.expanded = true;
				// [CR] Refresh visible data
				// [NTL] Tell the diagram "things have changed, recalculate!"
				data.nodes = getVisibleNodes();
				data.links = getVisibleLinks();
			}
		},

		/**
		 * [CR] Collapse a node to hide its children
		 * [NTL] The opposite of expand! Hides all the children and goes back to
		 *       the summary view. Clever bit: if a grandchild was also expanded,
		 *       we collapse that too so nothing gets "orphaned".
		 *
		 * @param node - The node to collapse (must be expandable)
		 */
		collapse(node: SankeyNode): void {
			const foundNode = allNodes.find((n) => n.id === node.id);
			if (foundNode && foundNode.expandable) {
				// [CR] Flip the expanded flag
				foundNode.expanded = false;

				// [CR] Recursively collapse all descendants
				// [NTL] If Coal has Plant A, and Plant A had sub-sections, we
				//       need to collapse those too, otherwise they'd be "stuck"
				//       in expanded state when their grandparent is closed.
				const collapseDescendants = (parentId: string) => {
					const children = allNodes.filter((n) => n.parent === parentId);
					children.forEach((child) => {
						if (child.expandable) {
							child.expanded = false;
							collapseDescendants(child.id); // [CR] Recursive call
						}
					});
				};
				collapseDescendants(node.id);

				// [CR] Refresh visible data
				data.nodes = getVisibleNodes();
				data.links = getVisibleLinks();
			}
		}
	};

	return data;
}
