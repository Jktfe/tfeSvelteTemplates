<script lang="ts">
	import NoiseField from '$lib/components/NoiseField.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/noisefield')!;

	// ----------------------------------------------------------------------
	// Live playground state — every control rebinds straight into the single
	// NoiseField instance below. Useful for choosing the right grain weight
	// without diffing screenshots.
	// ----------------------------------------------------------------------
	type Intensity = 'fine' | 'medium' | 'coarse';
	type Mode = 'mono' | 'chroma' | 'retro';

	let liveIntensity = $state<Intensity>('medium');
	let liveMode = $state<Mode>('mono');
	let liveOpacity = $state(0.45);
	let liveAnimated = $state(true);

	const intensityOptions: { id: Intensity; label: string }[] = [
		{ id: 'fine', label: 'Fine' },
		{ id: 'medium', label: 'Medium' },
		{ id: 'coarse', label: 'Coarse' }
	];

	const modeOptions: { id: Mode; label: string }[] = [
		{ id: 'mono', label: 'Mono' },
		{ id: 'chroma', label: 'Chroma' },
		{ id: 'retro', label: 'Retro' }
	];

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

			<!-- Live playground.
			     Every value below pipes straight into the live NoiseField at
			     the bottom — handy for picking the right grain weight against
			     your own copy without diffing screenshots. -->
			<section class="nf-playground">
				<header class="nf-playground__head">
					<h3>Live playground</h3>
					<p>Tweak the props — they bind straight into the NoiseField below.</p>
				</header>

				<div class="nf-controls">
					<div class="nf-control">
						<span class="nf-control__label">Intensity</span>
						<div class="nf-buttons">
							{#each intensityOptions as opt (opt.id)}
								<button
									type="button"
									class="nf-pill"
									class:nf-pill--active={liveIntensity === opt.id}
									onclick={() => (liveIntensity = opt.id)}
								>{opt.label}</button>
							{/each}
						</div>
					</div>

					<div class="nf-control">
						<span class="nf-control__label">Mode</span>
						<div class="nf-buttons">
							{#each modeOptions as opt (opt.id)}
								<button
									type="button"
									class="nf-pill"
									class:nf-pill--active={liveMode === opt.id}
									onclick={() => (liveMode = opt.id)}
								>{opt.label}</button>
							{/each}
						</div>
					</div>

					<div class="nf-control">
						<span class="nf-control__label">Opacity <strong>{liveOpacity.toFixed(2)}</strong></span>
						<input type="range" min="0" max="1" step="0.05" bind:value={liveOpacity} aria-label="Grain opacity" />
					</div>

					<div class="nf-control">
						<span class="nf-control__label">Animated</span>
						<div class="nf-buttons">
							<button
								type="button"
								class="nf-pill"
								class:nf-pill--active={liveAnimated}
								onclick={() => (liveAnimated = true)}
							>On</button>
							<button
								type="button"
								class="nf-pill"
								class:nf-pill--active={!liveAnimated}
								onclick={() => (liveAnimated = false)}
							>Frozen</button>
						</div>
					</div>
				</div>

				<NoiseField intensity={liveIntensity} mode={liveMode} opacity={liveOpacity} animated={liveAnimated}>
					<div class="nf-stage nf-stage--live">
						<div class="nf-content">
							<div class="nf-eyebrow">LIVE PREVIEW</div>
							<h3 class="nf-title">{liveIntensity} · {liveMode}</h3>
							<p class="nf-sub">opacity {liveOpacity.toFixed(2)} · {liveAnimated ? 'animated' : 'static'}</p>
						</div>
					</div>
				</NoiseField>
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

	.nf-stage--live {
		background: radial-gradient(circle at 60% 40%, #1a2350, #0a0a14 70%);
	}
	.nf-playground {
		display: grid;
		gap: 14px;
		padding: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.nf-playground__head h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.nf-playground__head p {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}
	.nf-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}
	.nf-control {
		display: grid;
		gap: 6px;
	}
	.nf-control__label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.nf-control__label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.nf-control input[type='range'] {
		width: 100%;
	}
	.nf-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.nf-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.nf-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.nf-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}
</style>
