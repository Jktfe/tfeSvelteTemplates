<!--
  Internal test harness — exists only so NoiseField.test.ts can render
  a NoiseField with snippet children and assert overlay + filter wiring.
  Not exported, not used by the real app. The .test.svelte suffix keeps
  it co-located with the test file but prevents shipping.
-->
<script lang="ts">
	import NoiseField, {
		type NoiseFieldIntensity,
		type NoiseFieldMode
	} from './NoiseField.svelte';

	interface Props {
		intensity?: NoiseFieldIntensity;
		mode?: NoiseFieldMode;
		animated?: boolean;
		opacity?: number;
	}

	let {
		intensity = 'medium',
		mode = 'mono',
		animated = true,
		opacity = 0.4
	}: Props = $props();
</script>

<NoiseField {intensity} {mode} {animated} {opacity}>
	<div data-testid="surface" style="width: 400px; height: 300px;">
		<button data-testid="inner-button">Hover me</button>
	</div>
</NoiseField>
