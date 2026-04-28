/**
 * ============================================================
 * RatingStars Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders <max> stars by default (5)
 *   ✓ Custom max renders the right number
 *   ✓ Interactive mode uses role=radiogroup
 *   ✓ Read-only mode uses role=img with "Rated N out of M" label
 *   ✓ Click invokes onChange with the picked value
 *   ✓ readonly=true does not invoke onChange
 *   ✓ Each radio input has the correct aria-label
 *   ✓ Forwards extra classes via class prop
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import RatingStars from './RatingStars.svelte';

describe('RatingStars', () => {
	it('renders 5 stars by default in interactive mode', () => {
		const { container } = render(RatingStars, { value: 3 });
		const radios = container.querySelectorAll('input[type="radio"]');
		expect(radios.length).toBe(5);
	});

	it('renders a custom max number of stars', () => {
		const { container } = render(RatingStars, { value: 0, max: 10 });
		const radios = container.querySelectorAll('input[type="radio"]');
		expect(radios.length).toBe(10);
	});

	it('uses role=radiogroup in interactive mode', () => {
		const { container } = render(RatingStars, { value: 0 });
		const group = container.querySelector('[role="radiogroup"]');
		expect(group).toBeTruthy();
		expect(group?.getAttribute('aria-label')).toBe('Rating');
	});

	it('uses role=img with "Rated N out of M" in readonly mode', () => {
		const { container } = render(RatingStars, { value: 4, max: 5, readonly: true });
		const display = container.querySelector('[role="img"]') as HTMLElement;
		expect(display).toBeTruthy();
		expect(display.getAttribute('aria-label')).toBe('Rated 4 out of 5');
	});

	it('does not render radio inputs in readonly mode', () => {
		const { container } = render(RatingStars, { value: 4, readonly: true });
		const radios = container.querySelectorAll('input[type="radio"]');
		expect(radios.length).toBe(0);
	});

	it('invokes onChange with the picked value when a star is selected', async () => {
		const onChange = vi.fn();
		const { container } = render(RatingStars, { value: 0, onChange });
		const radios = container.querySelectorAll('input[type="radio"]');
		// Pick the third star
		await fireEvent.click(radios[2] as HTMLElement);
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it('marks the matching radio as checked', () => {
		const { container } = render(RatingStars, { value: 4 });
		const radios = container.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
		expect(radios[3].checked).toBe(true);
		expect(radios[0].checked).toBe(false);
	});

	it('each radio input has its own aria-label', () => {
		const { container } = render(RatingStars, { value: 0 });
		const radios = container.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
		expect(radios[0].getAttribute('aria-label')).toBe('1 star');
		expect(radios[1].getAttribute('aria-label')).toBe('2 stars');
		expect(radios[4].getAttribute('aria-label')).toBe('5 stars');
	});

	it('uses a custom aria-label for the group when provided', () => {
		const { container } = render(RatingStars, { value: 0, ariaLabel: 'Rate the chef' });
		const group = container.querySelector('[role="radiogroup"]') as HTMLElement;
		expect(group.getAttribute('aria-label')).toBe('Rate the chef');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(RatingStars, { value: 0, class: 'custom-rating' });
		const root = container.querySelector('.rating-stars') as HTMLElement;
		expect(root.classList.contains('custom-rating')).toBe(true);
	});
});
