/**
 * ============================================================
 * GeoBubbleMap Tests
 * ============================================================
 *
 * layerchart is replaced by the stubs in src/lib/testing/layerchart/
 * (with a predictable linear projection), so we can assert where each
 * bubble lands, how big it is, the render order, labels, legend,
 * tooltip and keyboard/click activation.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { GeoJSON } from 'geojson';
import type { GeoDataPoint } from '$lib/types';
import { stubProjection } from '$lib/testing/layerchartMock';
import GeoBubbleMap from './GeoBubbleMap.svelte';
import source from './GeoBubbleMap.svelte?raw';

vi.mock('layerchart', async () => (await import('$lib/testing/layerchartMock')).layerchartModule);

const data: GeoDataPoint[] = [
	{ id: 'bham', name: 'Birmingham', lat: 52.49, long: -1.89, value: 1_150_000 },
	{ id: 'ldn', name: 'London', lat: 51.51, long: -0.13, value: 8_900_000, category: 'capital' },
	{ id: 'mcr', name: 'Manchester', lat: 53.48, long: -2.24, value: 550_000, color: '#ff0000' }
];

function bubbles(container: HTMLElement): SVGCircleElement[] {
	return Array.from(container.querySelectorAll('circle.bubble'));
}

describe('GeoBubbleMap', () => {
	it('renders one focusable, labelled button per point', () => {
		const { getAllByRole } = render(GeoBubbleMap, { props: { data } });
		const groups = getAllByRole('button');
		expect(groups).toHaveLength(3);
		groups.forEach((g) => expect(g).toHaveAttribute('tabindex', '0'));
		expect(getAllByRole('button', { name: 'London: 8900000' })).toHaveLength(1);
	});

	it('draws largest bubbles first so small ones stay clickable on top', () => {
		const { getAllByRole } = render(GeoBubbleMap, { props: { data } });
		expect(getAllByRole('button').map((g) => g.getAttribute('aria-label')?.split(':')[0])).toEqual([
			'London',
			'Birmingham',
			'Manchester'
		]);
	});

	it('scales radius by square root between minRadius and maxRadius', () => {
		const { container } = render(GeoBubbleMap, { props: { data, minRadius: 5, maxRadius: 50 } });
		const radii = bubbles(container).map((c) => Number(c.getAttribute('r')));
		expect(radii[0]).toBeCloseTo(50); // London = max
		expect(radii[2]).toBeCloseTo(5); // Manchester = min
		expect(radii[1]).toBeGreaterThan(5);
		expect(radii[1]).toBeLessThan(50);
	});

	it('places each bubble at its projected coordinates', () => {
		const { container } = render(GeoBubbleMap, { props: { data } });
		const london = bubbles(container)[0];
		const [x, y] = stubProjection(-0.13, 51.51);
		expect(Number(london.getAttribute('cx'))).toBeCloseTo(x);
		expect(Number(london.getAttribute('cy'))).toBeCloseTo(y);
	});

	it('uses the per-point colour when given, otherwise bubbleColor', () => {
		const { container } = render(GeoBubbleMap, { props: { data, bubbleColor: 'rgb(1, 2, 3)' } });
		const [london, , manchester] = bubbles(container);
		expect(london.getAttribute('fill')).toBe('rgb(1, 2, 3)');
		expect(manchester.getAttribute('fill')).toBe('#ff0000');
	});

	it('shows labels only on bubbles large enough to hold them', () => {
		const { container } = render(GeoBubbleMap, { props: { data, showLabels: true, minRadius: 4, maxRadius: 40 } });
		const labels = Array.from(container.querySelectorAll('text.bubble-label')).map((t) => t.textContent?.trim());
		expect(labels).toContain('London');
		expect(labels).not.toContain('Manchester');
	});

	it('renders background geography only when geojson is supplied', () => {
		const geojson: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [{ type: 'Feature', id: 'gb', geometry: { type: 'Point', coordinates: [0, 52] }, properties: {} }]
		};
		const withGeo = render(GeoBubbleMap, { props: { data, geojson } });
		expect(withGeo.container.querySelectorAll('path.background')).toHaveLength(1);
		withGeo.unmount();

		const without = render(GeoBubbleMap, { props: { data } });
		expect(without.container.querySelector('path.background')).toBeNull();
	});

	it('shows min/max values in the size legend (en-GB formatted)', () => {
		const { getByText } = render(GeoBubbleMap, { props: { data } });
		expect(getByText('550,000')).toBeInTheDocument();
		expect(getByText('8,900,000')).toBeInTheDocument();
	});

	it('falls back to a 0–100 legend for empty data', () => {
		const { getByText, queryAllByRole } = render(GeoBubbleMap, { props: { data: [] } });
		expect(queryAllByRole('button')).toHaveLength(0);
		expect(getByText('0')).toBeInTheDocument();
		expect(getByText('100')).toBeInTheDocument();
	});

	it('shows a tooltip with value and category on hover', async () => {
		const { getByRole, findByText, container } = render(GeoBubbleMap, { props: { data } });
		const london = getByRole('button', { name: 'London: 8900000' });
		await fireEvent.pointerMove(london, { clientX: 10, clientY: 10 });
		expect(await findByText('capital')).toBeInTheDocument();
		expect(container.querySelector('.tooltip')).toHaveTextContent('London');

		await fireEvent.pointerLeave(london);
		expect(container.querySelector('.tooltip')).toBeNull();
	});

	it('fires onBubbleClick on click, Enter and Space', async () => {
		const onBubbleClick = vi.fn();
		const { getByRole } = render(GeoBubbleMap, { props: { data, onBubbleClick } });
		const bham = getByRole('button', { name: 'Birmingham: 1150000' });

		await fireEvent.click(bham);
		await fireEvent.keyDown(bham, { key: 'Enter' });
		await fireEvent.keyDown(bham, { key: ' ' });
		await fireEvent.keyDown(bham, { key: 'a' });
		expect(onBubbleClick).toHaveBeenCalledTimes(3);
		expect(onBubbleClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'bham' }));
	});

	it('ships a visible focus ring and a reduced-motion hover rule', () => {
		expect(source).toMatch(/\.bubble-group:focus-visible\)\s*\{\s*outline: 2px solid/);
		expect(source).toMatch(
			/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.geo-bubble-map :global\(\.bubble\)\s*\{\s*transition: none;/
		);
	});

	it('shows the tooltip on keyboard focus and hides it on blur', async () => {
		const { getByRole, container } = render(GeoBubbleMap, { props: { data } });
		const london = getByRole('button', { name: 'London: 8900000' });

		await fireEvent.focus(london);
		expect(container.querySelector('.tooltip')).toHaveTextContent('London');

		await fireEvent.blur(london);
		expect(container.querySelector('.tooltip')).toBeNull();
	});

});
