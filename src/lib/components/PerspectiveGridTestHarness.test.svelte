<script lang="ts">
	import PerspectiveGrid from './PerspectiveGrid.svelte';
	import type {
		PerspectiveGridIntensity,
		PerspectiveGridMode
	} from './PerspectiveGrid.svelte';

	type Props = {
		intensity?: PerspectiveGridIntensity;
		mode?: PerspectiveGridMode;
		ceiling?: boolean;
		animated?: boolean;
		opacity?: number;
		class?: string;
	};

	let {
		intensity = 'standard',
		mode = 'mono',
		ceiling = false,
		animated = true,
		opacity = 1,
		class: extraClass = ''
	}: Props = $props();
</script>

<div data-testid="surface">
	<PerspectiveGrid
		{intensity}
		{mode}
		{ceiling}
		{animated}
		{opacity}
		class={extraClass}
	>
		<button data-testid="inner-button" type="button">slot child</button>
	</PerspectiveGrid>
</div>
