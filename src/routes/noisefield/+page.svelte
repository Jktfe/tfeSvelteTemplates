<script lang="ts">
	import NoiseField from '$lib/components/NoiseField.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/noisefield')!;

	const usageSnippet = `<script>
  import NoiseField from '$lib/components/NoiseField.svelte';
</${'script'}>

<NoiseField intensity="medium" mode="mono" opacity={0.45}>
  <div class="hero">
    <h1>Texture, not colour.</h1>
  </div>
</NoiseField>`;

	const codeExplanation =
		'NoiseField paints SVG <feTurbulence> + <feColorMatrix> grain into a single <rect> and layers it over its slot via mix-blend-mode. Three intensities pair baseFrequency with numOctaves so grain size and richness scale together; three modes cover mono, chroma RGB, and retro chromatic-plus-scanlines. The filter ID swaps from a static SSR token to a unique nf-N on mount, so hydration mismatch never shows.';
</script>

<svelte:head>
	<title>NoiseField — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Ambient grain, film-noise, and TV-static overlay built from a single SVG feTurbulence filter. Three intensities, three modes, reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG filter', 'Overlay', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="nf-stack">
			<NoiseField intensity="medium" mode="mono" opacity={0.45}>
				<!-- Dark stage is deliberate demo content — film grain reads on dark. -->
				<div class="nf-stage nf-stage--mono">
					<div class="nf-content">
						<div class="nf-eyebrow">A NICE TERMINAL</div>
						<h3 class="nf-title">Texture, not colour.</h3>
						<p class="nf-sub">Grain that lives over the surface, not next to it.</p>
					</div>
				</div>
			</NoiseField>

			<NoiseField intensity="coarse" mode="retro" opacity={0.55}>
				<div class="nf-stage nf-stage--retro">
					<pre class="nf-terminal">
$ ant boot --mode=arcade
&gt; loading kernel.................. ok
&gt; mounting palette................ ok
&gt; READY.
</pre>
				</div>
			</NoiseField>

			<NoiseField intensity="fine" mode="chroma" opacity={0.35}>
				<div class="nf-stage nf-stage--chroma">
					<div class="nf-warm">
						<div class="nf-warm__tag">SUMMER · 26</div>
						<h3 class="nf-warm__title">Cinema for the cursor.</h3>
					</div>
				</div>
			</NoiseField>

			<div class="nf-row">
				<NoiseField intensity="fine" mode="mono" opacity={0.5}>
					<div class="nf-card">
						<h3>Fine</h3>
						<p>baseFreq 1.6 · 2 octaves</p>
					</div>
				</NoiseField>
				<NoiseField intensity="medium" mode="mono" opacity={0.5}>
					<div class="nf-card">
						<h3>Medium</h3>
						<p>baseFreq 0.85 · 3 octaves</p>
					</div>
				</NoiseField>
				<NoiseField intensity="coarse" mode="mono" opacity={0.5}>
					<div class="nf-card">
						<h3>Coarse</h3>
						<p>baseFreq 0.4 · 4 octaves</p>
					</div>
				</NoiseField>
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
					<td><code>'fine' | 'medium' | 'coarse'</code></td>
					<td><code>'medium'</code></td>
					<td>Bundles baseFrequency and numOctaves.</td>
				</tr>
				<tr>
					<td><code>mode</code></td>
					<td><code>'mono' | 'chroma' | 'retro'</code></td>
					<td><code>'mono'</code></td>
					<td>Colour matrix preset; retro adds scanlines.</td>
				</tr>
				<tr>
					<td><code>animated</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Set false (or under reduced-motion) for a static frame.</td>
				</tr>
				<tr>
					<td><code>opacity</code></td>
					<td><code>number</code></td>
					<td><code>0.4</code></td>
					<td>Overlay opacity, 0–1.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.nf-stack {
		display: grid;
		gap: 1rem;
	}
	/* Dark stages are deliberate demo content — grain reads on dark surfaces. */
	.nf-stage {
		border: 1px solid #1f1f3a;
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		min-height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.nf-stage--mono {
		background: radial-gradient(circle at 30% 50%, #181830, #0a0a14 70%);
	}
	.nf-stage--retro {
		background: linear-gradient(135deg, #051d2e, #02101c);
		font-family: 'Fira Code', ui-monospace, monospace;
	}
	.nf-stage--chroma {
		background: linear-gradient(135deg, #2a1a4e, #4a0a3a 60%, #ff3d6e);
	}
	.nf-content {
		text-align: center;
		pointer-events: none;
	}
	.nf-eyebrow {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: #6c6c8c;
		margin-bottom: 0.5rem;
	}
	.nf-title {
		font-size: clamp(1.4rem, 3vw, 2.2rem);
		margin: 0;
		color: #ffffff;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.nf-sub {
		margin: 0.4rem 0 0;
		color: #a8a8b8;
		font-size: 0.9rem;
	}
	.nf-terminal {
		margin: 0;
		font-size: 0.85rem;
		color: #8ce4ff;
		line-height: 1.6;
		text-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
		pointer-events: none;
	}
	.nf-warm {
		text-align: center;
		pointer-events: none;
	}
	.nf-warm__tag {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: #ffd0e8;
		margin-bottom: 0.5rem;
	}
	.nf-warm__title {
		margin: 0;
		font-size: clamp(1.4rem, 3vw, 2rem);
		color: #ffffff;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.nf-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}
	.nf-card {
		background: #0a0a14;
		border: 1px solid #1f1f3a;
		border-radius: var(--r-2);
		padding: 1.5rem 1rem;
		min-height: 140px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	.nf-card h3 {
		margin: 0 0 0.4rem;
		color: #c9c9d1;
		font-size: 1.05rem;
	}
	.nf-card p {
		margin: 0;
		font-size: 0.75rem;
		color: #8c8c9c;
		font-family: 'Fira Code', monospace;
	}
</style>
