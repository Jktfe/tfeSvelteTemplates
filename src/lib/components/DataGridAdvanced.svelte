<!--
	============================================================
	DataGridAdvanced
	============================================================
	WHAT — A production data grid (SVAR Grid wrapper) with virtual scrolling,
	       global search, inline editing, multi-row selection, bulk delete and
	       CSV export — for any row shape, not just employees.
	WHY  — Reach for it when DataGridBasic runs out of road: thousands of rows,
	       or users need to edit data in place. Persistence is callback-driven,
	       so the component never assumes a URL, an API shape or a domain.

	FEATURES
	- Virtual scrolling (smooth at 10,000+ rows — only visible rows are in the DOM)
	- Global search across every visible column
	- Inline editing with type coercion (number / date / select) and option validation
	- Optimistic updates: the edit shows immediately, and rolls back if
	  `onCellEdit` throws or rejects
	- Multi-row selection (click, Ctrl+click to toggle, Shift+click for a range)
	- Bulk delete via `onDelete` (button only renders when you supply it)
	- CSV export of the rows currently matching the search
	- Columns inferred from the first row when `columns` is omitted
	- Light, dark or 'auto' (follows the OS) — search/toolbar chrome follows the grid skin
	- SSR-safe: renders a same-height placeholder on the server, mounts SVAR on hydration

	ACCESSIBILITY
	- SVAR Grid renders role="grid" / gridcell with keyboard cell navigation
	- Wrapper is a labelled region with aria-busy while a save/delete is in flight
	- Status messages (saved, failed, deleted) announce through an aria-live region
	- Visible focus rings on every control; spinner honours prefers-reduced-motion

	DEPENDENCIES
	- @svar-ui/svelte-grid — virtual scrolling + inline editors would be a 100h+
	  hand-rolled project; SVAR is MIT-licensed and well maintained.
	- $lib/types — type-only import (DataGridColumn, DataGridAdvancedProps, …)

	PERFORMANCE
	- Search is a single linear pass over the rows; rendering cost is flat thanks
	  to virtual scrolling. Editing re-feeds only the changed row to SVAR.

	USAGE
	<DataGridAdvanced
		data={rows}
		{columns}
		editable
		selectable
		exportable
		onCellEdit={async ({ id, column, value }) => {
			const res = await fetch('/api/rows', { method: 'PUT', body: JSON.stringify({ id, [column]: value }) });
			if (!res.ok) throw new Error('Save failed');   // throwing rolls the cell back
		}}
		onDelete={async (ids) => { await fetch(`/api/rows?ids=${ids.join(',')}`, { method: 'DELETE' }); }}
	/>

	PROPS
	| Prop              | Type                                   | Default         | Description                                   |
	|-------------------|----------------------------------------|-----------------|-----------------------------------------------|
	| data              | T[]                                    | []              | Rows (any object with an optional `id`).      |
	| columns           | DataGridColumn[]                       | inferred        | Column definitions.                           |
	| editable          | boolean                                | false           | Double-click a cell to edit it.               |
	| selectable        | boolean                                | false           | Multi-row selection.                          |
	| exportable        | boolean                                | false           | Show the Export CSV button.                   |
	| searchable        | boolean                                | true            | Show the global search box.                   |
	| theme             | 'willow' | 'willowDark' | 'auto'       | 'auto'          | Grid skin; 'auto' follows the OS.             |
	| height            | string                                 | '600px'         | Height of the whole component.                |
	| rowHeight         | number                                 | 40              | Row height in pixels.                         |
	| ariaLabel         | string                                 | 'Data grid'     | Accessible name for the region.               |
	| searchLabel       | string                                 | 'Search rows'   | Accessible name for the search box.           |
	| searchPlaceholder | string                                 | 'Search across all columns...' | Search placeholder.            |
	| exportFilename    | string                                 | 'data'          | CSV base filename (date appended).            |
	| onCellEdit        | (edit) => void | Partial<T> | Promise  | —               | Persist an edit; throw to roll back.          |
	| onDelete          | (ids) => void | Promise<void>          | —               | Persist a bulk delete.                        |
	| confirmDelete     | (count) => boolean | Promise<boolean>  | window.confirm  | Confirmation before deleting.                 |
	| onSelectionChange | (ids) => void                          | —               | Selection changed.                            |
	| onError           | (message, error) => void               | —               | An edit or delete failed.                     |
	============================================================
