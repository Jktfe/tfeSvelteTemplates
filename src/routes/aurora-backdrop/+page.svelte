<script lang="ts">
	import AuroraBackdrop, { type AuroraPaletteName } from '$lib/components/AuroraBackdrop.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/aurora-backdrop')!;

	const palettes: { name: AuroraPaletteName; mood: string; copy: string }[] = [
		{ name: 'classic', mood: 'aurora-borealis', copy: 'A new kind of canvas' },
		{ name: 'dawn', mood: 'sunrise warmth', copy: 'Ship a story, not a stack' },
		{ name: 'deep', mood: 'deep-ocean / outer space', copy: 'Quiet light, deep focus' }
	];

	const usageSnippet = `<script>
  import AuroraBackdrop from '$lib/components/AuroraBackdrop.svelte';
</${'script'}>

<div class="hero-frame">
  <AuroraBackdrop palette="classic" intensity={1} />
  <div class="hero-text">
    <h1>A new kind of canvas</h1>
  </div>
</div>`;

	const codeExplanation =
		'AuroraBackdrop stacks four CSS conic-gradient ribbons with mix-blend-mode: screen, each rotating at a deliberately non-harmonic period (40 / 65 / 80 / 110 seconds) so the composite never visibly loops. A radial veil fades the corners, keeping the wash contained. Pure CSS — no canvas, no rAF — and prefers-reduced-motion freezes the ribbons at a deliberately staggered static frame.';
</script>

<svelte:head>
	<title>AuroraBackdrop — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Full-bleed pure-CSS aurora backdrop with four rotating conic-gradient ribbons and a radial veil. Three palettes, asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Ambient', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ab-stack">
			{#each palettes as p (p.name)}
				<div class="ab-frame" data-palette={p.name}>
					<AuroraBackdrop palette={p.name} />
					<div class="ab-text">
						<span class="ab-eyebrow">{p.name} · {p.mood}</span>
						<h3 class="ab-headline">{p.copy}</h3>
					</div>
				</div>
			{/each}

			<div class="ab-row">
				<div class="ab-frame ab-frame--small">
					<AuroraBackdrop palette="classic" intensity={0.6} />
					<span class="ab-tag">0.6×</span>
				</div>
				<div class="ab-frame ab-frame--small">
					<AuroraBackdrop palette="classic" intensity={1} />
					<span class="ab-tag">1.0×</span>
				</div>
				<div class="ab-frame ab-frame--small">
					<AuroraBackdrop palette="classic" intensity={1.8} blur={90} />
					<span class="ab-tag">1.8×</span>
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
					<td><code>'classic' | 'dawn' | 'deep'</code></td>
					<td><code>'classic'</code></td>
					<td>Named ribbon-colour preset.</td>
				</tr>
				<tr>
					<td><code>intensity</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Multiplier on ribbon opacity (0.6 energetic → 1.8 meditative).</td>
				</tr>
				<tr>
					<td><code>blur</code></td>
					<td><code>number</code></td>
					<td><code>60</code></td>
					<td>Blur radius in pixels applied to each ribbon.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra class names appended to the host element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ab-stack {
		display: grid;
		gap: 16px;
	}
	.ab-frame {
		position: relative;
		min-height: 280px;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.ab-frame--small {
		min-height: 180px;
	}
	.ab-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 12px;
	}
	.ab-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		text-align: center;
		color: #f8fafc;
		text-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}
	.ab-eyebrow {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: rgba(248, 250, 252, 0.85);
	}
	.ab-headline {
		font-family: var(--font-display, 'Times New Roman', Georgia, serif);
		font-style: italic;
		font-weight: 700;
		font-size: clamp(1.6rem, 4vw, 2.6rem);
		margin: 0.5rem 0 0;
		line-height: 1.1;
		color: #fff;
	}
	.ab-tag {
		position: absolute;
		bottom: 10px;
		right: 12px;
		padding: 3px 8px;
		background: rgba(15, 17, 28, 0.7);
		color: #f8fafc;
		border-radius: 999px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		backdrop-filter: blur(6px);
		z-index: 2;
	}
</style>
