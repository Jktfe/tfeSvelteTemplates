<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/**
	 * Color scheme presets
	 */
	const colorSchemes = {
		github: { low: '#ebedf0', high: '#216e39', name: 'GitHub Green' },
		fire: { low: '#fff5f0', high: '#de2d26', name: 'Fire Red' },
		ocean: { low: '#f0f9ff', high: '#0369a1', name: 'Ocean Blue' },
		sunset: { low: '#fef3c7', high: '#d97706', name: 'Sunset Orange' }
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('github');
	let selectedDate = $state<string | null>(null);

	/**
	 * Date range presets for the custom range filter
	 */
	const dateRangePresets = {
		'30': { label: '30 Days', days: 30 },
		'90': { label: '90 Days', days: 90 },
		'180': { label: '180 Days', days: 180 },
		'365': { label: '1 Year', days: 365 }
	};

	let selectedRange = $state<keyof typeof dateRangePresets>('90');

	/**
	 * Generate filtered data based on selected range
	 */
	const filteredData = $derived.by(() => {
		const days = dateRangePresets[selectedRange].days;
		const startDate = new SvelteDate();
		startDate.setDate(startDate.getDate() - days);
		return data.calendarData.filter((d) => new SvelteDate(d.date) >= startDate);
	});

	/**
	 * Calculate start date for selected range
	 */
	const rangeStartDate = $derived.by(() => {
		const days = dateRangePresets[selectedRange].days;
		const date = new SvelteDate();
		date.setDate(date.getDate() - days);
		return date;
	});

	/**
	 * Handle cell click
	 */
	function handleCellClick(date: string, value: number) {
		selectedDate = `${date}: ${value} contributions`;
	}
</script>

<svelte:head>
	<title>CalendarHeatmap - GitHub-Style Contribution Calendar | tfeSvelteTemplates</title>
	<meta
		name="description"
		content="Interactive calendar heatmap component with GitHub-style contribution visualization. Features tooltips, keyboard navigation, and customizable colors."
	/>
</svelte:head>

<div class="demo-page">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div>
				<h1>CalendarHeatmap</h1>
				<p class="subtitle">GitHub-style contribution calendar with interactive features</p>
			</div>
			<DatabaseStatus usingDatabase={data.usingDatabase} />
		</div>
	</header>

	<!-- Statistics Cards (if database is available) -->
	{#if data.stats}
		<section class="stats-section">
			<div class="stat-card">
				<div class="stat-value">{data.stats.totalActivity.toLocaleString()}</div>
				<div class="stat-label">Total Contributions</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{data.stats.totalDays}</div>
				<div class="stat-label">Active Days</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{data.stats.avgActivity.toFixed(1)}</div>
				<div class="stat-label">Average Per Day</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{data.stats.maxActivity}</div>
				<div class="stat-label">Best Day</div>
			</div>
		</section>
	{/if}

	<!-- Features Grid -->
	<section class="features-section">
		<h2>Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">📅</div>
				<h3>Calendar Grid</h3>
				<p>52 weeks × 7 days grid with Sunday-Saturday layout, matching GitHub's design</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Color Levels</h3>
				<p>5 discrete intensity levels with customizable color schemes</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">💬</div>
				<h3>Tooltips</h3>
				<p>Hover tooltips showing date and contribution count</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">⌨️</div>
				<h3>Keyboard Nav</h3>
				<p>Arrow key navigation with Enter/Space for selection</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📱</div>
				<h3>Responsive</h3>
				<p>SVG-based rendering scales perfectly on all screen sizes</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">♿</div>
				<h3>Accessible</h3>
				<p>Full ARIA labels, keyboard support, and screen reader compatibility</p>
			</div>
		</div>
	</section>

	<!-- Example 1: Basic Calendar -->
	<section class="example-section">
		<h2>Basic Calendar</h2>
		<p class="example-description">
			Default GitHub-style calendar showing past 365 days of activity. Hover over cells to see
			details, click to select.
		</p>

		<div class="example-demo">
			<CalendarHeatmap data={data.calendarData} onCellClick={handleCellClick} />

			{#if selectedDate}
				<div class="selection-display">
					<strong>Selected:</strong>
					{selectedDate}
				</div>
			{/if}
		</div>

		<div class="code-block">
			<pre><code>{`${'<'}script>
  import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';

  let activityData = [
    { date: '2024-01-15', value: 12 },
    { date: '2024-01-16', value: 8 },
    // ... more data
  ];
${'<'}/script>

<CalendarHeatmap
  data={activityData}
  onCellClick={(date, value) => console.log(date, value)}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 2: Color Schemes -->
	<section class="example-section">
		<h2>Color Schemes</h2>
		<p class="example-description">
			Customize the color palette to match your application's theme. Choose from preset schemes or
			define your own.
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
			<CalendarHeatmap
				data={data.calendarData}
				colorLow={colorSchemes[selectedScheme].low}
				colorHigh={colorSchemes[selectedScheme].high}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<CalendarHeatmap
  data={activityData}
  colorLow="#f0f9ff"
  colorHigh="#0369a1"
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 3: Compact Version -->
	<section class="example-section">
		<h2>Compact Version</h2>
		<p class="example-description">
			Smaller cells without labels for embedding in tight spaces. Perfect for dashboards and summary
			views.
		</p>

		<div class="example-demo">
			<CalendarHeatmap
				data={data.calendarData}
				cellSize={8}
				cellGap={2}
				showWeekLabels={false}
				showMonthLabels={false}
				showLegend={false}
			/>
		</div>

		<div class="code-block">
			<pre><code>{`<CalendarHeatmap
  data={activityData}
  cellSize={8}
  cellGap={2}
  showWeekLabels={false}
  showMonthLabels={false}
  showLegend={false}
/>`}</code></pre>
		</div>
	</section>

	<!-- Example 4: Custom Date Range -->
	<section class="example-section">
		<h2>Custom Date Range</h2>
		<p class="example-description">
			Display a specific date range instead of the default 365 days. Use the filter to select
			different time periods.
		</p>

		<div class="range-filter">
			{#each Object.entries(dateRangePresets) as [key, preset] (key)}
				<button
					class="range-button"
					class:active={selectedRange === key}
					onclick={() => (selectedRange = key as keyof typeof dateRangePresets)}
				>
					{preset.label}
				</button>
			{/each}
		</div>

		<div class="example-demo">
			<CalendarHeatmap data={filteredData} startDate={rangeStartDate} endDate={new SvelteDate()} />
		</div>

		<div class="code-block">
			<pre><code>{`${'<'}script>
  const daysAgo = ${dateRangePresets[selectedRange].days};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);
${'<'}/script>

${'<'}CalendarHeatmap
  data={activityData}
  startDate={startDate}
  endDate={new Date()}
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
						<td><code>CalendarDataPoint[]</code></td>
						<td>required</td>
						<td>Array of {`{ date: string, value: number }`} objects</td>
					</tr>
					<tr>
						<td><code>startDate</code></td>
						<td><code>Date</code></td>
						<td>365 days ago</td>
						<td>First date to display in calendar</td>
					</tr>
					<tr>
						<td><code>endDate</code></td>
						<td><code>Date</code></td>
						<td>today</td>
						<td>Last date to display in calendar</td>
					</tr>
					<tr>
						<td><code>colorLow</code></td>
						<td><code>string</code></td>
						<td><code>'#ebedf0'</code></td>
						<td>Colour for lowest activity (level 0)</td>
					</tr>
					<tr>
						<td><code>colorHigh</code></td>
						<td><code>string</code></td>
						<td><code>'#216e39'</code></td>
						<td>Colour for highest activity (level 4)</td>
					</tr>
					<tr>
						<td><code>cellSize</code></td>
						<td><code>number</code></td>
						<td><code>12</code></td>
						<td>Size of each calendar cell in pixels</td>
					</tr>
					<tr>
						<td><code>cellGap</code></td>
						<td><code>number</code></td>
						<td><code>3</code></td>
						<td>Gap between cells in pixels</td>
					</tr>
					<tr>
						<td><code>showWeekLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Show weekday labels (Mon/Wed/Fri)</td>
					</tr>
					<tr>
						<td><code>showMonthLabels</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Show month labels at top</td>
					</tr>
					<tr>
						<td><code>showLegend</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Show colour legend below calendar</td>
					</tr>
					<tr>
						<td><code>levels</code></td>
						<td><code>number</code></td>
						<td><code>5</code></td>
						<td>Number of discrete colour levels</td>
					</tr>
					<tr>
						<td><code>tooltipFormatter</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Custom tooltip formatter: <code>(date, value) => string</code></td>
					</tr>
					<tr>
						<td><code>onCellClick</code></td>
						<td><code>function</code></td>
						<td>-</td>
						<td>Click handler: <code>(date, value) => void</code></td>
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

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2>Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<h3>🎯 Habit Tracking</h3>
				<p>Visualize daily habits like exercise, meditation, or reading streaks</p>
			</div>
			<div class="use-case-card">
				<h3>💻 Developer Activity</h3>
				<p>Display GitHub-style contribution graphs for project dashboards</p>
			</div>
			<div class="use-case-card">
				<h3>📊 Business Metrics</h3>
				<p>Track daily sales, user signups, or other key performance indicators</p>
			</div>
			<div class="use-case-card">
				<h3>🏃 Fitness Logging</h3>
				<p>Monitor workout frequency and intensity over time</p>
			</div>
			<div class="use-case-card">
				<h3>🌡️ Environmental Data</h3>
				<p>Visualize temperature, pollution levels, or weather patterns</p>
			</div>
			<div class="use-case-card">
				<h3>⏰ Time Tracking</h3>
				<p>Display project hours, task completion, or productivity patterns</p>
			</div>
		</div>
	</section>

	<!-- Technical Details -->
	<section class="technical-section">
		<h2>Implementation Details</h2>
		<div class="technical-grid">
			<div class="technical-card">
				<h3>Zero Dependencies</h3>
				<p>
					Built with pure Svelte 5 and native web technologies. No external charting libraries
					required.
				</p>
			</div>
			<div class="technical-card">
				<h3>Performance</h3>
				<p>
					O(1) data lookups using Map. Handles 365+ cells with smooth rendering and interactions.
				</p>
			</div>
			<div class="technical-card">
				<h3>Accessibility</h3>
				<p>
					Full keyboard navigation, ARIA labels, focus management, and screen reader support
					included.
				</p>
			</div>
			<div class="technical-card">
				<h3>Responsive</h3>
				<p>SVG viewBox scaling ensures perfect rendering on all screen sizes and devices.</p>
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
	 * Range Filter (for Custom Date Range section)
	 */
	.range-filter {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.range-button {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.range-button:hover {
		border-color: #9ca3af;
		background: #f9fafb;
	}

	.range-button.active {
		border-color: #10b981;
		background: #ecfdf5;
		color: #059669;
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
			/* Allow horizontal scrolling for calendar overflow */
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
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

		/* Smaller buttons on mobile */
		.scheme-button,
		.range-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}
	}
</style>
