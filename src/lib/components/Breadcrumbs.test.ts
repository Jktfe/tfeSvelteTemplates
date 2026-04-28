/*
 * Breadcrumbs Tests
 *
 * Covers:
 *   ✓ Renders all items as links except the last
 *   ✓ Last item gets aria-current="page" and is not a link
 *   ✓ Separator rendered between items, hidden from a11y
 *   ✓ Custom separator string
 *   ✓ Wrapper nav has the right aria-label
 *   ✓ Custom aria-label is honoured
 *   ✓ maxVisible=0 disables truncation (renders all)
 *   ✓ Truncation with maxVisible=4 keeps first + ellipsis + last (max-2)
 *   ✓ No truncation when items.length <= maxVisible
 *   ✓ Items without href render as plain text mid-trail (not links)
 *
 * Run:
 *   bun run test -- Breadcrumbs
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Breadcrumbs from './Breadcrumbs.svelte';

const trail = [
	{ label: 'Home', href: '/' },
	{ label: 'Components', href: '/components' },
	{ label: 'Navigation', href: '/components/navigation' },
	{ label: 'Breadcrumbs' }
];

describe('Breadcrumbs', () => {
	it('renders all but the last item as links', () => {
		const { container } = render(Breadcrumbs, { props: { items: trail } });
		const links = container.querySelectorAll('a.crumb-link');
		expect(links.length).toBe(3);
		expect(Array.from(links).map((l) => l.textContent?.trim())).toEqual([
			'Home',
			'Components',
			'Navigation'
		]);
	});

	it('marks the last item with aria-current="page" and renders it as text', () => {
		const { container } = render(Breadcrumbs, { props: { items: trail } });
		const current = container.querySelector('[aria-current="page"]');
		expect(current?.tagName).toBe('SPAN');
		expect(current?.textContent?.trim()).toBe('Breadcrumbs');
	});

	it('renders separators between items, aria-hidden', () => {
		const { container } = render(Breadcrumbs, { props: { items: trail } });
		const seps = container.querySelectorAll('.crumb-sep');
		expect(seps.length).toBe(3); // 4 items → 3 separators
		seps.forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
	});

	it('honours a custom separator string', () => {
		const { container } = render(Breadcrumbs, {
			props: { items: trail, separator: '›' }
		});
		const seps = container.querySelectorAll('.crumb-sep');
		seps.forEach((s) => expect(s.textContent?.trim()).toBe('›'));
	});

	it('wrapper nav has aria-label="Breadcrumb" by default', () => {
		const { container } = render(Breadcrumbs, { props: { items: trail } });
		const nav = container.querySelector('nav');
		expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
	});

	it('honours a custom aria-label', () => {
		const { container } = render(Breadcrumbs, {
			props: { items: trail, ariaLabel: 'You are here' }
		});
		const nav = container.querySelector('nav');
		expect(nav?.getAttribute('aria-label')).toBe('You are here');
	});

	it('maxVisible=0 (default) disables truncation', () => {
		const long = Array.from({ length: 8 }, (_, i) => ({
			label: `Level ${i + 1}`,
			href: i < 7 ? `/lvl-${i + 1}` : undefined
		}));
		const { container } = render(Breadcrumbs, { props: { items: long } });
		expect(container.querySelectorAll('.breadcrumb-item').length).toBe(8);
		expect(container.querySelector('.crumb-ellipsis')).toBeNull();
	});

	it('maxVisible=4 collapses middle (first + ellipsis + last 2)', () => {
		const long = Array.from({ length: 6 }, (_, i) => ({
			label: `Level ${i + 1}`,
			href: i < 5 ? `/lvl-${i + 1}` : undefined
		}));
		const { container } = render(Breadcrumbs, { props: { items: long, maxVisible: 4 } });
		const labels = Array.from(container.querySelectorAll('.breadcrumb-item')).map(
			(li) => li.querySelector('.crumb-link, .crumb-current, .crumb-ellipsis')?.textContent?.trim()
		);
		expect(labels).toEqual(['Level 1', '…', 'Level 5', 'Level 6']);
		expect(container.querySelector('.crumb-ellipsis')).toBeTruthy();
	});

	it('does not truncate when items.length <= maxVisible', () => {
		const { container } = render(Breadcrumbs, { props: { items: trail, maxVisible: 4 } });
		expect(container.querySelector('.crumb-ellipsis')).toBeNull();
		expect(container.querySelectorAll('.breadcrumb-item').length).toBe(4);
	});

	it('renders intermediate items without href as plain spans', () => {
		const mixed = [
			{ label: 'Home', href: '/' },
			{ label: 'Section' }, // no href, mid-trail
			{ label: 'Current' }
		];
		const { container } = render(Breadcrumbs, { props: { items: mixed } });
		const links = container.querySelectorAll('a.crumb-link');
		expect(links.length).toBe(1);
		expect(links[0].textContent?.trim()).toBe('Home');
		const spans = container.querySelectorAll('.crumb-current');
		expect(spans.length).toBe(2);
	});
});
