<!--
  ============================================================
  MapLive.svelte - Map with Real-Time Marker Additions
  ============================================================

  [CR] WHAT IT DOES
  Interactive map for dynamic marker creation and editing. Users click to add
  markers, drag to reposition, and use inline popups to edit details. Uses
  $bindable() for two-way sync with parent component. Implements cursor change
  and animated marker drops for clear UX feedback.

  [NTL] THE SIMPLE VERSION
  This is your "pin your own spots" map! Toggle add mode, click anywhere to
  drop a pin, drag it to adjust position, and click the pin to name it or
  delete it. Perfect for building custom location lists, route planning,
  or letting users mark their favourite places!

  FEATURES
  • Click-to-add markers with drop animation
  • Add mode toggle (crosshair cursor shows when active)
  • Edit marker details via popup form (title + description)
  • Drag markers to reposition
  • Delete button in popup
  • Bindable markers array for external sync ($bindable)
  • Maximum markers limit with visual feedback
  • Clear all markers button
  • Accessible controls (ARIA, keyboard support)
  • SSR safe

  USAGE
  ```svelte
  <script>
    import MapLive from '$lib/components/MapLive.svelte';
    import type { MapMarker } from '$lib/types';

    let markers = $state<MapMarker[]>([]);
  </script>

  <MapLive
    bind:markers
    center={{ lat: 51.5074, lng: -0.1278 }}
    height={500}
    maxMarkers={10}
    onMarkerAdd={(m) => console.log('Added:', m)}
  />
  ```

  DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapLiveProps, MapMarker, LatLng } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import { escapeHtml } from '$lib/htmlUtils';
	import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup, LeafletMouseEvent } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Array of marker data (bindable for external updates) */
		markers = $bindable([]),
		/** Initial map center coordinates */
		center = DEFAULT_MAP_CENTER,
		/** Initial zoom level (default: 13) */
		zoom = 13,
		/** Map container height in pixels (default: 500) */
		height = 500,
		/** Allow clicking map to add markers (default: true) */
		enableAddMode = true,
		/** Animate markers when added (default: true) */
		animateNewMarkers = true,
		/** Maximum markers allowed (0 = unlimited, default: 0) */
		maxMarkers = 0,
		/** Callback when marker is added */
		onMarkerAdd,
		/** Callback when marker is removed */
		onMarkerRemove
	}: MapLiveProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** Layer group for markers */
	let markerLayer: LayerGroup | undefined = $state();

	/** Whether add mode is active */
	let isAddMode = $state(true);

	/** Map of marker IDs to Leaflet markers */
	let markerMap = $state<Map<number, LeafletMarker>>(new Map());

	/** Counter for generating unique marker IDs */
	let nextMarkerId = $state(1);

	/** Currently editing marker (for popup form) */
	let editingMarker = $state<MapMarker | null>(null);

	/** Edit form values */
	let editTitle = $state('');
	let editDescription = $state('');

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/** Whether we can add more markers */
	let canAddMore = $derived(maxMarkers === 0 || markers.length < maxMarkers);

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

			// Create marker layer group
			markerLayer = L.layerGroup().addTo(mapInstance);

			// Handle map clicks for adding markers
			mapInstance.on('click', (e: LeafletMouseEvent) => {
				if (isAddMode && canAddMore && enableAddMode) {
					addMarkerAtPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
				}
			});

			map = mapInstance;

			// Find highest existing ID and set next ID
			if (markers.length > 0) {
				const maxId = Math.max(...markers.map((m) => m.id));
				nextMarkerId = maxId + 1;
			}

			// Add existing markers
			for (const markerData of markers) {
				await addLeafletMarker(markerData, false);
			}
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

	// ==================================================
	// FUNCTIONS - Marker management
	// ==================================================

	/**
	 * Add a new marker at the specified position
	 */
	async function addMarkerAtPosition(position: LatLng): Promise<void> {
		const newMarker: MapMarker = {
			id: nextMarkerId++,
			position,
			title: `Location ${markers.length + 1}`,
			description: '',
			category: 'user-added'
		};

		// Add to markers array
		markers = [...markers, newMarker];

		// Add Leaflet marker
		await addLeafletMarker(newMarker, animateNewMarkers);

		// Call callback
		onMarkerAdd?.(newMarker);
	}

	/**
	 * Add a Leaflet marker to the map
	 */
	async function addLeafletMarker(markerData: MapMarker, animate: boolean): Promise<void> {
		if (!map || !markerLayer) return;

		const L = await import('leaflet');

		const leafletMarker = L.marker([markerData.position.lat, markerData.position.lng], {
			draggable: true
		});

		// Create popup with edit form and autoPan to ensure popup is fully visible
		const popupContent = createPopupContent(markerData);
		leafletMarker.bindPopup(popupContent, {
			minWidth: 200,
			autoPan: true,
			autoPanPaddingTopLeft: L.point(50, 80),
			autoPanPaddingBottomRight: L.point(50, 50)
		});

		// Handle popup open - set up form handlers
		leafletMarker.on('popupopen', () => {
			setupPopupHandlers(markerData);
		});

		// Handle drag end - update marker position
		leafletMarker.on('dragend', () => {
			const newPos = leafletMarker.getLatLng();
			updateMarkerPosition(markerData.id, { lat: newPos.lat, lng: newPos.lng });
		});

		// Add to layer group
		markerLayer.addLayer(leafletMarker);

		// Store reference
		markerMap.set(markerData.id, leafletMarker);

		// Animate if enabled
		if (animate) {
			const el = leafletMarker.getElement();
			if (el) {
				el.classList.add('marker-animate-in');
				setTimeout(() => el.classList.remove('marker-animate-in'), 300);
			}
		}
	}

	/**
	 * Create popup HTML content
	 * All user data is escaped to prevent XSS attacks
	 */
	function createPopupContent(markerData: MapMarker): string {
		return `
			<div class="live-popup" data-marker-id="${markerData.id}">
				<div class="popup-header">
					<input
						type="text"
						class="popup-title-input"
						value="${escapeHtml(markerData.title)}"
						placeholder="Location name"
						data-field="title"
					/>
				</div>
				<textarea
					class="popup-description-input"
					placeholder="Add a description..."
					data-field="description"
				>${escapeHtml(markerData.description || '')}</textarea>
				<div class="popup-coords">
					${markerData.position.lat.toFixed(6)}, ${markerData.position.lng.toFixed(6)}
				</div>
				<div class="popup-actions">
					<button type="button" class="popup-save-btn" data-action="save">Save</button>
					<button type="button" class="popup-delete-btn" data-action="delete">Delete</button>
				</div>
			</div>
		`;
	}

	/**
	 * Set up event handlers for popup form
	 */
	function setupPopupHandlers(markerData: MapMarker): void {
		// Small delay to ensure popup is rendered
		setTimeout(() => {
			const popup = document.querySelector(`.live-popup[data-marker-id="${markerData.id}"]`);
			if (!popup) return;

			const titleInput = popup.querySelector('.popup-title-input') as HTMLInputElement;
			const descInput = popup.querySelector('.popup-description-input') as HTMLTextAreaElement;
			const saveBtn = popup.querySelector('.popup-save-btn');
			const deleteBtn = popup.querySelector('.popup-delete-btn');

			// Save handler - stop propagation to prevent map click adding new marker
			saveBtn?.addEventListener('click', (e) => {
				e.stopPropagation();
				const newTitle = titleInput?.value || 'Untitled';
				const newDesc = descInput?.value || '';
				updateMarkerDetails(markerData.id, newTitle, newDesc);

				// Close popup
				const leafletMarker = markerMap.get(markerData.id);
				leafletMarker?.closePopup();
			});

			// Delete handler - stop propagation to prevent map click adding new marker
			deleteBtn?.addEventListener('click', (e) => {
				e.stopPropagation();
				removeMarker(markerData.id);
			});
		}, 50);
	}

	/**
	 * Update marker position
	 */
	function updateMarkerPosition(id: number, newPosition: LatLng): void {
		markers = markers.map((m) =>
			m.id === id ? { ...m, position: newPosition } : m
		);
	}

	/**
	 * Update marker title and description
	 */
	function updateMarkerDetails(id: number, title: string, description: string): void {
		markers = markers.map((m) =>
			m.id === id ? { ...m, title, description } : m
		);

		// Update popup content
		const leafletMarker = markerMap.get(id);
		const markerData = markers.find((m) => m.id === id);
		if (leafletMarker && markerData) {
			leafletMarker.setPopupContent(createPopupContent(markerData));
		}
	}

	/**
	 * Remove a marker
	 */
	function removeMarker(id: number): void {
		const markerData = markers.find((m) => m.id === id);
		if (!markerData) return;

		// Remove from array
		markers = markers.filter((m) => m.id !== id);

		// Remove Leaflet marker
		const leafletMarker = markerMap.get(id);
		if (leafletMarker && markerLayer) {
			markerLayer.removeLayer(leafletMarker);
			markerMap.delete(id);
		}

		// Call callback
		onMarkerRemove?.(markerData);
	}

	/**
	 * Clear all markers
	 */
	function clearAllMarkers(): void {
		for (const marker of markers) {
			onMarkerRemove?.(marker);
		}
		markers = [];
		markerLayer?.clearLayers();
		markerMap = new Map();
	}

	/**
	 * Toggle add mode
	 */
	function toggleAddMode(): void {
		isAddMode = !isAddMode;
	}
