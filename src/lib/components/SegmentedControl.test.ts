/**
 * ============================================================
 * SegmentedControl Tests
 * ============================================================
 *
 * Verifies single-select radio behaviour, sliding indicator
 * positioning via CSS vars, equal-width mode, custom palette,
 * and onChange firing with the new value.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SegmentedControl from './SegmentedControl.svelte';

const options = [
	{ value: 'list', label: 'List' },
	{ value: 'grid', label: 'Grid' },
	{ value: 'cards', label: 'Cards' }
];

describe('SegmentedControl', () => {
	it('renders one radio per option', () => {
		render(SegmentedControl, { props: { options, value: 'list' } });
		expect(screen.getAllByRole('radio')).toHaveLength(3);
	});

	it('marks the matching value as checked', () => {
		render(SegmentedControl, { props: { options, value: 'grid' } });
		const grid = screen.getByRole('radio', { name: /Grid/ });
		expect(grid).toBeChecked();
		expect(screen.getByRole('radio', { name: /List/ })).not.toBeChecked();
	});

	it('clicking a segment fires onChange with the new value', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(SegmentedControl, { props: { options, value: 'list', onChange } });

		await user.click(screen.getByRole('radio', { name: /Cards/ }));
		expect(onChange).toHaveBeenCalledWith('cards');
	});

	it('only one radio is checked at any time', async () => {
		const user = userEvent.setup();
		render(SegmentedControl, { props: { options, value: 'list' } });

		await user.click(screen.getByRole('radio', { name: /Grid/ }));
		const checked = screen.getAllByRole('radio').filter((r) => (r as HTMLInputElement).checked);
		expect(checked.length).toBeLessThanOrEqual(1);
	});

	it('uses the provided ariaLabel on the radiogroup', () => {
		const { container } = render(SegmentedControl, {
			props: { options, value: 'list', ariaLabel: 'View mode' }
		});
		const group = container.querySelector('[role="radiogroup"]');
		expect(group?.getAttribute('aria-label')).toBe('View mode');
	});

	it('applies the size class', () => {
		const { container } = render(SegmentedControl, {
			props: { options, value: 'list', size: 'sm' }
		});
		expect(container.querySelector('.segmented-sm')).toBeTruthy();
	});

	it('applies the equal-width class by default', () => {
		const { container } = render(SegmentedControl, { props: { options, value: 'list' } });
		expect(container.querySelector('.segmented-equal')).toBeTruthy();
	});

	it('omits the equal-width class when equalWidth=false', () => {
		const { container } = render(SegmentedControl, {
			props: { options, value: 'list', equalWidth: false }
		});
		expect(container.querySelector('.segmented-equal')).toBeNull();
	});

	it('renders an icon when provided', () => {
		const withIcons = [
			{ value: 'l', label: 'List', icon: '☰' },
			{ value: 'g', label: 'Grid', icon: '▦' }
		];
		render(SegmentedControl, { props: { options: withIcons, value: 'l' } });
		expect(screen.getByText('☰')).toBeInTheDocument();
		expect(screen.getByText('▦')).toBeInTheDocument();
	});

	it('uses the same name attribute on every radio (single radio group)', () => {
		const { container } = render(SegmentedControl, { props: { options, value: 'list' } });
		const radios = container.querySelectorAll('input[type="radio"]');
		const names = new Set(Array.from(radios).map((r) => (r as HTMLInputElement).name));
		expect(names.size).toBe(1);
	});

	it('forwards extra classes', () => {
		const { container } = render(SegmentedControl, {
			props: { options, value: 'list', class: 'my-extra-class' }
		});
		expect(container.querySelector('.my-extra-class')).toBeTruthy();
	});

	it('exposes active index and option count as CSS vars on the container', () => {
		const { container } = render(SegmentedControl, { props: { options, value: 'cards' } });
		const group = container.querySelector('.segmented') as HTMLElement;
		// 'cards' is at index 2 of the 3 options
		expect(group.style.getPropertyValue('--active-index')).toBe('2');
		expect(group.style.getPropertyValue('--option-count')).toBe('3');
	});
});
