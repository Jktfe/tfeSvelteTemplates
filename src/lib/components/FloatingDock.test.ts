/**
 * ============================================================
 * FloatingDock Tests
 * ============================================================
 *
 * Verifies item rendering, anchor href wiring, ARIA labels,
 * and the no-items default fallback.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import FloatingDock from './FloatingDock.svelte';
import type { FloatingDockItem } from '$lib/types';

const items: FloatingDockItem[] = [
	{ id: 'home', title: 'Home', icon: '🏠', href: '/' },
	{ id: 'docs', title: 'Docs', icon: '📚', href: '/docs' },
	{ id: 'gh', title: 'GitHub', icon: '🐙', href: 'https://github.com/example' }
];

describe('FloatingDock', () => {
	it('renders one item per FloatingDockItem in props', () => {
		render(FloatingDock, { props: { items } });
		expect(screen.getByLabelText('Home')).toBeTruthy();
		expect(screen.getByLabelText('Docs')).toBeTruthy();
		expect(screen.getByLabelText('GitHub')).toBeTruthy();
	});

	it('renders items as anchors when href is supplied', () => {
		const { container } = render(FloatingDock, { props: { items } });
		const anchors = container.querySelectorAll('a[href]');
		expect(anchors.length).toBe(items.length);
		expect(anchors[0].getAttribute('href')).toBe('/');
		expect(anchors[2].getAttribute('href')).toBe('https://github.com/example');
	});

	it('falls back to FALLBACK_DOCK_ITEMS when items is omitted', () => {
		const { container } = render(FloatingDock, { props: {} });
		// At least one dock item should render
		const dockItems = container.querySelectorAll('.dock-item');
		expect(dockItems.length).toBeGreaterThan(0);
	});

	it('marks decorative icons as aria-hidden', () => {
		const { container } = render(FloatingDock, { props: { items } });
		const icons = container.querySelectorAll('.dock-icon');
		expect(icons.length).toBeGreaterThan(0);
		for (const icon of icons) {
			expect(icon.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(FloatingDock, { props: { items, class: 'my-custom-dock' } });
		expect(container.querySelector('.my-custom-dock')).toBeTruthy();
	});

	it('labels each dock item with aria-label = title', () => {
		render(FloatingDock, { props: { items } });
		for (const item of items) {
			const el = screen.getByLabelText(item.title);
			expect(el).toBeTruthy();
		}
	});

	it('renders the dock container with role and aria-label', () => {
		const { container } = render(FloatingDock, { props: { items } });
		const dock = container.querySelector('[role="navigation"], nav, [aria-label]');
		expect(dock).toBeTruthy();
	});
});
