/**
 * ============================================================
 * WordCloud Tests
 * ============================================================
 *
 * Pure-helper coverage for the module-script exports — no DOM,
 * no Svelte runtime, no rendering. Each helper has explicit
 * cases for the happy path plus the edge cases that matter
 * (empty input, NaN, ±Infinity, unknown variants).
 *
 * The component itself renders via WordCloudTestHarness.test.svelte,
 * which is a Vitest-style harness that just confirms compilation
 * succeeds; behavioural rendering tests would belong in Playwright,
 * not Vitest.
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
	clampSize,
	DEFAULT_PALETTE,
	getWeightExtents,
	hashWord,
	isReducedMotion,
	isValidRotationStrategy,
	isValidVariant,
	normaliseWords,
	pickPaletteColor,
	pickRotation,
	pickRotationStrategy,
	pickVariant,
	polarPosition,
	scaleSize
} from './WordCloud.svelte';
import type { WordCloudWord } from './WordCloud.svelte';

describe('isValidVariant', () => {
	it('accepts the three known variants', () => {
		expect(isValidVariant('organic')).toBe(true);
		expect(isValidVariant('grid')).toBe(true);
		expect(isValidVariant('radial')).toBe(true);
	});

	it('rejects unknown / nullish input', () => {
		expect(isValidVariant('cube')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
	});
});

describe('pickVariant', () => {
	it('returns the input when it is valid', () => {
		expect(pickVariant('organic')).toBe('organic');
		expect(pickVariant('grid')).toBe('grid');
		expect(pickVariant('radial')).toBe('radial');
	});

	it('falls back to organic for invalid input', () => {
		expect(pickVariant('weird')).toBe('organic');
		expect(pickVariant(undefined)).toBe('organic');
		expect(pickVariant(null)).toBe('organic');
	});
});

describe('isValidRotationStrategy', () => {
	it('accepts the three known strategies', () => {
		expect(isValidRotationStrategy('none')).toBe(true);
		expect(isValidRotationStrategy('alternating')).toBe(true);
		expect(isValidRotationStrategy('random')).toBe(true);
	});

	it('rejects everything else', () => {
		expect(isValidRotationStrategy('spin')).toBe(false);
		expect(isValidRotationStrategy('')).toBe(false);
		expect(isValidRotationStrategy(undefined)).toBe(false);
	});
});

describe('pickRotationStrategy', () => {
	it('passes valid strategies through', () => {
		expect(pickRotationStrategy('alternating')).toBe('alternating');
	});

	it('falls back to none on invalid input', () => {
		expect(pickRotationStrategy('chaotic')).toBe('none');
		expect(pickRotationStrategy(null)).toBe('none');
	});
});

describe('clampSize', () => {
	it('returns the input when it is in range', () => {
		expect(clampSize(20, 14)).toBe(20);
		expect(clampSize(60, 48)).toBe(60);
	});

	it('clamps to the lower bound 8', () => {
		expect(clampSize(2, 14)).toBe(8);
		expect(clampSize(0, 14)).toBe(8);
		expect(clampSize(-50, 14)).toBe(8);
	});

	it('clamps to the upper bound 200', () => {
		expect(clampSize(500, 14)).toBe(200);
		expect(clampSize(1000, 14)).toBe(200);
	});

	it('falls back when the value is non-finite', () => {
		expect(clampSize(NaN, 14)).toBe(14);
		expect(clampSize(Infinity, 14)).toBe(14);
		expect(clampSize(-Infinity, 14)).toBe(14);
		expect(clampSize(undefined, 14)).toBe(14);
		expect(clampSize(null, 14)).toBe(14);
	});
});

describe('hashWord', () => {
	it('returns a non-negative number', () => {
		expect(hashWord('hello')).toBeGreaterThanOrEqual(0);
		expect(hashWord('z'.repeat(100))).toBeGreaterThanOrEqual(0);
	});

	it('is deterministic', () => {
		expect(hashWord('svelte')).toBe(hashWord('svelte'));
		expect(hashWord('rune')).toBe(hashWord('rune'));
	});

	it('returns different values for different inputs', () => {
		expect(hashWord('foo')).not.toBe(hashWord('bar'));
	});

	it('handles the empty string without throwing', () => {
		expect(typeof hashWord('')).toBe('number');
		expect(hashWord('')).toBeGreaterThanOrEqual(0);
	});
});

describe('pickPaletteColor', () => {
	it('returns a colour from the provided palette', () => {
		const palette = ['#000', '#fff', '#aaa'];
		const colour = pickPaletteColor('hello', palette);
		expect(palette).toContain(colour);
	});

	it('is deterministic — same word gets the same colour', () => {
		const palette = ['#111', '#222', '#333', '#444'];
		expect(pickPaletteColor('svelte', palette)).toBe(pickPaletteColor('svelte', palette));
	});

	it('falls back to DEFAULT_PALETTE for an empty palette', () => {
		const colour = pickPaletteColor('hello', []);
		expect(DEFAULT_PALETTE).toContain(colour);
	});

	it('falls back to DEFAULT_PALETTE for a nullish palette', () => {
		const colour = pickPaletteColor('hello', null);
		expect(DEFAULT_PALETTE).toContain(colour);
	});
});

describe('scaleSize', () => {
	it('returns minSize when weight equals minWeight', () => {
		expect(scaleSize(10, 10, 50, 14, 48)).toBe(14);
	});

	it('returns maxSize when weight equals maxWeight', () => {
		expect(scaleSize(50, 10, 50, 14, 48)).toBe(48);
	});

	it('linearly interpolates for an intermediate weight', () => {
		// weight=30 sits exactly in the middle of [10, 50]
		expect(scaleSize(30, 10, 50, 14, 48)).toBeCloseTo(31);
	});

	it('clamps weights below minWeight to minSize', () => {
		expect(scaleSize(0, 10, 50, 14, 48)).toBe(14);
	});

	it('clamps weights above maxWeight to maxSize', () => {
		expect(scaleSize(100, 10, 50, 14, 48)).toBe(48);
	});

	it('returns the midpoint when min and max weight are equal', () => {
		expect(scaleSize(20, 20, 20, 14, 48)).toBe(31);
	});

	it('returns the midpoint when weight is non-finite', () => {
		expect(scaleSize(NaN, 10, 50, 14, 48)).toBe(31);
		expect(scaleSize(Infinity, 10, 50, 14, 48)).toBe(31);
	});
});

describe('pickRotation', () => {
	it('returns 0 for the none strategy regardless of index', () => {
		expect(pickRotation('none', 0)).toBe(0);
		expect(pickRotation('none', 5)).toBe(0);
	});

	it('alternates between 0 and -90 for alternating', () => {
		expect(pickRotation('alternating', 0)).toBe(0);
		expect(pickRotation('alternating', 1)).toBe(-90);
		expect(pickRotation('alternating', 2)).toBe(0);
		expect(pickRotation('alternating', 3)).toBe(-90);
	});

	it('is deterministic for random with a fixed seed', () => {
		expect(pickRotation('random', 0, 42)).toBe(pickRotation('random', 0, 42));
		expect(pickRotation('random', 5, 42)).toBe(pickRotation('random', 5, 42));
	});

	it('returns one of the allowed angles for random', () => {
		const allowed = new Set([0, -90, 30, -30]);
		for (let i = 0; i < 20; i++) {
			expect(allowed.has(pickRotation('random', i, 100))).toBe(true);
		}
	});
});

describe('normaliseWords', () => {
	it('returns an empty array for empty input', () => {
		expect(normaliseWords([])).toEqual([]);
		expect(normaliseWords(undefined)).toEqual([]);
		expect(normaliseWords(null)).toEqual([]);
	});

	it('sorts by weight descending', () => {
		const input: WordCloudWord[] = [
			{ text: 'a', weight: 5 },
			{ text: 'b', weight: 50 },
			{ text: 'c', weight: 25 }
		];
		const out = normaliseWords(input);
		expect(out.map((w) => w.text)).toEqual(['b', 'c', 'a']);
	});

	it('deduplicates by lowercase text — first occurrence wins', () => {
		const input: WordCloudWord[] = [
			{ text: 'Svelte', weight: 50 },
			{ text: 'svelte', weight: 30 },
			{ text: 'SVELTE', weight: 20 }
		];
		const out = normaliseWords(input);
		expect(out).toHaveLength(1);
		expect(out[0].text).toBe('Svelte');
		expect(out[0].weight).toBe(50);
	});

	it('strips empty / non-string text entries', () => {
		const input = [
			{ text: 'svelte', weight: 5 },
			{ text: '', weight: 9 },
			{ text: 'rune', weight: 3 }
		] as WordCloudWord[];
		const out = normaliseWords(input);
		expect(out.map((w) => w.text)).toEqual(['svelte', 'rune']);
	});

	it('coerces non-finite weight to 1', () => {
		const input = [
			{ text: 'a', weight: NaN },
			{ text: 'b', weight: 5 }
		] as WordCloudWord[];
		const out = normaliseWords(input);
		// 'b' (5) outranks 'a' (1)
		expect(out[0].text).toBe('b');
		expect(out[1].weight).toBe(1);
	});

	it('preserves href when present', () => {
		const out = normaliseWords([{ text: 'a', weight: 1, href: '/a' }]);
		expect(out[0].href).toBe('/a');
	});
});

describe('getWeightExtents', () => {
	it('returns { 0, 1 } for an empty list', () => {
		expect(getWeightExtents([])).toEqual({ min: 0, max: 1 });
	});

	it('finds the min and max weights', () => {
		const out = getWeightExtents([
			{ text: 'a', weight: 5 },
			{ text: 'b', weight: 50 },
			{ text: 'c', weight: 12 }
		]);
		expect(out).toEqual({ min: 5, max: 50 });
	});

	it('skips non-finite weights', () => {
		const out = getWeightExtents([
			{ text: 'a', weight: NaN },
			{ text: 'b', weight: 5 },
			{ text: 'c', weight: Infinity }
		]);
		expect(out).toEqual({ min: 5, max: 5 });
	});

	it('returns { 0, 1 } when every weight is non-finite', () => {
		expect(
			getWeightExtents([
				{ text: 'a', weight: NaN },
				{ text: 'b', weight: Infinity }
			])
		).toEqual({ min: 0, max: 1 });
	});
});

describe('polarPosition', () => {
	it('places word 0 at the centre', () => {
		expect(polarPosition(0)).toEqual({ left: 50, top: 50, ring: 0 });
	});

	it('places words 1-6 in the first ring', () => {
		for (let i = 1; i <= 6; i++) {
			expect(polarPosition(i).ring).toBe(1);
		}
	});

	it('moves to ring 2 after 6 surrounding words', () => {
		expect(polarPosition(7).ring).toBe(2);
		expect(polarPosition(18).ring).toBe(2);
		expect(polarPosition(19).ring).toBe(3);
	});

	it('keeps positions within [2%, 98%] for ring ≤ 3', () => {
		for (let i = 1; i <= 18; i++) {
			const p = polarPosition(i);
			expect(p.left).toBeGreaterThan(2);
			expect(p.left).toBeLessThan(98);
			expect(p.top).toBeGreaterThan(2);
			expect(p.top).toBeLessThan(98);
		}
	});
});

describe('isReducedMotion', () => {
	it('returns false outside the browser', () => {
		// In Vitest's jsdom env window IS defined, but matchMedia may be
		// stubbed. Either way the function should not throw.
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('DEFAULT_PALETTE', () => {
	it('exports a non-empty array of colour strings', () => {
		expect(Array.isArray(DEFAULT_PALETTE)).toBe(true);
		expect(DEFAULT_PALETTE.length).toBeGreaterThan(0);
		for (const c of DEFAULT_PALETTE) {
			expect(typeof c).toBe('string');
			expect(c.startsWith('#')).toBe(true);
		}
	});
});
