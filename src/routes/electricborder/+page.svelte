<script lang="ts">
	import ElectricBorder from '$lib/components/ElectricBorder.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<svelte:head>
	<title>ElectricBorder · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>ElectricBorder</h1>
		<p>
			Animated electric-arc border. SVG <code>feTurbulence</code> + <code>feDisplacementMap</code>
			distort a stroked rectangle, with <code>&lt;animate&gt;</code> driving the turbulence frequency
			for a live crackling motion. Pure SVG + CSS — zero deps, no rAF loop, GPU-accelerated.
		</p>
	</header>

	<section class="demo">
		<h2>1. Sci-fi hologram panel</h2>
		<p class="caption">Lightning intensity, plasma-purple palette. Composes with Tilt3D for the full sci-fi UI feel.</p>
		<div class="stage stage-hologram">
			<Tilt3D maxTilt={14}>
				<ElectricBorder intensity="lightning" palette="plasma-purple" radius={20}>
					<article class="hologram-panel">
						<div class="hologram-icon">◈</div>
						<h3>SYSTEM ONLINE</h3>
						<dl>
							<dt>Reactor</dt><dd>97.4%</dd>
							<dt>Coolant</dt><dd>nominal</dd>
							<dt>Throughput</dt><dd>2.1 TFLOPS</dd>
						</dl>
					</article>
				</ElectricBorder>
			</Tilt3D>
		</div>
	</section>

	<section class="demo">
		<h2>2. Charge-up CTA buttons</h2>
		<p class="caption">Crackling intensity on pill-shaped buttons. Each palette has a distinct vibe — pick the one that matches the action.</p>
		<div class="stage stage-cta">
			<ElectricBorder intensity="crackling" palette="electric-blue" radius={28}>
				<button class="cta-btn cta-blue" type="button">⚡ Activate</button>
			</ElectricBorder>
			<ElectricBorder intensity="crackling" palette="volt-yellow" radius={28}>
				<button class="cta-btn cta-yellow" type="button">⚡ Charge up</button>
			</ElectricBorder>
			<ElectricBorder intensity="crackling" palette="plasma-purple" radius={28}>
				<button class="cta-btn cta-purple" type="button">⚡ Engage</button>
			</ElectricBorder>
		</div>
	</section>

	<section class="demo">
		<h2>3. Live-status pills</h2>
		<p class="caption">Mild intensity on tightly-rounded pills — a subtle ambient crackle conveying "active" or "live".</p>
		<div class="stage stage-pills">
			<ElectricBorder intensity="mild" palette="electric-blue" radius={999}>
				<span class="status-pill">⚡ LIVE</span>
			</ElectricBorder>
			<ElectricBorder intensity="mild" palette="volt-yellow" radius={999}>
				<span class="status-pill">⚡ STREAMING</span>
			</ElectricBorder>
			<ElectricBorder intensity="mild" palette="plasma-purple" radius={999}>
				<span class="status-pill">⚡ RECORDING</span>
			</ElectricBorder>
		</div>
	</section>

	<section class="demo">
		<h2>4. Three intensities, side-by-side</h2>
		<p class="caption">Same palette, different intensities. <strong>Mild</strong> is calm-ambient; <strong>crackling</strong> is the default; <strong>lightning</strong> is the full Tesla-coil discharge.</p>
		<div class="stage stage-intensities">
			<ElectricBorder intensity="mild" palette="electric-blue" radius={16}>
				<div class="intensity-card">
					<h3>Mild</h3>
					<p>0.015 frequency<br />3px distortion<br />5s cycle<br />4px halo</p>
				</div>
			</ElectricBorder>
			<ElectricBorder intensity="crackling" palette="electric-blue" radius={16}>
				<div class="intensity-card">
					<h3>Crackling</h3>
					<p>0.030 frequency<br />6px distortion<br />3s cycle<br />8px halo</p>
				</div>
			</ElectricBorder>
			<ElectricBorder intensity="lightning" palette="electric-blue" radius={16}>
				<div class="intensity-card">
					<h3>Lightning</h3>
					<p>0.060 frequency<br />12px distortion<br />1.5s cycle<br />14px halo</p>
				</div>
			</ElectricBorder>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Three intensities</h3>
				<p><code>mild</code>, <code>crackling</code>, <code>lightning</code> — each tunes turbulence frequency, distortion scale, animation speed, stroke width, and glow blur.</p>
			</div>
			<div class="meta-card">
				<h3>Three palettes</h3>
				<p><code>electric-blue</code>, <code>plasma-purple</code>, <code>volt-yellow</code>. Each pairs a stroke colour with a coordinated glow halo for the unified arc-discharge look.</p>
			</div>
			<div class="meta-card">
				<h3>Pure SVG-filter math</h3>
				<p>No canvas, no WebGL, no rAF. The browser's <code>&lt;animate&gt;</code> drives turbulence frequency on the GPU. Zero per-frame JS work.</p>
			</div>
			<div class="meta-card">
				<h3>Per-instance filter IDs</h3>
				<p>Module-scoped counter via <code>nextFilterId()</code> means N ElectricBorder instances on the same page each get a unique <code>&lt;filter id&gt;</code> with no collisions.</p>
			</div>
			<div class="meta-card">
				<h3>Composes with Tilt3D</h3>
				<p>Tilt3D handles 3D rotation, ElectricBorder handles ambient perimeter crackle. Together they give the full sci-fi-UI-panel feel.</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion safe</h3>
				<p>Under <code>prefers-reduced-motion: reduce</code>, the <code>&lt;animate&gt;</code> is removed, displacement scale falls to zero, and the halo shrinks. Still visible, just calm.</p>
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
		background: linear-gradient(135deg, #00bfff, #c77dff, #ffea00);
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
		color: #c77dff;
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
		color: #c77dff;
		font-weight: 600;
	}

	.stage {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 16px;
		padding: 3rem 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.stage-hologram {
		min-height: 360px;
		background: radial-gradient(circle at 50% 40%, #1a1a3e, #0d0d1a 60%);
	}

	.hologram-panel {
		background: rgba(15, 15, 35, 0.85);
		padding: 1.5rem 2rem;
		border-radius: 16px;
		min-width: 260px;
		font-family: 'Fira Code', monospace;
		color: #c77dff;
	}

	.hologram-icon {
		font-size: 2rem;
		text-align: center;
		margin-bottom: 0.5rem;
		color: #ff00ff;
		text-shadow: 0 0 10px #ff00ff;
	}

	.hologram-panel h3 {
		text-align: center;
		font-size: 1rem;
		letter-spacing: 0.2em;
		margin: 0 0 1.5rem;
		color: #fff;
	}

	.hologram-panel dl {
		margin: 0;
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.4rem 1.5rem;
		font-size: 0.875rem;
	}

	.hologram-panel dt {
		color: #6c6c8c;
	}

	.hologram-panel dd {
		margin: 0;
		text-align: right;
		color: #c77dff;
	}

	.cta-btn {
		font-size: 1rem;
		font-weight: 700;
		padding: 0.85rem 1.75rem;
		border: none;
		border-radius: 28px;
		cursor: pointer;
		font-family: inherit;
		letter-spacing: 0.05em;
		transition: transform 150ms ease;
	}

	.cta-btn:hover {
		transform: translateY(-2px);
	}

	.cta-blue {
		background: #051d2e;
		color: #00bfff;
	}

	.cta-yellow {
		background: #2a2200;
		color: #ffea00;
	}

	.cta-purple {
		background: #1a0a2e;
		color: #c77dff;
	}

	.status-pill {
		font-size: 0.875rem;
		font-weight: 700;
		padding: 0.5rem 1.25rem;
		background: #0a0a1a;
		color: #fff;
		display: inline-block;
		letter-spacing: 0.1em;
	}

	.intensity-card {
		background: #0a0a1a;
		padding: 1.5rem 1.75rem;
		border-radius: 16px;
		min-width: 180px;
		text-align: center;
	}

	.intensity-card h3 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: #00bfff;
	}

	.intensity-card p {
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
		color: #c77dff;
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
		color: #00bfff;
	}
</style>
