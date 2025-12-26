/**
 * ============================================================
 * ExpandableSankey Tests
 * ============================================================
 *
 * These tests verify that ExpandableSankey renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Container structure is correct
 *   - Props are applied correctly (height, class)
 *   - Unovis components are mounted
 *   - Accessibility attributes are present
 *
 * Note: ExpandableSankey uses Unovis which handles complex SVG rendering
 * internally. We focus on container structure and prop application.
 * Full interaction testing (click to expand) is best done manually
 * due to Unovis's internal event handling.
 *
 * Run these tests:
 *   bun run test                           - Run once
 *   bun run test:watch                     - Watch mode
 *   bun run test -- ExpandableSankey       - Just this file
 *
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ExpandableSankey from './ExpandableSankey.svelte';

// Sample data for testing - minimal hierarchical structure
const sampleNodes = [
	{ id: 'source', label: 'Source', color: '#6366f1' },
	{ id: 'category-a', label: 'Category A', color: '#8B4513', expandable: true },
	{ id: 'category-b', label: 'Category B', color: '#FFD700' },
	{ id: 'child-a1', label: 'Child A1', color: '#8B4513', parent: 'category-a' },
	{ id: 'destination', label: 'Destination', color: '#32CD32' }
];

const sampleLinks = [
	{ source: 'source', target: 'category-a', value: 30 },
	{ source: 'source', target: 'category-b', value: 20 },
	{ source: 'category-a', target: 'child-a1', value: 30 },
	{ source: 'category-a', target: 'destination', value: 30 },
	{ source: 'child-a1', target: 'destination', value: 30 },
	{ source: 'category-b', target: 'destination', value: 20 }
];

// Minimal data for edge case testing
const minimalNodes = [
	{ id: 'a', label: 'Node A', color: '#ff0000' },
	{ id: 'b', label: 'Node B', color: '#00ff00' }
];

const minimalLinks = [{ source: 'a', target: 'b', value: 100 }];

describe('ExpandableSankey', () => {
	// =========================================================================
	// Basic Rendering Tests
	// =========================================================================

	it('renders without crashing', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		expect(container).toBeTruthy();
	});

	it('renders with minimal data', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: minimalNodes, links: minimalLinks }
		});
		expect(container).toBeTruthy();
	});

	// =========================================================================
	// Container Structure Tests
	// =========================================================================

	it('has outer container div', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		const wrapper = container.querySelector('div');
		expect(wrapper).toBeInTheDocument();
	});

	it('container has sankey-container class', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		const wrapper = container.querySelector('.sankey-container');
		expect(wrapper).toBeInTheDocument();
	});

	it('container class enables horizontal scroll for mobile', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		// Verify the class is applied (CSS provides overflow-x: auto)
		const wrapper = container.querySelector('.sankey-container');
		expect(wrapper).toBeInTheDocument();
		expect(wrapper).toHaveClass('sankey-container');
	});

	// =========================================================================
	// Props Tests
	// =========================================================================

	it('applies default height of 600px', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveStyle('height: 600px');
	});

	it('applies custom height', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks, height: 400 }
		});
		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveStyle('height: 400px');
	});

	it('applies large custom height', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks, height: 800 }
		});
		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveStyle('height: 800px');
	});

	// =========================================================================
	// Unovis Integration Tests
	// =========================================================================

	it('mounts Unovis container component', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		// VisSingleContainer creates a div with class 'unovis-single-container'
		// or we can check for any nested structure from Unovis
		const innerDiv = container.querySelector('div div');
		expect(innerDiv).toBeInTheDocument();
	});

	// =========================================================================
	// Data Handling Tests
	// =========================================================================

	it('handles empty nodes array gracefully', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: [], links: [] }
		});
		expect(container).toBeTruthy();
	});

	it('handles nodes without expandable property', () => {
		const simpleNodes = [
			{ id: 'a', label: 'A', color: '#ff0000' },
			{ id: 'b', label: 'B', color: '#00ff00' }
		];
		const simpleLinks = [{ source: 'a', target: 'b', value: 50 }];

		const { container } = render(ExpandableSankey, {
			props: { nodes: simpleNodes, links: simpleLinks }
		});
		expect(container).toBeTruthy();
	});

	it('handles nodes without color property', () => {
		const noColorNodes = [
			{ id: 'a', label: 'A' },
			{ id: 'b', label: 'B' }
		];
		const simpleLinks = [{ source: 'a', target: 'b', value: 50 }];

		const { container } = render(ExpandableSankey, {
			props: { nodes: noColorNodes, links: simpleLinks }
		});
		expect(container).toBeTruthy();
	});

	// =========================================================================
	// CSS Class Tests
	// =========================================================================

	it('applies sankey-container class for styling', () => {
		const { container } = render(ExpandableSankey, {
			props: { nodes: sampleNodes, links: sampleLinks }
		});
		// CSS class provides: background, border, overflow-x styling
		const wrapper = container.querySelector('div.sankey-container');
		expect(wrapper).toBeInTheDocument();
	});
});

// =========================================================================
// sankeyData Factory Tests
// =========================================================================

import { createSankeyData } from './sankeyData';

describe('createSankeyData', () => {
	// Sample hierarchical data for testing the data manager
	const testNodes = [
		{ id: 'source', label: 'Source', color: '#000' },
		{ id: 'parent', label: 'Parent', color: '#111', expandable: true },
		{ id: 'child1', label: 'Child 1', color: '#222', parent: 'parent' },
		{ id: 'child2', label: 'Child 2', color: '#333', parent: 'parent' },
		{ id: 'dest', label: 'Destination', color: '#444' }
	];

	const testLinks = [
		{ source: 'source', target: 'parent', value: 100 },
		{ source: 'parent', target: 'child1', value: 60 },
		{ source: 'parent', target: 'child2', value: 40 },
		{ source: 'parent', target: 'dest', value: 100 }, // Aggregate link
		{ source: 'child1', target: 'dest', value: 60 },
		{ source: 'child2', target: 'dest', value: 40 }
	];

	it('creates data manager object', () => {
		const manager = createSankeyData(testNodes, testLinks);
		expect(manager).toBeTruthy();
		expect(manager.nodes).toBeDefined();
		expect(manager.links).toBeDefined();
		expect(manager.expand).toBeDefined();
		expect(manager.collapse).toBeDefined();
	});

	it('initially shows only top-level nodes', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const visibleIds = manager.nodes.map((n) => n.id);

		// Top-level nodes should be visible
		expect(visibleIds).toContain('source');
		expect(visibleIds).toContain('parent');
		expect(visibleIds).toContain('dest');

		// Child nodes should NOT be visible initially
		expect(visibleIds).not.toContain('child1');
		expect(visibleIds).not.toContain('child2');
	});

	it('all nodes start with expanded=false', () => {
		const manager = createSankeyData(testNodes, testLinks);
		manager.nodes.forEach((node) => {
			expect(node.expanded).toBe(false);
		});
	});

	it('expand() shows child nodes', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		// Expand the parent
		manager.expand(parentNode!);

		const visibleIds = manager.nodes.map((n) => n.id);

		// Now children should be visible
		expect(visibleIds).toContain('child1');
		expect(visibleIds).toContain('child2');
	});

	it('expand() sets expanded=true on the node', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		manager.expand(parentNode!);

		// The parent node in the updated nodes array should be expanded
		const updatedParent = manager.nodes.find((n) => n.id === 'parent');
		expect(updatedParent?.expanded).toBe(true);
	});

	it('collapse() hides child nodes', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		// Expand then collapse
		manager.expand(parentNode!);
		manager.collapse(parentNode!);

		const visibleIds = manager.nodes.map((n) => n.id);

		// Children should be hidden again
		expect(visibleIds).not.toContain('child1');
		expect(visibleIds).not.toContain('child2');
	});

	it('collapse() sets expanded=false on the node', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		manager.expand(parentNode!);
		manager.collapse(parentNode!);

		const updatedParent = manager.nodes.find((n) => n.id === 'parent');
		expect(updatedParent?.expanded).toBe(false);
	});

	it('expand() on non-expandable node does nothing', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const sourceNode = manager.nodes.find((n) => n.id === 'source');
		const initialNodeCount = manager.nodes.length;

		manager.expand(sourceNode!);

		// No change should occur
		expect(manager.nodes.length).toBe(initialNodeCount);
	});

	it('shows aggregate links when collapsed', () => {
		const manager = createSankeyData(testNodes, testLinks);

		// Should show the aggregate link (parent → dest)
		const aggregateLink = manager.links.find(
			(l) => l.source === 'parent' && l.target === 'dest'
		);
		expect(aggregateLink).toBeDefined();
	});

	it('hides aggregate links when expanded', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		manager.expand(parentNode!);

		// Aggregate link should be hidden
		const aggregateLink = manager.links.find(
			(l) => l.source === 'parent' && l.target === 'dest'
		);
		expect(aggregateLink).toBeUndefined();
	});

	it('shows child links when expanded', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		manager.expand(parentNode!);

		// Child links should be visible
		const child1Link = manager.links.find(
			(l) => l.source === 'child1' && l.target === 'dest'
		);
		const child2Link = manager.links.find(
			(l) => l.source === 'child2' && l.target === 'dest'
		);
		expect(child1Link).toBeDefined();
		expect(child2Link).toBeDefined();
	});

	it('hides child links when collapsed', () => {
		const manager = createSankeyData(testNodes, testLinks);
		const parentNode = manager.nodes.find((n) => n.id === 'parent');

		manager.expand(parentNode!);
		manager.collapse(parentNode!);

		// Child links should be hidden again
		const child1Link = manager.links.find(
			(l) => l.source === 'child1' && l.target === 'dest'
		);
		expect(child1Link).toBeUndefined();
	});

	// =========================================================================
	// Recursive Collapse Tests
	// =========================================================================

	it('collapse() recursively collapses descendants', () => {
		// Create nested hierarchy: grandparent → parent → child
		const nestedNodes = [
			{ id: 'gp', label: 'Grandparent', color: '#000', expandable: true },
			{ id: 'p', label: 'Parent', color: '#111', expandable: true, parent: 'gp' },
			{ id: 'c', label: 'Child', color: '#222', parent: 'p' },
			{ id: 'dest', label: 'Dest', color: '#333' }
		];
		const nestedLinks = [
			{ source: 'gp', target: 'p', value: 100 },
			{ source: 'p', target: 'c', value: 100 },
			{ source: 'c', target: 'dest', value: 100 }
		];

		const manager = createSankeyData(nestedNodes, nestedLinks);

		// Expand grandparent, then parent
		const gpNode = manager.nodes.find((n) => n.id === 'gp');
		manager.expand(gpNode!);

		const pNode = manager.nodes.find((n) => n.id === 'p');
		manager.expand(pNode!);

		// Now collapse grandparent - should also collapse parent
		manager.collapse(gpNode!);

		// Re-expand grandparent
		manager.expand(gpNode!);

		// Parent should NOT be expanded (it was recursively collapsed)
		const updatedP = manager.nodes.find((n) => n.id === 'p');
		expect(updatedP?.expanded).toBe(false);

		// Child should not be visible (parent is collapsed)
		const visibleIds = manager.nodes.map((n) => n.id);
		expect(visibleIds).not.toContain('c');
	});
});
