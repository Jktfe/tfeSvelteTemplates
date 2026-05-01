<!--
	============================================================
	MagicCard Demo Page (TFE shell)
	============================================================

	Reference adoption of ComponentPageShell. Other component
	demo pages can follow this template — header / live demo /
	implementation / API on the left; install / deps / agent /
	resources / tags on the right.
-->

<script lang="ts">
	import MagicCard from '$lib/components/MagicCard.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';

	const features = [
		{
			icon: '⚡',
			title: 'Lightning fast',
			description: 'Pointer events drive a single radial gradient — no rerenders, no jank.'
		},
		{
			icon: '🎨',
			title: 'Theme aware',
			description: 'Inherits surface and border tokens, so light and dark modes both look right.'
		},
		{
			icon: '🧩',
			title: 'Zero deps',
			description: 'Pure Svelte 5 + scoped CSS. Lift the file, drop it in, ship.'
		}
	];

	const usageSnippet = `<script>
  import MagicCard from '$lib/components/MagicCard.svelte';
<\/script>

<MagicCard gradientColor="#146ef5" gradientOpacity={0.15}>
  <article class="card">
    <h3>Lightning fast</h3>
    <p>Pointer events drive a single radial gradient.</p>
  </article>
</MagicCard>`;

	const codeExplanation =
		'MagicCard tracks the pointer relative to its bounding box and writes the position into a CSS custom property. A radial gradient overlay uses that property as its centre, creating the spotlight. On pointer leave the gradient fades via a CSS transition. Everything is scoped — no globals leak.';
</script>

<svelte:head>
	<title>MagicCard — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive Svelte 5 cards with mouse-tracking spotlight and border glow. Light and dark mode support."
	/>
</svelte:head>

<ComponentPageShell
	name="MagicCard"
	category="Cards & Layout"
	description="Cards with a mouse-tracking spotlight and border glow. Pure CSS overlay, pointer-driven, theme-aware."
	install="cp src/lib/components/MagicCard.svelte ./src/lib/components/"
	dependencies={['Svelte 5+', 'Zero external dependencies', 'Scoped CSS only']}
	source="src/lib/components/MagicCard.svelte"
	demoPath="src/routes/magiccard/+page.svelte"
	agentSteps={[
		'Copy MagicCard.svelte into src/lib/components/.',
		'Wrap the element you want to spotlight with <MagicCard>.',
		'Tune gradientColor (hex) and gradientOpacity (0–1) to taste.'
	]}
	tags={['Svelte 5', 'Hover', 'CSS-only', 'Theme-aware']}
	resources={[
		{ label: 'Source · MagicCard.svelte', href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/MagicCard.svelte' },
		{ label: 'Tests · MagicCard.test.ts', href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/MagicCard.test.ts' },
		{ label: 'Component docs', href: 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/src/lib/components/MagicCard.md' }
	]}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="mc-demo-grid">
			{#each features as feature (feature.title)}
				<MagicCard gradientColor="#004695" gradientOpacity={0.18}>
					<article class="mc-feature">
						<span class="mc-feature__icon" aria-hidden="true">{feature.icon}</span>
						<h3>{feature.title}</h3>
						<p>{feature.description}</p>
					</article>
				</MagicCard>
			{/each}
		</div>
		<div class="mc-demo-row">
			<MagicCard gradientColor="#b3502c" gradientOpacity={0.2}>
				<article class="mc-feature mc-feature--alt">
					<h3>Rust accent</h3>
					<p>gradientColor="#b3502c"</p>
				</article>
			</MagicCard>
			<MagicCard gradientColor="#6e7d4e" gradientOpacity={0.2}>
				<article class="mc-feature mc-feature--alt">
					<h3>Moss accent</h3>
					<p>gradientColor="#6e7d4e"</p>
				</article>
			</MagicCard>
			<MagicCard gradientColor="#5b82c4" gradientOpacity={0.25}>
				<article class="mc-feature mc-feature--alt">
					<h3>Sky accent</h3>
					<p>gradientColor="#5b82c4"</p>
				</article>
			</MagicCard>
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
					<td><code>gradientColor</code></td>
					<td><code>string</code></td>
					<td><code>"#146ef5"</code></td>
					<td>Hex colour of the spotlight gradient. Six-digit RGB or eight-digit RGBA.</td>
				</tr>
				<tr>
					<td><code>gradientOpacity</code></td>
					<td><code>number</code></td>
					<td><code>0.15</code></td>
					<td>0 – 1. Strength of the overlay at the spotlight centre.</td>
				</tr>
				<tr>
					<td><code>gradientSize</code></td>
					<td><code>number</code></td>
					<td><code>200</code></td>
					<td>Radius of the radial gradient in pixels.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mc-demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
		margin-bottom: 16px;
	}
	.mc-demo-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.mc-feature {
		display: grid;
		gap: 8px;
		padding: 24px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		min-height: 180px;
		color: var(--fg-1);
	}
	.mc-feature--alt {
		min-height: 120px;
		padding: 18px 20px;
	}
	.mc-feature__icon {
		font-size: 24px;
		line-height: 1;
	}
	.mc-feature h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 22px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		line-height: 1;
	}
	.mc-feature p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
</style>
