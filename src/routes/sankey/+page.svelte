<!--
	============================================================
	Sankey Demo Page (TFE shell)
	============================================================

	Migrated to ComponentPageShell. Server-loaded data is
	preserved via +page.server.ts.
-->

<script lang="ts">
	import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/sankey')!;

	let { data } = $props();

	const usageSnippet = `<script>
  import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
<\/script>

<ExpandableSankey
  nodes={data.sankeyData.nodes}
  links={data.sankeyData.links}
  height={600}
/>`;

	const codeExplanation =
		'ExpandableSankey wraps Unovis to render a Sankey diagram with click-to-expand nodes. The createSankeyData() helper tracks expanded state and recursively collapses children. Aggregate links collapse to summary flows when a node is closed; detailed child links appear when it is expanded. Unovis owns the SVG layer and tooltips.';
</script>

<svelte:head>
	<title>Sankey — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive expandable Sankey flow visualisation built on Unovis. Click nodes to drill down."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Unovis', 'Sankey', 'Hierarchical', 'Theme-aware']}
>
	{#snippet demo()}
		<div class="sankey-demo">
			<p class="sankey-demo__hint">
				Click <strong>Coal</strong> or <strong>Natural Gas</strong> to expand into power plants.
				<strong>Solar</strong> has no children. Database status: <code>{data.usingDatabase ? 'connected' : 'fallback data'}</code>.
			</p>
			<div class="sankey-demo__scroll">
				<ExpandableSankey nodes={data.sankeyData.nodes} links={data.sankeyData.links} height={600} />
			</div>
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
					<td><code>nodes</code></td>
					<td><code>SankeyNode[]</code></td>
					<td>required</td>
					<td>All nodes including hidden children. Top-level nodes have no <code>parent</code>.</td>
				</tr>
				<tr>
					<td><code>links</code></td>
					<td><code>SankeyLink[]</code></td>
					<td>required</td>
					<td>All flows. Aggregate links show when collapsed; detail links show when expanded.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>600</code></td>
					<td>Container height in pixels.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sankey-demo {
		display: grid;
		gap: 16px;
	}
	.sankey-demo__hint {
		margin: 0;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sankey-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.sankey-demo__scroll {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
</style>
