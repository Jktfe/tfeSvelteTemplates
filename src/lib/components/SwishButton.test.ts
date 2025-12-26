/**
 * ============================================================
 * SwishButton Tests
 * ============================================================
 *
 * These tests verify that SwishButton renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Default text displays correctly
 *   - Custom text prop works
 *   - Button type attribute applies
 *   - Disabled state works
 *   - Click handler fires
 *   - Custom classes can be added
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- SwishButton     - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import SwishButton from './SwishButton.svelte';

describe('SwishButton', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(SwishButton);
		expect(container).toBeTruthy();
	});

	// The button should exist and be a proper button element
	it('renders as a button element', () => {
		render(SwishButton);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	// Default text should be "Button"
	it('displays default text when no text prop provided', () => {
		render(SwishButton);
		// The text appears twice (original + hover state)
		const buttons = screen.getAllByText('Button');
		expect(buttons.length).toBe(2);
	});

	// Custom text should replace the default
	it('displays custom text when text prop is provided', () => {
		render(SwishButton, { props: { text: 'Get Started' } });
		const buttons = screen.getAllByText('Get Started');
		expect(buttons.length).toBe(2);
	});

	// Button should have default type="button"
	it('has type="button" by default', () => {
		render(SwishButton);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'button');
	});

	// Button should accept type="submit"
	it('accepts type="submit" for forms', () => {
		render(SwishButton, { props: { type: 'submit' } });
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'submit');
	});

	// Button should accept type="reset"
	it('accepts type="reset" for forms', () => {
		render(SwishButton, { props: { type: 'reset' } });
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'reset');
	});

	// Disabled state should be applied
	it('can be disabled', () => {
		render(SwishButton, { props: { disabled: true } });
		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
	});

	// Click handler should fire when clicked
	it('calls onclick handler when clicked', async () => {
		const handleClick = vi.fn();
		render(SwishButton, { props: { onclick: handleClick } });
		const button = screen.getByRole('button');

		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	// Custom classes should be added to the button
	it('applies custom classes', () => {
		render(SwishButton, { props: { class: 'my-custom-class' } });
		const button = screen.getByRole('button');
		expect(button).toHaveClass('my-custom-class');
	});

	// Button should contain an SVG icon
	it('contains an SVG icon', () => {
		const { container } = render(SwishButton);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	// The background dot element should exist
	it('has the background dot element for hover effect', () => {
		const { container } = render(SwishButton);
		// The dot has h-2 w-2 classes
		const dot = container.querySelector('.h-2.w-2');
		expect(dot).toBeInTheDocument();
	});
});
