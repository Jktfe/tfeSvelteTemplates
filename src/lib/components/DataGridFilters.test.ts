/**
 * DataGridFilters tests
 *
 * Covers the collapsible panel, the active-filter badge, each filter type,
 * "Clear all", the min ≤ max salary guard, unique ids per instance and the
 * snapshot handed to onFiltersChange.
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DataGridFilters from './DataGridFilters.svelte';
import type { DataGridFilterValues } from '$lib/types';

const departments = ['Engineering', 'Sales', 'Marketing'];
const statuses = ['active', 'on-leave', 'inactive'];
const salaryRange = { min: 30000, max: 150000 };

function lastFilters(spy: ReturnType<typeof vi.fn>): DataGridFilterValues {
	return spy.mock.calls[spy.mock.calls.length - 1][0] as DataGridFilterValues;
}

describe('DataGridFilters — panel', () => {
	it('renders collapsed by default', () => {
		render(DataGridFilters, { props: { departments, statuses } });
		const toggle = screen.getByRole('button', { name: /Filters/ });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByRole('group', { name: 'Department' })).not.toBeInTheDocument();
	});

	it('expands and collapses on click, wiring aria-controls to the panel', async () => {
		const user = userEvent.setup();
		const { container } = render(DataGridFilters, { props: { departments, statuses } });
		const toggle = screen.getByRole('button', { name: /Filters/ });

		await user.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		const panelId = toggle.getAttribute('aria-controls');
		expect(panelId).toBeTruthy();
		expect(container.querySelector(`#${CSS.escape(panelId!)}`)).toBeInTheDocument();

		await user.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	it('respects initiallyExpanded', () => {
		render(DataGridFilters, { props: { departments, statuses, initiallyExpanded: true } });
		expect(screen.getByRole('group', { name: 'Department' })).toBeInTheDocument();
		expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument();
	});

	it('hides option groups that have no options', () => {
		render(DataGridFilters, { props: { initiallyExpanded: true } });
		expect(screen.queryByRole('group', { name: 'Department' })).not.toBeInTheDocument();
		expect(screen.queryByRole('group', { name: 'Status' })).not.toBeInTheDocument();
		// Salary and date groups always render.
		expect(screen.getByLabelText('Minimum salary')).toBeInTheDocument();
		expect(screen.getByLabelText('Hired from')).toBeInTheDocument();
	});

	it('gives each instance unique control ids', () => {
		const { container } = render(DataGridFilters, { props: { initiallyExpanded: true } });
		render(DataGridFilters, { props: { initiallyExpanded: true } });
		const ids = [...document.querySelectorAll('input[id]')].map((el) => el.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(container.querySelectorAll('input[id]').length).toBe(4);
	});
});

describe('DataGridFilters — filter values', () => {
	it('emits the empty filter state on mount', () => {
		const onFiltersChange = vi.fn();
		render(DataGridFilters, { props: { departments, statuses, salaryRange, onFiltersChange } });
		expect(onFiltersChange).toHaveBeenCalled();
		expect(lastFilters(onFiltersChange)).toEqual({
			departments: [],
			statuses: [],
			salaryMin: 30000,
			salaryMax: 150000,
			hireDateFrom: '',
			hireDateTo: ''
		});
	});

	it('toggles department and status checkboxes', async () => {
		const user = userEvent.setup();
		const onFiltersChange = vi.fn();
		render(DataGridFilters, {
			props: { departments, statuses, initiallyExpanded: true, onFiltersChange }
		});

		await user.click(screen.getByLabelText('Engineering'));
		await user.click(screen.getByLabelText('Sales'));
		await user.click(screen.getByLabelText('on-leave'));
		expect(lastFilters(onFiltersChange).departments).toEqual(['Engineering', 'Sales']);
		expect(lastFilters(onFiltersChange).statuses).toEqual(['on-leave']);

		await user.click(screen.getByLabelText('Engineering'));
		expect(lastFilters(onFiltersChange).departments).toEqual(['Sales']);
	});

	it('hands the parent a plain snapshot, not live state', async () => {
		const user = userEvent.setup();
		const onFiltersChange = vi.fn();
		render(DataGridFilters, { props: { departments, initiallyExpanded: true, onFiltersChange } });
		await user.click(screen.getByLabelText('Marketing'));

		const emitted = lastFilters(onFiltersChange);
		emitted.departments.push('Hacked');
		await user.click(screen.getByLabelText('Sales'));
		expect(lastFilters(onFiltersChange).departments).toEqual(['Marketing', 'Sales']);
	});

	it('counts each active filter type once in the badge', async () => {
		const user = userEvent.setup();
		render(DataGridFilters, { props: { departments, statuses, initiallyExpanded: true } });

		await user.click(screen.getByLabelText('Engineering'));
		await user.click(screen.getByLabelText('Sales'));
		expect(screen.getByLabelText('1 active filters')).toBeInTheDocument();

		await user.click(screen.getByLabelText('active'));
		expect(screen.getByLabelText('2 active filters')).toBeInTheDocument();

		await fireEvent.input(screen.getByLabelText('Hired from'), { target: { value: '2021-01-01' } });
		expect(screen.getByLabelText('3 active filters')).toBeInTheDocument();
	});

	it('updates the salary range and keeps min ≤ max', async () => {
		const onFiltersChange = vi.fn();
		render(DataGridFilters, { props: { salaryRange, initiallyExpanded: true, onFiltersChange } });

		await fireEvent.input(screen.getByLabelText('Maximum salary'), { target: { value: '60000' } });
		expect(lastFilters(onFiltersChange).salaryMax).toBe(60000);

		// Dragging min past max pushes max along with it.
		await fireEvent.input(screen.getByLabelText('Minimum salary'), { target: { value: '90000' } });
		expect(lastFilters(onFiltersChange)).toMatchObject({ salaryMin: 90000, salaryMax: 90000 });

		// And dragging max below min pulls min down.
		await fireEvent.input(screen.getByLabelText('Maximum salary'), { target: { value: '40000' } });
		expect(lastFilters(onFiltersChange)).toMatchObject({ salaryMin: 40000, salaryMax: 40000 });
	});

	it('announces formatted salary values to assistive tech', () => {
		render(DataGridFilters, { props: { salaryRange, initiallyExpanded: true } });
		expect(screen.getByLabelText('Minimum salary')).toHaveAttribute('aria-valuetext', '£30,000');
		expect(screen.getByLabelText('Maximum salary')).toHaveAttribute('aria-valuetext', '£150,000');
	});

	it('uses the salaryStep prop on both sliders', () => {
		render(DataGridFilters, { props: { salaryStep: 1000, initiallyExpanded: true } });
		expect(screen.getByLabelText('Minimum salary')).toHaveAttribute('step', '1000');
		expect(screen.getByLabelText('Maximum salary')).toHaveAttribute('step', '1000');
	});

	it('records the hire date range and constrains the pickers to each other', async () => {
		const onFiltersChange = vi.fn();
		render(DataGridFilters, { props: { initiallyExpanded: true, onFiltersChange } });
		const from = screen.getByLabelText('Hired from');
		const to = screen.getByLabelText('Hired to');

		await fireEvent.input(from, { target: { value: '2020-01-01' } });
		await fireEvent.input(to, { target: { value: '2022-12-31' } });
		expect(lastFilters(onFiltersChange)).toMatchObject({
			hireDateFrom: '2020-01-01',
			hireDateTo: '2022-12-31'
		});
		expect(to).toHaveAttribute('min', '2020-01-01');
		expect(from).toHaveAttribute('max', '2022-12-31');
	});

	it('clears every filter with "Clear all" and hides the button again', async () => {
		const user = userEvent.setup();
		const onFiltersChange = vi.fn();
		render(DataGridFilters, {
			props: { departments, statuses, salaryRange, initiallyExpanded: true, onFiltersChange }
		});

		expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
		await user.click(screen.getByLabelText('Engineering'));
		await user.click(screen.getByLabelText('inactive'));
		await fireEvent.input(screen.getByLabelText('Minimum salary'), { target: { value: '50000' } });

		await user.click(screen.getByLabelText('Clear all filters'));
		expect(lastFilters(onFiltersChange)).toEqual({
			departments: [],
			statuses: [],
			salaryMin: 30000,
			salaryMax: 150000,
			hireDateFrom: '',
			hireDateTo: ''
		});
		expect(screen.getByLabelText('Engineering')).not.toBeChecked();
		expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
	});
});
