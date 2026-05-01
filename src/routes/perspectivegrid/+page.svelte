<script lang="ts">
	import PerspectiveGrid from '$lib/components/PerspectiveGrid.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/perspectivegrid')!;

	const usageSnippet = `<script>
  import PerspectiveGrid from '$lib/components/PerspectiveGrid.svelte';
</${'script'}>

<PerspectiveGrid intensity="standard" mode="mono">
  <div class="hero">
    <h1>Geometry, not gloss.</h1>
  </div>
</PerspectiveGrid>`;

	const codeExplanation =
		'PerspectiveGrid puts a real CSS-3D plane (or two — floor + optional ceiling) inside a perspective context, then drifts a repeating-linear-gradient across each plane via a single background-position keyframe. Three intensities bundle drift duration, cell size, and line opacity; three modes switch between mono, neon, and wireframe looks. Pure CSS — no canvas, no rAF, no resize observer — and reduced-motion freezes the keyframe.';
</script>

<svelte:head>
	<title>PerspectiveGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="3D perspective grid backdrop using CSS preserve-3d. Three intensities, three modes, optional ceiling, reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS 3D', 'Synthwave', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pg-stack">
			<!-- Synthwave demo: dark stage is intentional content. -->
			<div class="pg-frame pg-frame--synth">
				<PerspectiveGrid intensity="rush" mode="neon" ceiling>
					<div class="pg-content">
						<div class="pg-eyebrow">A NICE TERMINAL</div>
						<h3 class="pg-title">Pure CSS, real geometry.</h3>
						<p class="pg-sub">No canvas. No WebGL. Just a tilted plane and a keyframe.</p>
					</div>
				</PerspectiveGrid>
			</div>

			<div class="pg-frame pg-frame--editorial">
				<PerspectiveGrid intensity="standard" mode="mono">
					<div class="pg-content">
						<div class="pg-eyebrow">EDITORIAL</div>
						<h3 class="pg-title">Geometry, not gloss.</h3>
						<p class="pg-sub">A receding grid that doesn't try to win attention.</p>
					</div>
				</PerspectiveGrid>
			</div>

			<div class="pg-frame pg-frame--blueprint">
				<PerspectiveGrid intensity="calm" mode="wireframe">
					<pre class="pg-terminal">
$ pg --intensity=calm --mode=wireframe
&gt; tilting plane............... ok
&gt; tracing grid lines.......... ok
&gt; READY.
</pre>
				</PerspectiveGrid>
			</div>

			<div class="pg-row">
				<div class="pg-frame pg-frame--card">
					<PerspectiveGrid intensity="calm" mode="mono">
						<div class="pg-card-content">
							<h3>Calm</h3>
							<p>18s cycle · 80px cell</p>
						</div>
					</PerspectiveGrid>
				</div>
				<div class="pg-frame pg-frame--card">
					<PerspectiveGrid intensity="standard" mode="mono">
						<div class="pg-card-content">
							<h3>Standard</h3>
							<p>9s cycle · 60px cell</p>
						</div>
					</PerspectiveGrid>
				</div>
				<div class="pg-frame pg-frame--card">
					<PerspectiveGrid intensity="rush" mode="mono">
						<div class="pg-card-content">
							<h3>Rush</h3>
							<p>4s cycle · 50px cell</p>
						</div>
					</PerspectiveGrid>
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
					<td><code>intensity</code></td>
					<td><code>'calm' | 'standard' | 'rush'</code></td>
					<td><code>'standard'</code></td>
					<td>Drift duration, cell size, and line opacity preset.</td>
				</tr>
				<tr>
					<td><code>mode</code></td>
					<td><code>'mono' | 'neon' | 'wireframe'</code></td>
					<td><code>'mono'</code></td>
					<td>Colour treatment and stroke style.</td>
				</tr>
				<tr>
					<td><code>ceiling</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render a tilted ceiling plane in addition to the floor.</td>
				</tr>
				<tr>
					<td><code>animated</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Disable to freeze the drift keyframe.</td>
				</tr>
				<tr>
					<td><code>opacity</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Layer opacity, 0–1.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pg-stack {
		display: grid;
		gap: 1rem;
	}
	/* Dark stages are deliberate demo content — synthwave / TRON / blueprint vibes only read on dark. */
	.pg-frame {
		position: relative;
		border-radius: var(--r-2);
		border: 1px solid #1f1f3a;
		overflow: hidden;
	}
	.pg-frame--synth {
		background: radial-gradient(circle at 50% 80%, #2a0a3a, #050510 70%);
	}
	.pg-frame--editorial {
		background: linear-gradient(180deg, #0d0d1a, #050510);
	}
	.pg-frame--blueprint {
		background: linear-gradient(180deg, #061522, #02101c);
	}
	.pg-frame--card {
		background: #050510;
	}
	.pg-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}
	.pg-content {
		position: relative;
		min-height: 240px;
		padding: 2.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		pointer-events: none;
	}
	.pg-eyebrow {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: #c9c9d1;
		margin-bottom: 0.5rem;
	}
	.pg-title {
		font-size: clamp(1.4rem, 3vw, 2.2rem);
		margin: 0;
		color: #ffffff;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.pg-sub {
		margin: 0.5rem 0 0;
		color: #a8a8b8;
		font-size: 0.9rem;
	}
	.pg-terminal {
		position: relative;
		margin: 0;
		padding: 2.5rem 1.5rem;
		min-height: 220px;
		font-family: 'Fira Code', ui-monospace, monospace;
		font-size: 0.85rem;
		color: #8ce4ff;
		line-height: 1.6;
		text-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
		pointer-events: none;
	}
	.pg-card-content {
		position: relative;
		min-height: 160px;
		padding: 1.5rem 1rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	.pg-card-content h3 {
		margin: 0 0 0.5rem;
		color: #c9c9d1;
		font-size: 1.1rem;
	}
	.pg-card-content p {
		margin: 0;
		font-size: 0.78rem;
		color: #8c8c9c;
		font-family: 'Fira Code', monospace;
	}
</style>
