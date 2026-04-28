/**
 * ============================================================
 * Pagination Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders Prev/Next labels
 *   ✓ Disables Prev on first page, Next on last page
 *   ✓ Active page button gets aria-current="page"
 *   ✓ Clicking a page number fires onChange with that page
 *   ✓ Clicking Next advances by one
 *   ✓ Clicking Prev steps back by one
 *   ✓ Renders all numbers when total <= maxVisible
 *   ✓ Renders right ellipsis when current is near the start
 *   ✓ Renders left ellipsis when current is near the end
 *   ✓ Renders both ellipses when current is in the middle
 *   ✓ Honours custom siblings prop for wider middle range
 *   ✓ Applies the size class
 *
 * Run:
 *   bun run test -- Pagination
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Pagination from './Pagination.svelte';

describe('Pagination', () => {
	it('renders Prev and Next labels', () => {
		const { getByText } = render(Pagination, { props: { totalPages: 5 } });
		expect(getByText('Prev')).toBeTruthy();
		expect(getByText('Next')).toBeTruthy();
	});

	it('disables Prev on the first page', () => {
		const { getByLabelText } = render(Pagination, { props: { page: 1, totalPages: 5 } });
		expect((getByLabelText('Go to previous page') as HTMLButtonElement).disabled).toBe(true);
	});

	it('disables Next on the last page', () => {
		const { getByLabelText } = render(Pagination, { props: { page: 5, totalPages: 5 } });
		expect((getByLabelText('Go to next page') as HTMLButtonElement).disabled).toBe(true);
	});

	it('marks the active page with aria-current="page"', () => {
		const { container } = render(Pagination, { props: { page: 3, totalPages: 5 } });
		const active = container.querySelector('[aria-current="page"]');
		expect(active?.textContent?.trim()).toBe('3');
	});

	it('fires onChange when a page number is clicked', async () => {
		const onChange = vi.fn();
		const { getByLabelText } = render(Pagination, {
			props: { page: 1, totalPages: 5, onChange }
		});
		await fireEvent.click(getByLabelText('Go to page 3'));
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it('Next advances by one', async () => {
		const onChange = vi.fn();
		const { getByLabelText } = render(Pagination, {
			props: { page: 2, totalPages: 5, onChange }
		});
		await fireEvent.click(getByLabelText('Go to next page'));
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it('Prev steps back by one', async () => {
		const onChange = vi.fn();
		const { getByLabelText } = render(Pagination, {
			props: { page: 4, totalPages: 5, onChange }
		});
		await fireEvent.click(getByLabelText('Go to previous page'));
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it('renders all numbers when total <= maxVisible (siblings=1 → 7 max)', () => {
		const { container } = render(Pagination, { props: { page: 1, totalPages: 7 } });
		const numbers = Array.from(container.querySelectorAll('.page-num')).map((b) => b.textContent?.trim());
		expect(numbers).toEqual(['1', '2', '3', '4', '5', '6', '7']);
		expect(container.querySelector('.page-ellipsis')).toBeNull();
	});

	it('renders right ellipsis when current is near the start', () => {
		const { container } = render(Pagination, { props: { page: 2, totalPages: 20 } });
		const ellipses = container.querySelectorAll('.page-ellipsis');
		expect(ellipses.length).toBe(1);
		const numbers = Array.from(container.querySelectorAll('.page-num')).map((b) => b.textContent?.trim());
		expect(numbers).toEqual(['1', '2', '3', '4', '5', '20']);
	});

	it('renders left ellipsis when current is near the end', () => {
		const { container } = render(Pagination, { props: { page: 19, totalPages: 20 } });
		const ellipses = container.querySelectorAll('.page-ellipsis');
		expect(ellipses.length).toBe(1);
		const numbers = Array.from(container.querySelectorAll('.page-num')).map((b) => b.textContent?.trim());
		expect(numbers).toEqual(['1', '16', '17', '18', '19', '20']);
	});

	it('renders both ellipses when current is in the middle', () => {
		const { container } = render(Pagination, { props: { page: 10, totalPages: 20 } });
		const ellipses = container.querySelectorAll('.page-ellipsis');
		expect(ellipses.length).toBe(2);
		const numbers = Array.from(container.querySelectorAll('.page-num')).map((b) => b.textContent?.trim());
		expect(numbers).toEqual(['1', '9', '10', '11', '20']);
	});

	it('honours custom siblings prop (siblings=2 widens the middle)', () => {
		const { container } = render(Pagination, {
			props: { page: 10, totalPages: 20, siblings: 2 }
		});
		const numbers = Array.from(container.querySelectorAll('.page-num')).map((b) => b.textContent?.trim());
		expect(numbers).toEqual(['1', '8', '9', '10', '11', '12', '20']);
	});

	it('applies the size class', () => {
		const { container } = render(Pagination, { props: { totalPages: 5, size: 'sm' } });
		expect(container.querySelector('.pagination-sm')).toBeTruthy();
	});
});