-->

<script lang="ts" generics="T extends DataGridRow">
	import { onMount } from 'svelte';
	import { Grid, Willow, WillowDark } from '@svar-ui/svelte-grid';
	import type { IApi, IColumnConfig } from '@svar-ui/svelte-grid';
	import type {
		DataGridAdvancedProps,
		DataGridColumn,
		DataGridRow,
		DataGridRowId
	} from '$lib/types';

	let {
		data = [],
		columns = undefined,
		editable = false,
		selectable = false,
		exportable = false,
		searchable = true,
		theme = 'auto',
		height = '600px',
		rowHeight = 40,
		ariaLabel = 'Data grid',
		searchLabel = 'Search rows',
		searchPlaceholder = 'Search across all columns...',
		exportFilename = 'data',
		onCellEdit,
		onDelete,
		confirmDelete = defaultConfirm,
		onSelectionChange,
		onError
	}: DataGridAdvancedProps<T> = $props();

	// ============================================================
	// Small, dependency-free helpers
	// ============================================================

	/** Rows are arbitrary objects, so we read them through a string index. */
	function readCell(row: T, key: string): unknown {
		return (row as Record<string, unknown>)[key];
	}

	/**
	 * Class names come from consumer callbacks, so strip anything that isn't a
	 * legal class character before handing it to the grid. Inlined (rather than
	 * imported) to keep this file copy-paste portable.
	 */
	function sanitiseClassName(className: string): string {
		return className.replace(/[^a-zA-Z0-9\s_-]/g, '');
	}

	const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

	function toDate(value: unknown): Date | null {
		if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
		if (typeof value === 'string' && ISO_DATE.test(value)) {
			const parsed = new Date(value);
			return isNaN(parsed.getTime()) ? null : parsed;
		}
		return null;
	}

	/** dd/mm/yy — matches the UK formatting used across the site. */
	function formatDate(value: unknown): string {
		const date = toDate(value);
		if (!date) return value === null || value === undefined ? '' : String(value);
		return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
	}

	/** 'hireDate' → 'Hire Date', 'first_name' → 'First Name'. */
	function humanise(key: string): string {
		const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
		return spaced.charAt(0).toUpperCase() + spaced.slice(1);
	}

	function defaultConfirm(count: number): boolean {
		if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
		return window.confirm(`Delete ${count} row${count === 1 ? '' : 's'}? This cannot be undone.`);
	}

	/**
	 * When no columns are given we look at the first row and guess sensible
	 * types. It's a starting point — pass `columns` for real apps so headers,
	 * widths and select options are deliberate.
	 */
	function inferColumns(rows: T[]): DataGridColumn[] {
		const first = rows[0];
		if (!first) return [];
		return Object.keys(first)
			.filter((key) => !key.startsWith('$'))
			.map((key) => {
				const sample = readCell(first, key);
				const type: DataGridColumn['type'] =
					typeof sample === 'number' ? 'number' : toDate(sample) ? 'date' : 'text';
				return {
					id: key,
					header: key === 'id' ? 'ID' : humanise(key),
					width: key === 'id' ? 70 : undefined,
					type,
					// Ids are identity, not content — editing them would orphan the row.
					editable: key !== 'id'
				};
			});
	}

	// ============================================================
	// Local working copy
	// ============================================================

	// A writable $derived: it re-syncs whenever the parent passes new `data`,
	// but we can also assign to it for optimistic edits and local deletes.
	let rows = $derived<T[]>([...data]);

	let searchQuery = $state('');
	let selectedIds = $state<DataGridRowId[]>([]);
	let isUpdating = $state(false);
	let status = $state<{ tone: 'success' | 'error'; text: string } | null>(null);
	let gridApi: IApi | null = null;

	const resolvedColumns = $derived<DataGridColumn[]>(columns ?? inferColumns(rows));

	const dateColumns = $derived(
		new Set(resolvedColumns.filter((col) => col.type === 'date').map((col) => col.id))
	);

	/** The text a user sees in a cell — also what search and CSV export use. */
	function displayValue(value: unknown, column: DataGridColumn, row: T): string {
		if (column.formatter) return column.formatter(value, row);
		if (value === null || value === undefined) return '';
		if (column.type === 'date') return formatDate(value);
		if (column.type === 'number' && typeof value === 'number') return value.toLocaleString('en-GB');
		return String(value);
	}

	/** Rows that match the search, in their original order. */
	const visibleRows = $derived.by<T[]>(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!searchable || !query) return rows;
		return rows.filter((row) =>
			resolvedColumns.some((col) => {
				const raw = readCell(row, col.id);
				if (raw === null || raw === undefined) return false;
				// Match both the raw value (e.g. '2024-01-15', '75000') and the
				// formatted value (e.g. '15/01/24', '£75,000') so users can type either.
				const rawText = raw instanceof Date ? raw.toISOString() : String(raw);
				return (
					rawText.toLowerCase().includes(query) ||
					displayValue(raw, col, row).toLowerCase().includes(query)
				);
			})
		);
	});

	/**
	 * What SVAR actually receives. Date columns need real Date objects for the
	 * datepicker editor, so ISO strings are converted on the way in.
	 */
	const gridRows = $derived.by(() =>
		visibleRows.map((row) => {
			if (dateColumns.size === 0) return row;
			const copy: Record<string, unknown> = { ...(row as Record<string, unknown>) };
			for (const key of dateColumns) {
				const date = toDate(copy[key]);
				if (date) copy[key] = date;
			}
			return copy;
		})
	);

	function editorFor(column: DataGridColumn): IColumnConfig['editor'] {
		if (column.type === 'date') return 'datepicker';
		if (column.type === 'select' || column.options) return 'richselect';
		// SVAR has no numeric editor — we coerce and validate in handleUpdateCell.
		return 'text';
	}

	const gridColumns = $derived<IColumnConfig[]>(
		resolvedColumns.map((col) => {
			const config: IColumnConfig = {
				id: col.id,
				header: col.header,
				width: typeof col.width === 'number' ? col.width : undefined,
				flexgrow: col.width === 'auto' ? 1 : undefined,
				sort: col.sortable !== false
			};

			if (col.options) {
				// Select options double as labels, so no template is needed —
				// SVAR looks the label up by value itself.
				config.options = col.options.map((option) => ({ id: option, label: option }));
			} else {
				// SVAR renders templates as plain text (Svelte escapes it), so a
				// formatter can never inject markup here.
				config.template = (value: unknown, row: unknown) => displayValue(value, col, row as T);
			}

			if (editable && col.editable !== false) {
				config.editor = editorFor(col);
			}

			return config;
		})
	);

	/** SVAR's `cellStyle` hook returns class names, which is where `cellClass` lands. */
	function gridCellClass(row: unknown, column: { id?: DataGridRowId }): string {
		const col = resolvedColumns.find((c) => c.id === column.id);
		if (!col?.cellClass) return '';
		const typedRow = row as T;
		return sanitiseClassName(col.cellClass(readCell(typedRow, col.id), typedRow));
	}

	// ============================================================
	// Theme — 'auto' follows the OS colour scheme
	// ============================================================

	let prefersDark = $state(false);

	// SVAR initialises its store in a client-side effect, so rendering it
	// during SSR throws. We mount it only once we're in the browser and show
	// a same-height placeholder until then, which also avoids layout shift.
	let isClient = $state(false);
	onMount(() => {
		isClient = true;
	});

	$effect(() => {
		if (theme !== 'auto' || typeof window === 'undefined' || !window.matchMedia) return;
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		prefersDark = media.matches;
		const onChange = (event: MediaQueryListEvent) => (prefersDark = event.matches);
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	});

	const isDark = $derived(theme === 'willowDark' || (theme === 'auto' && prefersDark));

	// ============================================================
	// Editing
	// ============================================================

	function describeError(error: unknown): string {
		return error instanceof Error ? error.message : String(error ?? 'Unknown error');
	}

	function reportError(message: string, error: unknown) {
		status = { tone: 'error', text: message };
		onError?.(message, error);
	}

	/**
	 * Coerce the raw editor value into the column's type. Returns an error
	 * string instead of throwing so validation failures read as friendly
	 * status messages rather than exceptions.
	 */
	function coerce(column: DataGridColumn | undefined, value: unknown): { value: unknown } | { error: string } {
		if (!column) return { value };
		if (column.options && !column.options.includes(String(value))) {
			return { error: `"${String(value)}" isn't a valid ${column.header}. Choose one of: ${column.options.join(', ')}.` };
		}
		if (column.type === 'number') {
			const text = String(value ?? '').replace(/[£$€,\s]/g, '');
			const parsed = Number(text);
			if (text === '' || !Number.isFinite(parsed)) {
				return { error: `${column.header} must be a number.` };
			}
			return { value: parsed };
		}
		if (column.type === 'date') {
			const date = toDate(value);
			if (!date) return { error: `${column.header} must be a valid date.` };
			return { value: date };
		}
		return { value };
	}

	function patchRow(id: DataGridRowId, patch: Record<string, unknown>) {
		rows = rows.map((row) => (row.id === id ? ({ ...row, ...patch } as T) : row));
	}

	async function handleUpdateCell(event: { id: DataGridRowId; column: DataGridRowId; value: unknown }) {
		const { id } = event;
		const columnId = String(event.column);
		const original = rows.find((row) => row.id === id);
		if (!original) return;

		const column = resolvedColumns.find((col) => col.id === columnId);
		const previousValue = readCell(original, columnId);
		const coerced = coerce(column, event.value);

		if ('error' in coerced) {
			// Re-feeding the untouched row makes SVAR repaint the old value.
			rows = [...rows];
			reportError(coerced.error, new Error(coerced.error));
			return;
		}

		// Optimistic: show the new value straight away, remember the old one.
		patchRow(id, { [columnId]: coerced.value });
		status = null;

		if (!onCellEdit) return;

		try {
			isUpdating = true;
			const updatedRow = rows.find((row) => row.id === id) ?? original;
			const serverPatch = await onCellEdit({
				id,
				column: columnId,
				value: coerced.value,
				previousValue,
				row: updatedRow
			});
			// Let the server have the last word (e.g. a recalculated updatedAt).
			if (serverPatch && typeof serverPatch === 'object') {
				patchRow(id, serverPatch as Record<string, unknown>);
			}
			status = { tone: 'success', text: `Saved ${column?.header ?? columnId}.` };
		} catch (error) {
			patchRow(id, { [columnId]: previousValue });
			reportError(`Couldn't save ${column?.header ?? columnId}: ${describeError(error)}`, error);
		} finally {
			isUpdating = false;
		}
	}

	// ============================================================
	// Selection + bulk delete
	// ============================================================

	function handleSelectRow() {
		// SVAR fires select-row per click; the store holds the full selection.
		const current = gridApi?.getState().selectedRows ?? [];
		selectedIds = [...current];
		onSelectionChange?.(selectedIds);
	}

	async function deleteSelected() {
		if (!onDelete || selectedIds.length === 0) return;
		const ids = [...selectedIds];
		if (!(await confirmDelete(ids.length))) return;

		try {
			isUpdating = true;
			await onDelete(ids);
			// Tell SVAR first so its own selection state stays consistent, then
			// mirror the change locally (which SVAR sees as a no-op).
			for (const id of ids) gridApi?.exec('delete-row', { id });
			const doomed = new Set(ids);
			rows = rows.filter((row) => row.id === undefined || !doomed.has(row.id));
			selectedIds = [];
			onSelectionChange?.(selectedIds);
			status = { tone: 'success', text: `Deleted ${ids.length} row${ids.length === 1 ? '' : 's'}.` };
		} catch (error) {
			reportError(`Couldn't delete: ${describeError(error)}`, error);
		} finally {
			isUpdating = false;
		}
	}

	// ============================================================
	// CSV export — exports what the user can currently see
	// ============================================================

	function csvCell(text: string): string {
		return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
	}

	function exportToCSV() {
		if (visibleRows.length === 0) return;
		const header = resolvedColumns.map((col) => csvCell(col.header)).join(',');
		const body = visibleRows
			.map((row) =>
				resolvedColumns
					.map((col) => {
						const value = readCell(row, col.id);
						// Dates export as ISO (yyyy-mm-dd) so spreadsheets parse them reliably.
						const date = col.type === 'date' ? toDate(value) : null;
						const text = date
							? date.toISOString().split('T')[0]
							: value === null || value === undefined
								? ''
								: String(value);
						return csvCell(text);
					})
					.join(',')
			)
			.join('\n');

		const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	const showDelete = $derived(selectable && !!onDelete && selectedIds.length > 0);
</script>

<div
	class="datagrid-advanced-wrapper"
	data-scheme={isDark ? 'dark' : 'light'}
	style:height
	aria-busy={isUpdating}
	role="region"
	aria-label={ariaLabel}
>
	{#if searchable}
		<div class="search-container">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={searchPlaceholder}
				class="search-input"
				aria-label={searchLabel}
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="clear-search-button"
					aria-label="Clear search"
				>
					<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
						<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
					</svg>
				</button>
			{/if}
			{#if searchQuery && visibleRows.length !== rows.length}
				<span class="search-results" aria-live="polite">
					{visibleRows.length} of {rows.length} rows
				</span>
			{/if}
		</div>
	{/if}

	{#if exportable || showDelete || isUpdating}
		<div class="datagrid-actions">
			{#if isUpdating}
				<span class="loading-indicator">
					<span class="spinner" aria-hidden="true"></span>
					Saving…
				</span>
			{/if}

			{#if showDelete}
				<button
					type="button"
					onclick={deleteSelected}
					class="delete-button"
					disabled={isUpdating}
					aria-label="Delete selected rows"
				>
					<svg class="delete-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
						<path
							d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.6 8.5h4.8l.6-8.5"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Delete selected ({selectedIds.length})
				</button>
			{/if}

			{#if exportable}
				<button
					type="button"
					onclick={exportToCSV}
					class="export-button"
					disabled={isUpdating || visibleRows.length === 0}
					aria-label="Export data to CSV"
				>
					<svg class="export-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
						<path
							d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Export CSV
				</button>
			{/if}
		</div>
	{/if}

	<div class="status-region" aria-live="polite">
		{#if status}
			<p class="status-message" data-tone={status.tone}>{status.text}</p>
		{/if}
	</div>

	<div class="grid-host">
		{#snippet grid()}
			<Grid
				data={gridRows}
				columns={gridColumns}
				select={selectable}
				multiselect={selectable}
				sizes={{ rowHeight }}
				cellStyle={gridCellClass}
				init={(api: IApi) => (gridApi = api)}
				onupdatecell={handleUpdateCell}
				onselectrow={handleSelectRow}
			/>
		{/snippet}

		{#if !isClient}
			<div class="grid-placeholder" aria-hidden="true"></div>
		{:else if isDark}
			<WillowDark>{@render grid()}</WillowDark>
		{:else}
			<Willow>{@render grid()}</Willow>
		{/if}
	</div>
</div>

<style>
	/*
	 * THEMING (see docs/THEMING.md)
	 * Chrome tokens flip with the grid skin. We key the flip off
	 * [data-scheme] rather than a media query because the SVAR skin is chosen
	 * by the `theme` prop — an explicit theme="willow" on a dark OS should
	 * keep the search bar light too, so the two never disagree.
	 * Brand: --dga-accent (primary buttons, focus ring) stays constant.
	 * Semantic: --dga-danger (delete), --dga-success / --dga-error (status) stay constant.
	 */
	.datagrid-advanced-wrapper {
		--dga-surface: #f9fafb;
		--dga-input-bg: #ffffff;
		--dga-border: #e5e7eb;
		--dga-input-border: #d1d5db;
		--dga-fg: #374151;
		--dga-muted: #6b7280;
		--dga-placeholder: #9ca3af;
		--dga-chip-bg: #e5e7eb;
		--dga-chip-bg-hover: #d1d5db;
		--dga-accent: #146ef5;
		--dga-accent-hover: #0f5fd4;
		--dga-on-accent: #ffffff;
		--dga-danger: #dc2626;
		--dga-danger-hover: #b91c1c;
		--dga-success: #15803d;
		--dga-success-bg: #dcfce7;
		--dga-error: #b91c1c;
		--dga-error-bg: #fee2e2;

		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: var(--dga-fg);
	}

	.datagrid-advanced-wrapper[data-scheme='dark'] {
		--dga-surface: #1f2937;
		--dga-input-bg: #111827;
		--dga-border: #374151;
		--dga-input-border: #4b5563;
		--dga-fg: #e5e7eb;
		--dga-muted: #9ca3af;
		--dga-placeholder: #6b7280;
		--dga-chip-bg: #374151;
		--dga-chip-bg-hover: #4b5563;
		--dga-success-bg: rgba(21, 128, 61, 0.2);
		--dga-error-bg: rgba(185, 28, 28, 0.2);
		--dga-success: #4ade80;
		--dga-error: #f87171;
	}

	/* Search */
	.search-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--dga-surface);
		border: 1px solid var(--dga-border);
		border-radius: 8px;
	}

	.search-input {
		flex: 1;
		min-width: 0;
		padding: 0.625rem 1rem;
		background: var(--dga-input-bg);
		border: 1px solid var(--dga-input-border);
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--dga-fg);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.search-input:focus-visible {
		outline: none;
		border-color: var(--dga-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--dga-accent) 25%, transparent);
	}

	.search-input::placeholder {
		color: var(--dga-placeholder);
	}

	.clear-search-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		background: var(--dga-chip-bg);
		border: none;
		border-radius: 4px;
		color: var(--dga-muted);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.clear-search-button:hover {
		background: var(--dga-chip-bg-hover);
		color: var(--dga-fg);
	}

	.clear-search-button:focus-visible {
		outline: 2px solid var(--dga-accent);
		outline-offset: 2px;
	}

	.search-results {
		font-size: 0.875rem;
		color: var(--dga-muted);
		font-weight: 500;
		white-space: nowrap;
	}

	/* Actions */
	.datagrid-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.export-button,
	.delete-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		color: var(--dga-on-accent);
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	.export-button {
		background: var(--dga-accent);
	}

	.export-button:hover:not(:disabled) {
		background: var(--dga-accent-hover);
		transform: translateY(-1px);
	}

	.delete-button {
		background: var(--dga-danger);
	}

	.delete-button:hover:not(:disabled) {
		background: var(--dga-danger-hover);
		transform: translateY(-1px);
	}

	.export-button:focus-visible,
	.delete-button:focus-visible {
		outline: 2px solid var(--dga-accent);
		outline-offset: 2px;
	}

	.export-button:disabled,
	.delete-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--dga-muted);
		font-weight: 500;
		margin-right: auto;
	}

	.spinner {
		width: 0.875rem;
		height: 0.875rem;
		border: 2px solid var(--dga-border);
		border-top-color: var(--dga-accent);
		border-radius: 50%;
		animation: dga-spin 0.8s linear infinite;
	}

	@keyframes dga-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Status */
	.status-region:empty {
		display: none;
	}

	.status-message {
		margin: 0;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.8125rem;
	}

	.status-message[data-tone='success'] {
		color: var(--dga-success);
		background: var(--dga-success-bg);
	}

	.status-message[data-tone='error'] {
		color: var(--dga-error);
		background: var(--dga-error-bg);
	}

	/* Grid host: gives SVAR (height: 100%) a definite box to fill. */
	.grid-host {
		flex: 1;
		min-height: 0;
		border-radius: 8px;
		overflow: hidden;
	}

	.grid-placeholder {
		height: 100%;
		border: 1px solid var(--dga-border);
		border-radius: 8px;
		background: var(--dga-surface);
	}

	@media (max-width: 768px) {
		.export-button,
		.delete-button {
			font-size: 0.8125rem;
			padding: 0.4rem 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}

		.export-button,
		.delete-button,
		.search-input {
			transition: none;
		}

		.export-button:hover:not(:disabled),
		.delete-button:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
