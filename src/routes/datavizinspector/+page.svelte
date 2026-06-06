<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DataVizInspector from '$lib/components/DataVizInspector.svelte';
	import type { DataVizSpec } from '$lib/components/DataVizInspector.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/datavizinspector')!;

	const specs: DataVizSpec[] = [
		{
			title: 'Catalogue readiness trend',
			chartType: 'line',
			rowCount: 12,
			hasSource: true,
			hasAltText: true,
			hasUnits: true,
			hasColorLegend: true
		},
		{
			title: 'Route proof coverage',
			chartType: 'bar',
			rowCount: 8,
			hasSource: true,
			hasAltText: true,
			hasUnits: true,
			hasColorLegend: false
		},
		{
			title: 'Unreviewed sketch',
			chartType: 'scatter',
			rowCount: 0,
			hasSource: false,
			hasAltText: false,
			hasUnits: false,
			hasColorLegend: false
		}
	];

const usageSnippet = `<script lang="ts">
  import DataVizInspector from '$lib/components/DataVizInspector.svelte';
</${'script'}>

<DataVizInspector {specs} />`;
</script>

<svelte:head>
	<title>{shell.item.name} - TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Charts', 'QA', 'Accessibility']}
	codeExplanation="DataVizInspector scores chart specs before they ship. It keeps source, alt text, units, row count, and legend checks visible so charts do not look finished while missing reader-critical context."
>
	{#snippet demo()}
		<DataVizInspector {specs} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
			<tbody>
				<tr><td><code>specs</code></td><td><code>DataVizSpec[]</code></td><td>Chart specs to score.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Inspector heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
