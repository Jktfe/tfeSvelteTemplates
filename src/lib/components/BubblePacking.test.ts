/**
 * ============================================================
 * BubblePacking Tests
 * ============================================================
 *
 * These tests verify that BubblePacking renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - SVG structure is correct (container, circles)
 *   - Bubbles appear with correct structure
 *   - Labels render when enabled
 *   - Legend appears for multiple groups
 *   - Accessibility attributes are present
 *   - Tooltip appears on hover
 *
 * Note: Force simulation positioning is hard to test deterministically.
 * We focus on structure and accessibility. Full interaction testing
 * is done manually in the browser.
 *
 * Run these tests:
 *   bun run test                      - Run once
 *   bun run test:watch                - Watch mode
 *   bun run test -- BubblePacking     - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import BubblePacking from './BubblePacking.svelte';

// Sample data for testing
const sampleData = [
	{ id: '1', label: 'Apple', value: 100, group: 'Fruit' },
	{ id: '2', label: 'Banana', value: 80, group: 'Fruit' },
	{ id: '3', label: 'Carrot', value: 60, group: 'Vegetable' },
	{ id: '4', label: 'Broccoli', value: 40, group: 'Vegetable' }
];

// Single group data
const singleGroupData = [
	{ id: '1', label: 'Item A', value: 100, group: 'Group' },
	{ id: '2', label: 'Item B', value: 50, group: 'Group' }
];

describe('BubblePacking', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		expect(container).toBeTruthy();
	});

	// Should have container with correct class
	it('has container element', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const wrapper = container.querySelector('.bubble-packing-container');
		expect(wrapper).toBeInTheDocument();
	});

	// Should render an SVG element
	it('renders SVG element', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const svg = container.querySelector('svg.bubble-svg');
		expect(svg).toBeInTheDocument();
	});

	// Container should have role="region"
	it('container has role="region"', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
	});

	// Container should have aria-label
	it('container has aria-label', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[aria-label="Bubble packing visualization"]');
		expect(region).toBeInTheDocument();
	});

	// Should render bubble circles
	it('renders bubble circles', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const circles = container.querySelectorAll('.bubble-circle');
		expect(circles.length).toBe(4); // 4 data items
	});

	// Bubble circles should have role="button"
	it('circles have role="button"', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const buttons = container.querySelectorAll('.bubble-circle[role="button"]');
		expect(buttons.length).toBe(4);
	});

	// Circles should have aria-label
	it('circles have aria-label', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const circleWithLabel = container.querySelector('.bubble-circle[aria-label="Apple: 100"]');
		expect(circleWithLabel).toBeInTheDocument();
	});

	// Should render bubble groups
	it('renders bubble groups', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const groups = container.querySelectorAll('.bubble-group');
		expect(groups.length).toBe(4);
	});

	// Should render labels by default
	it('renders labels by default', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const labels = container.querySelectorAll('.bubble-label');
		expect(labels.length).toBeGreaterThan(0);
	});

	// Should hide labels when showLabels=false
	it('hides labels when showLabels=false', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData, showLabels: false }
		});
		const labels = container.querySelectorAll('.bubble-label');
		expect(labels.length).toBe(0);
	});

	// Should show legend for multiple groups
	it('shows legend for multiple groups', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const legend = container.querySelector('.legend');
		expect(legend).toBeInTheDocument();
	});

	// Legend should have items for each group
	it('legend has items for each group', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const legendItems = container.querySelectorAll('.legend-item');
		expect(legendItems.length).toBe(2); // Fruit and Vegetable
	});

	// Should hide legend for single group
	it('hides legend for single group', () => {
		const { container } = render(BubblePacking, {
			props: { data: singleGroupData }
		});
		const legend = container.querySelector('.legend');
		expect(legend).not.toBeInTheDocument();
	});

	// Should render with empty data
	it('renders with empty data', () => {
		const { container } = render(BubblePacking, {
			props: { data: [] }
		});
		expect(container).toBeTruthy();
		// Should have no circles
		const circles = container.querySelectorAll('.bubble-circle');
		expect(circles.length).toBe(0);
	});

	// Custom class should be applied
	it('applies custom class', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData, class: 'my-custom-class' }
		});
		const wrapper = container.querySelector('.bubble-packing-container.my-custom-class');
		expect(wrapper).toBeInTheDocument();
	});

	// Should apply custom dimensions
	it('applies custom width and height', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData, width: 400, height: 300 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '400');
		expect(svg).toHaveAttribute('height', '300');
	});

	// Tooltip should not be visible initially
	it('tooltip is hidden initially', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const tooltip = container.querySelector('.tooltip');
		expect(tooltip).not.toBeInTheDocument();
	});

	// Circles should be keyboard accessible
	it('circles are keyboard accessible', () => {
		const { container } = render(BubblePacking, {
			props: { data: sampleData }
		});
		const focusableCircles = container.querySelectorAll('.bubble-circle[tabindex="0"]');
		expect(focusableCircles.length).toBe(4);
	});
});
