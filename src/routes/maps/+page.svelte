<!--
  Maps Demo Page

  Demonstrates all four mapping components:
  - MapBasic: Simple interactive map
  - MapSearch: Location search with geocoding
  - MapMarkers: Database markers with filtering
  - MapLive: Real-time marker additions

  @author TFE Svelte Templates
-->
<script lang="ts">
	import MapBasic from '$lib/components/MapBasic.svelte';
	import MapSearch from '$lib/components/MapSearch.svelte';
	import MapMarkers from '$lib/components/MapMarkers.svelte';
	import MapLive from '$lib/components/MapLive.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { MapMarker, GeoSearchResult } from '$lib/types';

	// Page data from server
	let { data } = $props();

	// Tab state for switching between examples
	let activeExample = $state<'basic' | 'search' | 'markers' | 'live'>('basic');

	// Live map markers (local state for demo)
	let liveMarkers = $state<MapMarker[]>([]);

	// Search result state
	let lastSearchResult = $state<GeoSearchResult | null>(null);

	/**
	 * Handle location select from MapSearch
	 */
	function handleLocationSelect(result: GeoSearchResult): void {
		lastSearchResult = result;
		console.log('[Maps Demo] Location selected:', result.displayName);
	}

	/**
	 * Handle marker click from MapMarkers
	 */
	function handleMarkerClick(marker: MapMarker): void {
		console.log('[Maps Demo] Marker clicked:', marker.title);
	}

	/**
	 * Handle marker add from MapLive
	 */
	function handleMarkerAdd(marker: MapMarker): void {
		console.log('[Maps Demo] Marker added:', marker);
	}

	/**
	 * Handle marker remove from MapLive
	 */
	function handleMarkerRemove(marker: MapMarker): void {
		console.log('[Maps Demo] Marker removed:', marker);
	}
</script>

<svelte:head>
	<title>Map Components | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Interactive mapping components using Leaflet.js and OpenStreetMap. Search locations, display markers, and add points dynamically."
	/>
</svelte:head>

