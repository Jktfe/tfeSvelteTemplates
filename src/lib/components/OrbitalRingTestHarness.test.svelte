<!--
	Test fixture for OrbitalRing — wraps the component with predictable
	test items so render assertions can target stable selectors.

	autoSpin defaults to false here so render tests don't kick off rAF.
	The helper tests in OrbitalRing.test.ts exercise distribution and
	transform maths directly through the module-script exports.
-->
<script lang="ts">
	import OrbitalRing from './OrbitalRing.svelte';

	type Props = {
		items?: { id: number; label: string }[];
		radius?: number;
		autoSpin?: boolean;
		spinDurationMs?: number;
		direction?: 'clockwise' | 'counter-clockwise' | string;
		pauseOnHover?: boolean;
		counterRotateItems?: boolean;
		itemSize?: number;
		startAngleDeg?: number;
	};

	let {
		items = [
			{ id: 1, label: 'one' },
			{ id: 2, label: 'two' },
			{ id: 3, label: 'three' },
			{ id: 4, label: 'four' }
		],
		radius = 100,
		autoSpin = false,
		spinDurationMs = 20000,
		direction = 'clockwise',
		pauseOnHover = true,
		counterRotateItems = true,
		itemSize = 60,
		startAngleDeg = 0
	}: Props = $props();
</script>

<OrbitalRing
	{items}
	{radius}
	{autoSpin}
	{spinDurationMs}
	{direction}
	{pauseOnHover}
	{counterRotateItems}
	{itemSize}
	{startAngleDeg}
>
	{#snippet item(data, i)}
		<div data-testid="orbital-item-{i}" data-label={data.label}>{data.label}</div>
	{/snippet}
</OrbitalRing>
