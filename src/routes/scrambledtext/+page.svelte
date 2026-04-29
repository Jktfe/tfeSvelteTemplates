<script lang="ts">
	import ScrambledText from '$lib/components/ScrambledText.svelte';
</script>

<svelte:head>
	<title>ScrambledText · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🔀 ScrambledText</h1>
		<p class="lede">
			A glyph-shuffle reveal — every character starts as a random symbol from a pool, then settles
			to its final letter at a per-character settle time. Pure JS state machine on
			<code>requestAnimationFrame</code>, zero dependencies, and respectful of
			<code>prefers-reduced-motion</code>.
		</p>
	</header>

	<section class="demo">
		<h2>Hero word reveal</h2>
		<p class="hint">
			A long, deliberate scramble (<code>duration=2200ms</code>) on a single word inside a sentence.
			Default left-to-right order lands characters in reading order, so the eye trails the cipher.
		</p>
		<div class="card centered">
			<h2 class="headline">
				We
				<ScrambledText text="ENGINEER" duration={2200} class="accent" />
				outcomes, not features.
			</h2>
		</div>
	</section>

	<section class="demo">
		<h2>Hover-to-replay terminal label</h2>
		<p class="hint">
			<code>replayOnHover</code> rescrambles whenever the pointer enters. Pair it with a custom
			pool (<code>"01"</code>) for a binary-cipher feel — fits "decoded message" UX nicely.
		</p>
		<div class="card centered terminal">
			<span class="mono">
				<span class="prompt">$</span>
				<ScrambledText
					text="ACCESS GRANTED"
					duration={1400}
					pool="!@#$%01"
					order="random"
					replayOnHover
					class="terminal-out"
				/>
			</span>
			<span class="hint-inline">hover to rescramble</span>
		</div>
	</section>

	<section class="demo">
		<h2>Badge with scramble entrance</h2>
		<p class="hint">
			A small status pill — short text, fast settle (<code>duration=900ms</code>). The scramble
			lasts barely longer than a glance, but it draws the eye exactly when you want it.
		</p>
		<div class="card centered">
			<span class="badge">
				<ScrambledText text="LIVE" duration={900} pool="!*•–=+" />
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Sequenced one-shots</h2>
		<p class="hint">
			Three reveals chained with <code>delay</code>. Each runs once
			(<code>autoStart=&#123;true&#125;</code> by default), at staggered start times. Useful for
			hero entrances and intro sequences.
		</p>
		<div class="card centered staged">
			<span class="display-2">
				<ScrambledText text="Ready." duration={900} />
			</span>
			<span class="display-2">
				<ScrambledText text="Set." duration={900} delay={500} />
			</span>
			<span class="display-2">
				<ScrambledText text="Go." duration={900} delay={1000} />
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Random order, full duration</h2>
		<p class="hint">
			<code>order="random"</code> jitters each character into a random slot inside the duration
			window. Characters settle out of reading order — gives the cipher a more chaotic, mid-decryption
			vibe before snapping clean.
		</p>
		<div class="card centered dark">
			<span class="display-1 light">
				<ScrambledText text="STATUS: NOMINAL" duration={2400} order="random" />
			</span>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>One <code>requestAnimationFrame</code> loop, cleared on completion.</li>
			<li>Per-character settle times computed once up-front.</li>
			<li>Configurable pool (any string), defaults to A-Z + 0-9.</li>
			<li>Two reveal orders: <code>left-to-right</code> and <code>random</code>.</li>
			<li>Auto-start, replay-on-hover, or chain via <code>delay</code>.</li>
			<li>Spaces preserved &mdash; word boundaries stay readable mid-scramble.</li>
			<li>Honours <code>prefers-reduced-motion</code> &mdash; renders the final text immediately.</li>
			<li>Zero external dependencies.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import ScrambledText from '$lib/components/ScrambledText.svelte';
<` + `/script>

<ScrambledText text="Hello, world" />

<ScrambledText
  text="DECODED"
  duration={2000}
  order="random"
  pool="!@#$%^&01"
  replayOnHover />`}</code></pre>
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
	.hint-inline {
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.08em;
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
	.card.staged {
		gap: 0.5rem;
	}
	.card.dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.card.terminal {
		background: #020617;
		border-color: #0f172a;
	}
	.card.terminal .mono {
		font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
		font-size: 1.5rem;
		font-weight: 600;
		color: #22d3ee;
	}
	.card.terminal .prompt {
		color: #fbbf24;
		margin-right: 0.6rem;
	}
	.card.terminal :global(.terminal-out) {
		color: #34d399;
	}

	.headline {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.35;
	}
	.headline :global(.accent) {
		color: #4338ca;
	}

	.display-1 {
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.display-1.light {
		color: #f1f5f9;
	}
	.display-2 {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.badge {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: #fef3c7;
		color: #b45309;
		border-radius: 9999px;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.18em;
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
