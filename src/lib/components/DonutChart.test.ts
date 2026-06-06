/**
 * ============================================================
 * DonutChart Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders one <circle> slice per data item (plus the donut track)
 *   ✓ Figure carries role="img" with an aria-label summarising the data
 *   ✓ Legend shows each label, value and computed percentage
 *   ✓ Centre label renders in donut mode
 *   ✓ Solid pie (thickness >= radius) hides the centre label
 *   ✓ Hovering a slice raises it (adds the active modifier)
 *   ✓ Each slice is keyboard-focusable and announces label + value
 *   ✓ Screen-reader fallback list mirrors the data
 *
 * Run:
 *   bun run test -- DonutChart
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import DonutChart from './DonutChart.svelte';

const data = [
	{ label: 'Direct', value: 50, colour: '#6366f1' },
	{ label: 'Search', value: 30, colour: '#22c55e' },
	{ label: 'Social', value: 20, colour: '#f97316' }
];

describe('DonutChart', () => {
	it('exposes a role="img" figure with an aria-label summary', () => {
		const { container } = render(DonutChart, { props: { data, centreLabel: '100' } });
		const svg = container.querySelector('svg[role="img"]');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('aria-label')).toContain('Direct');
		expect(svg?.getAttribute('aria-label')).toContain('Donut');
	});

	it('renders one slice circle per data item', () => {
		const { container } = render(DonutChart, { props: { data } });
		const slices = container.querySelectorAll('.donut__seg');
		expect(slices.length).toBe(3);
	});

	it('renders the legend with values and percentages', () => {
		const { getByText } = render(DonutChart, { props: { data } });
		expect(getByText('Direct')).toBeTruthy();
		// 50 of 100 -> 50%
		expect(getByText('50%')).toBeTruthy();
		expect(getByText('30%')).toBeTruthy();
	});

	it('shows the centre label in donut mode', () => {
		const { getByText } = render(DonutChart, {
			props: { data, centreLabel: 'Total', thickness: 20 }
		});
		expect(getByText('Total')).toBeTruthy();
	});

	it('hides the centre label when thickness makes a solid pie', () => {
		const { queryByText } = render(DonutChart, {
			props: { data, centreLabel: 'Total', size: 200, thickness: 200 }
		});
		expect(queryByText('Total')).toBeNull();
	});

	it('raises a slice on hover', async () => {
		const { container } = render(DonutChart, { props: { data } });
		const first = container.querySelector('.donut__seg') as SVGCircleElement;
		await fireEvent.mouseEnter(first);
		expect(first.classList.contains('donut__seg--active')).toBe(true);
	});

	it('makes each slice keyboard-focusable with a descriptive label', () => {
		const { container } = render(DonutChart, { props: { data } });
		const first = container.querySelector('.donut__seg') as SVGCircleElement;
		expect(first.getAttribute('tabindex')).toBe('0');
		expect(first.getAttribute('aria-label')).toContain('Direct');
		expect(first.getAttribute('aria-label')).toContain('50');
	});

	it('renders a screen-reader fallback list mirroring the data', () => {
		const { container } = render(DonutChart, { props: { data } });
		const items = container.querySelectorAll('.donut__sr li');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toContain('Direct');
	});
});
