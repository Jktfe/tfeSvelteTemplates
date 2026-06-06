/**
 * ============================================================
 * Sparkline Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders an SVG with role="img"
 *   ✓ Draws a polyline for a multi-point series
 *   ✓ Computes a trend-summary aria-label (direction + percentage)
 *   ✓ Prefixes the aria-label with the label prop
 *   ✓ Reads "No data" for an empty series
 *   ✓ Reads "Single value" for a one-point series and draws a dot
 *   ✓ Filters out non-finite values before plotting
 *   ✓ Renders the area path when fill is set
 *
 * Run:
 *   bun run test -- Sparkline
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Sparkline from './Sparkline.svelte';

describe('Sparkline', () => {
	it('renders an SVG with role="img"', () => {
		const { container } = render(Sparkline, { props: { data: [1, 2, 3] } });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('role')).toBe('img');
	});

	it('draws a polyline for a multi-point series', () => {
		const { container } = render(Sparkline, { props: { data: [1, 5, 3, 8] } });
		const line = container.querySelector('polyline');
		expect(line).toBeTruthy();
		// Four points → four space-separated "x,y" pairs.
		expect(line?.getAttribute('points')?.trim().split(/\s+/).length).toBe(4);
	});

	it('computes a trend-summary aria-label with direction and percentage', () => {
		const { container } = render(Sparkline, { props: { data: [10, 20] } });
		const label = container.querySelector('svg')?.getAttribute('aria-label') ?? '';
		expect(label).toContain('up');
		expect(label).toContain('from 10 to 20');
		expect(label).toContain('+100.0%');
	});

	it('prefixes the aria-label with the label prop', () => {
		const { container } = render(Sparkline, { props: { data: [4, 8], label: 'Revenue' } });
		const label = container.querySelector('svg')?.getAttribute('aria-label') ?? '';
		expect(label.startsWith('Revenue:')).toBe(true);
	});

	it('reads "No data" for an empty series', () => {
		const { container } = render(Sparkline, { props: { data: [] } });
		expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('No data');
		expect(container.querySelector('polyline')).toBeNull();
	});

	it('reads "Single value" and draws a dot for a one-point series', () => {
		const { container } = render(Sparkline, { props: { data: [42] } });
		const label = container.querySelector('svg')?.getAttribute('aria-label') ?? '';
		expect(label).toBe('Single value 42');
		expect(container.querySelector('circle')).toBeTruthy();
		expect(container.querySelector('polyline')).toBeNull();
	});

	it('filters out non-finite values before plotting', () => {
		const { container } = render(Sparkline, {
			props: { data: [1, NaN, 3, Infinity, 5] }
		});
		const line = container.querySelector('polyline');
		// Only the three finite readings survive.
		expect(line?.getAttribute('points')?.trim().split(/\s+/).length).toBe(3);
	});

	it('renders the area path when fill is set', () => {
		const { container } = render(Sparkline, { props: { data: [2, 6, 4, 9], fill: true } });
		expect(container.querySelector('path.sparkline__area')).toBeTruthy();
	});
});
