import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BarChart, { niceScale, computeRawMax } from './BarChart.svelte';

const categories = [
	{ label: 'Q1', values: [120, 80] },
	{ label: 'Q2', values: [150, 110] }
];
const series = [
	{ name: 'Online', colour: '#6366f1' },
	{ name: 'Retail', colour: '#10b981' }
];

describe('niceScale', () => {
	it('snaps the step to a 1/2/5 × 10ⁿ value and rounds max up', () => {
		const { max, step, ticks } = niceScale(150, 5);
		expect(step).toBe(50);
		expect(max).toBeGreaterThanOrEqual(150);
		expect(ticks[0]).toBe(0);
		expect(ticks).toContain(max);
	});

	it('guards against a non-positive max', () => {
		expect(niceScale(0, 5)).toEqual({ max: 1, step: 1, ticks: [0, 1] });
	});
});

describe('computeRawMax', () => {
	it('uses the largest single value in grouped mode', () => {
		expect(computeRawMax(categories, 'grouped')).toBe(150);
	});

	it('uses the tallest category total in stacked mode', () => {
		expect(computeRawMax(categories, 'stacked')).toBe(260);
	});
});

describe('BarChart render', () => {
	it('renders a bar per value as a focusable button', () => {
		const { container } = render(BarChart, { props: { categories, series } });
		const bars = container.querySelectorAll('rect.bar');
		expect(bars.length).toBe(4);
		expect(bars[0].getAttribute('tabindex')).toBe('0');
		expect(bars[0].getAttribute('role')).toBe('button');
	});

	it('gives each bar an aria-label naming category, series and value', () => {
		const { container } = render(BarChart, {
			props: { categories, series, valueFormat: (n: number) => `£${n}` }
		});
		const first = container.querySelector('rect.bar');
		expect(first?.getAttribute('aria-label')).toBe('Q1, Online: £120');
	});

	it('exposes an accessible data table with the title as caption', () => {
		const { container } = render(BarChart, {
			props: { categories, series, title: 'Sales by quarter' }
		});
		expect(container.querySelector('table caption')?.textContent).toBe('Sales by quarter');
		expect(container.querySelectorAll('table tbody tr').length).toBe(2);
	});

	it('hides the legend when showLegend is false', () => {
		const { container } = render(BarChart, {
			props: { categories, series, showLegend: false }
		});
		expect(container.querySelector('.legend')).toBeNull();
	});
});
