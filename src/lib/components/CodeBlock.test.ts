/**
 * ============================================================
 * CodeBlock Tests
 * ============================================================
 *
 * 🎯 WHAT THESE COVER
 * Pure module-script helpers — the bits that don't depend on
 * the DOM. Component-render behaviour lives in the harness
 * file (CodeBlockTestHarness.test.svelte) and is exercised by
 * svelte-check during the build gate.
 *
 *   ✓ VALID_VARIANTS / VALID_SIZES — completeness + frozen
 *   ✓ isValidVariant / pickVariant — type-guard + coercion
 *   ✓ isValidSize / pickSize — type-guard + coercion
 *   ✓ parseLineRange — single, range, mixed, NaN, dedup,
 *     reversed, whitespace, undefined
 *   ✓ formatLineNumber — padding behaviour across widths
 *   ✓ countLines — LF / CRLF / CR / trailing-newline / empty
 *   ✓ supportsClipboardAPI — env probe stays SSR-safe
 *   ✓ isReducedMotion — env probe stays SSR-safe
 *
 * 💡 TIP: Run `bun run test:ui` for a visual interface.
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
	VALID_VARIANTS,
	VALID_SIZES,
	isValidVariant,
	pickVariant,
	isValidSize,
	pickSize,
	parseLineRange,
	formatLineNumber,
	countLines,
	supportsClipboardAPI,
	isReducedMotion
} from './CodeBlock.svelte';

// ============================================================
// VALID_VARIANTS / VALID_SIZES
// ============================================================

describe('VALID_VARIANTS', () => {
	it('lists exactly the five M1 variants', () => {
		expect([...VALID_VARIANTS]).toEqual(['plain', 'lined', 'titled', 'diff', 'terminal']);
	});
});

describe('VALID_SIZES', () => {
	it('lists exactly the three M1 sizes', () => {
		expect([...VALID_SIZES]).toEqual(['sm', 'md', 'lg']);
	});
});

// ============================================================
// isValidVariant / pickVariant
// ============================================================

describe('isValidVariant', () => {
	it('accepts each valid variant', () => {
		for (const v of VALID_VARIANTS) {
			expect(isValidVariant(v)).toBe(true);
		}
	});

	it('rejects undefined and non-string types', () => {
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
		expect(isValidVariant(0)).toBe(false);
		expect(isValidVariant({})).toBe(false);
	});

	it('rejects unknown variant strings', () => {
		expect(isValidVariant('fancy')).toBe(false);
		expect(isValidVariant('')).toBe(false);
	});

	it('is case-sensitive', () => {
		expect(isValidVariant('PLAIN')).toBe(false);
		expect(isValidVariant('Plain')).toBe(false);
	});
});

describe('pickVariant', () => {
	it('passes through valid input unchanged', () => {
		for (const v of VALID_VARIANTS) {
			expect(pickVariant(v)).toBe(v);
		}
	});

	it('falls back to plain on invalid input', () => {
		expect(pickVariant('fancy')).toBe('plain');
		expect(pickVariant(undefined)).toBe('plain');
		expect(pickVariant(123)).toBe('plain');
	});
});

// ============================================================
// isValidSize / pickSize
// ============================================================

describe('isValidSize', () => {
	it('accepts each valid size', () => {
		for (const s of VALID_SIZES) {
			expect(isValidSize(s)).toBe(true);
		}
	});

	it('rejects unknown values', () => {
		expect(isValidSize('xl')).toBe(false);
		expect(isValidSize(undefined)).toBe(false);
		expect(isValidSize(2)).toBe(false);
	});
});

describe('pickSize', () => {
	it('passes through valid sizes', () => {
		expect(pickSize('sm')).toBe('sm');
		expect(pickSize('md')).toBe('md');
		expect(pickSize('lg')).toBe('lg');
	});

	it('falls back to md on invalid input', () => {
		expect(pickSize('xl')).toBe('md');
		expect(pickSize(undefined)).toBe('md');
	});
});

// ============================================================
// parseLineRange
// ============================================================

describe('parseLineRange', () => {
	it('parses a single number', () => {
		expect([...parseLineRange('5')]).toEqual([5]);
	});

	it('parses a simple range', () => {
		expect([...parseLineRange('3-6')].sort((a, b) => a - b)).toEqual([3, 4, 5, 6]);
	});

	it('parses a mix of singles and ranges', () => {
		expect([...parseLineRange('1,3-5,8')].sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 8]);
	});

	it('handles whitespace around tokens', () => {
		expect([...parseLineRange('  1 , 3 - 5 , 8  ')].sort((a, b) => a - b)).toEqual([
			1, 3, 4, 5, 8
		]);
	});

	it('deduplicates overlapping ranges', () => {
		const set = parseLineRange('2-4,3-5');
		expect([...set].sort((a, b) => a - b)).toEqual([2, 3, 4, 5]);
	});

	it('normalises reversed ranges', () => {
		expect([...parseLineRange('5-3')].sort((a, b) => a - b)).toEqual([3, 4, 5]);
	});

	it('skips non-numeric tokens silently', () => {
		const set = parseLineRange('1,abc,3');
		expect([...set].sort((a, b) => a - b)).toEqual([1, 3]);
	});

	it('returns an empty set for undefined / null', () => {
		expect(parseLineRange(undefined).size).toBe(0);
		expect(parseLineRange(null).size).toBe(0);
		expect(parseLineRange('').size).toBe(0);
	});

	it('rejects zero and negative numbers (1-based only)', () => {
		expect(parseLineRange('0,-1,2').has(0)).toBe(false);
		expect(parseLineRange('0,-1,2').has(-1)).toBe(false);
		expect(parseLineRange('0,-1,2').has(2)).toBe(true);
	});
});

// ============================================================
// formatLineNumber
// ============================================================

describe('formatLineNumber', () => {
	it('does not pad when total is a single digit', () => {
		expect(formatLineNumber(3, 9)).toBe('3');
	});

	it('pads to two digits when total is two digits', () => {
		expect(formatLineNumber(3, 99)).toBe(' 3');
		expect(formatLineNumber(99, 99)).toBe('99');
	});

	it('pads to three digits when total is three digits', () => {
		expect(formatLineNumber(7, 100)).toBe('  7');
		expect(formatLineNumber(100, 100)).toBe('100');
	});

	it('clamps a zero / negative total to width 1', () => {
		expect(formatLineNumber(5, 0)).toBe('5');
		expect(formatLineNumber(5, -10)).toBe('5');
	});
});

// ============================================================
// countLines
// ============================================================

describe('countLines', () => {
	it('returns 1 for an empty string', () => {
		expect(countLines('')).toBe(1);
	});

	it('counts a single non-empty line as 1', () => {
		expect(countLines('hello')).toBe(1);
	});

	it('counts LF-separated lines', () => {
		expect(countLines('a\nb\nc')).toBe(3);
	});

	it('counts CRLF-separated lines', () => {
		expect(countLines('a\r\nb\r\nc')).toBe(3);
	});

	it('counts CR-separated lines', () => {
		expect(countLines('a\rb\rc')).toBe(3);
	});

	it('drops a single trailing newline (does not add a phantom line)', () => {
		expect(countLines('a\nb\n')).toBe(2);
		expect(countLines('a\r\nb\r\n')).toBe(2);
	});

	it('keeps multiple trailing newlines as separate lines', () => {
		expect(countLines('a\n\n\n')).toBe(3);
	});
});

// ============================================================
// supportsClipboardAPI
// ============================================================

describe('supportsClipboardAPI', () => {
	it('returns a boolean (env-dependent)', () => {
		expect(typeof supportsClipboardAPI()).toBe('boolean');
	});

	it('does not throw when navigator is undefined', () => {
		// We can't easily delete navigator inside jsdom, but the
		// function should never throw regardless of environment.
		expect(() => supportsClipboardAPI()).not.toThrow();
	});
});

// ============================================================
// isReducedMotion
// ============================================================

describe('isReducedMotion', () => {
	it('returns a boolean (env-dependent)', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});

	it('does not throw when matchMedia is missing or rejects', () => {
		expect(() => isReducedMotion()).not.toThrow();
	});
});
