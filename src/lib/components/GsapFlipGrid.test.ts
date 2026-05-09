/**
 * ============================================================
 * GsapFlipGrid Tests
 * ============================================================
 *
 * Verifies pure helpers (normalize / filter / sort / order) and
 * the host component renders title/eyebrow/items with controls
 * exposed for filter and density.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import GsapFlipGrid, {
	normalizeFlipGridItems,
	normalizeFlipGridFilters,
	filterFlipGridItems,
	sortFlipGridItems,
	orderFlipGridItems
} from './GsapFlipGrid.svelte';
import type { GsapFlipGridItem, GsapFlipGridFilter } from './GsapFlipGrid.svelte';

const items: GsapFlipGridItem[] = [
	{ id: 'a', title: 'Banana', description: 'B fruit', filter: 'fruit', category: 'sweet', tags: ['yellow'] },
	{ id: 'b', title: 'Apple',  description: 'A fruit', filter: 'fruit', category: 'sweet', tags: ['red'] },
	{ id: 'c', title: 'Carrot', description: 'C veg',   filter: 'veg',   category: 'savory', tags: ['orange'] }
];

const filters: GsapFlipGridFilter[] = [
	{ id: 'all', label: 'All' },
	{ id: 'fruit', label: 'Fruit' },
	{ id: 'veg', label: 'Veg' }
];

describe('GsapFlipGrid module helpers', () => {
	it('normalizeFlipGridItems drops items without titles', () => {
		const out = normalizeFlipGridItems([
			{ id: '1', title: 'kept', description: '' },
			{ id: '2', title: '   ', description: '' },
			{ id: '3', title: '', description: '' }
		]);
		expect(out.length).toBe(1);
		expect(out[0].title).toBe('kept');
	});

	it('normalizeFlipGridItems backfills ids from the title slug + index when missing', () => {
		const out = normalizeFlipGridItems([
			{ id: '', title: 'My Cool Item', description: '' }
		]);
		expect(out[0].id).toBe('my-cool-item-0');
	});

	it('normalizeFlipGridFilters dedupes by id', () => {
		const out = normalizeFlipGridFilters([
			{ id: 'fruit', label: 'Fruit' },
			{ id: 'fruit', label: 'Fruits!' }
		]);
		// At most one fruit entry — first wins
		expect(out.filter((f) => f.id === 'fruit').length).toBe(1);
	});

	it('filterFlipGridItems returns all items for the "all" filter', () => {
		expect(filterFlipGridItems(items, 'all').length).toBe(items.length);
	});

	it('filterFlipGridItems narrows to items with a matching .filter / .category / .tags', () => {
		expect(filterFlipGridItems(items, 'fruit').map((i) => i.id).sort()).toEqual(['a', 'b']);
		expect(filterFlipGridItems(items, 'savory').map((i) => i.id)).toEqual(['c']);
		expect(filterFlipGridItems(items, 'orange').map((i) => i.id)).toEqual(['c']);
	});

	it('sortFlipGridItems "alpha" sorts by title; "curated" preserves input order', () => {
		const alpha = sortFlipGridItems(items, 'alpha').map((i) => i.title);
		expect(alpha).toEqual(['Apple', 'Banana', 'Carrot']);
		const curated = sortFlipGridItems(items, 'curated').map((i) => i.title);
		expect(curated).toEqual(['Banana', 'Apple', 'Carrot']);
	});

	it('orderFlipGridItems hoists the promoted id to the front of the sorted list', () => {
		const ordered = orderFlipGridItems(items, 'b', 'alpha').map((i) => i.id);
		expect(ordered[0]).toBe('b');
		expect(ordered.length).toBe(items.length);
	});

	it('orderFlipGridItems leaves the order unchanged when promotedId is unknown', () => {
		const ordered = orderFlipGridItems(items, 'missing-id', 'curated').map((i) => i.id);
		expect(ordered).toEqual(items.map((i) => i.id));
	});
});

describe('GsapFlipGrid component', () => {
	it('renders the supplied title and eyebrow when showHeader=true (default)', () => {
		render(GsapFlipGrid, {
			props: { items, title: 'My title', eyebrow: 'Eyebrow tag' }
		});
		expect(screen.getByText('My title')).toBeTruthy();
		expect(screen.getByText('Eyebrow tag')).toBeTruthy();
	});

	it('omits the header section when showHeader=false', () => {
		render(GsapFlipGrid, {
			props: { items, title: 'My title', showHeader: false }
		});
		expect(screen.queryByText('My title')).toBeNull();
	});

	it('renders one card per normalised item', () => {
		const { container } = render(GsapFlipGrid, { props: { items } });
		const cards = container.querySelectorAll('[data-flip-id], .flip-card, .grid-item, article');
		expect(cards.length).toBeGreaterThanOrEqual(items.length);
	});

	it('renders one filter chip/button per normalised filter when filters are supplied', () => {
		const { container } = render(GsapFlipGrid, {
			props: { items, filters, showControls: true }
		});
		const buttons = container.querySelectorAll('button');
		// Each filter is typically a button — there must be at least filters.length
		expect(buttons.length).toBeGreaterThanOrEqual(filters.length);
	});

	it('falls back to default items when items is omitted', () => {
		const { container } = render(GsapFlipGrid, { props: {} });
		// At least one default card should render
		const text = container.textContent ?? '';
		expect(text.length).toBeGreaterThan(0);
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(GsapFlipGrid, {
			props: { items, class: 'custom-flip-grid' }
		});
		expect(container.querySelector('.custom-flip-grid')).toBeTruthy();
	});
});
