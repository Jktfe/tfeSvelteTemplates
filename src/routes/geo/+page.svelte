<!--
  Geo Visualization Demo Page

  Demonstrates three geographic visualization components using LayerChart:
  - GeoChoropleth: Color-coded regions based on data values
  - GeoBubbleMap: Sized circles at geographic locations
  - GeoSpikeMap: Vertical spikes showing magnitude at locations

  @author TFE Svelte Templates
-->
<script lang="ts">
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

	// Page data from server
	let { data } = $props();

	// Tab state for switching between examples
	let activeExample = $state<'choropleth' | 'bubble' | 'spike'>('choropleth');

	// Choropleth dataset selection
	let choroplethDataset = $state<'population' | 'sales'>('population');

	// Selected region/point state
	let selectedItem = $state<GeoRegionProperties | GeoDataPoint | null>(null);

	// Get current choropleth data based on selection
	const choroplethData = $derived(
		choroplethDataset === 'population' ? FALLBACK_UK_REGION_DATA : FALLBACK_SALES_BY_REGION
	);

	// Get choropleth color scale based on dataset
	const choroplethColorScale = $derived(
		choroplethDataset === 'population'
			? { type: 'sequential' as const, colors: GEO_COLOR_SCALES.blues }
			: { type: 'sequential' as const, colors: GEO_COLOR_SCALES.orangeRed }
	);

	// Filter cities for bubble/spike maps (population category only for cleaner demo)
	const cityData = $derived(
		FALLBACK_GEO_DATA_POINTS.filter((p) => p.category === 'population')
	);

	/**
	 * Handle region click in choropleth
	 */
	function handleRegionClick(region: GeoRegionProperties): void {
		selectedItem = region;
		console.log('[Geo Demo] Region clicked:', region.name);
	}

	/**
	 * Handle bubble/spike click
	 */
	function handlePointClick(point: GeoDataPoint): void {
		selectedItem = point;
		console.log('[Geo Demo] Point clicked:', point.name);
	}
</script>

<svelte:head>
	<title>Geo Visualizations | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Geographic data visualization components using LayerChart. Choropleth maps, bubble maps, and spike maps for UK data."
	/>
</svelte:head>

