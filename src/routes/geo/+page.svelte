<!--
	============================================================
	GeoViz Demo Page (TFE shell)
	============================================================

	Adopts ComponentPageShell for the SVG-based geographic
	visualisation trio (GeoChoropleth, GeoBubbleMap, GeoSpikeMap).
	GeoJSON is loaded server-side via +page.server.ts; the SVG
	renders are SSR-safe but we still gate the demo on `browser`
	to avoid layerchart re-running its own measurement code on
	the server.
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import GeoChoropleth from '$lib/components/GeoChoropleth.svelte';
	import GeoBubbleMap from '$lib/components/GeoBubbleMap.svelte';
	import GeoSpikeMap from '$lib/components/GeoSpikeMap.svelte';
	import {
		FALLBACK_UK_REGION_DATA,
		FALLBACK_SALES_BY_REGION,
		FALLBACK_GEO_DATA_POINTS,
		GEO_COLOR_SCALES
	} from '$lib/constants';
	import type { GeoRegionProperties, GeoDataPoint } from '$lib/types';

	let { data } = $props();
	const shell = catalogShellPropsForSlug('/geo')!;

	let activeExample = $state<'choropleth' | 'bubble' | 'spike'>('choropleth');
	let choroplethDataset = $state<'population' | 'sales'>('population');
	let selectedItem = $state<GeoRegionProperties | GeoDataPoint | null>(null);

	const choroplethData = $derived(
		choroplethDataset === 'population' ? FALLBACK_UK_REGION_DATA : FALLBACK_SALES_BY_REGION
	);
	const choroplethColorScale = $derived(
		choroplethDataset === 'population'
			? { type: 'sequential' as const, colors: [...GEO_COLOR_SCALES.blues] }
			: { type: 'sequential' as const, colors: [...GEO_COLOR_SCALES.orangeRed] }
	);
	const cityData = $derived(
		FALLBACK_GEO_DATA_POINTS.filter((p) => p.category === 'population')
	);

	function handleRegionClick(region: GeoRegionProperties): void {
		selectedItem = region;
	}
	function handlePointClick(point: GeoDataPoint): void {
		selectedItem = point;
	}

	const codeExplanation =
		'All three components share a server loader that fetches UK GeoJSON from the ONS Open Geography Portal with a hand-built fallback for offline development. GeoChoropleth tints each region by a sequential colour scale, GeoBubbleMap renders sized circles at each lat/long, and GeoSpikeMap projects vertical magnitude bars. They all use D3 projections under the hood via LayerChart, so swapping country boundaries is a one-line change.';
</script>

