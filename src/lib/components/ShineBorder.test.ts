/**
 * ============================================================
 * ShineBorder Tests
 * ============================================================
 *
 * These tests make sure our shiny border wrapper works correctly.
 *
 * What we're checking:
 *   - It renders without exploding (always a good start!)
 *   - It wraps our content properly
 *   - Custom props like colour and duration actually apply
 *   - The animation styles are set up correctly
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- ShineBorder     - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ShineBorder from './ShineBorder.svelte';

describe('ShineBorder', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(ShineBorder);
		// If we got here without errors, that's a win!
		expect(container).toBeTruthy();
	});

	// The wrapper should have our special class
	it('has the correct wrapper class', () => {
		const { container } = render(ShineBorder);
		const wrapper = container.querySelector('.shine-border-wrapper');

		// This is the magic element that creates the animated border
		expect(wrapper).toBeInTheDocument();
	});

	// Check that our CSS custom properties are applied
	// These control the colour, speed, and size of the shine effect
	it('applies default CSS custom properties', () => {
		const { container } = render(ShineBorder);
		const wrapper = container.querySelector('.shine-border-wrapper') as HTMLElement;

		// The default shine colour is a lovely blue
		expect(wrapper.style.getPropertyValue('--shine-color')).toBe('#146ef5');

		// Default animation takes 3 seconds for one full sweep
		expect(wrapper.style.getPropertyValue('--shine-duration')).toBe('3s');

		// Border is 2 pixels thick by default
		expect(wrapper.style.getPropertyValue('--border-width')).toBe('2px');

		// Corners are slightly rounded by default
		expect(wrapper.style.getPropertyValue('--border-radius')).toBe('8px');
	});

	// Make sure custom props actually change things!
	it('applies custom CSS properties when props are provided', () => {
		const { container } = render(ShineBorder, {
			props: {
				color: '#ff0000',
				duration: 5,
				borderWidth: 4,
				borderRadius: 16
			}
		});
		const wrapper = container.querySelector('.shine-border-wrapper') as HTMLElement;

		// Our custom red colour should be applied
		expect(wrapper.style.getPropertyValue('--shine-color')).toBe('#ff0000');

		// Slower 5-second animation
		expect(wrapper.style.getPropertyValue('--shine-duration')).toBe('5s');

		// Thicker border
		expect(wrapper.style.getPropertyValue('--border-width')).toBe('4px');

		// More rounded corners
		expect(wrapper.style.getPropertyValue('--border-radius')).toBe('16px');
	});

	// The content area should exist (where your stuff goes!)
	it('has a content container', () => {
		const { container } = render(ShineBorder);
		const content = container.querySelector('.shine-border-content');

		// This is where the child content lives
		expect(content).toBeInTheDocument();
	});
});
