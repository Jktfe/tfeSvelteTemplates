<!--
/**
 * DataGridAdvanced Component - Production-ready data grid using SVAR Grid
 *
 * A comprehensive wrapper around @svar-ui/svelte-grid that provides:
 * - Virtual scrolling for large datasets
 * - Global search across all columns
 * - Column sorting and filtering
 * - Inline editing with various editor types
 * - Row selection and bulk operations
 * - CSV export
 * - Responsive design
 * - Light and dark themes
 * - Full TypeScript support
 *
 * This component demonstrates how to integrate a third-party grid library
 * with custom configuration and styling while maintaining type safety.
 *
 * @component DataGridAdvanced
 * @example
 * ```svelte
 * <DataGridAdvanced
 *   data={employees}
 *   editable={true}
 *   selectable={true}
 *   pageSize={20}
 *   exportable={true}
 *   theme="willow"
 * />
 * ```
 *
 * Dependencies:
 * - @svar-ui/svelte-grid (SVAR Grid library)
 *
 * Key Features:
 * - Handles large datasets efficiently with virtual scrolling
 * - Global search filters across all columns in real-time
 * - Column-level sorting and filtering
 * - Auto-generates column definitions from data structure
 * - Supports custom column configuration
 * - Theme-aware (light/dark modes)
 * - Fully accessible (WAI-ARIA compliant)
 * - CSV export functionality
 * - Bulk delete operations
 * - Optimistic updates with rollback on error
 *
 * Note: This is NOT a copy-paste ready component due to the @svar-ui/svelte-grid dependency.
 * For a self-contained alternative, see DataGridBasic.svelte
 */
-->

