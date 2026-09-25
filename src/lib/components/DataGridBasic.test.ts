/**
 * ============================================================
 * DataGridBasic Tests
 * ============================================================
 *
 * These tests verify that DataGridBasic renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Table structure is correct (thead, tbody, columns)
 *   - Sorting functionality works
 *   - Filter/search input appears when enabled
 *   - Pagination controls appear when needed
 *   - Accessibility features are present
 *   - Props apply correctly (striped, hoverable, compact)
 *
 * Note: Some tests use minimal data to verify structure.
 * Full interaction testing is done manually.
 *
 * Run these tests:
 *   bun run test                      - Run once
 *   bun run test:watch                - Watch mode
 *   bun run test -- DataGridBasic     - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import DataGridBasic from './DataGridBasic.svelte';
import type { DataGridColumn } from '$lib/types';

// Sample data for testing
const sampleColumns: DataGridColumn[] = [
	{ id: 'id', header: 'ID', type: 'number', width: 60 },
	{ id: 'name', header: 'Name', type: 'text' },
	{ id: 'email', header: 'Email', type: 'text' }
];

const sampleData = [
	{ id: 1, name: 'Alice Smith', email: 'alice@example.com' },
	{ id: 2, name: 'Bob Jones', email: 'bob@example.com' },
	{ id: 3, name: 'Charlie Brown', email: 'charlie@example.com' }
];

describe('DataGridBasic', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		expect(container).toBeTruthy();
	});

	// Should have a table element
	it('renders a table', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const table = container.querySelector('table');
		expect(table).toBeInTheDocument();
	});

	// Should render column headers
	it('renders column headers', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		expect(screen.getByText('ID')).toBeInTheDocument();
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
	});

	// Should render data rows
	it('renders data rows', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		expect(screen.getByText('Alice Smith')).toBeInTheDocument();
		expect(screen.getByText('Bob Jones')).toBeInTheDocument();
		expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
	});

	// Should show filter input when filterable=true (default)
	it('shows filter input by default', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const searchInput = screen.getByRole('searchbox');
		expect(searchInput).toBeInTheDocument();
	});

	// Should hide filter input when filterable=false
	it('hides filter input when filterable=false', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData, filterable: false }
		});
		const searchInput = screen.queryByRole('searchbox');
		expect(searchInput).not.toBeInTheDocument();
	});

	// Sortable columns should have aria-sort attribute
	it('sortable headers have aria-sort attribute', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const headers = container.querySelectorAll('th[aria-sort]');
		expect(headers.length).toBe(3); // All 3 columns are sortable by default
	});

	// Headers should be keyboard accessible when sortable
	it('sortable headers are keyboard accessible', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const sortableHeaders = container.querySelectorAll('th[tabindex="0"]');
		expect(sortableHeaders.length).toBe(3);
	});

	// Should show sort indicators
	it('shows sort indicators on headers', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const sortIndicators = container.querySelectorAll('.sort-indicator');
		expect(sortIndicators.length).toBe(3);
	});

	// Should apply striped class when striped=true (default)
	it('applies striped class by default', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const table = container.querySelector('table.striped');
		expect(table).toBeInTheDocument();
	});

	// Should apply hoverable class when hoverable=true (default)
	it('applies hoverable class by default', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const table = container.querySelector('table.hoverable');
		expect(table).toBeInTheDocument();
	});

	// Should apply compact class when compact=true
	it('applies compact class when compact=true', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData, compact: true }
		});
		const table = container.querySelector('table.compact');
		expect(table).toBeInTheDocument();
	});

	// Should not apply compact class by default
	it('does not apply compact class by default', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const table = container.querySelector('table.compact');
		expect(table).not.toBeInTheDocument();
	});

	// Should show empty state when no data
	it('shows empty state when no data', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: [] }
		});
		expect(screen.getByText('No data available')).toBeInTheDocument();
	});

	// Should show pagination when more than one page
	it('shows pagination when data exceeds pageSize', () => {
		const manyRows = Array.from({ length: 15 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`
		}));

		render(DataGridBasic, {
			props: { columns: sampleColumns, data: manyRows, pageSize: 10 }
		});

		// Should show pagination controls
		const prevButton = screen.getByLabelText('Previous page');
		const nextButton = screen.getByLabelText('Next page');
		expect(prevButton).toBeInTheDocument();
		expect(nextButton).toBeInTheDocument();
	});

	// Should not show pagination when all data fits on one page
	it('hides pagination when data fits on one page', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData, pageSize: 10 }
		});

		const prevButton = screen.queryByLabelText('Previous page');
		expect(prevButton).not.toBeInTheDocument();
	});

	// Table container should have overflow-x for responsiveness
	it('has scrollable table container', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const tableContainer = container.querySelector('.table-container');
		expect(tableContainer).toBeInTheDocument();
	});

	// Filter input should have proper aria-label
	it('filter input has aria-label', () => {
		render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const searchInput = screen.getByLabelText('Filter table data');
		expect(searchInput).toBeInTheDocument();
	});

	// Should render correct number of rows based on pageSize
	it('respects pageSize prop', () => {
		const manyRows = Array.from({ length: 25 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`
		}));

		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: manyRows, pageSize: 5 }
		});

		// Should only show 5 data rows (plus header row)
		const dataRows = container.querySelectorAll('tbody tr');
		expect(dataRows.length).toBe(5);
	});

	// Column width should be applied via style
	it('applies column width from column definition', () => {
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const idHeader = container.querySelector('th');
		expect(idHeader).toHaveStyle('width: 60px');
	});

	// Previous button should be disabled on first page
	it('disables previous button on first page', () => {
		const manyRows = Array.from({ length: 15 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`
		}));

		render(DataGridBasic, {
			props: { columns: sampleColumns, data: manyRows, pageSize: 10 }
		});

		const prevButton = screen.getByLabelText('Previous page');
		expect(prevButton).toBeDisabled();
	});
});

describe('DataGridBasic — interaction', () => {
	function firstColumnValues(container: HTMLElement): string[] {
		return [...container.querySelectorAll('tbody tr')].map(
			(tr) => tr.querySelector('td')?.textContent?.trim() ?? ''
		);
	}

	it('sorts ascending then descending on header clicks', async () => {
		const user = userEvent.setup();
		const { container } = render(DataGridBasic, {
			props: { columns: sampleColumns, data: sampleData }
		});
		const idHeader = screen.getByRole('button', { name: /ID/ });

		await user.click(idHeader);
		expect(idHeader).toHaveAttribute('aria-sort', 'ascending');
		expect(firstColumnValues(container)).toEqual(['1', '2', '3']);

		await user.click(idHeader);
		expect(idHeader).toHaveAttribute('aria-sort', 'descending');
		expect(firstColumnValues(container)).toEqual(['3', '2', '1']);
	});

	it('sorts from the keyboard with Enter and Space', async () => {
		const user = userEvent.setup();
		render(DataGridBasic, { props: { columns: sampleColumns, data: sampleData } });
		const nameHeader = screen.getByRole('button', { name: /Name/ });

		nameHeader.focus();
		await user.keyboard('{Enter}');
		expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
		await user.keyboard(' ');
		expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
	});

	it('filters rows and shows the result count', async () => {
		const user = userEvent.setup();
		render(DataGridBasic, { props: { columns: sampleColumns, data: sampleData } });
		await user.type(screen.getByLabelText('Filter table data'), 'bob');
		expect(screen.getByText('1 result')).toBeInTheDocument();
		expect(screen.getByText('Bob Jones')).toBeInTheDocument();
		expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
	});

	it('shows "No results found" when the filter matches nothing', async () => {
		const user = userEvent.setup();
		render(DataGridBasic, { props: { columns: sampleColumns, data: sampleData } });
		await user.type(screen.getByLabelText('Filter table data'), 'zzz');
		expect(screen.getByText('No results found')).toBeInTheDocument();
	});

	it('sorts blank values to the end in both directions', async () => {
		const user = userEvent.setup();
		const rows = [
			{ id: 1, name: 'Bea', email: null },
			{ id: 2, name: 'Al', email: 'a@example.com' },
			{ id: 3, name: 'Cy', email: 'c@example.com' }
		];
		const { container } = render(DataGridBasic, { props: { columns: sampleColumns, data: rows } });
		const emailHeader = screen.getByRole('button', { name: /Email/ });

		await user.click(emailHeader);
		expect(firstColumnValues(container)).toEqual(['2', '3', '1']);
		await user.click(emailHeader);
		expect(firstColumnValues(container)).toEqual(['3', '2', '1']);
	});

	it('moves between pages with next / previous', async () => {
		const user = userEvent.setup();
		const manyRows = Array.from({ length: 12 }, (_, i) => ({
			id: i + 1,
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`
		}));
		render(DataGridBasic, { props: { columns: sampleColumns, data: manyRows, pageSize: 5 } });

		await user.click(screen.getByLabelText('Next page'));
		expect(screen.getByLabelText('Go to page 2')).toHaveAttribute('aria-current', 'page');
		expect(screen.getByText('User 6')).toBeInTheDocument();

		await user.click(screen.getByLabelText('Previous page'));
		expect(screen.getByLabelText('Go to page 1')).toHaveAttribute('aria-current', 'page');
	});

	it('renders cellRenderer HTML and applies sanitised cellClass', () => {
		const columns: DataGridColumn[] = [
			{
				id: 'name',
				header: 'Name',
				cellRenderer: (value) => `<strong>${value}</strong>`,
				cellClass: () => 'highlight"><script>'
			}
		];
		const { container } = render(DataGridBasic, { props: { columns, data: sampleData } });
		const firstCell = container.querySelector('tbody td') as HTMLElement;
		expect(firstCell.querySelector('strong')?.textContent).toBe('Alice Smith');
		expect(firstCell.className).toContain('highlightscript');
		expect(firstCell.className).not.toContain('<');
	});

	it('does not mutate the caller’s array when sorting', async () => {
		const user = userEvent.setup();
		const rows = [...sampleData].reverse();
		const snapshot = rows.map((r) => r.id);
		render(DataGridBasic, { props: { columns: sampleColumns, data: rows } });
		await user.click(screen.getByRole('button', { name: /ID/ }));
		expect(rows.map((r) => r.id)).toEqual(snapshot);
	});
});
