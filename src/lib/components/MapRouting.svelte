<!--
  ============================================================
  MapRouting.svelte - A→B Routing Map with Directions
  ============================================================

  🎯 WHAT IT DOES
  Interactive map for calculating and displaying routes between two points
  using the free OSRM (Open Source Routing Machine) API. Includes turn-by-turn
  directions, distance/duration display, and draggable waypoints.

  ✨ FEATURES
  • Click-to-set origin (A) and destination (B) points
  • Route calculation via OSRM (free, no API key required)
  • Turn-by-turn directions panel
  • Distance and duration display
  • Multiple routing profiles (driving, cycling, walking)
  • Draggable markers to adjust route
  • Route polyline with custom styling
  • Clear/reset functionality

  ♿ ACCESSIBILITY
  • Keyboard: Tab to controls, Enter to interact
  • Screen readers: ARIA labels for all controls
  • Motion: Respects prefers-reduced-motion

  📦 DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • OSRM API (free, public routing service)
  • Leaflet CSS (add to app.html or import globally)

  ⚡ PERFORMANCE
  • Debounced route calculation
  • Efficient polyline updates
  • Lazy-loaded directions

  🎨 USAGE
  ```svelte
  <script>
    import MapRouting from '$lib/components/MapRouting.svelte';

    let origin = { lat: 51.5074, lng: -0.1278 };
    let destination = { lat: 51.5155, lng: -0.0922 };
  </script>

  <MapRouting
    bind:origin
    bind:destination
    profile="driving"
    height={500}
    onRouteCalculated={(route) => console.log(route)}
  />
  ```

  ============================================================
  @component
