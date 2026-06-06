/**
 * ============================================================
 * LineChart Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders an SVG line path per series
 *   ✓ Exposes role="img" with an accessible label
 *   ✓ Renders the visually-hidden data-table fallback with every point
 *   ✓ Renders a legend entry per series
 *   ✓ Keyboard ArrowRight activates the crosshair + tooltip
 *   ✓ Escape clears the crosshair
 *   ✓ Shows the empty-state message when given no series
 *
 * Run:
 *   bun run test -- LineChart
 * ============================================================
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LineChart from './LineChart.svelte';

const series = [
	{ name: 'Revenue', colour: '#4f7cff', points: [
		{ x: 1, y: 10 },
		{ x: 2, y: 18 },
		{ x: 3, y: 14 }
	] },
	{ name: 'Costs', colour: '#ff6b6b', points: [
		{ x: 1, y: 6 },
		{ x: 2, y: 9 },
		{ x: 3, y: 7 }
	] }
];

beforeAll(() => {
	// jsdom has no ResizeObserver — the component observes the container width.
	if (!('ResizeObserver' in globalThis)) {
		(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}
});

describe('LineChart', () => {
	it('renders one SVG path per series', () => {
		const { container } = render(LineChart, { props: { series } });
		expect(container.querySelectorAll('path.lc-line').length).toBe(2);
	});

	it('exposes an interactive role with an accessible label and is focusable', () => {
		const { getByRole } = render(LineChart, { props: { series } });
		const region = getByRole('application');
		expect(region.getAttribute('aria-label')).toContain('Revenue');
		expect(region.getAttribute('aria-label')).toContain('Costs');
		expect(region.getAttribute('tabindex')).toBe('0');
	});

	it('renders a visually-hidden data table mirroring the points', () => {
		const { container } = render(LineChart, { props: { series, xLabel: 'Quarter' } });
		const table = container.querySelector('.lc-sr-only table');
		expect(table).toBeTruthy();
		// 3 distinct x-values → 3 body rows.
		expect(table?.querySelectorAll('tbody tr').length).toBe(3);
	});

	it('renders a legend entry per series', () => {
		const { container } = render(LineChart, { props: { series } });
		expect(container.querySelectorAll('.lc-legend-item').length).toBe(2);
	});

	it('activates the crosshair tooltip on ArrowRight and clears on Escape', async () => {
		const { container, getByRole } = render(LineChart, { props: { series } });
		const plot = getByRole('application');
		await fireEvent.keyDown(plot, { key: 'ArrowRight' });
		expect(container.querySelector('.lc-tooltip')).toBeTruthy();
		expect(container.querySelector('line.lc-crosshair')).toBeTruthy();
		await fireEvent.keyDown(plot, { key: 'Escape' });
		expect(container.querySelector('.lc-tooltip')).toBeNull();
	});

	it('shows the empty-state message when given no series', () => {
		const { getByText } = render(LineChart, { props: { series: [] } });
		expect(getByText('No data to display.')).toBeTruthy();
	});
});
