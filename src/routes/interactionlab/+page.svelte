<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import InteractionLab from '$lib/components/InteractionLab.svelte';
	import type { InteractionScenario } from '$lib/components/InteractionLab.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/interactionlab')!;

	const scenarios: InteractionScenario[] = [
		{ id: 'hover', label: 'Catalogue card hover lift', mode: 'hover', durationMs: 180, easing: 'ease-out', risk: 'low' },
		{ id: 'press', label: 'Toolbar press compression', mode: 'press', durationMs: 120, easing: 'ease-out', risk: 'low' },
		{ id: 'drag', label: 'Sortable card drag', mode: 'drag', durationMs: 320, easing: 'cubic-bezier(.2,.8,.2,1)', risk: 'high' },
		{ id: 'keyboard', label: 'Keyboard focus zoom', mode: 'keyboard', durationMs: 220, easing: 'ease-out', risk: 'medium' }
	];

const usageSnippet = `<script lang="ts">
  import InteractionLab from '$lib/components/InteractionLab.svelte';
</${'script'}>

<InteractionLab {scenarios} />`;
</script>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Motion', 'QA', 'Accessibility']}
	codeExplanation="InteractionLab treats motion as a reviewable contract: mode, duration, easing, risk, and reduced-motion readiness are visible before a motion pattern gets copied into production."
>
	{#snippet demo()}
		<InteractionLab {scenarios} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
			<tbody>
				<tr><td><code>scenarios</code></td><td><code>InteractionScenario[]</code></td><td>Motion scenarios with timing and risk metadata.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Lab heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
