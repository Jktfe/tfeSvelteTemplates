<script lang="ts">
	import AuroraBackdrop, { type AuroraPaletteName } from '$lib/components/AuroraBackdrop.svelte';

	const palettes: { name: AuroraPaletteName; mood: string; copy: string }[] = [
		{ name: 'classic', mood: 'aurora-borealis', copy: 'A new kind of canvas' },
		{ name: 'dawn', mood: 'sunrise warmth', copy: 'Ship a story, not a stack' },
		{ name: 'deep', mood: 'deep-ocean / outer space', copy: 'Quiet light, deep focus' }
	];
</script>

<svelte:head>
	<title>AuroraBackdrop · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Full-bleed pure-CSS aurora backdrop — four conic-gradient ribbons rotate at non-harmonic periods with mix-blend-mode screen, fading at the corners through a soft radial veil. Three palettes, asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>AuroraBackdrop</h1>
		<p class="lede">
			A full-bleed ambient backdrop — four CSS conic-gradient ribbons stacked with
			<code>mix-blend-mode: screen</code>, each rotating at a deliberately non-harmonic period
			(40 s / 65 s / 80 s / 110 s) with alternating directions and staggered phase offsets. A soft
			radial veil fades the corners so the wall reads as a self-contained luminous patch. Pure CSS,
			zero JS in the steady state, asset-free, prefers-reduced-motion safe.
		</p>
	</header>

	{#each palettes as p (p.name)}
		<section class="palette-block" data-palette={p.name}>
			<div class="palette-label">
				<h2>{p.name}</h2>
				<p class="palette-help">{p.mood}</p>
			</div>
			<div class="hero-frame">
				<AuroraBackdrop palette={p.name} />
				<div class="hero-text">
					<span class="hero-eyebrow">{p.name}</span>
					<h3 class="hero-headline">{p.copy}</h3>
					<p class="hero-sub">
						Drop any text, image, or CTA above an AuroraBackdrop and you have a statement hero —
						no GSAP, no Three.js, no images. Just four conic gradients, slow rotation, and a
						radial veil.
					</p>
				</div>
			</div>
		</section>
	{/each}

	<section class="palette-block" data-palette="intensity">
		<div class="palette-label">
			<h2>intensity sweep</h2>
			<p class="palette-help">0.6 (energetic) · 1.0 (default) · 1.8 (meditative)</p>
		</div>
		<div class="intensity-row">
			<div class="hero-frame intensity-cell">
				<AuroraBackdrop palette="classic" intensity={0.6} />
				<span class="intensity-label">0.6×</span>
			</div>
			<div class="hero-frame intensity-cell">
				<AuroraBackdrop palette="classic" intensity={1} />
				<span class="intensity-label">1.0×</span>
			</div>
			<div class="hero-frame intensity-cell">
				<AuroraBackdrop palette="classic" intensity={1.8} blur={90} />
				<span class="intensity-label">1.8×</span>
			</div>
		</div>
	</section>

	<section class="meta">
		<div class="meta-card">
			<h2>Why four ribbons</h2>
			<p>
				One ribbon reads as a flat gradient. Two looks like a hard cross-fade. Three is the minimum
				for "alive" but the pattern is still readable. Four ribbons with non-harmonic periods (40,
				65, 80, 110 — no small common factor) is the sweet spot — the composite never visibly loops
				and feels organic rather than mechanical.
			</p>
		</div>

		<div class="meta-card">
			<h2>mix-blend-mode: screen</h2>
			<p>
				<code>screen</code> brightens where ribbons overlap (1 − (1 − a)·(1 − b)), which gives the
				colour bloom that real auroras have. <code>multiply</code> would darken; <code>overlay</code>
				is too punchy. <code>screen</code> is what makes the ribbons look like light, not paint.
			</p>
		</div>

		<div class="meta-card">
			<h2>Radial veil</h2>
			<p>
				A single radial-gradient overlay (transparent at the centre, fading to 70% black at the
				corners) keeps the composition contained. Without it the wall reads as wallpaper; with it
				the eye treats it as a luminous patch with intent.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set, every ribbon's
				<code>animation</code> is set to <code>none</code>. The four start angles (15°, 110°, 215°,
				305°) are deliberately staggered so the static frame still reads as a deliberate composition,
				not a stuck animation.
			</p>
		</div>

		<div class="meta-card">
			<h2>Asset-free</h2>
			<p>
				No images, no fonts, no SVG, no animation library. The whole backdrop adds
				<strong>~3 KB</strong> compressed to a SvelteKit route. Layer it under any text component
				(<code>ShinyText</code>, <code>TrueFocus</code>, <code>VariableProximity</code>) for a
				ready-made statement hero.
			</p>
		</div>

		<div class="meta-card">
			<h2>M2 / M3 roadmap</h2>
			<p>
				<strong>M2:</strong> custom palette via <code>palette={`{ stops, base }`}</code>, optional
				cursor-parallax (cursor pushes the centre of rotation), light-theme variant.<br />
				<strong>M3:</strong> scroll-progress-bound intensity, optional second veil layer at a phase
				offset, configurable ribbon count.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #fff;
		color: #0f172a;
	}

	.intro {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
		color: #475569;
		text-decoration: none;
	}
	.back:hover {
		color: #0f172a;
	}
	.intro h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0;
		color: #475569;
		line-height: 1.6;
		max-width: 60ch;
	}
	.lede code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.85em;
		background: #f1f5f9;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
	}

	.palette-block {
		max-width: 1300px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
	.palette-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.palette-label h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #1e293b;
	}
	.palette-help {
		margin: 0;
		font-size: 0.85rem;
		color: #64748b;
	}

	.hero-frame {
		position: relative;
		min-height: 420px;
		border-radius: 1.25rem;
		overflow: hidden;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
	}

	.hero-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 2rem;
		color: #f8fafc;
		z-index: 2;
		pointer-events: none;
	}
	.hero-eyebrow {
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(248, 250, 252, 0.75);
	}
	.hero-headline {
		margin: 0.5rem 0 0.75rem;
		font-family: 'Times New Roman', Georgia, ui-serif, serif;
		font-style: italic;
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.05;
		color: #fff;
		text-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
	}
	.hero-sub {
		margin: 0;
		max-width: 50ch;
		font-size: 0.95rem;
		line-height: 1.55;
		color: rgba(248, 250, 252, 0.82);
	}

	.intensity-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.intensity-cell {
		min-height: 220px;
	}
	.intensity-label {
		position: absolute;
		bottom: 14px;
		right: 16px;
		padding: 4px 10px;
		background: rgba(15, 17, 28, 0.7);
		color: #f8fafc;
		border-radius: 999px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		backdrop-filter: blur(6px);
		z-index: 2;
		pointer-events: none;
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		max-width: 1100px;
		margin: 3rem auto 4rem;
		padding: 0 1.5rem;
	}
	.meta-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
	}
	.meta-card h2 {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}
	.meta-card p {
		font-size: 0.875rem;
		line-height: 1.55;
		color: #334155;
	}
	.meta-card code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		background: #fff;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		border: 1px solid #e2e8f0;
	}
</style>
