<!--
	============================================================
	DataGrid Demo Page (TFE shell)
	============================================================

	Server-loaded employee data is preserved via +page.server.ts.
	The shell wraps the existing tabbed live demos.
-->

<script lang="ts">
	import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';
	import DataGridBasic from '$lib/components/DataGridBasic.svelte';
	import DataGridFilters from '$lib/components/DataGridFilters.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
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

	const shell = catalogShellPropsForSlug('/datagrid')!;

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

	const currencyComparisonColumns: DataGridColumn[] = [
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{ id: 'salary', header: 'Standard (no decimals)', width: 160, type: 'number', formatter: formatCurrency },
		{ id: 'salary', header: 'With decimals', width: 160, type: 'number', formatter: formatCurrencyDecimals },
		{ id: 'salary', header: 'Compact (K/M)', width: 130, type: 'number', formatter: formatCurrencyCompact }
	];

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
				active: { color: '#22c55e', label: 'Active' },
				'on-leave': { color: '#f59e0b', label: 'On Leave' },
				inactive: { color: '#ef4444', label: 'Inactive' }
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

	type ExampleKey =
		| 'basic'
		| 'advanced-simple'
		| 'advanced-full'
		| 'advanced-filtered'
		| 'styled-formatted'
		| 'currency-comparison';

	let activeExample = $state<ExampleKey>('currency-comparison');

	let filters = $state<DataGridFilterValues>({
		departments: [],
		statuses: [],
		salaryMin: 30000,
		salaryMax: 150000,
		hireDateFrom: '',
		hireDateTo: ''
	});

	const departments = $derived.by(() => {
		const uniqueDepts = new Set(data.employees.map((e) => e.department));
		return Array.from(uniqueDepts).sort();
	});

	const statuses = $derived.by(() => {
		const uniqueStatuses = new Set(data.employees.map((e) => e.status));
		return Array.from(uniqueStatuses).sort();
	});

	const filteredEmployees = $derived.by<Employee[]>(() => {
		return data.employees.filter((employee) => {
			if (filters.departments.length > 0 && !filters.departments.includes(employee.department)) return false;
			if (filters.statuses.length > 0 && !filters.statuses.includes(employee.status)) return false;
			if (employee.salary < filters.salaryMin || employee.salary > filters.salaryMax) return false;
			const hireDateStr =
				employee.hireDate instanceof Date
					? employee.hireDate.toISOString().split('T')[0]
					: String(employee.hireDate);
			if (filters.hireDateFrom && hireDateStr < filters.hireDateFrom) return false;
			if (filters.hireDateTo && hireDateStr > filters.hireDateTo) return false;
			return true;
		});
	});

	function handleFiltersChange(newFilters: DataGridFilterValues) {
		filters = newFilters;
	}

	const usageSnippet = `<script>
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';

  const columns = [
    { id: 'name', header: 'Name', width: 150 },
    { id: 'email', header: 'Email', type: 'email' },
    {
      id: 'salary',
      header: 'Salary',
      type: 'number',
      formatter: (val) => '£' + val.toLocaleString('en-GB')
    }
  ];
<\/script>

<DataGridBasic data={rows} {columns} sortable filterable pageSize={10} />`;

	const codeExplanation =
		'DataGridBasic is the copy-paste-ready, zero-dependency option suitable for ~500 rows: scoped styles, native sort + filter + pagination, and pluggable formatters/cell renderers via the column definition. DataGridAdvanced wraps SVAR Grid for virtual scrolling, inline editing, row selection, bulk delete and CSV export — pick it when you need the production muscle. Both components consume the same DataGridColumn shape so swapping is a one-line change.';

	const examples: { key: ExampleKey; label: string }[] = [
		{ key: 'currency-comparison', label: 'Currency formats' },
		{ key: 'basic', label: 'DataGridBasic' },
		{ key: 'advanced-simple', label: 'Advanced (simple)' },
		{ key: 'advanced-full', label: 'Advanced (full)' },
		{ key: 'styled-formatted', label: 'Styled & formatted' },
		{ key: 'advanced-filtered', label: 'With filters' }
	];
</script>

<svelte:head>
	<title>DataGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Two data grid implementations: a self-contained DataGridBasic and an SVAR-powered DataGridAdvanced with virtual scrolling and editing."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Data tables', 'Sort + filter', 'Pagination', 'CSV export']}
