/*
 * SearchBar Tests
 *
 * Covers:
 *   ✓ Renders a search input with default placeholder and aria-label
 *   ✓ Accepts a custom placeholder, aria-label and class
 *   ✓ Reflects an initial value and shows the clear button
 *   ✓ Typing shows the clear button; clearing hides it and refocuses
 *   ✓ Escape clears a non-empty query
 *   ✓ Escape on an empty field is left alone (not prevented)
 *   ✓ Icons are hidden from assistive tech
 *
 * Run:
 *   bun run test -- SearchBar
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar.svelte';

describe('SearchBar', () => {
	it('renders a search input with default placeholder and label', () => {
		const { getByRole, queryByLabelText } = render(SearchBar);
		const input = getByRole('searchbox', { name: 'Search components' }) as HTMLInputElement;
		expect(input.type).toBe('search');
		expect(input.placeholder).toBe('Search components…');
		expect(input.getAttribute('autocomplete')).toBe('off');
		expect(queryByLabelText('Clear search')).toBeNull();
	});

	it('accepts a custom placeholder, aria-label and class', () => {
		const { getByRole, container } = render(SearchBar, {
			props: { placeholder: 'Find a recipe', ariaLabel: 'Search recipes', class: 'wide' }
		});
		const input = getByRole('searchbox', { name: 'Search recipes' }) as HTMLInputElement;
		expect(input.placeholder).toBe('Find a recipe');
		expect(container.querySelector('.search-bar')?.classList.contains('wide')).toBe(true);
	});

	it('reflects an initial value and shows the clear button', () => {
		const { getByRole, getByLabelText } = render(SearchBar, { props: { value: 'grid' } });
		expect((getByRole('searchbox') as HTMLInputElement).value).toBe('grid');
		expect(getByLabelText('Clear search')).toBeTruthy();
	});

	it('shows the clear button while typing and clears + refocuses on click', async () => {
		const user = userEvent.setup();
		const { getByRole, getByLabelText, queryByLabelText } = render(SearchBar);
		const input = getByRole('searchbox') as HTMLInputElement;

		await user.type(input, 'card');
		expect(input.value).toBe('card');
		const clearButton = getByLabelText('Clear search');

		await user.click(clearButton);
		expect(input.value).toBe('');
		expect(queryByLabelText('Clear search')).toBeNull();
		expect(document.activeElement).toBe(input);
	});

	it('clears a non-empty query on Escape', async () => {
		const user = userEvent.setup();
		const { getByRole, queryByLabelText } = render(SearchBar);
		const input = getByRole('searchbox') as HTMLInputElement;

		await user.type(input, 'motion');
		await user.keyboard('{Escape}');
		expect(input.value).toBe('');
		expect(queryByLabelText('Clear search')).toBeNull();
	});

	it('does not swallow Escape when the field is already empty', async () => {
		const { getByRole } = render(SearchBar);
		const input = getByRole('searchbox');
		// fireEvent returns false when preventDefault() was called.
		const notPrevented = await fireEvent.keyDown(input, { key: 'Escape' });
		expect(notPrevented).toBe(true);
	});

	it('hides decorative icons from assistive tech', () => {
		const { container } = render(SearchBar, { props: { value: 'x' } });
		const svgs = container.querySelectorAll('svg');
		expect(svgs.length).toBe(2);
		svgs.forEach((svg) => expect(svg.getAttribute('aria-hidden')).toBe('true'));
	});
});