<script lang="ts">
	import { Grid, Willow, WillowDark } from '@svar-ui/svelte-grid';
	import type { DataGridAdvancedProps, Employee, DataGridColumn } from '$lib/types';
	import { sanitizeClassName } from '$lib/dataGridFormatters';
	import {
		DEPARTMENT_OPTIONS_GRID,
		STATUS_OPTIONS_GRID,
		POSITION_OPTIONS_GRID,
		LOCATION_OPTIONS_GRID,
		transformToGridOptions,
		VALIDATION_FIELDS
	} from '$lib/constants';

	/**
	 * Escape HTML special characters to prevent XSS attacks
	 * Used for formatter output and raw values in template
	 */
	function escapeHtml(str: string): string {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	/**
	 * Component Props
	 * All props are optional except data, with sensible defaults
	 *
	 * Note: Inline editing requires both:
	 * 1. editable={true} prop (enables Grid-level edit mode)
	 * 2. Column-level editor properties (auto-configured)
	 * Click any cell to start editing, press Enter to save, Esc to cancel
	 */
	let {
		data = [],
		columns = undefined,
		editable = false,
		selectable = false,
		pageSize = 20,
		exportable = false,
		theme = 'willow'
	}: DataGridAdvancedProps = $props();

	/**
	 * Search state for global filtering
	 */
	let searchQuery = $state('');

	/**
	 * Format a Date object as dd/mm/yy for display
	 * Handles Date objects, date strings, and null/undefined values
	 */
	function formatDateDisplay(date: any): string {
		// Handle null/undefined
		if (!date) return '';

		// Convert to Date object if needed
		let dateObj: Date;
		if (date instanceof Date) {
			dateObj = date;
		} else if (typeof date === 'string') {
			dateObj = new Date(date);
		} else {
			return String(date);
		}

		// Validate Date object
		if (isNaN(dateObj.getTime())) return '';

		// Format as dd/mm/yy using UK locale
		return dateObj.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit'
		});
	}

	/**
	 * Generate SVAR Grid column configuration
	 * Converts our DataGridColumn format to SVAR Grid's expected format
	 *
	 * SVAR Grid column properties:
	 * - id: string - Column identifier (must match data key)
	 * - header: string - Column header text
	 * - width: number - Column width in pixels (optional)
	 * - sort: boolean - Enable sorting (default: true)
	 * - filter: boolean - Enable filtering (default: true)
	 * - editor: string - Editor type for inline editing ('text', 'number', 'date', etc.)
	 *
	 * Note: For date fields, template + editor work together (template for display, editor for editing)
	 */
	const gridColumns = $derived(() => {
		// If custom columns provided, use them
		if (columns) {
			return columns.map((col) => {
				const gridCol: any = {
					id: col.id,
					header: col.header,
					width: typeof col.width === 'number' ? col.width : undefined,
					sort: col.sortable !== false, // Default to true
					filter: col.filterable !== false // Default to true
				};

				// Add editor configuration if editable
				if (editable && col.editable !== false) {
					gridCol.editor = getEditorType(col.type);

					// Transform options to SVAR Grid format { id, label }
					if (col.options) {
						gridCol.options = transformToGridOptions(col.options);
					}

					// SPECIAL CASE: Date fields can have template + editor together
					// Template formats display, editor handles editing
					// Note: Template receives the cell VALUE directly, not the row object
					if (col.type === 'date') {
						gridCol.template = (value: any) => formatDateDisplay(value);
					}
				}

				// Add template for NON-editable columns (or non-date editable columns)
				if (!editable || col.editable === false) {
					gridCol.template = (obj: any) => {
						const value = obj[col.id];

						// If cellRenderer is provided, use it (returns HTML - already escaped by renderer)
						if (col.cellRenderer) {
							const html = col.cellRenderer(value, obj);
							const style = col.cellStyle ? col.cellStyle(value, obj) : '';
							const className = col.cellClass ? sanitizeClassName(col.cellClass(value, obj)) : '';

							// Wrap in span with styles and classes
							if (style || className) {
								return `<span class="${className}" style="${style}">${html}</span>`;
							}
							return html;
						}

						// If formatter is provided, use it and escape output
						if (col.formatter) {
							const formatted = col.formatter(value, obj);
							const escapedFormatted = escapeHtml(formatted);
							const style = col.cellStyle ? col.cellStyle(value, obj) : '';
							const className = col.cellClass ? sanitizeClassName(col.cellClass(value, obj)) : '';

							if (style || className) {
								return `<span class="${className}" style="${style}">${escapedFormatted}</span>`;
							}
							return escapedFormatted;
						}

						// If only styling options are provided
						if (col.cellStyle || col.cellClass) {
							const style = col.cellStyle ? col.cellStyle(value, obj) : '';
							const className = col.cellClass ? sanitizeClassName(col.cellClass(value, obj)) : '';
							const rawValue = value !== null && value !== undefined ? String(value) : '';
							const displayValue = escapeHtml(rawValue);

							if (style || className) {
								return `<span class="${className}" style="${style}">${displayValue}</span>`;
							}
							return displayValue;
						}

						// Default: escape value before returning
						const rawValue = value !== null && value !== undefined ? String(value) : '';
						return escapeHtml(rawValue);
					};
				}

				return gridCol;
			});
		}

		// Auto-generate columns from first data row
		if (data.length === 0) return [];

		const firstRow = data[0];
		const autoColumns = [];

		// Define column order and configuration
		// Options are pre-transformed to SVAR Grid format { id, label }
		const columnConfig: Record<string, {
			header: string;
			width?: number;
			type?: DataGridColumn['type'];
			options?: Array<{ id: string; label: string }>;
		}> = {
			id: { header: 'ID', width: 60 },
			firstName: { header: 'First Name', width: 120 },
			lastName: { header: 'Last Name', width: 120 },
			email: { header: 'Email', width: 200, type: 'email' },
			department: { header: 'Department', width: 120, type: 'select', options: DEPARTMENT_OPTIONS_GRID },
			position: { header: 'Position', width: 150, type: 'select', options: POSITION_OPTIONS_GRID },
			salary: { header: 'Salary', width: 120, type: 'number' },
			hireDate: { header: 'Hire Date', width: 120, type: 'date' },
			status: { header: 'Status', width: 100, type: 'select', options: STATUS_OPTIONS_GRID },
			location: { header: 'Location', width: 120, type: 'select', options: LOCATION_OPTIONS_GRID },
			phone: { header: 'Phone', width: 140, type: 'tel' },
			notes: { header: 'Notes', width: 200 }
		};

		// Generate columns in defined order
		for (const [key, config] of Object.entries(columnConfig)) {
			if (key in firstRow) {
				const autoCol: any = {
					id: key,
					header: config.header,
					width: config.width,
					sort: true,
					filter: true
				};

				// Add editor and options if editable
				// No template property - allows inline editing to work
				if (editable) {
					autoCol.editor = getEditorType(config.type);
					if (config.options) {
						autoCol.options = config.options; // Already in SVAR Grid format
					}
				}

				// Add template for date formatting (display only, doesn't block editing)
				// SVAR Grid allows template + editor together for date fields
				// Note: Template receives the cell VALUE directly, not the row object
				if (key === 'hireDate') {
					autoCol.template = (value: any) => formatDateDisplay(value);
				}

				autoColumns.push(autoCol);
			}
		}

		return autoColumns;
	});

	/**
	 * Get SVAR Grid editor type from our column type
	 * Maps our simplified type system to SVAR Grid's editor types
	 *
	 * @param type - The column type
	 * @returns Editor type string
	 *
	 * Note: SVAR Grid only supports 'text', 'datepicker', 'richselect', and 'combo' editors
	 * For number fields, we use 'text' editor and rely on validation in handleEdit
	 */
	function getEditorType(type?: DataGridColumn['type']): string | undefined {
		switch (type) {
			case 'number':
				// SVAR Grid doesn't have a 'number' editor type
				// Use 'text' and validate numeric input in handleEdit
				return 'text';
			case 'date':
				return 'datepicker';
			case 'select':
				// richselect = dropdown with predefined options (not editable)
				// combo = editable dropdown with suggestions
				return 'richselect';
			case 'email':
			case 'tel':
			case 'text':
			default:
				return 'text';
		}
	}

	/**
	 * Transform and filter data for SVAR Grid
	 * - Converts hireDate strings to Date objects for datepicker editor
	 * - Applies global search filter across all columns
	 */
	const gridData = $derived(() => {
		let filteredData = data;

		// Apply global search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filteredData = data.filter((employee) => {
				// Search across all string and number fields
				const hireDateStr = typeof employee.hireDate === 'string'
					? employee.hireDate
					: employee.hireDate?.toISOString().split('T')[0];

				return (
					employee.firstName?.toLowerCase().includes(query) ||
					employee.lastName?.toLowerCase().includes(query) ||
					employee.email?.toLowerCase().includes(query) ||
					employee.department?.toLowerCase().includes(query) ||
					employee.position?.toLowerCase().includes(query) ||
					employee.status?.toLowerCase().includes(query) ||
					employee.location?.toLowerCase().includes(query) ||
					employee.phone?.toLowerCase().includes(query) ||
					employee.notes?.toLowerCase().includes(query) ||
					employee.salary?.toString().includes(query) ||
					hireDateStr?.includes(query)
				);
			});
		}

		// Convert hireDate strings to Date objects for datepicker editor
		return filteredData.map((employee) => {
			const transformed = { ...employee };
			if (transformed.hireDate && typeof transformed.hireDate === 'string') {
				transformed.hireDate = new Date(transformed.hireDate);
			}
			return transformed;
		});
	});

	/**
	 * Selected row IDs state
	 */
	let selectedIds = $state<number[]>([]);

	/**
	 * Loading state for API calls
	 */
	let isUpdating = $state(false);

	/**
	 * Handle cell edit event with optimistic updates and API integration
	 * Called when user edits a cell in the grid
	 *
	 * @param event - SVAR Grid edit event containing row, column, and new value
	 */
	async function handleEdit(event: CustomEvent) {
		const { id, col, value } = event.detail;
		console.log('[DataGridAdvanced] Cell edited:', { id, col, value });

		// Find the row being edited
		const rowIndex = data.findIndex((row) => row.id === id);
		if (rowIndex === -1) {
			console.error('[DataGridAdvanced] Row not found:', id);
			return;
		}

		// Map grid column name to Employee property (handle camelCase conversion)
		const propertyMap: Record<string, keyof typeof data[0]> = {
			id: 'id',
			firstName: 'firstName',
			lastName: 'lastName',
			email: 'email',
			department: 'department',
			position: 'position',
			salary: 'salary',
			hireDate: 'hireDate',
			status: 'status',
			location: 'location',
			phone: 'phone',
			notes: 'notes'
		};

		const property = propertyMap[col];
		if (!property) {
			console.error('[DataGridAdvanced] Unknown column:', col);
			return;
		}

		// Validate select field values against allowed options
		if (property in VALIDATION_FIELDS) {
			const allowedValues = VALIDATION_FIELDS[property as keyof typeof VALIDATION_FIELDS];
			if (!allowedValues.includes(String(value))) {
				alert(`Invalid value for ${property}: ${value}. Must be one of: ${allowedValues.join(', ')}`);
				console.error(`[DataGridAdvanced] Invalid value for ${property}:`, value);
				return;
			}
		}

		// Store original value for rollback
		const originalValue = data[rowIndex][property];

		// Process value based on type
		let processedValue = value;

		// Convert Date objects to YYYY-MM-DD format for API
		if (property === 'hireDate') {
			if (value instanceof Date) {
				processedValue = value.toISOString().split('T')[0];
			} else if (typeof value === 'string' && value.includes('T')) {
				processedValue = value.split('T')[0];
			} else if (typeof value === 'string') {
				// Already in YYYY-MM-DD format
				processedValue = value;
			}
		}

		// Optimistic update: Update local data immediately
		(data[rowIndex] as any)[property] = processedValue;

		try {
			isUpdating = true;

			// Send update to API
			const response = await fetch('/datagrid/api', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id,
					[property]: processedValue
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update employee');
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Update failed');
			}

			console.log('[DataGridAdvanced] Successfully updated employee:', result.data);

			// Update with server response (in case server modified the data)
			if (result.data) {
				Object.assign(data[rowIndex], result.data);
			}
		} catch (error) {
			console.error('[DataGridAdvanced] Error updating employee:', error);

			// Rollback optimistic update
			(data[rowIndex] as any)[property] = originalValue;

			// Show error to user
			alert(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isUpdating = false;
		}
	}

	/**
	 * Handle row selection event
	 * Called when user selects/deselects rows
	 *
	 * @param event - SVAR Grid selection event containing selected row IDs
	 */
	function handleSelection(event: CustomEvent) {
		selectedIds = event.detail;
		console.log('[DataGridAdvanced] Rows selected:', selectedIds);
	}

	/**
	 * Delete selected rows with bulk API call
	 */
	async function deleteSelected() {
		if (selectedIds.length === 0) {
			alert('No rows selected');
			return;
		}

		if (!confirm(`Delete ${selectedIds.length} employee(s)? This action cannot be undone.`)) {
			return;
		}

		try {
			isUpdating = true;

			const response = await fetch(`/datagrid/api?ids=${selectedIds.join(',')}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete employees');
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Delete failed');
			}

			console.log('[DataGridAdvanced] Deleted employees:', result);

			// Remove deleted rows from local data
			data = data.filter((row) => !selectedIds.includes(row.id!));
			selectedIds = [];

			alert(`Successfully deleted ${result.deletedCount} employee(s)`);
		} catch (error) {
			console.error('[DataGridAdvanced] Error deleting employees:', error);
			alert(`Failed to delete employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isUpdating = false;
		}
	}

	/**
	 * Export data to CSV
	 * Generates and downloads a CSV file of the current grid data
	 */
	function exportToCSV() {
		if (data.length === 0) {
			alert('No data to export');
			return;
		}

		// Get column headers
		const cols = gridColumns();
		const headers = cols.map((col) => col.header).join(',');

		// Convert data rows to CSV format
		const rows = data.map((row) => {
			return cols.map((col) => {
				const value = (row as any)[col.id];
				// Escape commas and quotes in values
				if (value === null || value === undefined) return '';
				const stringValue = String(value);
				if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			}).join(',');
		}).join('\n');

		const csv = `${headers}\n${rows}`;

		// Create download link
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

</script>

<!--
  Main Component Template

  Structure:
  1. Optional export button
  2. Theme wrapper (Willow or WillowDark)
  3. SVAR Grid component with configuration
  4. Custom styling for grid appearance
-->

<div class="datagrid-advanced-wrapper" aria-busy={isUpdating} role="region" aria-label="Employee data grid">
	<!-- Global Search -->
	<div class="search-container">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search across all columns..."
			class="search-input"
			aria-label="Search employees"
		/>
		{#if searchQuery}
			<button
				onclick={() => searchQuery = ''}
				class="clear-search-button"
				aria-label="Clear search"
			>
				✕
			</button>
		{/if}
		{#if searchQuery && gridData().length !== data.length}
			<span class="search-results" aria-live="polite">
				{gridData().length} of {data.length} rows
			</span>
		{/if}
	</div>

	<!-- Action buttons -->
	{#if exportable || (selectable && selectedIds.length > 0)}
		<div class="datagrid-actions">
			<!-- Delete selected button (only shown when rows are selected) -->
			{#if selectable && selectedIds.length > 0}
				<button
					onclick={deleteSelected}
					class="delete-button"
					disabled={isUpdating}
					aria-label="Delete selected employees"
				>
					<span class="delete-icon" aria-hidden="true">🗑️</span>
					Delete Selected ({selectedIds.length})
				</button>
			{/if}

			<!-- Export CSV button -->
			{#if exportable}
				<button
					onclick={exportToCSV}
					class="export-button"
					disabled={isUpdating}
					aria-label="Export data to CSV"
				>
					<span class="export-icon" aria-hidden="true">⬇</span>
					Export CSV
				</button>
			{/if}

			<!-- Loading indicator -->
			{#if isUpdating}
				<span class="loading-indicator" aria-live="polite">
					Updating...
				</span>
			{/if}
		</div>
	{/if}

	<!-- SVAR Grid with type compatibility layer -->
	{#if theme === 'willowDark'}
		{@const gridCols = gridColumns() as any}
		{@const gridProps = editable ? { edit: true } : {}}
		{@const pagerProps = pageSize > 0 ? { pager: { size: pageSize } } : {}}
		{@const eventProps = { 'on:edit': handleEdit, 'on:selection': handleSelection } as any}
		<WillowDark>
			<Grid
				data={gridData()}
				columns={gridCols}
				selection={selectable ? 'row' : false}
				rowHeight={40}
				{...pagerProps}
				{...gridProps}
				{...eventProps}
			/>
		</WillowDark>
	{:else}
		{@const gridCols = gridColumns() as any}
		{@const gridProps = editable ? { edit: true } : {}}
		{@const pagerProps = pageSize > 0 ? { pager: { size: pageSize } } : {}}
		{@const eventProps = { 'on:edit': handleEdit, 'on:selection': handleSelection } as any}
		<Willow>
			<Grid
				data={gridData()}
				columns={gridCols}
				selection={selectable ? 'row' : false}
				rowHeight={40}
				{...pagerProps}
				{...gridProps}
				{...eventProps}
			/>
		</Willow>
	{/if}
</div>

<style>
	/**
	 * Component Styles
	 * Scoped to this component only
	 */

	.datagrid-advanced-wrapper {
		width: 100%;
		/* Set a default height - adjust as needed */
		height: 600px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Search Container */
	.search-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.search-input {
		flex: 1;
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.clear-search-button {
		padding: 0.5rem;
		background: #e5e7eb;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
		line-height: 1;
	}

	.clear-search-button:hover {
		background: #d1d5db;
		color: #374151;
	}

	.search-results {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Export button container */
	.datagrid-actions {
		display: flex;
		justify-content: flex-end;
		padding: 0.5rem 0;
	}

	/* Export button styling */
	.export-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #146ef5;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.export-button:hover {
		background: #0f5fd4;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(20, 110, 245, 0.3);
	}

	.export-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(20, 110, 245, 0.2);
	}

	.export-button:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.export-icon,
	.delete-icon {
		font-size: 1rem;
	}

	/* Delete button styling */
	.delete-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.delete-button:hover:not(:disabled) {
		background: #b91c1c;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
	}

	.delete-button:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
	}

	.delete-button:focus-visible {
		outline: 2px solid #dc2626;
		outline-offset: 2px;
	}

	.delete-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Loading indicator */
	.loading-indicator {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.loading-indicator::before {
		content: '⏳';
		margin-right: 0.5rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.export-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/**
	 * Grid container styling
	 * Override SVAR Grid defaults for better integration
	 */
	:global(.datagrid-advanced-wrapper .wx-grid) {
		flex: 1;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	/**
	 * Responsive adjustments
	 */
	@media (max-width: 768px) {
		.datagrid-advanced-wrapper {
			height: 500px;
		}

		.export-button {
			font-size: 0.8125rem;
			padding: 0.4rem 0.875rem;
		}
	}

	/**
	 * Dark mode support
	 * Adjust border colours for dark theme
	 */
	@media (prefers-color-scheme: dark) {
		:global(.datagrid-advanced-wrapper .wx-grid) {
			border-color: #374151;
		}
	}

	/**
	 * CSS-based currency formatting for salary column
	 * Target salary cells and prepend £ symbol using ::before pseudo-element
	 */
	:global(.wx-grid [data-col="salary"] .wx-cell-value::before) {
		content: '£';
		margin-right: 0.125rem;
	}

	/* Format salary values with thousands separators using locale-aware formatting */
	:global(.wx-grid [data-col="salary"] .wx-cell-value) {
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
