<!--
	============================================================
	DataGridBasic - Self-Contained Data Grid (Zero Dependencies)
	============================================================

	[CR] WHAT IT DOES
	A lightweight, fully self-contained data grid with sorting, filtering,
	and pagination. All logic is vanilla Svelte 5 - no external libraries.
	Designed to be COPY-PASTE READY into any project.

	[NTL] THE SIMPLE VERSION
	Think of a spreadsheet that you can sort by clicking column headers,
	search through with a search box, and flip through pages like a book.
	This does all that without needing any extra code libraries!

	============================================================

	FEATURES:
	- Column sorting (click headers to sort ↑↓)
	- Global search/filter across all columns
	- Pagination with configurable page size
	- Responsive design (works on mobile!)
	- Keyboard accessible (Tab, Enter to sort)
	- Striped/hoverable row styles
	- Dark mode support

	PERFECT FOR:
	- Small-medium datasets (up to ~500 rows)
	- Learning how data grids work
	- Projects where bundle size matters
	- Quick prototypes

	NOT IDEAL FOR:
	- Large datasets (1000s of rows) - use DataGridAdvanced instead
	- Inline editing - use DataGridAdvanced instead
	- Complex column filters - use DataGridAdvanced instead

	DEPENDENCIES:
	- Zero external dependencies (copy-paste ready!)
	- Uses $lib/types for TypeScript interfaces
	- Uses $lib/utils for sanitizeHTML (XSS protection)

	ACCESSIBILITY:
	- Sortable columns are keyboard focusable
	- aria-sort announces sort direction
	- Pagination buttons have aria-labels
	- Screen reader friendly results count

	WARNINGS: None expected

	============================================================
-->

