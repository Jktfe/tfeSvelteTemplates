/**
 * ============================================================
 * MapRouting Tests
 * ============================================================
 *
 * Leaflet is replaced by src/lib/testing/leafletMock.ts and OSRM by
 * a stubbed `fetch`. Covers click-to-set A/B, the OSRM request shape
 * per travel mode (and that switching mode re-routes), route drawing,
 * distance/duration formatting, errors, swap/clear, reduced-motion
 * fit, and that the A/B pins read their colour from theme tokens.
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
import MapRouting from './MapRouting.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

const origin = { lat: 51.5074, lng: -0.1278 };
const destination = { lat: 51.5155, lng: -0.0922 };

const osrmOk = {
	code: 'Ok',
	routes: [
		{
			distance: 3450,
			duration: 4020,
			summary: 'Strand',
			geometry: {
				coordinates: [
					[-0.1278, 51.5074],
					[-0.11, 51.511],
					[-0.0922, 51.5155]
				]
			},
			legs: [
				{
					steps: [
						{ name: 'Strand', distance: 900, duration: 120, maneuver: { type: 'depart', location: [-0.1278, 51.5074] } },
						{ name: 'Fleet Street', distance: 2550, duration: 380, maneuver: { type: 'turn', location: [-0.11, 51.511] } }
					]
				}
			]
		}
	]
};

describe('MapRouting', () => {
	let restoreMotion: (() => void) | undefined;
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => {
		resetLeafletMock();
		fetchMock = vi.fn(async () => ({ ok: true, json: async () => osrmOk }));
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		restoreMotion?.();
		restoreMotion = undefined;
	});

	it('renders the travel-mode group with pressed state and a click-to-set hint', () => {
		const { getByRole, getByText } = render(MapRouting);
		const group = getByRole('group', { name: 'Travel mode' });
		expect(group).toBeInTheDocument();
		expect(getByRole('button', { name: 'Driving' })).toHaveAttribute('aria-pressed', 'true');
		expect(getByRole('button', { name: 'Walking' })).toHaveAttribute('aria-pressed', 'false');
		expect(getByText('Click map to set origin (A)')).toBeInTheDocument();
	});

	it('sets origin then destination from map clicks and requests a route', async () => {
		const onRouteCalculated = vi.fn();
		const { findByText } = render(MapRouting, { props: { onRouteCalculated } });
		const map = await waitForMap();

		map.fire('click', { latlng: origin });
		await findByText('Click map to set destination (B)');
		map.fire('click', { latlng: destination });

		await vi.waitFor(() => expect(onRouteCalculated).toHaveBeenCalled());
		const url = String(fetchMock.mock.lastCall?.[0]);
		expect(url).toContain('/route/v1/car/-0.1278,51.5074;-0.0922,51.5155');
		expect(url).toContain('geometries=geojson');
	});

	it('draws the polyline and shows formatted distance / duration / steps', async () => {
		const { findByText, getByRole } = render(MapRouting, {
			props: { origin, destination, routeColor: '#ff00aa', routeWeight: 7 }
		});
		await waitForMap();

		expect(await findByText('3.5 km')).toBeInTheDocument();
		expect(await findByText('1h 7m')).toBeInTheDocument();
		expect(leafletMock.polylines).toHaveLength(1);
		expect(leafletMock.polylines[0].options).toMatchObject({ color: '#ff00aa', weight: 7 });

		const toggle = getByRole('button', { name: /directions \(2 steps\)/i });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await fireEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(await findByText('Fleet Street')).toBeInTheDocument();
	});

	it('re-routes with the new OSRM profile when the travel mode changes', async () => {
		const { getByRole } = render(MapRouting, { props: { origin, destination } });
		await waitForMap();
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
		fetchMock.mockClear();

		await fireEvent.click(getByRole('button', { name: 'Walking' }));
		await vi.waitFor(() =>
			expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/route/v1/foot/'))).toBe(true)
		);

		await fireEvent.click(getByRole('button', { name: 'Cycling' }));
		await vi.waitFor(() =>
			expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/route/v1/bike/'))).toBe(true)
		);
	});

	it('honours a custom OSRM server', async () => {
		render(MapRouting, { props: { origin, destination, osrmApiUrl: 'https://osrm.example.test' } });
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(String(fetchMock.mock.calls[0][0]).startsWith('https://osrm.example.test/route/v1/')).toBe(true);
	});

	it('fits the route with animation by default and without it under reduced motion', async () => {
		const first = render(MapRouting, { props: { origin, destination } });
		const map = await waitForMap(0);
		await vi.waitFor(() => expect(map.fitBounds).toHaveBeenCalled());
		expect(map.fitBounds.mock.lastCall?.[1]).toMatchObject({ animate: true });
		first.unmount();

		restoreMotion = mockReducedMotion(true);
		render(MapRouting, { props: { origin, destination } });
		const calm = await waitForMap(1);
		expect(calm.options.zoomAnimation).toBe(false);
		await vi.waitFor(() => expect(calm.fitBounds).toHaveBeenCalled());
		expect(calm.fitBounds.mock.lastCall?.[1]).toMatchObject({ animate: false });
	});

	it('shows an alert and fires onRouteError when OSRM finds nothing', async () => {
		fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({ code: 'NoRoute', routes: [] }) }));
		const onRouteError = vi.fn();
		const { findByRole } = render(MapRouting, { props: { origin, destination, onRouteError } });

		expect(await findByRole('alert')).toHaveTextContent('No route found');
		expect(onRouteError).toHaveBeenCalledWith('No route found');
	});

	it('colours the A/B pins from the semantic theme tokens', async () => {
		render(MapRouting, { props: { origin, destination } });
		await vi.waitFor(() => expect(leafletMock.divIcons.length).toBeGreaterThanOrEqual(2));
		const html = leafletMock.divIcons.map((icon) => String(icon.html)).join('\n');
		expect(html).toContain('--marker-color: var(--mr-origin)');
		expect(html).toContain('--marker-color: var(--mr-destination)');
		expect(html).not.toMatch(/#22c55e|#ef4444/i);
	});

	it('swaps origin and destination', async () => {
		const { getByRole, getByText } = render(MapRouting, { props: { origin, destination } });
		await waitForMap();
		expect(getByText('51.5074, -0.1278')).toBeInTheDocument();

		await fireEvent.click(getByRole('button', { name: 'Swap origin and destination' }));
		await vi.waitFor(() =>
			expect(fetchMock.mock.lastCall?.[0]).toContain('/-0.0922,51.5155;-0.1278,51.5074')
		);
	});

	it('clears the route, both pins and returns to origin mode', async () => {
		const { getByRole, findByText, queryByText } = render(MapRouting, { props: { origin, destination } });
		await findByText('3.5 km');

		await fireEvent.click(getByRole('button', { name: 'Clear' }));
		expect(queryByText('3.5 km')).toBeNull();
		expect(leafletMock.polylines[0].remove).toHaveBeenCalled();
		expect(getByRole('button', { name: 'Click map to set origin' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'Swap origin and destination' })).toBeDisabled();
	});

	it('does not bind map clicks when enableClickToSet is false', async () => {
		const { queryByText } = render(MapRouting, { props: { enableClickToSet: false } });
		const map = await waitForMap();
		expect(map.handlers.click).toBeUndefined();
		expect(queryByText(/Click map to set origin \(A\)/)).toBeNull();
	});

	it('removes the map on unmount', async () => {
		const { unmount } = render(MapRouting);
		const map = await waitForMap();
		unmount();
		expect(map.remove).toHaveBeenCalledTimes(1);
	});
});
