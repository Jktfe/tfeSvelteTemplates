<!--
	Test wrapper for MorphingDialog
	Provides snippet-based trigger and children for unit testing
-->
<script lang="ts">
	import MorphingDialog from './MorphingDialog.svelte';
</script>

<MorphingDialog duration={0}>
	{#snippet trigger(props)}
		<button {...props}>Open Dialog</button>
	{/snippet}

	<p>Dialog Content Here</p>
</MorphingDialog>
