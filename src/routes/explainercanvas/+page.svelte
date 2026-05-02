<!--
	============================================================
	ExplainerCanvas Demo Page (TFE shell)
	============================================================

	Live demo expanded to gold standard:
	  • Variant tabs: Default (data prop), Loader (async), Sidebar (320×600), Full-bleed (wide)
	  • Recipe blocks for each shape
-->

<script lang="ts">
	import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
	import { FALLBACK_EXPLAINER_CANVAS_DATA } from '$lib/constants';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { ExplainerCanvasData } from '$lib/types';

	const shell = catalogShellPropsForSlug('/explainercanvas')!;
	const canvasData = FALLBACK_EXPLAINER_CANVAS_DATA;

	type Variant = 'default' | 'loader' | 'sidebar' | 'fullbleed';
	let variant = $state<Variant>('default');
	let loaderTicks = $state(0);

	// ---------------------------------------------------------------------------
	// Loader variant — async function returning a small canvas dataset.
	// We keep the dataset in-script so the page is self-contained, but the
	// real-world pattern is the same: fetch JSON from your API and resolve.
	// ---------------------------------------------------------------------------
	const sidebarCanvas: ExplainerCanvasData = {
		id: 'onboarding-mini',
		title: 'Onboarding Steps',
		description: 'Tiny three-card flow that fits a 320×600 sidebar',
		defaultCardId: 'install',
		config: {
			lineStyle: 'orthogonal',
			background: { type: 'dots', color: 'rgba(0, 0, 0, 0.06)', size: 1.5, gap: 18 },
			enableSearch: false,
			maxZoomOut: 0.5,
			maxZoomIn: 1.6
		},
		cards: [
			{
				id: 'install',
				title: '1. Install',
				summary: 'Add the package',
				position: { x: 0, y: 0 },
				content: [
					{ type: 'markdown', content: 'Run `bun add @tfe/components` in your project root.' }
				],
				links: ['configure']
			},
			{
				id: 'configure',
				title: '2. Configure',
				summary: 'Wire up the provider',
				position: { x: 220, y: 80 },
				content: [
					{ type: 'markdown', content: 'Wrap your root layout with the `<Provider>` component.' }
				],
				links: ['ship']
			},
			{
				id: 'ship',
				title: '3. Ship',
				summary: 'Deploy and forget',
				position: { x: 0, y: 240 },
				content: [
					{ type: 'markdown', content: 'Push to main. Your CI handles the rest.' }
				]
			}
		]
	};

	async function loadOnboardingCanvas(): Promise<ExplainerCanvasData> {
		// Simulate a network round-trip so users see the spinner work
		loaderTicks++;
		await new Promise((resolve) => setTimeout(resolve, 350));
		return sidebarCanvas;
	}

	// Re-bump the loader trigger every time the variant becomes 'loader' so
	// users can rerun the async path by toggling tabs.
	function selectVariant(next: Variant) {
		variant = next;
	}

	const usageSnippet = `<script>
  import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
  import { myCanvasData } from './data';
</${'script'}>

<!-- 1. Direct data -->
<ExplainerCanvas data={myCanvasData} />

<!-- 2. JSON URL -->
<ExplainerCanvas src="/data/canvas.json" />

<!-- 3. Async loader -->
<ExplainerCanvas loader={async () => fetch('/api/canvas').then(r => r.json())} />`;

	const codeExplanation =
		'ExplainerCanvas builds a pannable / zoomable concept map from structured data. Each card holds markdown content, optional images and embeds, links to related cards, and an optional nested sub-canvas for unlimited drill-down. Search uses fuzzy matching across the whole tree, and breadcrumbs track the navigation path. Keyboard, focus management, and ARIA labels are baked in. The component accepts data three ways — a `data` prop for in-memory content, a `src` URL for static JSON, or a `loader` async function for dynamic / authenticated fetches.';
</script>

<svelte:head>
	<title>ExplainerCanvas — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Pan/zoom concept-mapping canvas with nested hierarchies, fuzzy search and markdown content."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Canvas', 'Pan & zoom', 'Markdown', 'A11y']}
