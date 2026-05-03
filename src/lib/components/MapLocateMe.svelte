<!--
  ============================================================
  MapLocateMe.svelte - Find My Location Map Component
  ============================================================

  🎯 WHAT IT DOES
  Interactive map with a "Locate Me" button that finds the user's current
  position using the browser's Geolocation API and displays it with an
  accuracy circle.

  ✨ FEATURES
  • One-click geolocation with animated button feedback
  • Accuracy circle showing position uncertainty radius
  • Pulsing marker animation at user's location
  • Continuous position tracking mode (optional)
  • Graceful error handling with user-friendly messages
  • Respects prefers-reduced-motion for animations
  • SSR safe (client-side only initialization)

  ♿ ACCESSIBILITY
  • Keyboard: Tab to button, Enter/Space to activate
  • Screen readers: ARIA labels for button states
  • Motion: Respects prefers-reduced-motion

  📦 DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)
  • Browser Geolocation API (native, no external service)

  ⚡ PERFORMANCE
  • Minimal overhead - uses native browser APIs
  • Optional watch mode for continuous tracking
  • Efficient marker/circle updates

  🎨 USAGE
  ```svelte
  <MapLocateMe
    height={500}
    locateZoom={16}
    showAccuracyCircle={true}
    onLocate={(result) => console.log('Found:', result)}
  />
  ```

  📋 PROPS
  | Prop               | Type     | Default    | Description                           |
  |--------------------|----------|------------|---------------------------------------|
  | center             | LatLng   | London     | Initial map center                    |
  | zoom               | number   | 13         | Initial zoom level                    |
  | height             | number   | 400        | Map height in pixels                  |
  | locateZoom         | number   | 16         | Zoom level when located               |
  | showAccuracyCircle | boolean  | true       | Show accuracy radius circle           |
  | enableHighAccuracy | boolean  | true       | Use GPS for better accuracy           |
  | timeout            | number   | 10000      | Geolocation timeout (ms)              |
  | watchPosition      | boolean  | false      | Continuously track position           |
  | buttonPosition     | string   | 'topright' | Button position on map                |
  | onLocate           | function | undefined  | Callback when location found          |
  | onError            | function | undefined  | Callback when geolocation fails       |

  THEMING (see docs/THEMING.md)
  All chrome flips with `prefers-color-scheme: dark`. There is no brand
  variant API on this component, so every token is treated as chrome and
  flips automatically (Pattern #67 conditional rule, all-chrome path).

  Override any token at a deeper scope to customise — for example to
  pin the accent to your brand colour or force a single mode:

  ```css
  .my-app .map-locate-container {
    --mlm-accent: #6366f1;       // brand-blue, won't flip in dark mode
    --mlm-canvas: #fafafa;       // lighter container background
  }
  ```

  Tokens (17): canvas, surface, surface-hover, info-bg, text, text-muted,
  accent, accent-soft, pulse-border, error-bg, error-border, error-text,
  error-dismiss-hover, accuracy-bg, accuracy-text, shadow-soft,
  shadow-medium, shadow-strong.

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapLocateMeProps, GeolocationResult, GeolocationErrorType } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle } from 'leaflet';

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
		/** Zoom level when location is found (default: 16) */
		locateZoom = 16,
		/** Show blue circle indicating accuracy radius (default: true) */
		showAccuracyCircle = true,
		/** Use GPS for higher accuracy (default: true) */
		enableHighAccuracy = true,
		/** Geolocation timeout in milliseconds (default: 10000) */
		timeout = 10000,
		/** Maximum age of cached position in ms (default: 0) */
		maximumAge = 0,
		/** Continuously track position changes (default: false) */
		watchPosition = false,
		/** Position of locate button (default: 'topright') */
		buttonPosition = 'topright',
		/** Callback when location is successfully found */
		onLocate,
		/** Callback when geolocation fails */
		onError,
		/** Additional CSS classes for container */
		class: className = ''
	}: MapLocateMeProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** User location marker */
	let locationMarker: LeafletMarker | undefined = $state();

	/** Accuracy circle */
	let accuracyCircle: LeafletCircle | undefined = $state();

	/** Current location state */
	let isLocating = $state(false);
	let hasLocation = $state(false);
	let locationError = $state<string | null>(null);
	let currentLocation = $state<GeolocationResult | null>(null);

	/** Watch position ID for cleanup */
	let watchId: number | undefined;

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/** Check if geolocation is supported */
	const isGeolocationSupported = $derived(isBrowser && 'geolocation' in navigator);

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

			// Add zoom control to bottom-right
			L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}).addTo(mapInstance);

			map = mapInstance;
		})();

		return () => {
			// Clean up watch position
			if (watchId !== undefined) {
				navigator.geolocation.clearWatch(watchId);
				watchId = undefined;
			}

			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
				locationMarker = undefined;
				accuracyCircle = undefined;
			}
		};
	});

	// ==================================================
	// FUNCTIONS - Geolocation logic
	// ==================================================

	/**
	 * Map GeolocationPositionError code to our error type
	 */
	function mapErrorCode(code: number): GeolocationErrorType {
		switch (code) {
			case 1:
				return 'PERMISSION_DENIED';
			case 2:
				return 'POSITION_UNAVAILABLE';
			case 3:
				return 'TIMEOUT';
			default:
				return 'POSITION_UNAVAILABLE';
		}
	}

	/**
	 * Get user-friendly error message
	 */
	function getErrorMessage(errorType: GeolocationErrorType): string {
		switch (errorType) {
			case 'PERMISSION_DENIED':
				return 'Location access was denied. Please enable location permissions in your browser settings.';
			case 'POSITION_UNAVAILABLE':
				return 'Unable to determine your location. Please check your device settings.';
			case 'TIMEOUT':
				return 'Location request timed out. Please try again.';
			case 'NOT_SUPPORTED':
				return 'Geolocation is not supported by your browser.';
		}
	}

	/**
	 * Handle successful geolocation
	 */
	async function handlePositionSuccess(position: GeolocationPosition): Promise<void> {
		if (!map) return;

		const L = await import('leaflet');

		const result: GeolocationResult = {
			position: {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			},
			accuracy: position.coords.accuracy,
			altitude: position.coords.altitude ?? undefined,
			altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
			heading: position.coords.heading ?? undefined,
			speed: position.coords.speed ?? undefined,
			timestamp: position.timestamp
		};

		currentLocation = result;
		hasLocation = true;
		isLocating = false;
		locationError = null;

		const latLng: [number, number] = [result.position.lat, result.position.lng];

		// Update or create accuracy circle
		if (showAccuracyCircle) {
			if (accuracyCircle) {
				accuracyCircle.setLatLng(latLng);
				accuracyCircle.setRadius(result.accuracy);
			} else {
				accuracyCircle = L.circle(latLng, {
					radius: result.accuracy,
					color: '#146ef5',
					fillColor: '#146ef5',
					fillOpacity: 0.15,
					weight: 2
				}).addTo(map);
			}
		}

		// Update or create location marker with pulsing effect
		if (locationMarker) {
			locationMarker.setLatLng(latLng);
		} else {
			// Create custom pulsing icon
			const pulseIcon = L.divIcon({
				className: 'locate-me-marker',
				html: `
					<div class="pulse-ring"></div>
					<div class="pulse-core"></div>
				`,
				iconSize: [24, 24],
				iconAnchor: [12, 12]
			});

			locationMarker = L.marker(latLng, { icon: pulseIcon }).addTo(map);
			locationMarker.bindPopup(
				`<div class="locate-popup">
					<strong>Your Location</strong>
					<div class="locate-accuracy">Accuracy: ±${Math.round(result.accuracy)}m</div>
				</div>`
			);
		}

		// Pan to location
		map.setView(latLng, locateZoom);

		// Call callback
		onLocate?.(result);
	}

	/**
	 * Handle geolocation error
	 */
	function handlePositionError(error: GeolocationPositionError): void {
		const errorType = mapErrorCode(error.code);
		const message = getErrorMessage(errorType);

		isLocating = false;
		locationError = message;

		onError?.(errorType, message);
	}

	/**
	 * Start locating user position.
	 *
	 * The `non_reactive_update` warning here is a false positive: this is a stable
	 * function declaration, never reassigned. Svelte's analyser flags it because
	 * the legacy `export { locateMe }` pattern (line 411) creates an exported
	 * binding it can't statically distinguish from a mutable variable.
	 */
	// svelte-ignore non_reactive_update
	function locateMe(): void {
		if (!isGeolocationSupported) {
			const message = getErrorMessage('NOT_SUPPORTED');
			locationError = message;
			onError?.('NOT_SUPPORTED', message);
			return;
		}

		isLocating = true;
		locationError = null;

		const options: PositionOptions = {
			enableHighAccuracy,
			timeout,
			maximumAge
		};

		if (watchPosition) {
			// Continuous tracking
			if (watchId !== undefined) {
				navigator.geolocation.clearWatch(watchId);
			}
			watchId = navigator.geolocation.watchPosition(
				handlePositionSuccess,
				handlePositionError,
				options
			);
		} else {
			// One-time position
			navigator.geolocation.getCurrentPosition(
				handlePositionSuccess,
				handlePositionError,
				options
			);
		}
	}

	/**
	 * Stop watching position
	 */
	function stopWatching(): void {
		if (watchId !== undefined) {
			navigator.geolocation.clearWatch(watchId);
			watchId = undefined;
		}
	}

	/**
	 * Clear location marker and circle
	 * Exported so parent components can programmatically reset the location
	 */
	export function clearLocation(): void {
		if (locationMarker) {
			locationMarker.remove();
			locationMarker = undefined;
		}
		if (accuracyCircle) {
			accuracyCircle.remove();
			accuracyCircle = undefined;
		}
		hasLocation = false;
		currentLocation = null;
		stopWatching();
	}

	/**
	 * Programmatically trigger location finding
	 * Exported so parent components can trigger geolocation
	 */
	export { locateMe, stopWatching };
