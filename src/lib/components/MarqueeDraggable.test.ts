/**
 * ============================================================
 * MarqueeDraggable Tests
 * ============================================================
 *
 * These tests verify that MarqueeDraggable renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Container has correct structure and classes
 *   - Props are applied correctly (vertical, reverse, dragEnabled)
 *   - Accessibility attributes are present
 *   - Drag-related classes are applied
 *
 * Note: RAF-based animations and pointer events are difficult to test
 * in jsdom. Full interaction testing is done manually.
 *
 * Run these tests:
 *   bun run test                         - Run once
 *   bun run test:watch                   - Watch mode
 *   bun run test -- MarqueeDraggable     - Just this file
 *
 * ============================================================
 */

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import MarqueeDraggable from './MarqueeDraggable.svelte';

describe('MarqueeDraggable', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(MarqueeDraggable);
		expect(container).toBeTruthy();
	});

	// Container should have region role for accessibility
	it('has role="region"', () => {
		render(MarqueeDraggable);
		const region = screen.getByRole('region');
		expect(region).toBeInTheDocument();
	});

	// Container should have descriptive aria-label
	it('has aria-label for screen readers', () => {
		render(MarqueeDraggable);
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('aria-label', 'Draggable scrolling content');
	});

	// Should have overflow-hidden class
	it('container has overflow-hidden', () => {
		const { container } = render(MarqueeDraggable);
		const outer = container.querySelector('.overflow-hidden');
		expect(outer).toBeInTheDocument();
	});

	// Default should be horizontal
	it('defaults to horizontal layout', () => {
		const { container } = render(MarqueeDraggable);
		// Check for flex-row in the inner animate container
		const flexRow = container.querySelector('.flex-row');
		expect(flexRow).toBeInTheDocument();
	});

	// Vertical prop should change layout
	it('applies vertical layout when vertical=true', () => {
		const { container } = render(MarqueeDraggable, { props: { vertical: true } });
		const flexCol = container.querySelector('.flex-col');
		expect(flexCol).toBeInTheDocument();
	});

	// Should create at least 4 content copies for infinite scroll (safety floor)
	it('creates minimum 4 copies for infinite scroll', () => {
		const { container } = render(MarqueeDraggable);
		const copies = container.querySelectorAll('.shrink-0');
		expect(copies.length).toBeGreaterThanOrEqual(4);
	});

	// Note: touch-action tests removed - jsdom doesn't evaluate Svelte's
	// template interpolation in style attributes. Manual browser testing confirms
	// touch-action: pan-y (horizontal) and pan-x (vertical) work correctly.

	// User-select should be none to prevent text selection during drag
	it('has user-select: none', () => {
		render(MarqueeDraggable);
		const region = screen.getByRole('region');
		expect(region).toHaveStyle('user-select: none');
	});

	// Should have grab cursor when drag is enabled
	it('has grab cursor when dragEnabled=true', () => {
		const { container } = render(MarqueeDraggable, { props: { dragEnabled: true } });
		const animateEl = container.querySelector('[role="presentation"]');
		expect(animateEl).toHaveStyle('cursor: grab');
	});

	// Custom class should be applied
	it('applies custom class to container', () => {
		render(MarqueeDraggable, { props: { class: 'my-custom-class' } });
		const region = screen.getByRole('region');
		expect(region).toHaveClass('my-custom-class');
	});

	// Inner element should have will-change for GPU optimization
	it('has will-change transform for GPU optimization', () => {
		const { container } = render(MarqueeDraggable);
		const animateEl = container.querySelector('[role="presentation"]');
		expect(animateEl).toHaveStyle('will-change: transform');
	});

	// Presentation role on inner element
	it('inner element has role="presentation"', () => {
		render(MarqueeDraggable);
		const presentation = screen.getByRole('presentation');
		expect(presentation).toBeInTheDocument();
	});

	// Should have flex display on inner content
	it('inner containers use flexbox', () => {
		const { container } = render(MarqueeDraggable);
		const flexElements = container.querySelectorAll('.flex');
		expect(flexElements.length).toBeGreaterThan(0);
	});

	// Should have gap between items
	it('has gap between items', () => {
		const { container } = render(MarqueeDraggable);
		const gapElements = container.querySelectorAll('[class*="gap"]');
		expect(gapElements.length).toBeGreaterThan(0);
	});
});

