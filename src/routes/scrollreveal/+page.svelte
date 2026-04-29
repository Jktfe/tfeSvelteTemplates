<script lang="ts">
	import ScrollReveal from '$lib/components/ScrollReveal.svelte';

	const cards = [
		{ title: 'Aurora', body: 'Conic ribbons drift through gradient space.' },
		{ title: 'Cardwall', body: 'A perspective billboard of pinned tiles.' },
		{ title: 'ClickSpark', body: 'Wrap-anything click-burst confetti.' },
		{ title: 'RippleGrid', body: 'A grid where clicks become waves.' },
		{ title: 'SplitFlap', body: 'Mechanical Solari-board character flips.' },
		{ title: 'Marquee', body: 'Seamless infinite scroll, pause-on-hover.' }
	];

	const features = [
		{
			heading: 'IntersectionObserver-powered',
			detail:
				'No rAF, no scroll listeners. The observer lives on the compositor and fires only when intersection state changes.'
		},
		{
			heading: 'Per-child stagger',
			detail:
				'Delays are computed once at mount and written to a CSS custom property. The cascade runs from the stylesheet — JS does nothing per-frame.'
		},
		{
			heading: 'One-shot or replay',
			detail:
				'Default reveals once and unobserves. Opt-in replay re-hides on exit so hero sections re-animate as the user scrolls back.'
		},
		{
			heading: 'prefers-reduced-motion safe',
			detail:
				'When the user opts out, every child is revealed instantly with --sr-duration: 0ms. A stylesheet fallback covers JS-late paths.'
		},
		{
			heading: 'Accessibility-preserving',
			detail:
				'Hidden state uses opacity + transform, never display: none. Screen readers see all content regardless of viewport state.'
		},
		{
			heading: 'Zero dependencies',
			detail: 'No animation library, no font CDN, no polyfill. ~7KB of inspectable Svelte.'
		}
	];

	const grid = Array.from({ length: 12 }, (_, i) => ({
		i,
		// rotate through directions so the grid scatters in
		direction: (['up', 'down', 'left', 'right', 'scale', 'rotate'] as const)[i % 6]
	}));

	const highlights = [
		{ label: '01 — Observe', text: 'Children are tagged and observed at mount.' },
		{ label: '02 — Intersect', text: 'Threshold met → data-revealed flips, CSS transitions in.' },
		{ label: '03 — Settle', text: 'One-shot unobserves; replay holds for next scroll-by.' }
	];
</script>

