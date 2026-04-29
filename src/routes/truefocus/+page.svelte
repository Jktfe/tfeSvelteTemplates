<script lang="ts">
	import TrueFocus from '$lib/components/TrueFocus.svelte';
</script>

<svelte:head>
	<title>TrueFocus · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🔦 TrueFocus</h1>
		<p class="lede">
			A typography emphasiser that draws attention to one word at a time inside a phrase. A single
			absolutely-positioned focus box morphs from word to word — sliding its position and resizing
			its width and height — so the highlight feels like a moving spotlight rather than a flicker
			of separate borders. Inspired by reactbits.dev's <em>True Focus</em>, rebuilt as a portable
			Svelte 5 component with zero dependencies.
		</p>
	</header>

	<section class="demo">
		<h2>Hero rotating-word headline</h2>
		<p class="hint">
			Default <code>sequential</code> order, <code>cycleDuration=1500ms</code>. Each word holds
			focus for 1.5s before the indigo box slides on. Hover the phrase to pause; click any word to
			pin it.
		</p>
		<div class="card centered">
			<h2 class="headline">
				<TrueFocus text="True focus on the present" />
			</h2>
		</div>
	</section>

	<section class="demo">
		<h2>Brand-coloured CTA, slow pace</h2>
		<p class="hint">
			<code>cycleDuration=1800ms</code> for a deliberate, savoured rhythm.
			<code>color="#a855f7"</code> tints both the border and the soft glow, matching brand
			accents.
		</p>
		<div class="card centered">
			<span class="display-2">
				<TrueFocus
					text="Build something extraordinary."
					cycleDuration={1800}
					color="#a855f7"
					glow={true}
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Random order, poetic emphasis</h2>
		<p class="hint">
			<code>order="random"</code> jumps the focus around instead of marching word-by-word. Useful
			when the phrase is more evocative than instructional — the eye lingers wherever the
			spotlight lands.
		</p>
		<div class="card centered dark">
			<span class="display-1 light">
				<TrueFocus
					text="The mind moves in many directions"
					order="random"
					cycleDuration={1200}
					color="#fbbf24"
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Manual pin — no autoStart</h2>
		<p class="hint">
			<code>autoStart=&#123;false&#125;</code> stops the cycle. Tab through the words and press
			<kbd>Enter</kbd> or <kbd>Space</kbd> to pin one — or just click. Click again to release. A
			useful pattern for interactive prose where readers control emphasis themselves.
		</p>
		<div class="card centered">
			<span class="display-2">
				<TrueFocus text="Pin a word with click or Enter" autoStart={false} color="#0ea5e9" />
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Multi-line poem at reading pace</h2>
		<p class="hint">
			Longer text, <code>cycleDuration=900ms</code> — about the speed a reader's eye dwells on a
			word. The focus box re-measures on wrap, so as the layout reflows, the indicator stays glued
			to the right word. A <code>ResizeObserver</code> handles the heavy lifting.
		</p>
		<div class="card centered poem">
			<span class="display-2">
				<TrueFocus
					text="Two roads diverged in a yellow wood and sorry I could not travel both"
					cycleDuration={900}
					color="#16a34a"
					paddingX={6}
					paddingY={3}
				/>
			</span>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>Single morphing focus box — no per-word borders, no DOM duplication.</li>
			<li>Configurable cycle pace via <code>cycleDuration</code>.</li>
			<li>Two cycle orders: <code>sequential</code> (reading flow) and <code>random</code>.</li>
			<li>Hover-to-pause and click-to-pin (<kbd>Enter</kbd>/<kbd>Space</kbd> for keyboard).</li>
			<li>Re-measures on layout change via <code>ResizeObserver</code>.</li>
			<li>Honours <code>prefers-reduced-motion</code> — disables the morph transition.</li>
			<li>Configurable colour and optional glow halo.</li>
			<li>Zero external dependencies.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import TrueFocus from '$lib/components/TrueFocus.svelte';
<` + `/script>

<TrueFocus text="True focus on the present" />

<TrueFocus
  text="Build something extraordinary."
  cycleDuration={1800}
  color="#a855f7"
  glow={true} />

<TrueFocus
  text="The mind moves in many directions"
  order="random"
  cycleDuration={1200} />

<TrueFocus text="Pin a word with click or Enter" autoStart={false} />`}</code></pre>
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
	kbd {
		display: inline-block;
		padding: 0.05rem 0.4rem;
		background: #f1f5f9;
		border: 1px solid #cbd5e1;
		border-bottom-width: 2px;
		border-radius: 0.25rem;
		font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
		font-size: 0.75rem;
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
		min-height: 220px;
		padding: 3rem 2.5rem;
		line-height: 1.8;
	}

	.headline {
		margin: 0;
		font-size: 1.85rem;
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
