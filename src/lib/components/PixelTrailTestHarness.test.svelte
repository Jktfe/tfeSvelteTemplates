<!--
  Internal test harness — exists only so PixelTrail.test.ts can render
  a PixelTrail with snippet children and assert mousemove → spawn → cleanup
  behaviour. Not exported, not used by the real app. The .test.svelte
  suffix keeps it co-located with the test file but prevents shipping.
-->
<script lang="ts">
	import PixelTrail, {
		type PixelTrailSize,
		type PixelTrailPalette
	} from './PixelTrail.svelte';

	interface Props {
		size?: PixelTrailSize;
		palette?: PixelTrailPalette;
		trailLength?: number;
		duration?: number;
	}

	let {
		size = 'medium',
		palette = 'mono-white',
		trailLength = 16,
		duration = 700
	}: Props = $props();
</script>

<PixelTrail {size} {palette} {trailLength} {duration}>
	<div data-testid="surface" style="width: 400px; height: 300px;">
		<button data-testid="inner-button">Hover me</button>
	</div>
</PixelTrail>
