/**
 * ============================================================
 * GeoChoropleth Tests
 * ============================================================
 *
 * layerchart is replaced by the stubs in src/lib/testing/layerchart/
 * so each region renders as a plain <path> we can inspect. Covers
 * ONS region-id lookup across year-suffixed property names, colour
 * scale selection, the no-data grey, legend, tooltip, callbacks and
 * the reduced-motion hover rule.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import type { GeoJSON } from 'geojson';
import type { GeoRegionData } from '$lib/types';
import GeoChoropleth from './GeoChoropleth.svelte';
import source from './GeoChoropleth.svelte?raw';

vi.mock('layerchart', async () => (await import('$lib/testing/layerchartMock')).layerchartModule);

function square(x: number): GeoJSON.Polygon {
	return {
		type: 'Polygon',
		coordinates: [
			[
				[x, 51],
				[x + 1, 51],
				[x + 1, 52],
				[x, 52],
				[x, 51]
			]
		]
	};
}

const geojson: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{ type: 'Feature', id: 'ne', geometry: square(0), properties: { RGN24CD: 'E12000001', RGN24NM: 'North East' } },
		{ type: 'Feature', id: 'nw', geometry: square(1), properties: { RGN23CD: 'E12000002', RGN23NM: 'North West' } },
		{ type: 'Feature', id: 'yh', geometry: square(2), properties: { RGN22CD: 'E12000003', RGN22NM: 'Yorkshire' } },
		{ type: 'Feature', id: 'wa', geometry: square(3), properties: { CTRY22CD: 'W92000004', CTRY22NM: 'Wales' } }
	]
};

const data: GeoRegionData[] = [
	{ regionId: 'E12000001', value: 10, label: '10 per 1,000' },
	{ regionId: 'E12000002', value: 30 },
	{ regionId: 'E12000003', value: 50 }
];

function regionPath(container: HTMLElement, id: string): SVGPathElement {
	return container.querySelector(`path.region[data-feature-id="${id}"]`) as SVGPathElement;
}

describe('GeoChoropleth', () => {
	it('renders one region path per feature at the requested height', () => {
		const { container } = render(GeoChoropleth, { props: { geojson, data, height: 420, class: 'my-map' } });
		expect(container.querySelectorAll('path.region')).toHaveLength(4);
		const root = container.querySelector('.geo-choropleth') as HTMLElement;
		expect(root.style.height).toBe('420px');
		expect(root.classList.contains('my-map')).toBe(true);
	});

	it('looks up values across RGN24 / RGN23 / RGN22 codes and greys out regions without data', () => {
		const { container } = render(GeoChoropleth, { props: { geojson, data } });
		const fills = ['ne', 'nw', 'yh'].map((id) => regionPath(container, id).getAttribute('fill'));
		expect(new Set(fills).size).toBe(3);
		fills.forEach((fill) => expect(fill).not.toBe('#e5e7eb'));
		expect(regionPath(container, 'wa').getAttribute('fill')).toBe('#e5e7eb');
	});

	it('interpolates a custom colour array end-to-end', () => {
		const { container } = render(GeoChoropleth, {
			props: { geojson, data, colorScale: { type: 'sequential', colors: ['#000000', '#ffffff'] } }
		});
		expect(regionPath(container, 'ne').getAttribute('fill')).toBe('rgb(0, 0, 0)');
		expect(regionPath(container, 'yh').getAttribute('fill')).toBe('rgb(255, 255, 255)');
		expect(regionPath(container, 'nw').getAttribute('fill')).toBe('rgb(128, 128, 128)');
	});

	it('respects an explicit colour domain', () => {
		const { getByText } = render(GeoChoropleth, {
			props: { geojson, data, colorScale: { type: 'sequential', colors: ['#000', '#fff'], domain: [0, 100] } }
		});
		expect(getByText('0.0')).toBeInTheDocument();
		expect(getByText('100.0')).toBeInTheDocument();
	});

	it('forwards stroke colour and width to every region', () => {
		const { container } = render(GeoChoropleth, { props: { geojson, data, strokeColor: '#123456', strokeWidth: 2 } });
		const path = regionPath(container, 'ne');
		expect(path.getAttribute('stroke')).toBe('#123456');
		expect(path.getAttribute('stroke-width')).toBe('2');
	});

	it('shows a six-stop legend with min/max labels, and hides it without data or when disabled', () => {
		const { container, getByText, unmount } = render(GeoChoropleth, { props: { geojson, data } });
		expect(container.querySelectorAll('.legend-color')).toHaveLength(6);
		expect(getByText('10.0')).toBeInTheDocument();
		expect(getByText('50.0')).toBeInTheDocument();
		unmount();

		const empty = render(GeoChoropleth, { props: { geojson, data: [] } });
		expect(empty.container.querySelector('.legend')).toBeNull();
		empty.unmount();

		const off = render(GeoChoropleth, { props: { geojson, data, showLegend: false } });
		expect(off.container.querySelector('.legend')).toBeNull();
	});

	it('shows a tooltip with the label on hover and fires onRegionHover', async () => {
		const onRegionHover = vi.fn();
		const { container, findByText, queryByText } = render(GeoChoropleth, {
			props: { geojson, data, onRegionHover }
		});
		const ne = regionPath(container, 'ne');

		await fireEvent.pointerMove(ne, { clientX: 100, clientY: 80 });
		expect(await findByText('North East')).toBeInTheDocument();
		expect(await findByText('10 per 1,000')).toBeInTheDocument();
		expect(onRegionHover).toHaveBeenLastCalledWith(
			expect.objectContaining({ id: 'E12000001', name: 'North East', value: 10 })
		);

		await fireEvent.pointerLeave(ne);
		expect(queryByText('North East')).toBeNull();
		expect(onRegionHover).toHaveBeenLastCalledWith(null);
	});

	it('does not show a tooltip when showTooltip is false', async () => {
		const { container } = render(GeoChoropleth, { props: { geojson, data, showTooltip: false } });
		await fireEvent.pointerMove(regionPath(container, 'nw'), { clientX: 1, clientY: 1 });
		expect(container.querySelector('.tooltip')).toBeNull();
	});

	it('fires onRegionClick with the region properties', async () => {
		const onRegionClick = vi.fn();
		const { container } = render(GeoChoropleth, { props: { geojson, data, onRegionClick } });
		await fireEvent.click(regionPath(container, 'wa'));
		expect(onRegionClick).toHaveBeenCalledWith({
			id: 'W92000004',
			name: 'Wales',
			value: undefined,
			label: 'Wales'
		});
	});

	it('switches the hover transition off under prefers-reduced-motion', () => {
		expect(source).toMatch(
			/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.geo-choropleth :global\(\.region\)\s*\{\s*transition: none;/
		);
	});

	it('makes every region a focusable button with a value-bearing label', () => {
		const { getByRole } = render(GeoChoropleth, { props: { geojson, data } });
		const ne = getByRole('button', { name: 'North East: 10 per 1,000' });
		expect(ne).toHaveAttribute('tabindex', '0');
		expect(getByRole('button', { name: 'Wales: no data' })).toBeInTheDocument();
	});

	it('shows the tooltip on keyboard focus and hides it on blur', async () => {
		const onRegionHover = vi.fn();
		const { getByRole, container } = render(GeoChoropleth, { props: { geojson, data, onRegionHover } });
		const yorkshire = getByRole('button', { name: 'Yorkshire: 50' });

		await fireEvent.focus(yorkshire);
		expect(container.querySelector('.tooltip-title')).toHaveTextContent('Yorkshire');
		// No custom label, so the tooltip shows the value rather than repeating the name
		expect(container.querySelector('.tooltip-value')).toHaveTextContent('50');
		expect(onRegionHover).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'E12000003' }));

		await fireEvent.blur(yorkshire);
		expect(container.querySelector('.tooltip')).toBeNull();
	});

	it('activates a focused region with Enter and Space', async () => {
		const onRegionClick = vi.fn();
		const { getByRole } = render(GeoChoropleth, { props: { geojson, data, onRegionClick } });
		const nw = getByRole('button', { name: 'North West: 30' });

		await fireEvent.keyDown(nw, { key: 'Enter' });
		await fireEvent.keyDown(nw, { key: ' ' });
		await fireEvent.keyDown(nw, { key: 'Tab' });
		expect(onRegionClick).toHaveBeenCalledTimes(2);
		expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'E12000002' }));
	});

});