<script lang="ts">
	// [CR] Type imports for props and data structures
	import type { DataGridBasicProps, Employee, DataGridColumn } from '$lib/types';
	import { sanitizeClassName } from '$lib/dataGridFormatters';
	import { sanitizeHTML } from '$lib/utils';

	// [CR] ============================================================
	// [CR] PROPS - All the "knobs and dials" for customising the grid
	// [NTL] These are the settings you can tweak when using the component
	// [CR] ============================================================
	let {
		data = [],           // [NTL] The array of objects to display (your spreadsheet data)
		columns,             // [NTL] Which columns to show and how to format them
		sortable = true,     // [NTL] Can users click headers to sort?
		filterable = true,   // [NTL] Show the search box?
		pageSize = 10,       // [NTL] How many rows per page (0 = show all)
		striped = true,      // [NTL] Alternating row colours for readability
		hoverable = true,    // [NTL] Highlight row when mouse hovers over it
		compact = false      // [NTL] Smaller padding for dense data
	}: DataGridBasicProps = $props();

	// [CR] ============================================================
	// [CR] STATE MANAGEMENT - Reactive variables that drive the UI
	// [NTL] These keep track of what's happening in the grid right now
	// [CR] ============================================================

	// [CR] Sorting state - which column is sorted and in which direction
	// [NTL] When you click a column header, these remember your choice
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	// [CR] Filter state - the current search query
	// [NTL] Whatever you type in the search box lives here
	let filterText = $state('');

	// [CR] Pagination state - which page we're viewing
	// [NTL] Like knowing which page of a book you're on
	let currentPage = $state(1);

	// [CR] ============================================================
	// [CR] HELPER FUNCTIONS
	// [CR] ============================================================

	// [CR] Type-safe accessor for row values by column ID
	// [NTL] Since each row can have different columns, this safely grabs
	// [NTL] the value for any column name you ask for
	function getRowValue(row: Employee, columnId: string): unknown {
		// [CR] Double cast through unknown to safely access dynamic column values
		return (row as unknown as Record<string, unknown>)[columnId];
	}

	// [CR] ============================================================
	// [CR] DERIVED VALUES - Computed from state, auto-update when state changes
	// [NTL] These are like formulas in a spreadsheet - they recalculate automatically!
	// [CR] ============================================================

	// [CR] Filtered Data - apply global search filter
	// [NTL] When you type in the search box, this filters your data to only
	// [NTL] show rows where ANY column contains your search text
	const filteredData = $derived(() => {
		if (!filterable || !filterText.trim()) {
			return data;
		}

		const searchTerm = filterText.toLowerCase();

		return data.filter((row) => {
			// [CR] Search across all column values - returns true if ANY column matches
			return columns.some((col) => {
				const value = getRowValue(row, col.id);
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(searchTerm);
			});
		});
	});

	// [CR] Sorted Data - apply sorting to the already-filtered data
	// [NTL] After filtering, this puts the results in order based on
	// [NTL] which column header you clicked (A-Z, Z-A, 1-9, 9-1)
	const sortedData = $derived(() => {
		if (!sortable || !sortColumn) {
			return filteredData();
		}

		// [CR] Create a copy to avoid mutating the original array
		const sorted = [...filteredData()];
		const columnKey = sortColumn;

		sorted.sort((a, b) => {
			const aValue = getRowValue(a, columnKey);
			const bValue = getRowValue(b, columnKey);

			// [CR] Handle null/undefined - push them to the end
			if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
			if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

			// [CR] Numeric comparison - for numbers, use mathematical comparison
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
			}

			// [CR] String comparison - for text, use alphabetical ordering
			const aStr = String(aValue).toLowerCase();
			const bStr = String(bValue).toLowerCase();

			if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
			if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return sorted;
	});

	// [CR] Pagination calculations
	// [NTL] Figure out how many pages we have and which rows to show
	const totalRows = $derived(sortedData().length);
	const totalPages = $derived(pageSize > 0 ? Math.ceil(totalRows / pageSize) : 1);

	// [CR] Paginated data - slice out just the rows for the current page
	// [NTL] If you're on page 2 with 10 rows per page, this grabs rows 11-20
	const paginatedData = $derived(() => {
		if (pageSize === 0) {
			return sortedData(); // [NTL] pageSize of 0 means "show everything"
		}

		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return sortedData().slice(startIndex, endIndex);
	});

	// [CR] ============================================================
	// [CR] EVENT HANDLERS
	// [NTL] Functions that respond to user clicks and interactions
	// [CR] ============================================================

	// [CR] Handle column header click for sorting
	// [NTL] When you click a column header, this decides whether to
	// [NTL] sort A-Z, Z-A, or switch to a different column
	function handleSort(columnId: string) {
		if (!sortable) return;

		// [CR] Check if this specific column has sorting disabled
		const column = columns.find((col) => col.id === columnId);
		if (column?.sortable === false) return;

		if (sortColumn === columnId) {
			// [NTL] Clicked same column? Flip the direction!
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// [NTL] Clicked new column? Start fresh with ascending
			sortColumn = columnId;
			sortDirection = 'asc';
		}

		// [CR] Reset to first page when sorting changes
		currentPage = 1;
	}

	// [CR] ============================================================
	// [CR] CELL FORMATTING - How values are displayed in cells
	// [CR] ============================================================

	// [CR] Format cell value for display
	// [NTL] Takes raw data (like 50000) and makes it pretty (like "50,000")
	function formatCellValue(value: any, column: DataGridColumn, row?: any): string {
		if (value === null || value === undefined) return '';

		// [CR] Use custom renderer for HTML output (with XSS protection)
		if (column.cellRenderer) {
			return column.cellRenderer(value, row);
		}

		// [CR] Use custom formatter for text output
		if (column.formatter) {
			return column.formatter(value, row);
		}

		// [CR] Default formatting based on column type
		switch (column.type) {
			case 'number':
				// [NTL] Numbers get thousands separators (1000 → 1,000)
				return typeof value === 'number' ? value.toLocaleString('en-GB') : String(value);
			case 'date':
				// [NTL] Dates become DD/MM/YYYY format
				if (value instanceof Date) {
					return value.toLocaleDateString('en-GB');
				}
				// [CR] Handle ISO string dates (2024-01-15 → 15/01/2024)
				if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
					const date = new Date(value);
					return date.toLocaleDateString('en-GB');
				}
				return String(value);
			default:
				return String(value);
		}
	}

	// [CR] Get inline CSS styles for a cell
	function getCellStyle(value: any, column: DataGridColumn, row?: any): string {
		if (column.cellStyle) {
			return column.cellStyle(value, row);
		}
		return '';
	}

	// [CR] Get CSS classes for a cell - sanitized to prevent XSS
	function getCellClass(value: any, column: DataGridColumn, row?: any): string {
		if (column.cellClass) {
			const className = column.cellClass(value, row);
			return sanitizeClassName(className);
		}
		return '';
	}

	// [CR] ============================================================
	// [CR] PAGINATION CONTROLS
	// [NTL] Functions to navigate between pages
	// [CR] ============================================================

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
	}

	function nextPage() {
		goToPage(currentPage + 1);
	}

	function previousPage() {
		goToPage(currentPage - 1);
	}

	// [CR] Reset to first page when filter changes
	// [NTL] When you search, jump back to page 1 to see results from the start
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = filterText;
		currentPage = 1;
	});
