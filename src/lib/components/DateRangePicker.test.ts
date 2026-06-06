import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import DateRangePicker from './DateRangePicker.svelte';

describe('DateRangePicker', () => {
	it('renders two month grids', () => {
		render(DateRangePicker, { initialMonth: '2026-03-15' });
		const grids = screen.getAllByRole('grid');
		expect(grids).toHaveLength(2);
		// Left panel is March, right panel rolls over to April.
		expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
		expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
	});

	it('marks the start day as pressed after the first click', async () => {
		render(DateRangePicker, {
			initialMonth: '2026-03-01',
			value: { start: null, end: null }
		});
		const day = screen.getByRole('button', { name: '10', pressed: false });
		day.click();
		await tick();
		// First click commits the start endpoint, reflected via aria-pressed.
		expect(day).toHaveAttribute('aria-pressed', 'true');
	});

	it('previews an in-range band between start click and a hovered day', async () => {
		render(DateRangePicker, { initialMonth: '2026-03-01' });
		screen.getByRole('button', { name: '10' }).click();
		await tick();
		// Hovering a later day should paint the days in between as in-range.
		const later = screen.getByRole('button', { name: '14' });
		later.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await tick();
		const between = screen.getByRole('button', { name: '12' });
		expect(between.className).toContain('drp-day--in-range');
	});

	it('disables days outside the min/max bounds', () => {
		render(DateRangePicker, {
			initialMonth: '2026-03-01',
			min: '2026-03-05',
			max: '2026-03-20'
		});
		const tooEarly = screen.getByRole('button', { name: '3' });
		expect(tooEarly).toBeDisabled();
		expect(tooEarly).toHaveAttribute('aria-disabled', 'true');
		const inBounds = screen.getByRole('button', { name: '10' });
		expect(inBounds).not.toBeDisabled();
	});

	it('exposes a labelled group and navigation controls', () => {
		render(DateRangePicker, { initialMonth: '2026-03-01' });
		expect(screen.getByRole('group', { name: 'Date range picker' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
	});
});
