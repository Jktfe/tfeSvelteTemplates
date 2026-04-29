<script lang="ts">
	import PixelTrail from '$lib/components/PixelTrail.svelte';
</script>

<svelte:head>
	<title>PixelTrail · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>PixelTrail</h1>
		<p>
			Cursor-tracked decaying pixel trail. Mousemove spawns small <code>&lt;span&gt;</code>s that fade
			+ scale + drift on a CSS keyframe and self-clean on a per-pixel <code>setTimeout</code>. Distance-throttled
			spawn keeps trail density consistent at any cursor speed. Pure CSS — no rAF, no resize observer.
		</p>
	</header>

	<section class="demo">
		<h2>1. Hero crackle — mono-white on dark canvas</h2>
		<p class="caption">
			Hover anywhere on the panel. The default <strong>medium</strong> size with <strong>mono-white</strong>
			palette gives the cleanest editorial trail — pairs well with dark hero canvases.
		</p>
		<PixelTrail size="medium" palette="mono-white" trailLength={20}>
			<div class="stage stage-hero">
				<div class="hero-content">
					<div class="hero-eyebrow">A NICE TERMINAL</div>
					<h3 class="hero-title">Move the cursor.</h3>
					<p class="hero-sub">Pixels follow you, then fade.</p>
				</div>
			</div>
		</PixelTrail>
	</section>

	<section class="demo">
		<h2>2. Cyber-cyan terminal panel</h2>
		<p class="caption">
			<strong>cyber-cyan</strong> palette + <strong>small</strong> size with a 32-pixel cap gives a
			dense neon trail. Sci-fi UI panels and console hero blocks lean on this combo.
		</p>
		<PixelTrail size="small" palette="cyber-cyan" trailLength={32} duration={900}>
			<div class="stage stage-cyber">
				<pre class="terminal">
