<!--
	AnimatedBeam Demo Page (TFE shell)
-->

<script lang="ts">
	import AnimatedBeam from '$lib/components/AnimatedBeam.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import {
		DEFAULT_BEAM_NODES_UNI,
		DEFAULT_BEAM_CONNECTIONS_UNI,
		DEFAULT_BEAM_NODES_BI,
		DEFAULT_BEAM_CONNECTIONS_BI,
		DEFAULT_BEAM_NODES_MULTI,
		DEFAULT_BEAM_CONNECTIONS_MULTI
	} from '$lib/constants';

	const shell = catalogShellPropsForSlug('/animatedbeam')!;

	const usageSnippet = `<script>
  import AnimatedBeam from '$lib/components/AnimatedBeam.svelte';
</${'script'}>

<AnimatedBeam
  nodes={[
    { id: 'source', x: 100, y: 200, label: 'Source' },
    { id: 'target', x: 500, y: 200, label: 'Target' }
  ]}
  connections={[{ from: 'source', to: 'target' }]}
/>`;

	const codeExplanation =
		'AnimatedBeam draws SVG paths between user-positioned nodes and animates a dashed stroke along each path. Bidirectional connections receive a counter-rotating second beam, and gradient mode swaps the dashes for a soft moving fade — useful for ambient flow diagrams. The component is pure SVG + CSS, so the runtime cost stays close to a static diagram.';
</script>

<svelte:head>
	<title>AnimatedBeam — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="SVG beams for connected-flow diagrams. Uni-, bi-, and multi-input flows with theme-aware colours."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG', 'CSS-only', 'Diagrams']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ab-demo">
			<section class="ab-section">
				<h3>Uni-directional</h3>
				<div class="ab-stage">
					<AnimatedBeam
						nodes={DEFAULT_BEAM_NODES_UNI}
						connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					/>
				</div>
			</section>

			<section class="ab-section">
				<h3>Bi-directional</h3>
				<div class="ab-stage">
					<AnimatedBeam
						nodes={DEFAULT_BEAM_NODES_BI}
						connections={DEFAULT_BEAM_CONNECTIONS_BI}
						bidirectional={true}
					/>
				</div>
			</section>

			<section class="ab-section">
				<h3>Multiple inputs → one output</h3>
				<div class="ab-stage">
					<AnimatedBeam
						nodes={DEFAULT_BEAM_NODES_MULTI}
						connections={DEFAULT_BEAM_CONNECTIONS_MULTI}
					/>
				</div>
			</section>

			<section class="ab-section">
				<h3>Customisation grid</h3>
				<div class="ab-grid">
					<div class="ab-cell">
						<span class="ab-cell__label">beamSpeed=1 (fast)</span>
						<AnimatedBeam
							nodes={DEFAULT_BEAM_NODES_UNI}
							connections={DEFAULT_BEAM_CONNECTIONS_UNI}
							beamSpeed={1}
						/>
					</div>
					<div class="ab-cell">
						<span class="ab-cell__label">beamSpeed=4 (slow)</span>
						<AnimatedBeam
							nodes={DEFAULT_BEAM_NODES_UNI}
							connections={DEFAULT_BEAM_CONNECTIONS_UNI}
							beamSpeed={4}
						/>
					</div>
					<div class="ab-cell">
						<span class="ab-cell__label">green theme</span>
						<AnimatedBeam
							nodes={DEFAULT_BEAM_NODES_UNI}
							connections={DEFAULT_BEAM_CONNECTIONS_UNI}
							beamColor="#10b981"
							nodeColor="#10b981"
						/>
					</div>
					<div class="ab-cell">
						<span class="ab-cell__label">gradient</span>
						<AnimatedBeam
							nodes={DEFAULT_BEAM_NODES_UNI}
							connections={DEFAULT_BEAM_CONNECTIONS_UNI}
							gradient={true}
						/>
					</div>
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
					<td><code>width</code></td>
					<td><code>number</code></td>
					<td><code>600</code></td>
					<td>SVG viewBox width in pixels.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>400</code></td>
					<td>SVG viewBox height in pixels.</td>
				</tr>
				<tr>
					<td><code>nodes</code></td>
					<td><code>BeamNode[]</code></td>
					<td><code>[]</code></td>
					<td>Array of <code>{`{ id, x, y, label }`}</code> nodes.</td>
				</tr>
				<tr>
					<td><code>connections</code></td>
					<td><code>BeamConnection[]</code></td>
					<td><code>[]</code></td>
					<td>Array of <code>{`{ from, to, bidirectional? }`}</code> edges.</td>
				</tr>
				<tr>
					<td><code>beamColor</code></td>
					<td><code>string</code></td>
					<td><code>'#3b82f6'</code></td>
					<td>Hex colour of the animated beam stroke.</td>
				</tr>
				<tr>
					<td><code>beamWidth</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Beam stroke width in pixels.</td>
				</tr>
				<tr>
					<td><code>beamSpeed</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Animation duration in seconds. Lower = faster.</td>
				</tr>
				<tr>
					<td><code>bidirectional</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Toggle a second counter-flowing beam on every connection.</td>
				</tr>
				<tr>
					<td><code>gradient</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Use a soft gradient sweep instead of dashes.</td>
				</tr>
				<tr>
					<td><code>nodeSize</code></td>
					<td><code>number</code></td>
					<td><code>12</code></td>
					<td>Node radius in pixels.</td>
				</tr>
				<tr>
					<td><code>nodeColor</code></td>
					<td><code>string</code></td>
					<td><code>'#3b82f6'</code></td>
					<td>Node fill colour.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ab-demo {
		display: grid;
		gap: 24px;
	}
	.ab-section {
		display: grid;
		gap: 10px;
	}
	.ab-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.ab-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 380px;
		padding: 24px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.ab-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 16px;
	}
	.ab-cell {
		display: grid;
		gap: 10px;
		justify-items: center;
		padding: 18px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		min-height: 380px;
	}
	.ab-cell__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
</style>
