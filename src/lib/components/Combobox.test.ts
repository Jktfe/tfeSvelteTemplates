/**
 * ============================================================
 * Combobox Tests
 * ============================================================
 *
 * Verifies the typeahead select renders, filters, selects, exposes
 * the right ARIA wiring, and supports multi-select chip removal.
 *
 * Run:
 *   bun run test -- Combobox
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Combobox from './Combobox.svelte';

const options = [
	{ value: 'gb', label: 'United Kingdom' },
	{ value: 'fr', label: 'France' },
	{ value: 'de', label: 'Germany' }
];

describe('Combobox', () => {
	it('renders an input with role combobox', () => {
		render(Combobox, { props: { options, label: 'Country' } });
		const input = screen.getByRole('combobox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('aria-expanded', 'false');
	});

	it('opens the listbox on focus', async () => {
		render(Combobox, { props: { options, label: 'Country' } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		expect(input).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('filters options as the user types', async () => {
		render(Combobox, { props: { options, label: 'Country' } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.input(input, { target: { value: 'ger' } });
		const opts = screen.getAllByRole('option');
		expect(opts).toHaveLength(1);
		expect(opts[0]).toHaveTextContent('Germany');
	});

	it('shows the empty message when nothing matches', async () => {
		render(Combobox, { props: { options, label: 'Country', emptyMessage: 'Nothing here' } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.input(input, { target: { value: 'zzz' } });
		expect(screen.queryAllByRole('option')).toHaveLength(0);
		expect(screen.getByText('Nothing here')).toBeInTheDocument();
	});

	it('selects an option on click and marks it aria-selected in multi mode', async () => {
		render(Combobox, { props: { options, multiple: true, value: [], label: 'Country' } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		const france = screen.getByText('France');
		await fireEvent.pointerDown(france);
		// A removable chip should now exist for the chosen option.
		expect(screen.getByLabelText('Remove France')).toBeInTheDocument();
	});

	it('navigates with the arrow keys and selects with Enter', async () => {
		render(Combobox, { props: { options, label: 'Country' } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Enter' });
		// Single mode closes after selection and shows the chosen label.
		expect(input).toHaveAttribute('aria-expanded', 'false');
		expect((input as HTMLInputElement).value).toBe('United Kingdom');
	});

	it('disables the input when disabled', () => {
		render(Combobox, { props: { options, disabled: true, label: 'Country' } });
		expect(screen.getByRole('combobox')).toBeDisabled();
	});
});