>
	{#snippet demo()}
		<div class="dg-demo">
			<div class="dg-demo__stats">
				<div class="dg-stat">
					<div class="dg-stat__value">{data.stats.totalEmployees}</div>
					<div class="dg-stat__label">Total employees</div>
				</div>
				<div class="dg-stat">
					<div class="dg-stat__value">£{data.stats.averageSalary.toLocaleString('en-GB')}</div>
					<div class="dg-stat__label">Average salary</div>
				</div>
				<div class="dg-stat">
					<div class="dg-stat__value">{data.stats.departmentCount}</div>
					<div class="dg-stat__label">Departments</div>
				</div>
				<div class="dg-stat">
					<div class="dg-stat__value">{data.usingDatabase ? 'DB' : 'Fallback'}</div>
					<div class="dg-stat__label">Data source</div>
				</div>
			</div>

			<div class="dg-demo__chips">
				{#each examples as ex (ex.key)}
					<button
						type="button"
						class="dg-chip"
						class:dg-chip--active={activeExample === ex.key}
						onclick={() => (activeExample = ex.key)}
					>
						{ex.label}
					</button>
				{/each}
			</div>

			<div class="dg-demo__stage">
				{#if activeExample === 'currency-comparison'}
					<p class="dg-demo__hint">
						Same salary data shown three ways: <code>formatCurrency</code> (£75,000),
						<code>formatCurrencyDecimals</code> (£75,000.00), <code>formatCurrencyCompact</code>
						(£75K). Pick the formatter that fits each column.
					</p>
					<DataGridBasic
						data={data.employees}
						columns={currencyComparisonColumns}
						sortable
						filterable
						pageSize={10}
						striped
						hoverable
					/>
				{:else if activeExample === 'basic'}
					<p class="dg-demo__hint">
						Self-contained grid: zero dependencies, sortable headers, global search, pagination.
					</p>
					<DataGridBasic
						data={data.employees}
						columns={basicColumns}
						sortable
						filterable
						pageSize={10}
						striped
						hoverable
					/>
				{:else if activeExample === 'advanced-simple'}
					<p class="dg-demo__hint">
						SVAR-powered grid with auto-generated columns and virtual scrolling.
					</p>
					<DataGridAdvanced
						data={data.employees}
						editable={false}
						selectable={false}
						pageSize={20}
						exportable={false}
						theme="willow"
					/>
				{:else if activeExample === 'advanced-full'}
					<p class="dg-demo__hint">
						Inline edit, row selection, bulk delete, CSV export — try double-clicking a cell.
					</p>
					<DataGridAdvanced
						data={data.employees}
						editable
						selectable
						pageSize={20}
						exportable
						theme="willow"
					/>
				{:else if activeExample === 'styled-formatted'}
					<p class="dg-demo__hint">
						Cell renderers, gradient cell styling, status badges, and icon-coded performance.
					</p>
					<DataGridBasic
						data={data.employees}
						columns={styledColumns}
						sortable
						filterable
						pageSize={10}
						striped
						hoverable
					/>
				{:else}
					<p class="dg-demo__hint">
						Department / status / salary / date filters wired into the advanced grid.
					</p>
					<DataGridFilters
						{departments}
						{statuses}
						salaryRange={{ min: 30000, max: 150000 }}
						initiallyExpanded={false}
						onFiltersChange={handleFiltersChange}
					/>
					<p class="dg-demo__count">
						<strong>Showing {filteredEmployees.length} of {data.employees.length}</strong>
						{#if filteredEmployees.length !== data.employees.length}
							· filters active
						{/if}
					</p>
					<DataGridAdvanced
						data={filteredEmployees}
						editable={false}
						selectable={false}
						pageSize={20}
						exportable
						theme="willow"
					/>
				{/if}
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
					<td><code>T[]</code></td>
					<td>required</td>
					<td>Row objects keyed by column id.</td>
				</tr>
				<tr>
					<td><code>columns</code></td>
					<td><code>DataGridColumn[]</code></td>
					<td>required (basic) / auto (advanced)</td>
					<td>Column definitions with optional formatter, cellStyle, cellRenderer.</td>
				</tr>
				<tr>
					<td><code>sortable</code> / <code>filterable</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle DataGridBasic features (advanced exposes its own UI).</td>
				</tr>
				<tr>
					<td><code>pageSize</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Rows per page.</td>
				</tr>
				<tr>
					<td><code>striped</code> / <code>hoverable</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Visual options on DataGridBasic.</td>
				</tr>
				<tr>
					<td><code>editable</code> / <code>selectable</code> / <code>exportable</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>DataGridAdvanced features. Editable enables inline editing, exportable adds the CSV button.</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'willow' | 'willow-dark'</code></td>
					<td><code>'willow'</code></td>
					<td>SVAR theme passthrough on DataGridAdvanced.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dg-demo {
		display: grid;
		gap: 18px;
	}
	.dg-demo__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 12px;
	}
	.dg-stat {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 14px;
		text-align: center;
	}
	.dg-stat__value {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 400;
		color: var(--fg-1);
	}
	.dg-stat__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-top: 4px;
	}
	.dg-demo__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.dg-chip {
		padding: 6px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--r-pill);
		background: var(--surface);
		color: var(--fg-2);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all var(--dur-fast);
	}
	.dg-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.dg-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.dg-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		display: grid;
		gap: 12px;
		overflow-x: auto;
	}
	.dg-demo__hint {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.dg-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.dg-demo__count {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
</style>
