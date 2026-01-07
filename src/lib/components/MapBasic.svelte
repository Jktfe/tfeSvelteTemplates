<!--
  ============================================================
  MapBasic.svelte - Simple Interactive Map Component
  ============================================================

  [CR] WHAT IT DOES
  A self-contained interactive map using Leaflet.js and OpenStreetMap tiles.
  This component provides the foundation for more complex map components.
  Handles SSR safely by only initialising Leaflet on the client side.

  [NTL] THE SIMPLE VERSION
  This is your basic map widget! It shows a scrollable, zoomable map
  that starts centered wherever you tell it. Think Google Maps but simpler.
  Other map components build on top of this one.

  FEATURES
  • Pan and zoom controls
  • OpenStreetMap tile layer (free!)
  • Keyboard navigation support
  • Respects prefers-reduced-motion
  • SSR safe (client-side only initialization)

  USAGE
  ```svelte
  <MapBasic
    center={{ lat: 51.5074, lng: -0.1278 }}
    zoom={13}
    height={400}
  />
  ```

  DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapBasicProps, LatLng } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { Map as LeafletMap } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Initial map center coordinates (default: Central London) */
		center = DEFAULT_MAP_CENTER,
		/** Initial zoom level 1-18 (default: 13) */
		zoom = 13,
		/** Map container height in pixels (default: 400) */
		height = 400,
		/** Allow mouse wheel zoom (default: true) */
		enableScrollZoom = true,
		/** Show +/- zoom buttons (default: true) */
		showZoomControl = true,
		/** Show OpenStreetMap attribution (default: true) */
		showAttribution = true,
		/** Additional CSS classes for container */
		class: className = ''
	}: MapBasicProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance (client-side only) */
	let map: LeafletMap | undefined = $state();

	/** Current map view state (reactive) */
	// svelte-ignore state_referenced_locally
	let currentView: { center: LatLng; zoom: number } = $state({
		center: center,
		zoom: zoom
	});

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	// ==================================================
	// EFFECTS - Lifecycle and reactive updates
	// ==================================================

	/**
	 * Initialize Leaflet map on mount (client-side only)
	 * This effect handles the async import of Leaflet to ensure SSR compatibility
	 */
	$effect(() => {
		// Only run on client-side when container is available
		if (!isBrowser || !mapContainer) return;

		// Async initialization to dynamically import Leaflet
		let mapInstance: LeafletMap | undefined;

		(async () => {
			// Dynamically import Leaflet (SSR safe)
			const L = await import('leaflet');

			// Check for reduced motion preference
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// Create the map instance
			mapInstance = L.map(mapContainer, {
				center: [center.lat, center.lng],
				zoom: zoom,
				scrollWheelZoom: enableScrollZoom,
				zoomControl: showZoomControl,
				attributionControl: showAttribution,
				// Disable animations if user prefers reduced motion
				zoomAnimation: !prefersReducedMotion,
				fadeAnimation: !prefersReducedMotion,
				markerZoomAnimation: !prefersReducedMotion
			});

			// Add OpenStreetMap tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: showAttribution
					? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					: '',
				maxZoom: 19
			}).addTo(mapInstance);

			// Update current view state on map move
			mapInstance.on('moveend', () => {
				if (mapInstance) {
					const mapCenter = mapInstance.getCenter();
					currentView = {
						center: { lat: mapCenter.lat, lng: mapCenter.lng },
						zoom: mapInstance.getZoom()
					};
				}
			});

			// Store map reference
			map = mapInstance;
		})();

		// Cleanup function - destroy map on unmount
		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
			}
		};
	});

	/**
	 * Update map view when center/zoom props change
	 */
	$effect(() => {
		if (map) {
			map.setView([center.lat, center.lng], zoom);
		}
	});

	// ==================================================
	// PUBLIC METHODS - Exposed for parent component use
	// ==================================================

	/**
	 * Get the Leaflet map instance
	 * @returns The Leaflet map instance or undefined if not initialized
	 */
	export function getMap(): LeafletMap | undefined {
		return map;
	}

	/**
	 * Get current map view (center and zoom)
	 * @returns Current view state
	 */
	export function getView(): { center: LatLng; zoom: number } {
		return currentView;
	}

	/**
	 * Pan to a specific location
	 * @param position - Target coordinates
	 * @param newZoom - Optional zoom level
	 */
	export function panTo(position: LatLng, newZoom?: number): void {
		if (map) {
			if (newZoom !== undefined) {
				map.setView([position.lat, position.lng], newZoom);
			} else {
				map.panTo([position.lat, position.lng]);
			}
		}
	}

	/**
	 * Set the map view (center and zoom)
	 * @param position - Target coordinates
	 * @param newZoom - Zoom level
	 */
	export function setView(position: LatLng, newZoom: number): void {
		if (map) {
			map.setView([position.lat, position.lng], newZoom);
		}
	}
</script>

<!--
  Map Container
  The map is rendered inside this div by Leaflet
  ARIA role="application" signals this is an interactive widget
-->
<div
	class="map-basic-container {className}"
	style="--map-height: {height}px"
	role="application"
	aria-label="Interactive map"
>
	<div bind:this={mapContainer} class="map-element"></div>
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-basic-container {
		position: relative;
		width: 100%;
		height: var(--map-height, 400px);
		border-radius: 8px;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	/* Map element fills container */
	.map-element {
		width: 100%;
		height: 100%;
	}

	/* ==================================================
     Leaflet Overrides (scoped)
     ================================================== */

	/* Ensure map controls have proper z-index */
	.map-basic-container :global(.leaflet-control-container) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.map-basic-container :global(.leaflet-control) {
		pointer-events: auto;
	}

	/* Improve zoom control styling */
	.map-basic-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-basic-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
		transition: background-color 0.15s ease;
	}

	.map-basic-container :global(.leaflet-control-zoom a:hover) {
		background: #f5f5f5;
	}

	.map-basic-container :global(.leaflet-control-zoom a:focus) {
		outline: 2px solid #146ef5;
		outline-offset: -2px;
	}

	/* Attribution styling */
	.map-basic-container :global(.leaflet-control-attribution) {
		background: rgba(255, 255, 255, 0.85);
		padding: 2px 8px;
		font-size: 11px;
		border-radius: 4px 0 0 0;
	}

	/* Focus styles for accessibility */
	.map-basic-container :global(.leaflet-container:focus) {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.map-basic-container :global(.leaflet-fade-anim .leaflet-tile),
		.map-basic-container :global(.leaflet-zoom-anim .leaflet-zoom-animated) {
			transition: none !important;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
