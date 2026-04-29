<script lang="ts">
	import EqualizerBars from '$lib/components/EqualizerBars.svelte';
</script>

<svelte:head>
	<title>EqualizerBars · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>EqualizerBars</h1>
		<p>
			A compact "things are alive" indicator. N vertical bars oscillating in concert via phased CSS
			keyframes — looks like an audio spectrum analyser frozen in motion. Decorative only; pure
			CSS; <code>transform: scaleY()</code> on the GPU. Each bar shares one keyframe but starts at a
			different point via negative <code>animation-delay</code>, so the wave is an illusion built
			from N independent CSS clocks.
		</p>
	</header>

	<section class="demo">
		<h2>1. The four variants</h2>
		<p class="caption">
			Each variant is a distinct rhythm — not a colour swap. Same speed, same bar count, different
			keyframe.
		</p>
		<div class="variant-grid">
			<div class="variant-card">
				<div class="variant-vis"><EqualizerBars variant="equalizer" bars={16} height={96} color="#38bdf8" /></div>
				<h3>equalizer</h3>
				<p>Smooth sine, ease-in-out alternate. Classic music-app meter.</p>
			</div>
			<div class="variant-card">
				<div class="variant-vis"><EqualizerBars variant="spectrum" bars={16} height={96} color="#a78bfa" /></div>
				<h3>spectrum</h3>
				<p>Peak-biased FFT shape. Cubic bezier easing.</p>
			</div>
			<div class="variant-card">
				<div class="variant-vis"><EqualizerBars variant="pulse" bars={16} height={96} color="#10b981" /></div>
				<h3>pulse</h3>
				<p>Binary high/low via <code>steps(2)</code>. Heartbeat-monitor cadence.</p>
			</div>
			<div class="variant-card">
				<div class="variant-vis"><EqualizerBars variant="heartbeat" bars={16} height={96} color="#ff3a6e" /></div>
				<h3>heartbeat</h3>
				<p>Sparse double-spike with long tail. EKG / vitals.</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>2. Streaming-now badge — small + currentColor</h2>
		<p class="caption">
			Tucked next to a title; <code>color="auto"</code> picks up <code>currentColor</code> from the
			parent. The indicator says "live" without competing with the headline.
		</p>
		<div class="badge-row">
			<div class="badge">
				<span class="badge-dot" style="color: #10b981;">
					<EqualizerBars variant="pulse" bars={4} height={16} speed={1.4} color="auto" />
				</span>
				<span>LIVE — Operations dashboard</span>
			</div>
			<div class="badge">
				<span class="badge-dot" style="color: #38bdf8;">
					<EqualizerBars variant="equalizer" bars={5} height={16} speed={1.6} color="auto" />
				</span>
				<span>Agent thinking</span>
			</div>
			<div class="badge">
				<span class="badge-dot" style="color: #ff3a6e;">
					<EqualizerBars variant="heartbeat" bars={4} height={16} speed={1.2} color="auto" />
				</span>
				<span>Patient monitor — bay 4</span>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>3. Speed sweep — same variant, different cadence</h2>
		<p class="caption">
			<code>speed</code> is clamped to <code>[0.25, 4]</code>. The cycle duration scales inversely
			— at <code>4×</code> the meter is twitchy; at <code>0.25×</code> it's almost meditative.
		</p>
		<div class="speed-grid">
			<div class="speed-card">
				<EqualizerBars variant="spectrum" bars={20} height={80} speed={0.25} color="#94a3b8" />
				<h3>0.25×</h3>
				<p>4.8s cycle — meditative</p>
			</div>
			<div class="speed-card">
				<EqualizerBars variant="spectrum" bars={20} height={80} speed={1} color="#a78bfa" />
				<h3>1× (default)</h3>
				<p>1.2s cycle</p>
			</div>
			<div class="speed-card">
				<EqualizerBars variant="spectrum" bars={20} height={80} speed={4} color="#f472b6" />
				<h3>4×</h3>
				<p>0.3s cycle — twitchy</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>4. Inactive state — frozen silhouette</h2>
		<p class="caption">
			With <code>active={false}</code> the bars freeze at deterministic seeded heights. Same
			<code>seed</code> always produces the same silhouette — SSR-stable. Use this for "ready when
			you are" empty states.
		</p>
		<div class="speed-grid">
			<div class="speed-card">
				<EqualizerBars active={false} bars={24} height={80} seed={1} color="#64748b" />
				<h3>seed = 1</h3>
				<p>Frozen, deterministic</p>
			</div>
			<div class="speed-card">
				<EqualizerBars active={false} bars={24} height={80} seed={42} color="#64748b" />
				<h3>seed = 42</h3>
				<p>Different silhouette</p>
			</div>
			<div class="speed-card">
				<EqualizerBars active={false} bars={24} height={80} seed={1337} color="#64748b" />
				<h3>seed = 1337</h3>
				<p>Different again</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>5. Density sweep — 4 bars to 48 bars</h2>
		<p class="caption">
			Bar count clamped to <code>[1, 64]</code>. Stagger-step (9% of base duration) is small enough
			that no two adjacent bars phase-lock even at <code>bars=64</code>.
		</p>
		<div class="density-stack">
			<div class="density-row">
				<span class="density-label">4</span>
				<EqualizerBars variant="equalizer" bars={4} height={48} color="#38bdf8" />
			</div>
			<div class="density-row">
				<span class="density-label">12</span>
				<EqualizerBars variant="equalizer" bars={12} height={48} color="#38bdf8" />
			</div>
			<div class="density-row">
				<span class="density-label">24</span>
				<EqualizerBars variant="equalizer" bars={24} height={48} color="#38bdf8" />
			</div>
			<div class="density-row">
				<span class="density-label">48</span>
				<EqualizerBars variant="equalizer" bars={48} height={48} color="#38bdf8" />
			</div>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Four variants</h3>
				<p>
					<code>equalizer</code> / <code>spectrum</code> / <code>pulse</code> /
					<code>heartbeat</code>. Each is a distinct keyframe shape — peak-biased, binary,
					double-spike, smooth sine.
				</p>
			</div>
			<div class="meta-card">
				<h3>Phase-stagger illusion</h3>
				<p>
					Negative <code>animation-delay</code> per bar. N independent CSS clocks rendering as one
					travelling wave with zero JS.
				</p>
			</div>
			<div class="meta-card">
				<h3>Pure CSS</h3>
				<p>
					Zero <code>requestAnimationFrame</code>, zero canvas, zero <code>ResizeObserver</code>.
					GPU-composited <code>transform: scaleY()</code>.
				</p>
			</div>
			<div class="meta-card">
				<h3>Seeded inactive state</h3>
				<p>
					<code>seededHeights(count, seed)</code> uses a mulberry32-derived LCG. Same input →
					same output. SSR-stable.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion safe</h3>
				<p>
					JS probe in <code>onMount</code> + CSS <code>@media</code> fallback. Bars freeze at
					seeded silhouette — the indicator still reads, just without motion.
				</p>
			</div>
			<div class="meta-card">
				<h3>Decorative-only</h3>
				<p>
					<code>role="img"</code> + configurable <code>aria-label</code>. Bars are
					<code>aria-hidden</code>. No focus, no value, no real audio.
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

	.hero code,
	.caption code,
	.meta-card code,
	.variant-card code {
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

	.variant-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.variant-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
	}

	.variant-vis {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		min-height: 100px;
		margin-bottom: 1rem;
	}

	.variant-card h3 {
		margin: 0 0 0.25rem;
		font-family: 'Fira Code', monospace;
		font-size: 0.95rem;
		color: #c9c9d1;
	}

	.variant-card p {
		margin: 0;
		font-size: 0.85rem;
		color: #8c8c9c;
		line-height: 1.5;
	}

	.badge-row {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0.9rem;
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 999px;
		font-size: 0.95rem;
		color: #e6e6e6;
		width: fit-content;
	}

	.badge-dot {
		display: inline-flex;
		align-items: center;
	}

	.speed-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.speed-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.speed-card h3 {
		margin: 0;
		font-family: 'Fira Code', monospace;
		font-size: 1rem;
		color: #c9c9d1;
	}

	.speed-card p {
		margin: 0;
		font-size: 0.85rem;
		color: #8c8c9c;
	}

	.density-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem 2rem;
	}

	.density-row {
		display: grid;
		grid-template-columns: 4ch 1fr;
		align-items: center;
		gap: 1.25rem;
	}

	.density-label {
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		color: #6d6d7a;
		text-align: right;
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
</style>
