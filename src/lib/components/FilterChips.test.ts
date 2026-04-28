/**
 * ============================================================
 * FilterChips Tests
 * ============================================================
 *
 * Verifies multi/single select toggling, aria-pressed state,
 * the optional 'All' reset chip, removable mode, and onChange.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FilterChips from './FilterChips.svelte';

const options = [
	{ value: 'design', label: 'Design' },
	{ value: 'engineering', label: 'Engineering' },
	{ value: 'marketing', label: 'Marketing' }
];

describe('FilterChips', () => {
	it('renders one button per option', () => {
		render(FilterChips, { props: { options } });
		expect(screen.getAllByRole('button')).toHaveLength(3);
	});

	it('marks selected chips as aria-pressed=true', () => {
		render(FilterChips, { props: { options, selected: ['design'] } });
		const design = screen.getByRole('button', { name: /Design/ });
		const eng = screen.getByRole('button', { name: /Engineering/ });
		expect(design).toHaveAttribute('aria-pressed', 'true');
		expect(eng).toHaveAttribute('aria-pressed', 'false');
	});

	it('toggles a chip on click (multi-select default)', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(FilterChips, { props: { options, onChange } });

		await user.click(screen.getByRole('button', { name: /Design/ }));
		expect(onChange).toHaveBeenLastCalledWith(['design']);

		await user.click(screen.getByRole('button', { name: /Engineering/ }));
		expect(onChange).toHaveBeenLastCalledWith(['design', 'engineering']);

		await user.click(screen.getByRole('button', { name: /Design/ }));
		expect(onChange).toHaveBeenLastCalledWith(['engineering']);
	});

	it('replaces selection in single-select mode', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(FilterChips, { props: { options, mode: 'single', onChange } });

		await user.click(screen.getByRole('button', { name: /Design/ }));
		expect(onChange).toHaveBeenLastCalledWith(['design']);

		await user.click(screen.getByRole('button', { name: /Engineering/ }));
		expect(onChange).toHaveBeenLastCalledWith(['engineering']);
	});

	it('clicking the same chip twice in single-select clears it', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(FilterChips, {
			props: { options, mode: 'single', selected: ['design'], onChange }
		});
		await user.click(screen.getByRole('button', { name: /Design/ }));
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it('renders the "All" chip when showAll is true', () => {
		render(FilterChips, { props: { options, showAll: true } });
		expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
	});

	it('"All" chip clears the selection', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(FilterChips, {
			props: { options, showAll: true, selected: ['design', 'marketing'], onChange }
		});

		await user.click(screen.getByRole('button', { name: 'All' }));
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it('renders count badge when option.count is set', () => {
		const withCounts = [
			{ value: 'a', label: 'Apples', count: 12 },
			{ value: 'b', label: 'Bananas', count: 5 }
		];
		render(FilterChips, { props: { options: withCounts } });
		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('renders remove (×) handle on active chips when removable=true', () => {
		render(FilterChips, {
			props: { options, removable: true, selected: ['design'] }
		});
		expect(screen.getByLabelText('Remove Design')).toBeInTheDocument();
		// Inactive chips get no × handle.
		expect(screen.queryByLabelText('Remove Engineering')).toBeNull();
	});

	it('clicking remove fires onRemove and updates selection', async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		const onChange = vi.fn();
		render(FilterChips, {
			props: {
				options,
				removable: true,
				selected: ['design', 'engineering'],
				onRemove,
				onChange
			}
		});

		await user.click(screen.getByLabelText('Remove Design'));
		expect(onRemove).toHaveBeenCalledWith('design');
		expect(onChange).toHaveBeenLastCalledWith(['engineering']);
	});

	it('forwards extra classes', () => {
		const { container } = render(FilterChips, {
			props: { options, class: 'my-extra-class' }
		});
		expect(container.querySelector('.my-extra-class')).toBeTruthy();
	});

	it('uses the provided ariaLabel on the group', () => {
		const { container } = render(FilterChips, {
			props: { options, ariaLabel: 'Article tags' }
		});
		const group = container.querySelector('[role="group"]');
		expect(group?.getAttribute('aria-label')).toBe('Article tags');
	});
});