$ ant deploy --target=mainnet
✓ build:    16.4s
✓ tests:    1.9s   1877/1877
✓ lint:     0.6s   0 errors
✓ release:  v2.4.0
</pre>
			</div>
		</PixelTrail>
	</section>

	<section class="demo">
		<h2>3. Sunset-warm marketing strip</h2>
		<p class="caption">
			<strong>sunset-warm</strong> palette cycles yellow → orange → pink as you drag. Pair
			<strong>large</strong> size + a longer duration for a luxurious, elastic trail.
		</p>
		<PixelTrail size="large" palette="sunset-warm" trailLength={16} duration={1100}>
			<div class="stage stage-warm">
				<div class="warm-content">
					<div class="warm-tag">SUMMER · 26</div>
					<h3 class="warm-title">Glide through golden hour.</h3>
				</div>
			</div>
		</PixelTrail>
	</section>

	<section class="demo">
		<h2>4. Three sizes, side-by-side</h2>
		<p class="caption">
			Same palette, different grain. <strong>Small</strong> is densely-stippled;
			<strong>medium</strong> is the editorial default; <strong>large</strong> reads chunky and
			arcade.
		</p>
		<div class="grid">
			<PixelTrail size="small" palette="cyber-cyan" trailLength={20}>
				<div class="card-stage">
					<h3>Small</h3>
					<p>4px pixels<br />6px throttle<br />densely stippled</p>
				</div>
			</PixelTrail>
			<PixelTrail size="medium" palette="cyber-cyan" trailLength={20}>
				<div class="card-stage">
					<h3>Medium</h3>
					<p>8px pixels<br />10px throttle<br />editorial default</p>
				</div>
			</PixelTrail>
			<PixelTrail size="large" palette="cyber-cyan" trailLength={20}>
				<div class="card-stage">
					<h3>Large</h3>
					<p>16px pixels<br />18px throttle<br />arcade chunky</p>
				</div>
			</PixelTrail>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Three sizes</h3>
				<p><code>small</code> / <code>medium</code> / <code>large</code> — bundle pixel size + spawn-distance threshold so density and grain scale together.</p>
			</div>
			<div class="meta-card">
				<h3>Three palettes</h3>
				<p><code>mono-white</code>, <code>cyber-cyan</code>, <code>sunset-warm</code>. Each cycles a 3-colour set with a coordinated halo.</p>
			</div>
			<div class="meta-card">
				<h3>Distance-throttled</h3>
				<p>One pixel per ~<code>throttlePx</code> units of cursor travel. Slow drags don't pile pixels; fast flicks don't leave gaps.</p>
			</div>
			<div class="meta-card">
				<h3>Self-cleaning</h3>
				<p>Each pixel registers its own <code>setTimeout</code>; no global cleanup loop. FIFO eviction caps the live count at <code>trailLength</code>.</p>
			</div>
			<div class="meta-card">
				<h3>Pure CSS animation</h3>
				<p>Single <code>@keyframes</code> drives fade + scale + drift. No <code>requestAnimationFrame</code>, no resize observer, no per-frame JS.</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion safe</h3>
				<p>Under <code>prefers-reduced-motion: reduce</code>, the move handler short-circuits before allocating; CSS hides any stray pixel as belt-and-braces.</p>
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		color: #e6e6e6;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin: 0 0 0.5rem;
		background: linear-gradient(135deg, #ffffff, #00bfff, #ff3d6e);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hero p {
		font-size: 1.125rem;
		line-height: 1.6;
		max-width: 720px;
		color: #a8a8b8;
	}

	.hero code {
		background: #1a1a2e;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
		color: #00bfff;
	}

	.demo {
		margin-bottom: 4rem;
	}

	.demo h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
		color: #fff;
	}

	.caption {
		color: #8c8c9c;
		font-size: 0.95rem;
		margin: 0 0 1.5rem;
		line-height: 1.6;
	}

	.caption strong {
		color: #00bfff;
		font-weight: 600;
	}

	.stage {
		background: #0a0a14;
		border: 1px solid #1f1f3a;
		border-radius: 16px;
		padding: 4rem 2rem;
		min-height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.stage-hero {
		background: radial-gradient(circle at 30% 50%, #181830, #0a0a14 70%);
	}

	.hero-content {
		text-align: center;
		font-family: 'Inter', system-ui, sans-serif;
		pointer-events: none;
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: #6c6c8c;
		margin-bottom: 0.75rem;
	}

	.hero-title {
		font-size: clamp(2rem, 4vw, 3rem);
		margin: 0;
		color: #ffffff;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.hero-sub {
		margin: 0.5rem 0 0;
		color: #a8a8b8;
		font-size: 1rem;
	}

	.stage-cyber {
		background: linear-gradient(135deg, #051d2e, #02101c);
		font-family: 'Fira Code', ui-monospace, monospace;
	}

	.terminal {
		margin: 0;
		font-size: 0.95rem;
		color: #8ce4ff;
		line-height: 1.6;
		text-align: left;
		text-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
		pointer-events: none;
	}

	.stage-warm {
		background: linear-gradient(135deg, #2a1a00, #4a0a2a);
	}

	.warm-content {
		text-align: center;
		pointer-events: none;
	}

	.warm-tag {
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: #ffb87a;
		margin-bottom: 0.75rem;
	}

	.warm-title {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.75rem);
		color: #ffea00;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.card-stage {
		background: #0a0a14;
		border: 1px solid #1f1f3a;
		border-radius: 16px;
		padding: 2.5rem 1.5rem;
		min-height: 200px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.card-stage h3 {
		margin: 0 0 0.75rem;
		color: #00bfff;
		font-size: 1.25rem;
	}

	.card-stage p {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.6;
		color: #8c8c9c;
		font-family: 'Fira Code', monospace;
	}

	.meta {
		margin-top: 5rem;
		border-top: 1px solid #1f1f3a;
		padding-top: 3rem;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.meta-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.meta-card h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
		color: #00bfff;
	}

	.meta-card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #a8a8b8;
	}

	.meta-card code {
		background: #1a1a2e;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
		color: #00f0ff;
	}
</style>
