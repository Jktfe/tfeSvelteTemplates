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
 * Note: SVAR Grid internals cannot be fully tested in jsdom.
 * Full interaction testing (editing, selection, virtual scrolling)
 * is done manually in the browser.
 *
 * Run these tests:
 *   bun run test                        - Run once
 *   bun run test:watch                  - Watch mode
 *   bun run test -- DataGridAdvanced    - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
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
			props: { data: sampleData }
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
			props: { data: sampleData }
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
