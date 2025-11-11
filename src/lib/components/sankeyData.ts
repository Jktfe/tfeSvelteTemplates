/**
 * Expandable Sankey Data Factory
 *
 * Creates a plain object with expand/collapse methods for managing hierarchical Sankey data.
 * Uses a filtered visibility pattern where the full dataset is stored internally, and only
 * visible nodes/links are exposed based on the current expansion state.
 *
 * Architecture:
 * - Stores complete dataset (all nodes and links)
 * - Filters visible items based on parent's expanded state
 * - Provides expand() and collapse() methods that update visibility
 * - Component reassigns object reference to trigger Svelte 5 reactivity
 *
 * Visibility Rules:
 * - Top-level nodes (no parent): Always visible
 * - Child nodes: Visible only if parent is expanded
 * - Links: Visible only if both nodes are visible
 * - Aggregate links: Show when parent is collapsed, hide when expanded
 * - Direct child links: Show when parent is expanded, hide when collapsed
 *
 * @module sankeyData
 */

import type { SankeyNode, SankeyLink } from '$lib/types';

/**
 * Extended SankeyData with expand/collapse methods
 * This is the return type of createSankeyData()
 */
interface SankeyDataManager {
	nodes: SankeyNode[];
	links: SankeyLink[];
	expand: (node: SankeyNode) => void;
	collapse: (node: SankeyNode) => void;
}

/**
 * Creates expandable Sankey data manager
 *
 * Initial State:
 * - All nodes start collapsed (expanded: false)
 * - Shows top-level nodes (no parent) and their destinations
 * - Hides child nodes until parent is expanded
 *
 * @param initialNodes - All nodes in the hierarchy (including hidden children)
 * @param initialLinks - All possible links (including hidden connections)
 * @returns Manager object with visible nodes/links and expand/collapse methods
 *
 * @example
 * ```typescript
 * const manager = createSankeyData(allNodes, allLinks);
 * // Access visible data
 * console.log(manager.nodes, manager.links);
 * // Expand a node to show children
 * manager.expand(coalNode);
 * ```
 */
export function createSankeyData(
	initialNodes: SankeyNode[],
	initialLinks: SankeyLink[]
): SankeyDataManager {
	// Store complete data set
	const allNodes = initialNodes.map((n) => ({ ...n, expanded: false }));
	const allLinks = initialLinks;

	/**
	 * Get currently visible nodes based on expanded state
	 *
	 * Visibility Rules:
	 * 1. Top-level nodes (no parent): Always visible
	 * 2. Child nodes: Visible only if parent is expanded
	 *
	 * @returns Filtered array of visible nodes
	 */
	function getVisibleNodes(): SankeyNode[] {
		return allNodes.filter((node) => {
			// No parent = always visible
			if (!node.parent) return true;

			// Has parent: only visible if parent is expanded
			const parent = allNodes.find((n) => n.id === node.parent);
			return parent?.expanded === true;
		});
	}

	/**
	 * Get currently visible links based on expanded state
	 *
	 * Visibility Rules:
	 * 1. Both source and target nodes must be visible
	 * 2. Child links: Show when parent is expanded
	 * 3. Aggregate links: Show when parent is collapsed (skips children)
	 *
	 * This creates the expand/collapse effect where:
	 * - Collapsed: Shows aggregate flow from parent to destinations
	 * - Expanded: Shows detailed flows through children to destinations
	 *
	 * @returns Filtered array of visible links
	 */
	function getVisibleLinks(): SankeyLink[] {
		const visibleNodeIds = new Set(getVisibleNodes().map((n) => n.id));

		return allLinks.filter((link) => {
			// Both nodes must be visible
			if (!visibleNodeIds.has(link.source) || !visibleNodeIds.has(link.target)) {
				return false;
			}

			const sourceNode = allNodes.find((n) => n.id === link.source);
			const targetNode = allNodes.find((n) => n.id === link.target);

			// If source is expandable, apply special rules
			if (sourceNode?.expandable) {
				// Is this link going to a child of the source?
				const isChildLink = targetNode?.parent === link.source;

				// Is this an aggregate link (skipping children)?
				// Check if there are any children of source that could reach this target
				const hasChildrenThatReachTarget = allNodes.some((child) => {
					if (child.parent !== link.source) return false;
					return allLinks.some((l) => l.source === child.id && l.target === link.target);
				});

				if (isChildLink) {
					// Link to child: only show when expanded
					return sourceNode.expanded === true;
				} else if (hasChildrenThatReachTarget) {
					// Aggregate link: only show when NOT expanded
					return sourceNode.expanded !== true;
				}
			}

			// All other links show normally
			return true;
		});
	}

	// Create the data manager object with visible data and methods
	const data: SankeyDataManager = {
		nodes: getVisibleNodes(),
		links: getVisibleLinks(),

		/**
		 * Expand a node to show its children
		 *
		 * Sets the node's expanded flag to true, which makes child nodes visible
		 * and swaps aggregate links for detailed child links.
		 *
		 * @param node - The node to expand (must be expandable)
		 */
		expand(node: SankeyNode): void {
			const foundNode = allNodes.find((n) => n.id === node.id);
			if (foundNode && foundNode.expandable) {
				foundNode.expanded = true;
				data.nodes = getVisibleNodes();
				data.links = getVisibleLinks();
			}
		},

		/**
		 * Collapse a node to hide its children
		 *
		 * Sets the node's expanded flag to false, which hides child nodes
		 * and swaps detailed child links for aggregate links.
		 * Also recursively collapses all descendant nodes to prevent orphaned expanded states.
		 *
		 * @param node - The node to collapse (must be expandable)
		 */
		collapse(node: SankeyNode): void {
			const foundNode = allNodes.find((n) => n.id === node.id);
			if (foundNode && foundNode.expandable) {
				foundNode.expanded = false;

				// Recursively collapse all descendants
				const collapseDescendants = (parentId: string) => {
					const children = allNodes.filter((n) => n.parent === parentId);
					children.forEach((child) => {
						if (child.expandable) {
							child.expanded = false;
							collapseDescendants(child.id);
						}
					});
				};
				collapseDescendants(node.id);

				data.nodes = getVisibleNodes();
				data.links = getVisibleLinks();
			}
		}
	};

	return data;
}
