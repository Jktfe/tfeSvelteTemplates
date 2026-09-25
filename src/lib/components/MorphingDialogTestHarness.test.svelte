<!--
	Test wrapper for MorphingDialog
	Provides snippet-based trigger and children for unit testing, plus an
	external toggle so tests can drive `bind:open` from the parent side.
-->
<script lang="ts">
	import MorphingDialog from './MorphingDialog.svelte';

	interface Props {
		open?: boolean;
		ariaLabel?: string;
		ariaLabelledBy?: string;
		closeOnEscape?: boolean;
		withHeading?: boolean;
	}

	let {
		open = $bindable(false),
		ariaLabel,
		ariaLabelledBy,
		closeOnEscape = true,
		withHeading = false
	}: Props = $props();
</script>

<button type="button" data-testid="external-toggle" onclick={() => (open = !open)}>
	External toggle
</button>

<MorphingDialog duration={0} bind:open {ariaLabel} {ariaLabelledBy} {closeOnEscape}>
	{#snippet trigger(props)}
		<button {...props}>Open Dialog</button>
	{/snippet}

	{#if withHeading}
		<h2 id="morph-test-heading">Named by heading</h2>
	{/if}
	<p>Dialog Content Here</p>
	<input data-testid="dialog-input" type="text" aria-label="Dialog field" />
	<button type="button" disabled>Disabled action</button>
</MorphingDialog>
