<!--
	============================================================
	Maps Demo Page (TFE shell)
	============================================================

	Live demo expanded to gold standard. Leaflet-only constraints
	mean we work with the props the components actually expose:
	  • Original four tabs preserved (Basic / Search / Markers / Live)
	  • New "Dense markers" tab — generates ~50 synthetic markers
	    around the existing UK landmarks to show MapMarkers' category
	    filtering working at scale
	  • New "Mobile (9:16)" tab — wraps MapBasic in a mobile aspect
	    ratio for previewing how the controls look on a phone
	  • New "Compact" tab — 320×240 minimap pattern with controls hidden
	  • All map mounts gated on `browser` to keep SSR clean

	Note on satellite tiles: MapBasic / MapMarkers do not expose a
	tileLayer prop today, so the satellite/street toggle is
	deferred until the components grow that surface. We document
	the pattern in the recipes block below.
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

	type Variant = 'basic' | 'search' | 'markers' | 'live' | 'dense' | 'mobile' | 'compact';
	let activeExample = $state<Variant>('basic');
	let liveMarkers = $state<MapMarker[]>([]);
	let lastSearchResult = $state<GeoSearchResult | null>(null);

	// ---------------------------------------------------------------------------
	// Dense marker fixture — 50 synthetic markers spread around central London.
	// We seed deterministically so the layout doesn't jitter between renders.
	// ---------------------------------------------------------------------------
	function seededRandom(seed: number): () => number {
		let s = seed >>> 0;
		return () => {
			s = (s * 1664525 + 1013904223) >>> 0;
			return s / 0xffffffff;
		};
	}

	function buildDenseMarkers(): MapMarker[] {
		const rand = seededRandom(42);
		const categories = ['cafe', 'museum', 'park', 'bookshop', 'transport'];
		const baseLat = 51.5074;
		const baseLng = -0.1278;
		const out: MapMarker[] = [...data.markers]; // include real landmarks
		for (let i = 0; i < 50; i++) {
			const cat = categories[i % categories.length];
			out.push({
				id: 10_000 + i,
				position: {
					// Spread roughly within Zone 1
					lat: baseLat + (rand() - 0.5) * 0.08,
					lng: baseLng + (rand() - 0.5) * 0.16
				},
				title: `${cat[0].toUpperCase() + cat.slice(1)} #${i + 1}`,
				description: `Auto-generated ${cat} marker for the dense-markers demo.`,
				category: cat,
				iconType: 'circle'
			});
		}
		return out;
	}

	const denseMarkers = buildDenseMarkers();

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
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'basic'} aria-selected={activeExample === 'basic'} onclick={() => (activeExample = 'basic')}>MapBasic</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'search'} aria-selected={activeExample === 'search'} onclick={() => (activeExample = 'search')}>MapSearch</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'markers'} aria-selected={activeExample === 'markers'} onclick={() => (activeExample = 'markers')}>MapMarkers</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'live'} aria-selected={activeExample === 'live'} onclick={() => (activeExample = 'live')}>MapLive</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'dense'} aria-selected={activeExample === 'dense'} onclick={() => (activeExample = 'dense')}>Dense markers</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'mobile'} aria-selected={activeExample === 'mobile'} onclick={() => (activeExample = 'mobile')}>Mobile 9:16</button>
				<button type="button" role="tab" class="map-demo__tab" class:active={activeExample === 'compact'} aria-selected={activeExample === 'compact'} onclick={() => (activeExample = 'compact')}>Minimap</button>
			</div>

			<p class="map-demo__hint">
				{#if activeExample === 'basic'}
					Pan and zoom an OpenStreetMap-tiled map. Drag, scroll, or use the on-screen controls.
				{:else if activeExample === 'search'}
					Type a place name to query Nominatim. Pick a result and the map flies to it.
				{:else if activeExample === 'markers'}
					{data.markers.length} UK landmarks loaded {data.usingDatabase ? 'from the database' : 'from the static fallback'}. Filter by category.
				{:else if activeExample === 'live'}
					Click anywhere to add a marker. Drag to reposition, click to edit or delete.
				{:else if activeExample === 'dense'}
					{denseMarkers.length} markers in central London — the {data.markers.length} landmark fixtures plus 50 synthetic café / museum / park / bookshop / transport pins. Use the category chips to filter.
				{:else if activeExample === 'mobile'}
					A 9:16 portrait stage to preview how Leaflet's controls behave at phone aspect-ratios. The map and zoom buttons remain reachable; attribution is hidden so it doesn't dominate the UI.
				{:else}
					A 320×240 minimap pattern — controls hidden, scroll-zoom disabled. Drop one of these into a sidebar or a card-footer to give context without stealing focus.
				{/if}
			</p>

			<div
				class="map-stage"
				class:map-stage--mobile={activeExample === 'mobile'}
				class:map-stage--compact={activeExample === 'compact'}
			>
				{#if browser}
					{#if activeExample === 'basic'}
						<MapBasic center={DEFAULT_MAP_CENTER} zoom={13} height={460} enableScrollZoom showZoomControl />
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
						<MapMarkers markers={data.markers} height={460} showCategories onMarkerClick={handleMarkerClick} />
					{:else if activeExample === 'live'}
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
					{:else if activeExample === 'dense'}
						<MapMarkers
							markers={denseMarkers}
							center={DEFAULT_MAP_CENTER}
							zoom={12}
							height={520}
							showCategories
							onMarkerClick={handleMarkerClick}
						/>
					{:else if activeExample === 'mobile'}
						<div class="map-stage__phone">
							<MapBasic
								center={DEFAULT_MAP_CENTER}
								zoom={13}
								height={640}
								enableScrollZoom
								showZoomControl
								showAttribution={false}
							/>
						</div>
					{:else}
						<div class="map-stage__minimap">
							<MapBasic
								center={DEFAULT_MAP_CENTER}
								zoom={11}
								height={240}
								enableScrollZoom={false}
								showZoomControl={false}
								showAttribution={false}
							/>
						</div>
					{/if}
				{:else}
					<div class="map-stage__placeholder">Loading map…</div>
				{/if}
			</div>

			<div class="map-recipes">
				<h3 class="map-recipes__title">Recipes</h3>
				<ul class="map-recipes__list">
					<li>
						<strong>Static "where we are" minimap.</strong> Use <code>MapBasic</code> with <code>height={'{240}'}</code>, <code>enableScrollZoom={'{false}'}</code>, <code>showZoomControl={'{false}'}</code>. Drop into the footer of a contact card.
					</li>
					<li>
						<strong>Dense category map.</strong> Pass dozens of markers to <code>MapMarkers</code> with <code>showCategories</code> and let users filter. Above ~200 pins, plan to add tile-side clustering — <code>enableClustering</code> is reserved on the props but not yet implemented.
					</li>
					<li>
						<strong>Mobile portrait stage.</strong> Wrap <code>MapBasic</code> in a 9:16 frame and hide attribution. The internal Leaflet zoom buttons remain in the top-right and stay thumb-reachable.
					</li>
					<li>
						<strong>Satellite/street toggle.</strong> Today the tile URL is hardcoded to OpenStreetMap. To add satellite, extend <code>MapBasic</code> with a <code>tileLayer</code> prop and pass an Esri World Imagery URL — keep the OSM layer as the fallback for attribution.
					</li>
				</ul>
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
		flex: 1 1 110px;
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
		position: relative;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--surface);
		contain: layout paint;
		transform: translateZ(0);
	}
	.map-stage--mobile,
	.map-stage--compact {
		display: grid;
		place-items: center;
		padding: 16px;
		background: linear-gradient(180deg, var(--surface), var(--surface-2));
	}
	.map-stage__phone {
		width: min(360px, 100%);
		aspect-ratio: 9 / 16;
		max-height: 720px;
		border-radius: 28px;
		overflow: hidden;
		border: 8px solid #111;
		box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
	}
	.map-stage__minimap {
		width: min(320px, 100%);
		border-radius: var(--r-1);
		overflow: hidden;
		border: 1px solid var(--border);
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
	.map-recipes {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.map-recipes__title {
		margin: 0 0 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.map-recipes__list {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 10px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.map-recipes__list strong {
		color: var(--fg-1);
	}
	.map-recipes__list code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
