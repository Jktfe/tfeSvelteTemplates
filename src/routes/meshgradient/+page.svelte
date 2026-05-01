<script lang="ts">
	import MeshGradient from '$lib/components/MeshGradient.svelte';
	import type { Palette } from '$lib/components/MeshGradient.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/meshgradient')!;

	let livePalette = $state<Palette>('sunset');
	let liveBlobCount = $state(6);
	let liveBlur = $state(90);
	let liveOpacity = $state(0.75);
	let liveSpeed = $state(1);

	const paletteOptions: Palette[] = ['sunset', 'aurora', 'ember', 'cosmic', 'mint', 'monochrome'];

	const usageSnippet = `<script>
  import MeshGradient from '$lib/components/MeshGradient.svelte';
</${'script'}>

<div class="hero">
  <MeshGradient palette="cosmic" blobCount={6} blur={110} opacity={0.85} />
  <h1 class="hero__title">Hello, mesh.</h1>
</div>`;

	const codeExplanation =
		'MeshGradient renders a small set of large, blurred radial-gradient blobs that drift on independent CSS keyframes. A single filter: blur composites them into a single soft wash. There is no canvas, no requestAnimationFrame, and no per-frame JS — every prop change just updates inline custom properties.';
</script>

<svelte:head>
	<title>MeshGradient — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated mesh-gradient backdrop made of large blurred radial blobs. Six palettes, configurable blob count, blur, opacity, and speed."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Ambient', 'Animated']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="mg-stack">
			<!-- Dark stage is intentional — meshes are designed to sit under bright copy. -->
			<div class="mg-stage">
				<MeshGradient palette="cosmic" blobCount={6} blur={110} opacity={0.85} />
				<div class="mg-overlay">
					<h3>Cosmic</h3>
					<p>palette="cosmic" · blobCount=6 · blur=110</p>
				</div>
			</div>

			<div class="mg-stage">
				<MeshGradient palette="aurora" blobCount={8} blur={110} opacity={0.85} />
				<div class="mg-overlay">
					<h3>Aurora</h3>
					<p>palette="aurora" · blobCount=8 · blur=110</p>
				</div>
			</div>

			<div class="mg-gallery">
				{#each paletteOptions as p (p)}
					<div class="mg-tile">
						<MeshGradient palette={p} blobCount={4} blur={70} opacity={0.85} />
						<div class="mg-tile__label">{p}</div>
					</div>
				{/each}
			</div>

			<div class="mg-controls">
				<label>
					Palette
					<select bind:value={livePalette}>
						{#each paletteOptions as p (p)}
							<option value={p}>{p}</option>
						{/each}
					</select>
				</label>
				<label>
					Blobs <strong>{liveBlobCount}</strong>
					<input type="range" min="1" max="12" step="1" bind:value={liveBlobCount} />
				</label>
				<label>
					Blur <strong>{liveBlur}px</strong>
					<input type="range" min="0" max="200" step="5" bind:value={liveBlur} />
				</label>
				<label>
					Opacity <strong>{liveOpacity.toFixed(2)}</strong>
					<input type="range" min="0" max="1" step="0.05" bind:value={liveOpacity} />
				</label>
				<label>
					Speed <strong>{liveSpeed.toFixed(1)}×</strong>
					<input type="range" min="0" max="3" step="0.1" bind:value={liveSpeed} />
				</label>
			</div>
			<div class="mg-stage">
				<MeshGradient
					palette={livePalette}
					blobCount={liveBlobCount}
					blur={liveBlur}
					opacity={liveOpacity}
					speed={liveSpeed}
				/>
				<div class="mg-overlay">
					<h3>Live</h3>
					<p>palette={livePalette} · {liveBlobCount} blobs · {liveBlur}px blur</p>
				</div>
			</div>
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
					<td><code>palette</code></td>
					<td><code>'sunset' | 'aurora' | 'ember' | 'cosmic' | 'mint' | 'monochrome'</code></td>
					<td><code>'sunset'</code></td>
					<td>Named blob-colour preset.</td>
				</tr>
				<tr>
					<td><code>blobCount</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Number of radial blobs (1–12).</td>
				</tr>
				<tr>
					<td><code>blur</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Pixel blur applied to the composite.</td>
				</tr>
				<tr>
					<td><code>opacity</code></td>
					<td><code>number</code></td>
					<td><code>0.7</code></td>
					<td>Layer opacity, 0–1.</td>
				</tr>
				<tr>
					<td><code>speed</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Drift-speed multiplier (0 freezes the mesh).</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mg-stack {
		display: grid;
		gap: 16px;
	}
	/* Dark stages are deliberate demo content — meshes are designed to live behind bright copy. */
	.mg-stage {
		position: relative;
		min-height: 280px;
		border-radius: var(--r-2);
		overflow: hidden;
		background: #0a0a1a;
		display: flex;
		align-items: flex-end;
		padding: 1.25rem;
	}
	.mg-overlay {
		position: relative;
		z-index: 1;
		color: #fff;
	}
	.mg-overlay h3 {
		margin: 0 0 0.25rem;
		font-size: 1.1rem;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
	}
	.mg-overlay p {
		margin: 0;
		font-size: 0.8rem;
		opacity: 0.85;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}
	.mg-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 10px;
	}
	.mg-tile {
		position: relative;
		min-height: 140px;
		border-radius: var(--r-2);
		overflow: hidden;
		background: #0a0a1a;
		display: flex;
		align-items: flex-end;
		padding: 0.75rem;
	}
	.mg-tile__label {
		position: relative;
		z-index: 1;
		color: #fff;
		font-size: 0.8rem;
		text-transform: capitalize;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
	}
	.mg-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.mg-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--fg-2);
	}
	.mg-controls input[type='range'],
	.mg-controls select {
		width: 100%;
	}
</style>
