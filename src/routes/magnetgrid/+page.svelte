<!--
	MagnetGrid Demo Page (TFE shell)
-->

<script lang="ts">
	import MagnetGrid from '$lib/components/MagnetGrid.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/magnetgrid')!;

	const icons = ['★', '◆', '◯', '▲', '✦', '◈', '✧', '◉'];
	const emojis = ['🪐', '✨', '🌙', '☄️', '🌟', '💫', '🌠'];

	let liveCols = $state(10);
	let liveRows = $state(6);
	let liveRadius = $state(160);
	let liveStrength = $state(28);
	let livePolicy = $state<'attract' | 'repel'>('attract');
	let liveCellSize = $state(40);
	let liveGap = $state(0);

	const usageSnippet = `<script>
  import MagnetGrid from '$lib/components/MagnetGrid.svelte';
</${'script'}>

<MagnetGrid cols={20} rows={12} cellSize={28} radius={150} strength={20} />`;

	const codeExplanation =
		'MagnetGrid renders a fixed grid of cells and applies a per-cell translate based on the cursor distance, with quadratic falloff to zero at the radius edge. Each cell is a separate composited layer, so the GPU runs the displacement; CSS handles the smoothing. Switch policy to "repel" and the cells flee instead of chasing.';
</script>

<svelte:head>
	<title>MagnetGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Cursor-driven displacement field. Cells attract or repel from the pointer with smooth falloff."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Cursor', 'Snippets', 'GPU-composited']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="mg-demo">
			<section class="mg-section">
				<h3>Default dot field</h3>
				<div class="mg-stage mg-stage--dark">
					<MagnetGrid cols={20} rows={12} cellSize={28} radius={150} strength={20} />
				</div>
			</section>

			<section class="mg-section">
				<h3>Icon grid — custom snippet content</h3>
				<div class="mg-stage mg-stage--icon">
					<MagnetGrid cols={12} rows={7} cellSize={40} radius={180} strength={26}>
						{#snippet cell(row: number, col: number)}
							<span class="mg-icon">{icons[(row + col) % icons.length]}</span>
						{/snippet}
					</MagnetGrid>
				</div>
			</section>

			<section class="mg-section">
				<h3>Repel mode</h3>
				<div class="mg-stage mg-stage--repel">
					<MagnetGrid
						cols={16}
						rows={10}
						cellSize={32}
						radius={170}
						strength={28}
						policy="repel"
					/>
				</div>
			</section>

			<section class="mg-section">
				<h3>Live controls</h3>
				<div class="mg-controls">
					<label>Cols <strong>{liveCols}</strong>
						<input type="range" min="3" max="20" step="1" bind:value={liveCols} />
					</label>
					<label>Rows <strong>{liveRows}</strong>
						<input type="range" min="3" max="14" step="1" bind:value={liveRows} />
					</label>
					<label>Radius <strong>{liveRadius}px</strong>
						<input type="range" min="40" max="280" step="10" bind:value={liveRadius} />
					</label>
					<label>Strength <strong>{liveStrength}px</strong>
						<input type="range" min="0" max="60" step="2" bind:value={liveStrength} />
					</label>
					<label>Cell size <strong>{liveCellSize}px</strong>
						<input type="range" min="16" max="64" step="2" bind:value={liveCellSize} />
					</label>
					<label>Gap <strong>{liveGap}px</strong>
						<input type="range" min="0" max="20" step="2" bind:value={liveGap} />
					</label>
					<label>Policy
						<select bind:value={livePolicy}>
							<option value="attract">Attract</option>
							<option value="repel">Repel</option>
						</select>
					</label>
				</div>
				<div class="mg-stage mg-stage--emoji">
					<MagnetGrid
						cols={liveCols}
						rows={liveRows}
						radius={liveRadius}
						strength={liveStrength}
						policy={livePolicy}
						cellSize={liveCellSize}
						gap={liveGap}
					>
						{#snippet cell(row: number, col: number)}
							<span class="mg-emoji">{emojis[(row * 7 + col * 3) % emojis.length]}</span>
						{/snippet}
					</MagnetGrid>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>cols</code> / <code>rows</code></td>
					<td><code>number</code></td>
					<td>—</td>
					<td>Grid dimensions.</td>
				</tr>
				<tr>
					<td><code>cellSize</code></td>
					<td><code>number</code></td>
					<td><code>32</code></td>
					<td>Cell size in pixels.</td>
				</tr>
				<tr>
					<td><code>gap</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Gap between cells in pixels.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>number</code></td>
					<td><code>150</code></td>
					<td>Cursor influence radius.</td>
				</tr>
				<tr>
					<td><code>strength</code></td>
					<td><code>number</code></td>
					<td><code>20</code></td>
					<td>Maximum per-cell displacement in pixels.</td>
				</tr>
				<tr>
					<td><code>policy</code></td>
					<td><code>'attract' | 'repel'</code></td>
					<td><code>'attract'</code></td>
					<td>Toggle cells chasing or fleeing the cursor.</td>
				</tr>
				<tr>
					<td><code>cell</code> snippet</td>
					<td><code>(row, col) =&gt; …</code></td>
					<td>—</td>
					<td>Custom content rendered inside each cell.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mg-demo {
		display: grid;
		gap: 24px;
	}
	.mg-section {
		display: grid;
		gap: 10px;
	}
	.mg-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.mg-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 360px;
		padding: 32px 16px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.mg-stage--dark {
		background: radial-gradient(circle at 50% 50%, #1e1b4b, #020617);
		color: #fbbf24;
	}
	.mg-stage--icon {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #c4b5fd;
		min-height: 420px;
	}
	.mg-stage--repel {
		background: radial-gradient(circle at 50% 50%, #4c1d95, #0c0a09);
		color: #f9a8d4;
	}
	.mg-stage--emoji {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		color: #1f2937;
		min-height: 460px;
	}
	.mg-icon {
		font-size: 22px;
		opacity: 0.85;
	}
	.mg-emoji {
		font-size: 24px;
	}

	.mg-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		padding: 18px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.mg-controls label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		color: var(--fg-2);
	}
	.mg-controls input[type='range'],
	.mg-controls select {
		width: 100%;
	}
</style>
