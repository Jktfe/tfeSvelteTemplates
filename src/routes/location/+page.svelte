<!--
  Location Services Demo Page

  Demonstrates location-focused mapping components:
  - MapLocateMe: Find my location with geolocation
  - MapRouting: A→B routing with directions

  @author TFE Svelte Templates
-->
<script lang="ts">
	import MapLocateMe from '$lib/components/MapLocateMe.svelte';
	import MapRouting from '$lib/components/MapRouting.svelte';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type {
		GeolocationResult,
		GeolocationErrorType,
		RouteResult,
		LatLng
	} from '$lib/types';

	// Tab state for switching between examples
	let activeExample = $state<'locate' | 'routing'>('locate');

	// Locate Me state
	let lastLocation = $state<GeolocationResult | null>(null);

	// Routing state
	let routeOrigin = $state<LatLng | undefined>({ lat: 51.5074, lng: -0.1278 });
	let routeDestination = $state<LatLng | undefined>({ lat: 51.5155, lng: -0.0922 });
	let lastRoute = $state<RouteResult | null>(null);

	/**
	 * Handle location found from MapLocateMe
	 */
	function handleLocate(result: GeolocationResult): void {
		lastLocation = result;
		console.log('[Location Demo] Found location:', result.position);
	}

	/**
	 * Handle location error from MapLocateMe
	 */
	function handleLocationError(error: GeolocationErrorType, message: string): void {
		console.log('[Location Demo] Location error:', error, message);
	}

	/**
	 * Handle route calculated from MapRouting
	 */
	function handleRouteCalculated(route: RouteResult): void {
		lastRoute = route;
		console.log('[Location Demo] Route calculated:', route.distance, 'metres');
	}

	// Format distance helper
	function formatDistance(metres: number): string {
		if (metres >= 1000) {
			return `${(metres / 1000).toFixed(1)} km`;
		}
		return `${Math.round(metres)} m`;
	}

	// Format duration helper
	function formatDuration(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes} min`;
	}
</script>

<svelte:head>
	<title>Location Services | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Location-focused mapping components: geolocation and routing. Built with Leaflet.js and browser APIs."
	/>
</svelte:head>

<main class="demo-page">
	<!-- Page Header -->
	<header class="page-header">
		<h1>Location Services</h1>
		<p class="subtitle">
			Location-focused mapping components for geolocation and route planning.
			Built with Leaflet.js, browser Geolocation API, and OSRM routing.
		</p>
	</header>

	<!-- Feature Overview Cards -->
	<section class="features-section">
		<div class="features-grid">
			<div class="feature-card" class:active={activeExample === 'locate'}>
				<div class="feature-icon">📍</div>
				<h3>MapLocateMe</h3>
				<p>Find your current location using browser geolocation with accuracy display</p>
				<button class="feature-btn" onclick={() => (activeExample = 'locate')}>
					{activeExample === 'locate' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'routing'}>
				<div class="feature-icon">🛣️</div>
				<h3>MapRouting</h3>
				<p>A→B routing with turn-by-turn directions using OSRM</p>
				<button class="feature-btn" onclick={() => (activeExample = 'routing')}>
					{activeExample === 'routing' ? 'Viewing' : 'View Demo'}
				</button>
			</div>
		</div>
	</section>

	<!-- Example Display -->
	<section class="example-section">
		<div class="example-header">
			<h2>
				{#if activeExample === 'locate'}
					MapLocateMe - Find My Location
				{:else}
					MapRouting - Route Planning
				{/if}
			</h2>
			<p class="example-description">
				{#if activeExample === 'locate'}
					Click the locate button to find your current position. Requires location permission. Shows accuracy radius.
				{:else}
					Click the map to set origin (A) and destination (B), or drag markers to adjust. Uses OSRM for routing.
				{/if}
			</p>
		</div>

		<div class="example-container">
			{#if activeExample === 'locate'}
				<MapLocateMe
					center={DEFAULT_MAP_CENTER}
					zoom={13}
					height={500}
					locateZoom={16}
					showAccuracyCircle={true}
					enableHighAccuracy={true}
					timeout={10000}
					buttonPosition="topright"
					onLocate={handleLocate}
					onError={handleLocationError}
				/>
				{#if lastLocation}
					<div class="info-panel">
						<strong>Your Location Found</strong>
						<div class="info-row">
							<span>Coordinates:</span>
							<span class="mono">{lastLocation.position.lat.toFixed(6)}, {lastLocation.position.lng.toFixed(6)}</span>
						</div>
						<div class="info-row">
							<span>Accuracy:</span>
							<span>±{Math.round(lastLocation.accuracy)} metres</span>
						</div>
						{#if lastLocation.altitude}
							<div class="info-row">
								<span>Altitude:</span>
								<span>{Math.round(lastLocation.altitude)} metres</span>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<MapRouting
					bind:origin={routeOrigin}
					bind:destination={routeDestination}
					center={DEFAULT_MAP_CENTER}
					zoom={13}
					height={500}
					profile="driving"
					showInstructions={true}
					showDistance={true}
					showDuration={true}
					routeColor="#146ef5"
					routeWeight={5}
					draggableWaypoints={true}
					enableClickToSet={true}
					onRouteCalculated={handleRouteCalculated}
				/>
				{#if lastRoute}
					<div class="info-panel">
						<strong>Route Calculated</strong>
						<div class="info-row">
							<span>Distance:</span>
							<span>{formatDistance(lastRoute.distance)}</span>
						</div>
						<div class="info-row">
							<span>Duration:</span>
							<span>{formatDuration(lastRoute.duration)}</span>
						</div>
						{#if lastRoute.steps}
							<div class="info-row">
								<span>Steps:</span>
								<span>{lastRoute.steps.length} directions</span>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</section>

	<!-- Usage Section -->
	<section class="usage-section">
		<h2>Usage Examples</h2>

		<div class="code-tabs">
			<button
				class="code-tab"
				class:active={activeExample === 'locate'}
				onclick={() => (activeExample = 'locate')}
			>
				MapLocateMe
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'routing'}
				onclick={() => (activeExample = 'routing')}
			>
				MapRouting
			</button>
		</div>

		<div class="code-block">
			{#if activeExample === 'locate'}
				<pre><code>{`${'<'}script>
  import MapLocateMe from '$lib/components/MapLocateMe.svelte';
  import type { GeolocationResult } from '$lib/types';

  function handleLocate(result: GeolocationResult) {
    console.log('Found:', result.position);
    console.log('Accuracy:', result.accuracy, 'metres');
  }
