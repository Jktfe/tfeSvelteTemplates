/**
 * ============================================================
 * ScratchToReveal Tests
 * ============================================================
 *
 * These tests verify that ScratchToReveal renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Wrapper and structure elements exist
 *   - Skip and reset buttons appear correctly
 *   - Accessibility attributes are correct
 *   - Props are applied correctly
 *   - Progress bar appears when enabled
 *
 * Note: Canvas scratching interactions are difficult to test in jsdom
 * as Canvas 2D context has limited support. These are tested manually.
 *
 * Run these tests:
 *   bun run test                        - Run once
 *   bun run test:watch                  - Watch mode
 *   bun run test -- ScratchToReveal     - Just this file
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ScratchToReveal from './ScratchToReveal.svelte';

describe('ScratchToReveal', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(ScratchToReveal);
		expect(container).toBeTruthy();
	});

	// Wrapper should have correct role for accessibility
	it('wrapper has role="application"', () => {
		render(ScratchToReveal);
		const wrapper = screen.getByRole('application');
		expect(wrapper).toBeInTheDocument();
	});

	// Wrapper should have descriptive aria-label
	it('wrapper has descriptive aria-label', () => {
		render(ScratchToReveal);
		const wrapper = screen.getByRole('application');
		expect(wrapper).toHaveAttribute('aria-label');
		expect(wrapper.getAttribute('aria-label')).toContain('Scratch');
	});

	// Wrapper should be focusable for keyboard interaction
	it('wrapper is focusable', () => {
		render(ScratchToReveal);
		const wrapper = screen.getByRole('application');
		expect(wrapper).toHaveAttribute('tabindex', '0');
	});

	// Skip button should be present by default
	it('shows skip button by default', () => {
		const { container } = render(ScratchToReveal);
		const skipButton = container.querySelector('.skip-button');
		expect(skipButton).toBeInTheDocument();
		expect(skipButton).toHaveTextContent('Skip');
	});

	// Skip button text should be customisable
	it('uses custom skip button text', () => {
		render(ScratchToReveal, { props: { skipText: 'Reveal Now' } });
		expect(screen.getByText('Reveal Now')).toBeInTheDocument();
	});

	// Skip button should not appear when skipText is empty
	it('hides skip button when skipText is empty', () => {
		const { container } = render(ScratchToReveal, { props: { skipText: '' } });
		const skipButton = container.querySelector('.skip-button');
		expect(skipButton).not.toBeInTheDocument();
	});

	// Scratch area container should exist
	it('has scratch-area container', () => {
		const { container } = render(ScratchToReveal);
		const scratchArea = container.querySelector('.scratch-area');
		expect(scratchArea).toBeInTheDocument();
	});

	// Revealed content container should exist
	it('has revealed-content container', () => {
		const { container } = render(ScratchToReveal);
		const revealedContent = container.querySelector('.revealed-content');
		expect(revealedContent).toBeInTheDocument();
	});

	// Canvas should be present initially (before reveal)
	it('has scratch canvas initially', () => {
		const { container } = render(ScratchToReveal);
		const canvas = container.querySelector('canvas');
		expect(canvas).toBeInTheDocument();
	});

	// Canvas should have scratch-canvas class
	it('canvas has scratch-canvas class', () => {
		const { container } = render(ScratchToReveal);
		const canvas = container.querySelector('.scratch-canvas');
		expect(canvas).toBeInTheDocument();
	});

	// Progress bar should be hidden by default
	it('hides progress bar by default', () => {
		const { container } = render(ScratchToReveal);
		const progressContainer = container.querySelector('.progress-container');
		expect(progressContainer).not.toBeInTheDocument();
	});

	// Progress bar should appear when showProgress is true
	it('shows progress bar when enabled', () => {
		const { container } = render(ScratchToReveal, { props: { showProgress: true } });
		const progressContainer = container.querySelector('.progress-container');
		expect(progressContainer).toBeInTheDocument();
	});

	// Progress bar should use custom colour
	it('applies custom progress colour', () => {
		const { container } = render(ScratchToReveal, {
			props: { showProgress: true, progressColor: '#ff0000' }
		});
		const progressBar = container.querySelector('.progress-bar') as HTMLElement;
		expect(progressBar.style.backgroundColor).toBe('rgb(255, 0, 0)');
	});

	// Custom class should be applied to wrapper
	it('applies custom class to wrapper', () => {
		const { container } = render(ScratchToReveal, { props: { class: 'my-custom-class' } });
		const wrapper = container.querySelector('.scratch-to-reveal-wrapper');
		expect(wrapper).toHaveClass('my-custom-class');
	});

	// Disabled state should change cursor
	it('applies not-allowed cursor when disabled', () => {
		const { container } = render(ScratchToReveal, { props: { disabled: true } });
		const canvas = container.querySelector('canvas') as HTMLElement;
		expect(canvas.style.cursor).toBe('not-allowed');
	});

	// Screen reader announcement area should exist
	it('has screen reader announcement area', () => {
		const { container } = render(ScratchToReveal);
		const srOnly = container.querySelector('.sr-only');
		expect(srOnly).toBeInTheDocument();
		expect(srOnly).toHaveAttribute('role', 'status');
		expect(srOnly).toHaveAttribute('aria-live', 'polite');
	});

	// Controls section should exist
	it('has scratch-controls section', () => {
		const { container } = render(ScratchToReveal);
		const controls = container.querySelector('.scratch-controls');
		expect(controls).toBeInTheDocument();
	});

	// Actions container should exist
	it('has actions container', () => {
		const { container } = render(ScratchToReveal);
		const actions = container.querySelector('.actions');
		expect(actions).toBeInTheDocument();
	});

	// Skip button should have correct aria-label
	it('skip button has correct aria-label', () => {
		render(ScratchToReveal);
		const skipButton = screen.getByRole('button', { name: /skip scratching/i });
		expect(skipButton).toBeInTheDocument();
	});
});
