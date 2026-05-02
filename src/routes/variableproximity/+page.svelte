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
			<p class="vp-demo__lede">
				Move your cursor over each phrase below. Every section drives a different variable-font
				axis (or combination), with different <code>radius</code> and <code>falloffCurve</code>
				settings. Best viewed in Chrome, Edge, or Safari with Inter Variable, Roboto Flex, or San
				Francisco installed.
			</p>

			<section class="vp-section">
				<h4>Weight axis · wght 400→800 · radius 120 · quadratic</h4>
				<p class="vp-section__hint">
					The default — letters bloom in weight where the cursor lingers. Quadratic falloff gives
					a smooth, non-spiky bulge.
				</p>
				<div class="vp-card vp-card--centered">
					<h3 class="vp-headline">
						<VariableProximity text="Type that breathes." />
					</h3>
				</div>
			</section>

			<section class="vp-section">
				<h4>Width axis · wdth 75→125 · radius 160 · gaussian</h4>
				<p class="vp-section__hint">
					Stretches letters horizontally as the cursor approaches. The Gaussian falloff has a
					softer bell, so the stretch tapers gently. Wide radius to keep things readable.
				</p>
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
			</section>

			<section class="vp-section">
				<h4>Slant axis · slnt 0→-12 · radius 140 · linear</h4>
				<p class="vp-section__hint">
					Italicises letters near the cursor. Linear falloff means a sharp, triangular response —
					letters lean noticeably right at the centre and snap upright at the radius edge.
				</p>
				<div class="vp-card vp-card--centered">
					<span class="vp-display-2">
						<VariableProximity
							text="Lean in to read me."
							axes={[{ axis: 'slnt', base: 0, peak: -12 }]}
							radius={140}
							falloffCurve="linear"
						/>
					</span>
				</div>
			</section>

			<section class="vp-section">
				<h4>Multi-axis · wght + wdth + opsz · radius 150</h4>
				<p class="vp-section__hint">
					Three axes drive simultaneously — weight blooms, width stretches, and optical-size shifts
					to display-grade glyph shapes. The compound effect feels like the type is alive under
					the cursor.
				</p>
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
			</section>

			<section class="vp-section">
				<h4>Radius comparison · 60 vs 140 vs 220 px</h4>
				<p class="vp-section__hint">
					Same axes, three different radii. The 60px sample is hyper-local (almost a single
					letter), 140 is the sweet spot, 220 covers the whole phrase at once.
				</p>
				<div class="vp-grid">
					<div class="vp-card vp-card--centered vp-card--small">
						<span class="vp-radius-tag">radius 60</span>
						<span class="vp-display-3">
							<VariableProximity
								text="hyper local"
								radius={60}
								axes={[{ axis: 'wght', base: 400, peak: 900 }]}
							/>
						</span>
					</div>
					<div class="vp-card vp-card--centered vp-card--small">
						<span class="vp-radius-tag">radius 140</span>
						<span class="vp-display-3">
							<VariableProximity
								text="balanced"
								radius={140}
								axes={[{ axis: 'wght', base: 400, peak: 900 }]}
							/>
						</span>
					</div>
					<div class="vp-card vp-card--centered vp-card--small">
						<span class="vp-radius-tag">radius 220</span>
						<span class="vp-display-3">
							<VariableProximity
								text="whole phrase"
								radius={220}
								axes={[{ axis: 'wght', base: 400, peak: 900 }]}
							/>
						</span>
					</div>
				</div>
			</section>

			<section class="vp-section">
				<h4>Long form · wght 400→700 · gentle radius 130</h4>
				<p class="vp-section__hint">
					On longer copy, a moderate weight range and a small radius keep the effect from
					overpowering the read. Hover to follow the cursor, line by line.
				</p>
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
			</section>
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
		gap: 24px;
	}
	.vp-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.vp-demo :global(code) {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.vp-section {
		display: grid;
		gap: 0.625rem;
	}
	.vp-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.vp-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.vp-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}
	.vp-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.vp-card--small {
		padding: 1.5rem 1rem;
		min-height: 130px;
		gap: 0.625rem;
	}
	.vp-card--centered {
		display: flex;
		flex-direction: column;
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
	.vp-display-2 {
		font-size: 1.65rem;
		font-weight: 700;
		line-height: 1.6;
	}
	.vp-display-3 {
		font-size: 1.35rem;
		font-weight: 700;
	}
	.vp-light {
		color: #f1f5f9;
	}
	.vp-radius-tag {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}
</style>
