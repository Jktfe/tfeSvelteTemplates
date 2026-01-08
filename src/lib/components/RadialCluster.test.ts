/**
 * ============================================================
 * RadialCluster Tests
 * ============================================================
 *
 * These tests verify that RadialCluster renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - SVG structure is correct (container, nodes, links)
 *   - Nodes appear with correct structure
 *   - Labels render when enabled
 *   - Links connect nodes properly
 *   - Accessibility attributes are present
 *   - Tooltip appears on hover
 *
 * Note: Radial layout positioning is hard to test deterministically.
 * We focus on structure and accessibility. Full interaction testing
 * is done manually in the browser.
 *
 * Run these tests:
 *   bun run test                      - Run once
 *   bun run test:watch                - Watch mode
 *   bun run test -- RadialCluster     - Just this file
 *
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import RadialCluster from './RadialCluster.svelte';

// Sample hierarchical data for testing
const sampleData = {
	name: 'Root',
	children: [
		{
			name: 'Branch A',
			children: [
				{ name: 'Leaf A1' },
				{ name: 'Leaf A2' }
			]
		},
		{
			name: 'Branch B',
			children: [
				{ name: 'Leaf B1' }
			]
		}
	]
};

// Simple single-level data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simpleData = {
	name: 'Root',
	children: [
		{ name: 'Child 1' },
		{ name: 'Child 2' }
	]
};

// Minimal data - just a root node
const minimalData = {
	name: 'Solo Node'
};

describe('RadialCluster', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		expect(container).toBeTruthy();
	});

	// Should have container with correct class
	it('has container element', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const wrapper = container.querySelector('.radial-cluster-container');
		expect(wrapper).toBeInTheDocument();
	});

	// Should render an SVG element
	it('renders SVG element', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const svg = container.querySelector('svg.radial-cluster-svg');
		expect(svg).toBeInTheDocument();
	});

	// Container should have role="img"
	it('container has role="img"', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const img = container.querySelector('[role="img"]');
		expect(img).toBeInTheDocument();
	});

	// Container should have aria-label
	it('container has aria-label', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[aria-label*="Radial cluster diagram"]');
		expect(region).toBeInTheDocument();
	});

	// Should render node groups
	it('renders node groups', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const nodes = container.querySelectorAll('.node');
		// sampleData has: Root + Branch A + Branch B + Leaf A1 + Leaf A2 + Leaf B1 = 6 nodes
		expect(nodes.length).toBe(6);
	});

	// Node circles should be rendered
	it('renders node circles', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const circles = container.querySelectorAll('.node-circle');
		expect(circles.length).toBe(6);
	});

	// Nodes should have role="button"
	it('nodes have role="button"', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const buttons = container.querySelectorAll('.node[role="button"]');
		expect(buttons.length).toBe(6);
	});

	// Nodes should have aria-label
	it('nodes have aria-label', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const nodeWithLabel = container.querySelector('.node[aria-label="Root"]');
		expect(nodeWithLabel).toBeInTheDocument();
	});

	// Leaf nodes should indicate leaf status in aria-label
	it('leaf nodes indicate leaf status', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const leafNode = container.querySelector('.node[aria-label="Leaf A1 (leaf)"]');
		expect(leafNode).toBeInTheDocument();
	});

	// Should render links
	it('renders links between nodes', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const links = container.querySelectorAll('.link');
		// Links: Root->BranchA, Root->BranchB, BranchA->LeafA1, BranchA->LeafA2, BranchB->LeafB1 = 5 links
		expect(links.length).toBe(5);
	});

	// Links should be SVG path elements
	it('links are SVG path elements', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const linkPaths = container.querySelectorAll('path.link');
		expect(linkPaths.length).toBe(5);
	});

	// Links should have path data
	it('links have path data', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const linkPath = container.querySelector('path.link');
		expect(linkPath).toHaveAttribute('d');
		// Path should contain Bézier curve command (C)
		const pathData = linkPath?.getAttribute('d') || '';
		expect(pathData).toContain('M');
		expect(pathData).toContain('C');
	});

	// Should render labels by default
	it('renders labels by default', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const labels = container.querySelectorAll('.label');
		expect(labels.length).toBe(6);
	});

	// Should hide labels when showLabels=false
	it('hides labels when showLabels=false', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData, showLabels: false }
		});
		const labels = container.querySelectorAll('.label');
		expect(labels.length).toBe(0);
	});

	// Labels should contain node names
	it('labels contain node names', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const labels = container.querySelectorAll('.label tspan');
		const labelTexts = Array.from(labels).map(l => l.textContent);
		expect(labelTexts).toContain('Root');
		expect(labelTexts).toContain('Branch A');
		expect(labelTexts).toContain('Leaf A1');
	});

	// Should render with minimal data (single node)
	it('renders with minimal data', () => {
		const { container } = render(RadialCluster, {
			props: { data: minimalData }
		});
		expect(container).toBeTruthy();
		const nodes = container.querySelectorAll('.node');
		expect(nodes.length).toBe(1);
	});

	// Minimal data should have no links
	it('single node has no links', () => {
		const { container } = render(RadialCluster, {
			props: { data: minimalData }
		});
		const links = container.querySelectorAll('.link');
		expect(links.length).toBe(0);
	});

	// Custom class should be applied
	it('applies custom class', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData, class: 'my-custom-class' }
		});
		const wrapper = container.querySelector('.radial-cluster-container.my-custom-class');
		expect(wrapper).toBeInTheDocument();
	});

	// Should apply custom dimensions
	it('applies custom width and height', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData, width: 600, height: 500 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '600');
		expect(svg).toHaveAttribute('height', '500');
	});

	// SVG should have viewBox
	it('SVG has viewBox matching dimensions', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData, width: 800, height: 800 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox', '0 0 800 800');
	});

	// Tooltip should not be visible initially
	it('tooltip is hidden initially', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const tooltip = container.querySelector('.tooltip');
		expect(tooltip).not.toBeInTheDocument();
	});

	// Nodes should be keyboard accessible
	it('nodes are keyboard accessible', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const focusableNodes = container.querySelectorAll('.node[tabindex="0"]');
		expect(focusableNodes.length).toBe(6);
	});

	// Links layer should render before nodes (so nodes appear on top)
	it('renders links layer before nodes layer', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const svg = container.querySelector('svg');
		const groups = svg?.querySelectorAll(':scope > g');
		// First group should be links, second should be nodes
		expect(groups?.[0]).toHaveClass('links');
		expect(groups?.[1]).toHaveClass('nodes');
	});

	// Labels layer should be last (rendered on top)
	it('renders labels layer last', () => {
		const { container } = render(RadialCluster, {
			props: { data: sampleData }
		});
		const svg = container.querySelector('svg');
		const groups = svg?.querySelectorAll(':scope > g');
		// Third group should be labels
		expect(groups?.[2]).toHaveClass('labels');
	});
});
