/**
 * ============================================================
 * MapMarkers Tests
 * ============================================================
 *
 * Leaflet is replaced by src/lib/testing/leafletMock.ts. We check
 * the category filter bar, the marker layer it drives, popup HTML
 * escaping (including unsafe website URLs), fit-to-bounds with
 * reduced-motion handling, and click callbacks.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import {
	leafletMock,
	resetLeafletMock,
	waitForMap,
	mockReducedMotion
} from '$lib/testing/leafletMock';
import type { MapMarker } from '$lib/types';
import MapMarkers from './MapMarkers.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

const markers: MapMarker[] = [
	{ id: 1, title: 'Dishoom', category: 'restaurant', position: { lat: 51.512, lng: -0.127 } },
	{ id: 2, title: 'Monmouth', category: 'cafe', position: { lat: 51.505, lng: -0.091 } },
	{ id: 3, title: 'Padella', category: 'restaurant', position: { lat: 51.505, lng: -0.09 } }
];

/** Markers currently attached to the (single) layer group */
function layerCount(): number {
	return leafletMock.layerGroups[0]?.layers.size ?? 0;
}

describe('MapMarkers', () => {
	let restoreMotion: (() => void) | undefined;

	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => resetLeafletMock());
	afterEach(() => {
		restoreMotion?.();
		restoreMotion = undefined;
	});

	it('renders a category filter bar with counts', () => {
		const { getByRole } = render(MapMarkers, { props: { markers } });
		expect(getByRole('group', { name: 'Filter markers by category' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'All (3)' })).toHaveAttribute('aria-pressed', 'true');
		expect(getByRole('button', { name: 'Restaurant (2)' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'Cafe (1)' })).toBeInTheDocument();
	});

	it('hides the filter bar when showCategories is false or only one category exists', () => {
		const { queryByRole, unmount } = render(MapMarkers, { props: { markers, showCategories: false } });
		expect(queryByRole('group')).toBeNull();
		unmount();

		const single = render(MapMarkers, { props: { markers: [markers[0], markers[2]] } });
		expect(single.queryByRole('group')).toBeNull();
	});

	it('adds every marker to the layer and fits the view to them', async () => {
		render(MapMarkers, { props: { markers } });
		const map = await waitForMap();
		await vi.waitFor(() => expect(layerCount()).toBe(3));
		expect(map.fitBounds).toHaveBeenCalled();
		expect(map.fitBounds.mock.lastCall?.[1]).toMatchObject({ maxZoom: 15, animate: true });
	});

	it('filters the layer when a category pill is pressed', async () => {
		const { getByRole, getByText } = render(MapMarkers, { props: { markers } });
		await waitForMap();
		await vi.waitFor(() => expect(layerCount()).toBe(3));

		await fireEvent.click(getByRole('button', { name: 'Cafe (1)' }));
		await vi.waitFor(() => expect(layerCount()).toBe(1));
		expect(getByRole('button', { name: 'Cafe (1)' })).toHaveAttribute('aria-pressed', 'true');
		expect(getByText('Showing 1 of 3 locations')).toBeInTheDocument();

		await fireEvent.click(getByRole('button', { name: 'All (3)' }));
		await vi.waitFor(() => expect(layerCount()).toBe(3));
	});

	it('fires onMarkerClick with the marker data', async () => {
		const onMarkerClick = vi.fn();
		render(MapMarkers, { props: { markers, onMarkerClick } });
		await waitForMap();
		await vi.waitFor(() => expect(layerCount()).toBe(3));

		const dishoom = leafletMock.markers.find((m) => m.latlng.lat === 51.512)!;
		dishoom.fire('click');
		expect(onMarkerClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1, title: 'Dishoom' }));
	});

	it('escapes popup content and refuses non-http website links', async () => {
		render(MapMarkers, {
			props: {
				markers: [
					{
						id: 7,
						title: '<script>alert(1)</script>',
						position: { lat: 51.5, lng: -0.1 },
						metadata: { website: 'javascript:alert(1)', address: '<b>1 High St</b>' }
					},
					{
						id: 8,
						title: 'Safe',
						position: { lat: 51.6, lng: -0.2 },
						metadata: { website: 'https://example.com' }
					}
				]
			}
		});
		await waitForMap();
		await vi.waitFor(() => expect(leafletMock.markers.length).toBeGreaterThanOrEqual(2));

		const unsafe = leafletMock.markers.find((m) => m.latlng.lat === 51.5)!;
		const unsafeHtml = unsafe.bindPopup.mock.calls[0][0] as string;
		expect(unsafeHtml).not.toContain('<script>');
		expect(unsafeHtml).toContain('&lt;b&gt;1 High St&lt;/b&gt;');
		expect(unsafeHtml).not.toContain('javascript:');

		const safe = leafletMock.markers.find((m) => m.latlng.lat === 51.6)!;
		expect(safe.bindPopup.mock.calls[0][0]).toContain('href="https://example.com"');
	});

	it('fits bounds without animation under reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		render(MapMarkers, { props: { markers } });
		const map = await waitForMap();
		await vi.waitFor(() => expect(map.fitBounds).toHaveBeenCalled());
		expect(map.options.zoomAnimation).toBe(false);
		expect(map.fitBounds.mock.lastCall?.[1]).toMatchObject({ animate: false });
	});

	it('uses an explicit centre/zoom when provided', async () => {
		render(MapMarkers, { props: { markers, center: { lat: 10, lng: 20 }, zoom: 4 } });
		const map = await waitForMap();
		expect(map.options.center).toEqual([10, 20]);
		expect(map.options.zoom).toBe(4);
	});

	it('removes the map on unmount', async () => {
		const { unmount } = render(MapMarkers, { props: { markers } });
		const map = await waitForMap();
		unmount();
		expect(map.remove).toHaveBeenCalledTimes(1);
	});
});
