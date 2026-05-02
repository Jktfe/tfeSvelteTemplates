<!--
	============================================================
	Location Demo Page (TFE shell)
	============================================================

	Live demo expanded to gold standard:
	  • Original LocateMe + Routing tabs preserved
	  • New "Watch position" tab — continuous tracking via
	    watchPosition prop, with sample count and last-update time
	  • New "Accuracy ±" tab — explicit large accuracy radius for
	    visualising GPS confidence
	  • New "Permission denied" tab — simulates the denied state UI
	    so designers can preview the failure mode without revoking
	    real browser permissions
	  • Live state strip below the map shows latest coordinates,
	    accuracy in metres, altitude (when available), error code

	Both Leaflet components are client-only; everything is gated
	on `browser` from $app/environment.
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

	type Variant = 'locate' | 'watch' | 'accuracy' | 'denied' | 'routing';
	let activeExample = $state<Variant>('locate');

	let lastLocation = $state<GeolocationResult | null>(null);
	let watchSamples = $state(0);
	let lastWatchAt = $state<number | null>(null);
	let lastError = $state<{ type: GeolocationErrorType; message: string } | null>(null);

	// Simulated denied-state UI — toggled by the user, not by the browser.
	// Lets designers preview the failure mode without revoking permissions.
	let simulateDenied = $state(true);
	let retryCount = $state(0);

	let routeOrigin = $state<LatLng | undefined>({ lat: 51.5074, lng: -0.1278 });
	let routeDestination = $state<LatLng | undefined>({ lat: 51.5155, lng: -0.0922 });
	let lastRoute = $state<RouteResult | null>(null);

	function handleLocate(result: GeolocationResult): void {
		lastLocation = result;
		lastError = null;
	}
	function handleWatch(result: GeolocationResult): void {
		lastLocation = result;
		watchSamples++;
		lastWatchAt = Date.now();
		lastError = null;
	}
	function handleLocationError(error: GeolocationErrorType, message: string): void {
		lastError = { type: error, message };
		console.log('[Location Demo] geolocation error:', error, message);
	}
	function handleRouteCalculated(route: RouteResult): void {
		lastRoute = route;
	}
	function retryDenied() {
		retryCount++;
		simulateDenied = false;
		// Flip back after a short window so users see the retry path
		setTimeout(() => (simulateDenied = true), 1500);
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
	function formatRelativeTime(ts: number): string {
		const delta = Math.max(0, Date.now() - ts);
		if (delta < 1000) return 'just now';
		if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`;
		return `${Math.floor(delta / 60_000)} min ago`;
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
				<button type="button" role="tab" class="loc-demo__tab" class:active={activeExample === 'locate'} aria-selected={activeExample === 'locate'} onclick={() => (activeExample = 'locate')}>Locate me</button>
				<button type="button" role="tab" class="loc-demo__tab" class:active={activeExample === 'watch'} aria-selected={activeExample === 'watch'} onclick={() => (activeExample = 'watch')}>Watch position</button>
				<button type="button" role="tab" class="loc-demo__tab" class:active={activeExample === 'accuracy'} aria-selected={activeExample === 'accuracy'} onclick={() => (activeExample = 'accuracy')}>Accuracy ±</button>
				<button type="button" role="tab" class="loc-demo__tab" class:active={activeExample === 'denied'} aria-selected={activeExample === 'denied'} onclick={() => (activeExample = 'denied')}>Permission denied</button>
				<button type="button" role="tab" class="loc-demo__tab" class:active={activeExample === 'routing'} aria-selected={activeExample === 'routing'} onclick={() => (activeExample = 'routing')}>Routing</button>
			</div>

			<p class="loc-demo__hint">
				{#if activeExample === 'locate'}
					Click the locate button (top-right) to find your current position. Browser permission required — needs HTTPS or localhost.
				{:else if activeExample === 'watch'}
					Continuous tracking via <code>watchPosition</code>. Each browser update increments the sample counter below. Useful for live navigation and breadcrumb trails.
				{:else if activeExample === 'accuracy'}
					Same component, but with a <strong>large</strong> blue accuracy circle to show how MapLocateMe communicates GPS confidence — the marker is your point estimate, the circle is the 68% radius.
				{:else if activeExample === 'denied'}
					Designed-in failure mode. The denied UI below renders the same way regardless of whether the user blocked permission, blocked the API at the OS level, or rejected the prompt. Click <strong>Retry</strong> to simulate a successful re-prompt.
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
					{:else if activeExample === 'watch'}
						<MapLocateMe
							center={DEFAULT_MAP_CENTER}
							zoom={14}
							height={460}
							locateZoom={17}
							showAccuracyCircle
							enableHighAccuracy
							watchPosition
							timeout={10000}
							buttonPosition="topright"
							onLocate={handleWatch}
							onError={handleLocationError}
						/>
					{:else if activeExample === 'accuracy'}
						<MapLocateMe
							center={DEFAULT_MAP_CENTER}
							zoom={12}
							height={460}
							locateZoom={14}
							showAccuracyCircle
							enableHighAccuracy={false}
							timeout={15000}
							buttonPosition="topright"
							onLocate={handleLocate}
							onError={handleLocationError}
						/>
					{:else if activeExample === 'denied'}
						{#if simulateDenied}
							<div class="loc-denied" role="alert" aria-live="polite">
								<div class="loc-denied__icon" aria-hidden="true">
									<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="9" />
										<line x1="5" y1="5" x2="19" y2="19" />
									</svg>
								</div>
								<h3 class="loc-denied__title">Location access blocked</h3>
								<p class="loc-denied__body">
									Your browser denied access to geolocation. To use this feature, allow location in the
									browser site settings, then reload.
								</p>
								<dl class="loc-denied__meta">
									<div><dt>Code</dt><dd><code>PERMISSION_DENIED</code></dd></div>
									<div><dt>Retries</dt><dd>{retryCount}</dd></div>
								</dl>
								<button type="button" class="loc-denied__btn" onclick={retryDenied}>
									Try again
								</button>
							</div>
						{:else}
							<MapLocateMe
								center={DEFAULT_MAP_CENTER}
								zoom={13}
								height={460}
								locateZoom={16}
								showAccuracyCircle
								onLocate={handleLocate}
								onError={handleLocationError}
							/>
						{/if}
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

			{#if activeExample === 'routing' && lastRoute}
				<dl class="loc-readout">
					<div><dt>Distance</dt><dd>{formatDistance(lastRoute.distance)}</dd></div>
					<div><dt>Duration</dt><dd>{formatDuration(lastRoute.duration)}</dd></div>
					{#if lastRoute.steps}
						<div><dt>Steps</dt><dd>{lastRoute.steps.length} directions</dd></div>
					{/if}
				</dl>
			{:else if activeExample !== 'routing' && activeExample !== 'denied'}
				<dl class="loc-readout">
					<div>
						<dt>Coordinates</dt>
						<dd class="mono">
							{lastLocation
								? `${lastLocation.position.lat.toFixed(6)}, ${lastLocation.position.lng.toFixed(6)}`
								: '— click locate to begin'}
						</dd>
					</div>
					<div>
						<dt>Accuracy</dt>
						<dd>{lastLocation ? `±${Math.round(lastLocation.accuracy)} m` : '—'}</dd>
					</div>
					{#if lastLocation?.altitude != null}
						<div><dt>Altitude</dt><dd>{Math.round(lastLocation.altitude)} m</dd></div>
					{/if}
					{#if activeExample === 'watch'}
						<div><dt>Samples</dt><dd>{watchSamples}</dd></div>
						{#if lastWatchAt}
							<div><dt>Last update</dt><dd>{formatRelativeTime(lastWatchAt)}</dd></div>
						{/if}
					{/if}
					{#if lastError}
						<div class="loc-readout__error">
							<dt>Error</dt>
							<dd><code>{lastError.type}</code> — {lastError.message}</dd>
						</div>
					{/if}
				</dl>
			{/if}

			<div class="loc-recipes">
				<h3 class="loc-recipes__title">Recipes</h3>
				<ul class="loc-recipes__list">
					<li>
						<strong>"Find me on a map" page.</strong> Default <code>MapLocateMe</code> with <code>showAccuracyCircle</code>. Best for one-shot lookups (delivery address, "stores near me").
					</li>
					<li>
						<strong>Live navigation.</strong> Add <code>watchPosition</code> and keep a state strip showing samples + last-update time. Track the first 10 samples then debounce — handheld GPS jitters fast indoors.
					</li>
					<li>
						<strong>GPS confidence visualisation.</strong> Set <code>enableHighAccuracy={'{false}'}</code> on a city-level zoom to get a visibly large accuracy circle. Helpful for explaining "GPS works, but it isn't perfect" in an onboarding flow.
					</li>
					<li>
						<strong>Permission-denied state.</strong> Listen for <code>onError</code> with type <code>PERMISSION_DENIED</code> and render a non-blocking explainer + retry button. Don't auto-prompt — browsers throttle repeated requests.
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
		flex: 1 1 130px;
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
	.loc-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.map-stage {
		position: relative;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--surface);
		min-height: 460px;
		contain: layout paint;
		transform: translateZ(0);
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
		gap: 8px 16px;
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
	.loc-readout__error {
		grid-column: 1 / -1;
		color: #b91c1c;
	}
	.loc-readout__error dd {
		color: #b91c1c;
	}
	.loc-readout .mono {
		font-family: var(--font-mono, ui-monospace, monospace);
	}

	.loc-denied {
		display: grid;
		justify-items: center;
		gap: 12px;
		padding: 36px 24px;
		text-align: center;
		min-height: 460px;
		align-content: center;
		background: linear-gradient(180deg, var(--surface), var(--surface-2));
	}
	.loc-denied__icon {
		display: grid;
		place-items: center;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: rgba(220, 38, 38, 0.1);
		color: #dc2626;
	}
	.loc-denied__title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.loc-denied__body {
		margin: 0;
		max-width: 420px;
		font-size: 14px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.loc-denied__meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px 24px;
		margin: 4px 0 0;
		padding: 0;
	}
	.loc-denied__meta div {
		display: grid;
		gap: 2px;
	}
	.loc-denied__meta dt {
		font-size: 11px;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.loc-denied__meta dd {
		margin: 0;
		font-size: 13px;
		color: var(--fg-1);
	}
	.loc-denied__meta code {
		font-family: var(--font-mono);
		font-size: 12px;
		padding: 1px 6px;
		border-radius: var(--r-1);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.loc-denied__btn {
		margin-top: 4px;
		padding: 9px 18px;
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		background: #146ef5;
		border: none;
		border-radius: var(--r-1);
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.loc-denied__btn:hover {
		background: #0f5ad4;
	}

	.loc-recipes {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.loc-recipes__title {
		margin: 0 0 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.loc-recipes__list {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 10px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.loc-recipes__list strong {
		color: var(--fg-1);
	}
	.loc-recipes__list code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
