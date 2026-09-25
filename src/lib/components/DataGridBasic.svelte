<!--
	============================================================
	DataGridBasic
	============================================================
	WHAT — A lightweight, zero-dependency data table with sorting, global
	       search and pagination, built from plain Svelte 5 runes.
	WHY  — The 80% case: a few hundred rows that need to be scannable and
	       sortable, in a file you can copy into any project and read end to end.

	FEATURES
	- Click (or Enter/Space on) a header to sort ↑ / ↓
	- Global search across every column, with a live result count
	- Pagination with a windowed page list (first / neighbours / last)
	- Column formatters, inline cell styles, cell classes and sanitised HTML renderers
	- Striped / hoverable / compact variants
	- Light + dark via CSS custom properties (see THEMING below)

	ACCESSIBILITY
	- Sortable headers are focusable, expose aria-sort and respond to Enter/Space
	- Search input and pagination buttons are labelled; current page uses aria-current
	- Result count is announced through aria-live
	- Visible focus rings; hover transitions are disabled under prefers-reduced-motion

	DEPENDENCIES
	- Zero external packages.
	- $lib/types (type-only), $lib/dataGridFormatters.sanitizeClassName and
	  $lib/utils.sanitizeHTML — both tiny; copy them alongside if you lift this file.
	- Heads-up: sanitizeHTML is currently a pass-through seam. cellRenderer output
	  is trusted developer HTML today; plug a real sanitiser into that one
	  function before rendering anything user-supplied.

	PERFORMANCE
	- Filter → sort → paginate is a $derived chain, so each stage only reruns
	  when its inputs change. Comfortable up to ~500 rows; beyond ~2,000 reach
	  for DataGridAdvanced (virtual scrolling).

	THEMING (docs/THEMING.md)
	- Chrome tokens (surfaces, borders, text, hover, stripes) flip under
	  prefers-color-scheme: dark.
	- Brand token --dgb-accent (focus ring, active page, sort arrow) stays constant
	  so the grid keeps the product's accent on both schemes.
	- No semantic tokens — status colour comes from your own cellStyle/cellRenderer.

	USAGE
	<DataGridBasic {data} {columns} pageSize={10} />

	PROPS
	| Prop       | Type             | Default  | Description                                 |
	|------------|------------------|----------|---------------------------------------------|
	| data       | T[]              | []       | Rows; keys match column ids.                |
	| columns    | DataGridColumn[] | required | Column definitions.                         |
	| sortable   | boolean          | true     | Header-click sorting.                       |
	| filterable | boolean          | true     | Show the global search box.                 |
	| pageSize   | number           | 10       | Rows per page (0 = show everything).        |
	| striped    | boolean          | true     | Alternating row backgrounds.                |
	| hoverable  | boolean          | true     | Highlight the row under the pointer.        |
	| compact    | boolean          | false    | Tighter cell padding.                       |
	============================================================
-->

