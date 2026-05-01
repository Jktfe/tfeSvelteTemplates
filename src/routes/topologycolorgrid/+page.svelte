<script lang="ts">
	import TopologyColorGrid, { type TopologySwatch } from '$lib/components/TopologyColorGrid.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/topologycolorgrid')!;

	const signalSwatches: TopologySwatch[] = [
		{ id: 'ink', name: 'Ink Mesh', hex: '#0f172a', label: 'Node A1' },
		{ id: 'snow', name: 'Snow Field', hex: '#f8fafc', label: 'Node B5' },
		{ id: 'teal', name: 'Teal Current', hex: '#0f766e', label: 'Node C2' },
		{ id: 'flame', name: 'Flame Route', hex: '#ea580c', label: 'Core 01' },
		{ id: 'sun', name: 'Sun Relay', hex: '#facc15', label: 'Node D4' },
		{ id: 'clay', name: 'Clay Memory', hex: '#fecaca', label: 'Node E3' },
		{ id: 'wine', name: 'Wine Gate', hex: '#7f1d1d', label: 'Node F6' }
	];

	const usageSnippet = `<script>
  import TopologyColorGrid, {
    type TopologySwatch
  } from '$lib/components/TopologyColorGrid.svelte';

  const swatches: TopologySwatch[] = [
    { id: 'ink', name: 'Ink Mesh', hex: '#0f172a', label: 'Node A1' },
    { id: 'flame', name: 'Flame Route', hex: '#ea580c', label: 'Core 01' }
  ];
<\/script>

<TopologyColorGrid {swatches} />`;

	const codeExplanation =
		'TopologyColorGrid mounts a Three.js wireframe plane on a client-side canvas and uses GSAP to choreograph a staggered card reveal. The Three.js renderer, geometry, material, and the GSAP context are all torn down in onMount’s cleanup return, so unmount disposes the WebGL resources cleanly. The component owns the canvas; do not duplicate the renderer in a parent. WebGL is feature-detected before mount, so the cards still render if the GPU path is unavailable.';
</script>

<svelte:head>
	<title>TopologyColorGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Three.js + GSAP colour topology grid. Wireframe plane backdrop, staggered card reveal, swatches presented as accessible buttons."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Three.js', 'GSAP', 'Client-only']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<!-- Dark stage is deliberate demo content — Three.js wireframes only read on dark.
		     The component owns the WebGL renderer and disposes everything on unmount. -->
		<div class="tcg-stage">
			<TopologyColorGrid swatches={signalSwatches} />
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
					<td><code>swatches</code></td>
					<td><code>TopologySwatch[]</code></td>
					<td>built-in palette</td>
					<td>Array of <code>{'{ id, name, hex, label }'}</code> swatches.</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>'Chromatic Substrate Topology'</code></td>
					<td>Heading copy above the grid.</td>
				</tr>
				<tr>
					<td><code>subtitle</code></td>
					<td><code>string</code></td>
					<td><code>'Spatial Z-Index Mapping'</code></td>
					<td>Eyebrow line above the title.</td>
				</tr>
				<tr>
					<td><code>extruded</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Stack swatches in a z-plane (false flattens the layout).</td>
				</tr>
				<tr>
					<td><code>interactive</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Whether swatches respond to hover/focus.</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'light' | 'dark'</code></td>
					<td><code>'light'</code></td>
					<td>Initial card theme.</td>
				</tr>
				<tr>
					<td><code>showThemeToggle</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the inline light/dark toggle.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	/* Dark stage is deliberate demo content — the Three.js wireframe needs a dark backdrop. */
	.tcg-stage {
		background: #020617;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
	}
</style>
