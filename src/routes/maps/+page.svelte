<!--
	============================================================
	Maps Demo Page (TFE shell)
	============================================================

	Reference adoption of ComponentPageShell for the Leaflet
	mapping suite (MapBasic, MapSearch, MapMarkers, MapLive).

	Leaflet runs client-only, so the live demo is wrapped in
	{#if browser} to skip SSR mounting.
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import MapBasic from '$lib/components/MapBasic.svelte';
	import MapSearch from '$lib/components/MapSearch.svelte';
	import MapMarkers from '$lib/components/MapMarkers.svelte';
	import MapLive from '$lib/components/MapLive.svelte';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { MapMarker, GeoSearchResult } from '$lib/types';

	let { data } = $props();
	const shell = catalogShellPropsForSlug('/maps')!;

	let activeExample = $state<'basic' | 'search' | 'markers' | 'live'>('basic');
	let liveMarkers = $state<MapMarker[]>([]);
	let lastSearchResult = $state<GeoSearchResult | null>(null);

	function handleLocationSelect(result: GeoSearchResult): void {
		lastSearchResult = result;
	}

	function handleMarkerClick(marker: MapMarker): void {
		console.log('[Maps Demo] Marker clicked:', marker.title);
	}

	function handleMarkerAdd(marker: MapMarker): void {
		console.log('[Maps Demo] Marker added:', marker);
	}

	function handleMarkerRemove(marker: MapMarker): void {
		console.log('[Maps Demo] Marker removed:', marker);
	}

	const codeExplanation =
		'Each map component wraps Leaflet behind a typed Svelte 5 surface. MapBasic mounts a tile layer plus pan/zoom; MapSearch hits the Nominatim geocoder for live suggestions; MapMarkers renders database-loaded points with category filtering; MapLive lets users add and drag markers, syncing via $bindable state. Leaflet only runs client-side, so the demo is gated on `browser` from $app/environment.';
</script>

<svelte:head>
	<title>Maps — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Leaflet-powered Svelte 5 maps: basic display, location search, database markers, and live marker editing."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Leaflet', 'OpenStreetMap', 'Geocoding', 'Database-aware']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="map-demo">
			<div class="map-demo__tabs" role="tablist" aria-label="Map component variants">
				<button
					type="button"
					role="tab"
					class="map-demo__tab"
					class:active={activeExample === 'basic'}
					aria-selected={activeExample === 'basic'}
					onclick={() => (activeExample = 'basic')}
				>
					MapBasic
				</button>
				<button
					type="button"
					role="tab"
					class="map-demo__tab"
					class:active={activeExample === 'search'}
					aria-selected={activeExample === 'search'}
					onclick={() => (activeExample = 'search')}
				>
					MapSearch
				</button>
				<button
					type="button"
					role="tab"
					class="map-demo__tab"
					class:active={activeExample === 'markers'}
					aria-selected={activeExample === 'markers'}
					onclick={() => (activeExample = 'markers')}
				>
					MapMarkers
				</button>
				<button
					type="button"
					role="tab"
					class="map-demo__tab"
					class:active={activeExample === 'live'}
					aria-selected={activeExample === 'live'}
					onclick={() => (activeExample = 'live')}
				>
					MapLive
				</button>
			</div>

			<p class="map-demo__hint">
				{#if activeExample === 'basic'}
					Pan and zoom an OpenStreetMap-tiled map. Drag, scroll, or use the on-screen controls.
				{:else if activeExample === 'search'}
					Type a place name to query Nominatim. Pick a result and the map flies to it.
				{:else if activeExample === 'markers'}
					{data.markers.length} UK landmarks loaded {data.usingDatabase ? 'from the database' : 'from the static fallback'}. Filter by category.
				{:else}
					Click anywhere to add a marker. Drag to reposition, click to edit or delete.
				{/if}
			</p>

			<div class="map-stage">
				{#if browser}
					{#if activeExample === 'basic'}
						<MapBasic
							center={DEFAULT_MAP_CENTER}
							zoom={13}
							height={460}
							enableScrollZoom
							showZoomControl
						/>
					{:else if activeExample === 'search'}
						<MapSearch
							center={DEFAULT_MAP_CENTER}
							zoom={10}
							height={460}
							placeholder="Search for a city, address, or landmark…"
							maxResults={6}
							onLocationSelect={handleLocationSelect}
						/>
						{#if lastSearchResult}
							<div class="map-demo__readout">
								<strong>Selected:</strong>
								{lastSearchResult.displayName.split(',').slice(0, 2).join(',')}
								<span class="map-demo__coords">
									({lastSearchResult.position.lat.toFixed(4)}, {lastSearchResult.position.lng.toFixed(4)})
								</span>
							</div>
						{/if}
					{:else if activeExample === 'markers'}
						<MapMarkers
							markers={data.markers}
							height={460}
							showCategories
							onMarkerClick={handleMarkerClick}
						/>
					{:else}
						<MapLive
							bind:markers={liveMarkers}
							center={DEFAULT_MAP_CENTER}
							zoom={13}
							height={460}
							enableAddMode
							animateNewMarkers
							maxMarkers={20}
							onMarkerAdd={handleMarkerAdd}
							onMarkerRemove={handleMarkerRemove}
						/>
					{/if}
				{:else}
					<div class="map-stage__placeholder">Loading map…</div>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
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
				<tr><td>Pan &amp; zoom</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
				<tr><td>Geocoding search</td><td>—</td><td>Nominatim</td><td>—</td><td>—</td></tr>
				<tr><td>Multiple markers</td><td>—</td><td>Single</td><td>Yes</td><td>Yes</td></tr>
				<tr><td>Category filtering</td><td>—</td><td>—</td><td>Yes</td><td>—</td></tr>
				<tr><td>Click to add</td><td>—</td><td>—</td><td>—</td><td>Yes</td></tr>
				<tr><td>Drag to edit</td><td>—</td><td>—</td><td>—</td><td>Yes</td></tr>
				<tr><td>Database-backed</td><td>—</td><td>—</td><td>Yes</td><td>Optional</td></tr>
				<tr><td>Best for</td><td>Static display</td><td>Place lookup</td><td>Visualisation</td><td>User input</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.map-demo {
		display: grid;
		gap: 14px;
	}
	.map-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.map-demo__tab {
		flex: 1 1 120px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--r-1);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}
	.map-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.map-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.map-demo__hint {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}
	.map-stage {
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--surface);
	}
	.map-stage__placeholder {
		display: grid;
		place-items: center;
		min-height: 460px;
		color: var(--fg-2);
		font-size: 14px;
	}
	.map-demo__readout {
		margin-top: 12px;
		padding: 10px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 13px;
		color: var(--fg-1);
	}
	.map-demo__coords {
		margin-left: 6px;
		color: var(--fg-2);
		font-family: var(--font-mono, ui-monospace, monospace);
	}
</style>
