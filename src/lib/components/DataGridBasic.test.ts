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
