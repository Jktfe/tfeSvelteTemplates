<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import VariableProximity from '$lib/components/VariableProximity.svelte';

	const shell = catalogShellPropsForSlug('/variableproximity')!;
</script>

<svelte:head>
	<title>VariableProximity — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Per-letter variable-font morph that follows cursor proximity. rAF-throttled writes, CSS-eased transitions."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Typography', 'Hover', 'A11y']}
	codeExplanation="VariableProximity measures each glyph's position, computes its distance from the cursor every frame inside a single rAF callback, and writes one font-variation-settings string per letter. CSS owns the easing via a transition on font-variation-settings, so the effect costs nothing when the cursor isn't moving and degrades gracefully where variable-font support is missing."
>
	{#snippet demo()}
		<div class="vp-demo">
			<div class="vp-card vp-card--centered">
				<h3 class="vp-headline">
					<VariableProximity text="Type that breathes." />
				</h3>
			</div>

			<div class="vp-card vp-card--centered">
				<span class="vp-display-2">
					<VariableProximity
						text="Lean in to read me."
						axes={[{ axis: 'slnt', base: 0, peak: -12 }]}
						radius={140}
					/>
				</span>
			</div>

			<div class="vp-card vp-card--centered">
				<span class="vp-display-1">
					<VariableProximity
						text="Stretch across the page"
						axes={[{ axis: 'wdth', base: 75, peak: 125 }]}
						radius={160}
						falloffCurve="gaussian"
					/>
				</span>
			</div>

			<div class="vp-card vp-card--centered vp-card--dark">
				<span class="vp-display-1 vp-light">
					<VariableProximity
						text="Premium typography, on demand."
						axes={[
							{ axis: 'wght', base: 350, peak: 900 },
							{ axis: 'wdth', base: 100, peak: 130 },
							{ axis: 'opsz', base: 24, peak: 96 }
						]}
						radius={150}
						transitionMs={200}
					/>
				</span>
			</div>

			<div class="vp-card vp-card--centered vp-card--poem">
				<span class="vp-display-2">
					<VariableProximity
						text="Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler."
						axes={[{ axis: 'wght', base: 400, peak: 700 }]}
						radius={130}
						transitionMs={180}
					/>
				</span>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>Phrase to render as proximity-reactive letters.</td></tr>
				<tr><td><code>axes</code></td><td><code>{`{ axis, base, peak }[]`}</code></td><td>wght+wdth</td><td>Variable-font axes to morph and their range.</td></tr>
				<tr><td><code>radius</code></td><td><code>number</code></td><td><code>120</code></td><td>Cursor influence radius in px.</td></tr>
				<tr><td><code>falloffCurve</code></td><td><code>"linear" | "quadratic" | "gaussian"</code></td><td><code>"quadratic"</code></td><td>Distance-to-strength mapping.</td></tr>
				<tr><td><code>transitionMs</code></td><td><code>number</code></td><td><code>120</code></td><td>CSS transition duration on the variation axes.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.vp-demo {
		display: grid;
		gap: 16px;
	}
	.vp-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.vp-card--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
		text-align: center;
	}
	.vp-card--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.vp-card--poem {
		min-height: 240px;
		padding: 3rem 2.5rem;
		line-height: 1.85;
	}
	.vp-headline {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.vp-display-1 {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.5;
	}
	.vp-light {
		color: #f1f5f9;
	}
	.vp-display-2 {
		font-size: 1.65rem;
		font-weight: 700;
		line-height: 1.6;
	}
</style>