${'<'}/script>

<MapLocateMe
  center={{ lat: 51.5074, lng: -0.1278 }}
  zoom={13}
  height={400}
  locateZoom={16}
  showAccuracyCircle={true}
  enableHighAccuracy={true}
  onLocate={handleLocate}
/>`}</code></pre>
			{:else}
				<pre><code>{`${'<'}script>
  import MapRouting from '$lib/components/MapRouting.svelte';
  import type { LatLng, RouteResult } from '$lib/types';

  let origin: LatLng = { lat: 51.5074, lng: -0.1278 };
  let destination: LatLng = { lat: 51.5155, lng: -0.0922 };

  function handleRoute(route: RouteResult) {
    console.log('Distance:', route.distance, 'm');
    console.log('Duration:', route.duration, 's');
    console.log('Steps:', route.steps?.length);
  }
${'<'}/script>

<MapRouting
  bind:origin
  bind:destination
  height={500}
  profile="driving"
  showInstructions={true}
  showDistance={true}
  showDuration={true}
  draggableWaypoints={true}
  enableClickToSet={true}
  onRouteCalculated={handleRoute}
/>`}</code></pre>
			{/if}
		</div>
	</section>

	<!-- Features Comparison -->
	<section class="comparison-section">
		<h2>Component Comparison</h2>
		<div class="comparison-table-wrapper">
			<table class="comparison-table">
				<thead>
					<tr>
						<th>Feature</th>
						<th>MapLocateMe</th>
						<th>MapRouting</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Pan & Zoom</td>
						<td>✅</td>
						<td>✅</td>
					</tr>
					<tr>
						<td>Find User Location</td>
						<td>✅ Geolocation API</td>
						<td>-</td>
					</tr>
					<tr>
						<td>Accuracy Circle</td>
						<td>✅</td>
						<td>-</td>
					</tr>
					<tr>
						<td>Real-time Tracking</td>
						<td>Optional</td>
						<td>-</td>
					</tr>
					<tr>
						<td>Multiple Markers</td>
						<td>Single</td>
						<td>2 (A/B)</td>
					</tr>
					<tr>
						<td>Route Display</td>
						<td>-</td>
						<td>✅ Full path</td>
					</tr>
					<tr>
						<td>Turn-by-Turn</td>
						<td>-</td>
						<td>✅ OSRM</td>
					</tr>
					<tr>
						<td>ETA/Duration Display</td>
						<td>-</td>
						<td>✅ Duration</td>
					</tr>
					<tr>
						<td>External API</td>
						<td>None (browser)</td>
						<td>OSRM (free)</td>
					</tr>
					<tr>
						<td>Best For</td>
						<td>User location</td>
						<td>Navigation</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2>Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<div class="use-case-icon">🏃</div>
				<h3>Fitness Apps</h3>
				<p>Use MapLocateMe with watchPosition for real-time tracking during runs or bike rides.</p>
			</div>
			<div class="use-case-card">
				<div class="use-case-icon">🚗</div>
				<h3>Navigation</h3>
				<p>Plan routes with MapRouting, switch between driving, cycling, or walking profiles.</p>
			</div>
			<div class="use-case-card">
				<div class="use-case-icon">🏪</div>
				<h3>Store Locator</h3>
				<p>Show user's current location with MapLocateMe and calculate routes to nearby stores with MapRouting.</p>
			</div>
			<div class="use-case-card">
				<div class="use-case-icon">🗺️</div>
				<h3>Travel Planning</h3>
				<p>Plot multi-stop routes with MapRouting, display distances and estimated travel times.</p>
			</div>
		</div>
	</section>
</main>

<style>
	/* ==================================================
     Page Layout
     ================================================== */
	.demo-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
	}

	/* ==================================================
     Page Header
     ================================================== */
	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 0.75rem;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #666;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* ==================================================
     Features Section
     ================================================== */
	.features-section {
		margin-bottom: 3rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		padding: 1.5rem;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		text-align: center;
		transition: all 0.2s ease;
	}

	.feature-card:hover {
		border-color: #146ef5;
		box-shadow: 0 4px 12px rgba(20, 110, 245, 0.1);
	}

	.feature-card.active {
		border-color: #146ef5;
		background: linear-gradient(135deg, rgba(20, 110, 245, 0.05) 0%, rgba(20, 110, 245, 0.02) 100%);
	}

	.feature-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}

	.feature-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 0.5rem;
	}

	.feature-card p {
		font-size: 0.875rem;
		color: #666;
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.feature-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #146ef5;
		background: rgba(20, 110, 245, 0.1);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.feature-btn:hover {
		background: rgba(20, 110, 245, 0.2);
	}

	.feature-card.active .feature-btn {
		color: white;
		background: #146ef5;
	}

	/* ==================================================
     Example Section
     ================================================== */
	.example-section {
		margin-bottom: 3rem;
	}

	.example-header {
		margin-bottom: 1.5rem;
	}

	.example-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 0.5rem;
	}

	.example-description {
		font-size: 0.9375rem;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	.delivery-controls {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.control-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #666;
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

	.control-btn.primary {
		color: white;
		background: #22c55e;
	}

	.control-btn.primary:hover {
		background: #16a34a;
	}

	.example-container {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.info-panel {
		margin-top: 1rem;
		padding: 1rem;
		background: #f9f9f9;
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.info-panel strong {
		display: block;
		margin-bottom: 0.5rem;
		color: #1a1a1a;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 0.25rem 0;
		color: #666;
	}

	.info-row .mono {
		font-family: monospace;
	}

	/* ==================================================
     Usage Section
     ================================================== */
	.usage-section {
		margin-bottom: 3rem;
	}

	.usage-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1rem;
	}

	.code-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0;
		border-bottom: 1px solid #e5e5e5;
	}

	.code-tab {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #666;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.code-tab:hover {
		color: #333;
	}

	.code-tab.active {
		color: #146ef5;
		border-bottom-color: #146ef5;
	}

	.code-block {
		background: #1a1a1a;
		border-radius: 0 0 8px 8px;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		padding: 1.5rem;
	}

	.code-block code {
		font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: #e5e5e5;
	}

	/* ==================================================
     Comparison Section
     ================================================== */
	.comparison-section {
		margin-bottom: 3rem;
	}

	.comparison-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1.5rem;
	}

	.comparison-table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		font-size: 0.875rem;
	}

	.comparison-table th,
	.comparison-table td {
		padding: 0.875rem 1rem;
		text-align: left;
		border-bottom: 1px solid #eee;
	}

	.comparison-table th {
		font-weight: 600;
		color: #1a1a1a;
		background: #f9f9f9;
	}

	.comparison-table td:first-child {
		font-weight: 500;
		color: #333;
	}

	.comparison-table td {
		color: #666;
	}

	/* ==================================================
     Use Cases Section
     ================================================== */
	.use-cases-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1.5rem;
	}

	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.use-case-card {
		padding: 1.5rem;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
	}

	.use-case-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}

	.use-case-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 0.5rem;
	}

	.use-case-card p {
		font-size: 0.875rem;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	/* ==================================================
     Responsive
     ================================================== */
	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2rem;
		}

		.code-tabs {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 480px) {
		.demo-page {
			padding: 1.5rem 1rem 3rem;
		}

		.code-block pre {
			padding: 1rem;
		}
	}
</style>
