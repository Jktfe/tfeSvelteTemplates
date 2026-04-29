<script lang="ts">
	import Cardwall from '$lib/components/Cardwall/Cardwall.svelte';
</script>

<svelte:head>
	<title>Cardwall · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Full-bleed perspective billboard wall of CSS-gradient tiles drifting on a tilted plane. Asset-free, SSR-deterministic, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>Cardwall</h1>
		<p class="lede">
			A statement-piece billboard wall — multiple rows of CSS-gradient tiles drift at row-specific
			speeds and alternating directions inside a CSS perspective container. Click or keyboard-activate
			any tile to pin it; the rest of the wall keeps moving. Zero images, zero animation libraries,
			SSR-deterministic via a Halton sequence, fully prefers-reduced-motion safe.
		</p>
	</header>

	<section class="demo-block">
		<div class="demo-label">
			<h2>Default · 5 rows</h2>
			<p class="demo-help">8 tiles per row, 220 px tile width — the headline configuration</p>
		</div>
		<div class="hero-frame">
			<Cardwall density="default" tilesPerRow={8} />
		</div>
	</section>

	<section class="demo-block">
		<div class="demo-label">
			<h2>Sparse · 3 rows</h2>
			<p class="demo-help">Quieter — suits hero sections that want the wall as a backdrop</p>
		</div>
		<div class="hero-frame">
			<Cardwall density="sparse" tilesPerRow={6} />
		</div>
	</section>

	<section class="demo-block">
		<div class="demo-label">
			<h2>Dense · 7 rows</h2>
			<p class="demo-help">Cinematic "city of tiles" — pair with a foreground headline overlay</p>
		</div>
		<div class="hero-frame">
			<Cardwall density="dense" tilesPerRow={10} tileWidth={180} tileGap={14} />
		</div>
	</section>

	<section class="meta">
		<div class="meta-card">
			<h2>Why a perspective wall</h2>
			<p>
				The middle row sits flat on the camera plane; rows above tilt forward by 14°, rows below tilt
				back symmetrically. Outer rows scale to 0.92 and nudge ±6 px on Y so the wall reads as a deep
				field rather than a flat band. All from a single CSS <code>perspective: 1400px</code>.
			</p>
		</div>

		<div class="meta-card">
			<h2>Seamless drift</h2>
			<p>
				Each row renders its tile sequence twice. A single <code>requestAnimationFrame</code> loop
				updates every track via <code>rowOffset(t, period, speed, dir)</code>, which wraps the
				time-driven offset into <code>[0, period)</code>. The seam is always invisible.
			</p>
		</div>

		<div class="meta-card">
			<h2>Asset-free palette</h2>
			<p>
				Eight curated four-stop gradients × sixteen short serif labels — every tile picks both via
				Halton(2, 3) indexed by row × tile, so SSR and client agree byte-for-byte without an RNG seed.
			</p>
		</div>

		<div class="meta-card">
			<h2>Click to pin</h2>
			<p>
				Every tile is <code>role="button"</code>, focusable, activatable with Enter or Space. Pinning
				marks the tile with a glowing accent ring; the rest of the wall keeps drifting. A polite
				<code>aria-live</code> readout reports the pinned label for assistive tech.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set, the rAF loop never starts and the
				tracks rest at <code>translate3d(0, 0, 0)</code>. The wall reads as a static composition with
				every interaction still operational.
			</p>
		</div>

		<div class="meta-card">
			<h2>M2 / M3 roadmap</h2>
			<p>
				<strong>M2:</strong> custom palette + label arrays via props, scroll-progress speed coupling,
				per-tile parallax on hover.<br />
				<strong>M3:</strong> optional <code>&lt;img&gt;</code> children replacing tile gradients, infinite
				vertical drift companion, GSAP swap for <code>tilt</code> easing.
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

	.demo-block {
		max-width: 1300px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
	.demo-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.demo-label h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #1e293b;
	}
	.demo-help {
		margin: 0;
		font-size: 0.85rem;
		color: #64748b;
	}
	.hero-frame {
		border-radius: 1.25rem;
		overflow: hidden;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
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