/**
 * Motion + keyboard behaviour. happy-dom reports every element as 0px wide,
 * which would keep the RAF loop idle regardless of preference, so we stub a
 * non-zero offsetWidth to give the animation something to move.
 */
describe('MarqueeDraggable motion preferences and keyboard control', () => {
	let widthSpy: ReturnType<typeof vi.spyOn>;
	let reducedMotion = false;
	const listeners = new Set<(e: MediaQueryListEvent) => void>();
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		reducedMotion = false;
		listeners.clear();
		widthSpy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: query.includes('reduce') ? reducedMotion : false,
			media: query,
			addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
			removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
				listeners.delete(cb)
		})) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		widthSpy.mockRestore();
		window.matchMedia = originalMatchMedia;
	});

	const getTransform = (container: HTMLElement) =>
		(container.querySelector('[role="presentation"]') as HTMLElement).style.transform;

	// Let onMount's measuring frame run, then a few more animation frames.
	const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

	it('auto-scrolls when the user has no motion preference', async () => {
		const { container } = render(MarqueeDraggable, { props: { duration: 1 } });
		await settle();
		const first = getTransform(container);
		await settle();
		expect(getTransform(container)).not.toBe(first);
	});

	it('does not auto-scroll under prefers-reduced-motion: reduce', async () => {
		reducedMotion = true;
		const { container } = render(MarqueeDraggable, { props: { duration: 1 } });
		await settle();
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('data-reduced-motion', 'true');
		const first = getTransform(container);
		await settle();
		expect(getTransform(container)).toBe(first);
	});

	it('stops auto-scrolling when the preference flips to reduce mid-session', async () => {
		const { container } = render(MarqueeDraggable, { props: { duration: 1 } });
		await settle();
		for (const cb of listeners) cb({ matches: true } as MediaQueryListEvent);
		await settle();
		const paused = getTransform(container);
		await settle();
		expect(getTransform(container)).toBe(paused);
	});

	it('still allows dragging under reduced motion', async () => {
		reducedMotion = true;
		const { container } = render(MarqueeDraggable);
		await settle();
		const strip = container.querySelector('[role="presentation"]') as HTMLElement;
		strip.setPointerCapture = vi.fn();
		strip.releasePointerCapture = vi.fn();
		const before = getTransform(container);
		await fireEvent.pointerDown(strip, { clientX: 100, clientY: 0, pointerId: 1 });
		await fireEvent.pointerMove(strip, { clientX: 40, clientY: 0, pointerId: 1 });
		expect(getTransform(container)).not.toBe(before);
		await fireEvent.pointerUp(strip, { clientX: 40, clientY: 0, pointerId: 1 });
		const released = getTransform(container);
		await settle();
		expect(getTransform(container)).toBe(released);
	});

	it('is focusable and nudges the strip with the arrow keys', async () => {
		reducedMotion = true;
		const { container } = render(MarqueeDraggable);
		await settle();
		const region = screen.getByRole('region');
		expect(region).toHaveAttribute('tabindex', '0');
		const before = getTransform(container);
		await fireEvent.keyDown(region, { key: 'ArrowRight' });
		const afterRight = getTransform(container);
		expect(afterRight).not.toBe(before);
		await fireEvent.keyDown(region, { key: 'ArrowLeft' });
		expect(getTransform(container)).toBe(before);
	});

	it('pauses auto-scroll while the region has keyboard focus', async () => {
		const { container } = render(MarqueeDraggable, { props: { duration: 1 } });
		await settle();
		const region = screen.getByRole('region');
		await fireEvent.focusIn(region);
		await settle();
		const paused = getTransform(container);
		await settle();
		expect(getTransform(container)).toBe(paused);
		await fireEvent.focusOut(region, { relatedTarget: null });
		await settle();
		expect(getTransform(container)).not.toBe(paused);
	});
});
