<script lang="ts">
	import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';

	let activeVariant = $state<'thin' | 'bold' | 'gradient' | 'pulse'>('gradient');
	let activePosition = $state<'top' | 'bottom'>('top');
	let activeColor = $state('#6366f1');

	const variantOptions: Array<{ id: 'thin' | 'bold' | 'gradient' | 'pulse'; label: string }> = [
		{ id: 'thin', label: 'Thin (2px)' },
		{ id: 'bold', label: 'Bold (6px)' },
		{ id: 'gradient', label: 'Gradient flow' },
		{ id: 'pulse', label: 'Pulse glow' }
	];

	const positionOptions: Array<{ id: 'top' | 'bottom'; label: string }> = [
		{ id: 'top', label: 'Top edge' },
		{ id: 'bottom', label: 'Bottom edge' }
	];

	const colorPresets = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

	const usageSnippet = [
		'<' + 'script lang="ts">',
		"  import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';",
		'<' + '/script>',
		'',
		'<!-- Default: thin, top edge, indigo -->',
		'<ScrollProgressBar />',
		'',
		'<!-- Bold variant at bottom edge -->',
		'<ScrollProgressBar variant="bold" position="bottom" color="#10b981" />',
		'',
		'<!-- Gradient flow with custom seed colour -->',
		'<ScrollProgressBar variant="gradient" color="#6366f1" />',
		'',
		'<!-- Pulse glow on a named scroll container -->',
		'<ScrollProgressBar',
		'  target="#article-body"',
		'  variant="pulse"',
		'  color="#ec4899"',
		'  aria-label="Article reading progress"',
		'/>'
	].join('\n');
</script>

<svelte:head>
	<title>ScrollProgressBar — TFE Svelte Templates</title>
</svelte:head>

<ScrollProgressBar variant={activeVariant} position={activePosition} color={activeColor} />

