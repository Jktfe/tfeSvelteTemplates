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

  THEMING (see docs/THEMING.md)
  Chrome tokens flip with `prefers-color-scheme: dark`; the two
  semantic markers stay constant in both modes (Pattern #67 split:
  chrome flips, semantic stays).

  Override any token at a deeper scope to customise without forking.
  Pin the accent to your brand colour:

  ```css
  .my-app .map-routing-container.map-routing-container {
    --mr-accent: #6366f1;
    --mr-accent-soft: rgba(99, 102, 241, 0.9);
  }
  ```

  Force light chrome inside a dark page section:

  ```css
  .dark-page .map-routing-container.map-routing-container {
    --mr-canvas: #fafafa;
    --mr-surface: #ffffff;
    --mr-text: #1f2937;
  }
  ```

  Chrome tokens (flip in dark mode):
    Surfaces — canvas, surface, surface-hover, panel-bg, overlay-bg
    Text     — text, text-muted, accent-text
    Strokes  — border-soft, divider, divider-strong
    Accent   — accent, accent-soft
    Errors   — error-bg, error-bg-soft, error-border, error-text
    Shadows  — shadow-soft, shadow-medium, shadow-strong, marker-shadow

  Semantic tokens (stay constant in both modes):
    origin (start marker green), destination (end marker red)
    These never flip — a green "start" pin must read as green
    against any base map tile, light or dark.

  Note: code samples deliberately omit CSS comments — JSDoc-style
  block comments inside this HTML docblock confuse Svelte's
  `@component` extractor and silently break the default export.

  ============================================================
  @component
-->
<script module lang="ts">
	/**
	 * Leaflet is loaded lazily (it touches `window`, so it can't run during SSR).
	 * Every helper in this component needs it, so we share one promise across
	 * all calls and instances: one import per page, and no concurrent import()
	 * races for bundlers or test runners to trip over.
	 */
	let leafletLoader: Promise<typeof import('leaflet')> | undefined;

	function loadLeaflet(): Promise<typeof import('leaflet')> {
		return (leafletLoader ??= import('leaflet'));
	}
