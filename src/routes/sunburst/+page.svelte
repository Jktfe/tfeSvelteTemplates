<script lang="ts">
	import Sunburst from '$lib/components/Sunburst.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import type { PageData } from './$types';
	import type { SunburstNode } from '$lib/types';

	let { data }: { data: PageData } = $props();

	/**
	 * Currently selected example
	 */
	let activeExample = $state<'filesystem' | 'sales'>('filesystem');

	/**
	 * Last clicked node for demonstration
	 */
	let lastClicked = $state<string | null>(null);

	/**
	 * Custom colour schemes
	 */
	const colorSchemes = {
		default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
		ocean: ['#0ea5e9', '#22d3ee', '#2dd4bf', '#34d399', '#4ade80', '#86efac'],
		sunset: ['#f97316', '#fb923c', '#facc15', '#ef4444', '#f43f5e', '#ec4899'],
		monochrome: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db']
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');

	/**
	 * Handle node click callback
	 */
	function handleNodeClick(node: SunburstNode) {
		lastClicked = `${node.name} (value: ${node.value ?? 'folder'})`;
	}

	/**
	 * Custom tooltip formatter
	 */
	function customTooltip(node: SunburstNode): string {
		const value = node.value;
		if (value !== undefined) {
			return `${node.name}\n${value.toLocaleString()} items`;
		}
		return node.name;
	}
</script>

<svelte:head>
	<title>Sunburst - Interactive Hierarchical Chart | tfeSvelteTemplates</title>
	<meta
		name="description"
		content="Interactive sunburst chart for visualizing hierarchical data. Features zoomable navigation, smooth animations, and customizable color schemes."
	/>
</svelte:head>

<div class="demo-page">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div>
				<h1>Sunburst</h1>
				<p class="subtitle">Interactive hierarchical radial visualization with zoom navigation</p>
			</div>
			<DatabaseStatus usingDatabase={data.usingDatabase} />
		</div>
	</header>

	<!-- Features Grid -->
	<section class="features-section">
		<h2>Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🔍</div>
				<h3>Zoomable</h3>
				<p>Click on segments to drill down into deeper levels of the hierarchy</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">↩️</div>
				<h3>Navigation</h3>
				<p>Click center circle or breadcrumb to zoom back out to parent levels</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Colour Schemes</h3>
				<p>Customizable colour palettes with automatic colour inheritance for children</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">✨</div>
				<h3>Animated</h3>
				<p>Smooth CSS transitions when zooming in and out of the hierarchy</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">💬</div>
				<h3>Tooltips</h3>
				<p>Hover over segments to see detailed information about each node</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">♿</div>
				<h3>Accessible</h3>
				<p>Full keyboard navigation with ARIA labels and focus indicators</p>
			</div>
		</div>
	</section>

	<!-- Example Switcher -->
	<section class="example-section">
		<h2>Interactive Examples</h2>
		<p class="example-description">
			Click on coloured segments to zoom into that section. Click the center circle or "← Back" button
			to navigate up the hierarchy.
		</p>

		<div class="example-switcher">
			<button
				class="example-button"
				class:active={activeExample === 'filesystem'}
				onclick={() => (activeExample = 'filesystem')}
			>
				📁 File System
			</button>
			<button
				class="example-button"
				class:active={activeExample === 'sales'}
				onclick={() => (activeExample = 'sales')}
			>
				📊 Sales Data
			</button>
		</div>

		<div class="example-demo">
			{#if activeExample === 'filesystem'}
				<Sunburst
					data={data.fileSystemData}
					width={500}
					height={500}
					onNodeClick={handleNodeClick}
					tooltipFormatter={customTooltip}
				/>
			{:else}
				<Sunburst
					data={data.salesData}
					width={500}
					height={500}
					onNodeClick={handleNodeClick}
				/>
			{/if}

			{#if lastClicked}
				<div class="selection-display">
					<strong>Last clicked:</strong>
					{lastClicked}
				</div>
			{/if}
		</div>

		<div class="code-block">
			<pre><code>{`${'<'}script>
  import Sunburst from '$lib/components/Sunburst.svelte';

  const data = {
    id: 'root',
    name: 'Website',
    children: [
      {
        id: 'src',
        name: 'src',
        color: '#3b82f6',
        children: [
          { id: 'components', name: 'components', value: 120 },
          { id: 'routes', name: 'routes', value: 85 }
        ]
      },
      // ... more nodes
    ]
  };
${'<'}/script>

<Sunburst
  {data}
  width={500}
  height={500}
  onNodeClick={(node) => console.log('Clicked:', node.name)}
/>`}</code></pre>
		</div>
	</section>

	<!-- Color Schemes Example -->
	<section class="example-section">
		<h2>Colour Schemes</h2>
		<p class="example-description">
			Customize the colour palette to match your application's theme. Colours are inherited by child
			nodes for visual hierarchy.
		</p>

		<div class="scheme-switcher">
			{#each Object.keys(colorSchemes) as scheme}
				<button
					class="scheme-button"
					class:active={selectedScheme === scheme}
					onclick={() => (selectedScheme = scheme as keyof typeof colorSchemes)}
				>
					{scheme.charAt(0).toUpperCase() + scheme.slice(1)}
				</button>
			{/each}
		</div>

		<div class="example-demo">
			<Sunburst
				data={data.fileSystemData}
				width={450}
				height={450}
				colorScheme={colorSchemes[selectedScheme]}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<Sunburst
  data={hierarchyData}
  colorScheme={['#0ea5e9', '#22d3ee', '#2dd4bf', '#34d399']}
/>`}</code></pre>
		</div>
	</section>

	<!-- Compact Example -->
	<section class="example-section">
		<h2>Compact Version</h2>
		<p class="example-description">
			Smaller charts without labels work great for thumbnails, dashboards, or side-by-side
			comparisons.
		</p>

		<div class="example-demo compact-demo">
			<div class="compact-chart">
				<Sunburst
					data={data.fileSystemData}
					width={250}
					height={250}
					showLabels={false}
					animationDuration={300}
				/>
				<span class="compact-label">File System</span>
			</div>
			<div class="compact-chart">
				<Sunburst
					data={data.salesData}
					width={250}
					height={250}
					showLabels={false}
					animationDuration={300}
				/>
				<span class="compact-label">Sales Data</span>
			</div>
		</div>

		<div class="code-block">
			<pre><code>{`<Sunburst
  data={data}
  width={250}
  height={250}
  showLabels={false}
  animationDuration={300}
/>`}</code></pre>
		</div>
	</section>

	<!-- Props Reference -->
	<section class="props-section">
		<h2>Props Reference</h2>
		<div class="props-table-container">
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
						<td><code>data</code></td>
						<td><code>SunburstNode</code></td>
						<td>required</td>
						<td>Root node of hierarchical data structure</td>
					</tr>
					<tr>
						<td><code>width</code></td>
						<td><code>number</code></td>
						<td><code>500</code></td>
						<td>Chart width in pixels</td>
					</tr>
					<tr>
						<td><code>height</code></td>
						<td><code>number</code></td>
						<td><code>500</code></td>
						<td>Chart height in pixels</td>
					</tr>
					<tr>
						<td><code>colorScheme</code></td>
						<td><code>string[]</code></td>
						<td>categorical palette</td>
						<td>Array of colours for segment colouring</td>
					</tr>
					<tr>
						<td><code>showLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Show text labels on segments</td>
					</tr>
					<tr>
						<td><code>labelMinAngle</code></td>
						<td><code>number</code></td>
						<td><code>10</code></td>
						<td>Minimum angle (degrees) to show label</td>
					</tr>
					<tr>
						<td><code>animationDuration</code></td>
						<td><code>number</code></td>
						<td><code>750</code></td>
						<td>Transition duration in milliseconds</td>
					</tr>
					<tr>
						<td><code>onNodeClick</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Callback: <code>(node: SunburstNode) => void</code></td>
					</tr>
					<tr>
						<td><code>tooltipFormatter</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Custom tooltip: <code>(node: SunburstNode) => string</code></td>
					</tr>
					<tr>
						<td><code>class</code></td>
						<td><code>string</code></td>
						<td><code>''</code></td>
						<td>Additional CSS classes</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Data Structure -->
	<section class="data-section">
		<h2>Data Structure</h2>
		<p class="example-description">
			The Sunburst component accepts hierarchical data where each node can have children. Leaf nodes
			should have a <code>value</code> property to determine arc size.
		</p>

		<div class="code-block">
			<pre><code>{`interface SunburstNode {
  id: string;           // Unique identifier
  name: string;         // Display name
  value?: number;       // Size (required for leaf nodes)
  color?: string;       // Optional hex colour
  children?: SunburstNode[];  // Child nodes
}

// Example data structure
const data: SunburstNode = {
  id: 'root',
  name: 'Total Sales',
  children: [
    {
      id: 'europe',
      name: 'Europe',
      color: '#3b82f6',  // Blue
      children: [
        { id: 'uk', name: 'UK', value: 450 },
        { id: 'de', name: 'Germany', value: 380 },
        { id: 'fr', name: 'France', value: 290 }
      ]
    },
    {
      id: 'americas',
      name: 'Americas',
      color: '#10b981',  // Green
      children: [
        { id: 'us', name: 'USA', value: 780 },
        { id: 'ca', name: 'Canada', value: 340 }
      ]
    }
  ]
};`}</code></pre>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2>Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<h3>📁 File Systems</h3>
				<p>Visualise disk usage and folder structures with intuitive drill-down navigation</p>
			</div>
			<div class="use-case-card">
				<h3>💰 Budget Breakdown</h3>
				<p>Show expense categories, departments, and line items in a hierarchical view</p>
			</div>
			<div class="use-case-card">
				<h3>🌍 Geographic Sales</h3>
				<p>Display sales data by region, country, and city with proportional segments</p>
			</div>
			<div class="use-case-card">
				<h3>🏢 Organisation Charts</h3>
				<p>Represent company structure from departments down to individual teams</p>
			</div>
			<div class="use-case-card">
				<h3>📊 Analytics</h3>
				<p>Break down user journeys, traffic sources, or conversion funnels</p>
			</div>
			<div class="use-case-card">
				<h3>🧬 Scientific Data</h3>
				<p>Taxonomy trees, molecular structures, or classification hierarchies</p>
			</div>
		</div>
	</section>

	<!-- Technical Details -->
	<section class="technical-section">
		<h2>Implementation Details</h2>
		<div class="technical-grid">
			<div class="technical-card">
				<h3>Zero Dependencies</h3>
				<p>Built with pure Svelte 5 and SVG. No D3 or external charting libraries required.</p>
			</div>
			<div class="technical-card">
				<h3>Partition Layout</h3>
				<p>
					D3-style partition algorithm computed natively for arc angle and radius calculations.
				</p>
			</div>
			<div class="technical-card">
				<h3>CSS Animations</h3>
				<p>Smooth zoom transitions using CSS transitions on SVG path elements.</p>
			</div>
			<div class="technical-card">
				<h3>Keyboard Support</h3>
				<p>Enter/Space to zoom in, Escape to zoom out, Tab to navigate between segments.</p>
			</div>
		</div>
	</section>
</div>

<style>
	/**
	 * Page layout
	 */
	.demo-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	/**
	 * Header
	 */
	.header {
		margin-bottom: 3rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		flex-wrap: wrap;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		margin: 0;
	}

	h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #1f2937;
	}

	/**
	 * Features Section
	 */
	.features-section {
		margin-bottom: 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.feature-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.feature-card p {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/**
	 * Example Sections
	 */
	.example-section {
		margin-bottom: 4rem;
	}

	.example-description {
		color: #6b7280;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.example-switcher {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.example-button {
		padding: 0.75rem 1.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.example-button:hover {
		border-color: #9ca3af;
		background: #f9fafb;
	}

	.example-button.active {
		border-color: #3b82f6;
		background: #eff6ff;
		color: #3b82f6;
	}

	.example-demo {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.compact-demo {
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}

	.compact-chart {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.compact-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.selection-display {
		padding: 0.75rem 1rem;
		background: #f3f4f6;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #1f2937;
	}

	/**
	 * Scheme Switcher
	 */
	.scheme-switcher {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.scheme-button {
		padding: 0.625rem 1.25rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.scheme-button:hover {
		border-color: #9ca3af;
		background: #f9fafb;
	}

	.scheme-button.active {
		border-color: #3b82f6;
		background: #eff6ff;
		color: #3b82f6;
	}

	/**
	 * Code Blocks
	 */
	.code-block {
		background: #1f2937;
		border-radius: 8px;
		padding: 1.5rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #e5e7eb;
	}

	/**
	 * Data Structure Section
	 */
	.data-section {
		margin-bottom: 4rem;
	}

	.data-section code {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #db2777;
	}

	/**
	 * Props Table
	 */
	.props-section {
		margin-bottom: 4rem;
	}

	.props-table-container {
		overflow-x: auto;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.props-table thead {
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.props-table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: #1f2937;
	}

	.props-table td {
		padding: 0.75rem 1rem;
		border-top: 1px solid #e5e7eb;
		color: #374151;
	}

	.props-table code {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.8125rem;
		color: #db2777;
	}

	/**
	 * Use Cases Section
	 */
	.use-cases-section {
		margin-bottom: 4rem;
	}

	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.use-case-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.use-case-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.use-case-card p {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/**
	 * Technical Section
	 */
	.technical-section {
		margin-bottom: 4rem;
	}

	.technical-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.technical-card {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.technical-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #166534;
	}

	.technical-card p {
		margin: 0;
		color: #15803d;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/**
	 * Responsive adjustments
	 */
	@media (max-width: 640px) {
		.demo-page {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.example-demo {
			padding: 1rem;
		}

		.compact-demo {
			flex-direction: column;
		}

		.code-block {
			padding: 1rem;
		}

		.props-table {
			font-size: 0.8125rem;
		}

		.props-table th,
		.props-table td {
			padding: 0.5rem;
		}
	}

	/**
	 * Dark mode support
	 */
	@media (prefers-color-scheme: dark) {
		.demo-page {
			background: #111827;
		}

		h1,
		h2 {
			color: #f9fafb;
		}

		.subtitle,
		.example-description {
			color: #9ca3af;
		}

		.feature-card,
		.use-case-card {
			background: #1f2937;
			border-color: #374151;
		}

		.feature-card h3,
		.use-case-card h3 {
			color: #f9fafb;
		}

		.feature-card p,
		.use-case-card p {
			color: #9ca3af;
		}

		.example-demo {
			background: #1f2937;
			border-color: #374151;
		}

		.example-button,
		.scheme-button {
			background: #1f2937;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.example-button:hover,
		.scheme-button:hover {
			background: #374151;
			border-color: #6b7280;
		}

		.example-button.active,
		.scheme-button.active {
			background: #1e3a5f;
			border-color: #3b82f6;
			color: #93c5fd;
		}

		.selection-display {
			background: #374151;
			color: #f3f4f6;
		}

		.compact-label {
			color: #9ca3af;
		}

		.props-table-container {
			background: #1f2937;
			border-color: #374151;
		}

		.props-table thead {
			background: #374151;
			border-color: #4b5563;
		}

		.props-table th {
			color: #f9fafb;
		}

		.props-table td {
			color: #e5e7eb;
			border-color: #374151;
		}

		.props-table code,
		.data-section code {
			background: #374151;
			color: #f472b6;
		}

		.technical-card {
			background: #064e3b;
			border-color: #047857;
		}

		.technical-card h3 {
			color: #a7f3d0;
		}

		.technical-card p {
			color: #6ee7b7;
		}
	}
</style>