<div class="page">
	<header class="hero">
		<h1>ScrollProgressBar</h1>
		<p class="lead">
			Viewport-level reading-progress bar fixed to the screen edge. Scroll this page to see it in
			action — the bar at the {activePosition} of the viewport tracks your position through the
			document.
		</p>
	</header>

	<section class="controls">
		<h2>Live controls</h2>
		<p class="hint">Adjust the bar in real-time. Try scrolling after each change.</p>

		<div class="control-group">
			<span class="control-label">Variant</span>
			<div class="button-row">
				{#each variantOptions as opt (opt.id)}
					<button
						class:active={activeVariant === opt.id}
						onclick={() => (activeVariant = opt.id)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<span class="control-label">Position</span>
			<div class="button-row">
				{#each positionOptions as opt (opt.id)}
					<button
						class:active={activePosition === opt.id}
						onclick={() => (activePosition = opt.id)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<span class="control-label">Colour</span>
			<div class="button-row">
				{#each colorPresets as preset (preset)}
					<button
						class="swatch"
						class:active={activeColor === preset}
						style:--swatch={preset}
						onclick={() => (activeColor = preset)}
						aria-label="Use colour {preset}"
					></button>
				{/each}
			</div>
		</div>
	</section>

	<section class="example">
		<h2>Variants showcase</h2>
		<p>
			Four built-in variants, each tuned for a different visual weight. Thin (2px) is the default —
			subtle, unobtrusive, ideal for content-dense pages. Bold (6px) is a stronger signal for
			marketing pages. Gradient flows a multi-stop colour bath horizontally for a kinetic feel.
			Pulse adds a soft leading-edge glow that pulses while the bar is visible.
		</p>

		<div class="variant-grid">
			<div class="variant-card">
				<h3>thin</h3>
				<div class="static-preview">
					<div class="static-bar variant-thin" style:--demo-color={activeColor}></div>
				</div>
				<code class="snippet">&lt;ScrollProgressBar variant="thin" /&gt;</code>
			</div>
			<div class="variant-card">
				<h3>bold</h3>
				<div class="static-preview">
					<div class="static-bar variant-bold" style:--demo-color={activeColor}></div>
				</div>
				<code class="snippet">&lt;ScrollProgressBar variant="bold" /&gt;</code>
			</div>
			<div class="variant-card">
				<h3>gradient</h3>
				<div class="static-preview">
					<div class="static-bar variant-gradient" style:--demo-color={activeColor}></div>
				</div>
				<code class="snippet">&lt;ScrollProgressBar variant="gradient" /&gt;</code>
			</div>
			<div class="variant-card">
				<h3>pulse</h3>
				<div class="static-preview">
					<div class="static-bar variant-pulse" style:--demo-color={activeColor}></div>
				</div>
				<code class="snippet">&lt;ScrollProgressBar variant="pulse" /&gt;</code>
			</div>
		</div>
	</section>

	<section class="article">
		<h2>Long-form scroll content</h2>
		<p>
			Below is a substantial chunk of placeholder copy so you can scroll the page and watch the
			progress bar fill toward 100%. The bar updates per <code>requestAnimationFrame</code> tick
			using a single passive scroll listener, so it stays smooth even on long documents.
		</p>

		{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
			<article>
				<h3>Section {i + 1}</h3>
				<p>
					Continuous viewport-scroll feedback is one of those primitives that quietly improves
					reading UX on long-form pages. Readers get an unconscious sense of how much remains —
					similar to a book's pages-remaining cue — without needing to glance at a sidebar or
					mini-map. The bar is purposefully thin so it doesn't compete with the content for
					attention.
				</p>
				<p>
					The implementation here uses a JS scroll listener with <code>requestAnimationFrame</code>
					throttling. One active listener, one rAF tick per scroll event, one CSS variable update
					per tick. The actual fill animation is a CSS <code>transition: width 80ms linear</code>
					so the bar smooths between rAF samples without visible jitter.
				</p>
				<p>
					Browser support: <code>animation-timeline: scroll()</code> would let CSS drive the fill
					directly without JS, and as of early 2026 it's supported in Chrome 115+, Firefox 137+,
					and Safari 26. The JS path is kept as the primary mechanism here for two reasons —
					universal browser support, and the need to update <code>aria-valuenow</code> for screen
					readers regardless of CSS path.
				</p>
				<p>
					Accessibility: the bar carries <code>role="progressbar"</code> with
					<code>aria-valuenow</code>, <code>aria-valuemin=0</code>, <code>aria-valuemax=100</code>,
					and a configurable <code>aria-label</code>. Under <code>prefers-reduced-motion: reduce</code>
					the gradient flow and pulse glow are disabled — the bar updates instantly, no smooth
					interpolation. Pointer events are disabled on the wrapper so the bar never intercepts
					clicks.
				</p>
			</article>
		{/each}
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{usageSnippet}</code></pre>
	</section>

	<section class="props">
		<h2>Props</h2>
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>target</code></td>
					<td><code>'window' | string</code></td>
					<td><code>'window'</code></td>
					<td>Scroll source — window or CSS selector</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'thin' | 'bold' | 'gradient' | 'pulse'</code></td>
					<td><code>'thin'</code></td>
					<td>Visual style</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'top' | 'bottom'</code></td>
					<td><code>'top'</code></td>
					<td>Viewport edge anchor</td>
				</tr>
				<tr>
					<td><code>color</code></td>
					<td><code>string</code></td>
					<td><code>'#6366f1'</code></td>
					<td>CSS colour — solid or gradient seed</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>0 (auto)</code></td>
					<td>Bar height in px (clamped 1–20)</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Reading progress'</code></td>
					<td>Screen reader announcement</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Additional wrapper classes</td>
				</tr>
			</tbody>
		</table>
	</section>
</div>

<style>
	.page {
		max-width: 880px;
		margin: 0 auto;
		padding: 80px 24px 120px;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #1e293b;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin: 0 0 12px;
	}

	.lead {
		font-size: 1.15rem;
		line-height: 1.6;
		color: #475569;
		margin: 0 0 48px;
	}

	section {
		margin: 56px 0;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0 0 12px;
	}

	h3 {
		font-size: 1.1rem;
		margin: 24px 0 8px;
		color: #0f172a;
	}

	p {
		line-height: 1.7;
		color: #334155;
		margin: 0 0 16px;
	}

	.hint {
		font-size: 0.9rem;
		color: #64748b;
		margin-bottom: 20px;
	}

	.controls {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 24px;
	}

	.control-group {
		margin-bottom: 16px;
	}

	.control-label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		color: #475569;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.button-row button {
		appearance: none;
		border: 1px solid #cbd5e1;
		background: white;
		padding: 8px 14px;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.15s ease;
		color: #334155;
	}

	.button-row button:hover {
		border-color: #6366f1;
		color: #6366f1;
	}

	.button-row button.active {
		background: #6366f1;
		border-color: #6366f1;
		color: white;
	}

	.button-row .swatch {
		width: 36px;
		height: 36px;
		padding: 0;
		background: var(--swatch);
		border-color: transparent;
	}

	.button-row .swatch.active {
		outline: 3px solid #1e293b;
		outline-offset: 2px;
	}

	.variant-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-top: 20px;
	}

	.variant-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 16px;
	}

	.variant-card h3 {
		margin: 0 0 12px;
		font-size: 0.95rem;
		font-family: ui-monospace, 'SF Mono', monospace;
	}

	.static-preview {
		background: #f1f5f9;
		border-radius: 6px;
		padding: 24px 12px;
		margin: 8px 0 12px;
		position: relative;
		overflow: hidden;
	}

	.static-bar {
		height: var(--demo-height, 4px);
		width: 70%;
		background: var(--demo-color, #6366f1);
		border-radius: 2px;
	}

	.static-bar.variant-thin {
		--demo-height: 2px;
	}
	.static-bar.variant-bold {
		--demo-height: 6px;
	}
	.static-bar.variant-gradient {
		--demo-height: 4px;
		background: linear-gradient(
			90deg,
			var(--demo-color, #6366f1),
			#ec4899,
			#f59e0b,
			#06b6d4,
			var(--demo-color, #6366f1)
		);
		background-size: 200% 100%;
		animation: demo-flow 8s linear infinite;
	}
	.static-bar.variant-pulse {
		--demo-height: 4px;
		box-shadow:
			0 0 6px var(--demo-color, #6366f1),
			0 0 12px var(--demo-color, #6366f1);
	}

	@keyframes demo-flow {
		from {
			background-position: 0% 0%;
		}
		to {
			background-position: 200% 0%;
		}
	}

	.snippet {
		display: block;
		font-size: 0.75rem;
		color: #64748b;
		font-family: ui-monospace, 'SF Mono', monospace;
		background: #f8fafc;
		padding: 6px 8px;
		border-radius: 4px;
	}

	.article article {
		padding: 16px 0;
		border-top: 1px solid #e2e8f0;
	}

	.article article:first-of-type {
		border-top: none;
	}

	pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 16px;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	pre code {
		background: transparent;
		padding: 0;
		color: inherit;
	}

	code {
		background: #f1f5f9;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.85em;
		font-family: ui-monospace, 'SF Mono', monospace;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	th,
	td {
		text-align: left;
		padding: 10px 12px;
		border-bottom: 1px solid #e2e8f0;
		vertical-align: top;
	}

	th {
		background: #f8fafc;
		font-weight: 600;
		color: #334155;
	}
</style>
