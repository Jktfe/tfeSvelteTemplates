/**
 * ============================================================
 * AnimatedText Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers from the module script (ribbon building, the
 *     wrap-around maths and the trigger rule) — no DOM needed.
 *  2. Rendered behaviour — button vs img semantics, hover / focus /
 *     click / Escape morphing, unique ids across instances, and the
 *     reduced-motion + theming hooks.
 * ============================================================
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AnimatedText, {
	DEFAULT_ANIMATED_TEXT_PATH,
	RIBBON_SEPARATOR,
	buildRibbon,
	wrapDistance,
	ribbonOffset,
	isInteractiveTrigger,
	prefersReducedMotion
} from './AnimatedText.svelte';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubReducedMotion(matches: boolean) {
	vi.stubGlobal('matchMedia', (q: string) => ({
		matches: matches && q.includes('reduce'),
		addEventListener: () => undefined,
		removeEventListener: () => undefined
	}));
}

describe('AnimatedText helpers', () => {
	describe('buildRibbon', () => {
		it('repeats the phrase with a trailing separator on every copy', () => {
			expect(buildRibbon('HI', 3)).toBe(`HI${RIBBON_SEPARATOR}`.repeat(3));
		});

		it('always renders at least one copy', () => {
			expect(buildRibbon('HI', 0)).toBe(`HI${RIBBON_SEPARATOR}`);
			expect(buildRibbon('HI', Number.NaN)).toBe(`HI${RIBBON_SEPARATOR}`);
		});

		it('floors fractional repeat counts', () => {
			expect(buildRibbon('A', 2.9)).toBe(`A${RIBBON_SEPARATOR}`.repeat(2));
		});

		it('returns an empty string for empty text', () => {
			expect(buildRibbon('', 4)).toBe('');
		});
	});

	describe('wrapDistance', () => {
		it('wraps distances into [0, loop)', () => {
			expect(wrapDistance(0, 100)).toBe(0);
			expect(wrapDistance(50, 100)).toBe(50);
			expect(wrapDistance(250, 100)).toBe(50);
		});

		it('handles negative distances', () => {
			expect(wrapDistance(-25, 100)).toBe(75);
		});

		it('returns 0 when the loop is unknown or invalid', () => {
			expect(wrapDistance(42, 0)).toBe(0);
			expect(wrapDistance(42, -10)).toBe(0);
			expect(wrapDistance(Number.POSITIVE_INFINITY, 100)).toBe(0);
		});
	});

	describe('ribbonOffset', () => {
		it('slides left from 0 towards -loop', () => {
			expect(ribbonOffset(0, 100, 'left')).toBe(0);
			expect(ribbonOffset(30, 100, 'left')).toBe(-30);
			expect(ribbonOffset(130, 100, 'left')).toBe(-30);
		});

		it('slides right from -loop back towards 0', () => {
			expect(ribbonOffset(0, 100, 'right')).toBe(-100);
			expect(ribbonOffset(30, 100, 'right')).toBe(-70);
		});

		it('stays at 0 before the ribbon has been measured', () => {
			expect(ribbonOffset(500, 0, 'left')).toBe(0);
			expect(ribbonOffset(500, 0, 'right')).toBe(0);
		});

		it('never leaves the one-copy window', () => {
			for (let d = 0; d < 1000; d += 37) {
				const left = ribbonOffset(d, 120, 'left');
				const right = ribbonOffset(d, 120, 'right');
				expect(left).toBeLessThanOrEqual(0);
				expect(left).toBeGreaterThan(-120);
				expect(right).toBeLessThanOrEqual(0);
				expect(right).toBeGreaterThanOrEqual(-120);
			}
		});
	});

	describe('isInteractiveTrigger', () => {
		it('is interactive for hover and click when there is a morph phrase', () => {
			expect(isInteractiveTrigger('hover', true)).toBe(true);
			expect(isInteractiveTrigger('click', true)).toBe(true);
		});

		it('is never interactive for none, or without a morph phrase', () => {
			expect(isInteractiveTrigger('none', true)).toBe(false);
			expect(isInteractiveTrigger('hover', false)).toBe(false);
		});
	});

	describe('prefersReducedMotion', () => {
		it('reads the media query', () => {
			stubReducedMotion(true);
			expect(prefersReducedMotion()).toBe(true);
		});

		it('returns false when matchMedia throws', () => {
			vi.stubGlobal('matchMedia', () => {
				throw new Error('nope');
			});
			expect(prefersReducedMotion()).toBe(false);
		});
	});
});

describe('AnimatedText component', () => {
	it('renders an aria-pressed button when there is a morph phrase', () => {
		render(AnimatedText, { originalText: 'Static', morphedText: 'Signal' });
		const button = screen.getByRole('button', { name: 'Static — Signal' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(button).toHaveAttribute('type', 'button');
	});

	it('falls back to role="img" when there is nothing to morph into', () => {
		render(AnimatedText, { originalText: 'Only one' });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByRole('img', { name: 'Only one' })).toBeInTheDocument();
	});

	it('renders role="img" in trigger="none" mode and names it after the current phrase', () => {
		render(AnimatedText, {
			originalText: 'Resting',
			morphedText: 'Revealed',
			trigger: 'none',
			morphed: true
		});
		expect(screen.getByRole('img', { name: 'Revealed' })).toBeInTheDocument();
	});

	it('honours an explicit label', () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B', label: 'Brand ribbon' });
		expect(screen.getByRole('button', { name: 'Brand ribbon' })).toBeInTheDocument();
	});

	it('hides the decorative SVG from assistive tech', () => {
		const { container } = render(AnimatedText, { originalText: 'A', morphedText: 'B' });
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	});

	it('repeats the phrase along the path', () => {
		const { container } = render(AnimatedText, { originalText: 'Hello', repeat: 3 });
		const textPath = container.querySelector('.at-layer--original textPath');
		expect(textPath?.textContent).toBe(buildRibbon('Hello', 3));
	});

	it('uses the default path when none is supplied, and a custom one when it is', async () => {
		const { container, rerender } = render(AnimatedText, { originalText: 'A' });
		expect(container.querySelector('path')).toHaveAttribute('d', DEFAULT_ANIMATED_TEXT_PATH);
		await rerender({ originalText: 'A', path: 'M 0 150 L 1200 150' });
		expect(container.querySelector('path')).toHaveAttribute('d', 'M 0 150 L 1200 150');
	});

	it('gives every instance its own path id so textPaths never cross-wire', () => {
		const first = render(AnimatedText, { originalText: 'One' });
		const second = render(AnimatedText, { originalText: 'Two' });
		const idA = first.container.querySelector('path')?.getAttribute('id');
		const idB = second.container.querySelector('path')?.getAttribute('id');
		expect(idA).toBeTruthy();
		expect(idB).toBeTruthy();
		expect(idA).not.toBe(idB);
		expect(first.container.querySelector('textPath')).toHaveAttribute('href', `#${idA}`);
		expect(second.container.querySelector('textPath')).toHaveAttribute('href', `#${idB}`);
	});

	it('morphs on mouse hover and resets on leave', async () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B' });
		const button = screen.getByRole('button');
		await fireEvent.pointerEnter(button, { pointerType: 'mouse' });
		expect(button).toHaveAttribute('aria-pressed', 'true');
		await fireEvent.pointerLeave(button, { pointerType: 'mouse' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('does not undo a hover morph when the hovering mouse clicks', async () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B' });
		const button = screen.getByRole('button');
		await fireEvent.pointerEnter(button, { pointerType: 'mouse' });
		await fireEvent.click(button, { detail: 1 });
		expect(button).toHaveAttribute('aria-pressed', 'true');
	});

	it('toggles on click / keyboard activation in click mode', async () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B', trigger: 'click' });
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(button).toHaveAttribute('aria-pressed', 'true');
		expect(button).toHaveAttribute('data-morphed', 'true');
		await fireEvent.click(button);
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('ignores hover in click mode', async () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B', trigger: 'click' });
		const button = screen.getByRole('button');
		await fireEvent.pointerEnter(button, { pointerType: 'mouse' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('Escape resets a morphed ribbon', async () => {
		render(AnimatedText, { originalText: 'A', morphedText: 'B', trigger: 'click' });
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		await fireEvent.keyDown(button, { key: 'Escape' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('cross-fades by hiding the inactive layer', async () => {
		const { container } = render(AnimatedText, {
			originalText: 'A',
			morphedText: 'B',
			trigger: 'click'
		});
		const original = container.querySelector('.at-layer--original');
		const morph = container.querySelector('.at-layer--morph');
		expect(original).not.toHaveClass('at-layer--hidden');
		expect(morph).toHaveClass('at-layer--hidden');
		await fireEvent.click(screen.getByRole('button'));
		expect(original).toHaveClass('at-layer--hidden');
		expect(morph).not.toHaveClass('at-layer--hidden');
	});

	it('applies the height as a CSS custom property and forwards class', () => {
		const { container } = render(AnimatedText, {
			originalText: 'A',
			height: 320,
			class: 'my-ribbon'
		});
		const root = container.querySelector('.at-root') as HTMLElement;
		expect(root).toHaveClass('my-ribbon');
		expect(root.style.getPropertyValue('--at-height')).toBe('320px');
	});

	it('does not start the drift loop when the user prefers reduced motion', () => {
		stubReducedMotion(true);
		const raf = vi.fn(() => 1);
		vi.stubGlobal('requestAnimationFrame', raf);
		render(AnimatedText, { originalText: 'A', morphedText: 'B' });
		expect(raf).not.toHaveBeenCalled();
	});

	it('does not start the drift loop when paused', () => {
		const raf = vi.fn(() => 1);
		vi.stubGlobal('requestAnimationFrame', raf);
		render(AnimatedText, { originalText: 'A', paused: true });
		expect(raf).not.toHaveBeenCalled();
	});

	it('starts the drift loop when motion is allowed', () => {
		stubReducedMotion(false);
		const raf = vi.fn(() => 1);
		vi.stubGlobal('requestAnimationFrame', raf);
		vi.stubGlobal('cancelAnimationFrame', () => undefined);
		render(AnimatedText, { originalText: 'A' });
		expect(raf).toHaveBeenCalled();
	});
});
