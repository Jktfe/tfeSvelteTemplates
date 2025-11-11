<script lang="ts">
	import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';
	import DataGridBasic from '$lib/components/DataGridBasic.svelte';
	import DataGridFilters from '$lib/components/DataGridFilters.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import type { DataGridColumn, DataGridFilterValues, Employee } from '$lib/types';
	import {
		formatCurrency,
		formatCurrencyCompact,
		formatCurrencyDecimals,
		formatDateRelative,
		createGradientStyle,
		createStatusBadge,
		createIconRenderer
	} from '$lib/dataGridFormatters';

	// Data loaded from +page.server.ts
	let { data } = $props();

	// Column definitions for DataGridBasic
	const basicColumns: DataGridColumn[] = [
		{ id: 'id', header: 'ID', width: 60, type: 'number' },
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{ id: 'email', header: 'Email', width: 220, type: 'email' },
		{ id: 'department', header: 'Department', width: 130 },
		{ id: 'position', header: 'Position', width: 160 },
		{
			id: 'salary',
			header: 'Salary',
			width: 110,
			type: 'number',
			formatter: (value) => `£${value.toLocaleString('en-GB')}`
		},
		{ id: 'hireDate', header: 'Hire Date', width: 110, type: 'date' },
		{ id: 'status', header: 'Status', width: 100 }
	];

	// Currency format comparison - demonstrates choosing different formats
	const currencyComparisonColumns: DataGridColumn[] = [
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{
			id: 'salary',
			header: 'Standard (No Decimals)',
			width: 160,
			type: 'number',
			formatter: formatCurrency  // £75,000
		},
		{
			id: 'salary',
			header: 'With Decimals',
			width: 160,
			type: 'number',
			formatter: formatCurrencyDecimals  // £75,000.00
		},
		{
			id: 'salary',
			header: 'Compact (K/M)',
			width: 130,
			type: 'number',
			formatter: formatCurrencyCompact  // £75K
		}
	];

	// Styled column definitions showcasing formatting utilities
	const styledColumns: DataGridColumn[] = [
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{ id: 'department', header: 'Department', width: 130 },
		{
			id: 'salary',
			header: 'Salary',
			width: 130,
			type: 'number',
			formatter: formatCurrencyCompact,
			cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
		},
		{
			id: 'hireDate',
			header: 'Tenure',
			width: 120,
			type: 'date',
			formatter: formatDateRelative
		},
		{
			id: 'status',
			header: 'Status',
			width: 120,
			cellRenderer: createStatusBadge({
				'active': { color: '#22c55e', label: 'Active' },
				'on-leave': { color: '#f59e0b', label: 'On Leave' },
				'inactive': { color: '#ef4444', label: 'Inactive' }
			})
		},
		{
			id: 'salary',
			header: 'Performance',
			width: 140,
			cellRenderer: createIconRenderer([
				{ max: 50000, icon: '📉', color: '#ef4444', label: 'Entry Level' },
				{ max: 80000, icon: '➡️', color: '#f59e0b', label: 'Mid Level' },
				{ max: 110000, icon: '📊', color: '#3b82f6', label: 'Senior' },
				{ max: Infinity, icon: '📈', color: '#22c55e', label: 'Executive' }
			])
		}
	];

	// State for toggling between examples
	let activeExample = $state<'basic' | 'advanced-simple' | 'advanced-full' | 'advanced-filtered' | 'styled-formatted' | 'currency-comparison'>('currency-comparison');

	// Filter state
	let filters = $state<DataGridFilterValues>({
		departments: [],
		statuses: [],
		salaryMin: 30000,
		salaryMax: 150000,
		hireDateFrom: '',
		hireDateTo: ''
	});

	// Get unique departments and statuses from data
	const departments = $derived(() => {
		const uniqueDepts = new Set(data.employees.map(e => e.department));
		return Array.from(uniqueDepts).sort();
	});

	const statuses = $derived(() => {
		const uniqueStatuses = new Set(data.employees.map(e => e.status));
		return Array.from(uniqueStatuses).sort();
	});

	// Apply filters to employee data
	const filteredEmployees = $derived<Employee[]>(() => {
		return data.employees.filter(employee => {
			// Department filter
			if (filters.departments.length > 0 && !filters.departments.includes(employee.department)) {
				return false;
			}

			// Status filter
			if (filters.statuses.length > 0 && !filters.statuses.includes(employee.status)) {
				return false;
			}

			// Salary range filter
			if (employee.salary < filters.salaryMin || employee.salary > filters.salaryMax) {
				return false;
			}

			// Hire date range filter
			if (filters.hireDateFrom && employee.hireDate < filters.hireDateFrom) {
				return false;
			}
			if (filters.hireDateTo && employee.hireDate > filters.hireDateTo) {
				return false;
			}

			return true;
		});
	});

	// Handle filter changes
	function handleFiltersChange(newFilters: DataGridFilterValues) {
		filters = newFilters;
	}
