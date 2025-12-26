/**
 * ============================================================
 * LinkImageHover Tests
 * ============================================================
 *
 * These tests verify that LinkImageHover renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Link has correct attributes (href, target, rel)
 *   - Props are applied correctly
 *   - Accessibility features work
 *   - Image preview structure is correct
 *
 * Note: Hover interactions and touch detection are difficult to test
 * in jsdom. Full interaction testing is done manually.
 *
 * Run these tests:
 *   bun run test                        - Run once
 *   bun run test:watch                  - Watch mode
 *   bun run test -- LinkImageHover      - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LinkImageHover from './LinkImageHover.svelte';

describe('LinkImageHover', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(LinkImageHover);
		expect(container).toBeTruthy();
	});

	// Should render the link text
	it('renders the link text', () => {
		render(LinkImageHover, { props: { text: 'Test Link' } });
		expect(screen.getByText('Test Link')).toBeInTheDocument();
	});

	// Should render as a link element
	it('renders as an anchor element', () => {
		render(LinkImageHover, { props: { text: 'Test Link' } });
		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
	});

	// Should have correct href attribute
	it('has correct href attribute', () => {
		render(LinkImageHover, { props: { href: 'https://example.com/test' } });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', 'https://example.com/test');
	});

	// Default target should be _blank
	it('defaults to target="_blank"', () => {
		render(LinkImageHover);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('target', '_blank');
	});

	// Custom target should be applied
	it('applies custom target', () => {
		render(LinkImageHover, { props: { target: '_self' } });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('target', '_self');
	});

	// Should have rel="noopener noreferrer" when target="_blank"
	it('has security rel attribute for target="_blank"', () => {
		render(LinkImageHover, { props: { target: '_blank' } });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	// Should NOT have rel when target is not _blank
	it('does not have rel attribute when target is not _blank', () => {
		render(LinkImageHover, { props: { target: '_self' } });
		const link = screen.getByRole('link');
		expect(link).not.toHaveAttribute('rel');
	});

	// Link should have underline class
	it('link has underline class', () => {
		render(LinkImageHover);
		const link = screen.getByRole('link');
		expect(link).toHaveClass('underline');
	});

	// Link should have cursor-pointer class
	it('link has cursor-pointer class', () => {
		render(LinkImageHover);
		const link = screen.getByRole('link');
		expect(link).toHaveClass('cursor-pointer');
	});

	// Container should have relative positioning
	it('container has relative positioning', () => {
		const { container } = render(LinkImageHover);
		const outer = container.querySelector('.relative');
		expect(outer).toBeInTheDocument();
	});

	// Container should have z-50 for stacking
	it('container has z-50 class', () => {
		const { container } = render(LinkImageHover);
		const outer = container.querySelector('.z-50');
		expect(outer).toBeInTheDocument();
	});

	// Container should center content
	it('container centers content', () => {
		const { container } = render(LinkImageHover);
		const outer = container.querySelector('.items-center');
		expect(outer).toBeInTheDocument();
	});

	// Default text should be applied
	it('renders default text when not specified', () => {
		render(LinkImageHover);
		expect(screen.getByText('Link Text')).toBeInTheDocument();
	});

	// Default href should be applied
	it('has default href when not specified', () => {
		render(LinkImageHover);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', 'https://example.com');
	});
});
