<script lang="ts">
	import NoiseField from '$lib/components/NoiseField.svelte';
</script>

<svelte:head>
	<title>NoiseField · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>NoiseField</h1>
		<p>
			Ambient grain / film-noise / TV-static overlay. A single SVG <code>&lt;feTurbulence&gt;</code>
			+ <code>&lt;feColorMatrix&gt;</code> filter renders noise, layered over the slot via
			<code>mix-blend-mode</code>. Three intensities, three modes, optional shimmer. Pure SVG + CSS —
			no rAF, no canvas.
		</p>
	</header>

	<section class="demo">
		<h2>1. Editorial film grain — mono on a dark canvas</h2>
		<p class="caption">
			<strong>medium</strong> intensity + <strong>mono</strong> mode is the editorial default.
			Subtle texture across a dark hero — adds analog warmth without colour pollution.
		</p>
		<NoiseField intensity="medium" mode="mono" opacity={0.45}>
			<div class="stage stage-mono">
				<div class="hero-content">
					<div class="hero-eyebrow">A NICE TERMINAL</div>
					<h3 class="hero-title">Texture, not colour.</h3>
					<p class="hero-sub">Grain that lives over the surface, not next to it.</p>
				</div>
			</div>
		</NoiseField>
	</section>

	<section class="demo">
		<h2>2. Retro CRT — coarse + scanlines</h2>
		<p class="caption">
			<strong>coarse</strong> intensity + <strong>retro</strong> mode adds a cyan-shifted colour
			matrix and a 1px / 3px-period scanline overlay. Pair with a saturated background for the full
			VHS / synthwave look.
		</p>
		<NoiseField intensity="coarse" mode="retro" opacity={0.55}>
			<div class="stage stage-retro">
				<pre class="terminal">
$ ant boot --mode=arcade
&gt; loading kernel.................. ok
&gt; mounting palette................ ok
&gt; spawning grain.................. ok
&gt; READY.
</pre>
			</div>
		</NoiseField>
	</section>

	<section class="demo">
		<h2>3. Chromatic grain — fine + chroma over a saturated gradient</h2>
		<p class="caption">
			<strong>fine</strong> intensity + <strong>chroma</strong> mode amplifies R and B channels
			slightly. Reads as 35mm-film grain over a colour wash. Good for marketing landings and
			editorial covers.
		</p>
		<NoiseField intensity="fine" mode="chroma" opacity={0.35}>
			<div class="stage stage-chroma">
				<div class="warm-content">
					<div class="warm-tag">SUMMER · 26</div>
					<h3 class="warm-title">Cinema for the cursor.</h3>
				</div>
			</div>
		</NoiseField>
	</section>

	<section class="demo">
		<h2>4. Three intensities, side-by-side</h2>
		<p class="caption">
			Same mode, different grain. <strong>fine</strong> reads as tight 35mm-film stipple;
			<strong>medium</strong> is the editorial default; <strong>coarse</strong> pulls toward
			analog / VHS organic noise.
		</p>
		<div class="grid">
			<NoiseField intensity="fine" mode="mono" opacity={0.5}>
				<div class="card-stage">
					<h3>Fine</h3>
					<p>baseFreq 1.6<br />2 octaves<br />35mm stipple</p>
				</div>
			</NoiseField>
			<NoiseField intensity="medium" mode="mono" opacity={0.5}>
				<div class="card-stage">
					<h3>Medium</h3>
					<p>baseFreq 0.85<br />3 octaves<br />editorial default</p>
				</div>
			</NoiseField>
			<NoiseField intensity="coarse" mode="mono" opacity={0.5}>
				<div class="card-stage">
					<h3>Coarse</h3>
					<p>baseFreq 0.4<br />4 octaves<br />VHS / analog</p>
				</div>
			</NoiseField>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Three intensities</h3>
				<p>
					<code>fine</code> / <code>medium</code> / <code>coarse</code> — bundle
					<code>baseFrequency</code> + <code>numOctaves</code> so grain size and richness scale
					together.
				</p>
			</div>
			<div class="meta-card">
				<h3>Three modes</h3>
				<p>
					<code>mono</code> achromatic, <code>chroma</code> RGB grain, <code>retro</code> chromatic +
					scanline overlay.
				</p>
			</div>
			<div class="meta-card">
				<h3>SSR-safe filter ID</h3>
				<p>
					Static <code>nf-static</code> ID renders server-side; <code>onMount</code> swaps in a
					unique <code>nf-N</code>. Hydration mismatch never visible.
				</p>
			</div>
			<div class="meta-card">
				<h3>Stuttering shimmer</h3>
				<p>
					<code>steps(8)</code> easing on the keyframe simulates discrete 24-fps film frames, not a
					smooth slide.
				</p>
			</div>
			<div class="meta-card">
				<h3>Pure SVG + CSS</h3>
				<p>
					One <code>&lt;filter&gt;</code> + one <code>&lt;rect&gt;</code> + one keyframe. Zero
					<code>requestAnimationFrame</code>, zero canvas, zero resize observer.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion safe</h3>
				<p>
					Under <code>prefers-reduced-motion: reduce</code>, the <code>animated</code> prop is
					forced false on mount; CSS <code>@media</code> belt-and-braces freezes the keyframe.
					Grain still renders — statically.
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

	.stage-mono {
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

	.stage-retro {
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

	.stage-chroma {
		background: linear-gradient(135deg, #2a1a4e, #4a0a3a 60%, #ff3d6e);
	}

	.warm-content {
		text-align: center;
		pointer-events: none;
	}

	.warm-tag {
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: #ffd0e8;
		margin-bottom: 0.75rem;
	}

	.warm-title {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.75rem);
		color: #ffffff;
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
		color: #c9c9d1;
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