</script>

<svelte:head>
	<title>DataGrid Components - Svelte Templates</title>
	<meta name="description" content="Interactive data grid components with sorting, filtering, and pagination" />
</svelte:head>

<main class="demo-page">
	<!-- Page Header -->
	<header class="page-header">
		<h1>DataGrid Components</h1>
		<p class="subtitle">
			Two approaches to building data grids: a lightweight self-contained version and a production-ready
			wrapper around SVAR Grid
		</p>
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<!-- Statistics Cards -->
	<section class="stats-section">
		<div class="stat-card">
			<div class="stat-value">{data.stats.totalEmployees}</div>
			<div class="stat-label">Total Employees</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">£{data.stats.averageSalary.toLocaleString('en-GB')}</div>
			<div class="stat-label">Average Salary</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{data.stats.departmentCount}</div>
			<div class="stat-label">Departments</div>
		</div>
	</section>

	<!-- Component Comparison -->
	<section class="comparison-section">
		<h2>Component Comparison</h2>
		<div class="comparison-grid">
			<div class="comparison-card">
				<h3>DataGridBasic</h3>
				<ul class="feature-list">
					<li class="pro">✓ Zero dependencies</li>
					<li class="pro">✓ Copy-paste ready</li>
					<li class="pro">✓ ~10KB bundle size</li>
					<li class="pro">✓ Column sorting</li>
					<li class="pro">✓ Global search</li>
					<li class="pro">✓ Pagination</li>
					<li class="con">✗ No virtual scrolling</li>
					<li class="con">✗ No inline editing</li>
					<li class="con">✗ Basic filtering only</li>
				</ul>
				<p class="use-case">
					<strong>Best for:</strong> Small-medium datasets (up to 500 rows), prototypes, learning
				</p>
			</div>

			<div class="comparison-card">
				<h3>DataGridAdvanced</h3>
				<ul class="feature-list">
					<li class="pro">✓ Virtual scrolling</li>
					<li class="pro">✓ Global search</li>
					<li class="pro">✓ Column sorting</li>
					<li class="pro">✓ Inline editing</li>
					<li class="pro">✓ Row selection</li>
					<li class="pro">✓ Bulk operations</li>
					<li class="pro">✓ CSV export</li>
					<li class="pro">✓ Theme support</li>
					<li class="con">✗ Requires SVAR Grid</li>
					<li class="con">✗ ~155KB bundle</li>
					<li class="con">✗ Not copy-paste ready</li>
				</ul>
				<p class="use-case">
					<strong>Best for:</strong> Large datasets (1000s of rows), production apps, rich features
				</p>
			</div>
		</div>
	</section>

	<!-- Example Selector -->
	<section class="example-selector">
		<h2>Live Examples</h2>
		<div class="tabs">
			<button
				class="tab"
				class:active={activeExample === 'currency-comparison'}
				onclick={() => activeExample = 'currency-comparison'}
			>
				Currency Formats Comparison
			</button>
			<button
				class="tab"
				class:active={activeExample === 'basic'}
				onclick={() => activeExample = 'basic'}
			>
				DataGridBasic
			</button>
			<button
				class="tab"
				class:active={activeExample === 'advanced-simple'}
				onclick={() => activeExample = 'advanced-simple'}
			>
				DataGridAdvanced (Simple)
			</button>
			<button
				class="tab"
				class:active={activeExample === 'advanced-full'}
				onclick={() => activeExample = 'advanced-full'}
			>
				DataGridAdvanced (Full Features)
			</button>
			<button
				class="tab"
				class:active={activeExample === 'styled-formatted'}
				onclick={() => activeExample = 'styled-formatted'}
			>
				Styled & Formatted
			</button>
			<button
				class="tab"
				class:active={activeExample === 'advanced-filtered'}
				onclick={() => activeExample = 'advanced-filtered'}
			>
				Advanced Filtering
			</button>
		</div>
	</section>

	<!-- Example Display -->
	<section class="example-display">
		{#if activeExample === 'currency-comparison'}
			<div class="example-container">
				<div class="example-header">
					<h3>Currency Format Comparison - Choose Your Format</h3>
					<p>
						The same salary data displayed in three different formats. You choose which formatter to use for each column!
					</p>
				</div>

				<div class="format-explanation">
					<h4>Three Currency Formatters Available:</h4>
					<ul>
						<li><code>formatCurrency</code> - Standard with commas, no decimals (e.g., £75,000)</li>
						<li><code>formatCurrencyDecimals</code> - With commas AND decimals (e.g., £75,000.00)</li>
						<li><code>formatCurrencyCompact</code> - With K/M abbreviations (e.g., £75K)</li>
					</ul>
					<p style="margin-top: 1rem; font-style: italic;">
						Each column below uses a different formatter on the same salary data. You can use different formats in different columns based on your needs!
					</p>
				</div>

				<DataGridBasic
					data={data.employees}
					columns={currencyComparisonColumns}
					sortable={true}
					filterable={true}
					pageSize={10}
					striped={true}
					hoverable={true}
				/>

				<div class="code-example">
					<h4>How to Use Different Formatters:</h4>
					<pre><code>{`import { formatCurrency, formatCurrencyDecimals, formatCurrencyCompact } from '$lib/dataGridFormatters';

const columns: DataGridColumn[] = [
  {
    id: 'annualBudget',
    header: 'Annual Budget',
    formatter: formatCurrencyCompact  // ← Use compact for large numbers (£1.5M)
  },
  {
    id: 'productPrice',
    header: 'Product Price',
    formatter: formatCurrencyDecimals  // ← Use decimals for precise prices (£12.99)
  },
  {
    id: 'totalRevenue',
    header: 'Total Revenue',
    formatter: formatCurrency  // ← Use standard for whole numbers (£75,000)
  }
];`}</code></pre>
				</div>
			</div>
		{:else if activeExample === 'basic'}
			<div class="example-container">
				<div class="example-header">
					<h3>DataGridBasic - Self-Contained Grid</h3>
					<p>
						Zero dependencies • Sortable columns • Global search • Pagination •
						<a href="https://github.com/yourusername/repo/blob/main/src/lib/components/DataGridBasic.svelte" target="_blank">View Source</a>
					</p>
				</div>
				<DataGridBasic
					data={data.employees}
					columns={basicColumns}
					sortable={true}
					filterable={true}
					pageSize={10}
					striped={true}
					hoverable={true}
				/>
			</div>
		{:else if activeExample === 'advanced-simple'}
			<div class="example-container">
				<div class="example-header">
					<h3>DataGridAdvanced - Simple Configuration</h3>
					<p>
						SVAR Grid wrapper • Auto-generated columns • Virtual scrolling •
						<a href="https://github.com/yourusername/repo/blob/main/src/lib/components/DataGridAdvanced.svelte" target="_blank">View Source</a>
					</p>
				</div>
				<DataGridAdvanced
					data={data.employees}
					editable={false}
					selectable={false}
					pageSize={20}
					exportable={false}
					theme="willow"
				/>
			</div>
		{:else if activeExample === 'advanced-full'}
			<div class="example-container">
				<div class="example-header">
					<h3>DataGridAdvanced - Full Features</h3>
					<p>
						Global search • Inline editing • Row selection • Bulk delete • CSV export •
						<a href="https://github.com/yourusername/repo/blob/main/src/lib/components/DataGridAdvanced.svelte" target="_blank">View Source</a>
					</p>
				</div>
				<DataGridAdvanced
					data={data.employees}
					editable={true}
					selectable={true}
					pageSize={20}
					exportable={true}
					theme="willow"
				/>
				<div class="feature-note">
					<strong>Try it:</strong> Search for names/departments • Click cells to edit • Select rows • Delete selected • Export CSV
				</div>
			</div>
		{:else if activeExample === 'styled-formatted'}
			<div class="example-container">
				<div class="example-header">
					<h3>Styled & Formatted Columns</h3>
					<p>
						Currency formatting with abbreviations • Color gradients • Status badges • Icon-based performance indicators •
						<a href="https://github.com/yourusername/repo/blob/main/src/lib/dataGridFormatters.ts" target="_blank">View Formatter Utilities</a>
					</p>
				</div>
				<DataGridBasic
					data={data.employees}
					columns={styledColumns}
					sortable={true}
					filterable={true}
					pageSize={10}
					striped={true}
					hoverable={true}
				/>
				<div class="feature-note">
					<strong>Formatting Features:</strong>
					<ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
						<li><strong>Salary column:</strong> Compact currency format (£75K, £1.5M) with gradient from red (low) to green (high)</li>
						<li><strong>Tenure column:</strong> Relative date formatting ("2 years ago", "3 months ago")</li>
						<li><strong>Status column:</strong> Color-coded badges with custom labels</li>
						<li><strong>Performance column:</strong> Icon-based indicators with color coding by salary range</li>
					</ul>
				</div>
			</div>
		{:else}
			<div class="example-container">
				<div class="example-header">
					<h3>Advanced Filtering - DataGridAdvanced with Filters</h3>
					<p>
						Department filter • Status filter • Salary range • Date range • Real-time filtering •
						<a href="https://github.com/yourusername/repo/blob/main/src/lib/components/DataGridFilters.svelte" target="_blank">View Filter Source</a>
					</p>
				</div>

				<!-- Filter Component -->
				<DataGridFilters
					departments={departments()}
					statuses={statuses()}
					salaryRange={{ min: 30000, max: 150000 }}
					initiallyExpanded={false}
					onFiltersChange={handleFiltersChange}
				/>

				<!-- Filtered Results Count -->
				<div class="filter-results">
					<strong>Showing {filteredEmployees().length} of {data.employees.length} employees</strong>
					{#if filteredEmployees().length !== data.employees.length}
						<span class="filter-active-indicator">• Filters active</span>
					{/if}
				</div>

				<!-- Data Grid with Filtered Data -->
				<DataGridAdvanced
					data={filteredEmployees()}
					editable={false}
					selectable={false}
					pageSize={20}
					exportable={true}
					theme="willow"
				/>
				<div class="feature-note">
					<strong>Try it:</strong> Expand filters • Select departments/statuses • Adjust salary range • Set date range
				</div>
			</div>
		{/if}
	</section>

	<!-- Usage Guide -->
	<section class="usage-guide">
		<h2>Usage Guide</h2>

		<div class="guide-section">
			<h3>Column Styling & Formatting</h3>
			<pre><code>{`<script>
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import ${'{'}
    formatCurrencyCompact,
    createGradientStyle,
    createStatusBadge,
    createIconRenderer
  ${'}'} from '$lib/dataGridFormatters';

  const columns = [
    ${'{'}
      id: 'salary',
      header: 'Salary',
      type: 'number',
      formatter: formatCurrencyCompact, // £75K, £1.5M
      cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
    ${'}'},
    ${'{'}
      id: 'status',
      header: 'Status',
      cellRenderer: createStatusBadge(${'{'}
        'active': ${'{'} color: '#22c55e', label: 'Active' ${'}'},
        'on-leave': ${'{'} color: '#f59e0b', label: 'On Leave' ${'}'}
      ${'}'})
    ${'}'},
    ${'{'}
      id: 'performance',
      header: 'Level',
      cellRenderer: createIconRenderer([
        ${'{'} max: 50000, icon: '📉', color: '#ef4444' ${'}'},
        ${'{'} max: 100000, icon: '📊', color: '#3b82f6' ${'}'},
        ${'{'} max: Infinity, icon: '📈', color: '#22c55e' ${'}'}
      ])
    ${'}'}
  ];
<\/script>

<DataGridBasic ${'{'} data ${'}'} ${'{'} columns ${'}'} />`}</code></pre>
		</div>

		<div class="guide-section">
			<h3>DataGridBasic - Copy & Paste Ready</h3>
			<pre><code>{`<script>
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';

  const columns = [
    ${'{'} id: 'name', header: 'Name', width: 150 ${'}'},
    ${'{'} id: 'email', header: 'Email', type: 'email' ${'}'},
    ${'{'}
      id: 'salary',
      header: 'Salary',
      type: 'number',
      formatter: (val) => \`£\$\{val.toLocaleString()\}\`
    ${'}'}
  ];

  const data = [
    ${'{'} name: 'John Doe', email: 'john@example.com', salary: 75000 ${'}'},
    // ... more rows
  ];
<\/script>

<DataGridBasic
  ${'{'} data ${'}'}
  ${'{'} columns ${'}'}
  sortable=${'{'} true ${'}'}
  filterable=${'{'} true ${'}'}
  pageSize=${'{'} 10 ${'}'}
/>`}</code></pre>
		</div>

		<div class="guide-section">
			<h3>DataGridAdvanced - Production Features</h3>
			<pre><code>{`<script>
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';

  // Auto-generates columns from data structure
  const employees = []; // Your employee data
<\/script>

<DataGridAdvanced
  data=${'{'} employees ${'}'}
  editable=${'{'} true ${'}'}
  selectable=${'{'} true ${'}'}
  exportable=${'{'} true ${'}'}
  pageSize=${'{'} 20 ${'}'}
  theme="willow"
/>`}</code></pre>
		</div>

		<div class="guide-section">
			<h3>DataGridFilters - Advanced Filtering</h3>
			<pre><code>{`<script>
  import DataGridFilters from '$lib/components/DataGridFilters.svelte';
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';

  let filters = $state(${'{'}
    departments: [],
    statuses: [],
    salaryMin: 30000,
    salaryMax: 150000,
    hireDateFrom: '',
    hireDateTo: ''
  ${'}'});

  const filteredData = $derived(() => ${'{'}
    return data.filter(employee => ${'{'}
      // Apply filter logic
      return true;
    ${'}'});
  ${'}'});
<\/script>

<DataGridFilters
  departments=${'{'} ['Engineering', 'Sales', 'Marketing'] ${'}'}
  statuses=${'{'} ['active', 'on-leave'] ${'}'}
  salaryRange=${'{'} ${'{'} min: 30000, max: 150000 ${'}'} ${'}'}
  onFiltersChange=${'{'} (newFilters) => filters = newFilters ${'}'}
/>

<DataGridAdvanced
  data=${'{'} filteredData() ${'}'}
  editable=${'{'} false ${'}'}
  selectable=${'{'} false ${'}'}
  pageSize=${'{'} 20 ${'}'}
  exportable=${'{'} true ${'}'}
/>`}</code></pre>
		</div>
	</section>

	<!-- Department Breakdown -->
	<section class="department-section">
		<h2>Department Breakdown</h2>
		<div class="department-grid">
			{#each Object.entries(data.stats.departmentBreakdown).sort((a, b) => b[1] - a[1]) as [dept, count]}
				<div class="department-card">
					<div class="department-name">{dept}</div>
					<div class="department-count">{count} employee{count === 1 ? '' : 's'}</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.demo-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		margin-bottom: 1rem;
	}

	/* Statistics Cards */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #146ef5;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Comparison Section */
	.comparison-section {
		margin-bottom: 3rem;
	}

	.comparison-section h2 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.comparison-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
	}

	.comparison-card h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}

	.feature-list li {
		padding: 0.5rem 0;
		font-size: 0.9375rem;
	}

	.feature-list .pro {
		color: #059669;
	}

	.feature-list .con {
		color: #dc2626;
	}

	.use-case {
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Example Selector */
	.example-selector {
		margin-bottom: 2rem;
	}

	.example-selector h2 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		font-size: 1rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		color: #146ef5;
	}

	.tab.active {
		color: #146ef5;
		border-bottom-color: #146ef5;
	}

	/* Example Display */
	.example-display {
		margin-bottom: 3rem;
	}

	.example-container {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
	}

	.example-header {
		margin-bottom: 1.5rem;
	}

	.example-header h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.example-header p {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.example-header a {
		color: #146ef5;
		text-decoration: none;
	}

	.example-header a:hover {
		text-decoration: underline;
	}

	.feature-note {
		margin-top: 1rem;
		padding: 1rem;
		background: #eff6ff;
		border-left: 4px solid #146ef5;
		border-radius: 4px;
		font-size: 0.875rem;
		color: #1e40af;
	}

	/* Filter Results */
	.filter-results {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.filter-active-indicator {
		color: #059669;
		font-weight: 600;
	}

	/* Usage Guide */
	.usage-guide {
		margin-bottom: 3rem;
	}

	.usage-guide h2 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}

	.guide-section {
		margin-bottom: 2rem;
	}

	.guide-section h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	pre {
		background: #1f2937;
		border-radius: 8px;
		padding: 1.5rem;
		overflow-x: auto;
	}

	code {
		font-family: 'Fira Code', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #e5e7eb;
	}

	/* Department Section */
	.department-section {
		margin-bottom: 3rem;
	}

	.department-section h2 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
	}

	.department-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.department-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.25rem;
	}

	.department-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}

	.department-count {
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Responsive Design */
	/* Format Explanation Section */
	.format-explanation {
		background: #f0f9ff;
		border: 2px solid #0ea5e9;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.format-explanation h4 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #0c4a6e;
		margin-bottom: 1rem;
	}

	.format-explanation ul {
		margin: 0 0 0 1.5rem;
		padding: 0;
	}

	.format-explanation li {
		margin-bottom: 0.5rem;
		color: #1e3a8a;
	}

	.format-explanation code {
		background: #dbeafe;
		color: #1e40af;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	/* Code Example Section */
	.code-example {
		margin-top: 2rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.code-example h4 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		.demo-page {
			padding: 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.comparison-grid {
			grid-template-columns: 1fr;
		}

		.tabs {
			flex-direction: column;
			border-bottom: none;
		}

		.tab {
			border-bottom: 1px solid #e5e7eb;
			border-left: 3px solid transparent;
		}

		.tab.active {
			border-bottom-color: #e5e7eb;
			border-left-color: #146ef5;
		}
	}
</style>
