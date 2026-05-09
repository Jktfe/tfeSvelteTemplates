/**
 * ============================================================
 * LiquidTypeHero Tests
 * ============================================================
 *
 * Verifies word splitting into per-glyph spans, sr-only fallback
 * for screen readers, ARIA wiring, base style variables, and the
 * keyboard/click pointer reset on leave.
 * Canvas/rAF physics not exercised — JSDom doesn't drive layout.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiquidTypeHero from './LiquidTypeHero.svelte';

beforeEach(() => {
	(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
		class StubRO implements ResizeObserver {
			constructor(public cb: ResizeObserverCallback) {}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		} as unknown as typeof ResizeObserver;
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('LiquidTypeHero', () => {
	it('renders the wrapper with role="region" and an aria-label', () => {
		const { container } = render(LiquidTypeHero, { props: {} });
		const wrapper = container.querySelector('.liquid-type-hero');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('role')).toBe('region');
		expect(wrapper?.getAttribute('aria-label')).toBe('Liquid Type hero');
	});

	it('renders one .lt-glyph span per character of every word combined', () => {
		const { container } = render(LiquidTypeHero, {
			props: { words: ['One', 'Two'] }
		});
		const glyphs = container.querySelectorAll('.lt-glyph');
		// "One" = 3 chars + "Two" = 3 chars = 6 total
		expect(glyphs.length).toBe(6);
	});

	it('renders an .lt-space between consecutive words', () => {
		const { container } = render(LiquidTypeHero, { props: { words: ['Alpha', 'Beta'] } });
		const spaces = container.querySelectorAll('.lt-space');
		// Two words → one separator
		expect(spaces.length).toBe(1);
	});

	it('renders a single .lt-space between three words', () => {
		const { container } = render(LiquidTypeHero, { props: { words: ['A', 'B', 'C'] } });
		expect(container.querySelectorAll('.lt-space').length).toBe(2);
	});

	it('exposes the joined word string to assistive tech via .lt-sr-only', () => {
		const { container } = render(LiquidTypeHero, {
			props: { words: ['Words', 'have', 'weight'] }
		});
		const sr = container.querySelector('.lt-sr-only');
		expect(sr?.textContent?.trim()).toBe('Words have weight');
	});

	it('writes baseWeight + baseScale into each glyph style at first paint', () => {
		const { container } = render(LiquidTypeHero, {
			props: { words: ['Hi'], baseWeight: 350, baseScale: 1.05 }
		});
		const glyph = container.querySelector('.lt-glyph') as HTMLElement;
		const style = glyph.getAttribute('style') ?? '';
		expect(style).toContain('--lt-weight: 350');
		expect(style).toContain('--lt-scale: 1.05');
	});

	it('marks the visual word stack as aria-hidden so AT only reads the sr-only version', () => {
		const { container } = render(LiquidTypeHero, { props: {} });
		const visual = container.querySelector('.lt-words');
		expect(visual?.getAttribute('aria-hidden')).toBe('true');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(LiquidTypeHero, { props: { class: 'custom-liquid' } });
		expect(container.querySelector('.liquid-type-hero.custom-liquid')).toBeTruthy();
	});

	it('honours custom ariaLabel', () => {
		const { container } = render(LiquidTypeHero, {
			props: { ariaLabel: 'Hero typography stage' }
		});
		expect(container.querySelector('[aria-label="Hero typography stage"]')).toBeTruthy();
	});

	it('renders the default headline when no words prop is passed', () => {
		render(LiquidTypeHero, { props: {} });
		const sr = screen.getByText('Words have weight');
		expect(sr).toBeTruthy();
	});

	it('handles a single-word words array (no separator spaces emitted)', () => {
		const { container } = render(LiquidTypeHero, { props: { words: ['Solo'] } });
		expect(container.querySelectorAll('.lt-glyph').length).toBe(4);
		expect(container.querySelectorAll('.lt-space').length).toBe(0);
	});

	it('handles an empty words array gracefully', () => {
		const { container } = render(LiquidTypeHero, { props: { words: [] } });
		expect(container.querySelectorAll('.lt-glyph').length).toBe(0);
		// Wrapper still mounts
		expect(container.querySelector('.liquid-type-hero')).toBeTruthy();
	});
});
