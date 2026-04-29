<script lang="ts">
	import VariableProximity from '$lib/components/VariableProximity.svelte';
</script>

<svelte:head>
	<title>VariableProximity · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🧲 VariableProximity</h1>
		<p class="lede">
			A typography primitive that maps cursor distance onto variable-font axes per letter. Each
			glyph independently morphs along <code>wght</code>, <code>wdth</code>, <code>slnt</code>, or
			<code>opsz</code> as the pointer approaches it — the rest of the phrase stays at base. CSS
			transitions do all the easing, so the component costs nothing when the cursor isn't moving.
			Inspired by reactbits.dev's <em>Variable Proximity</em>, rebuilt as a portable Svelte 5
			component with zero dependencies.
		</p>
	</header>

	<section class="demo">
		<h2>Default — weight + width on hover</h2>
		<p class="hint">
			The out-of-the-box pairing: <code>wght 400→800</code> and <code>wdth 100→125</code>. Hover the
			phrase and watch the nearest letters thicken and stretch while the rest stay at their base
			weight. <code>radius=120</code>, <code>falloffCurve='quadratic'</code>.
		</p>
		<div class="card centered">
			<h2 class="headline">
				<VariableProximity text="Type that breathes." />
			</h2>
		</div>
	</section>

	<section class="demo">
		<h2>Slant-only — italic-on-approach</h2>
		<p class="hint">
			Sometimes you want emphasis without weight. Animate <code>slnt</code> alone, from upright (0°)
			to a strong lean (-12°). The phrase reads roman until the cursor lands on a word, which then
			gracefully italicises. Pairs beautifully with serif variable fonts.
		</p>
		<div class="card centered">
			<span class="display-2">
				<VariableProximity
					text="Lean in to read me."
					axes={[{ axis: 'slnt', base: 0, peak: -12 }]}
					radius={140}
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Width-axis — condensed to expanded</h2>
		<p class="hint">
			A wide range on the <code>wdth</code> axis (75 → 125) gives a dramatic
			condensed-to-expanded morph. <code>falloffCurve='gaussian'</code> narrows the bell so only the
			very-nearest letters expand fully — the effect feels like a magnifying glass over the prose.
		</p>
		<div class="card centered">
			<span class="display-1">
				<VariableProximity
					text="Stretch across the page"
					axes={[{ axis: 'wdth', base: 75, peak: 125 }]}
					radius={160}
					falloffCurve="gaussian"
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Multi-axis hero with optical sizing</h2>
		<p class="hint">
			Three axes simultaneously: <code>wght 350→900</code>, <code>wdth 100→130</code>, and
			<code>opsz 24→96</code>. Optical sizing thickens stems and tightens spacing as the glyph
			"grows" — exactly what a typeface designer does by hand for display sizes. A wider
			<code>radius=150</code> and a slow <code>transitionMs=200</code> give the morph a deliberate,
			premium feel.
		</p>
		<div class="card centered dark">
			<span class="display-1 light">
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

	<section class="demo">
		<h2>Multi-line poem at narrative pace</h2>
		<p class="hint">
			Longer text wraps naturally onto multiple lines. Each letter still measures its own bounding
			rect every frame, so the cursor's influence follows you through line breaks without losing
			alignment. A subtle <code>wght 400→700</code> shift keeps the effect quiet enough for prose.
		</p>
		<div class="card centered poem">
			<span class="display-2">
				<VariableProximity
					text="Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler."
					axes={[{ axis: 'wght', base: 400, peak: 700 }]}
					radius={130}
					transitionMs={180}
				/>
			</span>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>Per-letter morph along any combination of <code>wght</code>, <code>wdth</code>,
				<code>slnt</code>, <code>opsz</code> axes.</li>
			<li>Three falloff curves: <code>linear</code>, <code>quadratic</code> (default), <code>gaussian</code>.</li>
			<li>rAF-throttled pointer pipeline — one DOM-write pass per frame regardless of event flood.</li>
			<li>CSS does the easing via a <code>transition</code> on <code>font-variation-settings</code>.</li>
			<li>Capability-detected: gracefully degrades to static text on engines without variable-font support.</li>
			<li>Honours <code>prefers-reduced-motion</code> — disables the interactive path entirely.</li>
			<li>Keyboard parity: focus places a virtual cursor at the wrapper centre.</li>
			<li>Surrogate-pair safe split — emoji and combined glyphs render as single tokens.</li>
			<li>Zero external dependencies. ~12KB of inspectable Svelte.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import VariableProximity from '$lib/components/VariableProximity.svelte';
<` + `/script>

<!-- Default: weight + width on hover -->
<VariableProximity text="Type that breathes." />

<!-- Slant-only italic-on-approach -->
<VariableProximity
  text="Lean in to read me."
  axes={[{ axis: 'slnt', base: 0, peak: -12 }]}
  radius={140} />

<!-- Width-axis with gaussian magnifier -->
<VariableProximity
  text="Stretch across the page"
  axes={[{ axis: 'wdth', base: 75, peak: 125 }]}
  radius={160}
  falloffCurve="gaussian" />

<!-- Multi-axis hero -->
<VariableProximity
  text="Premium typography, on demand."
  axes={[
    { axis: 'wght', base: 350, peak: 900 },
    { axis: 'wdth', base: 100, peak: 130 },
    { axis: 'opsz', base: 24, peak: 96 }
  ]}
  radius={150}
  transitionMs={200} />`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 880px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #0f172a;
	}

	.page-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0 0 2rem;
		color: #475569;
		line-height: 1.6;
	}

	.demo {
		margin: 0 0 2.5rem;
	}
	.demo h2 {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}
	.hint {
		margin: 0 0 0.875rem;
		color: #64748b;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	.hint code,
	.demo code,
	.features code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 2.5rem 1.5rem;
	}
	.card.centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		min-height: 160px;
		text-align: center;
	}
	.card.dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.card.poem {
		min-height: 240px;
		padding: 3rem 2.5rem;
		line-height: 1.85;
	}

	.headline {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.45;
	}

	.display-1 {
		font-size: 2.25rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.5;
	}
	.display-1.light {
		color: #f1f5f9;
	}
	.display-2 {
		font-size: 1.65rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.6;
	}

	.features {
		margin: 2.5rem 0;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
	}
	.features h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.features ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #475569;
		line-height: 1.7;
	}

	.usage {
		margin-top: 2.5rem;
	}
	.usage h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.usage pre {
		margin: 0;
		padding: 1rem;
		background: #0f172a;
		color: #e2e8f0;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.8125rem;
		line-height: 1.6;
	}
</style>
