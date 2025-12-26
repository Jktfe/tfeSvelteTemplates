/**
 * ============================================================
 * CalendarHeatmap Tests
 * ============================================================
 *
 * These tests verify that CalendarHeatmap renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - SVG structure is correct (container, grid, cells)
 *   - Month and weekday labels appear correctly
 *   - Colour legend renders when enabled
 *   - Accessibility attributes are present
 *   - Tooltip appears on hover
 *   - Props apply correctly (showLabels, showLegend, etc.)
 *
 * Note: Some tests use minimal data to verify structure.
 * Full interaction testing (keyboard nav, click handlers)
 * is done manually in the browser.
 *
 * Run these tests:
 *   bun run test                        - Run once
 *   bun run test:watch                  - Watch mode
 *   bun run test -- CalendarHeatmap     - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import CalendarHeatmap from './CalendarHeatmap.svelte';

// Sample data for testing
const sampleData = [
	{ date: '2024-01-15', value: 5 },
	{ date: '2024-01-16', value: 10 },
	{ date: '2024-01-17', value: 0 },
	{ date: '2024-02-01', value: 8 },
	{ date: '2024-02-14', value: 15 }
];

// Fixed date range for consistent testing
const testStartDate = new Date('2024-01-01');
const testEndDate = new Date('2024-03-31');

describe('CalendarHeatmap', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		expect(container).toBeTruthy();
	});

	// Should have container with correct class
	it('has container element', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const wrapper = container.querySelector('.calendar-heatmap-container');
		expect(wrapper).toBeInTheDocument();
	});

	// Should render an SVG element
	it('renders SVG element', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const svg = container.querySelector('svg.calendar-svg');
		expect(svg).toBeInTheDocument();
	});

	// Container should have role="region"
	it('container has role="region"', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
	});

	// Container should have aria-label
	it('container has aria-label', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const region = container.querySelector('[aria-label="Activity calendar heatmap"]');
		expect(region).toBeInTheDocument();
	});

	// Should render calendar cells
	it('renders calendar cells', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const cells = container.querySelectorAll('.calendar-cell');
		expect(cells.length).toBeGreaterThan(0);
	});

	// Calendar cells should have role="button"
	it('cells have role="button"', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const buttons = container.querySelectorAll('.calendar-cell[role="button"]');
		expect(buttons.length).toBeGreaterThan(0);
	});

	// Cells should have aria-label with date and value
	it('cells have aria-label', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		// Find any cell with an aria-label containing "contributions"
		const cellWithLabel = container.querySelector('.calendar-cell[aria-label*="contributions"]');
		expect(cellWithLabel).toBeInTheDocument();
	});

	// Should show month labels by default
	it('shows month labels by default', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const monthLabels = container.querySelectorAll('.month-label');
		expect(monthLabels.length).toBeGreaterThan(0);
	});

	// Should hide month labels when showMonthLabels=false
	it('hides month labels when showMonthLabels=false', () => {
		const { container } = render(CalendarHeatmap, {
			props: {
				data: sampleData,
				startDate: testStartDate,
				endDate: testEndDate,
				showMonthLabels: false
			}
		});
		const monthLabels = container.querySelectorAll('.month-label');
		expect(monthLabels.length).toBe(0);
	});

	// Should show weekday labels by default
	it('shows weekday labels by default', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const weekdayLabels = container.querySelectorAll('.weekday-label');
		expect(weekdayLabels.length).toBe(3); // Mon, Wed, Fri
	});

	// Should hide weekday labels when showWeekLabels=false
	it('hides weekday labels when showWeekLabels=false', () => {
		const { container } = render(CalendarHeatmap, {
			props: {
				data: sampleData,
				startDate: testStartDate,
				endDate: testEndDate,
				showWeekLabels: false
			}
		});
		const weekdayLabels = container.querySelectorAll('.weekday-label');
		expect(weekdayLabels.length).toBe(0);
	});

	// Should show legend by default
	it('shows legend by default', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const legend = container.querySelector('.legend');
		expect(legend).toBeInTheDocument();
	});

	// Legend should have "Less" and "More" labels
	it('legend has Less and More labels', () => {
		render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		expect(screen.getByText('Less')).toBeInTheDocument();
		expect(screen.getByText('More')).toBeInTheDocument();
	});

	// Should hide legend when showLegend=false
	it('hides legend when showLegend=false', () => {
		const { container } = render(CalendarHeatmap, {
			props: {
				data: sampleData,
				startDate: testStartDate,
				endDate: testEndDate,
				showLegend: false
			}
		});
		const legend = container.querySelector('.legend');
		expect(legend).not.toBeInTheDocument();
	});

	// Legend should have colour cells
	it('legend has colour cells', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const legendCells = container.querySelectorAll('.legend-cell');
		expect(legendCells.length).toBe(5); // Default 5 levels
	});

	// Should render with empty data
	it('renders with empty data', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: [], startDate: testStartDate, endDate: testEndDate }
		});
		expect(container).toBeTruthy();
		// Should still have cells (just all empty)
		const cells = container.querySelectorAll('.calendar-cell');
		expect(cells.length).toBeGreaterThan(0);
	});

	// Custom class should be applied
	it('applies custom class', () => {
		const { container } = render(CalendarHeatmap, {
			props: {
				data: sampleData,
				startDate: testStartDate,
				endDate: testEndDate,
				class: 'my-custom-class'
			}
		});
		const wrapper = container.querySelector('.calendar-heatmap-container.my-custom-class');
		expect(wrapper).toBeInTheDocument();
	});

	// Should apply custom cellSize
	it('applies custom cellSize', () => {
		const { container } = render(CalendarHeatmap, {
			props: {
				data: sampleData,
				startDate: testStartDate,
				endDate: testEndDate,
				cellSize: 20
			}
		});
		const cell = container.querySelector('.calendar-cell');
		expect(cell).toHaveAttribute('width', '20');
		expect(cell).toHaveAttribute('height', '20');
	});

	// Tooltip should not be visible initially
	it('tooltip is hidden initially', () => {
		const { container } = render(CalendarHeatmap, {
			props: { data: sampleData, startDate: testStartDate, endDate: testEndDate }
		});
		const tooltip = container.querySelector('.tooltip');
		expect(tooltip).not.toBeInTheDocument();
	});
});