<script lang="ts" generics="T extends object">
	import type { DataGridBasicProps, DataGridColumn } from '$lib/types';
	import { sanitizeClassName } from '$lib/dataGridFormatters';
	import { sanitizeHTML } from '$lib/utils';

	let {
		data = [],
		columns,
		sortable = true,
		filterable = true,
		pageSize = 10,
		striped = true,
		hoverable = true,
		compact = false
	}: DataGridBasicProps<T> = $props();

	// Sorting — which column, which way.
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	// Whatever the user has typed in the search box.
	let filterText = $state('');

	// 1-indexed, like the page numbers the user sees.
	let currentPage = $state(1);

	/** Rows can be any shape, so read values through a string index. */
	function getRowValue(row: T, columnId: string): unknown {
		return (row as Record<string, unknown>)[columnId];
	}

	/** Prefer a row's own id as the {#each} key; fall back to its index. */
	function rowKey(row: T, index: number): unknown {
		return (row as { id?: unknown }).id ?? index;
	}

	// ------------------------------------------------------------
	// Filter → sort → paginate. Each stage is its own $derived so, for
	// example, flipping pages never re-runs the filter.
	// ------------------------------------------------------------

	const filteredData = $derived.by<T[]>(() => {
		if (!filterable || !filterText.trim()) return data;
		const searchTerm = filterText.toLowerCase();
		return data.filter((row) =>
			columns.some((col) => {
				const value = getRowValue(row, col.id);
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(searchTerm);
			})
		);
	});

	const sortedData = $derived.by<T[]>(() => {
		if (!sortable || !sortColumn) return filteredData;
		const columnKey = sortColumn;
		const direction = sortDirection === 'asc' ? 1 : -1;

		// Copy first — sorting in place would mutate the caller's array.
		return [...filteredData].sort((a, b) => {
			const aValue = getRowValue(a, columnKey);
			const bValue = getRowValue(b, columnKey);

			// Blanks always sink to the bottom, whichever way we're sorting.
			if (aValue === null || aValue === undefined) return 1;
			if (bValue === null || bValue === undefined) return -1;

			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return (aValue - bValue) * direction;
			}

			const aStr = String(aValue).toLowerCase();
			const bStr = String(bValue).toLowerCase();
			if (aStr < bStr) return -1 * direction;
			if (aStr > bStr) return 1 * direction;
			return 0;
		});
	});

	const totalRows = $derived(sortedData.length);
	const totalPages = $derived(pageSize > 0 ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1);

	const paginatedData = $derived.by<T[]>(() => {
		if (pageSize === 0) return sortedData;
		const startIndex = (currentPage - 1) * pageSize;
		return sortedData.slice(startIndex, startIndex + pageSize);
	});

	/**
	 * A seven-slot page window: always first and last, with the current page
	 * and its neighbours in between. Keeps the control a fixed width no
	 * matter how many pages there are.
	 */
	const pageWindow = $derived.by<number[]>(() => {
		const slots = Math.min(7, totalPages);
		return Array.from({ length: slots }, (_, i) => {
			if (totalPages <= 7) return i + 1;
			if (i === 0) return 1;
			if (i === 6) return totalPages;
			if (currentPage <= 4) return i + 1;
			if (currentPage >= totalPages - 3) return totalPages - 6 + i;
			return currentPage - 3 + i;
		});
	});

	function isSortable(column: DataGridColumn): boolean {
		return sortable && column.sortable !== false;
	}

	function handleSort(column: DataGridColumn) {
		if (!isSortable(column)) return;
		if (sortColumn === column.id) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column.id;
			sortDirection = 'asc';
		}
		// A new order makes the old page number meaningless.
		currentPage = 1;
	}

	function handleHeaderKeydown(event: KeyboardEvent, column: DataGridColumn) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSort(column);
		}
	}

	/** Raw value → display string. Renderers/formatters win over type defaults. */
	function formatCellValue(value: unknown, column: DataGridColumn, row: T): string {
		if (value === null || value === undefined) return '';
		if (column.cellRenderer) return column.cellRenderer(value, row);
		if (column.formatter) return column.formatter(value, row);

		switch (column.type) {
			case 'number':
				return typeof value === 'number' ? value.toLocaleString('en-GB') : String(value);
			case 'date':
				if (value instanceof Date) return value.toLocaleDateString('en-GB');
				if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
					return new Date(value).toLocaleDateString('en-GB');
				}
				return String(value);
			default:
				return String(value);
		}
	}

	function getCellStyle(value: unknown, column: DataGridColumn, row: T): string {
		return column.cellStyle ? column.cellStyle(value, row) : '';
	}

	function getCellClass(value: unknown, column: DataGridColumn, row: T): string {
		return column.cellClass ? sanitizeClassName(column.cellClass(value, row)) : '';
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
	}

	// Typing a new search jumps back to page 1 so results start from the top.
	$effect(() => {
		void filterText;
		currentPage = 1;
	});

	// If the data shrinks under us (a parent filter, say), don't strand the
	// user on a page that no longer exists.
	$effect(() => {
		if (currentPage > totalPages) currentPage = totalPages;
	});
</script>

