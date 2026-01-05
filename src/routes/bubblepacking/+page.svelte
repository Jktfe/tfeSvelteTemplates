<script lang="ts">
	import BubblePacking from '$lib/components/BubblePacking.svelte';
	import { FALLBACK_BUBBLE_DATA, BUBBLE_COLOR_SCHEME } from '$lib/constants';
	import type { BubbleItem } from '$lib/types';

	/**
	 * Selected bubble for display
	 */
	let selectedBubble = $state<BubbleItem | null>(null);

	/**
	 * Alternative color schemes
	 */
	const colorSchemes = {
		default: { colors: BUBBLE_COLOR_SCHEME, name: 'Tableau' },
		pastel: {
			colors: ['#a8dadc', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653'],
			name: 'Pastel'
		},
		vibrant: {
			colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#ff6b6b'],
			name: 'Vibrant'
		},
		monochrome: {
			colors: ['#1a365d', '#2a4a7f', '#3d5a9f', '#5a7abf', '#7a9adf', '#9abafe'],
			name: 'Blue Mono'
		}
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');

	/**
	 * Custom data for smaller example
	 */
	const smallDataset: BubbleItem[] = [
		{ id: 'react', label: 'React', value: 85, group: 'Frameworks' },
		{ id: 'vue', label: 'Vue', value: 55, group: 'Frameworks' },
		{ id: 'svelte', label: 'Svelte', value: 40, group: 'Frameworks' },
		{ id: 'angular', label: 'Angular', value: 65, group: 'Frameworks' },
		{ id: 'typescript', label: 'TypeScript', value: 70, group: 'Languages' },
		{ id: 'javascript', label: 'JavaScript', value: 95, group: 'Languages' },
		{ id: 'python', label: 'Python', value: 80, group: 'Languages' }
	];

	/**
	 * Calculate statistics from bubble data
	 * Includes guard clause for empty data arrays
	 */
	const stats = $derived(() => {
		// Guard clause: return defaults if data is empty
		if (FALLBACK_BUBBLE_DATA.length === 0) {
			return {
				totalValue: 0,
				count: 0,
				groups: 0,
				largestBubble: { id: '', label: 'N/A', value: 0 }
			};
		}

		const totalValue = FALLBACK_BUBBLE_DATA.reduce((sum, b) => sum + b.value, 0);
		const groups = new Set(FALLBACK_BUBBLE_DATA.map((b) => b.group)).size;
		const largestBubble = FALLBACK_BUBBLE_DATA.reduce(
			(max, b) => (b.value > max.value ? b : max),
			FALLBACK_BUBBLE_DATA[0]
		);
		return {
			totalValue,
			count: FALLBACK_BUBBLE_DATA.length,
			groups,
			largestBubble
		};
	});

	/**
	 * Handle bubble click
	 */
	function handleBubbleClick(bubble: BubbleItem) {
		selectedBubble = bubble;
	}
</script>

<svelte:head>
	<title>BubblePacking - Interactive Circle Packing Visualization | tfeSvelteTemplates</title>
	<meta
		name="description"
		content="Interactive bubble packing visualization component with force simulation. Features tooltips, click handlers, and customizable color schemes."
	/>
</svelte:head>

<div class="demo-page">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div>
				<h1>BubblePacking</h1>
				<p class="subtitle">Interactive circle packing visualization with force simulation</p>
			</div>
			<div class="badge">Zero Dependencies</div>
		</div>
	</header>

	<!-- Statistics Cards -->
	<section class="stats-section">
		<div class="stat-card">
			<div class="stat-value">{stats().count}</div>
			<div class="stat-label">Total Bubbles</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats().groups}</div>
			<div class="stat-label">Groups</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats().totalValue.toLocaleString()}</div>
			<div class="stat-label">Total Value</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{stats().largestBubble.label}</div>
			<div class="stat-label">Largest Bubble</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="features-section">
		<h2>Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🔵</div>
				<h3>Circle Packing</h3>
				<p>Native algorithm packs circles efficiently using force-directed placement</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Group Colouring</h3>
				<p>Automatic colour coding by group with customisable palette</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">💬</div>
				<h3>Tooltips</h3>
				<p>Hover tooltips showing label and value for each bubble</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">⚡</div>
				<h3>Force Simulation</h3>
				<p>Smooth animated positioning with collision detection</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📊</div>
				<h3>Area Scaling</h3>
				<p>Bubble area proportional to value (square root scaling)</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">♿</div>
				<h3>Accessible</h3>
				<p>ARIA labels, keyboard navigation, and screen reader support</p>
			</div>
		</div>
	</section>

	<!-- Example 1: Basic Bubble Chart -->
	<section class="example-section">
		<h2>Technology Market Overview</h2>
		<p class="example-description">
			Interactive bubble chart showing technology market segments by revenue. Click on any bubble to
			see details. Hover to view tooltips.
		</p>

		<div class="example-demo">
			<BubblePacking data={FALLBACK_BUBBLE_DATA} width={700} height={500} onBubbleClick={handleBubbleClick} />

			{#if selectedBubble}
				<div class="selection-display">
					<strong>Selected:</strong>
					{selectedBubble.label} ({selectedBubble.group}) - £{selectedBubble.value}B
				</div>
			{/if}
		</div>

		<div class="code-block">
			<pre><code>{`${'<'}script>
  import BubblePacking from '$lib/components/BubblePacking.svelte';

  const bubbleData = [
    { id: 'aws', label: 'AWS', value: 80, group: 'Cloud' },
    { id: 'azure', label: 'Azure', value: 65, group: 'Cloud' },
    { id: 'facebook', label: 'Facebook', value: 115, group: 'Social' },
    // ... more data
  ];
${'<'}/script>

<BubblePacking
  data={bubbleData}
  width={700}
  height={500}
  onBubbleClick={(bubble) => console.log(bubble)}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 2: Color Schemes -->
	<section class="example-section">
		<h2>Colour Schemes</h2>
		<p class="example-description">
			Customize the colour palette to match your application's theme. Choose from preset schemes or
			define your own array of hex colours.
		</p>

		<div class="scheme-switcher">
			{#each Object.entries(colorSchemes) as [key, scheme]}
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
			<BubblePacking
				data={smallDataset}
				width={500}
				height={400}
				colorScheme={colorSchemes[selectedScheme].colors}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<BubblePacking
  data={bubbleData}
  colorScheme={['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c']}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 3: Compact Version -->
	<section class="example-section">
		<h2>Compact Version</h2>
		<p class="example-description">
			Smaller bubbles without labels for embedding in dashboards and summary views. Labels are hidden
			when bubble radius is below the threshold.
		</p>

		<div class="example-demo">
			<BubblePacking
				data={FALLBACK_BUBBLE_DATA}
				width={400}
				height={400}
				showLabels={true}
				labelThreshold={25}
				padding={2}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<BubblePacking
  data={bubbleData}
  width={400}
  height={400}
  showLabels={true}
  labelThreshold={25}
  padding={2}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 4: Without Force Simulation -->
	<section class="example-section">
		<h2>Static Placement</h2>
		<p class="example-description">
			Disable force simulation for faster rendering with fewer iterations. This results in a quicker
			initial layout but may have slightly more overlap.
		</p>

		<div class="example-demo">
			<BubblePacking
				data={smallDataset}
				width={500}
				height={400}
				useForce={false}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<BubblePacking
  data={bubbleData}
  width={500}
  height={400}
  useForce={false}
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
						<td><code>BubbleItem[]</code></td>
						<td>required</td>
						<td>Array of bubble items with id, label, value, and optional group/color</td>
					</tr>
					<tr>
						<td><code>width</code></td>
						<td><code>number</code></td>
						<td><code>600</code></td>
						<td>Container width in pixels</td>
					</tr>
					<tr>
						<td><code>height</code></td>
						<td><code>number</code></td>
						<td><code>600</code></td>
						<td>Container height in pixels</td>
					</tr>
					<tr>
						<td><code>padding</code></td>
						<td><code>number</code></td>
						<td><code>3</code></td>
						<td>Padding between circles in pixels</td>
					</tr>
					<tr>
						<td><code>colorScheme</code></td>
						<td><code>string[]</code></td>
						<td>Tableau10</td>
						<td>Array of hex colours for group colouring</td>
					</tr>
					<tr>
						<td><code>showLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Show text labels on bubbles</td>
					</tr>
					<tr>
						<td><code>labelThreshold</code></td>
						<td><code>number</code></td>
						<td><code>20</code></td>
						<td>Minimum radius to show labels</td>
					</tr>
					<tr>
						<td><code>useForce</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Use force simulation for smooth animation</td>
					</tr>
					<tr>
						<td><code>onBubbleClick</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Click handler: <code>(bubble: BubbleItem) =&gt; void</code></td>
					</tr>
					<tr>
						<td><code>onBubbleHover</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Hover handler: <code>(bubble: BubbleItem | null) =&gt; void</code></td>
					</tr>
					<tr>
						<td><code>tooltipFormatter</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Custom tooltip: <code>(bubble: BubbleItem) =&gt; string</code></td>
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
	<section class="example-section">
		<h2>Data Structure</h2>
		<p class="example-description">
			Each bubble item requires an id, label, and value. Optional properties include group (for colour
			coding) and color (for explicit bubble colour).
		</p>

		<div class="code-block">
			<pre><code>{`interface BubbleItem {
  id: string;           // Unique identifier
  label: string;        // Display text
  value: number;        // Numeric value (determines size)
  color?: string;       // Optional: explicit hex colour
  group?: string;       // Optional: group name for colour coding
  children?: BubbleItem[]; // Optional: nested children for hierarchy
}`}</code></pre>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2>Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<h3>📊 Market Share</h3>
				<p>Visualise company or product market share with proportional sizing</p>
			</div>
			<div class="use-case-card">
				<h3>💰 Portfolio Allocation</h3>
				<p>Display investment portfolios with asset allocation by value</p>
			</div>
			<div class="use-case-card">
				<h3>🏷️ Tag Clouds</h3>
				<p>Show keyword or tag frequency with size indicating importance</p>
			</div>
			<div class="use-case-card">
				<h3>🏢 Organisation Charts</h3>
				<p>Represent team sizes or departmental budgets visually</p>
			</div>
			<div class="use-case-card">
				<h3>📈 Category Analysis</h3>
				<p>Compare categories or segments with grouped bubble clusters</p>
			</div>
			<div class="use-case-card">
				<h3>🔬 Scientific Data</h3>
				<p>Visualise population sizes, gene expression, or research metrics</p>
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
					Built with pure Svelte 5 and native web technologies. No D3 or external charting libraries
					required.
				</p>
			</div>
			<div class="technical-card">
				<h3>Force Simulation</h3>
				<p>
					Iterative collision detection pushes overlapping circles apart while attracting them to
					center.
				</p>
			</div>
			<div class="technical-card">
				<h3>Area Scaling</h3>
				<p>
					Uses square root scaling so bubble area (not radius) is proportional to value.
				</p>
			</div>
			<div class="technical-card">
				<h3>Responsive SVG</h3>
				<p>ViewBox-based rendering ensures crisp display on all screen sizes and devices.</p>
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

	.badge {
		background: #dcfce7;
		color: #166534;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/**
	 * Statistics Section
	 */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
