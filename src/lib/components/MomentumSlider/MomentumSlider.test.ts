/**
 * ============================================================
 * MomentumSlider Tests
 * ============================================================
 *
 * Verifies card rendering, ARIA wiring, perspective CSS variables,
 * keyboard navigation, modal expand/close on Enter/Escape, and the
 * onSelect/onExpand callbacks.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MomentumSlider from './MomentumSlider.svelte';
import type { MomentumSliderItem } from '$lib/types';

const items: MomentumSliderItem[] = [
	{ id: 'a', title: 'Scene Alpha', eyebrow: 'Wide', subtitle: 'Take 1', description: 'Establishing shot.' },
	{ id: 'b', title: 'Scene Beta', eyebrow: 'Cut', subtitle: 'Take 2', description: 'Reveal.' },
	{ id: 'c', title: 'Scene Gamma', eyebrow: 'Hold', subtitle: 'Take 3' },
	{ id: 'd', title: 'Scene Delta', eyebrow: 'Pull', subtitle: 'Take 4' }
];

describe('MomentumSlider', () => {
	it('renders one card per item', () => {
		const { container } = render(MomentumSlider, { props: { items } });
		expect(container.querySelectorAll('.ms-card').length).toBe(items.length);
	});

	it('renders the wrapper with role="region" and aria-roledescription="carousel"', () => {
		const { container } = render(MomentumSlider, { props: { items } });
		const wrapper = container.querySelector('.momentum-slider');
		expect(wrapper?.getAttribute('role')).toBe('region');
		expect(wrapper?.getAttribute('aria-roledescription')).toBe('carousel');
		expect(wrapper?.getAttribute('aria-label')).toBe('Momentum slider');
	});

	it('marks the initial active card with aria-current="true"', () => {
		const { container } = render(MomentumSlider, { props: { items, initialIndex: 2 } });
		const active = container.querySelectorAll('[aria-current="true"]');
		expect(active.length).toBe(1);
		expect(active[0].getAttribute('aria-label')).toBe('Scene Gamma');
	});

	it('writes per-card perspective variables into inline style', () => {
		const { container } = render(MomentumSlider, { props: { items, initialIndex: 0 } });
		const cards = container.querySelectorAll('.ms-card');
		// Card at distance 1 should have rotate -8deg, scale ~0.94, opacity ~0.82
		const second = cards[1] as HTMLElement;
		const style = second.getAttribute('style') ?? '';
		expect(style).toContain('--rotate: -8deg');
		expect(style).toContain('--scale: 0.94');
	});

	it('clicking a non-active card calls onSelect with that index', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(MomentumSlider, {
			props: { items, initialIndex: 0, onSelect }
		});
		const cards = container.querySelectorAll('.ms-card');
		await user.click(cards[2] as HTMLElement);
		expect(onSelect).toHaveBeenCalled();
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(2);
	});

	it('clicking the active card opens the modal and fires onExpand', async () => {
		const user = userEvent.setup();
		const onExpand = vi.fn();
		const { container } = render(MomentumSlider, {
			props: { items, initialIndex: 1, onExpand }
		});
		const cards = container.querySelectorAll('.ms-card');
		await user.click(cards[1] as HTMLElement);
		expect(onExpand).toHaveBeenCalled();
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
	});

	it('Enter on the focused wrapper expands the active card', async () => {
		const user = userEvent.setup();
		const onExpand = vi.fn();
		const { container } = render(MomentumSlider, {
			props: { items, initialIndex: 0, onExpand }
		});
		const wrapper = container.querySelector('.momentum-slider') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{Enter}');
		expect(onExpand).toHaveBeenCalled();
	});

	it('Escape closes the modal', async () => {
		const user = userEvent.setup();
		const { container } = render(MomentumSlider, { props: { items, initialIndex: 0 } });
		const cards = container.querySelectorAll('.ms-card');
		await user.click(cards[0] as HTMLElement);
		expect(container.querySelector('[role="dialog"]')).toBeTruthy();
		const wrapper = container.querySelector('.momentum-slider') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{Escape}');
		// Modal closes asynchronously via gsap timeline; in test (no gsap) it's synchronous.
		// The dialog is removed from DOM after onComplete fires.
		expect(container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('ArrowRight moves to the next active card', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(MomentumSlider, {
			props: { items, initialIndex: 0, onSelect }
		});
		const wrapper = container.querySelector('.momentum-slider') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{ArrowRight}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(1);
	});

	it('Home jumps to the first card from a later index', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(MomentumSlider, {
			props: { items, initialIndex: 2, onSelect }
		});
		const wrapper = container.querySelector('.momentum-slider') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{Home}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(0);
	});

	it('clamps initialIndex into the valid range', () => {
		const { container } = render(MomentumSlider, { props: { items, initialIndex: 999 } });
		const active = container.querySelector('[aria-current="true"]');
		expect(active?.getAttribute('aria-label')).toBe('Scene Delta');
	});

	it('writes cardWidth and cardGap as CSS custom properties on the wrapper', () => {
		const { container } = render(MomentumSlider, {
			props: { items, cardWidth: 320, cardGap: 24 }
		});
		const wrapper = container.querySelector('.momentum-slider') as HTMLElement;
		const style = wrapper.getAttribute('style') ?? '';
		expect(style).toContain('--card-width: 320px');
		expect(style).toContain('--card-gap: 24px');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(MomentumSlider, {
			props: { items, class: 'extra-momentum' }
		});
		expect(container.querySelector('.momentum-slider.extra-momentum')).toBeTruthy();
	});

	it('handles an empty items array gracefully', () => {
		const { container } = render(MomentumSlider, { props: { items: [] } });
		expect(container.querySelectorAll('.ms-card').length).toBe(0);
		expect(container.querySelector('.momentum-slider')).toBeTruthy();
	});

	it('renders the modal title from the active item when expanded', async () => {
		const user = userEvent.setup();
		render(MomentumSlider, { props: { items, initialIndex: 1 } });
		const cards = screen.getAllByRole('button');
		await user.click(cards[1]);
		expect(screen.getByRole('dialog', { name: 'Scene Beta' })).toBeTruthy();
	});
});
