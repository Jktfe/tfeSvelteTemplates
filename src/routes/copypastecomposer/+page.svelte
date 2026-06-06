<script lang="ts">
	import CopyPasteComposer, {
		type CopyPasteCatalogEntry
	} from '$lib/components/CopyPasteComposer.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { getDocsHtmlForPath } from '$lib/componentDocs';
	import { catalogShellPropsForSlug, componentCatalogEntries } from '$lib/componentCatalog';

	const catalogShell = catalogShellPropsForSlug('/copypastecomposer');
	const fallbackShellProps = {
		name: 'CopyPasteComposer',
		category: 'Catalogue QA',
		description:
			'Build a copy-paste install bundle from catalogue source, docs, demos, tests, dependencies, related files, and usage snippets.',
		source: 'src/lib/components/CopyPasteComposer.svelte',
		demoPath: 'src/routes/copypastecomposer/+page.svelte',
		dependencies: ['Svelte 5+', 'Zero external dependencies'],
		usageSnippet: `<script lang="ts">
  import CopyPasteComposer from '$lib/components/CopyPasteComposer.svelte';

  const entries = componentCatalogEntries.map(({ category, item }) => ({
    name: item.name,
    href: item.href,
    category: category.name,
    description: item.description,
    source: item.source,
    docs: item.docs,
    demo: item.demo,
    dependencies: item.dependencies,
    relatedFiles: item.relatedFiles,
    usage: item.usage
  }));
</${'script'}>

<CopyPasteComposer {entries} />`,
		agentSteps: [
			'Pass catalogue-shaped rows into CopyPasteComposer.',
			'Use deriveSelectedFiles or deriveInstallCommands when you need a non-visual handoff.'
		],
		install: 'cp src/lib/components/CopyPasteComposer.svelte ./src/lib/components/',
		resources: [
			{
				label: 'Source - CopyPasteComposer.svelte',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/CopyPasteComposer.svelte'
			},
			{
				label: 'Tests - CopyPasteComposer.test.ts',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/CopyPasteComposer.test.ts'
			},
			{
				label: 'Docs - CopyPasteComposer.md',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/CopyPasteComposer.md'
			}
		],
		codeFileName: 'CopyPasteComposer.svelte',
		docsHtml: getDocsHtmlForPath('src/lib/components/CopyPasteComposer.md')
	};

	const shellProps = catalogShell?.props ?? fallbackShellProps;

	const entries: CopyPasteCatalogEntry[] = componentCatalogEntries.map(({ category, item }) => ({
		name: item.name,
		href: item.href,
		category: category.name,
		description: item.description,
		source: item.source,
		docs: item.docs,
		demo: item.demo,
		dependencies: item.dependencies,
		relatedFiles: item.relatedFiles,
		usage: item.usage
	}));
</script>

<svelte:head>
	<title>{shellProps.name} - TFE / Svelte Templates</title>
	<meta name="description" content={shellProps.description} />
</svelte:head>

<ComponentPageShell
	{...shellProps}
	tags={['Svelte 5', 'Catalogue', 'Install handoff', 'Agent workflow']}
	codeExplanation="CopyPasteComposer keeps catalogue transformation logic in module exports, then renders the same derived file list, command block, usage snippet, and checklist in the interactive view."
>
	{#snippet demo()}
		<CopyPasteComposer {entries} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Export</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>deriveSelectedFiles</code></td>
					<td><code>(entry, options) =&gt; CopyPasteSelectedFile[]</code></td>
					<td>Builds the ordered source/docs/demo/tests/related file bundle.</td>
				</tr>
				<tr>
					<td><code>deriveInstallCommands</code></td>
					<td><code>(entry, options) =&gt; string[]</code></td>
					<td>Builds dependency, directory, and copy commands for the selected bundle.</td>
				</tr>
				<tr>
					<td><code>CopyPasteComposer</code></td>
					<td><code>Svelte component</code></td>
					<td>Renders selector controls, command block, selected files, checklist, and usage.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
