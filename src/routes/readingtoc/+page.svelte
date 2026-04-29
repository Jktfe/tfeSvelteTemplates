<script lang="ts">
	import ReadingTOC from '$lib/components/ReadingTOC.svelte';
	import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';

	let activeVariant = $state<'rail' | 'top' | 'drawer'>('rail');
	let activeSize = $state<'sm' | 'md' | 'lg'>('md');
	let activePosition = $state<'left' | 'right'>('left');

	const variantOptions: Array<{ id: 'rail' | 'top' | 'drawer'; label: string }> = [
		{ id: 'rail', label: 'Rail (sticky sidebar)' },
		{ id: 'top', label: 'Top (horizontal pills)' },
		{ id: 'drawer', label: 'Drawer (FAB + tray)' }
	];

	const sizeOptions: Array<{ id: 'sm' | 'md' | 'lg'; label: string }> = [
		{ id: 'sm', label: 'Small' },
		{ id: 'md', label: 'Medium' },
		{ id: 'lg', label: 'Large' }
	];

	const positionOptions: Array<{ id: 'left' | 'right'; label: string }> = [
		{ id: 'left', label: 'Left' },
		{ id: 'right', label: 'Right' }
	];

	const usageSnippet = [
		'<' + 'script lang="ts">',
		"  import ReadingTOC from '$lib/components/ReadingTOC.svelte';",
		'<' + '/script>',
		'',
		'<!-- Default: rail variant, tracks <main>, h2/h3/h4 -->',
		'<ReadingTOC />',
		'',
		'<!-- Top-edge horizontal pill row for short docs -->',
		'<ReadingTOC variant="top" />',
		'',
		'<!-- Mobile-friendly drawer (FAB + tray) -->',
		'<ReadingTOC variant="drawer" />',
		'',
		'<!-- Track a specific container, only h2/h3 -->',
		'<ReadingTOC target="#article-body" levels={[2, 3]} />'
	].join('\n');
</script>

<svelte:head>
	<title>ReadingTOC — TFE Svelte Templates</title>
</svelte:head>

<ScrollProgressBar variant="thin" color="#6366f1" />

