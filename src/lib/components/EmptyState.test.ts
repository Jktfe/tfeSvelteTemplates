/**
 * ============================================================
 * EmptyState Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders the title
 *   ✓ Renders without a title (snippet-only mode)
 *   ✓ Applies the size class
 *   ✓ Applies the variant class
 *   ✓ Sets role="status" for screen-reader announcement
 *   ✓ Forwards extra classes via the class prop
 *
 * Run:
 *   bun run test -- EmptyState
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import EmptyState from './EmptyState.svelte';

describe('EmptyState', () => {
	it('renders the title', () => {
		const { getByText } = render(EmptyState, { title: 'No orders yet' });
		expect(getByText('No orders yet')).toBeTruthy();
	});

	it('renders without a title', () => {
		const { container } = render(EmptyState);
		expect(container.querySelector('.empty-title')).toBeNull();
	});

	it('applies the default size and variant classes', () => {
		const { container } = render(EmptyState, { title: 'Empty' });
		const root = container.querySelector('.empty-state') as HTMLElement;
		expect(root.classList.contains('empty-md')).toBe(true);
		expect(root.classList.contains('empty-default')).toBe(true);
	});

	it('applies the size class', () => {
		const { container } = render(EmptyState, { title: 'Empty', size: 'lg' });
		const root = container.querySelector('.empty-state') as HTMLElement;
		expect(root.classList.contains('empty-lg')).toBe(true);
	});

	it('applies the variant class', () => {
		const { container } = render(EmptyState, { title: 'Empty', variant: 'card' });
		const root = container.querySelector('.empty-state') as HTMLElement;
		expect(root.classList.contains('empty-card')).toBe(true);
	});

	it('uses role=status for screen-reader announcement', () => {
		const { container } = render(EmptyState, { title: 'Empty' });
		const root = container.querySelector('.empty-state') as HTMLElement;
		expect(root.getAttribute('role')).toBe('status');
		expect(root.getAttribute('aria-live')).toBe('polite');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(EmptyState, {
			title: 'Empty',
			class: 'custom-empty'
		});
		const root = container.querySelector('.empty-state') as HTMLElement;
		expect(root.classList.contains('custom-empty')).toBe(true);
	});

	it('hides icon container when no icon snippet provided', () => {
		const { container } = render(EmptyState, { title: 'No icon' });
		expect(container.querySelector('.empty-icon')).toBeNull();
	});

	it('hides description container when no description snippet provided', () => {
		const { container } = render(EmptyState, { title: 'Spare' });
		expect(container.querySelector('.empty-description')).toBeNull();
	});

	it('hides action container when no action snippet provided', () => {
		const { container } = render(EmptyState, { title: 'Spare' });
		expect(container.querySelector('.empty-action')).toBeNull();
	});
});