<main class="demo-page">
	<!-- Page Header -->
	<header class="page-header">
		<h1>Map Components</h1>
		<p class="subtitle">
			Interactive mapping components using Leaflet.js and OpenStreetMap tiles.
			Search for locations, display database markers, and add points dynamically.
		</p>
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<!-- Feature Overview Cards -->
	<section class="features-section">
		<div class="features-grid">
			<div class="feature-card" class:active={activeExample === 'basic'}>
				<div class="feature-icon">🗺️</div>
				<h3>MapBasic</h3>
				<p>Simple interactive map with pan and zoom controls</p>
				<button class="feature-btn" onclick={() => (activeExample = 'basic')}>
					{activeExample === 'basic' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'search'}>
				<div class="feature-icon">🔍</div>
				<h3>MapSearch</h3>
				<p>Location search with Nominatim geocoding</p>
				<button class="feature-btn" onclick={() => (activeExample = 'search')}>
					{activeExample === 'search' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'markers'}>
				<div class="feature-icon">📍</div>
				<h3>MapMarkers</h3>
				<p>Database markers with popups and filtering</p>
				<button class="feature-btn" onclick={() => (activeExample = 'markers')}>
					{activeExample === 'markers' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'live'}>
				<div class="feature-icon">✨</div>
				<h3>MapLive</h3>
				<p>Real-time marker additions with animations</p>
				<button class="feature-btn" onclick={() => (activeExample = 'live')}>
					{activeExample === 'live' ? 'Viewing' : 'View Demo'}
				</button>
			</div>
		</div>
	</section>

	<!-- Example Display -->
	<section class="example-section">
		<div class="example-header">
			<h2>
				{#if activeExample === 'basic'}
					MapBasic - Interactive Map
				{:else if activeExample === 'search'}
					MapSearch - Location Search
				{:else if activeExample === 'markers'}
					MapMarkers - Database Markers
				{:else}
					MapLive - Real-Time Additions
				{/if}
			</h2>
			<p class="example-description">
				{#if activeExample === 'basic'}
					A foundation map component with pan, zoom, and OpenStreetMap tiles. Use keyboard arrows or drag to navigate.
				{:else if activeExample === 'search'}
					Search for any location worldwide using OpenStreetMap's Nominatim API. Results appear as you type.
				{:else if activeExample === 'markers'}
					Displaying {data.markers.length} UK landmarks from the database. Use the filter pills to narrow by category.
				{:else}
					Click anywhere on the map to add markers. Drag markers to reposition, click to edit details or delete.
				{/if}
			</p>
		</div>

		<div class="example-container">
			{#if activeExample === 'basic'}
				<MapBasic
					center={DEFAULT_MAP_CENTER}
					zoom={13}
					height={500}
					enableScrollZoom={true}
					showZoomControl={true}
				/>
			{:else if activeExample === 'search'}
				<MapSearch
					center={DEFAULT_MAP_CENTER}
					zoom={10}
					height={500}
					placeholder="Search for a city, address, or landmark..."
					maxResults={6}
					onLocationSelect={handleLocationSelect}
				/>
				{#if lastSearchResult}
					<div class="search-result-info">
						<strong>Selected:</strong> {lastSearchResult.displayName.split(',').slice(0, 2).join(',')}
						<span class="coords">
							({lastSearchResult.position.lat.toFixed(4)}, {lastSearchResult.position.lng.toFixed(4)})
						</span>
					</div>
				{/if}
			{:else if activeExample === 'markers'}
				<MapMarkers
					markers={data.markers}
					height={500}
					showCategories={true}
					onMarkerClick={handleMarkerClick}
				/>
			{:else}
				<MapLive
					bind:markers={liveMarkers}
					center={DEFAULT_MAP_CENTER}
					zoom={13}
					height={500}
					enableAddMode={true}
					animateNewMarkers={true}
					maxMarkers={20}
					onMarkerAdd={handleMarkerAdd}
					onMarkerRemove={handleMarkerRemove}
				/>
			{/if}
		</div>
	</section>

	<!-- Usage Section -->
	<section class="usage-section">
		<h2>Usage Examples</h2>

		<div class="code-tabs">
			<button
				class="code-tab"
				class:active={activeExample === 'basic'}
				onclick={() => (activeExample = 'basic')}
			>
				MapBasic
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'search'}
				onclick={() => (activeExample = 'search')}
			>
				MapSearch
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'markers'}
				onclick={() => (activeExample = 'markers')}
			>
				MapMarkers
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'live'}
				onclick={() => (activeExample = 'live')}
			>
				MapLive
			</button>
		</div>

		<div class="code-block">
			{#if activeExample === 'basic'}
				<pre><code>{`${'<'}script>
  import MapBasic from '$lib/components/MapBasic.svelte';
${'<'}/script>

<MapBasic
  center={{ lat: 51.5074, lng: -0.1278 }}
  zoom={13}
  height={400}
  enableScrollZoom={true}
  showZoomControl={true}
/>`}</code></pre>
			{:else if activeExample === 'search'}
				<pre><code>{`${'<'}script>
  import MapSearch from '$lib/components/MapSearch.svelte';
  import type { GeoSearchResult } from '$lib/types';

  function handleSelect(result: GeoSearchResult) {
    console.log('Selected:', result.displayName);
    console.log('Position:', result.position);
  }
${'<'}/script>

<MapSearch
  center={{ lat: 51.5074, lng: -0.1278 }}
  zoom={10}
  height={500}
  placeholder="Search for a location..."
  maxResults={5}
  onLocationSelect={handleSelect}
/>`}</code></pre>
			{:else if activeExample === 'markers'}
				<pre><code>{`// +page.server.ts
import { loadMapMarkersFromDatabase } from '$lib/server/maps';

export const load = async () => {
  const markers = await loadMapMarkersFromDatabase();
  return { markers };
};

// +page.svelte
${'<'}script>
  import MapMarkers from '$lib/components/MapMarkers.svelte';

  let { data } = $props();
${'<'}/script>

<MapMarkers
  markers={data.markers}
  height={500}
  showCategories={true}
  onMarkerClick={(m) => console.log(m)}
/>`}</code></pre>
			{:else}
				<pre><code>{`${'<'}script>
  import MapLive from '$lib/components/MapLive.svelte';
  import type { MapMarker } from '$lib/types';

  let markers = $state<MapMarker[]>([]);

  function handleAdd(marker: MapMarker) {
    console.log('Added:', marker);
    // Save to database if needed
  }
${'<'}/script>

<MapLive
  bind:markers
  center={{ lat: 51.5074, lng: -0.1278 }}
  zoom={13}
  height={500}
  enableAddMode={true}
  maxMarkers={20}
  onMarkerAdd={handleAdd}
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
						<th>MapBasic</th>
						<th>MapSearch</th>
						<th>MapMarkers</th>
						<th>MapLive</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Pan & Zoom</td>
						<td>✅</td>
						<td>✅</td>
						<td>✅</td>
						<td>✅</td>
					</tr>
					<tr>
						<td>Location Search</td>
						<td>-</td>
						<td>✅</td>
						<td>-</td>
						<td>-</td>
					</tr>
					<tr>
						<td>Display Markers</td>
						<td>-</td>
						<td>Single</td>
						<td>✅ Multiple</td>
						<td>✅ Multiple</td>
					</tr>
					<tr>
						<td>Category Filtering</td>
						<td>-</td>
						<td>-</td>
						<td>✅</td>
						<td>-</td>
					</tr>
					<tr>
						<td>Add Markers</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>✅ Click</td>
					</tr>
					<tr>
						<td>Edit Markers</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
						<td>✅ Drag/Form</td>
					</tr>
					<tr>
						<td>Database Integration</td>
						<td>-</td>
						<td>-</td>
						<td>✅</td>
						<td>Optional</td>
					</tr>
					<tr>
						<td>Best For</td>
						<td>Basic display</td>
						<td>Location finding</td>
						<td>Data visualisation</td>
						<td>User input</td>
					</tr>
				</tbody>
			</table>
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
		margin: 0 auto 1rem;
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
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

	.example-container {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.search-result-info {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #333;
	}

	.search-result-info .coords {
		color: #888;
		font-family: monospace;
		margin-left: 0.5rem;
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
     Responsive
     ================================================== */
	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2rem;
		}

		.features-grid {
			grid-template-columns: 1fr 1fr;
		}

		.code-tabs {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 480px) {
		.demo-page {
			padding: 1.5rem 1rem 3rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.code-block pre {
			padding: 1rem;
		}
	}
</style>
