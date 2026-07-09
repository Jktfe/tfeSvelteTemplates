<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import ComponentHealthMatrix, {
		createHealthRows,
		normalisePath,
		type ComponentHealthEntry,
		type ComponentHealthFiles
	} from '$lib/components/ComponentHealthMatrix.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug, componentCatalogEntries } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/componenthealthmatrix')!;

	const sourceFiles = import.meta.glob('/src/lib/components/**/*.svelte', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const docsFiles = import.meta.glob('/src/lib/components/**/*.md', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const demoFiles = import.meta.glob('/src/routes/**/+page.svelte', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const screenshotFiles = import.meta.glob('/static/ComponentScreenshots/*', {
		eager: true,
		query: '?url',
		import: 'default'
	});

	function pathSet(modules: Record<string, unknown>): Set<string> {
		return new SvelteSet(Object.keys(modules).map(normalisePath));
	}

	function declaredTestPathSet(): Set<string> {
		const tests = new SvelteSet<string>();
		for (const { item } of componentCatalogEntries) {
			for (const path of item.relatedFiles) {
				if (/\.(test\.ts|test\.svelte)$/.test(path)) tests.add(normalisePath(path));
			}
		}
		return tests;
	}

	const availableFiles: ComponentHealthFiles = {
		source: pathSet(sourceFiles),
		docs: pathSet(docsFiles),
		demo: pathSet(demoFiles),
		screenshot: pathSet(screenshotFiles),
		test: declaredTestPathSet()
	};

	const entries: ComponentHealthEntry[] = componentCatalogEntries.map(({ category, item }) => ({
		name: item.name,
		href: item.href,
		category: category.name,
		source: item.source,
		docs: item.docs,
		demo: item.demo,
		screenshot: item.screenshot,
		themeSupport: item.themeSupport,
		dependencies: item.dependencies,
		relatedFiles: item.relatedFiles
	}));

	const rows = createHealthRows(entries, availableFiles);

	const usageSnippet = `<script lang="ts">
  import ComponentHealthMatrix, { createHealthRows } from '$lib/components/ComponentHealthMatrix.svelte';

  const rows = createHealthRows(entries, availableFiles);
</${'script'}>

<ComponentHealthMatrix {rows} />`;
</script>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Catalogue QA', 'Dashboard', 'Metadata']}
	codeExplanation="ComponentHealthMatrix reads the same registry that powers the homepage and component shell. The route supplies browser-safe file availability through Vite glob sets and declared test metadata, then the component renders a searchable QA table without duplicating catalogue data."
>
	{#snippet demo()}
		<ComponentHealthMatrix {rows} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Export</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>createHealthRows</code></td>
					<td><code>(entries, files) =&gt; ComponentHealthRow[]</code></td>
					<td>Compares catalogue metadata with available file sets.</td>
				</tr>
				<tr>
					<td><code>ComponentHealthMatrix</code></td>
					<td><code>Svelte component</code></td>
					<td>Renders summary counts, filters, and a component health table.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