</script>

<!--
  Map Locate Me Container
-->
<div class="map-locate-container {className}" style="--map-height: {height}px">
	<!-- Locate Button -->
	<div class="locate-button-wrapper {buttonPosition}">
		<button
			type="button"
			class="locate-button"
			class:locating={isLocating}
			class:has-location={hasLocation}
			onclick={locateMe}
			disabled={isLocating}
			aria-label={isLocating ? 'Finding your location...' : hasLocation ? 'Re-center on your location' : 'Find my location'}
			title={isLocating ? 'Finding your location...' : 'Find my location'}
		>
			{#if isLocating}
				<svg class="locate-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="3" />
					<path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
				</svg>
			{/if}
		</button>
	</div>

	<!-- Error Message -->
	{#if locationError}
		<div class="locate-error" role="alert">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v4M12 16h.01" />
			</svg>
			<span>{locationError}</span>
			<button type="button" class="error-dismiss" onclick={() => (locationError = null)} aria-label="Dismiss">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/if}

	<!-- Location Info -->
	{#if hasLocation && currentLocation}
		<div class="locate-info" aria-live="polite">
			<span class="locate-coords">
				{currentLocation.position.lat.toFixed(5)}, {currentLocation.position.lng.toFixed(5)}
			</span>
			<span class="locate-accuracy-badge">
				±{Math.round(currentLocation.accuracy)}m
			</span>
		</div>
	{/if}

	<!-- Map Element -->
	<div
		bind:this={mapContainer}
		class="map-element"
		role="application"
		aria-label="Interactive map with locate me functionality"
	></div>
</div>

<style>
	/* ==================================================
     Theming Tokens — see docs/THEMING.md
     Chrome flips for prefers-color-scheme: dark. Override any
     token at a deeper scope (e.g. .my-app .map-locate-container)
     to customise without forking the component.
     ================================================== */
	.map-locate-container {
		/* Surfaces */
		--mlm-canvas: #f0f0f0;
		--mlm-surface: #ffffff;
		--mlm-surface-hover: #f5f5f5;
		--mlm-info-bg: rgba(255, 255, 255, 0.95);

		/* Text */
		--mlm-text: #333333;
		--mlm-text-muted: #666666;

		/* Accent (geolocation indicator — no brand variant API, treated as chrome) */
		--mlm-accent: #146ef5;
		--mlm-accent-soft: rgba(20, 110, 245, 0.3);

		/* Pulse marker border (kept light to read on dark map tiles) */
		--mlm-pulse-border: #ffffff;

		/* Error states */
		--mlm-error-bg: #fef2f2;
		--mlm-error-border: #fecaca;
		--mlm-error-text: #dc2626;
		--mlm-error-dismiss-hover: #fee2e2;

		/* Accuracy badge */
		--mlm-accuracy-bg: #dbeafe;
		--mlm-accuracy-text: #1d4ed8;

		/* Shadows */
		--mlm-shadow-soft: rgba(0, 0, 0, 0.1);
		--mlm-shadow-medium: rgba(0, 0, 0, 0.15);
		--mlm-shadow-strong: rgba(0, 0, 0, 0.3);

		/* Layout */
		position: relative;
		width: 100%;
		height: var(--map-height, 400px);
		border-radius: 8px;
		overflow: hidden;
		background-color: var(--mlm-canvas);
	}

	@media (prefers-color-scheme: dark) {
		.map-locate-container {
			--mlm-canvas: #1a1a1a;
			--mlm-surface: #2a2a2a;
			--mlm-surface-hover: #3a3a3a;
			--mlm-info-bg: rgba(42, 42, 42, 0.95);
			--mlm-text: #e5e5e5;
			--mlm-text-muted: #9ca3af;
			--mlm-accent: #3b82f6;
			--mlm-accent-soft: rgba(59, 130, 246, 0.4);
			--mlm-error-bg: #3f1f1f;
			--mlm-error-border: #7f1f1f;
			--mlm-error-text: #fca5a5;
			--mlm-error-dismiss-hover: #5f2f2f;
			--mlm-accuracy-bg: #1e3a8a;
			--mlm-accuracy-text: #bfdbfe;
			--mlm-shadow-soft: rgba(0, 0, 0, 0.4);
			--mlm-shadow-medium: rgba(0, 0, 0, 0.5);
			--mlm-shadow-strong: rgba(0, 0, 0, 0.6);
			/* pulse-border intentionally kept #ffffff in both modes — */
			/* the marker reads against map tiles, not container chrome */
		}
	}

	.map-element {
		width: 100%;
		height: 100%;
	}

	/* ==================================================
     Locate Button Styles
     ================================================== */
	.locate-button-wrapper {
		position: absolute;
		z-index: 1000;
		padding: 10px;
	}

	.locate-button-wrapper.topleft {
		top: 0;
		left: 0;
	}

	.locate-button-wrapper.topright {
		top: 0;
		right: 0;
	}

	.locate-button-wrapper.bottomleft {
		bottom: 0;
		left: 0;
	}

	.locate-button-wrapper.bottomright {
		bottom: 50px;
		right: 0;
	}

	.locate-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: none;
		border-radius: 8px;
		background: var(--mlm-surface);
		color: var(--mlm-text);
		cursor: pointer;
		box-shadow: 0 2px 8px var(--mlm-shadow-medium);
		transition: all 0.2s ease;
	}

	.locate-button:hover:not(:disabled) {
		background: var(--mlm-surface-hover);
		transform: scale(1.05);
	}

	.locate-button:focus {
		outline: 2px solid var(--mlm-accent);
		outline-offset: 2px;
	}

	.locate-button:disabled {
		cursor: wait;
	}

	.locate-button.has-location {
		color: var(--mlm-accent);
	}

	.locate-button svg {
		width: 24px;
		height: 24px;
	}

	.locate-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ==================================================
     Error Message Styles
     ================================================== */
	.locate-error {
		position: absolute;
		top: 60px;
		left: 12px;
		right: 12px;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: var(--mlm-error-bg);
		border: 1px solid var(--mlm-error-border);
		border-radius: 8px;
		color: var(--mlm-error-text);
		font-size: 13px;
		box-shadow: 0 2px 8px var(--mlm-shadow-soft);
	}

	.locate-error svg {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
	}

	.locate-error span {
		flex: 1;
	}

	.error-dismiss {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--mlm-error-text);
		cursor: pointer;
		border-radius: 4px;
	}

	.error-dismiss:hover {
		background: var(--mlm-error-dismiss-hover);
	}

	.error-dismiss svg {
		width: 16px;
		height: 16px;
	}

	/* ==================================================
     Location Info Badge
     ================================================== */
	.locate-info {
		position: absolute;
		bottom: 12px;
		left: 12px;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: var(--mlm-info-bg);
		border-radius: 6px;
		font-size: 12px;
		box-shadow: 0 2px 6px var(--mlm-shadow-soft);
	}

	.locate-coords {
		color: var(--mlm-text-muted);
		font-family: monospace;
	}

	.locate-accuracy-badge {
		padding: 2px 6px;
		background: var(--mlm-accuracy-bg);
		color: var(--mlm-accuracy-text);
		border-radius: 4px;
		font-weight: 500;
	}

	/* ==================================================
     Custom Marker Styles (injected into Leaflet)
     ================================================== */
	.map-locate-container :global(.locate-me-marker) {
		background: transparent;
		border: none;
	}

	.map-locate-container :global(.pulse-core) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 14px;
		height: 14px;
		background: var(--mlm-accent);
		border: 3px solid var(--mlm-pulse-border);
		border-radius: 50%;
		box-shadow: 0 2px 6px var(--mlm-shadow-strong);
	}

	.map-locate-container :global(.pulse-ring) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 40px;
		height: 40px;
		background: var(--mlm-accent-soft);
		border-radius: 50%;
		animation: pulse-expand 2s ease-out infinite;
	}

	@keyframes pulse-expand {
		0% {
			transform: translate(-50%, -50%) scale(0.3);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0;
		}
	}

	/* Popup styling */
	.map-locate-container :global(.locate-popup) {
		text-align: center;
		padding: 4px;
	}

	.map-locate-container :global(.locate-accuracy) {
		font-size: 12px;
		color: var(--mlm-text-muted);
		margin-top: 4px;
	}

	/* ==================================================
     Leaflet Overrides
     ================================================== */
	.map-locate-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px var(--mlm-shadow-medium);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-locate-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: var(--mlm-text);
		background: var(--mlm-surface);
		border: none !important;
	}

	.map-locate-container :global(.leaflet-control-zoom a:hover) {
		background: var(--mlm-surface-hover);
	}

	.map-locate-container :global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 2px 12px var(--mlm-shadow-medium);
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.locate-spinner {
			animation: none;
			opacity: 0.7;
		}

		.map-locate-container :global(.pulse-ring) {
			animation: none;
			opacity: 0.3;
		}

		.locate-button:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
