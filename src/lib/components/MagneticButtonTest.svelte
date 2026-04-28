<!--
	Test wrapper for MagneticButton.
	MagneticButton takes a Snippet via children — Svelte 5 snippets can't be passed
	from a plain Vitest render call, so we wrap the component here with an inline
	snippet so the test file can render this wrapper instead.
-->
<script lang="ts">
	import MagneticButton from './MagneticButton.svelte';

	interface Props {
		strength?: number;
		radius?: number;
		damping?: number;
	}

	let { strength = 0.3, radius = 100, damping = 0.1 }: Props = $props();
</script>

<MagneticButton {strength} {radius} {damping}>
	<button type="button" data-testid="magnetic-target">Click me</button>
</MagneticButton>