</script>

<!--
  Map Live Container
-->
<div class="map-live-container" style="--map-height: {height}px">
	<!-- Control Bar -->
	<div class="control-bar">
		{#if enableAddMode}
			<button
				type="button"
				class="control-btn"
				class:active={isAddMode}
				onclick={toggleAddMode}
				aria-pressed={isAddMode}
				title={isAddMode ? 'Disable add mode' : 'Enable add mode'}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					{#if isAddMode}
						<circle cx="12" cy="12" r="10" />
						<path d="M12 8v8M8 12h8" />
					{:else}
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					{/if}
				</svg>
				{isAddMode ? 'Click map to add' : 'Add mode off'}
			</button>
		{/if}

		<span class="marker-count" aria-live="polite">
			{markers.length}{maxMarkers > 0 ? ` / ${maxMarkers}` : ''} markers
		</span>

		{#if markers.length > 0}
			<button
				type="button"
				class="control-btn danger"
				onclick={clearAllMarkers}
				title="Clear all markers"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
				</svg>
				Clear all
			</button>
		{/if}
	</div>

	<!-- Add Mode Indicator -->
	{#if isAddMode && enableAddMode}
		<div class="add-mode-indicator" aria-live="polite">
			{#if canAddMore}
				Click anywhere on the map to add a marker
			{:else}
				Maximum markers reached ({maxMarkers})
			{/if}
		</div>
	{/if}

	<!-- Map Element -->
	<div
		bind:this={mapContainer}
		class="map-element"
		class:add-mode={isAddMode && canAddMore && enableAddMode}
		role="application"
		aria-label="Interactive map - click to add markers"
	></div>
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-live-container {
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

	.map-element.add-mode {
		cursor: crosshair;
	}

	/* ==================================================
     Control Bar Styles
     ================================================== */
	.control-bar {
		position: absolute;
		top: 12px;
		left: 12px;
		right: 12px;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.control-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 500;
		color: #555;
		background: #f0f0f0;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.control-btn svg {
		width: 16px;
		height: 16px;
	}

	.control-btn:hover {
		background: #e0e0e0;
	}

	.control-btn.active {
		color: white;
		background: #146ef5;
	}

	.control-btn.danger {
		color: #dc2626;
	}

	.control-btn.danger:hover {
		background: #fee2e2;
	}

	.control-btn:focus {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.marker-count {
		flex: 1;
		text-align: center;
		font-size: 13px;
		color: #666;
	}

	/* ==================================================
     Add Mode Indicator
     ================================================== */
	.add-mode-indicator {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		padding: 8px 16px;
		font-size: 13px;
		color: white;
		background: rgba(20, 110, 245, 0.9);
		border-radius: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		white-space: nowrap;
	}

	/* ==================================================
     Marker Animation
     ================================================== */
	.map-live-container :global(.marker-animate-in) {
		animation: marker-drop 0.3s ease-out;
	}

	@keyframes marker-drop {
		0% {
			opacity: 0;
			transform: translateY(-20px) scale(0.5);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ==================================================
     Leaflet Overrides (scoped)
     ================================================== */
	.map-live-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-live-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
	}

	.map-live-container :global(.leaflet-control-zoom a:hover) {
		background: #f5f5f5;
	}

	/* Popup Styling */
	.map-live-container :global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		padding: 0;
		overflow: hidden;
	}

	.map-live-container :global(.leaflet-popup-content) {
		margin: 0;
		min-width: 220px;
	}

	.map-live-container :global(.live-popup) {
		padding: 12px;
	}

	.map-live-container :global(.popup-header) {
		margin-bottom: 8px;
	}

	.map-live-container :global(.popup-title-input) {
		width: 100%;
		padding: 8px;
		font-size: 14px;
		font-weight: 600;
		border: 1px solid #ddd;
		border-radius: 4px;
		outline: none;
	}

	.map-live-container :global(.popup-title-input:focus) {
		border-color: #146ef5;
		box-shadow: 0 0 0 2px rgba(20, 110, 245, 0.2);
	}

	.map-live-container :global(.popup-description-input) {
		width: 100%;
		padding: 8px;
		font-size: 13px;
		border: 1px solid #ddd;
		border-radius: 4px;
		outline: none;
		resize: vertical;
		min-height: 60px;
		font-family: inherit;
	}

	.map-live-container :global(.popup-description-input:focus) {
		border-color: #146ef5;
		box-shadow: 0 0 0 2px rgba(20, 110, 245, 0.2);
	}

	.map-live-container :global(.popup-coords) {
		margin-top: 8px;
		font-size: 11px;
		color: #888;
		font-family: monospace;
	}

	.map-live-container :global(.popup-actions) {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.map-live-container :global(.popup-save-btn),
	.map-live-container :global(.popup-delete-btn) {
		flex: 1;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 500;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.map-live-container :global(.popup-save-btn) {
		color: white;
		background: #146ef5;
	}

	.map-live-container :global(.popup-save-btn:hover) {
		background: #0d5fd3;
	}

	.map-live-container :global(.popup-delete-btn) {
		color: #dc2626;
		background: #fee2e2;
	}

	.map-live-container :global(.popup-delete-btn:hover) {
		background: #fecaca;
	}

	/* Draggable marker cursor */
	.map-live-container :global(.leaflet-marker-draggable) {
		cursor: move !important;
	}

	/* ==================================================
     Responsive Adjustments
     ================================================== */
	@media (max-width: 600px) {
		.control-bar {
			flex-wrap: wrap;
			gap: 8px;
		}

		.control-btn {
			padding: 6px 10px;
			font-size: 12px;
		}

		.marker-count {
			order: -1;
			width: 100%;
			text-align: left;
		}
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.map-live-container :global(.marker-animate-in) {
			animation: none;
		}

		.control-btn {
			transition: none;
		}
	}
</style>
