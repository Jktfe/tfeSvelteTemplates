/**
 * ============================================================
 * CardStackMotionFlip Tests
 * ============================================================
 *
 * These tests verify that CardStackMotionFlip renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Card deck container exists with correct structure
 *   - Cards display with proper order
 *   - Accessibility attributes are correct
 *   - Top card has correct interaction state
 *   - Images are not draggable (prevents accidental image drag)
 *
 * Run these tests:
 *   bun run test                         - Run once
 *   bun run test:watch                   - Watch mode
 *   bun run test -- CardStackMotionFlip  - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import CardStackMotionFlip from './CardStackMotionFlip.svelte';

// Sample cards for testing
const testCards = [
	{ image: '/test1.jpg', title: 'Card One', content: 'First card content' },
	{ image: '/test2.jpg', title: 'Card Two', content: 'Second card content' },
	{ image: '/test3.jpg', title: 'Card Three', content: 'Third card content' }
];

describe('CardStackMotionFlip', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(CardStackMotionFlip);
		expect(container).toBeTruthy();
	});

	// Container should have the card-deck class
	it('has the card-deck class', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const cardDeck = container.querySelector('.card-deck');
		expect(cardDeck).toBeInTheDocument();
	});

	// Container should have role="region" for accessibility
	it('container has role="region"', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		const region = screen.getByRole('region');
		expect(region).toBeInTheDocument();
	});

	// Container should have descriptive ARIA label
	it('container has descriptive ARIA label', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('aria-label');
		expect(region.getAttribute('aria-label')).toContain('card deck');
	});

	// Should render the correct number of cards
	it('renders all cards', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const cards = container.querySelectorAll('.card-wrapper');
		expect(cards).toHaveLength(3);
	});

	// Cards should have button role for accessibility
	it('cards have button role', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		const buttons = screen.getAllByRole('button');
		expect(buttons.length).toBeGreaterThanOrEqual(3);
	});

	// Each card should have proper ARIA label with position
	it('cards have ARIA labels with position', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		expect(screen.getByLabelText(/Card 1 of 3/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Card 2 of 3/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Card 3 of 3/)).toBeInTheDocument();
	});

	// Top card should be focusable (tabindex="0")
	it('top card is focusable', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		const topCard = screen.getByLabelText(/Card 1 of 3/);
		expect(topCard).toHaveAttribute('tabindex', '0');
	});

	// Non-top cards should not be focusable (tabindex="-1")
	it('non-top cards are not focusable', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		const secondCard = screen.getByLabelText(/Card 2 of 3/);
		const thirdCard = screen.getByLabelText(/Card 3 of 3/);
		expect(secondCard).toHaveAttribute('tabindex', '-1');
		expect(thirdCard).toHaveAttribute('tabindex', '-1');
	});

	// Top card should have the top-card class
	it('first card has top-card class', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const cardWrappers = container.querySelectorAll('.card-wrapper');
		expect(cardWrappers[0]).toHaveClass('top-card');
	});

	// Card content wrapper should exist
	it('cards have card-content wrapper', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const contentWrappers = container.querySelectorAll('.card-content');
		expect(contentWrappers).toHaveLength(3);
	});

	// Card images should have alt text
	it('card images have alt text', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const images = container.querySelectorAll('.card-image');
		images.forEach((img) => {
			expect(img).toHaveAttribute('alt');
		});
	});

	// Card images should not be draggable (prevents accidental image drag)
	it('card images are not draggable', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const images = container.querySelectorAll('.card-image');
		images.forEach((img) => {
			expect(img).toHaveAttribute('draggable', 'false');
		});
	});

	// Card titles should display
	it('displays card titles', () => {
		render(CardStackMotionFlip, { props: { cards: testCards } });
		expect(screen.getByText('Card One')).toBeInTheDocument();
		expect(screen.getByText('Card Two')).toBeInTheDocument();
		expect(screen.getByText('Card Three')).toBeInTheDocument();
	});

	// Card content should display
	it('displays card content', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const cardTexts = container.querySelectorAll('.card-text');
		expect(cardTexts).toHaveLength(3);
	});

	// Card overlay should exist for title/content
	it('cards have overlay for title and content', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: testCards } });
		const overlays = container.querySelectorAll('.card-overlay');
		expect(overlays).toHaveLength(3);
	});

	// Empty cards array should render without errors
	it('handles empty cards array gracefully', () => {
		const { container } = render(CardStackMotionFlip, { props: { cards: [] } });
		const cardDeck = container.querySelector('.card-deck');
		expect(cardDeck).toBeInTheDocument();
		const cards = container.querySelectorAll('.card-wrapper');
		expect(cards).toHaveLength(0);
	});

	// Single card should work correctly
	it('handles single card correctly', () => {
		const singleCard = [{ image: '/test.jpg', title: 'Only Card', content: 'Content' }];
		const { container } = render(CardStackMotionFlip, { props: { cards: singleCard } });
		const cards = container.querySelectorAll('.card-wrapper');
		expect(cards).toHaveLength(1);
		expect(cards[0]).toHaveClass('top-card');
	});

	// Container should have correct width and height from props
	it('respects cardWidth and cardHeight props', () => {
		const { container } = render(CardStackMotionFlip, {
			props: { cards: testCards, cardWidth: 250, cardHeight: 350 }
		});
		const cardDeck = container.querySelector('.card-deck') as HTMLElement;
		expect(cardDeck.style.width).toBe('250px');
		expect(cardDeck.style.height).toBe('350px');
	});

	// Cards without images should still render
	it('renders cards without images', () => {
		const cardsNoImages = [
			{ title: 'No Image', content: 'Just text content' },
			{ title: 'Also No Image', content: 'More text' }
		];
		const { container } = render(CardStackMotionFlip, { props: { cards: cardsNoImages } });
		const cards = container.querySelectorAll('.card-wrapper');
		expect(cards).toHaveLength(2);
		// Should have no images
		const images = container.querySelectorAll('.card-image');
		expect(images).toHaveLength(0);
	});
});
