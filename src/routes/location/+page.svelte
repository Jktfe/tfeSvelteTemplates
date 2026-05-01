<!--
	============================================================
	Location Demo Page (TFE shell)
	============================================================

	Adopts ComponentPageShell for the location-aware Leaflet
	pair: MapLocateMe (browser geolocation) and MapRouting (OSRM
	A→B routing). Both are client-only, so the live demo is
	gated on `browser` from $app/environment.
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import MapLocateMe from '$lib/components/MapLocateMe.svelte';
	import MapRouting from '$lib/components/MapRouting.svelte';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type {
		GeolocationResult,
		GeolocationErrorType,
		RouteResult,
		LatLng
	} from '$lib/types';

	const shell = catalogShellPropsForSlug('/location')!;

	let activeExample = $state<'locate' | 'routing'>('locate');
	let lastLocation = $state<GeolocationResult | null>(null);

	let routeOrigin = $state<LatLng | undefined>({ lat: 51.5074, lng: -0.1278 });
	let routeDestination = $state<LatLng | undefined>({ lat: 51.5155, lng: -0.0922 });
	let lastRoute = $state<RouteResult | null>(null);

	function handleLocate(result: GeolocationResult): void {
		lastLocation = result;
	}
	function handleLocationError(error: GeolocationErrorType, message: string): void {
		console.log('[Location Demo] geolocation error:', error, message);
	}
	function handleRouteCalculated(route: RouteResult): void {
		lastRoute = route;
	}

	function formatDistance(metres: number): string {
		if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
		return `${Math.round(metres)} m`;
	}
	function formatDuration(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
	}

	const codeExplanation =
		'MapLocateMe wraps the browser Geolocation API with permission prompts, an accuracy circle, and an optional watchPosition mode — coordinates and altitude come back through the onLocate callback. MapRouting takes two LatLng waypoints, calls the public OSRM demo endpoint, and renders a polyline plus distance, duration, and turn-by-turn steps. Both components are mounted with `bind:` props so the parent always sees the latest origin / destination / location.';
</script>

<svelte:head>
	<title>Location Services — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Geolocation and routing for Svelte 5: locate-me with accuracy radius, plus A→B routing via OSRM."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Leaflet', 'Geolocation API', 'OSRM routing', 'HTTPS required']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="loc-demo">
			<div class="loc-demo__tabs" role="tablist" aria-label="Location component variants">
				<button
					type="button"
					role="tab"
					class="loc-demo__tab"
					class:active={activeExample === 'locate'}
					aria-selected={activeExample === 'locate'}
					onclick={() => (activeExample = 'locate')}
				>
					MapLocateMe
				</button>
				<button
					type="button"
					role="tab"
					class="loc-demo__tab"
					class:active={activeExample === 'routing'}
					aria-selected={activeExample === 'routing'}
					onclick={() => (activeExample = 'routing')}
				>
					MapRouting
				</button>
			</div>

			<p class="loc-demo__hint">
				{#if activeExample === 'locate'}
					Click the locate button to find your current position. Browser permission required.
				{:else}
					Click the map to set origin (A) and destination (B), or drag the markers. Routing via OSRM.
				{/if}
			</p>

			<div class="map-stage">
				{#if browser}
					{#if activeExample === 'locate'}
						<MapLocateMe
							center={DEFAULT_MAP_CENTER}
							zoom={13}
							height={460}
							locateZoom={16}
							showAccuracyCircle
							enableHighAccuracy
							timeout={10000}
							buttonPosition="topright"
							onLocate={handleLocate}
							onError={handleLocationError}
						/>
					{:else}
						<MapRouting
							bind:origin={routeOrigin}
							bind:destination={routeDestination}
							center={DEFAULT_MAP_CENTER}
							zoom={13}
							height={460}
							profile="driving"
							showInstructions
							showDistance
							showDuration
							routeColor="#146ef5"
							routeWeight={5}
							draggableWaypoints
							enableClickToSet
							onRouteCalculated={handleRouteCalculated}
						/>
					{/if}
				{:else}
					<div class="map-stage__placeholder">Loading map…</div>
				{/if}
			</div>

			{#if activeExample === 'locate' && lastLocation}
				<dl class="loc-readout">
					<div><dt>Coordinates</dt><dd class="mono">{lastLocation.position.lat.toFixed(6)}, {lastLocation.position.lng.toFixed(6)}</dd></div>
					<div><dt>Accuracy</dt><dd>±{Math.round(lastLocation.accuracy)} m</dd></div>
					{#if lastLocation.altitude}
						<div><dt>Altitude</dt><dd>{Math.round(lastLocation.altitude)} m</dd></div>
					{/if}
				</dl>
			{:else if activeExample === 'routing' && lastRoute}
				<dl class="loc-readout">
					<div><dt>Distance</dt><dd>{formatDistance(lastRoute.distance)}</dd></div>
					<div><dt>Duration</dt><dd>{formatDuration(lastRoute.duration)}</dd></div>
					{#if lastRoute.steps}
						<div><dt>Steps</dt><dd>{lastRoute.steps.length} directions</dd></div>
					{/if}
				</dl>
			{/if}
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Feature</th>
					<th>MapLocateMe</th>
					<th>MapRouting</th>
				</tr>
			</thead>
			<tbody>
				<tr><td>Find user location</td><td>Yes (Geolocation API)</td><td>—</td></tr>
				<tr><td>Accuracy circle</td><td>Yes</td><td>—</td></tr>
				<tr><td>Real-time tracking</td><td>Optional (watchPosition)</td><td>—</td></tr>
				<tr><td>Markers</td><td>Single (you)</td><td>Two (A / B)</td></tr>
				<tr><td>Route polyline</td><td>—</td><td>Yes</td></tr>
				<tr><td>Turn-by-turn steps</td><td>—</td><td>Yes (OSRM)</td></tr>
				<tr><td>External API</td><td>Browser only</td><td>OSRM demo endpoint</td></tr>
				<tr><td>HTTPS / localhost required</td><td>Yes</td><td>No</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.loc-demo {
		display: grid;
		gap: 14px;
	}
	.loc-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.loc-demo__tab {
		flex: 1 1 140px;
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
	.loc-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.loc-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.loc-demo__hint {
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
	.loc-readout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 8px;
		margin: 0;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
	}
	.loc-readout > div {
		display: grid;
		gap: 2px;
	}
	.loc-readout dt {
		font-size: 11px;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.loc-readout dd {
		margin: 0;
		font-size: 13px;
		color: var(--fg-1);
	}
	.loc-readout .mono {
		font-family: var(--font-mono, ui-monospace, monospace);
	}
</style>