>
	{#snippet demo()}
		<div class="ec-demo">
			<div class="ec-demo__tabs" role="tablist" aria-label="ExplainerCanvas variants">
				<button
					type="button"
					role="tab"
					class="ec-demo__tab"
					class:active={variant === 'default'}
					aria-selected={variant === 'default'}
					onclick={() => selectVariant('default')}
				>
					Default (data prop)
				</button>
				<button
					type="button"
					role="tab"
					class="ec-demo__tab"
					class:active={variant === 'loader'}
					aria-selected={variant === 'loader'}
					onclick={() => selectVariant('loader')}
				>
					Async loader
				</button>
				<button
					type="button"
					role="tab"
					class="ec-demo__tab"
					class:active={variant === 'sidebar'}
					aria-selected={variant === 'sidebar'}
					onclick={() => selectVariant('sidebar')}
				>
					Sidebar (320×600)
				</button>
				<button
					type="button"
					role="tab"
					class="ec-demo__tab"
					class:active={variant === 'fullbleed'}
					aria-selected={variant === 'fullbleed'}
					onclick={() => selectVariant('fullbleed')}
				>
					Full-bleed
				</button>
			</div>

			<p class="ec-demo__hint">
				{#if variant === 'default'}
					<strong>Click</strong> any card to expand. <strong>Click links</strong> to navigate.
					Cards with a grid icon contain nested sub-canvases. <strong>Ctrl/Cmd + F</strong> to search.
					Drag to pan, scroll to zoom.
				{:else if variant === 'loader'}
					An async <code>loader</code> function ran on mount (call count: <strong>{loaderTicks}</strong>) and resolved a small three-card onboarding flow after a 350ms simulated network delay. Switch tabs and back to re-fire the loader.
				{:else if variant === 'sidebar'}
					Constrained to a 320×600 panel — the canvas adapts, the search bar stays available, and pan/zoom remains usable on a phone.
				{:else}
					Full-bleed full-height stage to demonstrate pan-zoom with breathing room. Try Ctrl/Cmd + F to search, then Tab through results.
				{/if}
			</p>

			{#if variant === 'default'}
				<div class="ec-demo__stage">
					<ExplainerCanvas
						data={canvasData}
						onNavigate={(cardId, path) => console.log('Navigated to:', cardId, path)}
						onExpand={(cardId) => console.log('Expanded:', cardId)}
						onCollapse={(cardId) => console.log('Collapsed:', cardId)}
					/>
				</div>
			{:else if variant === 'loader'}
				<div class="ec-demo__stage ec-demo__stage--medium">
					{#key loaderTicks}
						<ExplainerCanvas loader={loadOnboardingCanvas} />
					{/key}
				</div>
			{:else if variant === 'sidebar'}
				<div class="ec-demo__sidebar-row">
					<div class="ec-demo__sidebar">
						<ExplainerCanvas data={sidebarCanvas} />
					</div>
					<div class="ec-demo__sidebar-context">
						<h4>Article body</h4>
						<p>
							Imagine this column is the main reading area of a documentation site. The 320px-wide canvas to the left provides a live, interactive overview that stays visible as the reader scrolls.
						</p>
						<p>
							Because pan-zoom and search are baked in, even a tiny canvas remains useful — readers can drag the viewport around or zoom into a card without leaving the page.
						</p>
					</div>
				</div>
			{:else}
				<div class="ec-demo__stage ec-demo__stage--tall">
					<ExplainerCanvas
						data={canvasData}
						onNavigate={(cardId) => console.log('[full-bleed]', cardId)}
					/>
				</div>
			{/if}

			<div class="ec-recipes">
				<h3 class="ec-recipes__title">Recipes</h3>
				<ul class="ec-recipes__list">
					<li>
						<strong>Static documentation map.</strong> Pass <code>data</code> directly. Best when the canvas ships in your bundle and never changes — fastest first paint, no spinner.
					</li>
					<li>
						<strong>Authenticated dashboards.</strong> Use <code>loader={'{async () => myFetch()}'}</code>. Add auth headers, retries, and decryption inside your loader; the component just shows a spinner until you resolve.
					</li>
					<li>
						<strong>In-app sidebar overview.</strong> Constrain to ~320px wide. The canvas auto-scales card layout. Good fit for an "on this page" sidebar that mirrors a longer narrative.
					</li>
					<li>
						<strong>Full-bleed concept atlas.</strong> Push the stage to fill the viewport so dozens of cards are pannable. Pair with <code>config.background = {'{ type: "dots" }'}</code> for a "Miro-board" feel.
					</li>
				</ul>
			</div>
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
					<td><code>data</code></td>
					<td><code>ExplainerCanvasData</code></td>
					<td>—</td>
					<td>Direct data object with cards, links and config.</td>
				</tr>
				<tr>
					<td><code>src</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>URL to a JSON file. Loaded on mount.</td>
				</tr>
				<tr>
					<td><code>loader</code></td>
					<td><code>() =&gt; Promise&lt;ExplainerCanvasData&gt;</code></td>
					<td>—</td>
					<td>Custom async loader (e.g. fetch from your own API).</td>
				</tr>
				<tr>
					<td><code>initialCardId</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Override the data's <code>defaultCardId</code>.</td>
				</tr>
				<tr>
					<td><code>lineStyle</code></td>
					<td><code>'straight' | 'bezier' | 'orthogonal'</code></td>
					<td><code>'bezier'</code></td>
					<td>Connection-line shape between cards.</td>
				</tr>
				<tr>
					<td><code>onNavigate</code></td>
					<td><code>(cardId, path) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when navigating between cards.</td>
				</tr>
				<tr>
					<td><code>onExpand</code> / <code>onCollapse</code></td>
					<td><code>(cardId) =&gt; void</code></td>
					<td>—</td>
					<td>Fires on card open/close. Useful for analytics.</td>
				</tr>
				<tr>
					<td><code>onSearch</code></td>
					<td><code>(query, results) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the search panel runs a query.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ec-demo {
		display: grid;
		gap: 16px;
	}
	.ec-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ec-demo__tab {
		flex: 1 1 140px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--r-1);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}
	.ec-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.ec-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.ec-demo__hint {
		margin: 0;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ec-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.ec-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		height: 600px;
		overflow: hidden;
		contain: layout paint;
	}
	.ec-demo__stage--medium {
		height: 480px;
	}
	.ec-demo__stage--tall {
		height: 720px;
	}

	.ec-demo__sidebar-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		align-items: start;
	}
	@media (min-width: 800px) {
		.ec-demo__sidebar-row {
			grid-template-columns: 320px 1fr;
		}
	}
	.ec-demo__sidebar {
		width: 100%;
		max-width: 320px;
		height: 600px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
		contain: layout paint;
	}
	.ec-demo__sidebar-context {
		padding: 16px 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 14px;
		line-height: 1.6;
		color: var(--fg-2);
	}
	.ec-demo__sidebar-context h4 {
		margin: 0 0 8px;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.ec-demo__sidebar-context p {
		margin: 0 0 10px;
	}

	.ec-recipes {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ec-recipes__title {
		margin: 0 0 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.ec-recipes__list {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 10px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.ec-recipes__list strong {
		color: var(--fg-1);
	}
	.ec-recipes__list code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
