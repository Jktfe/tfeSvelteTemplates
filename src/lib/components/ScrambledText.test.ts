/**
 * ============================================================
 * ScrambledText Tests
 * ============================================================
 *
 * Two layers of coverage:
 *  1. Pure helpers (pickScrambleChar, computeSettleTimes,
 *     getDisplayString, isScrambleComplete) — exported from
 *     the component's module-script block. We pass deterministic
 *     `rng` callbacks so the maths is fully reproducible.
 *  2. Component render — confirms the wrapper mounts, the final
 *     text always reaches aria-label, and the visible text node
 *     is aria-hidden.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, screen, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import ScrambledText, {
	DEFAULT_SCRAMBLE_POOL,
	computeSettleTimes,
	getDisplayString,
	isScrambleComplete,
	pickScrambleChar
} from './ScrambledText.svelte';

afterEach(() => {
	cleanup();
});

describe('ScrambledText helpers', () => {
	describe('pickScrambleChar', () => {
		it('returns the first pool character when rng yields 0', () => {
			expect(pickScrambleChar('ABC', () => 0)).toBe('A');
		});

		it('returns the last pool character when rng yields just-under 1', () => {
			expect(pickScrambleChar('ABC', () => 0.999999)).toBe('C');
		});

		it('returns the middle pool character when rng yields 0.5', () => {
			// Math.floor(0.5 * 3) === 1 → index 1
			expect(pickScrambleChar('ABC', () => 0.5)).toBe('B');
		});

		it('returns empty string for an empty pool (defensive — never throws)', () => {
			expect(pickScrambleChar('', () => 0)).toBe('');
		});

		it('uses Math.random by default (smoke check — char is in pool)', () => {
			const out = pickScrambleChar('XYZ');
			expect('XYZ').toContain(out);
		});
	});

	describe('computeSettleTimes', () => {
		it('returns [] for length 0', () => {
			expect(computeSettleTimes(0, 1000, 'left-to-right')).toEqual([]);
		});

		it('returns [duration] for length 1 in any order', () => {
			expect(computeSettleTimes(1, 1500, 'left-to-right')).toEqual([1500]);
			expect(computeSettleTimes(1, 1500, 'random')).toEqual([1500]);
		});

		it('spaces "left-to-right" times evenly so the final char settles at exactly duration', () => {
			const out = computeSettleTimes(4, 1000, 'left-to-right');
			expect(out).toEqual([250, 500, 750, 1000]);
		});

		it('"left-to-right" never lands a settle time before its predecessor', () => {
			const out = computeSettleTimes(10, 2000, 'left-to-right');
			for (let i = 1; i < out.length; i++) {
				expect(out[i]).toBeGreaterThan(out[i - 1]);
			}
			expect(out[out.length - 1]).toBe(2000);
		});

		it('"random" produces values within [0, duration] for every char', () => {
			const out = computeSettleTimes(50, 800, 'random');
			expect(out).toHaveLength(50);
			for (const t of out) {
				expect(t).toBeGreaterThanOrEqual(0);
				expect(t).toBeLessThanOrEqual(800);
			}
		});

		it('"random" with a deterministic rng produces a stable sequence', () => {
			let i = 0;
			const seq = [0.1, 0.5, 0.9];
			const rng = () => seq[i++ % seq.length];
			const out = computeSettleTimes(3, 1000, 'random', rng);
			expect(out).toEqual([100, 500, 900]);
		});
	});

	describe('getDisplayString', () => {
		it('returns the final text when elapsed is past every settle time', () => {
			const text = 'HELLO';
			const settleTimes = [100, 200, 300, 400, 500];
			const out = getDisplayString(text, settleTimes, 999, DEFAULT_SCRAMBLE_POOL, () => 0);
			expect(out).toBe('HELLO');
		});

		it('returns scramble glyphs when elapsed is before every settle time', () => {
			// rng → 0 always, so every scrambled char is pool[0] (= 'A')
			const text = 'CAT';
			const settleTimes = [100, 200, 300];
			const out = getDisplayString(text, settleTimes, 0, 'AB', () => 0);
			expect(out).toBe('AAA');
		});

		it('reveals settled chars while still scrambling un-settled ones', () => {
			const text = 'CAT';
			const settleTimes = [50, 200, 400];
			// elapsed=100 → 'C' settled, others still scrambling (rng=0 → 'X')
			const out = getDisplayString(text, settleTimes, 100, 'X', () => 0);
			expect(out).toBe('CXX');
		});

		it('preserves spaces verbatim regardless of elapsed time', () => {
			const text = 'A B C';
			const settleTimes = [100, 0, 200, 0, 300];
			const out = getDisplayString(text, settleTimes, 0, 'Z', () => 0);
			// Every non-space slot is scrambled to 'Z'; spaces stay as ' '
			expect(out).toBe('Z Z Z');
		});

		it('handles empty text without throwing', () => {
			expect(getDisplayString('', [], 0, DEFAULT_SCRAMBLE_POOL)).toBe('');
		});

		it('treats a missing settle time as 0 (so the char is shown immediately)', () => {
			const text = 'AB';
			// settleTimes only covers the first char
			const out = getDisplayString(text, [500], 100, 'Z', () => 0);
			// 'A' not yet settled (100 < 500) → 'Z'; 'B' has no entry → settles at 0 → revealed
			expect(out).toBe('ZB');
		});
	});

	describe('isScrambleComplete', () => {
		it('reports complete for an empty settle list (nothing to wait for)', () => {
			expect(isScrambleComplete([], 0)).toBe(true);
		});

		it('reports incomplete while elapsed is below the largest settle time', () => {
			expect(isScrambleComplete([100, 200, 300], 250)).toBe(false);
		});

		it('reports complete once elapsed meets every settle time', () => {
			expect(isScrambleComplete([100, 200, 300], 300)).toBe(true);
		});

		it('reports complete when elapsed exceeds every settle time', () => {
			expect(isScrambleComplete([100, 200, 300], 9999)).toBe(true);
		});
	});
});

describe('ScrambledText component', () => {
	it('mounts with the final text reachable via aria-label', () => {
		render(ScrambledText, { props: { text: 'DECODED' } });
		const labelled = screen.getByLabelText('DECODED');
		expect(labelled).toBeTruthy();
	});

	it('renders an aria-hidden inner span (the visually animated layer is decorative)', () => {
		const { container } = render(ScrambledText, { props: { text: 'STATUS' } });
		const hidden = container.querySelector('[aria-hidden="true"]');
		expect(hidden).toBeTruthy();
	});

	it('settles to the supplied text when autoStart is false', () => {
		render(ScrambledText, { props: { text: 'Settled', autoStart: false } });
		// With autoStart=false, the visible inner span should already show the final text
		expect(screen.getByText('Settled')).toBeTruthy();
	});

	it('appends user-supplied class names without dropping the base class', () => {
		const { container } = render(ScrambledText, {
			props: { text: 'Mix', class: 'hero display-2' }
		});
		const wrapper = container.querySelector('.scrambled-text');
		expect(wrapper).not.toBeNull();
		expect(wrapper?.classList.contains('hero')).toBe(true);
		expect(wrapper?.classList.contains('display-2')).toBe(true);
	});

	it('does not throw when rendering empty text', () => {
		expect(() => render(ScrambledText, { props: { text: '' } })).not.toThrow();
	});
});
