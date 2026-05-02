<!--
	============================================================
	Sankey Demo Page (TFE shell)
	============================================================

	Live demo expanded to gold standard:
	  • Variant tabs: Energy (live), Budget (compact 5-node), Comparison (collapsed vs expanded snapshot)
	  • Recipes section with three concrete copy-paste use cases
	  • Original Energy demo preserved as default tab
-->

<script lang="ts">
	import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import { createSankeyData } from '$lib/components/sankeyData';
	import type { SankeyNode, SankeyLink } from '$lib/types';

	const shell = catalogShellPropsForSlug('/sankey')!;

	let { data } = $props();

	type Variant = 'energy' | 'budget' | 'compare';
	let variant = $state<Variant>('energy');

	// ---------------------------------------------------------------------------
	// Dataset 2 — Quarterly budget allocation (5-node compact, single-level expand)
	// ---------------------------------------------------------------------------
	// Smaller scale than the energy diagram so users can see how the same
	// component behaves with fewer nodes and a single source.
	const budgetNodes: SankeyNode[] = [
		{ id: 'budget', label: 'Q4 Budget', color: '#0f766e' },
		{ id: 'eng', label: 'Engineering', color: '#6366f1', expandable: true },
		{ id: 'gtm', label: 'Go-to-market', color: '#f59e0b', expandable: true },
		{ id: 'ops', label: 'Operations', color: '#8b5cf6' },
		// Engineering breakdown
		{ id: 'eng-platform', label: 'Platform', color: '#6366f1', parent: 'eng' },
		{ id: 'eng-product', label: 'Product', color: '#6366f1', parent: 'eng' },
		// GTM breakdown
		{ id: 'gtm-paid', label: 'Paid Ads', color: '#f59e0b', parent: 'gtm' },
		{ id: 'gtm-events', label: 'Events', color: '#f59e0b', parent: 'gtm' },
		// Outcomes
		{ id: 'shipped', label: 'Shipped Features', color: '#16a34a' },
		{ id: 'pipeline', label: 'Sales Pipeline', color: '#dc2626' }
	];

	const budgetLinks: SankeyLink[] = [
		{ source: 'budget', target: 'eng', value: 60 },
		{ source: 'budget', target: 'gtm', value: 30 },
		{ source: 'budget', target: 'ops', value: 10 },
		// Engineering details
		{ source: 'eng', target: 'eng-platform', value: 25 },
		{ source: 'eng', target: 'eng-product', value: 35 },
		{ source: 'eng-platform', target: 'shipped', value: 25 },
		{ source: 'eng-product', target: 'shipped', value: 35 },
		// GTM details
		{ source: 'gtm', target: 'gtm-paid', value: 18 },
		{ source: 'gtm', target: 'gtm-events', value: 12 },
		{ source: 'gtm-paid', target: 'pipeline', value: 18 },
		{ source: 'gtm-events', target: 'pipeline', value: 12 },
		// Aggregate links (visible when collapsed)
		{ source: 'eng', target: 'shipped', value: 60 },
		{ source: 'gtm', target: 'pipeline', value: 30 },
		// Ops direct
		{ source: 'ops', target: 'shipped', value: 4 },
		{ source: 'ops', target: 'pipeline', value: 6 }
	];

	// ---------------------------------------------------------------------------
	// Comparison panel — same energy data, but the right-hand instance is
	// pre-expanded by calling expand() on the data manager before render.
	// ---------------------------------------------------------------------------
	function buildComparisonData() {
		const collapsed = createSankeyData(
			data.sankeyData.nodes.map((n: SankeyNode) => ({ ...n })),
			data.sankeyData.links.map((l: SankeyLink) => ({ ...l }))
		);

		// Build a second instance and pre-expand Coal + Natural Gas so the user
		// can see the "after" state side-by-side without clicking.
		const expandedNodes = data.sankeyData.nodes.map((n: SankeyNode) => ({ ...n }));
		const expandedLinks = data.sankeyData.links.map((l: SankeyLink) => ({ ...l }));
		const expanded = createSankeyData(expandedNodes, expandedLinks);
		const coal = expandedNodes.find((n: SankeyNode) => n.id === 'coal');
		const gas = expandedNodes.find((n: SankeyNode) => n.id === 'gas');
		if (coal) expanded.expand(coal);
		if (gas) expanded.expand(gas);

		return {
			collapsed: { nodes: collapsed.nodes, links: collapsed.links },
			expanded: { nodes: expanded.nodes, links: expanded.links }
		};
	}

	const comparison = buildComparisonData();

	const usageSnippet = `<script>
  import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
</${'script'}>

<ExpandableSankey
  nodes={data.sankeyData.nodes}
  links={data.sankeyData.links}
  height={600}
/>`;

	const codeExplanation =
		'ExpandableSankey wraps Unovis to render a Sankey diagram with click-to-expand nodes. The createSankeyData() helper tracks expanded state and recursively collapses children. Aggregate links collapse to summary flows when a node is closed; detailed child links appear when it is expanded. Unovis owns the SVG layer and tooltips. Every variant on this page is the same component — only the data and pre-expansion state differs.';
</script>

