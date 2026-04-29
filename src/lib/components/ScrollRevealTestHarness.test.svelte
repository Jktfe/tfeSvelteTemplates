<!--
  Internal test harness — exists only so ScrollReveal.test.ts can mount
  a ScrollReveal with three real children and assert that the wrapper's
  onMount path correctly tags them with data-sr-index, --sr-delay,
  --sr-tx-hidden, and --sr-tx-revealed. Not exported, not shipped.
  The .test.svelte suffix keeps it co-located with the test file
  while excluding it from the production bundle.
-->
<script lang="ts">
	import ScrollReveal, { type Direction } from './ScrollReveal.svelte';

	interface Props {
		stagger?: number;
		direction?: Direction;
		distance?: number;
		duration?: number;
		intensity?: number;
		threshold?: number;
		replay?: boolean;
	}

	let {
		stagger = 80,
		direction = 'up',
		distance = 32,
		duration = 700,
		intensity = 1,
		threshold = 0.15,
		replay = false
	}: Props = $props();
</script>

<ScrollReveal
	{stagger}
	{direction}
	{distance}
	{duration}
	{intensity}
	{threshold}
	{replay}
>
	<div data-testid="child-0" class="child">A</div>
	<div data-testid="child-1" class="child">B</div>
	<div data-testid="child-2" class="child">C</div>
</ScrollReveal>