-->
<script lang="ts">
	import type {
		MapRoutingProps,
		LatLng,
		RouteResult,
		RouteStep,
		RoutingProfile
	} from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Starting point coordinates (bindable) */
		origin = $bindable<LatLng | undefined>(undefined),
		/** End point coordinates (bindable) */
		destination = $bindable<LatLng | undefined>(undefined),
		/** Initial map center (auto-calculated from route if not provided) */
		center = DEFAULT_MAP_CENTER,
		/** Initial zoom level (default: 13) */
		zoom = 13,
		/** Map container height in pixels (default: 500) */
		height = 500,
		/** Routing mode (default: 'driving') */
		profile = 'driving' as RoutingProfile,
		/** Show turn-by-turn instructions panel (default: true) */
		showInstructions = true,
		/** Show total distance badge (default: true) */
		showDistance = true,
		/** Show total duration badge (default: true) */
		showDuration = true,
		/** Colour of the route line (default: '#146ef5') */
		routeColor = '#146ef5',
		/** Width of the route line in pixels (default: 5) */
		routeWeight = 5,
		/** Allow dragging waypoints to modify route (default: true) */
		draggableWaypoints = true,
		/** Allow clicking map to set origin/destination (default: true) */
		enableClickToSet = true,
		/** Callback when route is successfully calculated */
		onRouteCalculated,
		/** Callback when routing fails */
		onRouteError,
		/** Additional CSS classes for container */
		class: className = ''
	}: MapRoutingProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** Origin marker */
	let originMarker: LeafletMarker | undefined = $state();

	/** Destination marker */
	let destinationMarker: LeafletMarker | undefined = $state();

	/** Route polyline */
	let routeLine: LeafletPolyline | undefined = $state();

	/** Current route result */
	let currentRoute = $state<RouteResult | null>(null);

	/** Loading state */
	let isCalculating = $state(false);

	/** Error state */
	let routeError = $state<string | null>(null);

	/** Click mode for setting points */
	let clickMode = $state<'origin' | 'destination' | null>('origin');

	/** Instructions panel expanded state */
	let instructionsExpanded = $state(false);

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/** Format distance for display */
	function formatDistance(metres: number): string {
		if (metres >= 1000) {
			return `${(metres / 1000).toFixed(1)} km`;
		}
		return `${Math.round(metres)} m`;
	}

	/** Format duration for display */
	function formatDuration(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes} min`;
	}

	/** Get profile icon */
	function getProfileIcon(p: RoutingProfile): string {
		switch (p) {
			case 'cycling':
				return `<path d="M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 19V9m0 0l3 3m-3-3l-3 3M12 9l4-4h4"/>`;
			case 'walking':
				return `<circle cx="12" cy="5" r="2"/><path d="M12 7v4m0 0l-2 5m2-5l2 5m-4-3l-2 1m6-1l2 1"/>`;
			default:
				return `<path d="M7 17h10M5 13h14l-2-5H7l-2 5zm0 0v4h2v-4m10 0v4h2v-4"/>`;
		}
	}

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

			// Calculate initial center
			let initialCenter = center;
			if (origin && destination) {
				initialCenter = {
					lat: (origin.lat + destination.lat) / 2,
					lng: (origin.lng + destination.lng) / 2
				};
			} else if (origin) {
				initialCenter = origin;
			} else if (destination) {
				initialCenter = destination;
			}

			mapInstance = L.map(mapContainer, {
				center: [initialCenter.lat, initialCenter.lng],
				zoom: zoom,
				scrollWheelZoom: true,
				zoomControl: false,
				attributionControl: true,
				zoomAnimation: !prefersReducedMotion,
				fadeAnimation: !prefersReducedMotion
			});

			// Add zoom control to bottom-right
			L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}).addTo(mapInstance);

			// Handle map clicks for setting points
			if (enableClickToSet) {
				mapInstance.on('click', (e) => {
					if (clickMode === 'origin') {
						origin = { lat: e.latlng.lat, lng: e.latlng.lng };
						clickMode = 'destination';
					} else if (clickMode === 'destination') {
						destination = { lat: e.latlng.lat, lng: e.latlng.lng };
						clickMode = null;
					}
				});
			}

			map = mapInstance;

			// Add existing markers and calculate route if both points exist
			await updateMarkers();
			if (origin && destination) {
				await calculateRoute();
			}
		})();

		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
				originMarker = undefined;
				destinationMarker = undefined;
				routeLine = undefined;
			}
		};
	});

	/**
	 * Update markers and route when origin/destination changes
	 */
	$effect(() => {
		if (map) {
			updateMarkers();
			if (origin && destination) {
				calculateRoute();
			}
		}
	});

	// ==================================================
	// FUNCTIONS - Routing and marker management
	// ==================================================

	/**
	 * Create marker icon
	 */
	async function createMarkerIcon(type: 'origin' | 'destination') {
		const L = await import('leaflet');

		const color = type === 'origin' ? '#22c55e' : '#ef4444';
		const label = type === 'origin' ? 'A' : 'B';

		return L.divIcon({
			className: 'routing-marker-wrapper',
			html: `
				<div class="routing-marker" style="--marker-color: ${color}">
					<span class="marker-label">${label}</span>
				</div>
			`,
			iconSize: [32, 32],
			iconAnchor: [16, 32]
		});
	}

	/**
	 * Update markers on map
	 */
	async function updateMarkers(): Promise<void> {
		if (!map) return;

		const L = await import('leaflet');

		// Update origin marker
		if (origin) {
			if (originMarker) {
				originMarker.setLatLng([origin.lat, origin.lng]);
			} else {
				const icon = await createMarkerIcon('origin');
				originMarker = L.marker([origin.lat, origin.lng], {
					icon,
					draggable: draggableWaypoints
				}).addTo(map);

				originMarker.on('dragend', () => {
					if (originMarker) {
						const pos = originMarker.getLatLng();
						origin = { lat: pos.lat, lng: pos.lng };
					}
				});
			}
		} else if (originMarker) {
			originMarker.remove();
			originMarker = undefined;
		}

		// Update destination marker
		if (destination) {
			if (destinationMarker) {
				destinationMarker.setLatLng([destination.lat, destination.lng]);
			} else {
				const icon = await createMarkerIcon('destination');
				destinationMarker = L.marker([destination.lat, destination.lng], {
					icon,
					draggable: draggableWaypoints
				}).addTo(map);

				destinationMarker.on('dragend', () => {
					if (destinationMarker) {
						const pos = destinationMarker.getLatLng();
						destination = { lat: pos.lat, lng: pos.lng };
					}
				});
			}
		} else if (destinationMarker) {
			destinationMarker.remove();
			destinationMarker = undefined;
		}
	}

	/**
	 * Calculate route using OSRM
	 */
	async function calculateRoute(): Promise<void> {
		if (!origin || !destination || !map) return;

		const L = await import('leaflet');

		isCalculating = true;
		routeError = null;

		try {
			// OSRM public demo server - for production use your own server
			const osrmProfile = profile === 'walking' ? 'foot' : profile === 'cycling' ? 'bike' : 'car';
			const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error('Failed to calculate route');
			}

			const data = await response.json();

			if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
				throw new Error('No route found');
			}

			const route = data.routes[0];
			const coordinates: LatLng[] = route.geometry.coordinates.map((coord: number[]) => ({
				lat: coord[1],
				lng: coord[0]
			}));

			// Parse steps if available
			const steps: RouteStep[] = [];
			if (route.legs && route.legs[0] && route.legs[0].steps) {
				for (const step of route.legs[0].steps) {
					steps.push({
						instruction: step.name || step.maneuver?.type || 'Continue',
						distance: step.distance,
						duration: step.duration,
						maneuver: step.maneuver?.type,
						coordinates: {
							lat: step.maneuver?.location[1] ?? 0,
							lng: step.maneuver?.location[0] ?? 0
						}
					});
				}
			}

			const result: RouteResult = {
				coordinates,
				distance: route.distance,
				duration: route.duration,
				steps,
				summary: route.summary
			};

			currentRoute = result;

			// Draw route on map
			const latLngs = coordinates.map((c) => [c.lat, c.lng] as [number, number]);

			if (routeLine) {
				routeLine.setLatLngs(latLngs);
			} else {
				routeLine = L.polyline(latLngs, {
					color: routeColor,
					weight: routeWeight,
					opacity: 0.8,
					lineJoin: 'round',
					lineCap: 'round'
				}).addTo(map);
			}

			// Fit bounds to show full route
			map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

			onRouteCalculated?.(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to calculate route';
			routeError = message;
			onRouteError?.(message);
		} finally {
			isCalculating = false;
		}
	}

	/**
	 * Clear route and markers
	 */
	function clearRoute(): void {
		origin = undefined;
		destination = undefined;
		currentRoute = null;
		routeError = null;
		clickMode = 'origin';

		if (routeLine) {
			routeLine.remove();
			routeLine = undefined;
		}
		if (originMarker) {
			originMarker.remove();
			originMarker = undefined;
		}
		if (destinationMarker) {
			destinationMarker.remove();
			destinationMarker = undefined;
		}
	}

	/**
	 * Swap origin and destination
	 */
	function swapPoints(): void {
		const temp = origin;
		origin = destination;
		destination = temp;
	}
</script>

<!--
  Map Routing Container
-->
<div class="map-routing-container {className}" style="--map-height: {height}px">
	<!-- Control Panel -->
	<div class="control-panel">
		<!-- Profile Selector -->
		<div class="profile-selector" role="radiogroup" aria-label="Travel mode">
			{#each ['driving', 'cycling', 'walking'] as p}
				<button
					type="button"
					class="profile-btn"
					class:active={profile === p}
					onclick={() => (profile = p as RoutingProfile)}
					aria-pressed={profile === p}
					title={p.charAt(0).toUpperCase() + p.slice(1)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{@html getProfileIcon(p as RoutingProfile)}
					</svg>
				</button>
			{/each}
		</div>

		<!-- Point Inputs -->
		<div class="point-inputs">
			<div class="point-row">
				<span class="point-badge origin">A</span>
				<span class="point-text">
					{#if origin}
						{origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
					{:else}
						<button class="set-point-btn" onclick={() => (clickMode = 'origin')}>
							Click map to set origin
						</button>
					{/if}
				</span>
			</div>

			<button type="button" class="swap-btn" onclick={swapPoints} title="Swap origin and destination" disabled={!origin || !destination}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M7 16V4m0 12l-4-4m4 4l4-4M17 8v12m0-12l4 4m-4-4l-4 4" />
				</svg>
			</button>

			<div class="point-row">
				<span class="point-badge destination">B</span>
				<span class="point-text">
					{#if destination}
						{destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
					{:else}
						<button class="set-point-btn" onclick={() => (clickMode = 'destination')}>
							Click map to set destination
						</button>
					{/if}
				</span>
			</div>
		</div>

		<!-- Clear Button -->
		{#if origin || destination}
			<button type="button" class="clear-btn" onclick={clearRoute}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
				Clear
			</button>
		{/if}
	</div>

	<!-- Route Info Badge -->
	{#if currentRoute && (showDistance || showDuration)}
		<div class="route-info">
			{#if showDistance}
				<span class="route-distance">{formatDistance(currentRoute.distance)}</span>
			{/if}
			{#if showDuration}
				<span class="route-duration">{formatDuration(currentRoute.duration)}</span>
			{/if}
		</div>
	{/if}

	<!-- Instructions Panel -->
	{#if showInstructions && currentRoute && currentRoute.steps && currentRoute.steps.length > 0}
		<div class="instructions-panel" class:expanded={instructionsExpanded}>
			<button
				type="button"
				class="instructions-toggle"
				onclick={() => (instructionsExpanded = !instructionsExpanded)}
				aria-expanded={instructionsExpanded}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 5l7 7-7 7" />
				</svg>
				Directions ({currentRoute.steps.length} steps)
			</button>

			{#if instructionsExpanded}
				<div class="instructions-list">
					{#each currentRoute.steps as step, i}
						<div class="instruction-item">
							<span class="step-number">{i + 1}</span>
							<div class="step-content">
								<span class="step-instruction">{step.instruction}</span>
								<span class="step-distance">{formatDistance(step.distance)}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Click Mode Indicator -->
	{#if enableClickToSet && clickMode}
		<div class="click-mode-indicator">
			Click map to set {clickMode === 'origin' ? 'origin (A)' : 'destination (B)'}
		</div>
	{/if}

	<!-- Loading Indicator -->
	{#if isCalculating}
		<div class="calculating-overlay">
			<div class="calculating-spinner"></div>
			<span>Calculating route...</span>
		</div>
	{/if}

	<!-- Error Message -->
	{#if routeError}
		<div class="route-error" role="alert">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v4M12 16h.01" />
			</svg>
			<span>{routeError}</span>
		</div>
	{/if}

	<!-- Map Element -->
	<div
		bind:this={mapContainer}
		class="map-element"
		class:click-mode-active={enableClickToSet && clickMode}
		role="application"
		aria-label="Route planning map"
	></div>
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-routing-container {
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

	.map-element.click-mode-active {
		cursor: crosshair;
	}

	/* ==================================================
     Control Panel Styles
     ================================================== */
	.control-panel {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		max-width: 280px;
	}

	.profile-selector {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: #f0f0f0;
		border-radius: 6px;
	}

	.profile-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.profile-btn svg {
		width: 20px;
		height: 20px;
		color: #666;
	}

	.profile-btn:hover {
		background: rgba(255, 255, 255, 0.8);
	}

	.profile-btn.active {
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.profile-btn.active svg {
		color: #146ef5;
	}

	.point-inputs {
		display: flex;
		flex-direction: column;
		gap: 8px;
		position: relative;
	}

	.point-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.point-badge {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		color: white;
		border-radius: 50%;
	}

	.point-badge.origin {
		background: #22c55e;
	}

	.point-badge.destination {
		background: #ef4444;
	}

	.point-text {
		flex: 1;
		font-size: 12px;
		font-family: monospace;
		color: #666;
	}

	.set-point-btn {
		padding: 0;
		border: none;
		background: transparent;
		color: #146ef5;
		font-size: 12px;
		cursor: pointer;
		text-decoration: underline;
	}

	.swap-btn {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 1px solid #ddd;
		background: white;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.swap-btn:hover:not(:disabled) {
		background: #f5f5f5;
		border-color: #146ef5;
	}

	.swap-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.swap-btn svg {
		width: 16px;
		height: 16px;
		color: #666;
	}

	.clear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 8px;
		border: none;
		background: #f0f0f0;
		color: #666;
		font-size: 12px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-btn:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.clear-btn svg {
		width: 14px;
		height: 14px;
	}

	/* ==================================================
     Route Info Badge
     ================================================== */
	.route-info {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 1000;
		display: flex;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.route-distance {
		font-weight: 600;
		color: #333;
	}

	.route-duration {
		color: #666;
	}

	/* ==================================================
     Instructions Panel
     ================================================== */
	.instructions-panel {
		position: absolute;
		bottom: 12px;
		left: 12px;
		z-index: 1000;
		max-width: 300px;
		max-height: 300px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	.instructions-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: transparent;
		font-size: 13px;
		font-weight: 500;
		color: #333;
		cursor: pointer;
		text-align: left;
	}

	.instructions-toggle svg {
		width: 16px;
		height: 16px;
		transition: transform 0.2s ease;
	}

	.instructions-panel.expanded .instructions-toggle svg {
		transform: rotate(90deg);
	}

	.instructions-list {
		max-height: 200px;
		overflow-y: auto;
		border-top: 1px solid #eee;
	}

	.instruction-item {
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		border-bottom: 1px solid #f0f0f0;
	}

	.instruction-item:last-child {
		border-bottom: none;
	}

	.step-number {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 600;
		color: white;
		background: #146ef5;
		border-radius: 50%;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.step-instruction {
		font-size: 13px;
		color: #333;
	}

	.step-distance {
		font-size: 11px;
		color: #666;
	}

	/* ==================================================
     Click Mode Indicator
     ================================================== */
	.click-mode-indicator {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		padding: 8px 16px;
		background: rgba(20, 110, 245, 0.9);
		color: white;
		font-size: 13px;
		border-radius: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		white-space: nowrap;
	}

	/* ==================================================
     Loading Overlay
     ================================================== */
	.calculating-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1001;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: rgba(255, 255, 255, 0.8);
		color: #333;
	}

	.calculating-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #f0f0f0;
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
     Error Message
     ================================================== */
	.route-error {
		position: absolute;
		bottom: 60px;
		left: 12px;
		right: 12px;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #dc2626;
		font-size: 13px;
	}

	.route-error svg {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
	}

	/* ==================================================
     Custom Marker Styles (injected into Leaflet)
     ================================================== */
	.map-routing-container :global(.routing-marker-wrapper) {
		background: transparent !important;
		border: none !important;
	}

	.map-routing-container :global(.routing-marker) {
		position: relative;
		width: 32px;
		height: 32px;
	}

	.map-routing-container :global(.routing-marker::before) {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-top: 12px solid var(--marker-color);
	}

	.map-routing-container :global(.marker-label) {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 700;
		color: white;
		background: var(--marker-color);
		border-radius: 50%;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	/* ==================================================
     Leaflet Overrides
     ================================================== */
	.map-routing-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-routing-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
	}

	/* ==================================================
     Responsive Adjustments
     ================================================== */
	@media (max-width: 600px) {
		.control-panel {
			max-width: calc(100% - 24px);
		}

		.instructions-panel {
			max-width: calc(100% - 24px);
		}
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.calculating-spinner {
			animation: none;
			opacity: 0.5;
		}

		.instructions-toggle svg {
			transition: none;
		}
	}
</style>