<main class="demo-page">
	<!-- Page Header -->
	<header class="page-header">
		<h1>Geo Visualizations</h1>
		<p class="subtitle">
			SVG-based geographic data visualization components using LayerChart.
			Display choropleth maps, bubble maps, and spike maps for UK regions and cities.
		</p>
		{#if data.usingFallback}
			<div class="fallback-notice">
				Using simplified UK geometry (ONS data fetch failed)
			</div>
		{/if}
	</header>

	<!-- Feature Overview Cards -->
	<section class="features-section">
		<div class="features-grid">
			<div class="feature-card" class:active={activeExample === 'choropleth'}>
				<div class="feature-icon">🗺️</div>
				<h3>GeoChoropleth</h3>
				<p>Color-coded regions based on data values like population or sales</p>
				<button class="feature-btn" onclick={() => (activeExample = 'choropleth')}>
					{activeExample === 'choropleth' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'bubble'}>
				<div class="feature-icon">🔵</div>
				<h3>GeoBubbleMap</h3>
				<p>Sized circles at geographic locations proportional to values</p>
				<button class="feature-btn" onclick={() => (activeExample = 'bubble')}>
					{activeExample === 'bubble' ? 'Viewing' : 'View Demo'}
				</button>
			</div>

			<div class="feature-card" class:active={activeExample === 'spike'}>
				<div class="feature-icon">📊</div>
				<h3>GeoSpikeMap</h3>
				<p>Vertical spikes showing magnitude at locations for 3D effect</p>
				<button class="feature-btn" onclick={() => (activeExample = 'spike')}>
					{activeExample === 'spike' ? 'Viewing' : 'View Demo'}
				</button>
			</div>
		</div>
	</section>

	<!-- Example Display -->
	<section class="example-section">
		<div class="example-header">
			<h2>
				{#if activeExample === 'choropleth'}
					GeoChoropleth - UK Regions
				{:else if activeExample === 'bubble'}
					GeoBubbleMap - UK Cities
				{:else}
					GeoSpikeMap - UK Cities
				{/if}
			</h2>
			<p class="example-description">
				{#if activeExample === 'choropleth'}
					Hover over regions to see details. Click to select. Toggle between population and sales data.
				{:else if activeExample === 'bubble'}
					Showing {cityData.length} major UK cities. Bubble size represents population (thousands).
				{:else}
					Showing {cityData.length} major UK cities. Spike height represents population (thousands).
				{/if}
			</p>

			{#if activeExample === 'choropleth'}
				<div class="dataset-toggle">
					<button
						class="toggle-btn"
						class:active={choroplethDataset === 'population'}
						onclick={() => (choroplethDataset = 'population')}
					>
						Population
					</button>
					<button
						class="toggle-btn"
						class:active={choroplethDataset === 'sales'}
						onclick={() => (choroplethDataset = 'sales')}
					>
						Sales Data
					</button>
				</div>
			{/if}
		</div>

		<div class="example-container">
			{#if activeExample === 'choropleth'}
				<GeoChoropleth
					geojson={data.geojson}
					data={choroplethData}
					colorScale={choroplethColorScale}
					height={550}
					showLegend={true}
					showTooltip={true}
					onRegionClick={handleRegionClick}
				/>
			{:else if activeExample === 'bubble'}
				<GeoBubbleMap
					geojson={data.geojson}
					data={cityData}
					height={550}
					minRadius={6}
					maxRadius={50}
					bubbleColor="rgba(59, 130, 246, 0.65)"
					showLabels={true}
					onBubbleClick={handlePointClick}
				/>
			{:else}
				<GeoSpikeMap
					geojson={data.geojson}
					data={cityData}
					height={550}
					minSpikeHeight={8}
					maxSpikeHeight={100}
					spikeWidth={4}
					spikeColor="#ef4444"
					onSpikeClick={handlePointClick}
				/>
			{/if}
		</div>

		{#if selectedItem}
			<div class="selection-info">
				<strong>Selected:</strong>
				{'name' in selectedItem ? selectedItem.name : ''}
				{#if 'value' in selectedItem && selectedItem.value !== undefined}
					<span class="selection-value">
						({selectedItem.value.toLocaleString('en-GB')})
					</span>
				{/if}
				<button class="clear-btn" onclick={() => (selectedItem = null)}>Clear</button>
			</div>
		{/if}
	</section>

	<!-- Usage Section -->
	<section class="usage-section">
		<h2>Usage Examples</h2>

		<div class="code-tabs">
			<button
				class="code-tab"
				class:active={activeExample === 'choropleth'}
				onclick={() => (activeExample = 'choropleth')}
			>
				GeoChoropleth
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'bubble'}
				onclick={() => (activeExample = 'bubble')}
			>
				GeoBubbleMap
			</button>
			<button
				class="code-tab"
				class:active={activeExample === 'spike'}
				onclick={() => (activeExample = 'spike')}
			>
				GeoSpikeMap
			</button>
		</div>

		<div class="code-block">
			{#if activeExample === 'choropleth'}
				<pre><code>{`<script>
  import GeoChoropleth from '$lib/components/GeoChoropleth.svelte';
  import { FALLBACK_UK_REGION_DATA, GEO_COLOR_SCALES } from '$lib/constants';

  // geojson loaded from server or API
  let { data } = $props();

  function handleClick(region) {
    console.log('Selected:', region.name, region.value);
  }
</script>

<GeoChoropleth
  geojson={data.geojson}
  data={FALLBACK_UK_REGION_DATA}
  colorScale={{ type: 'sequential', colors: GEO_COLOR_SCALES.blues }}
  height={500}
  showLegend={true}
  showTooltip={true}
  onRegionClick={handleClick}
/>`}</code></pre>
			{:else if activeExample === 'bubble'}
				<pre><code>{`<script>
  import GeoBubbleMap from '$lib/components/GeoBubbleMap.svelte';
  import { FALLBACK_GEO_DATA_POINTS } from '$lib/constants';

  let { data } = $props();

  // Filter to specific category
  const cityData = FALLBACK_GEO_DATA_POINTS.filter(
    p => p.category === 'population'
  );
</script>

<GeoBubbleMap
  geojson={data.geojson}
  data={cityData}
  height={500}
  minRadius={6}
  maxRadius={50}
  bubbleColor="rgba(59, 130, 246, 0.65)"
  showLabels={true}
  onBubbleClick={(point) => console.log(point)}
/>`}</code></pre>
			{:else}
				<pre><code>{`<script>
  import GeoSpikeMap from '$lib/components/GeoSpikeMap.svelte';
  import { FALLBACK_GEO_DATA_POINTS } from '$lib/constants';

  let { data } = $props();

  const cityData = FALLBACK_GEO_DATA_POINTS.filter(
    p => p.category === 'population'
  );
</script>

<GeoSpikeMap
  geojson={data.geojson}
  data={cityData}
  height={500}
  minSpikeHeight={8}
  maxSpikeHeight={100}
  spikeWidth={4}
  spikeColor="#ef4444"
  onSpikeClick={(point) => console.log(point)}
/>`}</code></pre>
			{/if}
		</div>
	</section>

	<!-- Data Format Section -->
	<section class="data-section">
		<h2>Data Formats</h2>
		<div class="data-cards">
			<div class="data-card">
				<h3>GeoRegionData (Choropleth)</h3>
				<pre><code>{`interface GeoRegionData {
  regionId: string;  // Matches GeoJSON feature ID
  value: number;     // Data value for coloring
  label?: string;    // Optional tooltip label
}

// Example:
{ regionId: 'E12000007', value: 8.80, label: 'London' }`}</code></pre>
			</div>
			<div class="data-card">
				<h3>GeoDataPoint (Bubble/Spike)</h3>
				<pre><code>{`interface GeoDataPoint {
  id: string;        // Unique identifier
  name: string;      // Location name
  lat: number;       // Latitude
  long: number;      // Longitude
  value: number;     // Data value (size/height)
  category?: string; // Optional category
  color?: string;    // Optional custom color
}

// Example:
{ id: 'london', name: 'London', lat: 51.5074, long: -0.1278, value: 8982 }`}</code></pre>
			</div>
		</div>
	</section>

	<!-- Component Comparison -->
	<section class="comparison-section">
		<h2>Component Comparison</h2>
		<div class="comparison-table-wrapper">
			<table class="comparison-table">
				<thead>
					<tr>
						<th>Feature</th>
						<th>GeoChoropleth</th>
						<th>GeoBubbleMap</th>
						<th>GeoSpikeMap</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Best For</td>
						<td>Regional data</td>
						<td>Point magnitudes</td>
						<td>Dramatic visual impact</td>
					</tr>
					<tr>
						<td>Data Type</td>
						<td>Regions (polygons)</td>
						<td>Points (lat/long)</td>
						<td>Points (lat/long)</td>
					</tr>
					<tr>
						<td>Value Encoding</td>
						<td>Fill color</td>
						<td>Circle area</td>
						<td>Spike height</td>
					</tr>
					<tr>
						<td>Background Map</td>
						<td>Required</td>
						<td>Optional</td>
						<td>Optional</td>
					</tr>
					<tr>
						<td>Tooltips</td>
						<td>✅</td>
						<td>✅</td>
						<td>✅</td>
					</tr>
					<tr>
						<td>Click Events</td>
						<td>✅</td>
						<td>✅</td>
						<td>✅</td>
					</tr>
					<tr>
						<td>Labels</td>
						<td>Via tooltip</td>
						<td>✅ On large bubbles</td>
						<td>Via tooltip</td>
					</tr>
					<tr>
						<td>Legend</td>
						<td>✅ Color gradient</td>
						<td>✅ Size comparison</td>
						<td>✅ Height comparison</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Dependencies Note -->
	<section class="deps-section">
		<h2>Dependencies</h2>
		<div class="deps-info">
			<p>
				These components use <strong>LayerChart</strong> for SVG rendering and
				<strong>D3</strong> for projections and scales.
			</p>
			<pre><code>bun add layerchart</code></pre>
			<p class="deps-note">
				LayerChart includes D3 geo/scale dependencies. No additional packages required.
			</p>
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

	.fallback-notice {
		display: inline-block;
		background: #fef3c7;
		color: #92400e;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	/* ==================================================
     Features Section
     ================================================== */
	.features-section {
		margin-bottom: 3rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.dataset-toggle {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #666;
		background: #f3f4f6;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toggle-btn:hover {
		background: #e5e7eb;
	}

	.toggle-btn.active {
		color: white;
		background: #146ef5;
		border-color: #146ef5;
	}

	.example-container {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.selection-info {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #0369a1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.selection-value {
		color: #0c4a6e;
		font-family: monospace;
	}

	.clear-btn {
		margin-left: auto;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: #0369a1;
		background: transparent;
		border: 1px solid #0369a1;
		border-radius: 4px;
		cursor: pointer;
	}

	.clear-btn:hover {
		background: rgba(3, 105, 161, 0.1);
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
     Data Section
     ================================================== */
	.data-section {
		margin-bottom: 3rem;
	}

	.data-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1.5rem;
	}

	.data-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.data-card {
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 1.25rem;
	}

	.data-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem;
	}

	.data-card pre {
		margin: 0;
		background: #f9fafb;
		border-radius: 6px;
		padding: 1rem;
		overflow-x: auto;
	}

	.data-card code {
		font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
		font-size: 0.75rem;
		line-height: 1.5;
		color: #374151;
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
     Dependencies Section
     ================================================== */
	.deps-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 1rem;
	}

	.deps-info {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.deps-info p {
		margin: 0 0 1rem;
		color: #374151;
	}

	.deps-info pre {
		background: #1a1a1a;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		margin: 0 0 1rem;
	}

	.deps-info code {
		color: #10b981;
		font-family: 'Fira Code', monospace;
		font-size: 0.875rem;
	}

	.deps-note {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	/* ==================================================
     Responsive
     ================================================== */
	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.data-cards {
			grid-template-columns: 1fr;
		}

		.code-tabs {
			flex-wrap: wrap;
		}

		.dataset-toggle {
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
