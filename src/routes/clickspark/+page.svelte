<script lang="ts">
	import ClickSpark from '$lib/components/ClickSpark.svelte';

	// Live counter so visitors can see that clicks still propagate
	// to the wrapped child even though sparks are firing on top.
	let primaryClicks = $state(0);
	let likeCount = $state(48);
	let liked = $state(false);

	function handleLike() {
		liked = !liked;
		likeCount += liked ? 1 : -1;
	}
</script>

<svelte:head>
	<title>ClickSpark · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>💥 ClickSpark</h1>
		<p class="lede">
			Wrap any element. Every click sprays a configurable burst of particles outward from the
			click point. Pure CSS keyframes, no rAF loop. Multiple rapid clicks compose into independent
			bursts that self-clean. Reduced-motion preference suppresses the burst entirely while keeping
			the wrapped child fully interactive.
		</p>
	</header>

	<section class="demo">
		<h2>Default — try it</h2>
		<p class="hint">
			8 white dots, 60px spread, 500ms. The button below counts real clicks — sparks are
			decorative, the click semantics are untouched.
		</p>
		<div class="card centered">
			<ClickSpark>
				<button class="cta primary" onclick={() => primaryClicks++}>
					Click me · {primaryClicks}
				</button>
			</ClickSpark>
		</div>
	</section>

	<section class="demo">
		<h2>Four spark shapes</h2>
		<p class="hint">
			Pick a shape that matches your product's tone. <code>dot</code> is universal,
			<code>plus</code> feels mechanical / playful, <code>line</code> reads as motion lines, and
			<code>star</code> is festive.
		</p>
		<div class="card row">
			<ClickSpark sparkColor="#ffffff" shape="dot">
				<button class="cta dark">dot</button>
			</ClickSpark>
			<ClickSpark sparkColor="#22d3ee" shape="plus" sparkCount={10}>
				<button class="cta dark">plus</button>
			</ClickSpark>
			<ClickSpark sparkColor="#f97316" shape="line" sparkCount={12} sparkSize={14}>
				<button class="cta dark">line</button>
			</ClickSpark>
			<ClickSpark sparkColor="#fbbf24" shape="star" sparkCount={6} sparkSize={14}>
				<button class="cta dark">star</button>
			</ClickSpark>
		</div>
	</section>

	<section class="demo">
		<h2>Bigger, slower bursts</h2>
		<p class="hint">
			Generous spread + longer duration suit hero CTAs. <code>spreadRadius=120</code>,
			<code>duration=900</code>, <code>sparkSize=14</code>.
		</p>
		<div class="card centered">
			<ClickSpark
				sparkColor="#a78bfa"
				sparkCount={14}
				sparkSize={14}
				spreadRadius={120}
				duration={900}
			>
				<button class="cta hero">Get started →</button>
			</ClickSpark>
		</div>
	</section>

	<section class="demo">
		<h2>Wrapping a like button</h2>
		<p class="hint">
			A real piece of UI — toggle the heart on/off. Sparks only spray when the click runs (i.e.
			both directions), so the burst feels like part of the interaction, not noise.
		</p>
		<div class="card centered">
			<ClickSpark sparkColor="#f43f5e" shape="star" sparkCount={10} spreadRadius={70} duration={650}>
				<button class="like-btn" class:liked onclick={handleLike} aria-pressed={liked}>
					<span class="heart" aria-hidden="true">{liked ? '♥' : '♡'}</span>
					<span class="count">{likeCount}</span>
				</button>
			</ClickSpark>
		</div>
	</section>

	<section class="demo">
		<h2>Wrapping a card</h2>
		<p class="hint">
			The wrapper is <code>display: inline-block</code>, so it picks up the child's footprint. Click
			anywhere inside the card — sparks fire from the click point, not the centre.
		</p>
		<div class="card">
			<ClickSpark sparkColor="#10b981" shape="dot" sparkCount={12} spreadRadius={90} duration={650}>
				<article class="feature-card">
					<h3>Click anywhere inside this card</h3>
					<p>
						The burst origin tracks the cursor — try clicking the corners, the heading, or the
						body text and you'll see the sparks spray from exactly that point.
					</p>
				</article>
			</ClickSpark>
		</div>
	</section>

	<section class="demo">
		<h2>Composing rapid clicks</h2>
		<p class="hint">
			Each click spawns an independent burst. Click as fast as you can — bursts overlap without
			colliding. No global state, no rAF loop, no debounce.
		</p>
		<div class="card centered">
			<ClickSpark sparkColor="#0ea5e9" shape="dot" sparkCount={8}>
				<button class="cta primary">Spam me</button>
			</ClickSpark>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>Wrap-anything API — works with buttons, links, cards, images.</li>
			<li>Four CSS-only spark shapes: dot, plus, line, star.</li>
			<li>Multiple bursts compose without state churn.</li>
			<li>Pure CSS keyframes — no rAF loop, no spring physics.</li>
			<li>Honours <code>prefers-reduced-motion</code> — burst suppressed entirely.</li>
			<li>Wrapped child keeps native role / focus / click semantics.</li>
			<li>Zero external dependencies.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import ClickSpark from '$lib/components/ClickSpark.svelte';
<` + `/script>

<ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
  <button>Try the demo</button>
</ClickSpark>`}</code></pre>
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
	.features code,
	.usage code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 2rem 1.5rem;
	}
	.card.centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 140px;
	}
	.card.row {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.cta {
		padding: 0.625rem 1.25rem;
		font-size: 0.9375rem;
		font-weight: 500;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: transform 120ms ease;
	}
	.cta:active {
		transform: scale(0.97);
	}

	.cta.primary {
		background: #6366f1;
		color: white;
		border: 1px solid #4f46e5;
	}
	.cta.primary:hover {
		background: #4f46e5;
	}

	.cta.dark {
		background: #1e293b;
		color: white;
		border: 1px solid #0f172a;
		min-width: 80px;
	}
	.cta.dark:hover {
		background: #0f172a;
	}

	.cta.hero {
		background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
		color: white;
		border: none;
		padding: 0.875rem 1.75rem;
		font-size: 1rem;
		font-weight: 600;
		box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
	}
	.cta.hero:hover {
		box-shadow: 0 8px 28px rgba(124, 58, 237, 0.45);
	}

	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-weight: 500;
		background: #fff;
		color: #475569;
		border: 1px solid #e2e8f0;
		border-radius: 9999px;
		cursor: pointer;
		transition:
			color 200ms ease,
			border-color 200ms ease,
			background 200ms ease;
	}
	.like-btn .heart {
		font-size: 1.25rem;
		line-height: 1;
	}
	.like-btn:hover {
		color: #f43f5e;
		border-color: #fecdd3;
	}
	.like-btn.liked {
		color: #f43f5e;
		background: #fff1f2;
		border-color: #fecdd3;
	}

	.feature-card {
		min-width: 320px;
		max-width: 460px;
		padding: 1.25rem;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		background: #f8fafc;
		cursor: pointer;
	}
	.feature-card h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: #0f172a;
	}
	.feature-card p {
		margin: 0;
		color: #475569;
		font-size: 0.875rem;
		line-height: 1.55;
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
