<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ReadingTOC from '$lib/components/ReadingTOC.svelte';

	const shell = catalogShellPropsForSlug('/readingtoc')!;

	let activeVariant = $state<'rail' | 'top' | 'drawer'>('rail');
	let activeSize = $state<'sm' | 'md' | 'lg'>('md');
	let activePosition = $state<'left' | 'right'>('left');

	const variantOptions: Array<{ id: 'rail' | 'top' | 'drawer'; label: string }> = [
		{ id: 'rail', label: 'Rail' },
		{ id: 'top', label: 'Top pills' },
		{ id: 'drawer', label: 'Drawer' }
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

	const codeExplanation =
		'ReadingTOC walks the target container once on mount, collects the requested heading levels, and registers each one with a single IntersectionObserver. The observer rootMargin is "0px 0px -60% 0px" so a heading is "active" the moment it enters the top 40% of the viewport. When several headings overlap, the resolver picks the highest intersection ratio and falls back to the previous active id past the last heading. Click handlers smooth-scroll (or instant-scroll under reduced motion) without breaking the underlying anchor link.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'IntersectionObserver', 'Long-form']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="rt-demo">
			<div class="rt-controls">
				<div class="rt-control">
					<span class="rt-control__label">Variant</span>
					<div class="rt-buttons">
						{#each variantOptions as opt (opt.id)}
							<button
								class="rt-btn"
								class:rt-btn--active={activeVariant === opt.id}
								onclick={() => (activeVariant = opt.id)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>
				<div class="rt-control">
					<span class="rt-control__label">Size</span>
					<div class="rt-buttons">
						{#each sizeOptions as opt (opt.id)}
							<button
								class="rt-btn"
								class:rt-btn--active={activeSize === opt.id}
								onclick={() => (activeSize = opt.id)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>
				{#if activeVariant === 'rail'}
					<div class="rt-control">
						<span class="rt-control__label">Rail position</span>
						<div class="rt-buttons">
							{#each positionOptions as opt (opt.id)}
								<button
									class="rt-btn"
									class:rt-btn--active={activePosition === opt.id}
									onclick={() => (activePosition = opt.id)}
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="rt-layout">
				<aside class="rt-rail" class:rt-rail--right={activePosition === 'right'}>
					{#if activeVariant === 'rail'}
						<ReadingTOC
							target="#demo-article"
							variant="rail"
							size={activeSize}
							position={activePosition}
						/>
					{/if}
				</aside>

				<main id="demo-article" class="rt-article">
					{#if activeVariant === 'top'}
						<ReadingTOC target="#demo-article" variant="top" size={activeSize} />
					{/if}

					<h2 id="introduction">Introduction</h2>
					<p>
						A reading table of contents quietly improves long-form reading on the web. Readers
						get a persistent map of the page — a sense of where they are now, and a one-click
						escape to anywhere else.
					</p>

					<h3 id="why-pair">Why pair it with ScrollProgressBar</h3>
					<p>
						The progress bar answers <em>how much remains?</em>; the TOC answers
						<em>what am I reading?</em> Together they form a lightweight reading shell that
						doesn't compete for attention.
					</p>

					<h3 id="when-not">When not to use it</h3>
					<p>
						Short pages and landing pages don't benefit. Use this for single long documents with
						three or more headings worth jumping between.
					</p>

					<h2 id="variants">Variants</h2>
					<p>Three layouts cover the common cases — rail, top pills, and drawer.</p>

					<h3 id="rail">Rail</h3>
					<p>
						The default. A sticky vertical column anchored to the left or right edge. Hierarchy
						is shown via indented sub-lists.
					</p>

					<h3 id="top">Top</h3>
					<p>
						A horizontal scrolling pill row at the top of the article. Renders only top-level
						headings.
					</p>

					<h3 id="drawer">Drawer</h3>
					<p>
						A FAB that opens a panel containing the full hierarchy — good for mobile or
						content-dense layouts.
					</p>

					<h2 id="active-tracking">Active tracking</h2>
					<p>
						A single <code>IntersectionObserver</code> covers all tracked headings. The
						<code>rootMargin</code> is <code>'0px 0px -60% 0px'</code> so a heading becomes
						active as soon as it crosses the top 40% of the viewport.
					</p>

					<h3 id="reduced-motion">Reduced motion</h3>
					<p>
						Under <code>prefers-reduced-motion: reduce</code>, click-to-scroll uses an instant
						<code>scrollIntoView</code> and CSS transitions are disabled.
					</p>

					<h2 id="accessibility">Accessibility</h2>
					<p>
						The wrapper is a real <code>nav</code>; entries are anchors that work without
						JavaScript. The active item carries <code>aria-current="location"</code>.
					</p>

					<h2 id="performance">Performance</h2>
					<p>
						One observer, one click handler per item, one <code>$derived</code> heading-tree
						memo. No scroll listener, no <code>ResizeObserver</code>.
					</p>

					<h2 id="recipes">Recipes</h2>
					<p>
						Pair with a top-edge progress bar. Swap rail for drawer at small sizes. Use top pills
						for short docs.
					</p>
				</main>
			</div>

			{#if activeVariant === 'drawer'}
				<ReadingTOC target="#demo-article" variant="drawer" size={activeSize} />
			{/if}
		</div>
	{/snippet}

	{#snippet api()}
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
					<td>Container whose headings are extracted.</td>
				</tr>
				<tr>
					<td><code>headings</code></td>
					<td><code>Heading[]</code></td>
					<td><code>undefined</code></td>
					<td>Override extraction with a pre-built list.</td>
				</tr>
				<tr>
					<td><code>levels</code></td>
					<td><code>number[]</code></td>
					<td><code>[2, 3, 4]</code></td>
					<td>Which heading levels to track.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'rail' | 'top' | 'drawer'</code></td>
					<td><code>'rail'</code></td>
					<td>Visual layout.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Type scale.</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'left' | 'right'</code></td>
					<td><code>'left'</code></td>
					<td>Rail anchor side (rail variant only).</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>'On this page'</code></td>
					<td>Heading shown above the list.</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Table of contents'</code></td>
					<td>Screen reader announcement.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra wrapper classes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rt-demo {
		display: grid;
		gap: 24px;
	}
	.rt-controls {
		display: grid;
		gap: 14px;
		padding: 18px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.rt-control {
		display: grid;
		gap: 8px;
	}
	.rt-control__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.rt-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.rt-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--surface);
		padding: 7px 12px;
		border-radius: var(--r-1);
		font-size: 13px;
		cursor: pointer;
		color: var(--fg-1);
		transition: all var(--dur-fast);
	}
	.rt-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.rt-btn--active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.rt-layout {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 24px;
		align-items: start;
	}
	.rt-layout :global(.rt-rail--right) {
		order: 2;
	}
	.rt-rail {
		min-height: 1px;
	}
	.rt-article {
		min-width: 0;
		padding: 18px 22px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.rt-article h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 22px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 28px 0 10px;
		color: var(--fg-1);
	}
	.rt-article h2:first-child {
		margin-top: 4px;
	}
	.rt-article h3 {
		font-size: 15px;
		font-weight: 600;
		margin: 18px 0 6px;
		color: var(--fg-1);
	}
	.rt-article p {
		margin: 0 0 12px;
		line-height: 1.7;
		color: var(--fg-2);
		font-size: 14px;
	}
	.rt-article code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	@media (max-width: 720px) {
		.rt-layout {
			grid-template-columns: 1fr;
		}
		.rt-rail {
			display: none;
		}
	}
</style>