<div class="page">
	<header class="hero">
		<h1>ReadingTOC</h1>
		<p class="lead">
			Auto-tracking table of contents that highlights the section you're currently reading and
			smooth-scrolls to a heading on click. Pairs naturally with <code>ScrollProgressBar</code> —
			the bar tells you <em>how much</em> of the page you've covered, the TOC tells you
			<em>where</em> you are.
		</p>
	</header>

	<section class="controls">
		<h2>Live controls</h2>
		<p class="hint">
			Adjust the live TOC instance below. Scroll the article to watch the active section
			highlight update.
		</p>

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
			<span class="control-label">Size</span>
			<div class="button-row">
				{#each sizeOptions as opt (opt.id)}
					<button
						class:active={activeSize === opt.id}
						onclick={() => (activeSize = opt.id)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>

		{#if activeVariant === 'rail'}
			<div class="control-group">
				<span class="control-label">Rail position</span>
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
		{/if}
	</section>

	<section class="layout">
		<aside class="rail-slot" class:right={activePosition === 'right'}>
			{#if activeVariant === 'rail'}
				<ReadingTOC
					target="#demo-article"
					variant="rail"
					size={activeSize}
					position={activePosition}
				/>
			{/if}
		</aside>

		<main id="demo-article" class="article">
			{#if activeVariant === 'top'}
				<ReadingTOC target="#demo-article" variant="top" size={activeSize} />
			{/if}

			<h2 id="introduction">Introduction</h2>
			<p>
				A reading table of contents is one of those small affordances that quietly improves
				long-form reading on the web. Readers get a persistent map of the page — a sense of
				where they are now, and a one-click escape to anywhere else. The pairing with a scroll
				progress bar is deliberate: the bar gives a continuous sense of progress, and the TOC
				gives a discrete sense of place.
			</p>
			<p>
				This component is built around a single <code>IntersectionObserver</code> with a
				top-band <code>rootMargin</code> so the active item updates as you read past a heading
				rather than when it disappears off the bottom of the viewport. There's no scroll
				listener, no <code>ResizeObserver</code>, and no <code>MutationObserver</code> — the
				heading list is read once on mount and on each subsequent change to the
				<code>headings</code> prop.
			</p>

			<h3 id="why-pair-with-spb">Why pair with ScrollProgressBar</h3>
			<p>
				Both components answer different questions. The progress bar answers
				<em>how much remains?</em> with a single passive 0→100% scalar. The TOC answers
				<em>what am I reading?</em> with a discrete section pointer. Together they form a
				lightweight reading shell that doesn't compete for attention but is always available
				when the reader looks for it.
			</p>

			<h3 id="when-not-to-use">When not to use it</h3>
			<p>
				Short pages, landing pages, or any document that fits on a single screen don't benefit
				from a TOC — there's nothing to navigate. Documentation hubs and other multi-page
				surfaces should use site navigation rather than in-page anchors. Use this when you have
				a single long document with three or more headings worth jumping between.
			</p>

			<h2 id="variants">Variants</h2>
			<p>
				Three layouts cover the common cases. Each variant uses the same underlying
				heading-extraction and active-tracking logic — only the rendering differs.
			</p>

			<h3 id="rail">Rail</h3>
			<p>
				The default. A sticky vertical column anchored to the left or right edge of a layout
				grid. Hierarchy is shown via indented sub-lists with a connecting line. Best for desktop
				reading layouts that already have a margin column.
			</p>

			<h3 id="top">Top</h3>
			<p>
				A horizontal scrolling pill row that sits at the top of the article body. Renders only
				the top-level headings — children are intentionally omitted to keep the row compact.
				Good for short docs or as a top-of-article complement to a longer rail.
			</p>

			<h3 id="drawer">Drawer</h3>
			<p>
				A floating action button anchored to the lower-right corner that opens a fixed-position
				panel containing the full hierarchy. Good for mobile or content-dense pages where a
				permanent rail would crowd the layout. Closes on overlay click or Escape.
			</p>

			<h2 id="active-tracking">Active tracking</h2>
			<p>
				A single <code>IntersectionObserver</code> covers all tracked headings. Its
				<code>rootMargin</code> is set to <code>'0px 0px -60% 0px'</code> — that is, the bottom
				60% of the viewport is excluded from the observation root. The effect is that a heading
				is considered active as soon as it crosses into the top 40% of the viewport, which
				matches the reader's natural reading position.
			</p>
			<p>
				When multiple headings are intersecting at once (common when sections are short), the
				resolver picks the one with the highest intersection ratio, breaking ties on document
				order. If nothing is intersecting — for example, when scrolled past the last tracked
				heading — the resolver falls back to the previous active id, then to the first heading
				in the list.
			</p>

			<h3 id="reduced-motion">Reduced motion</h3>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set, click-to-scroll uses an instant
				<code>scrollIntoView</code> with no smooth animation, and CSS transitions are disabled.
				The active-tracking logic itself is unchanged.
			</p>

			<h2 id="api">API</h2>
			<p>
				Every prop is optional. The default configuration tracks the first <code>&lt;main&gt;</code>
				element, extracts h2 / h3 / h4, and renders as a left-anchored rail. You can override the
				target with any CSS selector, restrict the levels, override extraction with a pre-built
				list, or change the variant, size, position, and labels.
			</p>

			<h3 id="props-target">target</h3>
			<p>
				CSS selector for the container whose headings should be extracted. Defaults to
				<code>'main'</code>. Useful when content is rendered into a sub-region of the page or
				when you want to scope the TOC to one part of a longer document.
			</p>

			<h3 id="props-headings">headings</h3>
			<p>
				A pre-built array of <code>{'{ id, text, level }'}</code> objects. When provided, this
				bypasses extraction entirely. Useful when content is rendered after <code>onMount</code>
				or when you want full control over what appears in the TOC.
			</p>

			<h3 id="props-levels">levels</h3>
			<p>
				Which heading levels to include. Defaults to <code>[2, 3, 4]</code>. Pass
				<code>[2]</code> for a flat top-level-only TOC, or <code>[2, 3, 4, 5, 6]</code> for the
				full hierarchy.
			</p>

			<h2 id="accessibility">Accessibility</h2>
			<p>
				The wrapper is a real <code>&lt;nav&gt;</code> with a configurable
				<code>aria-label</code>. Every TOC entry is an <code>&lt;a href="#id"&gt;</code> anchor
				— keyboard reachable, open-in-new-tab works, and the link works without JavaScript. The
				currently active item carries <code>aria-current="location"</code> so screen readers can
				announce position. The drawer toggle is a real <code>&lt;button&gt;</code> with
				<code>aria-expanded</code> and <code>aria-controls</code> referencing the panel.
			</p>
			<p>
				Escape closes an open drawer. Tab order follows visual order. Focus-visible outlines are
				preserved.
			</p>

			<h2 id="performance">Performance</h2>
			<p>
				One <code>IntersectionObserver</code>, one click handler per item, one
				<code>$derived</code> heading-tree memo, one plain-object entry cache keyed by id. No
				scroll listener, no per-frame Map churn, no <code>ResizeObserver</code>. The component
				is cheap enough that you can drop it in alongside any long-form page without thinking
				about overhead.
			</p>

			<h2 id="recipes">Recipes</h2>
			<p>
				Three common configurations. The first is what this very page uses — a top-edge progress
				bar paired with a left-rail TOC scoped to the article body. The second swaps the rail
				for a drawer at small screen sizes via a CSS visibility toggle. The third is a top-pill
				row for a short doc with two or three sections.
			</p>

			<h3 id="recipe-pair">Pair with ScrollProgressBar</h3>
			<p>
				Drop a <code>&lt;ScrollProgressBar /&gt;</code> at the top of the page and a
				<code>&lt;ReadingTOC variant="rail" /&gt;</code> in the margin column of your layout
				grid. Together they form a complete reading toolkit.
			</p>

			<h3 id="recipe-mobile">Mobile drawer + desktop rail</h3>
			<p>
				Render both variants and use Tailwind responsive utilities (or media queries) to swap
				between them. The drawer is fixed-position so it doesn't take space in the layout grid;
				the rail does. Hide one or the other based on viewport width.
			</p>
		</main>
	</section>

	{#if activeVariant === 'drawer'}
		<ReadingTOC target="#demo-article" variant="drawer" size={activeSize} />
	{/if}

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
					<td><code>string</code> (CSS selector)</td>
					<td><code>'main'</code></td>
					<td>Container whose headings are extracted</td>
				</tr>
				<tr>
					<td><code>headings</code></td>
					<td><code>Heading[]</code></td>
					<td><code>undefined</code></td>
					<td>Override extraction with a pre-built list</td>
				</tr>
				<tr>
					<td><code>levels</code></td>
					<td><code>number[]</code></td>
					<td><code>[2, 3, 4]</code></td>
					<td>Which heading levels to track</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'rail' | 'top' | 'drawer'</code></td>
					<td><code>'rail'</code></td>
					<td>Visual layout</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Type scale</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'left' | 'right'</code></td>
					<td><code>'left'</code></td>
					<td>Rail anchor side (rail variant only)</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>'On this page'</code></td>
					<td>Section heading shown above the list</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Table of contents'</code></td>
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
		max-width: 1100px;
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

	.layout {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 32px;
		align-items: start;
	}

	.layout :global(.rail-slot.right) {
		order: 2;
	}

	.rail-slot {
		min-height: 1px;
	}

	.article {
		min-width: 0;
	}

	.article h2 {
		font-size: 1.4rem;
		margin: 32px 0 12px;
		padding-top: 8px;
	}

	.article h3 {
		font-size: 1.1rem;
		margin: 24px 0 8px;
		color: #0f172a;
	}

	@media (max-width: 720px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.rail-slot {
			display: none;
		}
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
