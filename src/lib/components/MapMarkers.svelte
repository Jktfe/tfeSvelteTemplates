<!--
  ============================================================
  MapMarkers.svelte - Map with Database Markers and Category Filtering
  ============================================================

  [CR] WHAT IT DOES
  Interactive map displaying markers from database with popups and category filtering.
  Extends MapBasic with marker data layer, popup templates, and filter UI.
  All marker content is XSS-sanitized using escapeHtml() before rendering.

  [NTL] THE SIMPLE VERSION
  This is your "show me stuff on a map" component! Give it a list of places
  (like restaurants, shops, or landmarks) and it'll put pins on the map for
  each one. Click a pin to see details. Filter by category with the pill buttons!

  FEATURES
  • Display markers from database/array
  • Category filter pills for easy filtering
  • Rich popup content with metadata (address, phone, hours, rating)
  • Auto-fit bounds to show all markers
  • Marker count indicator ("Showing 5 of 12 locations")
  • XSS protection - all user content escaped
  • Accessible filter interface (ARIA labels, keyboard nav)
  • SSR safe

  USAGE
  ```svelte
  <script>
    import MapMarkers from '$lib/components/MapMarkers.svelte';
    let { data } = $props();
  </script>

  <MapMarkers
    markers={data.markers}
    height={500}
    showCategories={true}
    onMarkerClick={(marker) => console.log('Clicked:', marker)}
  />
  ```

  DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapMarkersProps, MapMarker, LatLng } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import { escapeHtml } from '$lib/htmlUtils';
	import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Array of marker data to display */
		markers = [],
		/** Initial map center (auto-calculated from markers if not provided) */
		center,
		/** Initial zoom level (auto-calculated if not provided) */
		zoom,
		/** Map container height in pixels (default: 500) */
		height = 500,
		/** Group nearby markers into clusters (default: false) - NOT YET IMPLEMENTED */
		enableClustering = false,
		/** Show category filter UI (default: true) */
		showCategories = true,
		/** Callback when marker is clicked */
		onMarkerClick
	}: MapMarkersProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** Layer group for markers */
	let markerLayer: LayerGroup | undefined = $state();

	/** Active category filter (null = show all) */
	let activeCategory = $state<string | null>(null);

	/** Map of marker IDs to Leaflet markers */
	let markerMap = $state<Map<number, LeafletMarker>>(new Map());

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/** Get unique categories from markers */
	let categories = $derived(() => {
		const cats = new Set(markers.map((m) => m.category).filter(Boolean));
		return Array.from(cats).sort() as string[];
	});

	/** Filter markers by active category */
	let filteredMarkers = $derived(() => {
		if (!activeCategory) return markers;
		return markers.filter((m) => m.category === activeCategory);
	});

	/** Calculate bounds for all visible markers */
	let markerBounds = $derived(() => {
		const visible = filteredMarkers();
		if (visible.length === 0) {
			return { center: DEFAULT_MAP_CENTER, zoom: 13 };
		}
		if (visible.length === 1) {
			return { center: visible[0].position, zoom: 15 };
		}

		const lats = visible.map((m) => m.position.lat);
		const lngs = visible.map((m) => m.position.lng);

		const calcCenter: LatLng = {
			lat: (Math.min(...lats) + Math.max(...lats)) / 2,
			lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
		};

		const latSpread = Math.max(...lats) - Math.min(...lats);
		const lngSpread = Math.max(...lngs) - Math.min(...lngs);
		const maxSpread = Math.max(latSpread, lngSpread);

		let calcZoom = 13;
		if (maxSpread > 5) calcZoom = 6;
		else if (maxSpread > 2) calcZoom = 8;
		else if (maxSpread > 0.5) calcZoom = 10;
		else if (maxSpread > 0.1) calcZoom = 12;
		else if (maxSpread > 0.01) calcZoom = 14;
		else calcZoom = 15;

		return { center: calcCenter, zoom: calcZoom };
	});

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

			// Use provided center/zoom or calculate from markers
			const initialBounds = markerBounds();
			const initialCenter = center ?? initialBounds.center;
			const initialZoom = zoom ?? initialBounds.zoom;

			mapInstance = L.map(mapContainer, {
				center: [initialCenter.lat, initialCenter.lng],
				zoom: initialZoom,
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

			// Create marker layer group
			markerLayer = L.layerGroup().addTo(mapInstance);

			map = mapInstance;

			// Add initial markers
			addMarkersToMap(filteredMarkers());
		})();

		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
				markerLayer = undefined;
				markerMap = new Map();
			}
		};
	});

	/**
	 * Update markers when filtered markers change
	 */
	$effect(() => {
		if (map && markerLayer) {
			addMarkersToMap(filteredMarkers());
		}
	});

	// ==================================================
	// FUNCTIONS - Marker management
	// ==================================================

	/**
	 * Add markers to the map
	 */
	async function addMarkersToMap(markersToAdd: MapMarker[]): Promise<void> {
		if (!map || !markerLayer) return;

		const L = await import('leaflet');

		// Clear existing markers
		markerLayer.clearLayers();
		markerMap = new Map();

		// Add new markers
		for (const markerData of markersToAdd) {
			const leafletMarker = L.marker([markerData.position.lat, markerData.position.lng]);

			// Create popup content with autoPan to ensure popup is fully visible
			const popupContent = createPopupContent(markerData);
			leafletMarker.bindPopup(popupContent, {
				autoPan: true,
				autoPanPaddingTopLeft: L.point(50, 80),
				autoPanPaddingBottomRight: L.point(50, 50)
			});

			// Add click handler
			leafletMarker.on('click', () => {
				onMarkerClick?.(markerData);
			});

			// Add to layer group
			markerLayer.addLayer(leafletMarker);

			// Store reference
			markerMap.set(markerData.id, leafletMarker);
		}

		// Fit bounds to show all markers
		if (markersToAdd.length > 0) {
			const bounds = L.latLngBounds(markersToAdd.map((m) => [m.position.lat, m.position.lng]));
			map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
		}
	}

	/**
	 * Create popup HTML content for a marker
	 * All user data is escaped to prevent XSS attacks
	 */
	function createPopupContent(markerData: MapMarker): string {
		let content = '<div class="marker-popup">';

		// Image if available - escape URL and alt text
		if (markerData.imageUrl) {
			content += `<img src="${escapeHtml(markerData.imageUrl)}" alt="${escapeHtml(markerData.title)}" class="popup-image" />`;
		}

		// Title - escaped
		content += `<h3 class="popup-title">${escapeHtml(markerData.title)}</h3>`;

		// Description - escaped
		if (markerData.description) {
			content += `<p class="popup-description">${escapeHtml(markerData.description)}</p>`;
		}

		// Metadata - all values escaped
		if (markerData.metadata) {
			content += '<div class="popup-metadata">';

			if (markerData.metadata.address) {
				content += `<div class="popup-meta-item"><strong>Address:</strong> ${escapeHtml(markerData.metadata.address)}</div>`;
			}
			if (markerData.metadata.phone) {
				const safePhone = escapeHtml(markerData.metadata.phone);
				content += `<div class="popup-meta-item"><strong>Phone:</strong> <a href="tel:${safePhone}">${safePhone}</a></div>`;
			}
			if (markerData.metadata.website) {
				content += `<div class="popup-meta-item"><strong>Website:</strong> <a href="${escapeHtml(markerData.metadata.website)}" target="_blank" rel="noopener">Visit</a></div>`;
			}
			if (markerData.metadata.hours) {
				content += `<div class="popup-meta-item"><strong>Hours:</strong> ${escapeHtml(markerData.metadata.hours)}</div>`;
			}
			if (markerData.metadata.rating) {
				content += `<div class="popup-meta-item"><strong>Rating:</strong> ${Number(markerData.metadata.rating)}/5</div>`;
			}

			content += '</div>';
		}

		// Category badge - escaped
		if (markerData.category) {
			content += `<span class="popup-category">${escapeHtml(markerData.category)}</span>`;
		}

		content += '</div>';
		return content;
	}

	/**
	 * Set active category filter
	 */
	function setCategory(category: string | null): void {
		activeCategory = category;
	}

	/**
	 * Get category display label
	 */
	function getCategoryLabel(category: string): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<!--
  Map Markers Container
