<!--
  ============================================================
  MapSearch.svelte - Map with Location Search
  ============================================================

  [CR] WHAT IT DOES
  Interactive map with location search using OpenStreetMap's Nominatim geocoding
  API. Implements debounced search (300ms default) to respect API rate limits,
  keyboard navigation for accessibility (Arrow keys, Enter, Escape), and
  automatic bounding box zoom for optimal view of selected locations.

  [NTL] THE SIMPLE VERSION
  This is your "find a place" map! Type an address or place name in the search
  box, pick from the dropdown suggestions, and the map zooms right to it with
  a pin. It's like having Google Maps search built into your own map widget!

  FEATURES
  • Location search with autocomplete dropdown
  • Debounced search (300ms) - respects Nominatim API rate limits
  • Keyboard navigation (↑↓ to navigate, Enter to select, Escape to close)
  • Visual marker at selected location with popup
  • Bounding box zoom (fits whole area, not just center point)
  • Clear search button
  • Loading spinner during search
  • Accessible interface (ARIA roles, keyboard support)
  • SSR safe (client-side only initialization)

  USAGE
  ```svelte
  <script>
    import MapSearch from '$lib/components/MapSearch.svelte';
  </script>

  <MapSearch
    center={{ lat: 51.5074, lng: -0.1278 }}
    zoom={10}
    height={500}
    placeholder="Search for a location..."
    onLocationSelect={(result) => console.log(result)}
  />
  ```

  DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)
  • Nominatim API (free, no key required, rate-limited)

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapSearchProps, GeoSearchResult } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Initial map center coordinates (default: Central London) */
		center = DEFAULT_MAP_CENTER,
		/** Initial zoom level (default: 13) */
		zoom = 13,
		/** Map container height in pixels (default: 400) */
		height = 400,
		/** Search input placeholder text */
		placeholder = 'Search for a location...',
		/** Debounce time for search input in ms (default: 300) */
		debounceMs = 300,
		/** Maximum search results to show (default: 5) */
		maxResults = 5,
		/** Callback when user selects a location */
		onLocationSelect
	}: MapSearchProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** Current search marker */
	let marker: LeafletMarker | undefined = $state();

	/** Search query text */
	let searchQuery = $state('');

	/** Search results from Nominatim */
	let searchResults = $state<GeoSearchResult[]>([]);

	/** Loading state for search */
	let isSearching = $state(false);

	/** Whether the dropdown is open */
	let isDropdownOpen = $state(false);

	/** Currently highlighted result index for keyboard navigation */
	let highlightedIndex = $state(-1);

	/** Search input element reference */
	let searchInput: HTMLInputElement | undefined = $state();

	/** Debounce timer ID */
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	// ==================================================
	// EFFECTS - Lifecycle and reactive updates
	// ==================================================

	/**
	 * Initialize Leaflet map on mount
	 */
	$effect(() => {
		if (!isBrowser || !mapContainer) return;

		let mapInstance: LeafletMap | undefined;

		(async () => {
			const L = await import('leaflet');

			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			mapInstance = L.map(mapContainer, {
				center: [center.lat, center.lng],
				zoom: zoom,
				scrollWheelZoom: true,
				zoomControl: false,
				attributionControl: true,
				zoomAnimation: !prefersReducedMotion,
				fadeAnimation: !prefersReducedMotion
			});

			// Add zoom control to bottom-right to avoid overlapping UI elements
			L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}).addTo(mapInstance);

			map = mapInstance;
		})();

		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
			}
		};
	});

	/**
	 * Debounced search effect
	 */
	$effect(() => {
		// Clear previous timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Don't search if query is too short
		if (searchQuery.length < 3) {
			searchResults = [];
			isDropdownOpen = false;
			return;
		}

		// Debounce the search
		debounceTimer = setTimeout(() => {
			performSearch(searchQuery);
		}, debounceMs);

		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

	// ==================================================
	// FUNCTIONS - Search and selection logic
	// ==================================================

	/**
	 * Perform search using Nominatim API
	 */
	async function performSearch(query: string): Promise<void> {
		if (!query || query.length < 3) return;

		isSearching = true;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?` +
					`format=json&q=${encodeURIComponent(query)}&limit=${maxResults}&addressdetails=1`,
				{
					headers: {
						'User-Agent': 'TFE-Svelte-Templates/1.0'
					}
				}
			);

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const data = await response.json();

			searchResults = data.map(
				(item: {
					display_name: string;
					lat: string;
					lon: string;
					boundingbox?: string[];
					type?: string;
					importance?: number;
				}) => ({
					displayName: item.display_name,
					position: {
						lat: parseFloat(item.lat),
						lng: parseFloat(item.lon)
					},
					boundingBox: item.boundingbox
						? (item.boundingbox.map(Number) as [number, number, number, number])
						: undefined,
					type: item.type,
					importance: item.importance
				})
			);

			isDropdownOpen = searchResults.length > 0;
			highlightedIndex = -1;
		} catch (error) {
			console.error('[MapSearch] Search error:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	/**
	 * Select a search result
	 */
	async function selectResult(result: GeoSearchResult): Promise<void> {
		if (!map) return;

		const L = await import('leaflet');

		// Update search query to selected location name
		searchQuery = result.displayName.split(',')[0]; // Just the main name
		isDropdownOpen = false;
		searchResults = [];

		// Remove existing marker
		if (marker) {
			marker.remove();
		}

		// Add marker at selected location
		marker = L.marker([result.position.lat, result.position.lng]).addTo(map);
		marker.bindPopup(`<strong>${result.displayName.split(',')[0]}</strong>`, {
			autoPan: true,
			autoPanPaddingTopLeft: L.point(50, 80),
			autoPanPaddingBottomRight: L.point(50, 50)
		}).openPopup();

		// Pan to location
		if (result.boundingBox) {
			// Use bounding box for better fit
			map.fitBounds([
				[result.boundingBox[0], result.boundingBox[2]],
				[result.boundingBox[1], result.boundingBox[3]]
			]);
		} else {
			map.setView([result.position.lat, result.position.lng], 15);
		}

		// Call callback if provided
		onLocationSelect?.(result);
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (!isDropdownOpen || searchResults.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, searchResults.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (highlightedIndex >= 0) {
					selectResult(searchResults[highlightedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				isDropdownOpen = false;
				highlightedIndex = -1;
				break;
		}
	}

	/**
	 * Clear search
	 */
	function clearSearch(): void {
		searchQuery = '';
		searchResults = [];
		isDropdownOpen = false;
		highlightedIndex = -1;

		if (marker) {
			marker.remove();
			marker = undefined;
		}

		searchInput?.focus();
	}

	/**
	 * Handle focus out - close dropdown with delay
	 */
	function handleFocusOut(): void {
		// Delay to allow click on results
		setTimeout(() => {
			isDropdownOpen = false;
		}, 200);
	}
</script>

<!--
  Map Search Container
-->
<div class="map-search-container" style="--map-height: {height}px">
	<!-- Search Bar -->
	<div class="search-bar" role="search">
		<div class="search-input-wrapper">
			<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<path d="M21 21l-4.35-4.35" />
			</svg>

			<input
				bind:this={searchInput}
				bind:value={searchQuery}
				type="text"
				class="search-input"
				{placeholder}
				onkeydown={handleKeydown}
				onfocusout={handleFocusOut}
				role="combobox"
				aria-label="Search for a location"
				aria-expanded={isDropdownOpen}
				aria-haspopup="listbox"
				aria-controls="search-results"
				autocomplete="off"
			/>

			{#if isSearching}
				<div class="search-spinner" aria-label="Searching..."></div>
			{:else if searchQuery}
				<button
					type="button"
					class="clear-button"
					onclick={clearSearch}
					aria-label="Clear search"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>

		<!-- Search Results Dropdown -->
		{#if isDropdownOpen && searchResults.length > 0}
			<ul id="search-results" class="search-results" role="listbox" aria-label="Search results">
				{#each searchResults as result, index (result.displayName)}
					<li
						role="option"
						class="search-result-item"
						class:highlighted={index === highlightedIndex}
						aria-selected={index === highlightedIndex}
						onmouseenter={() => (highlightedIndex = index)}
						onclick={() => selectResult(result)}
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								selectResult(result);
							}
						}}
					>
						<svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						<div class="result-text">
							<span class="result-name">{result.displayName.split(',')[0]}</span>
							<span class="result-address">{result.displayName.split(',').slice(1).join(',').trim()}</span>
						</div>
						{#if result.type}
							<span class="result-type">{result.type}</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Map Element -->
	<div bind:this={mapContainer} class="map-element" role="application" aria-label="Interactive map"></div>
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-search-container {
		position: relative;
		width: 100%;
		height: var(--map-height, 400px);
		border-radius: 8px;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.map-element {
		width: 100%;
		height: 100%;
	}

	/* ==================================================
     Search Bar Styles
     ================================================== */
	.search-bar {
		position: absolute;
		top: 12px;
		left: 12px;
		right: 12px;
		max-width: 400px;
		z-index: 1000;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		width: 18px;
		height: 18px;
		color: #666;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 12px 40px 12px 40px;
		border: none;
		font-size: 14px;
		background: transparent;
		outline: none;
	}

	.search-input::placeholder {
		color: #999;
	}

	.search-input:focus {
		box-shadow: inset 0 0 0 2px #146ef5;
		border-radius: 8px;
	}

	.clear-button {
		position: absolute;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		background: #f0f0f0;
		border-radius: 50%;
		cursor: pointer;
		color: #666;
		transition: background-color 0.15s ease;
	}

	.clear-button:hover {
		background: #e0e0e0;
	}

	.clear-button svg {
		width: 14px;
		height: 14px;
	}

	/* Search Spinner */
	.search-spinner {
		position: absolute;
		right: 12px;
		width: 18px;
		height: 18px;
		border: 2px solid #f0f0f0;
		border-top-color: #146ef5;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ==================================================
     Search Results Dropdown
     ================================================== */
	.search-results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin: 4px 0 0 0;
		padding: 0;
		list-style: none;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-height: 300px;
		overflow-y: auto;
	}

	.search-result-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		cursor: pointer;
		transition: background-color 0.1s ease;
		border-bottom: 1px solid #f0f0f0;
	}

	.search-result-item:last-child {
		border-bottom: none;
	}

	.search-result-item:hover,
	.search-result-item.highlighted {
		background-color: #f5f5f5;
	}

	.result-icon {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		color: #146ef5;
	}

	.result-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.result-name {
		font-weight: 500;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-address {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-type {
		flex-shrink: 0;
		font-size: 10px;
		padding: 2px 6px;
		background: #f0f0f0;
		border-radius: 4px;
		color: #666;
		text-transform: capitalize;
	}

	/* ==================================================
     Leaflet Overrides (scoped)
     ================================================== */
	.map-search-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-search-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
	}

	.map-search-container :global(.leaflet-control-zoom a:hover) {
		background: #f5f5f5;
	}

	.map-search-container :global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
	}

	.map-search-container :global(.leaflet-popup-content) {
		margin: 12px 16px;
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.search-spinner {
			animation: none;
			opacity: 0.5;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
