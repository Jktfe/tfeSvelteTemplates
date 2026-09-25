/**
 * ============================================================
 * MapBasic Tests
 * ============================================================
 *
 * Leaflet is swapped for a lightweight test double (see
 * src/lib/testing/leafletMock.ts) so these run fast and never race
 * the worker pool. We assert on what the component *asks* Leaflet to
 * do: construction options, reduced-motion handling, tile layer,
 * public methods, and teardown on unmount.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import {
	leafletMock,
	resetLeafletMock,
	waitForMap,
	mockReducedMotion
} from '$lib/testing/leafletMock';
import MapBasic from './MapBasic.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

describe('MapBasic', () => {
	let restoreMotion: (() => void) | undefined;

	// Resolve the mocked module once up front so each component's own
	// dynamic import('leaflet') settles on the next microtask.
	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => resetLeafletMock());
	afterEach(() => {
		restoreMotion?.();
		restoreMotion = undefined;
	});

	it('renders an application region with an accessible label', () => {
		const { getByRole } = render(MapBasic);
		expect(getByRole('application', { name: 'Interactive map' })).toBeInTheDocument();
	});

	it('forwards height as a CSS custom property and merges the class prop', () => {
		const { container } = render(MapBasic, { props: { height: 320, class: 'my-map' } });
		const root = container.querySelector('.map-basic-container') as HTMLElement;
		expect(root.style.getPropertyValue('--map-height')).toBe('320px');
		expect(root.classList.contains('my-map')).toBe(true);
	});

	it('creates the Leaflet map with the given centre, zoom and control options', async () => {
		render(MapBasic, {
			props: {
				center: { lat: 53.48, lng: -2.24 },
				zoom: 11,
				enableScrollZoom: false,
				showZoomControl: false,
				showAttribution: false
			}
		});
		const map = await waitForMap();
		expect(map.options.center).toEqual([53.48, -2.24]);
		expect(map.options.zoom).toBe(11);
		expect(map.options.scrollWheelZoom).toBe(false);
		expect(map.options.zoomControl).toBe(false);
		expect(map.options.attributionControl).toBe(false);
	});

	it('adds an OpenStreetMap tile layer, with attribution only when enabled', async () => {
		render(MapBasic, { props: { showAttribution: true } });
		await waitForMap();
		expect(leafletMock.tileLayers).toHaveLength(1);
		expect(String(leafletMock.tileLayers[0].options.attribution)).toContain('OpenStreetMap');
	});

	it('keeps animations on by default', async () => {
		render(MapBasic);
		const map = await waitForMap();
		expect(map.options.zoomAnimation).toBe(true);
		expect(map.options.fadeAnimation).toBe(true);
		expect(map.options.markerZoomAnimation).toBe(true);
	});

	it('disables Leaflet animations when the user prefers reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		render(MapBasic);
		const map = await waitForMap();
		expect(map.options.zoomAnimation).toBe(false);
		expect(map.options.fadeAnimation).toBe(false);
		expect(map.options.markerZoomAnimation).toBe(false);
	});

	it('exposes getMap / getView / panTo / setView through bind:this', async () => {
		const { component } = render(MapBasic, { props: { center: { lat: 51.5, lng: -0.12 }, zoom: 13 } });
		const map = await waitForMap();
		await vi.waitFor(() => expect(component.getMap()).toBe(map));

		component.panTo({ lat: 52, lng: 0 });
		expect(map.panTo).toHaveBeenLastCalledWith([52, 0], { animate: true });

		component.panTo({ lat: 52, lng: 0 }, 9);
		expect(map.setView).toHaveBeenLastCalledWith([52, 0], 9, { animate: true });

		component.setView({ lat: 50, lng: 1 }, 7);
		expect(map.setView).toHaveBeenLastCalledWith([50, 1], 7, { animate: true });
	});

	it('skips the pan/zoom glide for programmatic moves under reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		const { component } = render(MapBasic);
		const map = await waitForMap();
		await vi.waitFor(() => expect(component.getMap()).toBe(map));

		component.panTo({ lat: 52, lng: 0 });
		expect(map.panTo).toHaveBeenLastCalledWith([52, 0], { animate: false });
	});

	it('tracks the current view on moveend', async () => {
		const { component } = render(MapBasic);
		const map = await waitForMap();
		map.center = { lat: 10, lng: 20 };
		map.zoom = 5;
		map.fire('moveend');
		expect(component.getView()).toEqual({ center: { lat: 10, lng: 20 }, zoom: 5 });
	});

	it('removes the Leaflet map when unmounted', async () => {
		const { unmount } = render(MapBasic);
		const map = await waitForMap();
		unmount();
		expect(map.remove).toHaveBeenCalledTimes(1);
	});

	it('does not build an orphan map if unmounted before Leaflet finishes loading', async () => {
		const { unmount } = render(MapBasic);
		unmount();
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(leafletMock.maps).toHaveLength(0);
	});
});
