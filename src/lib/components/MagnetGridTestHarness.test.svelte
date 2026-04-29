<!--
	Test fixture for MagnetGrid — wraps the component with predictable
	defaults so render assertions can target stable selectors.

	Tests for the pure helpers (gridIndices, cellCenter, falloff,
	displacement, pickPolicy, isReducedMotion) live alongside in
	MagnetGrid.test.ts and call into the module-script exports
	directly — no rendering needed for those.
-->
<script lang="ts">
	import MagnetGrid from './MagnetGrid.svelte';

	type Props = {
		cols?: number;
		rows?: number;
		radius?: number;
		strength?: number;
		policy?: 'attract' | 'repel' | string;
		cellSize?: number;
		gap?: number;
		showLabels?: boolean;
	};

	let {
		cols = 4,
		rows = 3,
		radius = 100,
		strength = 16,
		policy = 'attract',
		cellSize = 32,
		gap = 0,
		showLabels = false
	}: Props = $props();
</script>

<MagnetGrid {cols} {rows} {radius} {strength} {policy} {cellSize} {gap}>
	{#snippet cell(row: number, col: number)}
		{#if showLabels}
			<span data-testid="magnet-cell-{row}-{col}">{row},{col}</span>
		{:else}
			<span data-testid="magnet-cell-{row}-{col}" class="dot"></span>
		{/if}
	{/snippet}
</MagnetGrid>
