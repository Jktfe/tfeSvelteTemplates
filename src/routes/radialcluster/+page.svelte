<script lang="ts">
	import RadialCluster from '$lib/components/RadialCluster.svelte';
	import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
	import type { RadialClusterNode } from '$lib/types';

	/**
	 * Smaller example dataset for demo purposes
	 */
	const simpleData: RadialClusterNode = {
		name: 'root',
		children: [
			{
				name: 'Category A',
				children: [
					{ name: 'Item A1' },
					{ name: 'Item A2' },
					{ name: 'Item A3' }
				]
			},
			{
				name: 'Category B',
				children: [
					{ name: 'Item B1' },
					{ name: 'Item B2' },
					{
						name: 'Subcategory B3',
						children: [
							{ name: 'Item B3a' },
							{ name: 'Item B3b' }
						]
					}
				]
			},
			{
				name: 'Category C',
				children: [
					{ name: 'Item C1' },
					{ name: 'Item C2' }
				]
			}
		]
	};

	/**
	 * Color scheme presets for radial cluster
	 */
	const colorSchemes = {
		default: { parent: '#555', leaf: '#999', link: '#555', name: 'Default Gray' },
		blue: { parent: '#1e40af', leaf: '#60a5fa', link: '#3b82f6', name: 'Ocean Blue' },
		green: { parent: '#166534', leaf: '#4ade80', link: '#22c55e', name: 'Forest Green' },
		purple: { parent: '#6b21a8', leaf: '#c084fc', link: '#a855f7', name: 'Royal Purple' },
		warm: { parent: '#9a3412', leaf: '#fb923c', link: '#ea580c', name: 'Warm Orange' }
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');
	let showLabels = $state(true);
	let rotateLabels = $state(true);
</script>

<svelte:head>
	<title>RadialCluster - Hierarchical Tree Visualization | tfeSvelteTemplates</title>
	<meta
		name="description"
		content="Native Svelte 5 radial cluster component for visualizing hierarchical data in a circular dendrogram layout. Zero dependencies, fully interactive."
	/>
</svelte:head>

<div class="demo-page">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div>
				<h1>RadialCluster</h1>
				<p class="subtitle">Circular dendrogram for hierarchical data visualization</p>
			</div>
			<div class="badge-container">
				<span class="badge badge-native">Native Implementation</span>
				<span class="badge badge-zero">Zero Dependencies</span>
			</div>
		</div>
	</header>

	<!-- Features Grid -->
	<section class="features-section">
		<h2>Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🌳</div>
				<h3>Hierarchical Layout</h3>
				<p>Cluster algorithm positions leaf nodes at equal depth from center</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🔗</div>
				<h3>Radial Links</h3>
				<p>Curved Bézier paths connect parent and child nodes naturally</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🏷️</div>
				<h3>Rotated Labels</h3>
				<p>Text labels rotate to follow radial direction for readability</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">💬</div>
				<h3>Interactive Tooltips</h3>
				<p>Hover over nodes to see details, depth, and child count</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Customisable</h3>
				<p>Full control over colours, sizes, fonts, and styling</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📦</div>
				<h3>Copy-Paste Ready</h3>
				<p>Self-contained component with no external charting library required</p>
			</div>
		</div>
	</section>

	<!-- Example 1: Full Flare Dataset -->
	<section class="example-section">
		<h2>Full Dataset Example</h2>
		<p class="example-description">
			The classic D3 "flare" dataset showing a software package hierarchy. This demonstrates the
			component's ability to handle complex, deeply nested data structures with many nodes.
		</p>

		<div class="example-demo">
			<RadialCluster
				data={FALLBACK_RADIAL_CLUSTER_DATA}
				width={900}
				height={900}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`${'<'}script>
  import RadialCluster from '$lib/components/RadialCluster.svelte';
  import { FALLBACK_RADIAL_CLUSTER_DATA } from '$lib/constants';
${'<'}/script>

<RadialCluster
  data={FALLBACK_RADIAL_CLUSTER_DATA}
  width={900}
  height={900}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 2: Simple Data -->
	<section class="example-section">
		<h2>Simple Data Structure</h2>
		<p class="example-description">
			A smaller dataset to demonstrate the basic structure. Perfect for category trees,
			organisation charts, or any simple hierarchy.
		</p>

		<div class="example-demo">
			<RadialCluster
				data={simpleData}
				width={600}
				height={600}
				fontSize={12}
				nodeRadius={4}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`const data = {
  name: 'root',
  children: [
    {
      name: 'Category A',
      children: [
        { name: 'Item A1' },
        { name: 'Item A2' },
        { name: 'Item A3' }
      ]
    },
    // ... more categories
  ]
};

<RadialCluster
  data={data}
  width={600}
  height={600}
  fontSize={12}
  nodeRadius={4}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 3: Color Schemes -->
	<section class="example-section">
		<h2>Colour Schemes</h2>
		<p class="example-description">
			Customise the colour palette to match your application's theme. Control node colours,
			link colours, and opacity independently.
		</p>

		<div class="scheme-switcher">
			{#each Object.entries(colorSchemes) as [key, scheme] (key)}
				<button
					class="scheme-button"
					class:active={selectedScheme === key}
					onclick={() => (selectedScheme = key as keyof typeof colorSchemes)}
				>
					{scheme.name}
				</button>
			{/each}
		</div>

		<div class="example-demo">
			<RadialCluster
				data={simpleData}
				width={500}
				height={500}
				nodeColorParent={colorSchemes[selectedScheme].parent}
				nodeColorLeaf={colorSchemes[selectedScheme].leaf}
				linkColor={colorSchemes[selectedScheme].link}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<RadialCluster
  data={data}
  nodeColorParent="${colorSchemes[selectedScheme].parent}"
  nodeColorLeaf="${colorSchemes[selectedScheme].leaf}"
  linkColor="${colorSchemes[selectedScheme].link}"
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 4: Label Options -->
	<section class="example-section">
		<h2>Label Configuration</h2>
		<p class="example-description">
			Control how labels are displayed - toggle visibility, rotation, and styling.
		</p>

		<div class="toggle-controls">
			<label class="toggle-label">
				<input type="checkbox" bind:checked={showLabels} />
				<span>Show Labels</span>
			</label>
			<label class="toggle-label">
				<input type="checkbox" bind:checked={rotateLabels} disabled={!showLabels} />
				<span>Rotate Labels</span>
			</label>
		</div>

		<div class="example-demo">
			<RadialCluster
				data={simpleData}
				width={500}
				height={500}
				{showLabels}
				{rotateLabels}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<RadialCluster
  data={data}
  showLabels={${showLabels}}
  rotateLabels={${rotateLabels}}
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
						<td><code>RadialClusterNode</code></td>
						<td>required</td>
						<td>Hierarchical data with name and optional children array</td>
					</tr>
					<tr>
						<td><code>width</code></td>
						<td><code>number</code></td>
						<td><code>800</code></td>
						<td>Container width in pixels</td>
					</tr>
					<tr>
						<td><code>height</code></td>
						<td><code>number</code></td>
						<td><code>800</code></td>
						<td>Container height in pixels</td>
					</tr>
					<tr>
						<td><code>innerRadius</code></td>
						<td><code>number</code></td>
						<td><code>100</code></td>
						<td>Radius where root node starts</td>
					</tr>
					<tr>
						<td><code>outerRadius</code></td>
						<td><code>number</code></td>
						<td>auto</td>
						<td>Radius where leaf nodes end (calculated from size if not set)</td>
					</tr>
					<tr>
						<td><code>nodeRadius</code></td>
						<td><code>number</code></td>
						<td><code>2.5</code></td>
						<td>Radius of node circles in pixels</td>
					</tr>
					<tr>
						<td><code>nodeColorParent</code></td>
						<td><code>string</code></td>
						<td><code>'#555'</code></td>
						<td>Colour for parent nodes (with children)</td>
					</tr>
					<tr>
						<td><code>nodeColorLeaf</code></td>
						<td><code>string</code></td>
						<td><code>'#999'</code></td>
						<td>Colour for leaf nodes (no children)</td>
					</tr>
					<tr>
						<td><code>linkColor</code></td>
						<td><code>string</code></td>
						<td><code>'#555'</code></td>
						<td>Colour for connecting lines</td>
					</tr>
					<tr>
						<td><code>linkOpacity</code></td>
						<td><code>number</code></td>
						<td><code>0.4</code></td>
						<td>Opacity of connecting lines (0-1)</td>
					</tr>
					<tr>
						<td><code>linkWidth</code></td>
						<td><code>number</code></td>
						<td><code>1.5</code></td>
						<td>Width of connecting lines in pixels</td>
					</tr>
					<tr>
						<td><code>fontSize</code></td>
						<td><code>number</code></td>
						<td><code>11</code></td>
						<td>Font size for labels in pixels</td>
					</tr>
					<tr>
						<td><code>fontFamily</code></td>
						<td><code>string</code></td>
						<td><code>'system-ui, sans-serif'</code></td>
						<td>Font family for labels</td>
					</tr>
					<tr>
						<td><code>labelColor</code></td>
						<td><code>string</code></td>
						<td><code>'#333'</code></td>
						<td>Colour for text labels</td>
					</tr>
					<tr>
						<td><code>showLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Whether to display node labels</td>
					</tr>
					<tr>
						<td><code>rotateLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Rotate labels to follow radial direction</td>
					</tr>
					<tr>
						<td><code>separation</code></td>
						<td><code>number</code></td>
						<td><code>1</code></td>
						<td>Separation factor between sibling nodes</td>
					</tr>
					<tr>
						<td><code>class</code></td>
						<td><code>string</code></td>
						<td><code>''</code></td>
						<td>Additional CSS classes for container</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Data Structure -->
	<section class="example-section">
		<h2>Data Structure</h2>
		<p class="example-description">
			The component expects hierarchical data where each node has a <code>name</code> and
			optional <code>children</code> array. The <code>value</code> property is optional
			and can be used for additional data.
		</p>

		<div class="code-block">
			<pre><code>{`interface RadialClusterNode {
  name: string;           // Display label for the node
  children?: RadialClusterNode[];  // Optional child nodes
  value?: number;         // Optional numeric value
}

// Example:
const data: RadialClusterNode = {
  name: 'root',
  children: [
    {
      name: 'Branch A',
      children: [
        { name: 'Leaf 1', value: 100 },
        { name: 'Leaf 2', value: 200 }
      ]
    },
    {
      name: 'Branch B',
      children: [
        { name: 'Leaf 3', value: 150 }
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
				<p>Visualise directory structures and file hierarchies in a compact circular layout</p>
			</div>
			<div class="use-case-card">
				<h3>🏢 Organisational Charts</h3>
				<p>Display company structures, team hierarchies, and reporting relationships</p>
			</div>
			<div class="use-case-card">
				<h3>🧬 Taxonomies</h3>
				<p>Show biological classifications, category trees, or knowledge taxonomies</p>
			</div>
			<div class="use-case-card">
				<h3>📦 Package Dependencies</h3>
				<p>Visualise software module structures and dependency trees</p>
			</div>
			<div class="use-case-card">
				<h3>🌿 Evolutionary Trees</h3>
				<p>Display phylogenetic trees and evolutionary relationships</p>
			</div>
			<div class="use-case-card">
				<h3>🗂️ Document Structures</h3>
				<p>Show book chapters, section hierarchies, or content outlines</p>
			</div>
		</div>
	</section>

	<!-- Technical Details -->
	<section class="technical-section">
		<h2>Implementation Details</h2>
		<div class="technical-grid">
			<div class="technical-card">
				<h3>Native Algorithm</h3>
				<p>
					Custom cluster layout algorithm positions nodes without D3. Leaf nodes are placed at
					equal radius, internal nodes at the mean angle of descendants.
				</p>
			</div>
			<div class="technical-card">
				<h3>SVG Rendering</h3>
				<p>
					Pure SVG output with viewBox scaling for responsive display. No canvas or WebGL
					dependencies.
				</p>
			</div>
			<div class="technical-card">
				<h3>Radial Links</h3>
				<p>
					Cubic Bézier curves connect nodes along radial paths, creating natural-looking
					connections between hierarchy levels.
				</p>
			</div>
			<div class="technical-card">
				<h3>Accessibility</h3>
				<p>
					ARIA labels, keyboard navigation, and focus management for screen reader compatibility.
				</p>
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

	.badge-container {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.badge {
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge-native {
		background: #dbeafe;
		color: #1e40af;
	}

	.badge-zero {
		background: #dcfce7;
		color: #166534;
	}

	/**
	 * Features Section
	 */
	.features-section {
		margin-bottom: 4rem;
	}

	.features-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #1f2937;
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

	.example-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: #1f2937;
	}

	.example-description {
		color: #6b7280;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.example-description code {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #db2777;
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
		overflow-x: auto;
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
	 * Toggle Controls
	 */
	.toggle-controls {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		color: #374151;
	}

	.toggle-label input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		accent-color: #3b82f6;
	}

	.toggle-label input:disabled + span {
		color: #9ca3af;
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
	 * Props Table
	 */
	.props-section {
		margin-bottom: 4rem;
	}

	.props-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #1f2937;
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

	.use-cases-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #1f2937;
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

	.technical-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #1f2937;
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
</style>
