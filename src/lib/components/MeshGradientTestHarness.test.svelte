<!--
	Test fixture for MeshGradient — pass-through wrapper so render
	assertions can target the same DOM the demo page renders without
	hard-coding default props in every test.

	MeshGradient takes no children/snippets, so the harness is a thin
	prop forwarder. The pure helper tests in MeshGradient.test.ts
	exercise palette pickers, blob layout, and clamps directly via
	the module-script exports — render tests verify wiring (counts,
	custom properties, attributes), not maths.
-->
<script lang="ts">
	import MeshGradient from './MeshGradient.svelte';

	type Props = {
		palette?: string;
		blobCount?: number;
		blur?: number;
		opacity?: number;
		speed?: number;
		class?: string;
	};

	let {
		palette = 'sunset',
		blobCount = 5,
		blur = 80,
		opacity = 0.7,
		speed = 1,
		class: extraClass = ''
	}: Props = $props();
</script>

<div style="width: 400px; height: 300px;">
	<MeshGradient
		{palette}
		{blobCount}
		{blur}
		{opacity}
		{speed}
		class={extraClass}
	/>
</div>
