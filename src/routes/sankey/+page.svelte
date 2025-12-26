<script lang="ts">
	import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	// Load data from +page.server.ts (Neon database with fallback)
	let { data } = $props();
</script>

<svelte:head>
	<title>Expandable Sankey Diagram - TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Expandable Sankey Diagram</h1>
		<p class="subtitle">Interactive hierarchical flow visualization with expand/collapse</p>
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<section class="demo-section">
		<h2>Interactive Demo</h2>
		<p class="instructions">
			Click on <strong>Coal</strong> or <strong>Natural Gas</strong> nodes to expand and see their
			power plants. Click again to collapse. <strong>Solar</strong> has no children and is not
			expandable.
		</p>

		<div class="demo-container">
			<div class="sankey-scroll-wrapper">
				<ExpandableSankey nodes={data.sankeyData.nodes} links={data.sankeyData.links} height={600} />
			</div>
		</div>
	</section>

	<section class="documentation-section">
		<h2>Features</h2>
		<ul class="feature-list">
			<li>
				<strong>Hierarchical Structure:</strong> Multi-level parent-child relationships with clear visual
				flow
			</li>
			<li>
				<strong>Interactive Expansion:</strong> Click expandable nodes to reveal hidden sub-categories
			</li>
			<li>
				<strong>Smooth Transitions:</strong> Animated node and link changes for better UX
			</li>
			<li>
				<strong>Color-Coded Flows:</strong> Each energy source has distinct colour inherited by its
				flows
			</li>
			<li>
				<strong>Responsive Design:</strong> Adapts to container width while maintaining readability
			</li>
			<li>
				<strong>Tooltip Support:</strong> Hover over nodes and links to see detailed information
			</li>
		</ul>

		<h2>Data Structure</h2>
		<p>The component expects nodes and links in this format:</p>

		<div class="code-block">
			<pre><code>{`const sankeyData = {
  nodes: [
    {
      id: 'root',
      label: 'Energy Sources',
      expandable: true
    },
    {
      id: 'coal',
      label: 'Coal',
      color: '#8B4513',
      expandable: true,
      parentId: 'root'  // Child of root
    },
    {
      id: 'coal-plant-a',
      label: 'Coal Plant A',
      color: '#8B4513',
      expandable: false,
      parentId: 'coal'  // Child of coal
    },
    {
      id: 'residential',
      label: 'Residential',
      color: '#32CD32',
      expandable: false
      // No parentId = top-level destination
    }
  ],
  links: [
    { source: 'root', target: 'coal', value: 30 },
    { source: 'coal-plant-a', target: 'residential', value: 15 }
  ]
};`}</code></pre>
		</div>

		<h2>Usage Example</h2>
		<div class="code-block">
			<pre><code>{`${'<'}script>
  import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
  import { FALLBACK_SANKEY_DATA } from '$lib/constants';
</script>

<ExpandableSankey
  nodes={FALLBACK_SANKEY_DATA.nodes}
  links={FALLBACK_SANKEY_DATA.links}
  height={600}
  width="100%"
/>`}</code></pre>
		</div>

		<h2>Hierarchy Behavior</h2>
		<p>The component implements a parent-child visibility pattern:</p>
		<ul class="behavior-list">
			<li><strong>Initial State:</strong> Shows root node + first-level children + destinations</li>
			<li>
				<strong>Expand Node:</strong> Reveals immediate children (sub-categories appear in flow)
			</li>
			<li>
				<strong>Collapse Node:</strong> Hides children and all descendants (returns to parent view)
			</li>
			<li>
				<strong>Non-Expandable:</strong> Nodes with <code>expandable: false</code> cannot be clicked
			</li>
			<li>
				<strong>Destinations:</strong> Nodes with no <code>parentId</code> are always visible (e.g.,
				Residential, Industrial)
			</li>
		</ul>

		<h2>Implementation Pattern</h2>
		<p>This component demonstrates:</p>
		<ul class="pattern-list">
			<li>
				<strong>Plain Object Factory:</strong> <code>createSankeyData()</code> returns object with expand/collapse
				methods
			</li>
			<li>
				<strong>Svelte 5 Reactivity:</strong> Use <code>$state()</code> to create new object references
				on changes
			</li>
			<li>
				<strong>Event Handling:</strong> Unovis <code>events</code> prop with
				<code>Sankey.selectors.node</code> for click handlers
			</li>
			<li>
				<strong>Recursive Collapse:</strong> Collapsing a node also collapses all descendants
			</li>
			<li><strong>Filtered Visibility:</strong> Show only nodes whose parents are expanded</li>
		</ul>

		<h2>Props</h2>
		<table class="props-table">
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
					<td><code>Node[]</code></td>
					<td>required</td>
					<td>Array of all nodes in the hierarchy</td>
				</tr>
				<tr>
					<td><code>links</code></td>
					<td><code>Link[]</code></td>
					<td>required</td>
					<td>Array of all possible connections</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>600</code></td>
					<td>Container height in pixels</td>
				</tr>
				<tr>
					<td><code>width</code></td>
					<td><code>string</code></td>
					<td><code>'100%'</code></td>
					<td>Container width (CSS value)</td>
				</tr>
			</tbody>
		</table>

		<h2>Dependencies</h2>
		<ul class="dependency-list">
			<li><code>@unovis/svelte</code> - Svelte wrapper components</li>
			<li><code>@unovis/ts</code> - Core Unovis visualization library</li>
		</ul>
		<p class="install-note">
			Install with: <code>npm install @unovis/svelte @unovis/ts --legacy-peer-deps</code>
		</p>
	</section>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #666;
	}

	.demo-section,
	.documentation-section {
		margin-bottom: 3rem;
	}

	.demo-section h2,
	.documentation-section h2 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 1rem;
	}

	.instructions {
		background: #f0f9ff;
		border-left: 4px solid #3b82f6;
		padding: 1rem;
		margin-bottom: 2rem;
		border-radius: 4px;
		color: #1e40af;
	}

	.demo-container {
		background: #f9fafb;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	/* Mobile horizontal scroll wrapper for Sankey diagram */
	.sankey-scroll-wrapper {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.feature-list,
	.behavior-list,
	.pattern-list,
	.dependency-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 2rem 0;
	}

	.feature-list li,
	.behavior-list li,
	.pattern-list li,
	.dependency-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.feature-list li:last-child,
	.behavior-list li:last-child,
	.pattern-list li:last-child,
	.dependency-list li:last-child {
		border-bottom: none;
	}

	.code-block {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1rem 0 2rem 0;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.code-block code {
		font-family: inherit;
	}

	code {
		background: #f1f5f9;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.875rem;
		color: #dc2626;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0 2rem 0;
	}

	.props-table th,
	.props-table td {
		text-align: left;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.props-table th {
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
	}

	.props-table td code {
		background: #f1f5f9;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.875rem;
	}

	.install-note {
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		padding: 1rem;
		margin-top: 1rem;
		border-radius: 4px;
		color: #92400e;
	}

	.install-note code {
		background: #fde68a;
		color: #78350f;
	}
</style>
