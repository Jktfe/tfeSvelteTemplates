/**
 * ============================================================
 * BackToTop Tests
 * ============================================================
 *
 * Two layers:
 *   1. Pure helpers from the module-script — validated against
 *      happy path, edge cases, and non-finite / wrong-type input.
 *   2. Component contract — render + simulated scroll:
 *        ✓ hidden initially (no phantom tab stop)
 *        ✓ appears once scrolled past the threshold
 *        ✓ click scrolls the target back to top (behavior: smooth)
 *        ✓ respects smooth={false} (behavior: auto)
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BackToTop from './BackToTop.svelte';

// happy-dom does not implement the Web Animations API. The `fly` transition on
// the button calls Element.prototype.animate, so give it a no-op stand-in that
// satisfies Svelte's transition engine without throwing.
if (typeof Element.prototype.animate !== 'function') {
	Element.prototype.animate = function animate() {
		return {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			onfinish: null,
			oncancel: null,
			currentTime: 0,
			startTime: 0,
			playState: 'finished',
			effect: null,
			playbackRate: 1
		} as unknown as Animation;
	};
}
import {
	VALID_POSITIONS,
	isValidPosition,
	pickPosition,
	isPastThreshold,
	resolveScrollBehavior,
	readScrollTop,
	isReducedMotion
} from './BackToTop.svelte';

describe('BackToTop — VALID_POSITIONS', () => {
	it('contains the two documented positions', () => {
		expect(VALID_POSITIONS).toEqual(['bottom-right', 'bottom-left']);
	});
});

describe('BackToTop — isValidPosition', () => {
	it('accepts each declared position', () => {
		expect(isValidPosition('bottom-right')).toBe(true);
		expect(isValidPosition('bottom-left')).toBe(true);
	});

	it('rejects unknown strings and non-strings', () => {
		expect(isValidPosition('top-left')).toBe(false);
		expect(isValidPosition('')).toBe(false);
		expect(isValidPosition(undefined)).toBe(false);
		expect(isValidPosition(null)).toBe(false);
		expect(isValidPosition(42)).toBe(false);
	});
});

describe('BackToTop — pickPosition', () => {
	it('returns the input when valid', () => {
		expect(pickPosition('bottom-left')).toBe('bottom-left');
		expect(pickPosition('bottom-right')).toBe('bottom-right');
	});

	it("falls back to 'bottom-right' for invalid input", () => {
		expect(pickPosition('centre')).toBe('bottom-right');
		expect(pickPosition(undefined)).toBe('bottom-right');
		expect(pickPosition(null)).toBe('bottom-right');
		expect(pickPosition(7)).toBe('bottom-right');
	});
});

describe('BackToTop — isPastThreshold', () => {
	it('is false at or before the threshold', () => {
		expect(isPastThreshold(0, 300)).toBe(false);
		expect(isPastThreshold(300, 300)).toBe(false);
		expect(isPastThreshold(299, 300)).toBe(false);
	});

	it('is true once strictly past the threshold', () => {
		expect(isPastThreshold(301, 300)).toBe(true);
		expect(isPastThreshold(1000, 300)).toBe(true);
	});

	it('coerces numeric strings', () => {
		expect(isPastThreshold('500', '300')).toBe(true);
		expect(isPastThreshold('100', '300')).toBe(false);
	});

	it('returns false for non-finite input', () => {
		expect(isPastThreshold(NaN, 300)).toBe(false);
		expect(isPastThreshold(Infinity, 300)).toBe(false);
		expect(isPastThreshold(500, NaN)).toBe(false);
		expect(isPastThreshold(undefined, 300)).toBe(false);
	});
});

describe('BackToTop — resolveScrollBehavior', () => {
	it("returns 'smooth' when requested and motion is allowed", () => {
		expect(resolveScrollBehavior(true, false)).toBe('smooth');
	});

	it("returns 'auto' when smooth is disabled", () => {
		expect(resolveScrollBehavior(false, false)).toBe('auto');
	});

	it("returns 'auto' when reduced motion is set, even if smooth is true", () => {
		expect(resolveScrollBehavior(true, true)).toBe('auto');
		expect(resolveScrollBehavior(false, true)).toBe('auto');
	});
});

describe('BackToTop — readScrollTop', () => {
	it('returns 0 for a null/undefined target', () => {
		expect(readScrollTop(null)).toBe(0);
		expect(readScrollTop(undefined)).toBe(0);
	});

	it('reads scrollTop from an element target', () => {
		const el = { scrollTop: 123 } as HTMLElement;
		expect(readScrollTop(el)).toBe(123);
	});

	it('reads window scroll offset from the window target', () => {
		Object.defineProperty(window, 'scrollY', { value: 456, configurable: true, writable: true });
		expect(readScrollTop(window)).toBe(456);
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
	});
});

describe('BackToTop — isReducedMotion', () => {
	it('returns a boolean without throwing', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('BackToTop — component', () => {
	beforeEach(() => {
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
		window.scrollTo = vi.fn();
	});

	afterEach(() => {
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
		vi.restoreAllMocks();
	});

	it('is hidden initially — no button, so no phantom tab stop', () => {
		render(BackToTop, { props: { threshold: 300 } });
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('appears once scrolled past the threshold', async () => {
		render(BackToTop, { props: { threshold: 300 } });
		expect(screen.queryByRole('button')).toBeNull();

		Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
		await fireEvent.scroll(window);

		const button = await screen.findByRole('button', { name: 'Back to top' });
		expect(button).toBeTruthy();
	});

	it('scrolls the target back to top (smooth) on click', async () => {
		render(BackToTop, { props: { threshold: 300, smooth: true } });

		Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
		await fireEvent.scroll(window);

		const button = await screen.findByRole('button', { name: 'Back to top' });
		await fireEvent.click(button);

		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
	});

	it('scrolls instantly when smooth={false}', async () => {
		render(BackToTop, { props: { threshold: 300, smooth: false } });

		Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
		await fireEvent.scroll(window);

		const button = await screen.findByRole('button', { name: 'Back to top' });
		await fireEvent.click(button);

		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
	});

	it('renders the label as visible text when showLabel is set', async () => {
		render(BackToTop, { props: { threshold: 300, showLabel: true, label: 'Jump up' } });

		Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
		await fireEvent.scroll(window);

		const button = await screen.findByRole('button', { name: 'Jump up' });
		expect(button.textContent).toContain('Jump up');
	});
});