<svelte:head>
	<title>ScrollReveal · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>📜 ScrollReveal</h1>
		<p class="lede">
			A wrapper that animates its direct children in (translate + fade) as they cross the viewport
			threshold. The cascade comes from a per-child delay so a row of cards "tucks in" with rhythm
			instead of all flashing on at once. The observer is the OS-level
			<code>IntersectionObserver</code> — between reveals, the component does nothing.
		</p>
	</header>

	<section class="demo">
		<h2>1. Default — vertical fade-up cascade</h2>
		<p class="hint">
			The out-of-the-box pairing. Six cards, default stagger of 80ms, distance of 32px. Scroll past
			the cards and they tuck in from below in sequence.
		</p>
		<div class="card framed">
			<ScrollReveal class="cards-grid">
				{#each cards as card (card.title)}
					<article class="card-tile">
						<h3>{card.title}</h3>
						<p>{card.body}</p>
					</article>
				{/each}
			</ScrollReveal>
		</div>
	</section>

	<section class="demo">
		<h2>2. Horizontal slide-from-left — feature rows</h2>
		<p class="hint">
			<code>direction="left"</code> with a longer <code>distance=64</code> and a slower
			<code>stagger=140</code> reads more deliberate — useful for documentation feature lists where
			each row is a paragraph the reader needs time to absorb.
		</p>
		<div class="card framed">
			<ScrollReveal class="feature-stack" direction="left" distance={64} stagger={140} duration={750}>
				{#each features as f (f.heading)}
					<div class="feature-row">
						<h3>{f.heading}</h3>
						<p>{f.detail}</p>
					</div>
				{/each}
			</ScrollReveal>
		</div>
	</section>

	<section class="demo">
		<h2>3. Grid scatter — per-tile direction</h2>
		<p class="hint">
			A 4×3 grid where each tile is wrapped in its own ScrollReveal with a different
			<code>direction</code>. The shared <code>stagger=0</code> means all tiles in the same wrapper
			fire simultaneously; the per-tile direction creates the scattered reveal.
		</p>
		<div class="card framed">
			<div class="scatter-grid">
				{#each grid as tile (tile.i)}
					<ScrollReveal direction={tile.direction} distance={40} stagger={0} duration={600}>
						<div class="scatter-tile">{tile.i + 1}</div>
					</ScrollReveal>
				{/each}
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>4. Hero one-shot — scale + crossfade</h2>
		<p class="hint">
			A hero block with <code>direction="scale"</code> and <code>distance=0</code> — the children
			scale in subtly and fade in with a long, slow <code>duration=1100</code>. One-shot only; once
			revealed, the section stays visible regardless of scroll position.
		</p>
		<div class="card framed dark">
			<ScrollReveal direction="scale" stagger={180} duration={1100}>
				<p class="hero-eyebrow">Scroll-driven primitives</p>
				<h2 class="hero-title">Animation that respects the page.</h2>
				<p class="hero-body">
					ScrollReveal is one IntersectionObserver, a handful of CSS variables, and zero
					rAF. It does nothing until you arrive — and even less once you've left.
				</p>
				<button class="hero-button">Read the source →</button>
			</ScrollReveal>
		</div>
	</section>

	<section class="demo">
		<h2>5. Replay-on-leave — re-animates on scroll back</h2>
		<p class="hint">
			With <code>replay=true</code>, the children re-hide when they leave the viewport. Scroll past
			these three, then scroll back — they'll animate in again. Useful for hero sections users may
			navigate to and from.
		</p>
		<div class="card framed">
			<ScrollReveal replay direction="up" stagger={120} duration={650}>
				{#each highlights as h (h.label)}
					<div class="highlight-row">
						<span class="highlight-label">{h.label}</span>
						<p class="highlight-text">{h.text}</p>
					</div>
				{/each}
			</ScrollReveal>
		</div>
	</section>

	<section class="features-list">
		<h2>Features</h2>
		<ul>
			<li><strong>Six directions:</strong> up, down, left, right, scale, rotate.</li>
			<li>
				<strong>Per-child stagger</strong> via <code>delayForChild(index, stagger, intensity)</code>.
			</li>
			<li>
				<strong>One-shot or replay:</strong> default reveals once and unobserves; opt-in replay re-hides on exit.
			</li>
			<li><strong>prefers-reduced-motion safe</strong> with both JS and stylesheet fallbacks.</li>
			<li><strong>SSR-safe</strong> — IntersectionObserver only created in <code>onMount</code>.</li>
			<li>
				<strong>Accessibility-preserving</strong> — uses <code>opacity</code> + <code>transform</code>, never <code>display: none</code>.
			</li>
			<li><strong>Pure helpers</strong> exported for unit testing without a DOM.</li>
			<li><strong>Zero external dependencies.</strong> ~7KB of inspectable Svelte.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import ScrollReveal from '$lib/components/ScrollReveal.svelte';
<` + `/script>

<!-- Default: vertical fade-up cascade -->
<ScrollReveal>
  {#each items as item}
    <Card {item} />
  {/each}
</ScrollReveal>

<!-- Horizontal slide with longer distance -->
<ScrollReveal direction="left" distance={64} stagger={120}>
  {#each features as f}
    <FeatureRow {f} />
  {/each}
</ScrollReveal>

<!-- Hero crossfade, no transform, slow duration -->
<ScrollReveal direction="scale" distance={0} duration={1100}>
  <h1>Welcome.</h1>
  <p>Product copy.</p>
</ScrollReveal>

<!-- Replay-on-leave for hero sections -->
<ScrollReveal replay direction="up">
  {#each highlights as h}
    <Highlight {h} />
  {/each}
</ScrollReveal>`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 980px;
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
	.features-list code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
	}
	.card.framed {
		padding: 2rem 1.5rem;
	}
	.card.dark {
		background: #0f172a;
		color: #e2e8f0;
		border-color: #1e293b;
	}

	/* Demo 1 — cards grid */
	:global(.cards-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}
	.card-tile {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1rem;
	}
	.card-tile h3 {
		margin: 0 0 0.25rem;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.card-tile p {
		margin: 0;
		font-size: 0.8125rem;
		color: #475569;
		line-height: 1.5;
	}

	/* Demo 2 — feature stack */
	:global(.feature-stack) {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.feature-row {
		padding: 1rem 1.25rem;
		background: #f8fafc;
		border-left: 3px solid #6366f1;
		border-radius: 0 0.5rem 0.5rem 0;
	}
	.feature-row h3 {
		margin: 0 0 0.25rem;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.feature-row p {
		margin: 0;
		font-size: 0.8125rem;
		color: #475569;
		line-height: 1.55;
	}

	/* Demo 3 — scatter grid */
	.scatter-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}
	.scatter-tile {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e40af;
		background: linear-gradient(135deg, #dbeafe, #ede9fe);
		border-radius: 0.5rem;
		border: 1px solid #c7d2fe;
	}

	/* Demo 4 — hero */
	.hero-eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		color: #94a3b8;
		margin: 0 0 0.5rem;
	}
	.hero-title {
		font-size: 1.875rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		line-height: 1.15;
	}
	.hero-body {
		color: #cbd5e1;
		line-height: 1.6;
		margin: 0 0 1.25rem;
	}
	.hero-button {
		background: #6366f1;
		color: white;
		border: 0;
		padding: 0.625rem 1.125rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}
	.hero-button:hover {
		background: #4f46e5;
	}

	/* Demo 5 — highlights */
	.highlight-row {
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 1rem;
		padding: 0.875rem 0;
		border-bottom: 1px solid #e2e8f0;
	}
	.highlight-row:last-child {
		border-bottom: 0;
	}
	.highlight-label {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		color: #6366f1;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-top: 0.125rem;
	}
	.highlight-text {
		margin: 0;
		font-size: 0.9375rem;
		color: #334155;
		line-height: 1.55;
	}

	.features-list {
		margin: 2.5rem 0;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
	}
	.features-list h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.features-list ul {
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
