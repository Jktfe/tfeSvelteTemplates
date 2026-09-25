<!--
	DataGrid demo page (TFE shell)

	Employee data comes from +page.server.ts (Neon, or the fallback constants).
	All persistence wiring for the editable grid lives HERE, not in the
	component: DataGridAdvanced only calls onCellEdit / onDelete, and this page
	decides that those mean "PUT/DELETE /datagrid/api". That keeps the
	component copy-paste portable and the demo behaviour intact — including
	the 403 the API returns for the read-only public demo account.
-->

<script lang="ts">
	import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';
	import DataGridBasic from '$lib/components/DataGridBasic.svelte';
	import DataGridFilters from '$lib/components/DataGridFilters.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type {
		DataGridCellEdit,
		DataGridColumn,
		DataGridFilterValues,
		DataGridRowId,
		Employee
	} from '$lib/types';
	import {
		DEPARTMENT_OPTIONS,
		LOCATION_OPTIONS,
		POSITION_OPTIONS,
		STATUS_OPTIONS
	} from '$lib/constants';
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

	let { data } = $props();

	// ------------------------------------------------------------
	// Column sets
	// ------------------------------------------------------------

	const basicColumns: DataGridColumn[] = [
		{ id: 'id', header: 'ID', width: 60, type: 'number' },
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{ id: 'email', header: 'Email', width: 220, type: 'email' },
		{ id: 'department', header: 'Department', width: 130 },
		{ id: 'position', header: 'Position', width: 160 },
		{ id: 'salary', header: 'Salary', width: 110, type: 'number', formatter: formatCurrency },
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
		{ id: 'hireDate', header: 'Tenure', width: 120, type: 'date', formatter: formatDateRelative },
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

	// Employee-specific knowledge (select options, which fields are editable)
	// belongs to the page, not the generic grid.
	const advancedColumns: DataGridColumn[] = [
		{ id: 'id', header: 'ID', width: 70, type: 'number', editable: false },
		{ id: 'firstName', header: 'First Name', width: 120 },
		{ id: 'lastName', header: 'Last Name', width: 120 },
		{ id: 'email', header: 'Email', width: 220, type: 'email' },
		{ id: 'department', header: 'Department', width: 140, type: 'select', options: DEPARTMENT_OPTIONS },
		{ id: 'position', header: 'Position', width: 170, type: 'select', options: POSITION_OPTIONS },
		{ id: 'salary', header: 'Salary', width: 120, type: 'number', formatter: formatCurrency },
		{ id: 'hireDate', header: 'Hire Date', width: 120, type: 'date' },
		{ id: 'status', header: 'Status', width: 110, type: 'select', options: STATUS_OPTIONS },
		{ id: 'location', header: 'Location', width: 130, type: 'select', options: LOCATION_OPTIONS }
	];

	// ------------------------------------------------------------
	// Playground state (DataGridBasic)
	// ------------------------------------------------------------

	let pgSortable = $state(true);
	let pgFilterable = $state(true);
	let pgStriped = $state(true);
	let pgHoverable = $state(true);
	let pgCompact = $state(false);
	let pgPageSize = $state(10);

	const toggles = [
		{ label: 'sortable', get: () => pgSortable, set: (v: boolean) => (pgSortable = v) },
		{ label: 'filterable', get: () => pgFilterable, set: (v: boolean) => (pgFilterable = v) },
		{ label: 'striped', get: () => pgStriped, set: (v: boolean) => (pgStriped = v) },
		{ label: 'hoverable', get: () => pgHoverable, set: (v: boolean) => (pgHoverable = v) },
		{ label: 'compact', get: () => pgCompact, set: (v: boolean) => (pgCompact = v) }
	];

	const pageSizes = [5, 10, 25, 0];

	// ------------------------------------------------------------
	// Persistence for the editable DataGridAdvanced
	// ------------------------------------------------------------

	const READ_ONLY_MESSAGE = 'The public demo account is read-only — changes were not saved.';
	const SIGN_IN_MESSAGE = 'Sign in to save changes — they were not saved.';

	// The write API needs a session (401 when signed out), so anonymous
	// visitors get the in-memory behaviour rather than a wall of rollbacks.
	// The demo account still goes to the API so its 403 can be seen.
	const canPersist = $derived(data.usingDatabase && (data.isSignedIn || data.isDemoUser));

	let lastAction = $state<string | null>(null);
	let selectedCount = $state(0);

	interface ApiResult {
		success?: boolean;
		error?: string;
		message?: string;
		data?: Partial<Employee>;
		deletedCount?: number;
	}

	async function readApiResult(response: Response): Promise<ApiResult> {
		try {
			return (await response.json()) as ApiResult;
		} catch {
			return {};
		}
	}

	/** Turn an API failure into an Error the grid can show and roll back on. */
	function apiError(response: Response, body: ApiResult): Error {
		if (response.status === 403) return new Error(READ_ONLY_MESSAGE);
		if (response.status === 401) return new Error(SIGN_IN_MESSAGE);
		return new Error(body.error ?? body.message ?? `Request failed (${response.status})`);
	}

	/** The API stores dates as yyyy-mm-dd, so Date objects are serialised first. */
	function toApiValue(value: unknown): unknown {
		return value instanceof Date ? value.toISOString().split('T')[0] : value;
	}

	async function persistEdit({ id, column, value }: DataGridCellEdit<Employee>): Promise<Partial<Employee> | void> {
		if (!canPersist) {
			// Without a database (or a session) the API can't save anything, so
			// keep the edit in memory and say so — the grid still behaves exactly
			// as it would.
			lastAction = `Edited ${column} on #${id} (in memory — ${data.usingDatabase ? 'sign in to save' : 'no database configured'})`;
			return;
		}

		const response = await fetch('/datagrid/api', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, [column]: toApiValue(value) })
		});
		const body = await readApiResult(response);
		if (!response.ok || !body.success) {
			lastAction = `Edit refused (${response.status}) — rolled back`;
			throw apiError(response, body);
		}

		lastAction = `Saved ${column} on #${id}`;
		return body.data;
	}

	async function persistDelete(ids: DataGridRowId[]): Promise<void> {
		if (!canPersist) {
			lastAction = `Deleted ${ids.length} row(s) (in memory — ${data.usingDatabase ? 'sign in to save' : 'no database configured'})`;
			return;
		}

		const response = await fetch(`/datagrid/api?ids=${ids.join(',')}`, { method: 'DELETE' });
		const body = await readApiResult(response);
		if (!response.ok || !body.success) {
			lastAction = `Delete refused (${response.status})`;
			throw apiError(response, body);
		}

		lastAction = `Deleted ${body.deletedCount ?? ids.length} row(s)`;
	}

	// ------------------------------------------------------------
	// Filters → DataGridAdvanced
	// ------------------------------------------------------------

	let filters = $state<DataGridFilterValues>({
		departments: [],
		statuses: [],
		salaryMin: 30000,
		salaryMax: 150000,
		hireDateFrom: '',
		hireDateTo: ''
	});

	const departments = $derived([...new Set(data.employees.map((e) => e.department))].sort());
	const statuses = $derived([...new Set(data.employees.map((e) => e.status))].sort());

	function isoDate(value: Date | string): string {
		return value instanceof Date ? value.toISOString().split('T')[0] : String(value).slice(0, 10);
	}

	const filteredEmployees = $derived.by<Employee[]>(() =>
		data.employees.filter((employee) => {
			if (filters.departments.length > 0 && !filters.departments.includes(employee.department)) return false;
			if (filters.statuses.length > 0 && !filters.statuses.includes(employee.status)) return false;
			if (employee.salary < filters.salaryMin || employee.salary > filters.salaryMax) return false;
			const hired = isoDate(employee.hireDate);
			if (filters.hireDateFrom && hired < filters.hireDateFrom) return false;
			if (filters.hireDateTo && hired > filters.hireDateTo) return false;
			return true;
		})
	);

	// ------------------------------------------------------------
	// Shell copy
	// ------------------------------------------------------------

	const usageSnippet = `<script lang="ts">
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';
  import type { DataGridCellEdit, DataGridColumn, DataGridRowId } from '$lib/types';

  type Product = { id: number; name: string; price: number; category: string };

  let products: Product[] = [
    { id: 1, name: 'Desk lamp', price: 39, category: 'Lighting' },
    { id: 2, name: 'Oak shelf', price: 120, category: 'Storage' }
  ];

  const columns: DataGridColumn[] = [
    { id: 'id', header: 'ID', width: 60, type: 'number', editable: false },
    { id: 'name', header: 'Name', width: 200 },
    { id: 'price', header: 'Price', type: 'number',
      formatter: (v) => '£' + v.toLocaleString('en-GB') },
    { id: 'category', header: 'Category', type: 'select',
      options: ['Lighting', 'Storage', 'Seating'] }
  ];

  // Throwing rolls the cell back; returning a partial row merges server changes.
  async function save({ id, column, value }: DataGridCellEdit<Product>) {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [column]: value })
    });
    if (!res.ok) throw new Error('Save failed');
  }

  async function remove(ids: DataGridRowId[]) {
    const res = await fetch('/api/products?ids=' + ids.join(','), { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
  }
</${'script'}>

<DataGridAdvanced
  data={products}
  {columns}
  editable
  selectable
  exportable
  exportFilename="products"
  onCellEdit={save}
  onDelete={remove}
/>`;

	const codeExplanation =
		'DataGridBasic is the copy-paste-ready, zero-dependency option for up to ~500 rows: scoped, themable styles, native sort + search + pagination, and pluggable formatters / cell renderers via the column definition. DataGridAdvanced wraps SVAR Grid for virtual scrolling, inline editing, multi-row selection, bulk delete and CSV export. It never talks to a network itself — you pass onCellEdit / onDelete callbacks, and throwing from one rolls the change back. Both consume the same DataGridColumn shape, so moving from one to the other is a one-line change.';
