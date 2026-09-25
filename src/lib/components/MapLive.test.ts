/**
 * ============================================================
 * MapLive Tests
 * ============================================================
 *
 * Leaflet is replaced by src/lib/testing/leafletMock.ts. We drive
 * the component the way a user would — map clicks, popup buttons,
 * drags — by firing events on the mock map/marker instances, then
 * assert on the rendered control bar and the callbacks.
 *
 * The popup-listener tests pin the fix for handlers that were never
 * detached: every open must attach exactly one live set of save /
 * delete listeners, and closing the popup must abort them.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import {
	leafletMock,
	resetLeafletMock,
	waitForMap,
	mockReducedMotion,
	type MockMarker
} from '$lib/testing/leafletMock';
import type { MapMarker } from '$lib/types';
import MapLive from './MapLive.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

const seed: MapMarker[] = [
	{ id: 4, title: 'Borough Market', description: '', position: { lat: 51.505, lng: -0.091 } },
	{ id: 9, title: 'Tate Modern', description: '', position: { lat: 51.507, lng: -0.099 } }
];

async function waitForMarkers(count: number): Promise<MockMarker[]> {
	await vi.waitFor(() => expect(leafletMock.markers).toHaveLength(count));
	return leafletMock.markers;
}

describe('MapLive', () => {
	let restoreMotion: (() => void) | undefined;

	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => resetLeafletMock());
	afterEach(() => {
		restoreMotion?.();
		restoreMotion = undefined;
	});

	it('renders the control bar with add-mode on and a live marker count', () => {
		const { getByRole, getByText } = render(MapLive);
		const toggle = getByRole('button', { name: /click map to add/i });
		expect(toggle).toHaveAttribute('aria-pressed', 'true');
		expect(getByText('0 markers')).toBeInTheDocument();
		expect(getByText('Click anywhere on the map to add a marker')).toBeInTheDocument();
	});

	it('hides the add-mode toggle when enableAddMode is false', () => {
		const { queryByRole } = render(MapLive, { props: { enableAddMode: false } });
		expect(queryByRole('button', { name: /click map to add/i })).toBeNull();
	});

	it('toggles add mode off and back on', async () => {
		const { getByRole, queryByText } = render(MapLive);
		const toggle = getByRole('button', { name: /click map to add/i });
		await fireEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-pressed', 'false');
		expect(queryByText('Click anywhere on the map to add a marker')).toBeNull();
	});

	it('replays seeded markers and continues IDs from the highest existing one', async () => {
		const onMarkerAdd = vi.fn();
		render(MapLive, { props: { markers: [...seed], onMarkerAdd } });
		const map = await waitForMap();
		await waitForMarkers(2);

		map.fire('click', { latlng: { lat: 51.51, lng: -0.1 } });
		await vi.waitFor(() => expect(onMarkerAdd).toHaveBeenCalledTimes(1));
		expect(onMarkerAdd.mock.calls[0][0]).toMatchObject({
			id: 10,
			title: 'Location 3',
			position: { lat: 51.51, lng: -0.1 }
		});
	});

	it('adds a draggable marker on map click in add mode', async () => {
		const onMarkerAdd = vi.fn();
		const { getByText } = render(MapLive, { props: { onMarkerAdd } });
		const map = await waitForMap();

		map.fire('click', { latlng: { lat: 51.5, lng: -0.12 } });
		const [marker] = await waitForMarkers(1);

		expect(marker.options.draggable).toBe(true);
		expect(onMarkerAdd).toHaveBeenCalledTimes(1);
		await vi.waitFor(() => expect(getByText('1 markers')).toBeInTheDocument());
	});

	it('ignores map clicks while add mode is off', async () => {
		const onMarkerAdd = vi.fn();
		const { getByRole } = render(MapLive, { props: { onMarkerAdd } });
		const map = await waitForMap();
		await fireEvent.click(getByRole('button', { name: /click map to add/i }));

		map.fire('click', { latlng: { lat: 51.5, lng: -0.12 } });
		await tick();
		expect(onMarkerAdd).not.toHaveBeenCalled();
		expect(leafletMock.markers).toHaveLength(0);
	});

	it('stops adding once maxMarkers is reached and says so', async () => {
		const onMarkerAdd = vi.fn();
		const { getByText } = render(MapLive, { props: { maxMarkers: 1, onMarkerAdd } });
		const map = await waitForMap();

		map.fire('click', { latlng: { lat: 51.5, lng: -0.12 } });
		await waitForMarkers(1);
		await vi.waitFor(() => expect(getByText('Maximum markers reached (1)')).toBeInTheDocument());

		map.fire('click', { latlng: { lat: 51.6, lng: -0.2 } });
		await tick();
		expect(onMarkerAdd).toHaveBeenCalledTimes(1);
		expect(getByText('1 / 1 markers')).toBeInTheDocument();
	});

	it('escapes user-supplied titles in popup HTML', async () => {
		render(MapLive, {
			props: {
				markers: [{ id: 1, title: '<img src=x onerror=alert(1)>', position: { lat: 51, lng: 0 } }]
			}
		});
		const [marker] = await waitForMarkers(1);
		const html = marker.bindPopup.mock.calls[0][0] as string;
		expect(html).not.toContain('<img src=x');
		expect(html).toContain('&lt;img');
	});

	it('saves popup edits and closes the popup', async () => {
		render(MapLive, { props: { markers: [{ ...seed[0] }] } });
		const [marker] = await waitForMarkers(1);

		marker.openPopup();
		const popup = marker.popup!.element;
		(popup.querySelector('.popup-title-input') as HTMLInputElement).value = 'Renamed';
		(popup.querySelector('.popup-save-btn') as HTMLButtonElement).click();

		expect(marker.setPopupContent).toHaveBeenCalledTimes(1);
		expect(marker.setPopupContent.mock.calls[0][0]).toContain('value="Renamed"');
		expect(marker.closePopup).toHaveBeenCalled();
	});

	it('deletes a marker from the popup and fires onMarkerRemove', async () => {
		const onMarkerRemove = vi.fn();
		const { getByText } = render(MapLive, { props: { markers: [{ ...seed[0] }], onMarkerRemove } });
		const [marker] = await waitForMarkers(1);
		const group = leafletMock.layerGroups[0];
		expect(group.layers.has(marker)).toBe(true);

		marker.openPopup();
		(marker.popup!.element.querySelector('.popup-delete-btn') as HTMLButtonElement).click();

		expect(onMarkerRemove).toHaveBeenCalledTimes(1);
		expect(onMarkerRemove.mock.calls[0][0]).toMatchObject({ id: 4 });
		expect(group.layers.has(marker)).toBe(false);
		await vi.waitFor(() => expect(getByText('0 markers')).toBeInTheDocument());
	});

	it('attaches exactly one live listener set per popup open', async () => {
		const onMarkerRemove = vi.fn();
		render(MapLive, { props: { markers: [{ ...seed[0] }], onMarkerRemove } });
		const [marker] = await waitForMarkers(1);

		// Open and close a few times — the popup element is reused by the mock,
		// which is exactly where un-removed listeners would stack up.
		marker.openPopup();
		marker.closePopup();
		marker.openPopup();
		marker.closePopup();
		marker.openPopup();

		(marker.popup!.element.querySelector('.popup-delete-btn') as HTMLButtonElement).click();
		expect(onMarkerRemove).toHaveBeenCalledTimes(1);
	});

	it('aborts popup listeners on popupclose', async () => {
		const signals: AbortSignal[] = [];
		const original = HTMLElement.prototype.addEventListener;
		const spy = vi
			.spyOn(HTMLElement.prototype, 'addEventListener')
			.mockImplementation(function (this: HTMLElement, type, listener, options) {
				if (
					type === 'click' &&
					typeof options === 'object' &&
					options?.signal &&
					this.matches('.popup-save-btn, .popup-delete-btn')
				) {
					signals.push(options.signal);
				}
				return original.call(this, type, listener, options);
			});

		try {
			render(MapLive, { props: { markers: [{ ...seed[0] }] } });
			const [marker] = await waitForMarkers(1);

			marker.openPopup();
			expect(signals).toHaveLength(2);
			expect(signals.every((s) => !s.aborted)).toBe(true);

			marker.closePopup();
			expect(signals.every((s) => s.aborted)).toBe(true);
		} finally {
			spy.mockRestore();
		}
	});

	it('clicks inside the popup do not bubble to the map as a new marker', async () => {
		const onMarkerAdd = vi.fn();
		render(MapLive, { props: { markers: [{ ...seed[0] }], onMarkerAdd } });
		const map = await waitForMap();
		const [marker] = await waitForMarkers(1);

		// Forward any bubbling DOM click to the map's click handler, like Leaflet would
		const forward = () => map.fire('click', { latlng: { lat: 0, lng: 0 } });
		document.body.addEventListener('click', forward);
		try {
			marker.openPopup();
			(marker.popup!.element.querySelector('.popup-save-btn') as HTMLButtonElement).click();
			await tick();
			expect(onMarkerAdd).not.toHaveBeenCalled();
		} finally {
			document.body.removeEventListener('click', forward);
		}
	});

	it('updates the stored position when a marker is dragged', async () => {
		render(MapLive, { props: { markers: [{ ...seed[0] }] } });
		const [marker] = await waitForMarkers(1);

		marker.dragTo({ lat: 52, lng: 1 });
		marker.openPopup();
		(marker.popup!.element.querySelector('.popup-save-btn') as HTMLButtonElement).click();

		// The re-rendered popup shows the dragged coordinates
		expect(marker.setPopupContent.mock.calls[0][0]).toContain('52.000000, 1.000000');
	});

	it('clears every marker and fires onMarkerRemove for each', async () => {
		const onMarkerRemove = vi.fn();
		const { getByRole, getByText } = render(MapLive, {
			props: { markers: seed.map((m) => ({ ...m })), onMarkerRemove }
		});
		await waitForMarkers(2);

		await fireEvent.click(getByRole('button', { name: /clear all/i }));
		expect(onMarkerRemove).toHaveBeenCalledTimes(2);
		expect(leafletMock.layerGroups[0].clearLayers).toHaveBeenCalled();
		expect(getByText('0 markers')).toBeInTheDocument();
	});

	it('disables Leaflet zoom/fade animations under reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		render(MapLive);
		const map = await waitForMap();
		expect(map.options.zoomAnimation).toBe(false);
		expect(map.options.fadeAnimation).toBe(false);
	});

	it('removes the map on unmount', async () => {
		const { unmount } = render(MapLive);
		const map = await waitForMap();
		unmount();
		expect(map.remove).toHaveBeenCalledTimes(1);
	});
});
