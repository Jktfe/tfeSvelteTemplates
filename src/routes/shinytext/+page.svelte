<script lang="ts">
	import ShinyText from '$lib/components/ShinyText.svelte';
</script>

<svelte:head>
	<title>ShinyText · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>✨ ShinyText</h1>
		<p class="lede">
			A small typography primitive — wraps a string of text in a CSS gradient and animates a brighter
			highlight band sweeping through the letters. Pure CSS, zero JavaScript at runtime, GPU-composited,
			and respectful of <code>prefers-reduced-motion</code>.
		</p>
	</header>

	<section class="demo">
		<h2>Default — white shine on slate</h2>
		<p class="hint">
			Sensible defaults: white shine on slate-400 base, 3-second loop, sweeps left to right. Drop in
			anywhere with no configuration.
		</p>
		<div class="card centered">
			<span class="display-1"><ShinyText text="Premium" /></span>
		</div>
	</section>

	<section class="demo">
		<h2>Brand-coloured CTA</h2>
		<p class="hint">
			Pair the base colour with your text colour and the shine with a brand accent. Here:
			<code>baseColor=#475569</code>, <code>shineColor=#fbbf24</code>, <code>duration=2.5</code>.
		</p>
		<div class="card centered">
			<button class="cta hero">
				<ShinyText
					text="Get Started →"
					baseColor="#ffffff"
					shineColor="#fbbf24"
					duration={2.5}
				/>
			</button>
		</div>
	</section>

	<section class="demo">
		<h2>Two directions</h2>
		<p class="hint">
			<code>direction="lr"</code> sweeps left-to-right; <code>direction="rl"</code> sweeps the other
			way. Internally just <code>animation-direction: normal | reverse</code> — one keyframe block
			handles both.
		</p>
		<div class="card row direction-row">
			<div class="direction-cell">
				<span class="hint-label">lr</span>
				<span class="display-2">
					<ShinyText
						text="→"
						baseColor="#cbd5e1"
						shineColor="#0ea5e9"
						duration={1.6}
						direction="lr"
					/>
				</span>
			</div>
			<div class="direction-cell">
				<span class="hint-label">rl</span>
				<span class="display-2">
					<ShinyText
						text="←"
						baseColor="#cbd5e1"
						shineColor="#0ea5e9"
						duration={1.6}
						direction="rl"
					/>
				</span>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Hero headline</h2>
		<p class="hint">
			Highlight a single word inside a heading. <code>ShinyText</code> renders an inline-block span
			and inherits the surrounding font, so it slots into any layout.
		</p>
		<div class="card centered">
			<h2 class="headline">
				Build something
				<ShinyText
					text="extraordinary"
					baseColor="#1e293b"
					shineColor="#a78bfa"
					duration={3.5}
				/>
			</h2>
		</div>
	</section>

	<section class="demo">
		<h2>Premium gradient title</h2>
		<p class="hint">
			Custom colours on the dark background lend a lux, "watch the metal catch the light" feel.
			Slow duration (<code>4s</code>) keeps it from feeling busy.
		</p>
		<div class="card dark centered">
			<span class="display-1">
				<ShinyText
					text="Limited Edition"
					baseColor="#475569"
					shineColor="#fbbf24"
					duration={4}
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Badge shimmer</h2>
		<p class="hint">
			Smaller text works just as well — a tiny status pill catches the eye without shouting.
		</p>
		<div class="card centered">
			<span class="badge">
				<ShinyText
					text="NEW"
					baseColor="#0f172a"
					shineColor="#22d3ee"
					duration={2}
				/>
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>One-shot, with delay</h2>
		<p class="hint">
			<code>loop=&#123;false&#125;</code> runs the sweep exactly once and settles. Combine with a
			<code>delay</code> for sequenced entrance reveals.
		</p>
		<div class="card centered staged">
			<span class="display-2">
				<ShinyText text="Ready." baseColor="#1e293b" shineColor="#22d3ee" loop={false} duration={1.4} />
			</span>
			<span class="display-2">
				<ShinyText text="Set." baseColor="#1e293b" shineColor="#a78bfa" loop={false} duration={1.4} delay={0.4} />
			</span>
			<span class="display-2">
				<ShinyText text="Go." baseColor="#1e293b" shineColor="#fbbf24" loop={false} duration={1.4} delay={0.8} />
			</span>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>Pure CSS animation — no JS work after mount.</li>
			<li>Configurable base + shine colour (any CSS colour value).</li>
			<li>LR or RL direction without swapping keyframes.</li>
			<li>Loop or one-shot mode + optional start delay.</li>
			<li>Honours <code>prefers-reduced-motion</code> — animation suppressed, text rests in base colour.</li>
			<li>Inline-block span that inherits its parent font sizing.</li>
			<li>Zero external dependencies.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import ShinyText from '$lib/components/ShinyText.svelte';
<` + `/script>

<ShinyText text="Premium" />

<ShinyText
  text="Get Started →"
  shineColor="#fbbf24"
  baseColor="#475569"
  duration={2.5}
  direction="lr"
  loop={true} />`}</code></pre>
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
	.card.dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.card.centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
	}
	.card.row {
		display: flex;
		gap: 2rem;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}
	.card.staged {
		gap: 0.5rem;
	}

	.direction-row {
		justify-content: space-evenly;
	}
	.direction-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.hint-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.display-1 {
		font-size: 3rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.display-2 {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.headline {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.2;
	}

	.cta {
		padding: 0.625rem 1.25rem;
		font-size: 0.9375rem;
		font-weight: 500;
		border-radius: 0.5rem;
		cursor: pointer;
		border: none;
	}
	.cta.hero {
		background: linear-gradient(135deg, #4338ca 0%, #1e293b 100%);
		padding: 1rem 1.75rem;
		font-size: 1.125rem;
		font-weight: 600;
		box-shadow: 0 8px 24px rgba(67, 56, 202, 0.35);
	}

	.badge {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: #f1f5f9;
		border-radius: 9999px;
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.12em;
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
