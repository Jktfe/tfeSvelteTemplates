<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import ThemeTokenInspector from '$lib/components/ThemeTokenInspector.svelte';
	import { catalogShellPropsForSlug, type CatalogShellProps } from '$lib/componentCatalog';

	const fallbackProps: CatalogShellProps = {
		name: 'ThemeTokenInspector',
		category: 'Library Operations',
		description: 'Live inspector for the chrome / brand / semantic theming convention.',
		source: 'src/lib/components/ThemeTokenInspector.svelte',
		demoPath: 'src/routes/themetokeninspector/+page.svelte',
		dependencies: ['Svelte 5+', 'Zero external dependencies'],
		usageSnippet: `<script lang="ts">
  import ThemeTokenInspector from '$lib/components/ThemeTokenInspector.svelte';
</${'script'}>

<ThemeTokenInspector />`,
		agentSteps: [
			'Use this when reviewing whether a component token should flip in dark mode.',
			'Keep chrome tokens in the dark flip block; keep brand and semantic tokens stable unless explicitly opted in.',
			'Copy override snippets from the active taxonomy group and adapt the selector to the component root.'
		],
		install: 'cp src/lib/components/ThemeTokenInspector.svelte ./src/lib/components/',
		resources: [
			{
				label: 'Source - ThemeTokenInspector.svelte',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/ThemeTokenInspector.svelte'
			},
			{
				label: 'Docs - ThemeTokenInspector.md',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/ThemeTokenInspector.md'
			},
			{
				label: 'Convention - docs/THEMING.md',
				href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/docs/THEMING.md'
			}
		],
		codeFileName: 'ThemeTokenInspector.svelte'
	};

	const shell = catalogShellPropsForSlug('/themetokeninspector');
	const shellProps = shell?.props ?? fallbackProps;

	const usageSnippet = `<script lang="ts">
  import ThemeTokenInspector from '$lib/components/ThemeTokenInspector.svelte';
</${'script'}>

<ThemeTokenInspector initialMode="dark" />`;
</script>

<ComponentPageShell
	{...shellProps}
	{usageSnippet}
	tags={['Svelte 5', 'Theme tokens', 'Dark mode', 'CSS variables']}
	codeExplanation="ThemeTokenInspector keeps the theming convention executable: token rows are grouped by taxonomy, preview values are resolved per light or dark mode, and override snippets are generated from the selectors that beat Svelte-scoped component defaults."
>
	{#snippet demo()}
		<ThemeTokenInspector />
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Export</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>rows</code></td>
					<td><code>ThemeTokenRow[]</code></td>
					<td>Optional token metadata; defaults to the theming convention reference rows.</td>
				</tr>
				<tr>
					<td><code>initialMode</code></td>
					<td><code>"light" | "dark"</code></td>
					<td>Sets the first preview mode before the user toggles it.</td>
				</tr>
				<tr>
					<td><code>groupTokenRows</code></td>
					<td><code>(rows) =&gt; Record&lt;ThemeTokenKind, ThemeTokenRow[]&gt;</code></td>
					<td>Groups rows into chrome, brand, and semantic buckets.</td>
				</tr>
				<tr>
					<td><code>cssOverrideSnippet</code></td>
					<td><code>(rows, mode) =&gt; string</code></td>
					<td>Builds copy-ready CSS declarations grouped by override selector.</td>
				</tr>
				<tr>
					<td><code>contrastLabel</code></td>
					<td><code>(value, mode) =&gt; ContrastResult</code></td>
					<td>Returns the preview swatch readability cue.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
