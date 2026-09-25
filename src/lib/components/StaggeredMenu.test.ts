/*
 * StaggeredMenu Tests
 *
 * Covers:
 *   ✓ Renders a <nav> landmark with the default and custom aria-label
 *   ✓ Renders one link per item with the right href and label
 *   ✓ Marks active items with aria-current="page"
 *   ✓ Hides icons from assistive tech
 *   ✓ Writes a per-item stagger delay (index × staggerMs)
 *   ✓ Clamps negative stagger values to zero
 *   ✓ Forwards duration, orientation, id and class
 *   ✓ Unmounts the list when isOpen is false and remounts on reopen
 *   ✓ Copes with an empty items array
 *
 * Run:
 *   bun run test -- StaggeredMenu
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import StaggeredMenu from './StaggeredMenu.svelte';
import type { MenuItem } from '$lib/types';

const items: MenuItem[] = [
	{ href: '/', label: 'Home', active: true },
	{ href: '/work', label: 'Work', icon: '💼' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' }
];

describe('StaggeredMenu', () => {
	it('renders a navigation landmark with the default label', () => {
		const { getByRole } = render(StaggeredMenu, { props: { items } });
		expect(getByRole('navigation', { name: 'Main navigation' })).toBeTruthy();
	});

	it('accepts a custom aria-label', () => {
		const { getByRole } = render(StaggeredMenu, {
			props: { items, ariaLabel: 'Footer links' }
		});
		expect(getByRole('navigation', { name: 'Footer links' })).toBeTruthy();
	});

	it('renders one link per item', () => {
		const { getAllByRole } = render(StaggeredMenu, { props: { items } });
		const links = getAllByRole('link');
		expect(links).toHaveLength(items.length);
		expect(links.map((l) => l.getAttribute('href'))).toEqual(items.map((i) => i.href));
		expect(links[2].textContent).toContain('About');
	});

	it('marks only active items with aria-current="page"', () => {
		const { getAllByRole } = render(StaggeredMenu, { props: { items } });
		const links = getAllByRole('link');
		expect(links[0].getAttribute('aria-current')).toBe('page');
		expect(links[0].classList.contains('active')).toBe(true);
		expect(links[1].hasAttribute('aria-current')).toBe(false);
	});

	it('hides icons from screen readers', () => {
		const { container } = render(StaggeredMenu, { props: { items } });
		const icon = container.querySelector('.menu-icon');
		expect(icon?.textContent).toBe('💼');
		expect(icon?.getAttribute('aria-hidden')).toBe('true');
	});

	it('writes a stagger delay of index × staggerMs to each item', () => {
		const { container } = render(StaggeredMenu, { props: { items, staggerMs: 80 } });
		const delays = Array.from(container.querySelectorAll<HTMLElement>('.menu-item')).map((li) =>
			li.style.getPropertyValue('--stagger-delay')
		);
		expect(delays).toEqual(['0ms', '80ms', '160ms', '240ms']);
	});

	it('clamps negative stagger values to zero', () => {
		const { container } = render(StaggeredMenu, { props: { items, staggerMs: -40 } });
		const last = container.querySelectorAll<HTMLElement>('.menu-item')[3];
		expect(last.style.getPropertyValue('--stagger-delay')).toBe('0ms');
	});

	it('forwards duration, orientation, id and class to the nav', () => {
		const { container } = render(StaggeredMenu, {
			props: { items, durationMs: 450, orientation: 'vertical', id: 'site-nav', class: 'extra' }
		});
		const nav = container.querySelector('nav') as HTMLElement;
		expect(nav.id).toBe('site-nav');
		expect(nav.classList.contains('staggered-menu--vertical')).toBe(true);
		expect(nav.classList.contains('extra')).toBe(true);
		expect(nav.style.getPropertyValue('--staggered-menu-duration')).toBe('450ms');
	});

	it('defaults to the responsive auto orientation', () => {
		const { container } = render(StaggeredMenu, { props: { items } });
		expect(container.querySelector('nav')?.classList.contains('staggered-menu--auto')).toBe(true);
	});

	it('unmounts the list when closed and remounts it on reopen', async () => {
		const { container, rerender } = render(StaggeredMenu, { props: { items, isOpen: false } });
		expect(container.querySelector('nav')).toBeTruthy();
		expect(container.querySelector('ul')).toBeNull();

		await rerender({ items, isOpen: true });
		expect(container.querySelectorAll('.menu-item')).toHaveLength(items.length);
	});

	it('copes with an empty items array', () => {
		const { container } = render(StaggeredMenu, { props: { items: [] } });
		expect(container.querySelectorAll('li')).toHaveLength(0);
		expect(container.querySelector('nav')).toBeTruthy();
	});
});
