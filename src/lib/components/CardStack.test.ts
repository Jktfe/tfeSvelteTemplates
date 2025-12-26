/**
 * ============================================================
 * CardStack Tests
 * ============================================================
 *
 * These tests verify that CardStack renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Cards display correctly
 *   - Selection toggling works
 *   - Accessibility attributes are correct
 *   - Navigation hint appears
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- CardStack       - Just this file
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import CardStack from './CardStack.svelte';

// Sample cards for testing
const testCards = [
	{ image: '/test1.jpg', title: 'Card One', content: 'First card content' },
	{ image: '/test2.jpg', title: 'Card Two', content: 'Second card content' },
	{ image: '/test3.jpg', title: 'Card Three', content: 'Third card content' }
];

describe('CardStack', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(CardStack);
		expect(container).toBeTruthy();
	});

	// Container should have the stack-container class
	it('has the stack-container class', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const stackContainer = container.querySelector('.stack-container');
		expect(stackContainer).toBeInTheDocument();
	});

	// Should render the correct number of cards
	it('renders all cards', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const cards = container.querySelectorAll('.card-hit-area');
		expect(cards).toHaveLength(3);
	});

	// Each card should have proper ARIA label
	it('cards have ARIA labels with title and position', () => {
		render(CardStack, { props: { cards: testCards } });
		expect(screen.getByLabelText(/Card 1 of 3: Card One/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Card 2 of 3: Card Two/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Card 3 of 3: Card Three/)).toBeInTheDocument();
	});

	// Container should have role="region" for accessibility
	it('container has role="region"', () => {
		render(CardStack, { props: { cards: testCards } });
		const region = screen.getByRole('region');
		expect(region).toBeInTheDocument();
	});

	// Container should have descriptive ARIA label
	it('container has descriptive ARIA label', () => {
		render(CardStack, { props: { cards: testCards } });
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('aria-label');
		expect(region.getAttribute('aria-label')).toContain('Card stack');
	});

	// Cards should be buttons for accessibility
	it('cards have button role', () => {
		render(CardStack, { props: { cards: testCards } });
		const buttons = screen.getAllByRole('button');
		expect(buttons.length).toBeGreaterThanOrEqual(3);
	});

	// Container should be focusable (tabindex="0")
	it('container is focusable', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const stackContainer = container.querySelector('.stack-container');
		expect(stackContainer).toHaveAttribute('tabindex', '0');
	});

	// Cards should have aria-pressed attribute
	it('cards have aria-pressed attribute', () => {
		render(CardStack, { props: { cards: testCards } });
		const button = screen.getByLabelText(/Card 1 of 3: Card One/);
		expect(button).toHaveAttribute('aria-pressed');
	});

	// Clicking a card should toggle selection
	it('clicking a card toggles selection', async () => {
		render(CardStack, { props: { cards: testCards } });
		const button = screen.getByLabelText(/Card 1 of 3: Card One/);

		// Initially not pressed
		expect(button).toHaveAttribute('aria-pressed', 'false');

		// Click to select
		await fireEvent.click(button);
		expect(button).toHaveAttribute('aria-pressed', 'true');

		// Click again to deselect
		await fireEvent.click(button);
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	// Card images should have alt text
	it('card images have alt text', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const images = container.querySelectorAll('.card-image');
		images.forEach((img) => {
			expect(img).toHaveAttribute('alt');
		});
	});

	// Card images should not be draggable (prevents accidental drag on touch)
	it('card images are not draggable', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const images = container.querySelectorAll('.card-image');
		images.forEach((img) => {
			expect(img).toHaveAttribute('draggable', 'false');
		});
	});

	// Cards wrapper should exist
	it('has cards-wrapper container', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const wrapper = container.querySelector('.cards-wrapper');
		expect(wrapper).toBeInTheDocument();
	});

	// Swipe hint should exist
	it('shows swipe hint', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const hint = container.querySelector('.swipe-hint');
		expect(hint).toBeInTheDocument();
	});

	// Swipe hint should be hidden from screen readers
	it('swipe hint is aria-hidden', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const hint = container.querySelector('.swipe-hint');
		expect(hint).toHaveAttribute('aria-hidden', 'true');
	});

	// Card titles should display
	it('displays card titles', () => {
		render(CardStack, { props: { cards: testCards } });
		expect(screen.getByText('Card One')).toBeInTheDocument();
		expect(screen.getByText('Card Two')).toBeInTheDocument();
		expect(screen.getByText('Card Three')).toBeInTheDocument();
	});

	// Card content should display
	it('displays card content', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const contentElements = container.querySelectorAll('.card-content');
		expect(contentElements).toHaveLength(3);
	});

	// Empty cards array should render without errors
	it('handles empty cards array gracefully', () => {
		const { container } = render(CardStack, { props: { cards: [] } });
		const stackContainer = container.querySelector('.stack-container');
		expect(stackContainer).toBeInTheDocument();
		const cards = container.querySelectorAll('.card-hit-area');
		expect(cards).toHaveLength(0);
	});

	// Cards should have visual card wrapper
	it('each card has a card-wrapper for transforms', () => {
		const { container } = render(CardStack, { props: { cards: testCards } });
		const wrappers = container.querySelectorAll('.card-wrapper');
		expect(wrappers).toHaveLength(3);
	});
});
