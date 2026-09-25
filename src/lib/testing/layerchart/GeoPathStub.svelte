<!--
  Test double for layerchart's <GeoPath>: renders a bare <path> carrying the
  feature id plus the fill/stroke/class/event props the component passed in
  (anything else — tabindex, role, aria-*, focus/key handlers — is spread
  through, as layerchart does with $$restProps), so tests can assert on
  colours and fire pointer, focus and keyboard events.
-->
<script lang="ts">
	import type { GeoJSON } from 'geojson';

	interface Props {
		geojson?: GeoJSON.Feature;
		fill?: string;
		stroke?: string;
		strokeWidth?: number;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		onpointermove?: (e: PointerEvent) => void;
		onpointerleave?: (e: PointerEvent) => void;
		[attr: string]: unknown;
	}

	let {
		geojson,
		fill,
		stroke,
		strokeWidth,
		class: className = '',
		onclick,
		onpointermove,
		onpointerleave,
		...rest
	}: Props = $props();
</script>

<path
	class={className}
	data-feature-id={geojson?.id ?? ''}
	{fill}
	{stroke}
	stroke-width={strokeWidth}
	{...rest}
	{onclick}
	{onpointermove}
	{onpointerleave}
></path>
