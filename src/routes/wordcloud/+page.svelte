<script lang="ts">
	import WordCloud from '$lib/components/WordCloud.svelte';
	import type { WordCloudWord } from '$lib/components/WordCloud.svelte';

	const blogTags: WordCloudWord[] = [
		{ text: 'svelte', weight: 84 },
		{ text: 'reactivity', weight: 62 },
		{ text: 'rune', weight: 58 },
		{ text: 'kit', weight: 51 },
		{ text: 'snippet', weight: 47 },
		{ text: 'effect', weight: 42 },
		{ text: 'store', weight: 39, href: '#store' },
		{ text: 'state', weight: 35 },
		{ text: 'derived', weight: 32 },
		{ text: 'props', weight: 29 },
		{ text: 'css', weight: 26 },
		{ text: 'transitions', weight: 23 },
		{ text: 'animation', weight: 21 },
		{ text: 'router', weight: 19 },
		{ text: 'forms', weight: 17 },
		{ text: 'typescript', weight: 15 },
		{ text: 'vite', weight: 13 },
		{ text: 'ssr', weight: 12 },
		{ text: 'hydration', weight: 10 },
		{ text: 'preprocess', weight: 8 }
	];

	const aiTokens: WordCloudWord[] = [
		{ text: 'context', weight: 91 },
		{ text: 'token', weight: 78 },
		{ text: 'prompt', weight: 70 },
		{ text: 'agent', weight: 64 },
		{ text: 'tool', weight: 58 },
		{ text: 'model', weight: 53 },
		{ text: 'embedding', weight: 47 },
		{ text: 'memory', weight: 41 },
		{ text: 'retrieval', weight: 38 },
		{ text: 'rag', weight: 33 },
		{ text: 'function', weight: 30 },
		{ text: 'inference', weight: 27 },
		{ text: 'fine-tune', weight: 24 },
		{ text: 'eval', weight: 21 }
	];

	const teamFacets: WordCloudWord[] = [
		{ text: 'design', weight: 60 },
		{ text: 'engineering', weight: 55 },
		{ text: 'research', weight: 48 },
		{ text: 'product', weight: 43 },
		{ text: 'analytics', weight: 38 },
		{ text: 'support', weight: 33 },
		{ text: 'marketing', weight: 28 },
		{ text: 'operations', weight: 24 },
		{ text: 'finance', weight: 20 }
	];

	const surveyThemes: WordCloudWord[] = [
		{ text: 'fast', weight: 78 },
		{ text: 'simple', weight: 65 },
		{ text: 'reliable', weight: 58 },
		{ text: 'beautiful', weight: 49 },
		{ text: 'consistent', weight: 41 },
		{ text: 'accessible', weight: 36 },
		{ text: 'flexible', weight: 31 },
		{ text: 'documented', weight: 27 },
		{ text: 'open-source', weight: 23 },
		{ text: 'modern', weight: 19 },
		{ text: 'responsive', weight: 15 },
		{ text: 'lightweight', weight: 12 }
	];

	let lastClicked = $state<string | null>(null);
</script>