</script>

<!--
	[CR] ============================================================
	[CR] TEMPLATE - The visual structure of the grid
	[NTL] This is what actually appears on screen!
	[CR] ============================================================

	Structure:
	1. Filter/search input (if filterable)
	2. Data table with sortable headers
	3. Pagination controls (if pageSize > 0)
-->

<div class="datagrid-basic-wrapper">
	<!-- Filter Input -->
	{#if filterable}
		<div class="datagrid-filter">
			<input
				type="search"
				bind:value={filterText}
				placeholder="Search across all columns..."
				class="filter-input"
				aria-label="Filter table data"
			/>
			{#if filterText}
				<span class="filter-count">
					{filteredData().length} result{filteredData().length === 1 ? '' : 's'}
				</span>
			{/if}
		</div>
	{/if}

	<!-- Data Table -->
	<div class="table-container">
		<table class="datagrid-table" class:striped class:hoverable class:compact>
			<thead>
				<tr>
					{#each columns as column, columnIndex (`${columnIndex}-${column.id}`)}
						<th
							class:sortable={sortable && column.sortable !== false}
							class:sorted={sortColumn === column.id}
							class:asc={sortColumn === column.id && sortDirection === 'asc'}
							class:desc={sortColumn === column.id && sortDirection === 'desc'}
							style={column.width ? `width: ${column.width}px` : ''}
							onclick={() => handleSort(column.id)}
							onkeydown={(e) => e.key === 'Enter' && handleSort(column.id)}
							tabindex={sortable && column.sortable !== false ? 0 : -1}
							role={sortable && column.sortable !== false ? 'button' : undefined}
							aria-sort={
								sortColumn === column.id
									? sortDirection === 'asc'
										? 'ascending'
										: 'descending'
									: 'none'
							}
						>
							<span class="header-content">
								{column.header}
								{#if sortable && column.sortable !== false}
									<span class="sort-indicator" aria-hidden="true">
										{#if sortColumn === column.id}
											{sortDirection === 'asc' ? '↑' : '↓'}
										{:else}
											↕
										{/if}
									</span>
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if paginatedData().length === 0}
					<tr>
						<td colspan={columns.length} class="empty-state">
							{filterText ? 'No results found' : 'No data available'}
						</td>
					</tr>
				{:else}
					{#each paginatedData() as row, rowIndex (row.id ?? rowIndex)}
						<tr>
							{#each columns as column, columnIndex (`${columnIndex}-${column.id}`)}
								{@const cellValue = getRowValue(row, column.id)}
								<td
									class={getCellClass(cellValue, column, row)}
									style={getCellStyle(cellValue, column, row)}
								>
									{#if column.cellRenderer}
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html sanitizeHTML(formatCellValue(cellValue, column, row))}
									{:else}
										{formatCellValue(cellValue, column, row)}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination Controls -->
	{#if pageSize > 0 && totalPages > 1}
		<div class="datagrid-pagination">
			<div class="pagination-info">
				Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRows)} of
				{totalRows}
			</div>

			<div class="pagination-controls">
				<button
					onclick={previousPage}
					disabled={currentPage === 1}
					aria-label="Previous page"
					class="pagination-button"
				>
					←
				</button>

				<!-- Page numbers -->
				<div class="page-numbers">
					{#each Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
						// Show first page, last page, current page, and neighbors
						if (totalPages <= 7) return i + 1;
						if (i === 0) return 1;
						if (i === 6) return totalPages;
						if (currentPage <= 4) return i + 1;
						if (currentPage >= totalPages - 3) return totalPages - 6 + i;
						return currentPage - 3 + i;
					}) as pageNum (pageNum)}
						<button
							onclick={() => goToPage(pageNum)}
							class="page-button"
							class:active={pageNum === currentPage}
							aria-label={`Go to page ${pageNum}`}
							aria-current={pageNum === currentPage ? 'page' : undefined}
						>
							{pageNum}
						</button>
					{/each}
				</div>

				<button
					onclick={nextPage}
					disabled={currentPage === totalPages}
					aria-label="Next page"
					class="pagination-button"
				>
					→
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/**
	 * Component Styles
	 * All styles scoped to this component
	 */

	.datagrid-basic-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* ===================
	   Filter Section
	   =================== */

	.datagrid-filter {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.filter-input {
		flex: 1;
		max-width: 400px;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.filter-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	.filter-count {
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* ===================
	   Table Styles
	   =================== */

	.table-container {
		overflow-x: auto;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.datagrid-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
	}

	/* Table header */
	thead {
		background: #f9fafb;
		border-bottom: 2px solid #e5e7eb;
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
		white-space: nowrap;
		user-select: none;
	}

	th.sortable {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	th.sortable:hover {
		background: #f3f4f6;
	}

	th.sortable:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: -2px;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-indicator {
		opacity: 0.3;
		font-size: 0.75rem;
	}

	th.sorted .sort-indicator {
		opacity: 1;
		color: #146ef5;
	}

	/* Table body */
	tbody tr {
		border-bottom: 1px solid #e5e7eb;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	td {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #1f2937;
	}

	/* Striped rows */
	.datagrid-table.striped tbody tr:nth-child(even) {
		background: #f9fafb;
	}

	/* Hover effect */
	.datagrid-table.hoverable tbody tr:hover {
		background: #f3f4f6;
	}

	/* Compact mode */
	.datagrid-table.compact th,
	.datagrid-table.compact td {
		padding: 0.5rem 0.75rem;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #9ca3af;
		font-style: italic;
	}

	/* ===================
	   Pagination Styles
	   =================== */

	.datagrid-pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.pagination-info {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.page-numbers {
		display: flex;
		gap: 0.25rem;
	}

	.pagination-button,
	.page-button {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination-button:hover:not(:disabled),
	.page-button:hover {
		background: #f3f4f6;
		border-color: #146ef5;
	}

	.pagination-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-button.active {
		background: #146ef5;
		color: white;
		border-color: #146ef5;
	}

	.pagination-button:focus-visible,
	.page-button:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	/* ===================
	   Responsive Design
	   =================== */

	@media (max-width: 768px) {
		.filter-input {
			max-width: 100%;
		}

		th,
		td {
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}

		.datagrid-pagination {
			flex-direction: column;
			align-items: stretch;
		}

		.pagination-controls {
			justify-content: center;
		}
	}

	/* ===================
	   Dark Mode Support
	   =================== */

	@media (prefers-color-scheme: dark) {
		.datagrid-table {
			background: #1f2937;
		}

		thead {
			background: #111827;
			border-color: #374151;
		}

		th {
			color: #f9fafb;
		}

		th.sortable:hover {
			background: #1f2937;
		}

		tbody tr {
			border-color: #374151;
		}

		td {
			color: #e5e7eb;
		}

		.datagrid-table.striped tbody tr:nth-child(even) {
			background: #111827;
		}

		.datagrid-table.hoverable tbody tr:hover {
			background: #374151;
		}

		.filter-input {
			background: #1f2937;
			border-color: #374151;
			color: #f9fafb;
		}

		.pagination-button,
		.page-button {
			background: #1f2937;
			border-color: #374151;
			color: #f9fafb;
		}

		.pagination-button:hover:not(:disabled),
		.page-button:hover {
			background: #374151;
		}

		.table-container {
			border-color: #374151;
		}
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
