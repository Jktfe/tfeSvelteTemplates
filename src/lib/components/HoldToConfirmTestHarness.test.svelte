<script lang="ts">
	import HoldToConfirm from './HoldToConfirm.svelte';
	import type { HoldToConfirmVariant } from './HoldToConfirm.svelte';

	type Props = {
		duration?: number;
		label?: string;
		variant?: HoldToConfirmVariant;
		onConfirm?: () => void;
		onCancel?: () => void;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
	};

	let {
		duration = 1500,
		label = 'Hold to confirm',
		variant = 'ring',
		onConfirm,
		onCancel,
		disabled = false,
		ariaLabel,
		class: extraClass = ''
	}: Props = $props();
</script>

<div data-testid="surface">
	<HoldToConfirm
		{duration}
		{label}
		{variant}
		{onConfirm}
		{onCancel}
		{disabled}
		{ariaLabel}
		class={extraClass}
	/>
</div>
