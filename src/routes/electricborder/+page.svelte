<script lang="ts">
	import ElectricBorder from '$lib/components/ElectricBorder.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/electricborder')!;

	const usageSnippet = `<script>
  import ElectricBorder from '$lib/components/ElectricBorder.svelte';
</${'script'}>

<ElectricBorder intensity="crackling" palette="electric-blue" radius={28}>
  <button class="cta">⚡ Activate</button>
</ElectricBorder>`;

	const codeExplanation =
		'ElectricBorder distorts a stroked rectangle with SVG <feTurbulence> + <feDisplacementMap>, with <animate> driving the turbulence baseFrequency for a live crackling perimeter. Three intensities (mild / crackling / lightning) tune turbulence frequency, distortion scale, animation speed, stroke width, and glow blur together. A module-scoped counter assigns a unique <filter id> per instance so multiple borders on the same page never collide. Reduced motion freezes the animation.';
</script>

<svelte:head>
	<title>ElectricBorder — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated electric-arc border for any element. SVG filter + animate, three intensities, three palettes, composes with Tilt3D."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG filter', 'Wrapper', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="eb-stack">
			<div class="eb-stage eb-stage--hologram">
				<Tilt3D maxTilt={14}>
					<ElectricBorder intensity="lightning" palette="plasma-purple" radius={20}>
						<article class="eb-panel">
							<div class="eb-icon">◈</div>
							<h3>SYSTEM ONLINE</h3>
							<dl>
								<dt>Reactor</dt><dd>97.4%</dd>
								<dt>Coolant</dt><dd>nominal</dd>
								<dt>Throughput</dt><dd>2.1 TFLOPS</dd>
							</dl>
						</article>
					</ElectricBorder>
				</Tilt3D>
			</div>

			<div class="eb-stage">
				<ElectricBorder intensity="crackling" palette="electric-blue" radius={28}>
					<button class="eb-cta eb-cta--blue" type="button">⚡ Activate</button>
				</ElectricBorder>
				<ElectricBorder intensity="crackling" palette="volt-yellow" radius={28}>
					<button class="eb-cta eb-cta--yellow" type="button">⚡ Charge up</button>
				</ElectricBorder>
				<ElectricBorder intensity="crackling" palette="plasma-purple" radius={28}>
					<button class="eb-cta eb-cta--purple" type="button">⚡ Engage</button>
				</ElectricBorder>
			</div>

			<div class="eb-stage">
				<ElectricBorder intensity="mild" palette="electric-blue" radius={999}>
					<span class="eb-pill">⚡ LIVE</span>
				</ElectricBorder>
				<ElectricBorder intensity="mild" palette="volt-yellow" radius={999}>
					<span class="eb-pill">⚡ STREAMING</span>
				</ElectricBorder>
				<ElectricBorder intensity="mild" palette="plasma-purple" radius={999}>
					<span class="eb-pill">⚡ RECORDING</span>
				</ElectricBorder>
			</div>

			<div class="eb-stage">
				<ElectricBorder intensity="mild" palette="electric-blue" radius={16}>
					<div class="eb-card">
						<h3>Mild</h3>
						<p>0.015 freq · 5s cycle</p>
					</div>
				</ElectricBorder>
				<ElectricBorder intensity="crackling" palette="electric-blue" radius={16}>
					<div class="eb-card">
						<h3>Crackling</h3>
						<p>0.030 freq · 3s cycle</p>
					</div>
				</ElectricBorder>
				<ElectricBorder intensity="lightning" palette="electric-blue" radius={16}>
					<div class="eb-card">
						<h3>Lightning</h3>
						<p>0.060 freq · 1.5s cycle</p>
					</div>
				</ElectricBorder>
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
					<td><code>'mild' | 'crackling' | 'lightning'</code></td>
					<td><code>'crackling'</code></td>
					<td>Bundles turbulence, distortion, animation, stroke and halo together.</td>
				</tr>
				<tr>
					<td><code>palette</code></td>
					<td><code>'electric-blue' | 'plasma-purple' | 'volt-yellow'</code></td>
					<td><code>'electric-blue'</code></td>
					<td>Stroke + glow halo preset.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>number</code></td>
					<td><code>12</code></td>
					<td>Border radius in pixels for the stroked rectangle.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>The element to wrap with the electric border.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.eb-stack {
		display: grid;
		gap: 1rem;
	}
	/* Dark stages are deliberate demo content — electric arcs read on dark surfaces. */
	.eb-stage {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: var(--r-2);
		padding: 2.25rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.eb-stage--hologram {
		min-height: 320px;
		background: radial-gradient(circle at 50% 40%, #1a1a3e, #0d0d1a 60%);
	}
	.eb-panel {
		background: rgba(15, 15, 35, 0.85);
		padding: 1.25rem 1.75rem;
		border-radius: 16px;
		min-width: 240px;
		font-family: 'Fira Code', monospace;
		color: #c77dff;
	}
	.eb-icon {
		font-size: 1.75rem;
		text-align: center;
		margin-bottom: 0.4rem;
		color: #ff00ff;
		text-shadow: 0 0 10px #ff00ff;
	}
	.eb-panel h3 {
		text-align: center;
		font-size: 0.95rem;
		letter-spacing: 0.2em;
		margin: 0 0 1.25rem;
		color: #fff;
	}
	.eb-panel dl {
		margin: 0;
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.4rem 1.25rem;
		font-size: 0.85rem;
	}
	.eb-panel dt {
		color: #6c6c8c;
	}
	.eb-panel dd {
		margin: 0;
		text-align: right;
		color: #c77dff;
	}
	.eb-cta {
		font-size: 0.95rem;
		font-weight: 700;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 28px;
		cursor: pointer;
		font-family: inherit;
		letter-spacing: 0.05em;
	}
	.eb-cta--blue {
		background: #051d2e;
		color: #00bfff;
	}
	.eb-cta--yellow {
		background: #2a2200;
		color: #ffea00;
	}
	.eb-cta--purple {
		background: #1a0a2e;
		color: #c77dff;
	}
	.eb-pill {
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.4rem 1rem;
		background: #0a0a1a;
		color: #fff;
		display: inline-block;
		letter-spacing: 0.1em;
	}
	.eb-card {
		background: #0a0a1a;
		padding: 1.25rem 1.5rem;
		border-radius: 16px;
		min-width: 160px;
		text-align: center;
	}
	.eb-card h3 {
		font-size: 1.05rem;
		margin: 0 0 0.4rem;
		color: #00bfff;
	}
	.eb-card p {
		margin: 0;
		font-size: 0.78rem;
		color: #8c8c9c;
		font-family: 'Fira Code', monospace;
	}
</style>
