<script lang="ts">
	import PerspectiveGrid from '$lib/components/PerspectiveGrid.svelte';
</script>

<svelte:head>
	<title>PerspectiveGrid · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>PerspectiveGrid</h1>
		<p>
			Ambient 3D-perspective grid backdrop. Two infinite grid planes — floor and optional
			ceiling — tilted in real CSS 3D space via <code>transform-style: preserve-3d</code>, drifting
			toward the viewer through a single <code>background-position</code> keyframe. Synthwave / TRON
			/ arcade-tunnel energy. Pure CSS — no canvas, no WebGL, no rAF.
		</p>
	</header>

	<section class="demo">
		<h2>1. Synthwave tunnel — neon mode + ceiling</h2>
		<p class="caption">
			<strong>rush</strong> intensity + <strong>neon</strong> mode +
			<strong>ceiling</strong> on. Cyan floor, magenta ceiling, both with a soft drop-shadow glow.
			This is the full attack-screen / synthwave configuration.
		</p>
		<div class="frame frame-synthwave">
			<PerspectiveGrid intensity="rush" mode="neon" ceiling>
				<div class="hero-content">
					<div class="hero-eyebrow">A NICE TERMINAL</div>
					<h3 class="hero-title">Pure CSS, real geometry.</h3>
					<p class="hero-sub">No canvas. No WebGL. Just a tilted plane and a keyframe.</p>
				</div>
			</PerspectiveGrid>
		</div>
	</section>

	<section class="demo">
		<h2>2. Editorial — standard mono floor</h2>
		<p class="caption">
			<strong>standard</strong> intensity + <strong>mono</strong> mode, floor only. Readable
			motion, plain white grid, no glow. The default sensible-marketing-page configuration.
		</p>
		<div class="frame frame-editorial">
			<PerspectiveGrid intensity="standard" mode="mono">
				<div class="hero-content">
					<div class="hero-eyebrow">EDITORIAL</div>
					<h3 class="hero-title">Geometry, not gloss.</h3>
					<p class="hero-sub">A receding grid that doesn't try to win attention.</p>
				</div>
			</PerspectiveGrid>
		</div>
	</section>

	<section class="demo">
		<h2>3. Wireframe — calm + technical drawing</h2>
		<p class="caption">
			<strong>calm</strong> intensity + <strong>wireframe</strong> mode. Hairline 0.5px lines,
			low opacity, slow drift. Reads as architectural blueprint or technical-drawing data-vis
			background. Pair with monospaced type for a technical-doc landing page.
		</p>
		<div class="frame frame-blueprint">
			<PerspectiveGrid intensity="calm" mode="wireframe">
				<pre class="terminal">
$ pg --intensity=calm --mode=wireframe
&gt; tilting plane............... ok
&gt; tracing grid lines.......... ok
&gt; masking horizon............. ok
&gt; READY.
</pre>
			</PerspectiveGrid>
		</div>
	</section>

	<section class="demo">
		<h2>4. Three intensities, side-by-side</h2>
		<p class="caption">
			Same mode, different drift speeds. <strong>calm</strong> is meditative ambient;
			<strong>standard</strong> is the editorial default; <strong>rush</strong> pulls toward
			arcade-attack-screen energy.
		</p>
		<div class="grid">
			<div class="frame frame-card">
				<PerspectiveGrid intensity="calm" mode="mono">
					<div class="card-content">
						<h3>Calm</h3>
						<p>18s cycle<br />80px cell<br />0.35 line opacity</p>
					</div>
				</PerspectiveGrid>
			</div>
			<div class="frame frame-card">
				<PerspectiveGrid intensity="standard" mode="mono">
					<div class="card-content">
						<h3>Standard</h3>
						<p>9s cycle<br />60px cell<br />editorial default</p>
					</div>
				</PerspectiveGrid>
			</div>
			<div class="frame frame-card">
				<PerspectiveGrid intensity="rush" mode="mono">
					<div class="card-content">
						<h3>Rush</h3>
						<p>4s cycle<br />50px cell<br />arcade attack-screen</p>
					</div>
				</PerspectiveGrid>
			</div>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Three intensities</h3>
				<p>
					<code>calm</code> / <code>standard</code> / <code>rush</code> — bundle drift duration,
					cell size and line opacity so a single prop tunes everything proportionally.
				</p>
			</div>
			<div class="meta-card">
				<h3>Three modes</h3>
				<p>
					<code>mono</code> achromatic, <code>neon</code> cyan/magenta with drop-shadow glow,
					<code>wireframe</code> hairline + no glow.
				</p>
			</div>
			<div class="meta-card">
				<h3>Real CSS 3D</h3>
				<p>
					<code>perspective: 600px</code> + <code>transform-style: preserve-3d</code> on the
					stage; floor and ceiling are real planes tilted via <code>rotateX()</code>.
				</p>
			</div>
			<div class="meta-card">
				<h3>Periodic drift</h3>
				<p>
					Animation moves <code>background-position</code> by exactly one cell — naturally
					seamless loop, no JS modulo, no jitter.
				</p>
			</div>
			<div class="meta-card">
				<h3>Pure CSS</h3>
				<p>
					Zero <code>requestAnimationFrame</code>, zero canvas, zero
					<code>ResizeObserver</code>. One repeating-linear-gradient + one keyframe per plane.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion safe</h3>
				<p>
					Under <code>prefers-reduced-motion: reduce</code>, the keyframe is disabled both via JS
					and a CSS <code>@media</code> rule. The grid still renders — just statically.
				</p>
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
		background: linear-gradient(135deg, #ffffff, #c9c9d1, #6d6d7a);
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
		color: #c9c9d1;
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
		color: #c9c9d1;
		font-weight: 600;
	}

	/* Outer frame: provides border + radius + overflow clipping +
	   the visible background. The grid layer (transparent .pg-stage
	   inside PerspectiveGrid) renders on top of this background;
	   the slot content renders on top of the grid. */
	.frame {
		position: relative;
		border-radius: 16px;
		border: 1px solid #1f1f3a;
		overflow: hidden;
	}

	.frame-synthwave {
		background: radial-gradient(circle at 50% 80%, #2a0a3a, #050510 70%);
	}

	.frame-editorial {
		background: linear-gradient(180deg, #0d0d1a, #050510);
	}

	.frame-blueprint {
		background: linear-gradient(180deg, #061522, #02101c);
	}

	.frame-card {
		background: #050510;
	}

	.hero-content {
		position: relative;
		min-height: 320px;
		padding: 4rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-family: 'Inter', system-ui, sans-serif;
		pointer-events: none;
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: #c9c9d1;
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

	.terminal {
		position: relative;
		margin: 0;
		padding: 4rem 2rem;
		min-height: 280px;
		font-family: 'Fira Code', ui-monospace, monospace;
		font-size: 0.95rem;
		color: #8ce4ff;
		line-height: 1.6;
		text-align: left;
		text-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
		pointer-events: none;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.card-content {
		position: relative;
		min-height: 220px;
		padding: 2.5rem 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.card-content h3 {
		margin: 0 0 0.75rem;
		color: #c9c9d1;
		font-size: 1.25rem;
	}

	.card-content p {
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
		color: #c9c9d1;
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
		color: #c9c9d1;
	}
</style>