<div class="datagrid-basic-wrapper">
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
				<span class="filter-count" aria-live="polite">
					{filteredData.length} result{filteredData.length === 1 ? '' : 's'}
				</span>
			{/if}
		</div>
	{/if}

	<div class="table-container">
		<table class="datagrid-table" class:striped class:hoverable class:compact>
			<thead>
				<tr>
					{#each columns as column, columnIndex (`${columnIndex}-${column.id}`)}
						<th
							class:sortable={isSortable(column)}
							class:sorted={sortColumn === column.id}
							class:asc={sortColumn === column.id && sortDirection === 'asc'}
							class:desc={sortColumn === column.id && sortDirection === 'desc'}
							style={column.width ? `width: ${column.width}px` : ''}
							onclick={() => handleSort(column)}
							onkeydown={(e) => handleHeaderKeydown(e, column)}
							tabindex={isSortable(column) ? 0 : -1}
							role={isSortable(column) ? 'button' : undefined}
							aria-sort={sortColumn === column.id
								? sortDirection === 'asc'
									? 'ascending'
									: 'descending'
								: 'none'}
						>
							<span class="header-content">
								{column.header}
								{#if isSortable(column)}
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
				{#if paginatedData.length === 0}
					<tr>
						<td colspan={columns.length} class="empty-state">
							{filterText ? 'No results found' : 'No data available'}
						</td>
					</tr>
				{:else}
					{#each paginatedData as row, rowIndex (rowKey(row, rowIndex))}
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

	{#if pageSize > 0 && totalPages > 1}
		<div class="datagrid-pagination">
			<div class="pagination-info">
				Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRows)} of
				{totalRows}
			</div>

			<div class="pagination-controls">
				<button
					type="button"
					onclick={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Previous page"
					class="pagination-button"
				>
					←
				</button>

				<div class="page-numbers">
					{#each pageWindow as pageNum (pageNum)}
						<button
							type="button"
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
					type="button"
					onclick={() => goToPage(currentPage + 1)}
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
	/*
	 * Tokens: light defaults live on the root; the dark block below flips
	 * chrome only. --dgb-accent is brand and deliberately stays put.
	 */
	.datagrid-basic-wrapper {
		/* Chrome */
		--dgb-bg: #ffffff;
		--dgb-header-bg: #f9fafb;
		--dgb-header-hover-bg: #f3f4f6;
		--dgb-stripe-bg: #f9fafb;
		--dgb-row-hover-bg: #f3f4f6;
		--dgb-border: #e5e7eb;
		--dgb-input-border: #d1d5db;
		--dgb-input-bg: #ffffff;
		--dgb-header-fg: #374151;
		--dgb-cell-fg: #1f2937;
		--dgb-muted-fg: #6b7280;
		--dgb-empty-fg: #9ca3af;
		--dgb-button-bg: #ffffff;
		--dgb-button-fg: #1f2937;
		--dgb-button-hover-bg: #f3f4f6;

		/* Brand (not flipped) */
		--dgb-accent: #146ef5;
		--dgb-on-accent: #ffffff;
		--dgb-focus-ring: rgba(20, 110, 245, 0.2);

		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	@media (prefers-color-scheme: dark) {
		.datagrid-basic-wrapper {
			--dgb-bg: #1f2937;
			--dgb-header-bg: #111827;
			--dgb-header-hover-bg: #1f2937;
			--dgb-stripe-bg: #111827;
			--dgb-row-hover-bg: #374151;
			--dgb-border: #374151;
			--dgb-input-border: #4b5563;
			--dgb-input-bg: #1f2937;
			--dgb-header-fg: #f9fafb;
			--dgb-cell-fg: #e5e7eb;
			--dgb-muted-fg: #9ca3af;
			--dgb-empty-fg: #6b7280;
			--dgb-button-bg: #1f2937;
			--dgb-button-fg: #f9fafb;
			--dgb-button-hover-bg: #374151;
		}
	}

	/* Filter */
	.datagrid-filter {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.filter-input {
		flex: 1;
		max-width: 400px;
		padding: 0.5rem 0.75rem;
		background: var(--dgb-input-bg);
		color: var(--dgb-cell-fg);
		border: 1px solid var(--dgb-input-border);
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.filter-input:focus-visible {
		outline: none;
		border-color: var(--dgb-accent);
		box-shadow: 0 0 0 3px var(--dgb-focus-ring);
	}

	.filter-count {
		font-size: 0.875rem;
		color: var(--dgb-muted-fg);
	}

	/* Table */
	.table-container {
		overflow-x: auto;
		border: 1px solid var(--dgb-border);
		border-radius: 8px;
	}

	.datagrid-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--dgb-bg);
	}

	thead {
		background: var(--dgb-header-bg);
		border-bottom: 2px solid var(--dgb-border);
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--dgb-header-fg);
		white-space: nowrap;
		user-select: none;
	}

	th.sortable {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	th.sortable:hover {
		background: var(--dgb-header-hover-bg);
	}

	th.sortable:focus-visible {
		outline: 2px solid var(--dgb-accent);
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
		color: var(--dgb-accent);
	}

	tbody tr {
		border-bottom: 1px solid var(--dgb-border);
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	td {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: var(--dgb-cell-fg);
	}

	.datagrid-table.striped tbody tr:nth-child(even) {
		background: var(--dgb-stripe-bg);
	}

	.datagrid-table.hoverable tbody tr:hover {
		background: var(--dgb-row-hover-bg);
	}

	.datagrid-table.compact th,
	.datagrid-table.compact td {
		padding: 0.5rem 0.75rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--dgb-empty-fg);
		font-style: italic;
	}

	/* Pagination */
	.datagrid-pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.pagination-info {
		font-size: 0.875rem;
		color: var(--dgb-muted-fg);
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
		border: 1px solid var(--dgb-input-border);
		border-radius: 6px;
		background: var(--dgb-button-bg);
		color: var(--dgb-button-fg);
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.pagination-button:hover:not(:disabled),
	.page-button:hover {
		background: var(--dgb-button-hover-bg);
		border-color: var(--dgb-accent);
	}

	.pagination-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-button.active {
		background: var(--dgb-accent);
		color: var(--dgb-on-accent);
		border-color: var(--dgb-accent);
	}

	.pagination-button:focus-visible,
	.page-button:focus-visible {
		outline: 2px solid var(--dgb-accent);
		outline-offset: 2px;
	}

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
			flex-wrap: wrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.filter-input,
		th.sortable,
		.pagination-button,
		.page-button {
			transition: none;
		}
	}
</style>
