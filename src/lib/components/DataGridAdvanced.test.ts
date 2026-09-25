/**
 * ============================================================
 * DataGridAdvanced Tests
 * ============================================================
 *
 * These tests verify that DataGridAdvanced renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Wrapper structure is correct
 *   - Search input appears and functions
 *   - Export button appears when enabled
 *   - Accessibility attributes are present
 *   - Theme wrapper is applied
 *
 *   - Search, CSV export, and the callback-driven persistence API
 *     (onCellEdit / onDelete / onSelectionChange, including rollback)
 *
 * Note: jsdom has no layout, so SVAR only renders the leading column
 * and virtual scrolling can't be exercised here — that stays a manual
 * browser check.
 *
 * Run these tests:
 *   bun run test                        - Run once
 *   bun run test:watch                  - Watch mode
 *   bun run test -- DataGridAdvanced    - Just this file
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DataGridAdvanced from './DataGridAdvanced.svelte';

// Sample data for testing
const sampleData = [
	{
		id: 1,
		firstName: 'Alice',
		lastName: 'Smith',
		email: 'alice@example.com',
		department: 'Engineering',
		position: 'Developer',
		salary: 75000,
		hireDate: new Date('2020-01-15'),
		status: 'active',
		location: 'London',
		phone: '+44 123 456 7890'
	},
	{
		id: 2,
		firstName: 'Bob',
		lastName: 'Jones',
		email: 'bob@example.com',
		department: 'Marketing',
		position: 'Manager',
		salary: 85000,
		hireDate: new Date('2019-06-20'),
		status: 'active',
		location: 'Manchester',
		phone: '+44 987 654 3210'
	}
];

describe('DataGridAdvanced', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		expect(container).toBeTruthy();
	});

	// Should have wrapper element with correct class
	it('has wrapper element', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const wrapper = container.querySelector('.datagrid-advanced-wrapper');
		expect(wrapper).toBeInTheDocument();
	});

	// Should have search input
	it('shows search input', () => {
		render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const searchInput = screen.getByPlaceholderText('Search across all columns...');
		expect(searchInput).toBeInTheDocument();
	});

	// Search input should have aria-label
	it('search input has aria-label', () => {
		render(DataGridAdvanced, {
			props: { data: sampleData, searchLabel: 'Search employees' }
		});
		const searchInput = screen.getByLabelText('Search employees');
		expect(searchInput).toBeInTheDocument();
	});

	// Should show export button when exportable=true
	it('shows export button when exportable=true', () => {
		render(DataGridAdvanced, {
			props: { data: sampleData, exportable: true }
		});
		const exportButton = screen.getByLabelText('Export data to CSV');
		expect(exportButton).toBeInTheDocument();
	});

	// Should not show export button when exportable=false (default)
	it('hides export button by default', () => {
		render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const exportButton = screen.queryByLabelText('Export data to CSV');
		expect(exportButton).not.toBeInTheDocument();
	});

	// Wrapper should have role="region"
	it('wrapper has role="region"', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
	});

	// Wrapper should have aria-label
	it('wrapper has aria-label', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData, ariaLabel: 'Employee data grid' }
		});
		const region = container.querySelector('[aria-label="Employee data grid"]');
		expect(region).toBeInTheDocument();
	});

	// Should have search container
	it('has search container', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const searchContainer = container.querySelector('.search-container');
		expect(searchContainer).toBeInTheDocument();
	});

	// Export button should have icon
	it('export button has icon', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData, exportable: true }
		});
		const exportIcon = container.querySelector('.export-icon');
		expect(exportIcon).toBeInTheDocument();
	});

	// Should render with empty data
	it('renders with empty data', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: [] }
		});
		expect(container).toBeTruthy();
	});

	// Actions container should appear when exportable
	it('shows actions container when exportable', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData, exportable: true }
		});
		const actions = container.querySelector('.datagrid-actions');
		expect(actions).toBeInTheDocument();
	});

	// Actions container should not appear by default
	it('hides actions container by default', () => {
		const { container } = render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const actions = container.querySelector('.datagrid-actions');
		expect(actions).not.toBeInTheDocument();
	});

	// Search input should be a text input
	it('search input is text type', () => {
		render(DataGridAdvanced, {
			props: { data: sampleData }
		});
		const searchInput = screen.getByPlaceholderText('Search across all columns...');
		expect(searchInput).toHaveAttribute('type', 'text');
	});
});

// ------------------------------------------------------------
// Portability: the grid must not assume employees, URLs or globals.
// ------------------------------------------------------------

describe('DataGridAdvanced — generic, callback-driven API', () => {
	const products = [
		{ id: 'a', name: 'Desk lamp', price: 39, category: 'Lighting' },
		{ id: 'b', name: 'Oak shelf', price: 120, category: 'Storage' },
		{ id: 'c', name: 'Floor lamp', price: 89, category: 'Lighting' }
	];

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('uses domain-neutral default labels', () => {
		const { container } = render(DataGridAdvanced, { props: { data: products } });
		expect(container.querySelector('[role="region"]')).toHaveAttribute('aria-label', 'Data grid');
		expect(screen.getByLabelText('Search rows')).toBeInTheDocument();
	});

	it('never calls fetch on its own', () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		render(DataGridAdvanced, {
			props: { data: products, editable: true, selectable: true, exportable: true }
		});
		expect(fetchSpy).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it('never logs to the console during render', () => {
		const logSpy = vi.spyOn(console, 'log');
		render(DataGridAdvanced, { props: { data: products, editable: true } });
		expect(logSpy).not.toHaveBeenCalled();
	});

	it('hides the search box when searchable=false', () => {
		render(DataGridAdvanced, { props: { data: products, searchable: false } });
		expect(screen.queryByLabelText('Search rows')).not.toBeInTheDocument();
	});

	it('honours a custom placeholder', () => {
		render(DataGridAdvanced, { props: { data: products, searchPlaceholder: 'Find a product' } });
		expect(screen.getByPlaceholderText('Find a product')).toBeInTheDocument();
	});

	it('filters rows as the user types and reports the count', async () => {
		const user = userEvent.setup();
		render(DataGridAdvanced, { props: { data: products } });
		await user.type(screen.getByLabelText('Search rows'), 'lamp');
		expect(screen.getByText('2 of 3 rows')).toBeInTheDocument();
	});

	it('clears the search with the clear button', async () => {
		const user = userEvent.setup();
		render(DataGridAdvanced, { props: { data: products } });
		const input = screen.getByLabelText('Search rows') as HTMLInputElement;
		await user.type(input, 'oak');
		await user.click(screen.getByLabelText('Clear search'));
		expect(input.value).toBe('');
		expect(screen.queryByText(/of 3 rows/)).not.toBeInTheDocument();
	});

	it('applies the height prop to the wrapper', () => {
		const { container } = render(DataGridAdvanced, { props: { data: products, height: '320px' } });
		const wrapper = container.querySelector('.datagrid-advanced-wrapper') as HTMLElement;
		expect(wrapper.style.height).toBe('320px');
	});

	it('marks the chrome scheme from the theme prop', () => {
		const { container } = render(DataGridAdvanced, { props: { data: products, theme: 'willowDark' } });
		expect(container.querySelector('.datagrid-advanced-wrapper')).toHaveAttribute('data-scheme', 'dark');
	});

	it('uses the light scheme for theme="willow"', () => {
		const { container } = render(DataGridAdvanced, { props: { data: products, theme: 'willow' } });
		expect(container.querySelector('.datagrid-advanced-wrapper')).toHaveAttribute('data-scheme', 'light');
	});

	it('does not render a delete button without onDelete', () => {
		render(DataGridAdvanced, { props: { data: products, selectable: true } });
		expect(screen.queryByLabelText('Delete selected rows')).not.toBeInTheDocument();
	});

	it('exports visible rows as CSV with a custom filename', async () => {
		const user = userEvent.setup();
		const createObjectURL = vi.fn((blob: Blob) => {
			void blob;
			return 'blob:test';
		});
		const revokeObjectURL = vi.fn();
		Object.assign(URL, { createObjectURL, revokeObjectURL });
		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

		render(DataGridAdvanced, {
			props: { data: products, exportable: true, exportFilename: 'products' }
		});
		await user.click(screen.getByLabelText('Export data to CSV'));

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		const blob = createObjectURL.mock.calls[0][0];
		const text = await blob.text();
		expect(text.split('\n')[0]).toBe('ID,Name,Price,Category');
		expect(text).toContain('b,Oak shelf,120,Storage');
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
	});

	it('disables export when the search matches nothing', async () => {
		const user = userEvent.setup();
		render(DataGridAdvanced, { props: { data: products, exportable: true } });
		await user.type(screen.getByLabelText('Search rows'), 'zzz');
		expect(screen.getByLabelText('Export data to CSV')).toBeDisabled();
	});
});

// ------------------------------------------------------------
// Persistence: optimistic edits, rollback and bulk delete.
// SVAR renders real cells in jsdom, so we drive its inline editor directly.
// ------------------------------------------------------------

describe('DataGridAdvanced — persistence callbacks', () => {
	const rows = [
		{ id: 1, name: 'Ada', score: 10 },
		{ id: 2, name: 'Grace', score: 20 }
	];
	const columns = [
		{ id: 'name', header: 'Name', width: 120 },
		{ id: 'score', header: 'Score', width: 100, type: 'number' as const }
	];
	// jsdom has no layout width, so SVAR only renders the leading column —
	// put the number column first when a test needs to edit it.
	const numberFirst = [columns[1], columns[0]];

	const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

	function cell(container: HTMLElement, rowId: number, colId: string): HTMLElement {
		const el = container.querySelector(`[data-row-id="${rowId}"][data-col-id="${colId}"]`);
		if (!el) throw new Error(`cell ${rowId}/${colId} not rendered`);
		return el as HTMLElement;
	}

	async function editCell(container: HTMLElement, rowId: number, colId: string, value: string) {
		await fireEvent.dblClick(cell(container, rowId, colId));
		await tick();
		const input = container.querySelector('input.wx-text') as HTMLInputElement | null;
		if (!input) throw new Error('inline editor did not open');
		await fireEvent.input(input, { target: { value } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		await fireEvent.blur(input);
		await settle();
	}

	it('calls onCellEdit with the change and the previous value', async () => {
		const onCellEdit = vi.fn();
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, editable: true, onCellEdit }
		});
		await editCell(container, 1, 'name', 'Augusta');

		expect(onCellEdit).toHaveBeenCalledTimes(1);
		expect(onCellEdit.mock.calls[0][0]).toMatchObject({
			id: 1,
			column: 'name',
			value: 'Augusta',
			previousValue: 'Ada',
			row: { id: 1, name: 'Augusta', score: 10 }
		});
		expect(cell(container, 1, 'name').textContent).toContain('Augusta');
	});

	it('coerces number columns before persisting', async () => {
		const onCellEdit = vi.fn();
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns: numberFirst, editable: true, onCellEdit }
		});
		await editCell(container, 2, 'score', '1,250');
		expect(onCellEdit.mock.calls[0][0].value).toBe(1250);
	});

	it('rejects a non-numeric value without calling onCellEdit', async () => {
		const onCellEdit = vi.fn();
		const onError = vi.fn();
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns: numberFirst, editable: true, onCellEdit, onError }
		});
		await editCell(container, 1, 'score', 'lots');

		expect(onCellEdit).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith('Score must be a number.', expect.any(Error));
		expect(cell(container, 1, 'score').textContent).toContain('10');
		expect(screen.getByText('Score must be a number.')).toBeInTheDocument();
	});

	it('rolls the cell back and reports when onCellEdit rejects', async () => {
		const onError = vi.fn();
		const onCellEdit = vi.fn().mockRejectedValue(new Error('read-only'));
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, editable: true, onCellEdit, onError }
		});
		await editCell(container, 1, 'name', 'Augusta');

		expect(cell(container, 1, 'name').textContent).toContain('Ada');
		expect(onError).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Couldn't save Name: read-only")).toBeInTheDocument();
	});

	it('merges a partial row returned by onCellEdit', async () => {
		const onCellEdit = vi.fn().mockResolvedValue({ name: 'AUGUSTA' });
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, editable: true, onCellEdit }
		});
		await editCell(container, 1, 'name', 'Augusta');
		expect(cell(container, 1, 'name').textContent).toContain('AUGUSTA');
		expect(screen.getByText('Saved Name.')).toBeInTheDocument();
	});

	it('does not open an editor when editable=false', async () => {
		const { container } = render(DataGridAdvanced, { props: { data: rows, columns } });
		await fireEvent.dblClick(cell(container, 1, 'name'));
		await tick();
		expect(container.querySelector('input.wx-text')).toBeNull();
	});

	it('selects a row, then deletes it through onDelete', async () => {
		const onSelectionChange = vi.fn();
		const onDelete = vi.fn().mockResolvedValue(undefined);
		const confirmDelete = vi.fn().mockReturnValue(true);
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, selectable: true, onDelete, confirmDelete, onSelectionChange }
		});

		await fireEvent.click(cell(container, 2, 'name'));
		await settle();
		expect(onSelectionChange).toHaveBeenLastCalledWith([2]);

		await fireEvent.click(screen.getByLabelText('Delete selected rows'));
		await settle();

		expect(confirmDelete).toHaveBeenCalledWith(1);
		expect(onDelete).toHaveBeenCalledWith([2]);
		expect(container.querySelector('[data-row-id="2"]')).toBeNull();
		expect(screen.getByText('Deleted 1 row.')).toBeInTheDocument();
	});

	it('keeps rows when the delete is not confirmed', async () => {
		const onDelete = vi.fn();
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, selectable: true, onDelete, confirmDelete: () => false }
		});
		await fireEvent.click(cell(container, 1, 'name'));
		await settle();
		await fireEvent.click(screen.getByLabelText('Delete selected rows'));
		await settle();

		expect(onDelete).not.toHaveBeenCalled();
		expect(container.querySelector('[data-row-id="1"]')).not.toBeNull();
	});

	it('keeps rows and reports when onDelete rejects', async () => {
		const onError = vi.fn();
		const onDelete = vi.fn().mockRejectedValue(new Error('403'));
		const { container } = render(DataGridAdvanced, {
			props: { data: rows, columns, selectable: true, onDelete, onError, confirmDelete: () => true }
		});
		await fireEvent.click(cell(container, 1, 'name'));
		await settle();
		await fireEvent.click(screen.getByLabelText('Delete selected rows'));
		await settle();

		expect(onError).toHaveBeenCalledWith("Couldn't delete: 403", expect.any(Error));
		expect(container.querySelector('[data-row-id="1"]')).not.toBeNull();
	});
});
