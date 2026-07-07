<script lang="ts">
	import Popover, { type PopoverPlacement } from './Popover.svelte';

	type Props = {
		open?: boolean;
		placement?: PopoverPlacement;
		offset?: number;
		ariaLabel?: string;
		class?: string;
	};

	let {
		open = $bindable(false),
		placement = 'bottom',
		offset = 8,
		ariaLabel = 'Popover',
		class: extraClass = ''
	}: Props = $props();
</script>

<div data-testid="surface">
	<Popover bind:open {placement} {offset} {ariaLabel} class={extraClass}>
		{#snippet trigger(props)}
			<button {...props} data-testid="popover-trigger">Toggle</button>
		{/snippet}
		<div data-testid="popover-content">
			<button data-testid="inner-button">Action</button>
		</div>
	</Popover>
</div>

<!-- An element outside the popover so click-outside can target it. -->
<button data-testid="outside">Outside</button>
