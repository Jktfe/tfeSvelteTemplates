<!--
  Internal test harness — lets ComponentPageShell.test.ts pass real
  `demo` and `api` snippets into the shell, which a plain render() call
  can't do. The .test.svelte suffix keeps it out of the shipped bundle.
-->
<script lang="ts">
	import ComponentPageShell, { type ComponentPageShellProps } from './ComponentPageShell.svelte';

	interface Props extends Omit<ComponentPageShellProps, 'demo' | 'api'> {
		withDemo?: boolean;
		withApi?: boolean;
	}

	let { withDemo = true, withApi = true, ...shellProps }: Props = $props();
</script>

{#snippet demoSnippet()}
	<button type="button" data-testid="demo-button">Demo content</button>
{/snippet}

{#snippet apiSnippet()}
	<table data-testid="api-table">
		<tbody><tr><td>variant</td></tr></tbody>
	</table>
{/snippet}

<ComponentPageShell
	{...shellProps}
	demo={withDemo ? demoSnippet : undefined}
	api={withApi ? apiSnippet : undefined}
/>