</script>

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
		/** Custom OSRM API URL (default: public demo server) */
		osrmApiUrl = 'https://router.project-osrm.org',
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

	/** AbortController for cancelling pending route requests */
	let abortController: AbortController | null = null;

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/**
	 * Read the reduced-motion preference at call time rather than once at mount,
	 * so a user who flips the OS setting mid-session is honoured on the next fit.
	 */
	function prefersReducedMotion(): boolean {
		return isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

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

		// Capture the element now: by the time the dynamic import resolves, an
		// unmount may already have cleared the bind:this reference.
		const container = mapContainer;
		let mapInstance: LeafletMap | undefined;
		let cancelled = false;

		(async () => {
			const L = await loadLeaflet();

			const reduceMotion = prefersReducedMotion();

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

			// The component may have unmounted while Leaflet was loading — bail out
			// rather than build a map nobody will ever call .remove() on.
			if (cancelled) return;

			mapInstance = L.map(container, {
				center: [initialCenter.lat, initialCenter.lng],
				zoom: zoom,
				scrollWheelZoom: true,
				zoomControl: false,
				attributionControl: true,
				zoomAnimation: !reduceMotion,
				fadeAnimation: !reduceMotion
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
			cancelled = true;
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
		const L = await loadLeaflet();

		// Colours come from the semantic --mr-origin / --mr-destination tokens so
		// consumers can retheme the pins from CSS without touching this script.
		const color = type === 'origin' ? 'var(--mr-origin)' : 'var(--mr-destination)';
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

		const L = await loadLeaflet();

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
	 * Uses AbortController to cancel pending requests on rapid updates
	 */
	async function calculateRoute(): Promise<void> {
		if (!origin || !destination || !map) return;

		// Read everything the request depends on *before* the first await, so the
		// calling $effect tracks them — switching travel mode then re-routes.
		const start = origin;
		const end = destination;
		const activeProfile = profile;

		const L = await loadLeaflet();

		// Cancel any pending request to prevent race conditions
		if (abortController) {
			abortController.abort();
		}
		abortController = new AbortController();

		isCalculating = true;
		routeError = null;

		try {
			// Use custom OSRM server or default public demo server
			const osrmProfile =
				activeProfile === 'walking' ? 'foot' : activeProfile === 'cycling' ? 'bike' : 'car';
			const url = `${osrmApiUrl}/route/v1/${osrmProfile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

			const response = await fetch(url, { signal: abortController.signal });

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

			// Fit bounds to show full route. The fly-to-fit is skipped for users who
			// have asked the OS for reduced motion — they get an instant jump instead.
			map.fitBounds(routeLine.getBounds(), { padding: [50, 50], animate: !prefersReducedMotion() });

			onRouteCalculated?.(result);
		} catch (error) {
			// Ignore abort errors - they're expected when cancelling pending requests
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
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
		<div class="profile-selector" role="group" aria-label="Travel mode">
			{#each ['driving', 'cycling', 'walking'] as p (p)}
				<button
					type="button"
					class="profile-btn"
					class:active={profile === p}
					onclick={() => (profile = p as RoutingProfile)}
					aria-pressed={profile === p}
					title={p.charAt(0).toUpperCase() + p.slice(1)}
					aria-label={p.charAt(0).toUpperCase() + p.slice(1)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
					{#each currentRoute.steps as step, i (i)}
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
     Theming Tokens — see docs/THEMING.md
     Chrome flips for prefers-color-scheme: dark. The origin and
     destination colours are semantic (green = start, red = end) and
     stay constant in both modes so the A/B pins read the same on any
     base-map tile. Override any token at a deeper scope, e.g.
     .my-app .map-routing-container.map-routing-container { ... }
     ================================================== */
	.map-routing-container {
		/* Surfaces */
		--mr-canvas: #f0f0f0;
		--mr-surface: #ffffff;
		--mr-surface-hover: #f5f5f5;
		--mr-panel-bg: rgba(255, 255, 255, 0.95);
		--mr-overlay-bg: rgba(255, 255, 255, 0.8);

		/* Text */
		--mr-text: #333333;
		--mr-text-muted: #666666;
		--mr-accent-text: #ffffff;

		/* Strokes */
		--mr-border-soft: #dddddd;
		--mr-divider: #f0f0f0;
		--mr-divider-strong: #eeeeee;

		/* Accent (active profile, links, step numbers, spinner) */
		--mr-accent: #146ef5;
		--mr-accent-soft: rgba(20, 110, 245, 0.9);

		/* Errors */
		--mr-error-bg: #fef2f2;
		--mr-error-bg-soft: #fee2e2;
		--mr-error-border: #fecaca;
		--mr-error-text: #dc2626;

		/* Shadows */
		--mr-shadow-soft: rgba(0, 0, 0, 0.1);
		--mr-shadow-medium: rgba(0, 0, 0, 0.15);
		--mr-shadow-strong: rgba(0, 0, 0, 0.2);
		--mr-marker-shadow: rgba(0, 0, 0, 0.3);

		/* Semantic — deliberately NOT flipped in dark mode */
		--mr-origin: #22c55e;
		--mr-destination: #ef4444;

		/* Layout */
		position: relative;
		width: 100%;
		height: var(--map-height, 500px);
		border-radius: 8px;
		overflow: hidden;
		background-color: var(--mr-canvas);
	}

	@media (prefers-color-scheme: dark) {
		.map-routing-container {
			--mr-canvas: #1a1a1a;
			--mr-surface: #2a2a2a;
			--mr-surface-hover: #3a3a3a;
			--mr-panel-bg: rgba(31, 31, 31, 0.95);
			--mr-overlay-bg: rgba(17, 17, 17, 0.75);
			--mr-text: #e5e5e5;
			--mr-text-muted: #a3a3a3;
			--mr-accent-text: #ffffff;
			--mr-border-soft: #4b5563;
			--mr-divider: #333333;
			--mr-divider-strong: #3f3f3f;
			--mr-accent: #60a5fa;
			--mr-accent-soft: rgba(37, 99, 235, 0.9);
			--mr-error-bg: #3f1f1f;
			--mr-error-bg-soft: #5f2f2f;
			--mr-error-border: #7f1f1f;
			--mr-error-text: #fca5a5;
			--mr-shadow-soft: rgba(0, 0, 0, 0.4);
			--mr-shadow-medium: rgba(0, 0, 0, 0.5);
			--mr-shadow-strong: rgba(0, 0, 0, 0.55);
			--mr-marker-shadow: rgba(0, 0, 0, 0.6);
			/* origin / destination intentionally unchanged — semantic tokens */
		}
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
		background: var(--mr-panel-bg);
		border-radius: 8px;
		box-shadow: 0 2px 8px var(--mr-shadow-medium);
		max-width: 280px;
	}

	.profile-selector {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--mr-canvas);
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
		color: var(--mr-text-muted);
	}

	.profile-btn:hover {
		background: var(--mr-surface-hover);
	}

	.profile-btn.active {
		background: var(--mr-surface);
		box-shadow: 0 1px 3px var(--mr-shadow-soft);
	}

	.profile-btn.active svg {
		color: var(--mr-accent);
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
		color: var(--mr-accent-text);
		border-radius: 50%;
	}

	.point-badge.origin {
		background: var(--mr-origin);
	}

	.point-badge.destination {
		background: var(--mr-destination);
	}

	.point-text {
		flex: 1;
		font-size: 12px;
		font-family: monospace;
		color: var(--mr-text-muted);
	}

	.set-point-btn {
		padding: 0;
		border: none;
		background: transparent;
		color: var(--mr-accent);
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
		border: 1px solid var(--mr-border-soft);
		background: var(--mr-surface);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.swap-btn:hover:not(:disabled) {
		background: var(--mr-surface-hover);
		border-color: var(--mr-accent);
	}

	.swap-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.swap-btn svg {
		width: 16px;
		height: 16px;
		color: var(--mr-text-muted);
	}

	.clear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 8px;
		border: none;
		background: var(--mr-canvas);
		color: var(--mr-text-muted);
		font-size: 12px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-btn:hover {
		background: var(--mr-error-bg-soft);
		color: var(--mr-error-text);
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
		background: var(--mr-panel-bg);
		border-radius: 8px;
		box-shadow: 0 2px 8px var(--mr-shadow-medium);
	}

	.route-distance {
		font-weight: 600;
		color: var(--mr-text);
	}

	.route-duration {
		color: var(--mr-text-muted);
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
		background: var(--mr-panel-bg);
		border-radius: 8px;
		box-shadow: 0 2px 8px var(--mr-shadow-medium);
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
		color: var(--mr-text);
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
		border-top: 1px solid var(--mr-divider-strong);
	}

	.instruction-item {
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--mr-divider);
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
		color: var(--mr-accent-text);
		background: var(--mr-accent);
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
		color: var(--mr-text);
	}

	.step-distance {
		font-size: 11px;
		color: var(--mr-text-muted);
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
		background: var(--mr-accent-soft);
		color: var(--mr-accent-text);
		font-size: 13px;
		border-radius: 20px;
		box-shadow: 0 2px 8px var(--mr-shadow-strong);
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
		background: var(--mr-overlay-bg);
		color: var(--mr-text);
	}

	.calculating-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--mr-divider);
		border-top-color: var(--mr-accent);
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
		background: var(--mr-error-bg);
		border: 1px solid var(--mr-error-border);
		border-radius: 8px;
		color: var(--mr-error-text);
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
		color: var(--mr-accent-text);
		background: var(--marker-color);
		border-radius: 50%;
		box-shadow: 0 2px 6px var(--mr-marker-shadow);
	}

	/* ==================================================
     Leaflet Overrides
     ================================================== */
	.map-routing-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px var(--mr-shadow-medium);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-routing-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: var(--mr-text);
		background: var(--mr-surface);
		border: none !important;
	}

	.map-routing-container :global(.leaflet-control-zoom a:hover) {
		background: var(--mr-surface-hover);
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
