<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import TokenSwatchGrid from '$lib/components/TokenSwatchGrid.svelte';
	import type { TokenSwatch } from '$lib/components/TokenSwatchGrid.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/tokenswatchgrid')!;

	const tokens: TokenSwatch[] = [
		{ name: '--surface', value: '#ffffff', group: 'chrome', usage: 'Primary app panels' },
		{ name: '--surface-2', value: '#f8fafc', group: 'chrome', usage: 'Inset surfaces' },
		{ name: '--brand-primary', value: '#0f766e', group: 'brand', usage: 'Primary actions', foreground: '#ffffff' },
		{ name: '--brand-accent', value: '#be123c', group: 'brand', usage: 'Visual QA accents', foreground: '#ffffff' },
		{ name: '--status-pass', value: '#dcfce7', group: 'semantic', usage: 'Passing gates' },
		{ name: '--status-review', value: '#fef3c7', group: 'semantic', usage: 'Needs review' }
	];

const usageSnippet = `<script lang="ts">
  import TokenSwatchGrid from '$lib/components/TokenSwatchGrid.svelte';
</${'script'}>

<TokenSwatchGrid {tokens} />`;
</script>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Theme', 'Tokens', 'QA']}
	codeExplanation="TokenSwatchGrid groups tokens by purpose and calculates simple contrast labels for hex values. It is a lightweight review surface for design-system inventory before full theme inspection."
>
	{#snippet demo()}
		<TokenSwatchGrid {tokens} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
			<tbody>
				<tr><td><code>tokens</code></td><td><code>TokenSwatch[]</code></td><td>Token rows with group, value, and usage.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Grid heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
