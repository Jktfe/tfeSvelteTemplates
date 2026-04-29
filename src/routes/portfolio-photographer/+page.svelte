<script lang="ts">
	import PortfolioPhotographer from '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
</script>

<svelte:head>
	<title>PortfolioPhotographer · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Editorial photographer-portfolio hero with wireframe lens, drifting photo reel, and Halton-scatter focal dots. Asset-free CSS gradients."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>PortfolioPhotographer</h1>
		<p class="lede">
			A statement-piece editorial section for a photographer landing page. Wireframe lens
			background, horizontally drifting reel of CSS-gradient photo tiles, Halton-sequence focal
			scatter, and serif display name. Hover or focus the reel to pause the drift.
		</p>
	</header>

	<PortfolioPhotographer class="portfolio-frame" />

	<section class="meta">
		<div class="meta-card">
			<h2>Try it</h2>
			<ul>
				<li>Hover the reel — drift pauses</li>
				<li>Tab into a tile — drift pauses + tile lifts</li>
				<li>Toggle <code>prefers-reduced-motion</code> — drift, lens spin, dot pulse stop</li>
			</ul>
		</div>

		<div class="meta-card">
			<h2>M1 scope</h2>
			<p>
				This is milestone 1: hero + reel + scatter only. The lightbox modal, real-image swap-in via
				<code>Photo.src</code>, cursor 3D tilt, and <code>?photo=id</code> URL sync are scoped for
				M2 / M3.
			</p>
		</div>

		<div class="meta-card">
			<h2>Asset-free</h2>
			<p>
				No external images, no Unsplash, no GSAP. Each photo tile is a three-stop CSS gradient with
				an accent vignette. M2 will swap in real images via the <code>Photo.src</code> field, but
				the gradient stays as a perfect-quality fallback.
			</p>
		</div>

		<div class="meta-card">
			<h2>Halton scatter</h2>
			<p>
				The 24 dots use the <code>halton(i, 2)</code> /
				<code>halton(i, 3)</code> low-discrepancy sequence then bias toward the centre. That gives
				a more "scattered" look than uniform random — no clumping, no grid feel.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set: the reel drift, lens rotation, dot
				pulse, and eyebrow pulse all stop. Layout is unchanged so the editorial composition still
				reads as intended.
			</p>
		</div>

		<div class="meta-card">
			<h2>Custom photos</h2>
			<p>
				Pass your own <code>photos</code> array to override the sample set. M2 adds a real
				<code>src</code> field — until then, gradient stops drive the look.
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

	:global(.portfolio-frame) {
		border-radius: 1.25rem;
		margin: 0 1.5rem;
		max-width: calc(1400px - 3rem);
		margin-left: auto;
		margin-right: auto;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
		overflow: hidden;
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
	.meta-card p,
	.meta-card li {
		font-size: 0.875rem;
		line-height: 1.55;
		color: #334155;
	}
	.meta-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
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