-->
<div class="map-markers-container" style="--map-height: {height}px">
	<!-- Category Filter Bar -->
	{#if showCategories && categories().length > 1}
		<div class="filter-bar" role="group" aria-label="Filter markers by category">
			<button
				type="button"
				class="filter-pill"
				class:active={activeCategory === null}
				onclick={() => setCategory(null)}
				aria-pressed={activeCategory === null}
			>
				All ({markers.length})
			</button>

			{#each categories() as category (category)}
				<button
					type="button"
					class="filter-pill"
					class:active={activeCategory === category}
					onclick={() => setCategory(category)}
					aria-pressed={activeCategory === category}
				>
					{getCategoryLabel(category)}
					({markers.filter((m) => m.category === category).length})
				</button>
			{/each}
		</div>
	{/if}

	<!-- Marker Count Indicator -->
	<div class="marker-count" aria-live="polite">
		Showing {filteredMarkers().length} of {markers.length} locations
	</div>

	<!-- Map Element -->
	<div bind:this={mapContainer} class="map-element" role="application" aria-label="Map showing locations"></div>
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-markers-container {
		position: relative;
		width: 100%;
		height: var(--map-height, 500px);
		border-radius: 8px;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.map-element {
		width: 100%;
		height: 100%;
	}

	/* ==================================================
     Filter Bar Styles
     ================================================== */
	.filter-bar {
		position: absolute;
		top: 12px;
		left: 12px;
		right: 12px;
		z-index: 1000;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 8px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.filter-pill {
		display: inline-flex;
		align-items: center;
		padding: 6px 12px;
		font-size: 13px;
		font-weight: 500;
		color: #555;
		background: #f0f0f0;
		border: none;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.filter-pill:hover {
		background: #e0e0e0;
	}

	.filter-pill.active {
		color: white;
		background: #146ef5;
	}

	.filter-pill:focus {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	/* ==================================================
     Marker Count Indicator
     ================================================== */
	.marker-count {
		position: absolute;
		bottom: 12px;
		left: 12px;
		z-index: 1000;
		padding: 6px 12px;
		font-size: 12px;
		color: #333;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 4px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	/* ==================================================
     Leaflet Overrides (scoped)
     ================================================== */
	.map-markers-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-markers-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
	}

	.map-markers-container :global(.leaflet-control-zoom a:hover) {
		background: #f5f5f5;
	}

	/* Popup Styling */
	.map-markers-container :global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		padding: 0;
		overflow: hidden;
	}

	.map-markers-container :global(.leaflet-popup-content) {
		margin: 0;
		min-width: 200px;
		max-width: 300px;
	}

	.map-markers-container :global(.marker-popup) {
		padding: 0;
	}

	.map-markers-container :global(.popup-image) {
		width: 100%;
		height: 120px;
		object-fit: cover;
		display: block;
	}

	.map-markers-container :global(.popup-title) {
		margin: 12px 16px 8px;
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}

	.map-markers-container :global(.popup-description) {
		margin: 0 16px 8px;
		font-size: 13px;
		color: #666;
		line-height: 1.4;
	}

	.map-markers-container :global(.popup-metadata) {
		margin: 8px 16px;
		padding-top: 8px;
		border-top: 1px solid #eee;
	}

	.map-markers-container :global(.popup-meta-item) {
		font-size: 12px;
		color: #666;
		margin-bottom: 4px;
	}

	.map-markers-container :global(.popup-meta-item a) {
		color: #146ef5;
		text-decoration: none;
	}

	.map-markers-container :global(.popup-meta-item a:hover) {
		text-decoration: underline;
	}

	.map-markers-container :global(.popup-category) {
		display: inline-block;
		margin: 8px 16px 12px;
		padding: 2px 8px;
		font-size: 11px;
		font-weight: 500;
		color: #146ef5;
		background: rgba(20, 110, 245, 0.1);
		border-radius: 4px;
		text-transform: capitalize;
	}

	/* ==================================================
     Responsive Adjustments
     ================================================== */
	@media (max-width: 600px) {
		.filter-bar {
			padding: 6px;
			gap: 6px;
		}

		.filter-pill {
			padding: 4px 10px;
			font-size: 12px;
		}
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.filter-pill {
			transition: none;
		}
	}
</style>
