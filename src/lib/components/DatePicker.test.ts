/**
 * ============================================================
 * DatePicker Tests
 * ============================================================
 *
 * Verifies the trigger renders, the popover opens on click, the
 * selected/today days expose the right ARIA, picking a day updates
 * the bound value and closes the popover, and Escape closes it.
 *
 * Run: bun run test -- DatePicker
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import DatePicker from './DatePicker.svelte';

describe('DatePicker', () => {
	it('renders the trigger with its accessible label', () => {
		render(DatePicker, { props: { label: 'Choose a date' } });
		const trigger = screen.getByRole('button', { name: 'Choose a date' });
		expect(trigger).toBeInTheDocument();
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('shows the placeholder when there is no value', () => {
		render(DatePicker, { props: { placeholder: 'Pick a day' } });
		expect(screen.getByText('Pick a day')).toBeInTheDocument();
	});

	it('opens the popover (a grid) when the trigger is clicked', async () => {
		render(DatePicker, { props: { value: '2026-06-15', today: '2026-06-06' } });
		expect(screen.queryByRole('grid')).not.toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
		expect(screen.getByRole('grid')).toBeInTheDocument();
	});

	it('marks the selected day with aria-selected and today with aria-current', async () => {
		render(DatePicker, { props: { value: '2026-06-15', today: '2026-06-06' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
		const selected = screen.getByRole('gridcell', { selected: true });
		expect(selected).toBeInTheDocument();
		const today = document.querySelector('[aria-current="date"]');
		expect(today).toBeTruthy();
		expect(today).toHaveTextContent('6');
	});

	it('selecting a day updates the trigger text and closes the popover', async () => {
		render(DatePicker, { props: { value: '2026-06-15' } });
		const trigger = screen.getByRole('button', { name: 'Choose date' });
		expect(trigger).toHaveTextContent('15 June 2026');
		await fireEvent.click(trigger);
		const day20 = screen.getByRole('button', {
			name: 'Saturday, 20 June 2026'
		});
		await fireEvent.click(day20);
		expect(screen.queryByRole('grid')).not.toBeInTheDocument();
		expect(trigger).toHaveTextContent('20 June 2026');
	});

	it('disables out-of-range days', async () => {
		render(DatePicker, { props: { value: '2026-06-15', min: '2026-06-10', max: '2026-06-20' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
		const day5 = screen.getByRole('button', { name: 'Friday, 5 June 2026' });
		expect(day5).toBeDisabled();
		expect(day5).toHaveAttribute('aria-disabled', 'true');
	});

	it('does not open when disabled', async () => {
		render(DatePicker, { props: { disabled: true } });
		const trigger = screen.getByRole('button', { name: 'Choose date' });
		expect(trigger).toBeDisabled();
		await fireEvent.click(trigger);
		expect(screen.queryByRole('grid')).not.toBeInTheDocument();
	});

	it('closes the popover on Escape', async () => {
		render(DatePicker, { props: { value: '2026-06-15' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
		const grid = screen.getByRole('grid');
		await fireEvent.keyDown(grid, { key: 'Escape' });
		expect(screen.queryByRole('grid')).not.toBeInTheDocument();
	});
});