<svelte:head>
	<title>WordCloud — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<span class="badge">Data Visualisation</span>
		<h1>☁️ WordCloud</h1>
		<p>
			A frequency-weighted text-cloud primitive. N words sized proportionally to their
			<code>weight</code>, packed into a container, optionally rotated, coloured deterministically
			from a palette. Three variants — <code>organic</code>, <code>grid</code>,
			<code>radial</code> — share the same data shape (<code>{`{text, weight, href?}`}</code>).
			Pure CSS layout, zero canvas, zero D3, zero rAF.
		</p>
	</header>

	<section class="demo">
		<div class="demo__head">
			<h2>Organic — flex-wrap line flow</h2>
			<p>
				The flagship variant: 20 blog tags scaled across <code>[14, 48]</code>px. The
				heaviest tags (svelte, reactivity, rune) anchor the layout; lighter tags wrap
				around them via <code>flex-wrap</code>. Same data, no rotation — clearest read
				of the corpus.
			</p>
		</div>
		<div class="container">
			<WordCloud
				words={blogTags}
				variant="organic"
				minSize={14}
				maxSize={48}
				aria-label="Top 20 blog tags by frequency"
			/>
		</div>
		<pre class="code">{`<WordCloud words={blogTags} variant="organic" minSize={14} maxSize={48} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Grid — typographic poster</h2>
			<p>
				CSS-grid layout with <code>auto-fit</code> minmax columns. Words occupy evenly-spaced
				cells, all centred. Alternating rotation gives every second word a -90° tilt — pure
				typographic-poster energy. The same data renders quite differently from the organic
				variant.
			</p>
		</div>
		<div class="container">
			<WordCloud
				words={teamFacets}
				variant="grid"
				rotation="alternating"
				minSize={18}
				maxSize={42}
				aria-label="Team facets"
			/>
		</div>
		<pre class="code">{`<WordCloud
  words={teamFacets}
  variant="grid"
  rotation="alternating"
  minSize={18}
  maxSize={42} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Radial — concentric rings around the centre</h2>
			<p>
				Polar layout. The heaviest word sits at the centre; subsequent words fan out in
				rings of 6 → 12 → 18 around it. Random rotation seeded with <code>seed=42</code>
				— deterministic, so every render produces the same angles. Hub-and-spoke energy
				for AI prompt-token frequency.
			</p>
		</div>
		<div class="container container--radial">
			<WordCloud
				words={aiTokens}
				variant="radial"
				rotation="random"
				seed={42}
				minSize={16}
				maxSize={56}
				aria-label="AI prompt-token frequency"
			/>
		</div>
		<pre class="code">{`<WordCloud
  words={aiTokens}
  variant="radial"
  rotation="random"
  seed={42}
  minSize={16}
  maxSize={56} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Branded palette + click handler</h2>
			<p>
				Custom three-colour palette overrides the default eight-colour palette. The
				<code>onWordClick</code> callback turns each word into a focusable
				<code>&lt;button&gt;</code>. Click any theme below — the most-recent click is
				announced.
			</p>
		</div>
		<div class="container">
			<WordCloud
				words={surveyThemes}
				variant="organic"
				palette={['#6366f1', '#06b6d4', '#10b981']}
				minSize={16}
				maxSize={42}
				onWordClick={(w) => (lastClicked = w.text)}
				aria-label="Customer survey themes"
			/>
		</div>
		{#if lastClicked}
			<p class="status">
				Last clicked: <strong>{lastClicked}</strong>
			</p>
		{:else}
			<p class="status">Click any word above to filter.</p>
		{/if}
		<pre class="code">{`<WordCloud
  words={surveyThemes}
  palette={['#6366f1', '#06b6d4', '#10b981']}
  onWordClick={(w) => filter = w.text} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>SR-friendly decorative cloud</h2>
			<p>
				With <code>srTable</code> set, the visual cloud is hidden from screen readers
				(<code>aria-hidden</code>) and a visually-hidden ranked table is emitted instead.
				Sighted users see the cloud; assistive-tech users get the data once, in order, with
				exact weights — no perceptual encoding to puzzle over.
			</p>
		</div>
		<div class="container">
			<WordCloud
				words={blogTags.slice(0, 10)}
				variant="organic"
				srTable
				aria-label="Top 10 blog tags from Q4 — see the screen-reader table for exact ranks"
			/>
		</div>
		<pre class="code">{`<WordCloud
  words={topTen}
  srTable
  aria-label="Top 10 — see SR table for ranks" />`}</pre>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>
				3 variants — <code>organic</code> (flex-wrap), <code>grid</code> (CSS grid),
				<code>radial</code> (polar rings) — sharing one data shape.
			</li>
			<li>
				Linear weight→font-size scale, clamped to <code>[minSize, maxSize]</code>. Equal
				weights collapse to the midpoint — no division-by-zero, no flicker.
			</li>
			<li>
				Deterministic palette via hashed word text — same word, same colour, every render.
			</li>
			<li>
				Optional rotation — <code>none</code> / <code>alternating</code> / <code>random</code>
				(seeded so re-renders match).
			</li>
			<li>
				Three render modes — anchor with <code>href</code>, button with <code>onWordClick</code>,
				span otherwise. All keyboard-accessible.
			</li>
			<li>
				<code>prefers-reduced-motion: reduce</code> → hover scale disabled. Cloud stays
				readable as a static layout.
			</li>
			<li>
				<code>srTable</code> emits a visually-hidden ranked table for screen readers.
			</li>
			<li>Zero external dependencies. Pure helpers exported for testing.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<p class="usage__intro">
			Import the component, hand it an array of <code>WordCloudWord</code> tuples, pick a
			variant. That's the whole API.
		</p>
		<pre class="code">{`<!-- Default organic flow -->
<WordCloud words={tags} />

<!-- Radial with alternating rotation -->
<WordCloud
  words={tags}
  variant="radial"
  rotation="alternating"
  minSize={16}
  maxSize={64} />

<!-- Custom palette + click handler -->
<WordCloud
  words={tags}
  variant="grid"
  palette={['#6366f1', '#06b6d4', '#10b981']}
  onWordClick={(w) => filter(w.text)} />`}</pre>
		<p class="usage__intro">
			See <code>src/lib/components/WordCloud.md</code> for the full <code>WordCloudWord</code>
			shape, helper exports, accessibility notes and recipes.
		</p>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.badge {
		display: inline-block;
		background: #ecfeff;
		color: #0e7490;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem;
	}

	.hero p {
		font-size: 1.0625rem;
		color: #475569;
		line-height: 1.65;
		margin: 0;
		max-width: 720px;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo__head {
		margin-bottom: 1rem;
	}

	.demo__head h2 {
		font-size: 1.375rem;
		margin: 0 0 0.5rem;
	}

	.demo__head p {
		color: #64748b;
		margin: 0;
		line-height: 1.55;
		max-width: 720px;
	}

	.container {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.container--radial {
		min-height: 420px;
		padding: 0;
	}

	.status {
		margin: 0.75rem 0 0;
		font-size: 0.9375rem;
		color: #475569;
	}

	code {
		background: #f1f5f9;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}

	.code {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		overflow-x: auto;
		margin: 1rem 0 0;
		line-height: 1.5;
	}

	.features,
	.usage {
		margin-top: 3.5rem;
	}

	.features h2,
	.usage h2 {
		font-size: 1.5rem;
		margin: 0 0 1rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features li {
		padding: 0.625rem 0 0.625rem 1.5rem;
		position: relative;
		color: #334155;
		line-height: 1.55;
		border-bottom: 1px solid #f1f5f9;
	}

	.features li::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: #06b6d4;
	}
</style>
