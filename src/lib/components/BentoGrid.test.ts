/**
 * ============================================================
 * BentoGrid Tests
 * ============================================================
 *
 * These tests verify that BentoGrid works as expected.
 * We're checking:
 *   ✓ It renders correctly with default props
 *   ✓ It renders custom items with correct span styles
 *   ✓ It handles links and accessibility appropriately
 *
 * 💡 TIP: Run `bun run test:ui` for a visual test interface!
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import BentoGrid from './BentoGrid.svelte';
import type { BentoItem } from '$lib/types';

describe('BentoGrid', () => {
	const mockItems: BentoItem[] = [
		{
			id: 1,
			title: 'Test Item 1',
			description: 'Test Description 1',
			icon: '🚀',
			colSpan: 2
		},
		{
			id: 2,
			title: 'Link Item',
			href: 'https://example.com'
		}
	];

	it('renders without crashing', () => {
		render(BentoGrid, { props: { items: mockItems } });
		expect(screen.getByText('Test Item 1')).toBeInTheDocument();
	});

	it('displays item titles and descriptions', () => {
		render(BentoGrid, { props: { items: mockItems } });
		expect(screen.getByText('Test Item 1')).toBeInTheDocument();
		expect(screen.getByText('Test Description 1')).toBeInTheDocument();
	});

	it('renders as links when href is provided', () => {
		render(BentoGrid, { props: { items: mockItems } });
		const linkItem = screen.getByRole('link', { name: /Link Item/i });
		expect(linkItem).toBeInTheDocument();
		expect(linkItem).toHaveAttribute('href', 'https://example.com');
	});

	it('applies custom grid column spans via styles', () => {
		const { container } = render(BentoGrid, { props: { items: mockItems } });
		const firstItem = container.querySelector('.bento-item');
		expect(firstItem).toHaveStyle('--col-span: 2');
	});

	it('is accessible for screen readers', () => {
		render(BentoGrid, { props: { items: mockItems } });
		const icon = screen.getByText('🚀');
		expect(icon).toHaveAttribute('aria-hidden', 'true');
	});
});
