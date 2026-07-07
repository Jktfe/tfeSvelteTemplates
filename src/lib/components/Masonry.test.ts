/**
 * ============================================================
 * Masonry Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders every item via the `item` snippet
 *   ✓ Distributes items across the requested number of columns
 *   ✓ Honours a fixed `columns` count
 *   ✓ Applies the `gap` prop as a CSS custom property
 *   ✓ Renders empty columns (and no items) for an empty array
 *
 * jsdom has no real layout engine, so getBoundingClientRect() returns 0 —
 * the component then uses its round-robin fallback distribution, which is
 * exactly what these DOM-level tests assert against.
 *
 * Run:
 *   bunx vitest run src/lib/components/Masonry.test.ts
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import Masonry from './Masonry.svelte';

// A minimal snippet that renders each item's `label` in a <span>. Typed with
// `unknown` for the item because `render()` doesn't infer Masonry's generic — the
// component's `item` prop is `Snippet<[unknown, number]>` at this call site.
const itemSnippet = createRawSnippet<[unknown, number]>((getItem) => ({
	render: () => `<span class="cell">${(getItem() as { label: string }).label}</span>`
}));

const makeItems = (n: number) =>
	Array.from({ length: n }, (_, i) => ({ id: i, label: `Item ${i + 1}` }));

describe('Masonry', () => {
	it('renders every item through the snippet', () => {
		const { container } = render(Masonry, {
			props: { items: makeItems(6), item: itemSnippet, columns: 3 }
		});
		expect(container.querySelectorAll('.cell')).toHaveLength(6);
	});

	it('distributes items across the requested number of columns', () => {
		const { container } = render(Masonry, {
			props: { items: makeItems(6), item: itemSnippet, columns: 3 }
		});
		const cols = container.querySelectorAll('.masonry__col');
		expect(cols).toHaveLength(3);
		// Round-robin fallback → 2 items per column for 6 items / 3 columns.
		cols.forEach((col) => {
			expect(col.querySelectorAll('.masonry__item')).toHaveLength(2);
		});
	});

	it('honours a fixed columns count', () => {
		const { container } = render(Masonry, {
			props: { items: makeItems(4), item: itemSnippet, columns: 2 }
		});
		expect(container.querySelectorAll('.masonry__col')).toHaveLength(2);
	});

	it('applies the gap prop as a CSS custom property', () => {
		const { container } = render(Masonry, {
			props: { items: makeItems(3), item: itemSnippet, columns: 2, gap: 24 }
		});
		const root = container.querySelector('.masonry') as HTMLElement;
		expect(root.style.getPropertyValue('--masonry-gap')).toBe('24px');
	});

	it('renders empty columns and no items for an empty array', () => {
		const { container } = render(Masonry, {
			props: { items: [], item: itemSnippet, columns: 3 }
		});
		expect(container.querySelectorAll('.masonry__col')).toHaveLength(3);
		expect(container.querySelectorAll('.masonry__item')).toHaveLength(0);
	});
});
