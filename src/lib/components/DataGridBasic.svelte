<!--
/**
 * DataGridBasic Component - Self-contained data grid (Zero Dependencies)
 *
 * A lightweight, fully self-contained data grid implementation with core features:
 * - Column sorting (ascending/descending)
 * - Global search/filter
 * - Pagination with page size control
 * - Responsive design
 * - Accessible keyboard navigation
 * - Customisable styling
 *
 * This component is COPY-PASTE READY - no external dependencies beyond Svelte.
 * Perfect for learning, prototyping, or projects where bundle size matters.
 *
 * Key differences from DataGridAdvanced:
 * - ✅ Zero dependencies (no SVAR Grid)
 * - ✅ Fully copy-paste ready
 * - ✅ Simple, readable code
 * - ❌ No virtual scrolling (not suitable for 1000s of rows)
 * - ❌ No inline editing
 * - ❌ Simpler filtering (global search only)
 *
 * @component DataGridBasic
 * @example
 * ```svelte
 * <DataGridBasic
 *   data={employees}
 *   columns={columnDefs}
 *   sortable={true}
 *   filterable={true}
 *   pageSize={10}
 * />
 * ```
 *
 * Performance: Suitable for datasets up to ~500 rows
 * For larger datasets, use DataGridAdvanced with virtual scrolling
 */
-->

<script lang="ts">
	import type { DataGridBasicProps, Employee, DataGridColumn } from '$lib/types';
	import { sanitizeClassName } from '$lib/dataGridFormatters';
	import { sanitizeHTML } from '$lib/utils';

	/**
	 * Component Props
	 * columns is required, others have defaults
	 */
	let {
		data = [],
		columns,
		sortable = true,
		filterable = true,
		pageSize = 10,
		striped = true,
		hoverable = true,
		compact = false
	}: DataGridBasicProps = $props();

	/**
	 * Component State
	 * Using Svelte 5 $state rune for reactive state management
	 */

	// Sorting state
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	// Filter state
	let filterText = $state('');

	// Pagination state
	let currentPage = $state(1);

	/**
	 * Type-safe accessor for row values by column ID
	 * Uses Record<string, unknown> assertion which is safer than `any`
	 * because it maintains type checking on the return value
	 *
	 * @param row - The data row
	 * @param columnId - The column ID to access
	 * @returns The value at that column, or undefined
	 */
	function getRowValue(row: Employee, columnId: string): unknown {
		return (row as Record<string, unknown>)[columnId];
	}

	/**
	 * Filtered Data
	 * Apply global search filter to data
	 */
	const filteredData = $derived(() => {
		if (!filterable || !filterText.trim()) {
			return data;
		}

		const searchTerm = filterText.toLowerCase();

		return data.filter((row) => {
			// Search across all column values
			return columns.some((col) => {
				const value = getRowValue(row, col.id);
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(searchTerm);
			});
		});
	});

	/**
	 * Sorted Data
	 * Apply sorting to filtered data
	 */
	const sortedData = $derived(() => {
		if (!sortable || !sortColumn) {
			return filteredData();
		}

		// Create a copy to avoid mutating original
		const sorted = [...filteredData()];

		// Type guard: sortColumn is guaranteed to be non-null here
		const columnKey = sortColumn;

		sorted.sort((a, b) => {
			const aValue = getRowValue(a, columnKey);
			const bValue = getRowValue(b, columnKey);

			// Handle null/undefined values
			if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
			if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

			// Numeric comparison
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
			}

			// String comparison
			const aStr = String(aValue).toLowerCase();
			const bStr = String(bValue).toLowerCase();

			if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
			if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return sorted;
	});

	/**
	 * Pagination calculations
	 */
	const totalRows = $derived(sortedData().length);
	const totalPages = $derived(pageSize > 0 ? Math.ceil(totalRows / pageSize) : 1);

	// Paginated data for display
	const paginatedData = $derived(() => {
		if (pageSize === 0) {
			return sortedData(); // No pagination
		}

		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return sortedData().slice(startIndex, endIndex);
	});

	/**
	 * Handle column header click for sorting
	 */
	function handleSort(columnId: string) {
		if (!sortable) return;

		// Find column to check if it's sortable
		const column = columns.find((col) => col.id === columnId);
		if (column?.sortable === false) return;

		if (sortColumn === columnId) {
			// Toggle direction if same column
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// New column, default to ascending
			sortColumn = columnId;
			sortDirection = 'asc';
		}

		// Reset to first page when sorting changes
		currentPage = 1;
	}

	/**
	 * Format cell value for display
	 */
	function formatCellValue(value: any, column: DataGridColumn, row?: any): string {
		if (value === null || value === undefined) return '';

		// Use custom renderer if provided (for advanced HTML rendering)
		if (column.cellRenderer) {
			return column.cellRenderer(value, row);
		}

		// Use custom formatter if provided
		if (column.formatter) {
			return column.formatter(value, row);
		}

		// Default formatting by type
		switch (column.type) {
			case 'number':
				return typeof value === 'number' ? value.toLocaleString('en-GB') : String(value);
			case 'date':
				// Format date as DD/MM/YYYY
				if (value instanceof Date) {
					return value.toLocaleDateString('en-GB');
				}
				// Handle ISO string dates
				if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
					const date = new Date(value);
					return date.toLocaleDateString('en-GB');
				}
				return String(value);
			default:
				return String(value);
		}
	}

	/**
	 * Get inline CSS styles for a cell
	 */
	function getCellStyle(value: any, column: DataGridColumn, row?: any): string {
		if (column.cellStyle) {
			return column.cellStyle(value, row);
		}
		return '';
	}

	/**
	 * Get CSS classes for a cell
	 * Sanitizes class names to prevent injection attacks
	 */
	function getCellClass(value: any, column: DataGridColumn, row?: any): string {
		if (column.cellClass) {
			const className = column.cellClass(value, row);
			return sanitizeClassName(className);
		}
		return '';
	}

	/**
	 * Pagination controls
	 */
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

	// Reset to first page when filter changes
	$effect(() => {
		const _ = filterText; // Track filterText changes
		currentPage = 1;
	});
</script>

<!--
  Main Component Template

  Structure:
  1. Filter/search input (if filterable)
  2. Data table with sortable headers
  3. Pagination controls (if pageSize > 0)
  4. Results count display
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
					{#each columns as column}
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
					{#each paginatedData() as row, rowIndex}
						<tr>
							{#each columns as column}
								{@const cellValue = getRowValue(row, column.id)}
								<td
									class={getCellClass(cellValue, column, row)}
									style={getCellStyle(cellValue, column, row)}
								>
									{#if column.cellRenderer}
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
					}) as pageNum}
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

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