</script>

<svelte:head>
	<title>DataGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Two data grid implementations: a self-contained DataGridBasic and an SVAR-powered DataGridAdvanced with virtual scrolling, inline editing and callback-driven persistence."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Data tables', 'Sort + filter', 'Inline editing', 'CSV export']}
>
	{#snippet demo()}
		<div class="dg-demo">
			<div class="dg-stats">
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

			<section class="dg-section">
				<h4>DataGridBasic · playground</h4>
				<p class="dg-hint">
					Zero dependencies. Flip each prop and watch the same grid respond — sorting, search,
					stripes, hover, density and page size are all independent.
				</p>
				<div class="dg-controls" role="group" aria-label="DataGridBasic options">
					{#each toggles as toggle (toggle.label)}
						<button
							type="button"
							class="dg-chip"
							class:dg-chip--active={toggle.get()}
							aria-pressed={toggle.get()}
							onclick={() => toggle.set(!toggle.get())}
						>
							{toggle.label}
						</button>
					{/each}
					<span class="dg-controls__divider" aria-hidden="true"></span>
					<span class="dg-controls__label" id="dg-pagesize-label">pageSize</span>
					<div class="dg-controls__group" role="group" aria-labelledby="dg-pagesize-label">
						{#each pageSizes as size (size)}
							<button
								type="button"
								class="dg-chip"
								class:dg-chip--active={pgPageSize === size}
								aria-pressed={pgPageSize === size}
								onclick={() => (pgPageSize = size)}
							>
								{size === 0 ? 'all' : size}
							</button>
						{/each}
					</div>
				</div>
				<div class="dg-stage">
					<DataGridBasic
						data={data.employees}
						columns={basicColumns}
						sortable={pgSortable}
						filterable={pgFilterable}
						striped={pgStriped}
						hoverable={pgHoverable}
						compact={pgCompact}
						pageSize={pgPageSize}
					/>
				</div>
				<p class="dg-state">
					Active: <code
						>sortable={pgSortable} filterable={pgFilterable} striped={pgStriped} hoverable={pgHoverable}
						compact={pgCompact} pageSize={pgPageSize}</code
					>
				</p>
			</section>

			<section class="dg-section">
				<h4>DataGridBasic · formatters &amp; cell renderers</h4>
				<p class="dg-hint">
					Gradient cell styles, relative-date formatting, sanitised HTML status badges and
					icon-coded bands — all declared on the column, no component changes.
				</p>
				<div class="dg-stage">
					<DataGridBasic data={data.employees} columns={styledColumns} pageSize={8} />
				</div>
			</section>

			<section class="dg-section">
				<h4>DataGridBasic · currency formats (compact)</h4>
				<p class="dg-hint">
					The same salary three ways: <code>formatCurrency</code> (£75,000),
					<code>formatCurrencyDecimals</code> (£75,000.00) and <code>formatCurrencyCompact</code> (£75K).
				</p>
				<div class="dg-stage">
					<DataGridBasic
						data={data.employees}
						columns={currencyComparisonColumns}
						compact
						filterable={false}
						pageSize={5}
					/>
				</div>
			</section>

			<section class="dg-section">
				<h4>DataGridAdvanced · edit, select, delete, export</h4>
				<p class="dg-hint">
					Double-click a cell to edit; Ctrl-click or Shift-click rows to multi-select. Edits
					persist through <code>onCellEdit</code> → <code>PUT /datagrid/api</code>, and roll back if
					the call fails.
				</p>
				{#if data.isDemoUser}
					<p class="dg-notice" role="note">
						You're signed in as the public demo account, which is read-only. Edits and deletes are
						sent to the API, refused with a 403, and rolled back — exactly what a real app would do.
					</p>
				{:else if !data.usingDatabase}
					<p class="dg-notice" role="note">
						No database is configured, so edits and deletes are kept in memory for this visit.
					</p>
				{:else if !data.isSignedIn}
					<p class="dg-notice" role="note">
						Saving needs a signed-in account, so edits and deletes are kept in memory for this visit.
					</p>
				{/if}
				<div class="dg-stage">
					<DataGridAdvanced
						data={data.employees}
						columns={advancedColumns}
						editable
						selectable
						exportable
						height="480px"
						ariaLabel="Editable employee grid"
						searchLabel="Search employees"
						exportFilename="employees"
						onCellEdit={persistEdit}
						onDelete={persistDelete}
						onSelectionChange={(ids) => (selectedCount = ids.length)}
					/>
				</div>
				<p class="dg-state" aria-live="polite">
					Selected: <code>{selectedCount}</code>
					· Last action: <code>{lastAction ?? 'none yet'}</code>
				</p>
			</section>

			<section class="dg-section">
				<h4>DataGridFilters + DataGridAdvanced · inferred columns</h4>
				<p class="dg-hint">
					Structured filters narrow the rows; the grid infers its columns from the data because no
					<code>columns</code> prop is passed. Export downloads exactly what's visible.
				</p>
				<div class="dg-stage">
					<DataGridFilters
						{departments}
						{statuses}
						salaryRange={{ min: 30000, max: 150000 }}
						onFiltersChange={(next) => (filters = next)}
					/>
					<p class="dg-state">
						Showing <code>{filteredEmployees.length}</code> of <code>{data.employees.length}</code>
						{#if filteredEmployees.length !== data.employees.length}· filters active{/if}
					</p>
					<DataGridAdvanced
						data={filteredEmployees}
						exportable
						height="420px"
						ariaLabel="Filtered employee grid"
						searchLabel="Search filtered employees"
						exportFilename="filtered-employees"
					/>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<h4 class="dg-api-heading">DataGridBasic</h4>
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>data</code></td><td><code>T[]</code></td><td><code>[]</code></td><td>Row objects keyed by column id.</td></tr>
				<tr><td><code>columns</code></td><td><code>DataGridColumn[]</code></td><td>required</td><td>Column definitions with optional formatter, cellStyle, cellClass, cellRenderer.</td></tr>
				<tr><td><code>sortable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Header-click sorting; per-column <code>sortable: false</code> opts out.</td></tr>
				<tr><td><code>filterable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the global search box.</td></tr>
				<tr><td><code>pageSize</code></td><td><code>number</code></td><td><code>10</code></td><td>Rows per page; <code>0</code> shows everything.</td></tr>
				<tr><td><code>striped</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Alternating row backgrounds.</td></tr>
				<tr><td><code>hoverable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Highlight the row under the pointer.</td></tr>
				<tr><td><code>compact</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Tighter cell padding for dense tables.</td></tr>
			</tbody>
		</table>

		<h4 class="dg-api-heading">DataGridAdvanced</h4>
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>data</code></td><td><code>T[]</code> (<code>T extends DataGridRow</code>)</td><td><code>[]</code></td><td>Rows of any shape; an <code>id</code> is needed for edit / select / delete.</td></tr>
				<tr><td><code>columns</code></td><td><code>DataGridColumn[]</code></td><td>inferred</td><td>Column definitions; inferred from the first row when omitted.</td></tr>
				<tr><td><code>editable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Double-click to edit; per-column <code>editable: false</code> opts out.</td></tr>
				<tr><td><code>selectable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Multi-row selection (Ctrl-click toggles, Shift-click selects a range).</td></tr>
				<tr><td><code>exportable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Show the Export CSV button (exports rows matching the search).</td></tr>
				<tr><td><code>searchable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the global search box.</td></tr>
				<tr><td><code>theme</code></td><td><code>'willow' | 'willowDark' | 'auto'</code></td><td><code>'auto'</code></td><td>SVAR skin; <code>'auto'</code> follows the OS colour scheme.</td></tr>
				<tr><td><code>height</code></td><td><code>string</code></td><td><code>'600px'</code></td><td>CSS height of the whole component.</td></tr>
				<tr><td><code>rowHeight</code></td><td><code>number</code></td><td><code>40</code></td><td>Row height in pixels.</td></tr>
				<tr><td><code>ariaLabel</code></td><td><code>string</code></td><td><code>'Data grid'</code></td><td>Accessible name for the grid region.</td></tr>
				<tr><td><code>searchLabel</code></td><td><code>string</code></td><td><code>'Search rows'</code></td><td>Accessible name for the search box.</td></tr>
				<tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>'Search across all columns...'</code></td><td>Search box placeholder.</td></tr>
				<tr><td><code>exportFilename</code></td><td><code>string</code></td><td><code>'data'</code></td><td>CSV base filename; today's date is appended.</td></tr>
				<tr><td><code>onCellEdit</code></td><td><code>(edit: DataGridCellEdit&lt;T&gt;) =&gt; void | Partial&lt;T&gt; | Promise&lt;…&gt;</code></td><td>—</td><td>Persist an edit. Throw / reject to roll back; return a partial row to merge server changes.</td></tr>
				<tr><td><code>onDelete</code></td><td><code>(ids: DataGridRowId[]) =&gt; void | Promise&lt;void&gt;</code></td><td>—</td><td>Persist a bulk delete. The Delete button only appears when this is supplied.</td></tr>
				<tr><td><code>confirmDelete</code></td><td><code>(count: number) =&gt; boolean | Promise&lt;boolean&gt;</code></td><td><code>window.confirm</code></td><td>Confirmation step before <code>onDelete</code> runs.</td></tr>
				<tr><td><code>onSelectionChange</code></td><td><code>(ids: DataGridRowId[]) =&gt; void</code></td><td>—</td><td>Fires with the selected ids whenever the selection changes.</td></tr>
				<tr><td><code>onError</code></td><td><code>(message: string, error: unknown) =&gt; void</code></td><td>—</td><td>Fires when an edit or delete fails (the inline status still shows).</td></tr>
			</tbody>
		</table>

		<h4 class="dg-api-heading">DataGridFilters</h4>
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>departments</code></td><td><code>string[]</code></td><td><code>[]</code></td><td>Department checkbox options (group hidden when empty).</td></tr>
				<tr><td><code>statuses</code></td><td><code>string[]</code></td><td><code>[]</code></td><td>Status checkbox options (group hidden when empty).</td></tr>
				<tr><td><code>salaryRange</code></td><td><code>{'{ min: number; max: number }'}</code></td><td><code>{'{ min: 30000, max: 150000 }'}</code></td><td>Slider bounds — also the "no salary filter" state.</td></tr>
				<tr><td><code>salaryStep</code></td><td><code>number</code></td><td><code>5000</code></td><td>Slider step size.</td></tr>
				<tr><td><code>initiallyExpanded</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Start with the panel open.</td></tr>
				<tr><td><code>onFiltersChange</code></td><td><code>(filters: DataGridFilterValues) =&gt; void</code></td><td>—</td><td>Receives a plain snapshot on mount and on every change.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dg-demo {
		display: grid;
		gap: 28px;
	}
	.dg-stats {
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
	.dg-section {
		display: grid;
		gap: 10px;
		min-width: 0;
	}
	.dg-section h4 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.dg-hint,
	.dg-state {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.dg-hint code,
	.dg-state code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.dg-notice {
		margin: 0;
		padding: 10px 14px;
		font-size: 13px;
		color: var(--fg-1);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: var(--r-2);
	}
	.dg-stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		display: grid;
		gap: 12px;
		overflow-x: auto;
		min-width: 0;
	}
	.dg-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.dg-controls__group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.dg-controls__divider {
		width: 1px;
		height: 20px;
		background: var(--border-strong);
		margin: 0 4px;
	}
	.dg-controls__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-3);
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
		transition:
			color var(--dur-fast),
			border-color var(--dur-fast),
			background-color var(--dur-fast);
	}
	.dg-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.dg-chip:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.dg-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.dg-api-heading {
		margin: 24px 0 8px;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.dg-api-heading:first-child {
		margin-top: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.dg-chip {
			transition: none;
		}
	}
</style>
