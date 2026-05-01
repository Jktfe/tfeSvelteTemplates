<!--
	============================================================
	Sunburst Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import Sunburst from '$lib/components/Sunburst.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';
	import type { SunburstNode } from '$lib/types';

	const shell = catalogShellPropsForSlug('/sunburst')!;

	let { data }: { data: PageData } = $props();

	let activeExample = $state<'filesystem' | 'sales'>('filesystem');
	let lastClicked = $state<string | null>(null);

	const colorSchemes = {
		default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
		ocean: ['#0ea5e9', '#22d3ee', '#2dd4bf', '#34d399', '#4ade80', '#86efac'],
		sunset: ['#f97316', '#fb923c', '#facc15', '#ef4444', '#f43f5e', '#ec4899'],
		monochrome: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db']
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');

	function handleNodeClick(node: SunburstNode) {
		lastClicked = `${node.name} (value: ${node.value ?? 'folder'})`;
	}

	function customTooltip(node: SunburstNode): string {
		const value = node.value;
		if (value !== undefined) {
			return `${node.name}\n${value.toLocaleString()} items`;
		}
		return node.name;
	}

	const usageSnippet = `<script>
  import Sunburst from '$lib/components/Sunburst.svelte';

  const data = {
    id: 'root',
    name: 'Website',
    children: [
      { id: 'src', name: 'src', color: '#3b82f6', children: [
        { id: 'components', name: 'components', value: 120 },
        { id: 'routes', name: 'routes', value: 85 }
      ]}
    ]
  };
<\/script>

<Sunburst
  {data}
  width={500}
  height={500}
  onNodeClick={(node) => console.log('Clicked:', node.name)}
/>`;

	const codeExplanation =
		'Sunburst computes a partition layout natively (no D3) and renders concentric SVG arcs. Click a segment to zoom in; click the centre circle to zoom back out. Colours cascade from each top-level branch to its descendants, and CSS transitions handle the zoom animation. Keyboard navigation (Tab + Enter/Space, Escape to zoom out) and ARIA labels are baked in.';
</script>

<svelte:head>
	<title>Sunburst — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Zoomable hierarchical sunburst chart with custom colour schemes. Pure Svelte 5, zero charting dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'SVG', 'Zero deps', 'Hierarchy', 'A11y']}
>
	{#snippet demo()}
		<div class="sb-demo">
			<section class="sb-demo__block">
				<h3>Drill-down examples</h3>
				<div class="sb-demo__chips">
					<button
						type="button"
						class="sb-chip"
						class:sb-chip--active={activeExample === 'filesystem'}
						onclick={() => (activeExample = 'filesystem')}
					>
						File system
					</button>
					<button
						type="button"
						class="sb-chip"
						class:sb-chip--active={activeExample === 'sales'}
						onclick={() => (activeExample = 'sales')}
					>
						Sales data
					</button>
				</div>
				<div class="sb-demo__stage">
					{#if activeExample === 'filesystem'}
						<Sunburst
							data={data.fileSystemData}
							width={500}
							height={500}
							onNodeClick={handleNodeClick}
							tooltipFormatter={customTooltip}
						/>
					{:else}
						<Sunburst
							data={data.salesData}
							width={500}
							height={500}
							onNodeClick={handleNodeClick}
						/>
					{/if}
				</div>
				{#if lastClicked}
					<p class="sb-demo__status"><strong>Last clicked:</strong> {lastClicked}</p>
				{/if}
			</section>

			<section class="sb-demo__block">
				<h3>Colour schemes</h3>
				<div class="sb-demo__chips">
					{#each Object.keys(colorSchemes) as scheme (scheme)}
						<button
							type="button"
							class="sb-chip"
							class:sb-chip--active={selectedScheme === scheme}
							onclick={() => (selectedScheme = scheme as keyof typeof colorSchemes)}
						>
							{scheme}
						</button>
					{/each}
				</div>
				<div class="sb-demo__stage">
					<Sunburst
						data={data.fileSystemData}
						width={450}
						height={450}
						colorScheme={colorSchemes[selectedScheme]}
					/>
				</div>
			</section>

			<section class="sb-demo__block">
				<h3>Compact, no labels</h3>
				<div class="sb-demo__stage sb-demo__stage--row">
					<div class="sb-compact">
						<Sunburst
							data={data.fileSystemData}
							width={250}
							height={250}
							showLabels={false}
							animationDuration={300}
						/>
						<span class="sb-compact__label">File system</span>
					</div>
					<div class="sb-compact">
						<Sunburst
							data={data.salesData}
							width={250}
							height={250}
							showLabels={false}
							animationDuration={300}
						/>
						<span class="sb-compact__label">Sales data</span>
					</div>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>data</code></td>
					<td><code>SunburstNode</code></td>
					<td>required</td>
					<td>Root of the hierarchy. Leaves need a numeric <code>value</code>.</td>
				</tr>
				<tr>
					<td><code>width</code> / <code>height</code></td>
					<td><code>number</code></td>
					<td><code>500</code></td>
					<td>Pixel dimensions of the SVG.</td>
				</tr>
				<tr>
					<td><code>colorScheme</code></td>
					<td><code>string[]</code></td>
					<td>categorical</td>
					<td>Hex palette assigned to top-level branches; descendants inherit.</td>
				</tr>
				<tr>
					<td><code>showLabels</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Render text labels in segments above <code>labelMinAngle</code>.</td>
				</tr>
				<tr>
					<td><code>labelMinAngle</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Minimum arc angle (degrees) before a label is drawn.</td>
				</tr>
				<tr>
					<td><code>animationDuration</code></td>
					<td><code>number</code></td>
					<td><code>750</code></td>
					<td>Zoom transition duration in milliseconds.</td>
				</tr>
				<tr>
					<td><code>onNodeClick</code></td>
					<td><code>(node) =&gt; void</code></td>
					<td>—</td>
					<td>Fires on segment click before the zoom animation.</td>
				</tr>
				<tr>
					<td><code>tooltipFormatter</code></td>
					<td><code>(node) =&gt; string</code></td>
					<td>—</td>
					<td>Custom tooltip body. Receives the hovered node.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sb-demo {
		display: grid;
		gap: 24px;
	}
	.sb-demo__block {
		display: grid;
		gap: 12px;
	}
	.sb-demo__block h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1);
	}
	.sb-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		display: flex;
		justify-content: center;
	}
	.sb-demo__stage--row {
		gap: 32px;
		flex-wrap: wrap;
	}
	.sb-demo__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.sb-chip {
		padding: 6px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--r-pill);
		background: var(--surface);
		color: var(--fg-2);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all var(--dur-fast);
	}
	.sb-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.sb-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.sb-demo__status {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.sb-compact {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.sb-compact__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}

	@media (max-width: 640px) {
		.sb-demo__stage--row {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
