/**
 * ============================================================
 * Marquee Tests
 * ============================================================
 *
 * These tests verify that Marquee renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Container has correct structure and classes
 *   - Props are applied correctly (repeat, vertical, reverse)
 *   - Accessibility attributes are present
 *   - Animation classes are applied based on props
 *
 * Note: CSS animations are difficult to test in jsdom.
 * Visual animation testing is done manually.
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- Marquee         - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Marquee from './Marquee.svelte';

describe('Marquee', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(Marquee);
		expect(container).toBeTruthy();
	});

	// Container should have region role for accessibility
	it('has role="region"', () => {
		render(Marquee);
		const region = screen.getByRole('region');
		expect(region).toBeInTheDocument();
	});

	// Container should have descriptive aria-label
	it('has aria-label for screen readers', () => {
		render(Marquee);
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('aria-label', 'Scrolling content');
	});

	// Default creates 4 copies minimum (safety floor), auto-calculates more in real browser
	// In jsdom, DOM measurements aren't available so it stays at the default
	it('creates minimum 4 copies by default', () => {
		const { container } = render(Marquee);
		const copies = container.querySelectorAll('.animate-marquee');
		expect(copies.length).toBeGreaterThanOrEqual(4);
	});

	// Custom repeat count should work (when above minimum floor of 4)
	it('respects custom repeat count when above minimum', () => {
		const { container } = render(Marquee, { props: { repeat: 6 } });
		const copies = container.querySelectorAll('.animate-marquee');
		expect(copies.length).toBeGreaterThanOrEqual(6);
	});

	// Container should have overflow-hidden class
	it('container has overflow-hidden', () => {
		const { container } = render(Marquee);
		const outer = container.querySelector('.overflow-hidden');
		expect(outer).toBeInTheDocument();
	});

	// Default should be horizontal (flex-row)
	it('defaults to horizontal layout', () => {
		render(Marquee);
		const region = screen.getByRole('region');
		expect(region).toHaveClass('flex-row');
	});

	// Vertical prop should change to flex-col
	it('applies vertical layout when vertical=true', () => {
		render(Marquee, { props: { vertical: true } });
		const region = screen.getByRole('region');
		expect(region).toHaveClass('flex-col');
	});

	// Vertical should use marquee-vertical animation
	it('uses vertical animation class when vertical=true', () => {
		const { container } = render(Marquee, { props: { vertical: true } });
		const copies = container.querySelectorAll('.animate-marquee-vertical');
		expect(copies.length).toBeGreaterThanOrEqual(4);
	});

	// Reverse should apply animation-direction reverse
	it('applies reverse direction when reverse=true', () => {
		const { container } = render(Marquee, { props: { reverse: true } });
		const copies = container.querySelectorAll('[class*="animation-direction"]');
		expect(copies.length).toBeGreaterThanOrEqual(4);
	});

	// Duration should be set as CSS custom property
	it('sets duration as CSS variable', () => {
		render(Marquee, { props: { duration: 30 } });
		const region = screen.getByRole('region');
		expect(region).toHaveStyle('--duration: 30s');
	});

	// Default duration should be 40s
	it('has default duration of 40s', () => {
		render(Marquee);
		const region = screen.getByRole('region');
		expect(region).toHaveStyle('--duration: 40s');
	});

	// PauseOnHover should add group-hover class
	it('adds pause-on-hover class when pauseOnHover=true', () => {
		const { container } = render(Marquee, { props: { pauseOnHover: true } });
		const pauseElements = container.querySelectorAll('[class*="group-hover"]');
		expect(pauseElements.length).toBeGreaterThan(0);
	});

	// Custom class should be applied
	it('applies custom class to container', () => {
		render(Marquee, { props: { class: 'my-custom-class' } });
		const region = screen.getByRole('region');
		expect(region).toHaveClass('my-custom-class');
	});

	// Inner items should have shrink-0 to prevent compression
	it('inner items have shrink-0 class', () => {
		const { container } = render(Marquee);
		const items = container.querySelectorAll('.shrink-0');
		expect(items.length).toBeGreaterThanOrEqual(4);
	});

	// Container should use flexbox
	it('container uses flexbox', () => {
		render(Marquee);
		const region = screen.getByRole('region');
		expect(region).toHaveClass('flex');
	});

	// Gap should be set via CSS custom property
	it('has gap CSS custom property', () => {
		const { container } = render(Marquee);
		const withGap = container.querySelector('[class*="--gap"]');
		expect(withGap).toBeInTheDocument();
	});
});
