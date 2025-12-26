/**
 * ============================================================
 * MagicCard Tests
 * ============================================================
 *
 * These tests verify that MagicCard renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Default content displays when no children provided
 *   - Custom classes can be added
 *   - The spotlight element exists
 *   - Component has proper accessibility role
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- MagicCard       - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import MagicCard from './MagicCard.svelte';

describe('MagicCard', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(MagicCard);
		expect(container).toBeTruthy();
	});

	// Should display default content when no children provided
	it('displays default "Magic Card" text when no children', () => {
		render(MagicCard);
		expect(screen.getByText('Magic Card')).toBeInTheDocument();
	});

	// The container should have the magic-card-container class
	it('has the magic-card-container class', () => {
		const { container } = render(MagicCard);
		const card = container.querySelector('.magic-card-container');
		expect(card).toBeInTheDocument();
	});

	// Custom classes should be added to the container
	it('applies custom classes', () => {
		const { container } = render(MagicCard, { props: { class: 'my-custom-class' } });
		const card = container.querySelector('.magic-card-container');
		expect(card).toHaveClass('my-custom-class');
	});

	// The spotlight element should exist
	it('has the spotlight element for gradient effect', () => {
		const { container } = render(MagicCard);
		const spotlight = container.querySelector('.spotlight');
		expect(spotlight).toBeInTheDocument();
	});

	// Spotlight should have pointer-events-none (doesn't block clicks)
	it('spotlight has pointer-events-none to not block interactions', () => {
		const { container } = render(MagicCard);
		const spotlight = container.querySelector('.spotlight');
		expect(spotlight).toHaveClass('pointer-events-none');
	});

	// Container should have role="region" for accessibility
	it('has role="region" for accessibility', () => {
		render(MagicCard);
		const region = screen.getByRole('region');
		expect(region).toBeInTheDocument();
	});

	// Spotlight should start with opacity 0 (not hovering)
	it('spotlight starts invisible (opacity 0)', () => {
		const { container } = render(MagicCard);
		const spotlight = container.querySelector('.spotlight') as HTMLElement;
		// The opacity is inline style, should be 0 when not hovering
		expect(spotlight.style.opacity).toBe('0');
	});

	// Content should have z-10 class (above spotlight)
	it('content layer has z-10 to sit above spotlight', () => {
		const { container } = render(MagicCard);
		const content = container.querySelector('.z-10');
		expect(content).toBeInTheDocument();
	});

	// Card should have overflow-hidden to contain the spotlight
	it('has overflow-hidden to contain spotlight effect', () => {
		const { container } = render(MagicCard);
		const card = container.querySelector('.magic-card-container');
		expect(card).toHaveClass('overflow-hidden');
	});
});
