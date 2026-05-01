<!--
	============================================================
	RadialCluster Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import RadialCluster from '$lib/components/RadialCluster.svelte';
	import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
	import type { RadialClusterNode } from '$lib/types';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/radialcluster')!;

	const simpleData: RadialClusterNode = {
		name: 'root',
		children: [
			{
				name: 'Category A',
				children: [{ name: 'Item A1' }, { name: 'Item A2' }, { name: 'Item A3' }]
			},
			{
				name: 'Category B',
				children: [
					{ name: 'Item B1' },
					{ name: 'Item B2' },
					{ name: 'Subcategory B3', children: [{ name: 'Item B3a' }, { name: 'Item B3b' }] }
				]
			},
			{
				name: 'Category C',
				children: [{ name: 'Item C1' }, { name: 'Item C2' }]
			}
		]
	};

	const colorSchemes = {
		default: { parent: '#555', leaf: '#999', link: '#555', name: 'Default Gray' },
		blue: { parent: '#1e40af', leaf: '#60a5fa', link: '#3b82f6', name: 'Ocean Blue' },
		green: { parent: '#166534', leaf: '#4ade80', link: '#22c55e', name: 'Forest Green' },
		purple: { parent: '#6b21a8', leaf: '#c084fc', link: '#a855f7', name: 'Royal Purple' },
		warm: { parent: '#9a3412', leaf: '#fb923c', link: '#ea580c', name: 'Warm Orange' }
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');
	let showLabels = $state(true);
	let rotateLabels = $state(true);

	const usageSnippet = `<script>
  import RadialCluster from '$lib/components/RadialCluster.svelte';
  import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
</${'script'}>

<RadialCluster
  data={FALLBACK_RADIAL_CLUSTER_DATA}
  width={900}
  height={900}
/>`;

	const codeExplanation =
		'RadialCluster lays out hierarchical data in a circular dendrogram. The cluster algorithm places leaf nodes at equal radius from the centre; internal nodes sit at the angular mean of their descendants. Cubic Bézier curves connect parents to children along radial paths. Labels can rotate to follow each leaf node’s angle so they read cleanly around the circle.';
</script>

<svelte:head>
	<title>RadialCluster — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Native Svelte 5 radial cluster (circular dendrogram) for hierarchical data. Zero charting dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'SVG', 'Zero deps', 'Hierarchy']}
>
	{#snippet demo()}
		<div class="rc-demo">
			<section class="rc-demo__block">
				<h3>Full flare dataset</h3>
				<div class="rc-demo__stage">
					<RadialCluster data={FALLBACK_RADIAL_CLUSTER_DATA} width={900} height={900} />
				</div>
			</section>

			<section class="rc-demo__block">
				<h3>Simple structure</h3>
				<div class="rc-demo__stage">
					<RadialCluster data={simpleData} width={600} height={600} fontSize={12} nodeRadius={4} />
				</div>
			</section>

			<section class="rc-demo__block">
				<h3>Colour schemes</h3>
				<div class="rc-demo__chips">
					{#each Object.entries(colorSchemes) as [key, scheme] (key)}
						<button
							type="button"
							class="rc-chip"
							class:rc-chip--active={selectedScheme === key}
							onclick={() => (selectedScheme = key as keyof typeof colorSchemes)}
						>
							{scheme.name}
						</button>
					{/each}
				</div>
				<div class="rc-demo__stage">
					<RadialCluster
						data={simpleData}
						width={500}
						height={500}
						nodeColorParent={colorSchemes[selectedScheme].parent}
						nodeColorLeaf={colorSchemes[selectedScheme].leaf}
						linkColor={colorSchemes[selectedScheme].link}
					/>
				</div>
			</section>

			<section class="rc-demo__block">
				<h3>Label configuration</h3>
				<div class="rc-demo__toggles">
					<label class="rc-toggle">
						<input type="checkbox" bind:checked={showLabels} />
						<span>Show labels</span>
					</label>
					<label class="rc-toggle">
						<input type="checkbox" bind:checked={rotateLabels} disabled={!showLabels} />
						<span>Rotate labels</span>
					</label>
				</div>
				<div class="rc-demo__stage">
					<RadialCluster data={simpleData} width={500} height={500} {showLabels} {rotateLabels} />
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
					<td><code>RadialClusterNode</code></td>
					<td>required</td>
					<td>Hierarchical data with <code>name</code> and optional <code>children</code>.</td>
				</tr>
				<tr>
					<td><code>width</code> / <code>height</code></td>
					<td><code>number</code></td>
					<td><code>800</code></td>
					<td>Container size in pixels.</td>
				</tr>
				<tr>
					<td><code>innerRadius</code> / <code>outerRadius</code></td>
					<td><code>number</code></td>
					<td><code>100</code> / auto</td>
					<td>Where the root sits and where the leaves end.</td>
				</tr>
				<tr>
					<td><code>nodeRadius</code></td>
					<td><code>number</code></td>
					<td><code>2.5</code></td>
					<td>Radius of node circles.</td>
				</tr>
				<tr>
					<td><code>nodeColorParent</code> / <code>nodeColorLeaf</code></td>
					<td><code>string</code></td>
					<td><code>'#555'</code> / <code>'#999'</code></td>
					<td>Hex colours for internal vs leaf nodes.</td>
				</tr>
				<tr>
					<td><code>linkColor</code> / <code>linkOpacity</code> / <code>linkWidth</code></td>
					<td><code>string</code> / <code>number</code> / <code>number</code></td>
					<td><code>'#555'</code> / <code>0.4</code> / <code>1.5</code></td>
					<td>Connecting curve appearance.</td>
				</tr>
				<tr>
					<td><code>showLabels</code> / <code>rotateLabels</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle text labels and radial rotation.</td>
				</tr>
				<tr>
					<td><code>fontSize</code> / <code>fontFamily</code> / <code>labelColor</code></td>
					<td><code>number</code> / <code>string</code> / <code>string</code></td>
					<td>system defaults</td>
					<td>Label typography.</td>
				</tr>
				<tr>
					<td><code>separation</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Multiplier for sibling spacing.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rc-demo {
		display: grid;
		gap: 24px;
	}
	.rc-demo__block {
		display: grid;
		gap: 12px;
	}
	.rc-demo__block h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1);
	}
	.rc-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		display: flex;
		justify-content: center;
		overflow: auto;
	}
	.rc-demo__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.rc-chip {
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
	.rc-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.rc-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.rc-demo__toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.rc-toggle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--fg-2);
	}
</style>
