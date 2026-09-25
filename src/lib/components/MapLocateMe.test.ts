/**
 * ============================================================
 * MapLocateMe Tests
 * ============================================================
 *
 * Leaflet is replaced by src/lib/testing/leafletMock.ts and the
 * browser Geolocation API by a small controllable stub, so we can
 * resolve or reject a position on demand and assert on the UI and
 * the map calls that follow.
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
import MapLocateMe from './MapLocateMe.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

type Success = (pos: GeolocationPosition) => void;
type Failure = (err: GeolocationPositionError) => void;

/** Controllable stand-in for navigator.geolocation */
function installGeolocation() {
	const pending: { success: Success; failure: Failure }[] = [];
	const geo = {
		getCurrentPosition: vi.fn<(s: Success, f: Failure, o?: PositionOptions) => void>((success, failure) => {
			pending.push({ success, failure });
		}),
		watchPosition: vi.fn<(s: Success, f: Failure, o?: PositionOptions) => number>((success, failure) => {
			pending.push({ success, failure });
			return 42;
		}),
		clearWatch: vi.fn()
	};
	Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true });

	return {
		geo,
		resolve(lat: number, lng: number, accuracy = 25) {
			const next = pending[pending.length - 1];
			next.success({
				coords: {
					latitude: lat,
					longitude: lng,
					accuracy,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: 1_700_000_000_000
			} as unknown as GeolocationPosition);
		},
		reject(code: number) {
			pending[pending.length - 1].failure({ code, message: 'nope' } as GeolocationPositionError);
		}
	};
}

describe('MapLocateMe', () => {
	let restoreMotion: (() => void) | undefined;
	let gps: ReturnType<typeof installGeolocation>;

	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => {
		resetLeafletMock();
		gps = installGeolocation();
	});
	afterEach(() => {
		restoreMotion?.();
		restoreMotion = undefined;
	});

	it('renders a labelled locate button in the requested corner', () => {
		const { getByRole, container } = render(MapLocateMe, { props: { buttonPosition: 'bottomleft' } });
		expect(getByRole('button', { name: 'Find my location' })).toBeInTheDocument();
		expect(container.querySelector('.locate-button-wrapper.bottomleft')).toBeTruthy();
		expect(getByRole('application')).toHaveAttribute(
			'aria-label',
			'Interactive map with locate me functionality'
		);
	});

	it('requests a one-shot position with the configured options', async () => {
		const { getByRole } = render(MapLocateMe, {
			props: { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 }
		});
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));

		expect(gps.geo.getCurrentPosition).toHaveBeenCalledTimes(1);
		expect(gps.geo.getCurrentPosition.mock.calls[0][2]).toEqual({
			enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 1000
		});
		expect(getByRole('button', { name: 'Finding your location...' })).toBeDisabled();
	});

	it('drops a marker + accuracy circle and re-centres on success', async () => {
		const onLocate = vi.fn();
		const { getByRole, findByText } = render(MapLocateMe, { props: { onLocate, locateZoom: 17 } });
		const map = await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.resolve(53.4808, -2.2426, 30);

		await vi.waitFor(() => expect(onLocate).toHaveBeenCalledTimes(1));
		expect(onLocate.mock.calls[0][0]).toMatchObject({
			position: { lat: 53.4808, lng: -2.2426 },
			accuracy: 30
		});
		expect(leafletMock.circles).toHaveLength(1);
		expect(leafletMock.circles[0].radius).toBe(30);
		expect(leafletMock.markers).toHaveLength(1);
		expect(map.setView).toHaveBeenLastCalledWith([53.4808, -2.2426], 17, { animate: true });

		expect(await findByText('±30m')).toBeInTheDocument();
		expect(getByRole('button', { name: 'Re-center on your location' })).toBeEnabled();
	});

	it('skips the accuracy circle when showAccuracyCircle is false', async () => {
		const onLocate = vi.fn();
		const { getByRole } = render(MapLocateMe, { props: { onLocate, showAccuracyCircle: false } });
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.resolve(51.5, -0.1);

		await vi.waitFor(() => expect(onLocate).toHaveBeenCalled());
		expect(leafletMock.circles).toHaveLength(0);
		expect(leafletMock.markers).toHaveLength(1);
	});

	it('jumps instead of gliding to the fix under reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		const onLocate = vi.fn();
		const { getByRole } = render(MapLocateMe, { props: { onLocate } });
		const map = await waitForMap();
		expect(map.options.zoomAnimation).toBe(false);

		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.resolve(51.5, -0.1);
		await vi.waitFor(() => expect(onLocate).toHaveBeenCalled());
		expect(map.setView).toHaveBeenLastCalledWith([51.5, -0.1], 16, { animate: false });
	});

	it.each([
		[1, 'PERMISSION_DENIED', /denied/i],
		[2, 'POSITION_UNAVAILABLE', /unable to determine/i],
		[3, 'TIMEOUT', /timed out/i]
	])('maps error code %i to %s with a friendly alert', async (code, type, message) => {
		const onError = vi.fn();
		const { getByRole, findByRole } = render(MapLocateMe, { props: { onError } });
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.reject(code);

		const alert = await findByRole('alert');
		expect(alert).toHaveTextContent(message);
		expect(onError).toHaveBeenCalledWith(type, expect.stringMatching(message));
	});

	it('lets the user dismiss the error banner', async () => {
		const { getByRole, findByRole, queryByRole } = render(MapLocateMe);
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.reject(1);
		await findByRole('alert');

		await fireEvent.click(getByRole('button', { name: 'Dismiss' }));
		expect(queryByRole('alert')).toBeNull();
	});

	it('uses watchPosition in watch mode and clears the watch on unmount', async () => {
		const { getByRole, unmount } = render(MapLocateMe, { props: { watchPosition: true } });
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));

		expect(gps.geo.watchPosition).toHaveBeenCalledTimes(1);
		expect(gps.geo.getCurrentPosition).not.toHaveBeenCalled();

		unmount();
		expect(gps.geo.clearWatch).toHaveBeenCalledWith(42);
	});

	it('clearLocation removes the marker and circle', async () => {
		const onLocate = vi.fn();
		const { component, getByRole, queryByText } = render(MapLocateMe, { props: { onLocate } });
		await waitForMap();
		await fireEvent.click(getByRole('button', { name: 'Find my location' }));
		gps.resolve(51.5, -0.1, 12);
		await vi.waitFor(() => expect(onLocate).toHaveBeenCalled());

		component.clearLocation();
		expect(leafletMock.markers[0].remove).toHaveBeenCalled();
		expect(leafletMock.circles[0].remove).toHaveBeenCalled();
		await vi.waitFor(() => expect(queryByText('±12m')).toBeNull());
	});

	it('removes the map on unmount', async () => {
		const { unmount } = render(MapLocateMe);
		const map = await waitForMap();
		unmount();
		expect(map.remove).toHaveBeenCalledTimes(1);
	});
});
