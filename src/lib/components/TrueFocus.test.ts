/**
 * ============================================================
 * TrueFocus Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers (splitWords, cycleNext, padRect,
 *     buildIndicatorStyle) — exported from the module-script.
 *     Pass deterministic rng to assert maths exactly.
 *  2. Component render — mount the phrase, confirm each word is
 *     a button-roled, focusable span and the focus-box element
 *     is present + decorative.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import TrueFocus, {
	buildIndicatorStyle,
	cycleNext,
	padRect,
	splitWords
} from './TrueFocus.svelte';

afterEach(() => {
	cleanup();
});

describe('TrueFocus helpers', () => {
	describe('splitWords', () => {
		it('returns [] for an empty string', () => {
			expect(splitWords('')).toEqual([]);
		});

		it('returns [] for whitespace-only input', () => {
			expect(splitWords('   \t\n ')).toEqual([]);
		});

		it('splits on single spaces', () => {
			expect(splitWords('Hello world')).toEqual(['Hello', 'world']);
		});

		it('collapses runs of whitespace (no empty strings in output)', () => {
			expect(splitWords('one   two\t\tthree')).toEqual(['one', 'two', 'three']);
		});

		it('keeps hyphenated words intact (treats them as one token)', () => {
			expect(splitWords('co-op fund-raise post-IPO')).toEqual([
				'co-op',
				'fund-raise',
				'post-IPO'
			]);
		});

		it('does not include trailing whitespace on any word (the separator lives outside the word span)', () => {
			// Why this matters: the focus indicator measures each word
			// span via getBoundingClientRect(). If splitWords leaked a
			// trailing space into a token, the box would draw too wide.
			for (const w of splitWords('  leading   middle\ttrailing  ')) {
				expect(w).toBe(w.trim());
				expect(/\s/.test(w)).toBe(false);
			}
		});
	});

	describe('cycleNext', () => {
		it('returns 0 when total is 0 (defensive — never throws)', () => {
			expect(cycleNext(0, 0, 'sequential')).toBe(0);
		});

		it('returns 0 when total is 1 (only one word — no cycling possible)', () => {
			expect(cycleNext(0, 1, 'sequential')).toBe(0);
			expect(cycleNext(0, 1, 'random')).toBe(0);
		});

		it('"sequential" increments and wraps at total', () => {
			expect(cycleNext(0, 3, 'sequential')).toBe(1);
			expect(cycleNext(1, 3, 'sequential')).toBe(2);
			expect(cycleNext(2, 3, 'sequential')).toBe(0);
		});

		it('"random" picks a different index than the current one', () => {
			// rng → 0 always tries index 0; if current is 0 we should NOT stay
			expect(cycleNext(0, 3, 'random', () => 0)).not.toBe(0);
		});

		it('"random" returns a valid index inside [0, total)', () => {
			let i = 0;
			const seq = [0, 0.34, 0.66, 0.99, 0.5];
			const rng = () => seq[i++ % seq.length];
			for (let j = 0; j < 20; j++) {
				const out = cycleNext(j % 5, 5, 'random', rng);
				expect(out).toBeGreaterThanOrEqual(0);
				expect(out).toBeLessThan(5);
			}
		});
	});

	describe('padRect', () => {
		it('expands the rect outwards by paddingX/paddingY', () => {
			const r = padRect({ left: 10, top: 20, width: 100, height: 30 }, 8, 4);
			expect(r).toEqual({ left: 2, top: 16, width: 116, height: 38 });
		});

		it('handles zero padding as a no-op', () => {
			const r = padRect({ left: 0, top: 0, width: 50, height: 20 }, 0, 0);
			expect(r).toEqual({ left: 0, top: 0, width: 50, height: 20 });
		});

		it('accepts negative padding to shrink the rect', () => {
			const r = padRect({ left: 10, top: 10, width: 100, height: 50 }, -5, -2);
			expect(r).toEqual({ left: 15, top: 12, width: 90, height: 46 });
		});
	});

	describe('buildIndicatorStyle', () => {
		const rect = { left: 12, top: 4, width: 80, height: 24 };

		it('emits transform / width / height / border-color', () => {
			const out = buildIndicatorStyle(rect, '#4338ca', false);
			expect(out).toContain('transform: translate3d(12px, 4px, 0)');
			expect(out).toContain('width: 80px');
			expect(out).toContain('height: 24px');
			expect(out).toContain('border-color: #4338ca');
		});

		it('omits the box-shadow when glow is false', () => {
			const out = buildIndicatorStyle(rect, '#000', false);
			expect(out).not.toContain('box-shadow');
		});

		it('includes a translucent box-shadow halo when glow is true', () => {
			const out = buildIndicatorStyle(rect, '#0ea5e9', true);
			expect(out).toContain('box-shadow');
			expect(out).toContain('#0ea5e9');
		});

		it('uses the GPU-friendly translate3d form (not "translate")', () => {
			const out = buildIndicatorStyle(rect, '#000', false);
			expect(out).toContain('translate3d');
			expect(out).not.toMatch(/transform:\s*translate\(/);
		});
	});
});

describe('TrueFocus component', () => {
	it('renders each word as a separate span', () => {
		const { container } = render(TrueFocus, { props: { text: 'Three little words' } });
		const wordEls = container.querySelectorAll('.word');
		expect(wordEls).toHaveLength(3);
		expect(wordEls[0].textContent?.trim()).toBe('Three');
		expect(wordEls[1].textContent?.trim()).toBe('little');
		expect(wordEls[2].textContent?.trim()).toBe('words');
	});

	it('marks each word with role="button" and tabindex="0" so keyboard users can pin', () => {
		const { container } = render(TrueFocus, { props: { text: 'Pinnable phrase' } });
		const wordEls = container.querySelectorAll('.word');
		for (const el of wordEls) {
			expect(el.getAttribute('role')).toBe('button');
			expect(el.getAttribute('tabindex')).toBe('0');
		}
	});

	it('renders a single decorative focus-box element (aria-hidden)', () => {
		const { container } = render(TrueFocus, { props: { text: 'Focused' } });
		const boxes = container.querySelectorAll('.focus-box');
		expect(boxes).toHaveLength(1);
		expect(boxes[0].getAttribute('aria-hidden')).toBe('true');
	});

	it('omits the focus-box when text is empty (nothing to highlight)', () => {
		const { container } = render(TrueFocus, { props: { text: '' } });
		expect(container.querySelector('.focus-box')).toBeNull();
	});

	it('appends user-supplied class names to the wrapper', () => {
		const { container } = render(TrueFocus, {
			props: { text: 'styled', class: 'hero display-2' }
		});
		const wrapper = container.querySelector('.true-focus');
		expect(wrapper).not.toBeNull();
		expect(wrapper?.classList.contains('hero')).toBe(true);
		expect(wrapper?.classList.contains('display-2')).toBe(true);
	});

	it('keeps the phrase readable as a single concatenated string', () => {
		const { container } = render(TrueFocus, { props: { text: 'Read me as one' } });
		const wrapper = container.querySelector('.true-focus');
		// Words are split across spans for the focus indicator, but the
		// wrapper's textContent (with whitespace normalised) reads as one
		// continuous string — that's what assistive tech sees.
		const flat = wrapper?.textContent?.replace(/\s+/g, ' ').trim();
		expect(flat).toBe('Read me as one');
	});
});
