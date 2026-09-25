<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import RoutePreviewRail from '$lib/components/RoutePreviewRail.svelte';
	import type { RoutePreviewItem } from '$lib/components/RoutePreviewRail.svelte';
	import { catalogShellPropsForSlug, componentCatalogEntries } from '$lib/componentCatalog';
	import { screenshotFiles } from 'virtual:file-manifest';

	const shell = catalogShellPropsForSlug('/routepreviewrail')!;
	// The manifest lists paths only, so screenshots are never pulled into the bundle.
	const availableScreenshots = new Set(
		screenshotFiles.map((path) => path.replace('/static', ''))
	);

	const operationPreviews: RoutePreviewItem[] = componentCatalogEntries
		.filter(({ category }) => category.name === 'Library Operations')
		.map(({ category, item }) => ({
			name: item.name,
			href: item.href,
			screenshot: item.screenshot,
			description: item.description,
			category: category.name,
			status: availableScreenshots.has(item.screenshot) ? 'ready' : 'missing'
		}));

const usageSnippet = `<script lang="ts">
  import RoutePreviewRail from '$lib/components/RoutePreviewRail.svelte';
</${'script'}>

<RoutePreviewRail
  items={[
    {
      name: 'EvidenceCard',
      href: '/evidencecard',
      screenshot: '/ComponentScreenshots/EvidenceCardShot.webp',
      description: 'Compact delivery proof card.',
      status: 'ready'
    }
  ]}
/>`;
</script>

<svelte:head>
	<title>{shell.item.name} - TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Visual QA', 'Routes', 'Screenshots']}
	codeExplanation="RoutePreviewRail is intentionally metadata-driven. The route converts catalogue entries into preview items and marks screenshots as ready or missing using a build-time file manifest, while the component itself only handles filtering and presentation."
>
	{#snippet demo()}
		<RoutePreviewRail
			items={operationPreviews}
			title="Library Operations live pitches"
			subtitle="Every operations component should have a route, docs, tests, and screenshot proof before the morning sweep."
		/>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>items</code></td><td><code>RoutePreviewItem[]</code></td><td>Preview route cards with screenshot and status.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Rail heading.</td></tr>
				<tr><td><code>subtitle</code></td><td><code>string</code></td><td>Context text below the heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
