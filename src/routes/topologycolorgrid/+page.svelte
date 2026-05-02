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

	// Brand palette — five-stop spectrum used to demo a tighter design-system style story.
	const brandSwatches: TopologySwatch[] = [
		{ id: 'iris', name: 'Iris', hex: '#6366f1', label: 'P-100' },
		{ id: 'lagoon', name: 'Lagoon', hex: '#06b6d4', label: 'P-200' },
		{ id: 'mint', name: 'Mint', hex: '#10b981', label: 'P-300' },
		{ id: 'amber', name: 'Amber', hex: '#f59e0b', label: 'P-400' },
		{ id: 'rose', name: 'Rose', hex: '#f43f5e', label: 'P-500' }
	];

	// Monochrome ramp — verifies the layout reads cleanly even with neighbouring greys.
	const monoSwatches: TopologySwatch[] = [
		{ id: 'ink', name: 'Ink', hex: '#0f172a', label: '900' },
		{ id: 'graphite', name: 'Graphite', hex: '#334155', label: '700' },
		{ id: 'tin', name: 'Tin', hex: '#64748b', label: '500' },
		{ id: 'ash', name: 'Ash', hex: '#cbd5e1', label: '300' },
		{ id: 'paper', name: 'Paper', hex: '#f1f5f9', label: '100' }
	];

	const usageSnippet = `<script>
  import TopologyColorGrid, {
    type TopologySwatch
  } from '$lib/components/TopologyColorGrid.svelte';

  const swatches: TopologySwatch[] = [
    { id: 'ink', name: 'Ink Mesh', hex: '#0f172a', label: 'Node A1' },
    { id: 'flame', name: 'Flame Route', hex: '#ea580c', label: 'Core 01' }
  ];
</${'script'}>

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
		<!-- Hero variant.
		     Dark stage is deliberate demo content — Three.js wireframes only read on dark.
		     The component owns the WebGL renderer and disposes everything on unmount. -->
		<div class="tcg-stage">
			<TopologyColorGrid swatches={signalSwatches} />
		</div>

		<!-- Brand-system variant.
		     Same component, different swatches, custom title + subtitle so the
		     storytelling can change without touching the component source.
		     `extruded={false}` flattens the Z stack — useful in dense dashboards. -->
		<section class="tcg-block">
			<header class="tcg-label">
				<h3>Brand palette · flattened</h3>
				<p><code>extruded={'{false}'}</code> drops the per-card Z depth, suiting dense layouts.</p>
			</header>
			<div class="tcg-stage tcg-stage--compact">
				<TopologyColorGrid
					swatches={brandSwatches}
					title="Brand Spectrum"
					subtitle="Marketing palette"
					extruded={false}
				/>
			</div>
		</section>

		<!-- Monochrome variant.
		     Pre-set to dark mode via `theme="dark"` and locked (`showThemeToggle={false}`).
		     Demonstrates the component in a place where the surrounding page already
		     manages dark mode and the inline toggle would only confuse users. -->
		<section class="tcg-block">
			<header class="tcg-label">
				<h3>Monochrome · locked dark</h3>
				<p><code>theme="dark"</code> with the inline toggle hidden.</p>
			</header>
			<div class="tcg-stage tcg-stage--compact">
				<TopologyColorGrid
					swatches={monoSwatches}
					title="Neutral Ramp"
					subtitle="Layered foundations"
					theme="dark"
					showThemeToggle={false}
				/>
			</div>
		</section>

		<!-- Static / non-interactive variant.
		     `interactive={false}` removes the hover + active states, perfect for a
		     decorative hero that should not invite clicks. -->
		<section class="tcg-block">
			<header class="tcg-label">
				<h3>Decorative · non-interactive</h3>
				<p><code>interactive={'{false}'}</code> turns this into a still piece — no hover, no click target.</p>
			</header>
			<div class="tcg-stage tcg-stage--compact">
				<TopologyColorGrid
					swatches={signalSwatches.slice(0, 5)}
					title="Composition Study"
					subtitle="Layered Spatial Mapping"
					interactive={false}
				/>
			</div>
		</section>
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
	.tcg-stage--compact {
		min-height: 360px;
	}
	.tcg-block {
		display: grid;
		gap: 10px;
		margin-top: 24px;
	}
	.tcg-label h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg-1);
	}
	.tcg-label p {
		margin: 4px 0 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.tcg-label code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
