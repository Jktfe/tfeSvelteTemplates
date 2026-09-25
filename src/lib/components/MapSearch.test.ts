/**
 * ============================================================
 * MapSearch Tests
 * ============================================================
 *
 * Leaflet is replaced by src/lib/testing/leafletMock.ts and the
 * Nominatim request by a stubbed `fetch`. Covers the combobox ARIA
 * contract, debounce + minimum-length rules, keyboard selection,
 * popup escaping, reduced-motion fit, and the "don't re-search the
 * label we just picked" behaviour.
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
import MapSearch from './MapSearch.svelte';

vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);

const nominatim = [
	{
		display_name: 'Manchester, Greater Manchester, England, United Kingdom',
		lat: '53.4794892',
		lon: '-2.2451148',
		boundingbox: ['53.3', '53.6', '-2.4', '-2.1'],
		type: 'city'
	},
	{
		display_name: '<img src=x onerror=alert(1)>, Nowhere',
		lat: '51.5',
		lon: '-0.1',
		type: 'road'
	}
];

describe('MapSearch', () => {
	let restoreMotion: (() => void) | undefined;
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeAll(async () => {
		await import('leaflet');
	});
	beforeEach(() => {
		resetLeafletMock();
		fetchMock = vi.fn(async () => ({ ok: true, json: async () => nominatim }));
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		restoreMotion?.();
		restoreMotion = undefined;
	});

	/** Type a query and wait for the (short, test-sized) debounce to fire */
	async function search(input: HTMLElement, query: string) {
		await fireEvent.input(input, { target: { value: query } });
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
	}

	it('renders a labelled combobox inside a search landmark', () => {
		const { getByRole } = render(MapSearch, { props: { placeholder: 'Find a place' } });
		const input = getByRole('combobox', { name: 'Search for a location' });
		expect(input).toHaveAttribute('placeholder', 'Find a place');
		expect(input).toHaveAttribute('aria-expanded', 'false');
		expect(getByRole('search')).toBeInTheDocument();
	});

	it('does not query for fewer than three characters', async () => {
		const { getByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		await fireEvent.input(getByRole('combobox'), { target: { value: 'ab' } });
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('debounces and requests Nominatim with the encoded query and result limit', async () => {
		const { getByRole, findAllByRole } = render(MapSearch, { props: { debounceMs: 5, maxResults: 3 } });
		await search(getByRole('combobox'), 'Man & Co');

		const url = String(fetchMock.mock.calls[0][0]);
		expect(url).toContain('nominatim.openstreetmap.org/search');
		expect(url).toContain('q=Man%20%26%20Co');
		expect(url).toContain('limit=3');

		const options = await findAllByRole('option');
		expect(options).toHaveLength(2);
		expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
	});

	it('wires aria-controls / aria-activedescendant to unique ids', async () => {
		const { getByRole, findAllByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		const input = getByRole('combobox');
		await search(input, 'Manchester');
		const options = await findAllByRole('option');

		const listbox = getByRole('listbox');
		expect(input.getAttribute('aria-controls')).toBe(listbox.id);
		expect(listbox.id).not.toBe('search-results');

		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
		expect(options[0]).toHaveAttribute('aria-selected', 'true');
	});

	it('selects with the keyboard, drops a marker and fits the bounding box', async () => {
		const onLocationSelect = vi.fn();
		const { getByRole, findAllByRole, queryByRole } = render(MapSearch, {
			props: { debounceMs: 5, onLocationSelect }
		});
		const map = await waitForMap();
		const input = getByRole('combobox');
		await search(input, 'Manchester');
		await findAllByRole('option');

		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Enter' });

		await vi.waitFor(() => expect(onLocationSelect).toHaveBeenCalledTimes(1));
		expect(onLocationSelect.mock.calls[0][0]).toMatchObject({
			position: { lat: 53.4794892, lng: -2.2451148 },
			boundingBox: [53.3, 53.6, -2.4, -2.1]
		});
		expect(leafletMock.markers).toHaveLength(1);
		expect(map.fitBounds).toHaveBeenCalledWith(
			[
				[53.3, -2.4],
				[53.6, -2.1]
			],
			{ animate: true }
		);
		expect(input).toHaveValue('Manchester');
		expect(queryByRole('listbox')).toBeNull();
	});

	it('does not re-search (and re-open) for the label it just filled in', async () => {
		const onLocationSelect = vi.fn();
		const { getByRole, findAllByRole, queryByRole } = render(MapSearch, {
			props: { debounceMs: 5, onLocationSelect }
		});
		await waitForMap();
		await search(getByRole('combobox'), 'Manchester');
		const [first] = await findAllByRole('option');

		await fireEvent.click(first);
		await vi.waitFor(() => expect(onLocationSelect).toHaveBeenCalled());
		await new Promise((resolve) => setTimeout(resolve, 30));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(queryByRole('listbox')).toBeNull();
	});

	it('escapes geocoder place names before they reach the popup', async () => {
		const { getByRole, findAllByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		await waitForMap();
		await search(getByRole('combobox'), 'nowhere');
		const options = await findAllByRole('option');

		await fireEvent.click(options[1]);
		await vi.waitFor(() => expect(leafletMock.markers).toHaveLength(1));
		const html = leafletMock.markers[0].bindPopup.mock.calls[0][0] as string;
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;img');
	});

	it('uses setView without animation for point results under reduced motion', async () => {
		restoreMotion = mockReducedMotion(true);
		const { getByRole, findAllByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		const map = await waitForMap();
		await search(getByRole('combobox'), 'nowhere');
		const options = await findAllByRole('option');

		await fireEvent.click(options[1]);
		await vi.waitFor(() => expect(map.setView).toHaveBeenCalled());
		expect(map.setView).toHaveBeenLastCalledWith([51.5, -0.1], 15, { animate: false });
	});

	it('closes the dropdown on Escape', async () => {
		const { getByRole, findAllByRole, queryByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		const input = getByRole('combobox');
		await search(input, 'Manchester');
		await findAllByRole('option');

		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(queryByRole('listbox')).toBeNull();
	});

	it('clears the query and marker from the clear button', async () => {
		const { getByRole, findAllByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		await waitForMap();
		const input = getByRole('combobox');
		await search(input, 'Manchester');
		const [first] = await findAllByRole('option');
		await fireEvent.click(first);
		await vi.waitFor(() => expect(leafletMock.markers).toHaveLength(1));

		await fireEvent.click(getByRole('button', { name: 'Clear search' }));
		expect(input).toHaveValue('');
		expect(leafletMock.markers[0].remove).toHaveBeenCalled();
	});

	it('survives a failed request without opening the dropdown', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		fetchMock.mockImplementation(async () => ({ ok: false, json: async () => [] }));
		const { getByRole, queryByRole } = render(MapSearch, { props: { debounceMs: 5 } });
		await search(getByRole('combobox'), 'Manchester');
		await vi.waitFor(() => expect(error).toHaveBeenCalled());
		expect(queryByRole('listbox')).toBeNull();
		error.mockRestore();
	});
});
