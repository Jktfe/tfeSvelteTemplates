<!--
  Internal test harness — exists only so Pendulum.test.ts can mount
  a Pendulum wrapper with a known child and assert on the rendered
  attributes, custom properties, and trigger-driven state.
  Not exported, not shipped. The .test.svelte suffix keeps it
  co-located with the test file while excluding it from the
  production bundle.
-->
<script lang="ts">
	import Pendulum, { type Trigger, type PivotOffset } from './Pendulum.svelte';

	interface Props {
		trigger?: Trigger;
		amplitude?: number;
		frequency?: number;
		decay?: number;
		pivotOffset?: PivotOffset;
		duration?: number;
		autoStartDelay?: number;
	}

	let {
		trigger = 'manual',
		amplitude = 18,
		frequency = 1.2,
		decay = 1.4,
		pivotOffset = { x: 0, y: -20 },
		duration = 4000,
		autoStartDelay = 0
	}: Props = $props();
</script>

<Pendulum {trigger} {amplitude} {frequency} {decay} {pivotOffset} {duration} {autoStartDelay}>
	<div data-testid="bell" class="bell">🔔</div>
</Pendulum>
