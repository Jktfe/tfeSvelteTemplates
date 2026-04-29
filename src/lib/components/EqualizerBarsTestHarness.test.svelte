<script lang="ts">
	import EqualizerBars from './EqualizerBars.svelte';
	import type { EqualizerBarsVariant } from './EqualizerBars.svelte';

	type Props = {
		bars?: number;
		variant?: EqualizerBarsVariant;
		speed?: number;
		color?: string;
		active?: boolean;
		height?: number;
		seed?: number;
		ariaLabel?: string;
		class?: string;
	};

	let {
		bars = 12,
		variant = 'equalizer',
		speed = 1,
		color = 'auto',
		active = true,
		height = 48,
		seed = 1,
		ariaLabel = 'Audio visualisation',
		class: extraClass = ''
	}: Props = $props();
</script>

<div data-testid="surface">
	<EqualizerBars
		{bars}
		{variant}
		{speed}
		{color}
		{active}
		{height}
		{seed}
		{ariaLabel}
		class={extraClass}
	/>
</div>
