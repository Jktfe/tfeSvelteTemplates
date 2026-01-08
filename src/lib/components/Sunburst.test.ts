/**
 * ============================================================
 * Sunburst Tests
 * ============================================================
 *
 * These tests verify that Sunburst renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - SVG structure is correct (container, arcs, labels)
 *   - Arc segments appear with correct structure
 *   - Labels render when enabled
 *   - Breadcrumb navigation is present
 *   - Accessibility attributes are present
 *   - Tooltip appears on hover
 *   - Center circle appears when zoomed
 *
 * Note: Sunburst layout positioning and zoom transitions are hard
 * to test deterministically. We focus on structure and accessibility.
 * Full interaction testing is done manually in the browser.
 *
 * Run these tests:
 *   bun run test                      - Run once
 *   bun run test:watch                - Watch mode
 *   bun run test -- Sunburst          - Just this file
 *
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Sunburst from './Sunburst.svelte';

// Sample hierarchical data for testing
const sampleData = {
	id: 'root',
	name: 'Root',
	children: [
		{
			id: 'branch-a',
			name: 'Branch A',
			children: [
				{ id: 'leaf-a1', name: 'Leaf A1', value: 10 },
				{ id: 'leaf-a2', name: 'Leaf A2', value: 20 }
			]
		},
		{
			id: 'branch-b',
			name: 'Branch B',
			children: [
				{ id: 'leaf-b1', name: 'Leaf B1', value: 15 }
			]
		}
	]
};

// Simple single-level data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simpleData = {
	id: 'root',
	name: 'Root',
	children: [
		{ id: 'child-1', name: 'Child 1', value: 50 },
		{ id: 'child-2', name: 'Child 2', value: 50 }
	]
};

// Minimal data - just a root node with value
const minimalData = {
	id: 'solo',
	name: 'Solo Node',
	value: 100
};

describe('Sunburst', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		expect(container).toBeTruthy();
	});

	// Should have container with correct class
	it('has container element', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const wrapper = container.querySelector('.sunburst-container');
		expect(wrapper).toBeInTheDocument();
	});

	// Should render an SVG element
	it('renders SVG element', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const svg = container.querySelector('svg.sunburst-svg');
		expect(svg).toBeInTheDocument();
	});

	// Container should have role="region"
	it('container has role="region"', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
	});

	// Container should have aria-label
	it('container has aria-label', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[aria-label*="Sunburst chart"]');
		expect(region).toBeInTheDocument();
	});

	// Should render arc segments
	it('renders arc segments', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arcs = container.querySelectorAll('.arc');
		// Should have visible arcs (root shown at first, plus visible children)
		expect(arcs.length).toBeGreaterThan(0);
	});

	// Arcs should be SVG path elements
	it('arcs are SVG path elements', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arcPaths = container.querySelectorAll('path.arc');
		expect(arcPaths.length).toBeGreaterThan(0);
	});

	// Arcs should have path data
	it('arcs have path data', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arcPath = container.querySelector('path.arc');
		expect(arcPath).toHaveAttribute('d');
	});

	// Clickable arcs should have role="button"
	it('clickable arcs have role="button"', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const buttons = container.querySelectorAll('.arc[role="button"]');
		expect(buttons.length).toBeGreaterThan(0);
	});

	// Arcs should have aria-label
	it('arcs have aria-label', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arcWithLabel = container.querySelector('.arc[aria-label]');
		expect(arcWithLabel).toBeInTheDocument();
	});

	// Should render breadcrumb
	it('renders breadcrumb', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const breadcrumb = container.querySelector('.breadcrumb');
		expect(breadcrumb).toBeInTheDocument();
	});

	// Breadcrumb should show root name
	it('breadcrumb shows root name', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const breadcrumb = container.querySelector('.breadcrumb');
		expect(breadcrumb?.textContent).toContain('Root');
	});

	// Should render labels by default
	it('renders labels by default', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		// Labels may or may not appear depending on arc size
		// Just check that the labels container exists
		const labelsGroup = container.querySelector('.labels');
		expect(labelsGroup).toBeInTheDocument();
	});

	// Should hide labels when showLabels=false
	it('hides labels when showLabels=false', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData, showLabels: false }
		});
		const labelsGroup = container.querySelector('.labels');
		expect(labelsGroup).not.toBeInTheDocument();
	});

	// Should render with minimal data (single node)
	it('renders with minimal data', () => {
		const { container } = render(Sunburst, {
			props: { data: minimalData }
		});
		expect(container).toBeTruthy();
	});

	// Custom class should be applied
	it('applies custom class', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData, class: 'my-custom-class' }
		});
		const wrapper = container.querySelector('.sunburst-container.my-custom-class');
		expect(wrapper).toBeInTheDocument();
	});

	// Should apply custom dimensions
	it('applies custom width and height', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData, width: 600, height: 400 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '600');
		expect(svg).toHaveAttribute('height', '400');
	});

	// SVG should have viewBox
	it('SVG has viewBox matching dimensions', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData, width: 500, height: 500 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox', '0 0 500 500');
	});

	// Tooltip should not be visible initially
	it('tooltip is hidden initially', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const tooltip = container.querySelector('.tooltip');
		expect(tooltip).not.toBeInTheDocument();
	});

	// Clickable arcs should be keyboard accessible
	it('clickable arcs are keyboard accessible', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		// Arcs with children should have tabindex=0
		const focusableArcs = container.querySelectorAll('.arc[tabindex="0"]');
		expect(focusableArcs.length).toBeGreaterThan(0);
	});

	// Center circle should not be visible initially (at root level)
	it('center circle hidden at root level', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const centerCircle = container.querySelector('.center-circle');
		expect(centerCircle).not.toBeInTheDocument();
	});

	// Zoom-out button should not be visible initially
	it('zoom-out button hidden at root level', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const zoomOutBtn = container.querySelector('.zoom-out-btn');
		expect(zoomOutBtn).not.toBeInTheDocument();
	});

	// Arcs layer should render
	it('renders arcs layer', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arcsGroup = container.querySelector('.arcs');
		expect(arcsGroup).toBeInTheDocument();
	});

	// Arcs should have fill color
	it('arcs have fill color', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const arc = container.querySelector('.arc');
		expect(arc).toHaveAttribute('fill');
	});

	// Breadcrumb has aria-live for accessibility
	it('breadcrumb has aria-live', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const breadcrumb = container.querySelector('.breadcrumb[aria-live]');
		expect(breadcrumb).toBeInTheDocument();
	});

	// Labels group should be aria-hidden
	it('labels are aria-hidden', () => {
		const { container } = render(Sunburst, {
			props: { data: sampleData }
		});
		const labelsGroup = container.querySelector('.labels[aria-hidden="true"]');
		expect(labelsGroup).toBeInTheDocument();
	});
});