<svelte:head>
	<title>GeoViz — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="SVG choropleth, bubble, and spike maps for UK regions. Server-loaded GeoJSON with offline fallback."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'LayerChart', 'D3 geo', 'SVG', 'Server-loaded GeoJSON']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="geo-demo">
			<div class="geo-demo__tabs" role="tablist" aria-label="Geo component variants">
				<button
					type="button"
					role="tab"
					class="geo-demo__tab"
					class:active={activeExample === 'choropleth'}
					aria-selected={activeExample === 'choropleth'}
					onclick={() => (activeExample = 'choropleth')}
				>
					Choropleth
				</button>
				<button
					type="button"
					role="tab"
					class="geo-demo__tab"
					class:active={activeExample === 'bubble'}
					aria-selected={activeExample === 'bubble'}
					onclick={() => (activeExample = 'bubble')}
				>
					Bubbles
				</button>
				<button
					type="button"
					role="tab"
					class="geo-demo__tab"
					class:active={activeExample === 'spike'}
					aria-selected={activeExample === 'spike'}
					onclick={() => (activeExample = 'spike')}
				>
					Spikes
				</button>
			</div>

			<div class="geo-demo__hint">
				{#if activeExample === 'choropleth'}
					Hover for region details, click to select. Toggle between the population and sales datasets.
				{:else if activeExample === 'bubble'}
					{cityData.length} major UK cities; bubble area scales with population (thousands).
				{:else}
					{cityData.length} major UK cities; spike height scales with population (thousands).
				{/if}
				{#if data.usingFallback}
					<span class="geo-demo__notice">Using simplified UK fallback geometry (ONS fetch unavailable).</span>
				{/if}
			</div>

			{#if activeExample === 'choropleth'}
				<div class="geo-demo__toggle" role="group" aria-label="Choropleth dataset">
					<button
						type="button"
						class="geo-demo__toggle-btn"
						class:active={choroplethDataset === 'population'}
						onclick={() => (choroplethDataset = 'population')}
					>
						Population
					</button>
					<button
						type="button"
						class="geo-demo__toggle-btn"
						class:active={choroplethDataset === 'sales'}
						onclick={() => (choroplethDataset = 'sales')}
					>
						Sales
					</button>
				</div>
			{/if}

			<div class="map-stage">
				{#if browser}
					{#if activeExample === 'choropleth' && data.geojson}
						<GeoChoropleth
							geojson={data.geojson}
							data={choroplethData}
							colorScale={choroplethColorScale}
							height={500}
							showLegend
							showTooltip
							onRegionClick={handleRegionClick}
						/>
					{:else if activeExample === 'bubble' && data.countriesGeojson}
						<GeoBubbleMap
							geojson={data.countriesGeojson}
							data={cityData}
							height={500}
							minRadius={6}
							maxRadius={50}
							bubbleColor="rgba(59, 130, 246, 0.65)"
							showLabels
							onBubbleClick={handlePointClick}
						/>
					{:else if activeExample === 'spike' && data.countriesGeojson}
						<GeoSpikeMap
							geojson={data.countriesGeojson}
							data={cityData}
							height={500}
							minSpikeHeight={8}
							maxSpikeHeight={100}
							spikeWidth={4}
							spikeColor="#ef4444"
							onSpikeClick={handlePointClick}
						/>
					{:else}
						<div class="map-stage__placeholder">No GeoJSON available.</div>
					{/if}
				{:else}
					<div class="map-stage__placeholder">Loading map…</div>
				{/if}
			</div>

			{#if selectedItem}
				<div class="geo-demo__readout">
					<strong>Selected:</strong>
					{selectedItem.name}
					{#if selectedItem.value !== undefined}
						<span class="geo-demo__value">({selectedItem.value.toLocaleString('en-GB')})</span>
					{/if}
					<button type="button" class="geo-demo__clear" onclick={() => (selectedItem = null)}>Clear</button>
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Feature</th>
					<th>Choropleth</th>
					<th>Bubble</th>
					<th>Spike</th>
				</tr>
			</thead>
			<tbody>
				<tr><td>Best for</td><td>Regional metrics</td><td>Point magnitudes</td><td>Dramatic comparisons</td></tr>
				<tr><td>Data shape</td><td>Region polygons</td><td>Point lat/long</td><td>Point lat/long</td></tr>
				<tr><td>Encodes value via</td><td>Fill colour</td><td>Circle area</td><td>Spike height</td></tr>
				<tr><td>Background map</td><td>Required</td><td>Optional</td><td>Optional</td></tr>
				<tr><td>Tooltips</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
				<tr><td>Click events</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
				<tr><td>Built-in legend</td><td>Colour gradient</td><td>Size scale</td><td>Height scale</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.geo-demo {
		display: grid;
		gap: 14px;
	}
	.geo-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.geo-demo__tab {
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
	.geo-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.geo-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.geo-demo__hint {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
		display: grid;
		gap: 4px;
	}
	.geo-demo__notice {
		display: inline-block;
		padding: 4px 8px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 12px;
		color: var(--fg-1);
	}
	.geo-demo__toggle {
		display: flex;
		gap: 6px;
	}
	.geo-demo__toggle-btn {
		padding: 6px 12px;
		font-size: 13px;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		cursor: pointer;
	}
	.geo-demo__toggle-btn.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--fg-1);
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
	.geo-demo__readout {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 13px;
		color: var(--fg-1);
	}
	.geo-demo__value {
		color: var(--fg-2);
		font-family: var(--font-mono, ui-monospace, monospace);
	}
	.geo-demo__clear {
		margin-left: auto;
		padding: 4px 10px;
		font-size: 12px;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		cursor: pointer;
	}
	.geo-demo__clear:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
</style>
