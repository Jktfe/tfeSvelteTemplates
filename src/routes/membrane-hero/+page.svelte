<script lang="ts">
	import MembraneHero from '$lib/components/MembraneHero/MembraneHero.svelte';
	import type { MembranePalette } from '$lib/components/MembraneHero/types';

	const palettes: MembranePalette[] = ['aurora', 'sunset', 'polar'];
</script>

<svelte:head>
	<title>MembraneHero · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Warped-fluid-mesh full-bleed editorial hero with SVG displacement filter, Lissajous focal dot, per-glyph deal-in, and three palette presets. Asset-free."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>MembraneHero</h1>
		<p class="lede">
			A statement-piece full-bleed hero. CSS conic + radial gradient mesh displaced by inline-SVG
			<code>&lt;feTurbulence&gt;</code> + <code>&lt;feDisplacementMap&gt;</code> so the surface
			ripples like a fluid film. Three palette presets, focal Lissajous dot, per-glyph headline
			deal-in, asset-free.
		</p>
	</header>

	{#each palettes as p (p)}
		<section class="palette-block" data-palette={p}>
			<div class="palette-label">
				<h2>{p}</h2>
				<p class="palette-help">
					{#if p === 'aurora'}teal → violet → amber{/if}
					{#if p === 'sunset'}rose → amber → indigo{/if}
					{#if p === 'polar'}slate → sky → cyan{/if}
				</p>
			</div>
			<div class="hero-frame">
				{#if p === 'aurora'}
					<MembraneHero
						palette={p}
						eyebrow="Now in beta"
						headline="A new kind of canvas"
						subhead="Hand-crafted Svelte 5 primitives. Zero runtime cost. Every animation respects prefers-reduced-motion."
						primaryCta="Start building"
						secondaryCta="See the docs"
					/>
				{:else if p === 'sunset'}
					<MembraneHero
						palette={p}
						eyebrow="Launch week"
						headline="Ship a story, not a stack"
						subhead="Editorial layouts for product launches, season campaigns, and announcement pages."
						primaryCta="Read the launch"
						secondaryCta="Browse archives"
					/>
				{:else}
					<MembraneHero
						palette={p}
						eyebrow="Field notes"
						headline="Quiet light, deep focus"
						subhead="A composition palette for documentation sites, technical journals, and quiet brand pages."
						primaryCta="Read the journal"
						secondaryCta="Subscribe"
					/>
				{/if}
			</div>
		</section>
	{/each}

	<section class="meta">
		<div class="meta-card">
			<h2>How it warps</h2>
			<p>
				A CSS conic gradient sits behind everything as the base "membrane". An inline SVG
				<code>&lt;feTurbulence&gt;</code> generates fractal noise; <code>&lt;feDisplacementMap&gt;</code>
				warps the gradient pixels by that noise. The turbulence's <code>baseFrequency</code> animates
				between two values via SMIL <code>&lt;animate&gt;</code> so the warp itself breathes.
			</p>
		</div>

		<div class="meta-card">
			<h2>Lissajous focal dot</h2>
			<p>
				A single bright dot drifts along a Lissajous curve overlaid above the membrane. The curve
				never repeats too quickly — it gives the eye a wandering anchor without competing with the
				headline. Pure <code>requestAnimationFrame</code>, helpers exported for unit tests.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set: the SVG turbulence
				<code>&lt;animate&gt;</code> element is omitted (frozen seed), the Lissajous drift loop exits
				on the next frame, and CSS animations on glyphs/eyebrow/subhead/CTAs are disabled. The
				deal-in does not replay — the layout simply renders complete.
			</p>
		</div>

		<div class="meta-card">
			<h2>Asset-free</h2>
			<p>
				No external images, no font CDN, no GSAP, no Three.js. The membrane is CSS gradients +
				inline SVG; the typography uses the system serif/sans stack with descriptive fallbacks. The
				whole hero adds <strong>~6 KB</strong> compressed to a SvelteKit route.
			</p>
		</div>

		<div class="meta-card">
			<h2>A11y</h2>
			<p>
				Real <code>&lt;h1&gt;</code> with the headline (screen readers see the full string via the
				<code>.mh-sr-only</code> shadow), eyebrow pill carries an aria-label, the SVG filter and
				focal dot are <code>aria-hidden</code>, CTAs are real anchors. Glyph spans are aria-hidden
				so the headline isn't read out as one-letter-per-element.
			</p>
		</div>

		<div class="meta-card">
			<h2>M2 / M3 roadmap</h2>
			<p>
				<strong>M2:</strong> custom palette via <code>{'{ from, via, to, accent }'}</code> prop, mouse-parallax
				on the membrane (cursor pushes the surface), light-theme variant.<br />
				<strong>M3:</strong> scroll-progress-bound turbulence intensity, optional second focal dot at a
				phase offset.
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
