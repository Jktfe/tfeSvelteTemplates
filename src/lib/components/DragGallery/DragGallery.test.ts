/**
 * ============================================================
 * DragGallery Tests
 * ============================================================
 *
 * Verifies card rendering, role wiring (listbox + option +
 * aria-selected), keyboard navigation (Arrow / Home / End),
 * onSelect callback firing, image vs placeholder fallback,
 * and the class prop forwarding.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DragGallery from './DragGallery.svelte';
import type { DragGalleryItem } from '$lib/types';

const items: DragGalleryItem[] = [
	{ id: 'a', title: 'Alpha', eyebrow: 'Cat A', subtitle: '£10' },
	{ id: 'b', title: 'Beta', eyebrow: 'Cat B', subtitle: '£20', image: 'https://example.com/b.jpg' },
	{ id: 'c', title: 'Gamma', eyebrow: 'Cat C', subtitle: '£30' },
	{ id: 'd', title: 'Delta', eyebrow: 'Cat D', subtitle: '£40' }
];

describe('DragGallery', () => {
	it('renders one card per item', () => {
		const { container } = render(DragGallery, { props: { items } });
		expect(container.querySelectorAll('.dg-card').length).toBe(items.length);
	});

	it('renders the wrapper with role="listbox" and an aria-label', () => {
		const { container } = render(DragGallery, { props: { items } });
		const wrapper = container.querySelector('.drag-gallery');
		expect(wrapper?.getAttribute('role')).toBe('listbox');
		expect(wrapper?.getAttribute('aria-label')).toBe('Drag gallery');
	});

	it('renders each card with role="option" and an aria-label = title', () => {
		render(DragGallery, { props: { items } });
		expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy();
		expect(screen.getByRole('option', { name: 'Delta' })).toBeTruthy();
	});

	it('marks the initialIndex card with aria-selected=true', () => {
		const { container } = render(DragGallery, { props: { items, initialIndex: 2 } });
		const cards = container.querySelectorAll('[role="option"]');
		const selected = Array.from(cards).filter((c) => c.getAttribute('aria-selected') === 'true');
		expect(selected.length).toBe(1);
		expect(selected[0].getAttribute('aria-label')).toBe('Gamma');
	});

	it('uses an <img> for cards with image, placeholder for those without', () => {
		const { container } = render(DragGallery, { props: { items } });
		const imgs = container.querySelectorAll('img.dg-card-image');
		const placeholders = container.querySelectorAll('.dg-card-placeholder');
		expect(imgs.length).toBe(1);
		expect(placeholders.length).toBe(3);
	});

	it('uses item.title as alt fallback when alt is omitted', () => {
		const { container } = render(DragGallery, { props: { items } });
		const img = container.querySelector('img.dg-card-image') as HTMLImageElement;
		expect(img.getAttribute('alt')).toBe('Beta');
	});

	it('clicking a card moves the .selected marker to that card', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(DragGallery, {
			props: { items, initialIndex: 0, onSelect }
		});
		const cards = container.querySelectorAll('[role="option"]');
		await user.click(cards[3] as HTMLElement);
		const selected = container.querySelectorAll('[aria-selected="true"]');
		expect(selected.length).toBe(1);
		expect(selected[0].getAttribute('aria-label')).toBe('Delta');
		expect(onSelect).toHaveBeenCalled();
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(3);
	});

	it('ArrowRight advances to the next card', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(DragGallery, {
			props: { items, initialIndex: 0, onSelect }
		});
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{ArrowRight}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(1);
	});

	it('ArrowLeft from index 0 stays at 0 (clamped, no wrap)', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(DragGallery, {
			props: { items, initialIndex: 0, onSelect }
		});
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{ArrowLeft}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(0);
	});

	it('End jumps to the last card', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(DragGallery, { props: { items, initialIndex: 0, onSelect } });
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{End}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(items.length - 1);
	});

	it('Home jumps to the first card', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(DragGallery, { props: { items, initialIndex: 2, onSelect } });
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{Home}');
		expect(onSelect.mock.calls[onSelect.mock.calls.length - 1][1]).toBe(0);
	});

	it('clamps initialIndex into the valid range at mount', () => {
		const { container } = render(DragGallery, { props: { items, initialIndex: 99 } });
		const selected = container.querySelector('[aria-selected="true"]');
		expect(selected?.getAttribute('aria-label')).toBe('Delta');
	});

	it('makes the wrapper keyboard-focusable via tabindex=0', () => {
		const { container } = render(DragGallery, { props: { items } });
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		expect(wrapper.getAttribute('tabindex')).toBe('0');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(DragGallery, { props: { items, class: 'custom-gallery' } });
		expect(container.querySelector('.drag-gallery.custom-gallery')).toBeTruthy();
	});

	it('writes cardWidth and cardGap into CSS custom properties', () => {
		const { container } = render(DragGallery, {
			props: { items, cardWidth: 260, cardGap: 16 }
		});
		const wrapper = container.querySelector('.drag-gallery') as HTMLElement;
		const style = wrapper.getAttribute('style') ?? '';
		expect(style).toContain('--card-width: 260px');
		expect(style).toContain('--card-gap: 16px');
	});

	it('handles an empty items array gracefully', () => {
		const { container } = render(DragGallery, { props: { items: [] } });
		expect(container.querySelectorAll('.dg-card').length).toBe(0);
		expect(container.querySelector('.drag-gallery')).toBeTruthy();
	});
});
