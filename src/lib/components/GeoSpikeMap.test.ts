/**
 * ============================================================
 * GeoSpikeMap Tests
 * ============================================================
 *
 * layerchart is replaced by the stubs in src/lib/testing/layerchart/
 * (with a predictable linear projection). We assert on spike height
 * scaling, north-to-south render order, positioning, colours, legend,
 * tooltip and keyboard/click activation.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { GeoDataPoint } from '$lib/types';
import { stubProjection } from '$lib/testing/layerchartMock';
import GeoSpikeMap from './GeoSpikeMap.svelte';
import source from './GeoSpikeMap.svelte?raw';

vi.mock('layerchart', async () => (await import('$lib/testing/layerchartMock')).layerchartModule);

const data: GeoDataPoint[] = [
	{ id: 'ldn', name: 'London', lat: 51.51, long: -0.13, value: 900 },
	{ id: 'edi', name: 'Edinburgh', lat: 55.95, long: -3.19, value: 100, category: 'capital' },
	{ id: 'mcr', name: 'Manchester', lat: 53.48, long: -2.24, value: 500, color: '#00ff00' }
];

/** Peak height is encoded as the `L 0,-h` segment of the spike path */
function spikeHeight(path: Element): number {
	const match = path.getAttribute('d')?.match(/L 0,(-?[\d.]+)/);
	return match ? -Number(match[1]) : NaN;
}

describe('GeoSpikeMap', () => {
	it('renders one labelled, focusable spike per point', () => {
		const { getAllByRole } = render(GeoSpikeMap, { props: { data } });
		const spikes = getAllByRole('button');
		expect(spikes).toHaveLength(3);
		spikes.forEach((s) => expect(s).toHaveAttribute('tabindex', '0'));
	});

	it('orders spikes north to south so southern spikes overlap northern ones', () => {
		const { getAllByRole } = render(GeoSpikeMap, { props: { data } });
		expect(getAllByRole('button').map((g) => g.getAttribute('aria-label'))).toEqual([
			'Edinburgh: 100',
			'Manchester: 500',
			'London: 900'
		]);
	});

	it('scales spike height linearly between min and max', () => {
		const { container } = render(GeoSpikeMap, { props: { data, minSpikeHeight: 10, maxSpikeHeight: 90 } });
		const heights = Array.from(container.querySelectorAll('path.spike')).map(spikeHeight);
		// Edinburgh (min), Manchester (midpoint), London (max)
		expect(heights[0]).toBeCloseTo(10);
		expect(heights[1]).toBeCloseTo(50);
		expect(heights[2]).toBeCloseTo(90);
	});

	it('respects spikeWidth in the triangle base', () => {
		const { container } = render(GeoSpikeMap, { props: { data, spikeWidth: 8 } });
		const d = container.querySelector('path.spike')?.getAttribute('d') ?? '';
		expect(d).toContain('L -4,0');
		expect(d).toContain('L 4,0');
	});

	it('anchors each spike at its projected coordinates', () => {
		const { getByRole } = render(GeoSpikeMap, { props: { data } });
		const [x, y] = stubProjection(-0.13, 51.51);
		const transform = getByRole('button', { name: 'London: 900' }).getAttribute('transform') ?? '';
		const [tx, ty] = transform.match(/-?[\d.]+/g)!.map(Number);
		expect(tx).toBeCloseTo(x);
		expect(ty).toBeCloseTo(y);
	});

	it('uses per-point colour for the outline and a unique gradient per instance', () => {
		const first = render(GeoSpikeMap, { props: { data, spikeColor: '#abcdef' } });
		const spikes = first.container.querySelectorAll('path.spike');
		expect(spikes[1].getAttribute('stroke')).toBe('#00ff00');
		expect(spikes[0].getAttribute('stroke')).toBe('#abcdef');
		const idA = first.container.querySelector('linearGradient')?.id;

		const second = render(GeoSpikeMap, { props: { data } });
		const idB = second.container.querySelector('linearGradient')?.id;
		expect(idA).toBeTruthy();
		expect(idA).not.toBe(idB);
	});

	it('shows min/max values in the height legend', () => {
		const { container } = render(GeoSpikeMap, { props: { data } });
		const labels = Array.from(container.querySelectorAll('.legend-item span')).map((s) => s.textContent);
		expect(labels).toEqual(['100', '900']);
	});

	it('shows a tooltip on hover and hides it on leave', async () => {
		const { getByRole, findByText, container } = render(GeoSpikeMap, { props: { data } });
		const edi = getByRole('button', { name: 'Edinburgh: 100' });
		await fireEvent.pointerMove(edi, { clientX: 5, clientY: 5 });
		expect(await findByText('capital')).toBeInTheDocument();

		await fireEvent.pointerLeave(edi);
		expect(container.querySelector('.tooltip')).toBeNull();
	});

	it('suppresses the tooltip when showTooltip is false', async () => {
		const { getByRole, container } = render(GeoSpikeMap, { props: { data, showTooltip: false } });
		await fireEvent.pointerMove(getByRole('button', { name: 'London: 900' }), { clientX: 5, clientY: 5 });
		expect(container.querySelector('.tooltip')).toBeNull();
	});

	it('fires onSpikeClick on click, Enter and Space', async () => {
		const onSpikeClick = vi.fn();
		const { getByRole } = render(GeoSpikeMap, { props: { data, onSpikeClick } });
		const mcr = getByRole('button', { name: 'Manchester: 500' });

		await fireEvent.click(mcr);
		await fireEvent.keyDown(mcr, { key: 'Enter' });
		await fireEvent.keyDown(mcr, { key: ' ' });
		expect(onSpikeClick).toHaveBeenCalledTimes(3);
		expect(onSpikeClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'mcr' }));
	});

	it('ships a visible focus ring and a reduced-motion hover rule', () => {
		expect(source).toMatch(/\.spike-group:focus-visible\)\s*\{\s*outline: 2px solid/);
		expect(source).toMatch(
			/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.geo-spike-map :global\(\.spike\)\s*\{\s*transition: none;/
		);
	});

	it('shows the tooltip on keyboard focus and hides it on blur', async () => {
		const { getByRole, container } = render(GeoSpikeMap, { props: { data } });
		const london = getByRole('button', { name: 'London: 900' });

		await fireEvent.focus(london);
		expect(container.querySelector('.tooltip')).toHaveTextContent('London');

		await fireEvent.blur(london);
		expect(container.querySelector('.tooltip')).toBeNull();
	});

});
