/*
 * InfiniteCardSlider Tests
 *
 * Covers:
 *   ✓ wrappedOffset() — shortest-path loop maths, including empty input
 *   ✓ Renders a labelled carousel region with one card per item
 *   ✓ Meter shows the zero-padded position and total
 *   ✓ Next / previous buttons advance and wrap around the loop
 *   ✓ ArrowLeft / ArrowRight / Home / End keyboard navigation
 *   ✓ onchange fires only when the focal card changes
 *   ✓ initialIndex is wrapped into range
 *   ✓ aria-current follows the selected card
 *   ✓ Cards beyond maxVisible are aria-hidden and inert
 *   ✓ Default chrome renders a link when href is supplied
 *   ✓ Single item disables navigation
 *   ✓ children snippet replaces the default card chrome
 *   ✓ Selection stays in range when items shrink
 *
 * Run:
 *   bun run test -- InfiniteCardSlider
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import InfiniteCardSlider, { wrappedOffset, type SliderItem } from './InfiniteCardSlider.svelte';
import InfiniteCardSliderTestHarness from './InfiniteCardSliderTestHarness.test.svelte';

const items: SliderItem[] = [
	{ id: 1, title: 'Alpha', description: 'First card' },
	{ id: 2, title: 'Bravo', description: 'Second card', href: '/bravo' },
	{ id: 3, title: 'Charlie' },
	{ id: 4, title: 'Delta' },
	{ id: 5, title: 'Echo' },
	{ id: 6, title: 'Foxtrot' },
	{ id: 7, title: 'Golf' }
];

function meterText(container: HTMLElement) {
	return container.querySelector('.ics-meter')?.textContent?.replace(/\s+/g, '');
}

function cardEls(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>('.ics-card'));
}

describe('wrappedOffset', () => {
	it('returns the direct offset when it is already the shortest path', () => {
		expect(wrappedOffset(3, 1, 10)).toBe(2);
		expect(wrappedOffset(1, 3, 10)).toBe(-2);
	});

	it('wraps distant indices to approach from the nearer side', () => {
		expect(wrappedOffset(9, 0, 10)).toBe(-1);
		expect(wrappedOffset(0, 9, 10)).toBe(1);
	});

	it('returns 0 for an empty set', () => {
		expect(wrappedOffset(2, 0, 0)).toBe(0);
	});
});

describe('InfiniteCardSlider', () => {
	it('renders a labelled carousel region with one card per item', () => {
		const { container, getByLabelText } = render(InfiniteCardSlider, {
			props: { items, ariaLabel: 'Alphabet shelf' }
		});
		const region = getByLabelText('Alphabet shelf');
		expect(region.getAttribute('aria-roledescription')).toBe('carousel');
		expect(cardEls(container)).toHaveLength(items.length);
	});

	it('shows the zero-padded position and total', () => {
		const { container } = render(InfiniteCardSlider, { props: { items } });
		expect(meterText(container)).toBe('01/07');
	});

	it('advances with next and wraps backwards with previous', async () => {
		const { container, getByLabelText } = render(InfiniteCardSlider, { props: { items } });
		await fireEvent.click(getByLabelText('Next card'));
		expect(meterText(container)).toBe('02/07');
		await fireEvent.click(getByLabelText('Previous card'));
		await fireEvent.click(getByLabelText('Previous card'));
		expect(meterText(container)).toBe('07/07');
	});

	it('supports arrow, Home and End keys on the stage', async () => {
		const { container } = render(InfiniteCardSlider, { props: { items } });
		const stage = container.querySelector('.ics-stage') as HTMLElement;
		await fireEvent.keyDown(stage, { key: 'ArrowRight' });
		await fireEvent.keyDown(stage, { key: 'ArrowRight' });
		expect(meterText(container)).toBe('03/07');
		await fireEvent.keyDown(stage, { key: 'ArrowLeft' });
		expect(meterText(container)).toBe('02/07');
		await fireEvent.keyDown(stage, { key: 'End' });
		expect(meterText(container)).toBe('07/07');
		await fireEvent.keyDown(stage, { key: 'Home' });
		expect(meterText(container)).toBe('01/07');
	});

	it('calls onchange with the new index and item only when the selection moves', async () => {
		const onchange = vi.fn();
		const { container, getByLabelText } = render(InfiniteCardSlider, {
			props: { items, onchange }
		});
		await fireEvent.click(getByLabelText('Next card'));
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith(1, items[1]);

		const stage = container.querySelector('.ics-stage') as HTMLElement;
		await fireEvent.keyDown(stage, { key: 'Home' });
		await fireEvent.keyDown(stage, { key: 'Home' });
		expect(onchange).toHaveBeenCalledTimes(2);
		expect(onchange).toHaveBeenLastCalledWith(0, items[0]);
	});

	it('wraps initialIndex into range', () => {
		const { container } = render(InfiniteCardSlider, { props: { items, initialIndex: 9 } });
		// 9 mod 7 = 2 → third card
		expect(meterText(container)).toBe('03/07');
	});

	it('moves aria-current with the selection', async () => {
		const { container, getByLabelText } = render(InfiniteCardSlider, { props: { items } });
		expect(cardEls(container)[0].getAttribute('aria-current')).toBe('true');
		await fireEvent.click(getByLabelText('Next card'));
		expect(cardEls(container)[0].hasAttribute('aria-current')).toBe(false);
		expect(cardEls(container)[1].getAttribute('aria-current')).toBe('true');
	});

	it('makes cards beyond maxVisible aria-hidden and inert', () => {
		const { container } = render(InfiniteCardSlider, { props: { items, maxVisible: 1 } });
		const cards = cardEls(container);
		// Selected 0 → visible offsets are -1, 0, +1 → indices 6, 0, 1
		expect(cards[0].getAttribute('aria-hidden')).toBe('false');
		expect(cards[1].getAttribute('aria-hidden')).toBe('false');
		expect(cards[6].getAttribute('aria-hidden')).toBe('false');
		expect(cards[3].getAttribute('aria-hidden')).toBe('true');
		expect(cards[3].inert).toBe(true);
		expect(cards[0].inert).toBe(false);
	});

	it('renders a link in the default chrome when href is supplied', () => {
		const { container } = render(InfiniteCardSlider, { props: { items } });
		const link = cardEls(container)[1].querySelector('a');
		expect(link?.getAttribute('href')).toBe('/bravo');
		expect(link?.textContent).toContain('Bravo');
		expect(cardEls(container)[0].querySelector('a')).toBeNull();
		expect(cardEls(container)[0].textContent).toContain('First card');
	});

	it('disables navigation when there is only one item', () => {
		const { getByLabelText } = render(InfiniteCardSlider, { props: { items: [items[0]] } });
		expect((getByLabelText('Next card') as HTMLButtonElement).disabled).toBe(true);
		expect((getByLabelText('Previous card') as HTMLButtonElement).disabled).toBe(true);
	});

	it('lets the children snippet replace the default card chrome', () => {
		const { getAllByTestId, container } = render(InfiniteCardSliderTestHarness, {
			props: { items: items.slice(0, 3) }
		});
		const custom = getAllByTestId('custom-card');
		expect(custom).toHaveLength(3);
		expect(custom[1].textContent).toBe('1:Bravo');
		expect(container.querySelector('.ics-card__body')).toBeNull();
	});

	it('keeps the selection in range when items shrink', async () => {
		const { container, rerender } = render(InfiniteCardSlider, {
			props: { items, initialIndex: 6 }
		});
		expect(meterText(container)).toBe('07/07');
		await rerender({ items: items.slice(0, 3) });
		expect(meterText(container)).toBe('03/03');
		expect(cardEls(container)).toHaveLength(3);
	});
});