<svelte:head>
	<title>Sankey — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive expandable Sankey flow visualisation built on Unovis. Click nodes to drill down."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Unovis', 'Sankey', 'Hierarchical', 'Theme-aware']}
>
	{#snippet demo()}
		<div class="sankey-demo">
			<div class="sankey-demo__tabs" role="tablist" aria-label="Sankey variants">
				<button
					type="button"
					role="tab"
					class="sankey-demo__tab"
					class:active={variant === 'energy'}
					aria-selected={variant === 'energy'}
					onclick={() => (variant = 'energy')}
				>
					Energy (full)
				</button>
				<button
					type="button"
					role="tab"
					class="sankey-demo__tab"
					class:active={variant === 'budget'}
					aria-selected={variant === 'budget'}
					onclick={() => (variant = 'budget')}
				>
					Budget (compact)
				</button>
				<button
					type="button"
					role="tab"
					class="sankey-demo__tab"
					class:active={variant === 'compare'}
					aria-selected={variant === 'compare'}
					onclick={() => (variant = 'compare')}
				>
					Before vs After
				</button>
			</div>

			<p class="sankey-demo__hint">
				{#if variant === 'energy'}
					Click <strong>Coal</strong> or <strong>Natural Gas</strong> to expand. <strong>Solar</strong> has no children. Database: <code>{data.usingDatabase ? 'connected' : 'fallback'}</code>.
				{:else if variant === 'budget'}
					A 10-node example showing quarterly budget flowing through Engineering and GTM. Click <strong>Engineering</strong> or <strong>Go-to-market</strong> to drill into sub-budgets.
				{:else}
					Same energy dataset, two snapshots. The left renders as Unovis would lay it out by default (everything collapsed). The right was created by calling <code>data.expand(coal)</code> and <code>data.expand(gas)</code> at build time — no clicks needed.
				{/if}
			</p>

			{#if variant === 'energy'}
				<div class="sankey-demo__scroll">
					<ExpandableSankey nodes={data.sankeyData.nodes} links={data.sankeyData.links} height={600} />
				</div>
			{:else if variant === 'budget'}
				<div class="sankey-demo__scroll">
					<ExpandableSankey nodes={budgetNodes} links={budgetLinks} height={460} />
				</div>
			{:else}
				<div class="sankey-compare">
					<figure class="sankey-compare__panel">
						<figcaption>Collapsed (default)</figcaption>
						<div class="sankey-demo__scroll">
							<ExpandableSankey
								nodes={comparison.collapsed.nodes}
								links={comparison.collapsed.links}
								height={420}
							/>
						</div>
					</figure>
					<figure class="sankey-compare__panel">
						<figcaption>Pre-expanded (Coal + Gas)</figcaption>
						<div class="sankey-demo__scroll">
							<ExpandableSankey
								nodes={comparison.expanded.nodes}
								links={comparison.expanded.links}
								height={420}
							/>
						</div>
					</figure>
				</div>
			{/if}

			<div class="sankey-recipes">
				<h3 class="sankey-recipes__title">Recipes</h3>
				<ul class="sankey-recipes__list">
					<li>
						<strong>Energy mix dashboard.</strong> Render the full <code>FALLBACK_SANKEY_DATA</code> at <code>height={'{600}'}</code> for a desktop dashboard. The <code>min-width: 800px</code> baked into the component means mobile users get a horizontal scroll instead of squashed labels.
					</li>
					<li>
						<strong>Budget &amp; OKR rollups.</strong> Use the compact 10-node shape — one source, two expandable categories, a static third — to show how a fixed pot of money or capacity is being spent. Keep <code>height</code> below 500px so it fits inside a card.
					</li>
					<li>
						<strong>Pre-expanded snapshots.</strong> When you need a static screenshot for a report, instantiate <code>createSankeyData()</code> yourself, call <code>.expand(node)</code> on the categories you want open, and pass the resulting <code>.nodes</code> / <code>.links</code> straight into the component. The "Before vs After" tab above does exactly this.
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
					<td><code>nodes</code></td>
					<td><code>SankeyNode[]</code></td>
					<td>required</td>
					<td>All nodes including hidden children. Top-level nodes have no <code>parent</code>.</td>
				</tr>
				<tr>
					<td><code>links</code></td>
					<td><code>SankeyLink[]</code></td>
					<td>required</td>
					<td>All flows. Aggregate links show when collapsed; detail links show when expanded.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>600</code></td>
					<td>Container height in pixels.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sankey-demo {
		display: grid;
		gap: 16px;
	}
	.sankey-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sankey-demo__tab {
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
	.sankey-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.sankey-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.sankey-demo__hint {
		margin: 0;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sankey-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.sankey-demo__scroll {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sankey-compare {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	@media (min-width: 1100px) {
		.sankey-compare {
			grid-template-columns: 1fr 1fr;
		}
	}
	.sankey-compare__panel {
		margin: 0;
		display: grid;
		gap: 8px;
	}
	.sankey-compare__panel figcaption {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-2);
	}
	.sankey-recipes {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sankey-recipes__title {
		margin: 0 0 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.sankey-recipes__list {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 10px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.sankey-recipes__list strong {
		color: var(--fg-1);
	}
	.sankey-recipes__list code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
