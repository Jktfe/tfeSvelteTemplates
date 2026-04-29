<!--
  Internal test harness — exists only so Tilt3D.test.ts can mount
  a Tilt3D wrapper with a known child and assert on the rendered
  attributes, custom properties, and pointer-driven state.
  Not exported, not shipped. The .test.svelte suffix keeps it
  co-located with the test file while excluding it from the
  production bundle.
-->
<script lang="ts">
	import Tilt3D, { type Reset } from './Tilt3D.svelte';

	interface Props {
		maxTilt?: number;
		perspective?: number;
		glare?: boolean;
		glareIntensity?: number;
		reset?: Reset;
		scale?: number;
	}

	let {
		maxTilt = 12,
		perspective = 1000,
		glare = true,
		glareIntensity = 0.3,
		reset = 'spring',
		scale = 1.04
	}: Props = $props();
</script>

<Tilt3D {maxTilt} {perspective} {glare} {glareIntensity} {reset} {scale}>
	<div data-testid="card" class="card">Tilt me</div>
</Tilt3D>
