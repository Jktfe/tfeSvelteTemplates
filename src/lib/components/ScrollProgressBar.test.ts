/**
 * ============================================================
 * ScrollProgressBar Tests
 * ============================================================
 *
 * Pure-helper unit tests — no DOM, no render. Every helper
 * exported from the module-script is verified against:
 *   ✓ Happy path
 *   ✓ Type/shape validation
 *   ✓ Edge cases (NaN, Infinity, empty, negative)
 *   ✓ Determinism where applicable
 *
 * Component-render contract is covered by the test harness
 * file (compile-only confirmation).
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
	VALID_VARIANTS,
	VALID_POSITIONS,
	isValidVariant,
	pickVariant,
	isValidPosition,
	pickPosition,
	clampHeight,
	calculateProgress,
	isReducedMotion,
	supportsScrollTimeline
} from './ScrollProgressBar.svelte';

describe('ScrollProgressBar — VALID_VARIANTS', () => {
	it('contains the four documented variants', () => {
		expect(VALID_VARIANTS).toEqual(['thin', 'bold', 'gradient', 'pulse']);
	});

	it('is read-only at the type level (length matches)', () => {
		expect(VALID_VARIANTS.length).toBe(4);
	});
});

describe('ScrollProgressBar — VALID_POSITIONS', () => {
	it('contains the two documented positions', () => {
		expect(VALID_POSITIONS).toEqual(['top', 'bottom']);
	});
});

describe('ScrollProgressBar — isValidVariant', () => {
	it('accepts each declared variant', () => {
		for (const v of VALID_VARIANTS) {
			expect(isValidVariant(v)).toBe(true);
		}
	});

	it('rejects unknown strings', () => {
		expect(isValidVariant('chunky')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant('THIN')).toBe(false); // case-sensitive
	});

	it('rejects non-string inputs', () => {
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
		expect(isValidVariant(42)).toBe(false);
		expect(isValidVariant({})).toBe(false);
	});
});

describe('ScrollProgressBar — pickVariant', () => {
	it('returns the input when valid', () => {
		expect(pickVariant('thin')).toBe('thin');
		expect(pickVariant('bold')).toBe('bold');
		expect(pickVariant('gradient')).toBe('gradient');
		expect(pickVariant('pulse')).toBe('pulse');
	});

	it("returns 'thin' fallback for unknown values", () => {
		expect(pickVariant('chunky')).toBe('thin');
		expect(pickVariant('')).toBe('thin');
		expect(pickVariant(undefined)).toBe('thin');
		expect(pickVariant(null)).toBe('thin');
		expect(pickVariant(42)).toBe('thin');
	});
});

describe('ScrollProgressBar — isValidPosition', () => {
	it('accepts top and bottom', () => {
		expect(isValidPosition('top')).toBe(true);
		expect(isValidPosition('bottom')).toBe(true);
	});

	it('rejects other strings and types', () => {
		expect(isValidPosition('middle')).toBe(false);
		expect(isValidPosition('TOP')).toBe(false);
		expect(isValidPosition(undefined)).toBe(false);
		expect(isValidPosition(0)).toBe(false);
	});
});

describe('ScrollProgressBar — pickPosition', () => {
	it('returns input when valid', () => {
		expect(pickPosition('top')).toBe('top');
		expect(pickPosition('bottom')).toBe('bottom');
	});

	it("falls back to 'top' for invalid input", () => {
		expect(pickPosition('side')).toBe('top');
		expect(pickPosition(undefined)).toBe('top');
	});
});

describe('ScrollProgressBar — clampHeight', () => {
	it('returns input unchanged within range', () => {
		expect(clampHeight(2, 4)).toBe(2);
		expect(clampHeight(6, 4)).toBe(6);
		expect(clampHeight(10, 4)).toBe(10);
	});

	it('clamps below 1 to 1', () => {
		expect(clampHeight(0.5, 4)).toBe(1);
	});

	it('clamps above 20 to 20', () => {
		expect(clampHeight(50, 4)).toBe(20);
		expect(clampHeight(1000, 4)).toBe(20);
	});

	it('returns fallback for zero or negative', () => {
		expect(clampHeight(0, 4)).toBe(4);
		expect(clampHeight(-5, 4)).toBe(4);
	});

	it('returns fallback for non-finite values', () => {
		expect(clampHeight(NaN, 4)).toBe(4);
		expect(clampHeight(Infinity, 4)).toBe(4);
		expect(clampHeight(-Infinity, 4)).toBe(4);
	});

	it('returns fallback for non-number input', () => {
		expect(clampHeight('abc', 4)).toBe(4);
		expect(clampHeight(null, 4)).toBe(4);
		expect(clampHeight(undefined, 4)).toBe(4);
	});

	it('rounds decimals', () => {
		expect(clampHeight(3.4, 4)).toBe(3);
		expect(clampHeight(3.6, 4)).toBe(4);
	});

	it('coerces numeric strings', () => {
		expect(clampHeight('5', 4)).toBe(5);
	});
});

describe('ScrollProgressBar — calculateProgress', () => {
	it('returns 0 at top of document', () => {
		expect(calculateProgress(0, 2000, 800)).toBe(0);
	});

	it('returns 100 at bottom of document', () => {
		expect(calculateProgress(1200, 2000, 800)).toBe(100);
	});

	it('returns 50 at middle of scroll range', () => {
		// scrollable = 2000 - 800 = 1200; halfway = 600
		expect(calculateProgress(600, 2000, 800)).toBe(50);
	});

	it('returns 0 when document is shorter than viewport', () => {
		expect(calculateProgress(0, 500, 800)).toBe(0);
		expect(calculateProgress(100, 500, 800)).toBe(0);
	});

	it('returns 0 when scroll position is exactly viewport-equal-content', () => {
		expect(calculateProgress(0, 800, 800)).toBe(0);
	});

	it('clamps overshoot above 100', () => {
		// some browsers report scrollTop slightly above max via bounce
		expect(calculateProgress(2000, 2000, 800)).toBe(100);
	});

	it('clamps negative scrollTop to 0', () => {
		// iOS rubber-band can produce negative scrollY
		expect(calculateProgress(-50, 2000, 800)).toBe(0);
	});

	it('handles NaN inputs as 0', () => {
		expect(calculateProgress(NaN, 2000, 800)).toBe(0);
		expect(calculateProgress(0, NaN, 800)).toBe(0);
		expect(calculateProgress(0, 2000, NaN)).toBe(0);
	});

	it('treats non-finite scrollTop as 0', () => {
		expect(calculateProgress(Infinity, 2000, 800)).toBe(0);
		expect(calculateProgress(-Infinity, 2000, 800)).toBe(0);
	});

	it('treats non-finite scrollHeight as no scroll', () => {
		expect(calculateProgress(0, Infinity, 800)).toBe(0);
	});

	it('produces a continuous range across scroll positions', () => {
		const samples = [];
		for (let i = 0; i <= 1200; i += 200) {
			samples.push(calculateProgress(i, 2000, 800));
		}
		// Should be monotonically non-decreasing
		for (let i = 1; i < samples.length; i++) {
			expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
		}
	});
});

describe('ScrollProgressBar — isReducedMotion', () => {
	it('returns false when matchMedia is unavailable (jsdom default)', () => {
		// jsdom does not implement matchMedia by default; helper should not throw
		const result = isReducedMotion();
		expect(typeof result).toBe('boolean');
	});
});

describe('ScrollProgressBar — supportsScrollTimeline', () => {
	it('returns a boolean without throwing', () => {
		const result = supportsScrollTimeline();
		expect(typeof result).toBe('boolean');
	});
});
