/**
 * ============================================================
 * VariableProximity Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers (distance, falloff, axisInterpolate,
 *     buildVariationSettings, isVariableFontSupported,
 *     splitToLetters) — exported from the module-script. We
 *     can test the maths without rendering the DOM.
 *  2. Component render — mount the phrase, confirm each
 *     non-space char becomes a per-letter aria-hidden span
 *     and the wrapper carries the full string as aria-label
 *     for screen readers.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import VariableProximity, {
	axisInterpolate,
	buildVariationSettings,
	distance,
	falloff,
	isVariableFontSupported,
	splitToLetters,
	type AxisRange
} from './VariableProximity.svelte';

afterEach(() => {
	cleanup();
});

describe('VariableProximity helpers', () => {
	describe('distance', () => {
		it('returns 0 when both points are equal', () => {
			expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
		});

		it('computes the classic 3-4-5 triangle', () => {
			expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
		});

		it('is symmetric: d(a,b) === d(b,a)', () => {
			const a = { x: -2, y: 7 };
			const b = { x: 11, y: -3 };
			expect(distance(a, b)).toBe(distance(b, a));
		});

		it('handles negative coordinates correctly', () => {
			expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
		});
	});

	describe('falloff', () => {
		it('returns 1 at the centre (d = 0)', () => {
			expect(falloff(0, 100, 'linear')).toBe(1);
			expect(falloff(0, 100, 'quadratic')).toBe(1);
			expect(falloff(0, 100, 'gaussian')).toBe(1);
		});

		it('returns 0 at and beyond the radius', () => {
			expect(falloff(100, 100, 'linear')).toBe(0);
			expect(falloff(150, 100, 'linear')).toBe(0);
			expect(falloff(100, 100, 'quadratic')).toBe(0);
			expect(falloff(100, 100, 'gaussian')).toBe(0);
		});

		it('linear falloff is the triangular t = 1 - d/radius', () => {
			expect(falloff(50, 100, 'linear')).toBeCloseTo(0.5, 5);
			expect(falloff(25, 100, 'linear')).toBeCloseTo(0.75, 5);
		});

		it('quadratic falloff squares the linear t (smoother shoulder)', () => {
			expect(falloff(50, 100, 'quadratic')).toBeCloseTo(0.25, 5);
			expect(falloff(25, 100, 'quadratic')).toBeCloseTo(0.5625, 5);
		});

		it('gaussian falloff is bell-shaped with peak at centre', () => {
			// At d=0, gx=0, exp(0)=1
			expect(falloff(0, 100, 'gaussian')).toBe(1);
			// Falls off faster than linear in the middle (narrower bell)
			const lin = falloff(50, 100, 'linear');
			const gau = falloff(50, 100, 'gaussian');
			expect(gau).toBeLessThan(lin);
		});

		it('returns 0 when radius is 0 (defensive — never divides by 0)', () => {
			expect(falloff(0, 0, 'linear')).toBe(0);
			expect(falloff(50, 0, 'quadratic')).toBe(0);
		});

		it('treats negative radius as 0 (defensive)', () => {
			expect(falloff(10, -5, 'linear')).toBe(0);
		});
	});

	describe('axisInterpolate', () => {
		it('t=0 returns base', () => {
			expect(axisInterpolate(0, 400, 800)).toBe(400);
		});

		it('t=1 returns peak', () => {
			expect(axisInterpolate(1, 400, 800)).toBe(800);
		});

		it('t=0.5 returns the midpoint', () => {
			expect(axisInterpolate(0.5, 400, 800)).toBe(600);
		});

		it('handles a descending range (peak < base) — useful for slnt going negative', () => {
			expect(axisInterpolate(0, 0, -15)).toBe(0);
			expect(axisInterpolate(1, 0, -15)).toBe(-15);
			expect(axisInterpolate(0.5, 0, -15)).toBe(-7.5);
		});
	});

	describe('buildVariationSettings', () => {
		const wghtAxis: AxisRange[] = [{ axis: 'wght', base: 400, peak: 800 }];
		const twoAxes: AxisRange[] = [
			{ axis: 'wght', base: 400, peak: 800 },
			{ axis: 'wdth', base: 100, peak: 125 }
		];

		it('formats one axis at proximity=0 (base value)', () => {
			expect(buildVariationSettings(wghtAxis, 0)).toBe('"wght" 400.00');
		});

		it('formats one axis at proximity=1 (peak value)', () => {
			expect(buildVariationSettings(wghtAxis, 1)).toBe('"wght" 800.00');
		});

		it('formats two axes joined by ", "', () => {
			expect(buildVariationSettings(twoAxes, 0.5)).toBe('"wght" 600.00, "wdth" 112.50');
		});

		it('uses two-decimal precision (variable fonts quantise internally)', () => {
			const out = buildVariationSettings(wghtAxis, 1 / 3);
			// Value should be 400 + (800-400)/3 ≈ 533.33
			expect(out).toMatch(/^"wght" 533\.33$/);
		});

		it('returns an empty string when given no axes', () => {
			expect(buildVariationSettings([], 0.5)).toBe('');
		});
	});

	describe('isVariableFontSupported', () => {
		it('returns a boolean — true on engines that handle font-variation-settings', () => {
			const result = isVariableFontSupported();
			expect(typeof result).toBe('boolean');
		});
	});

	describe('splitToLetters', () => {
		it('returns [] for an empty string', () => {
			expect(splitToLetters('')).toEqual([]);
		});

		it('flags whitespace tokens with isSpace=true', () => {
			const out = splitToLetters('a b');
			expect(out).toHaveLength(3);
			expect(out[0]).toEqual({ char: 'a', isSpace: false });
			expect(out[1]).toEqual({ char: ' ', isSpace: true });
			expect(out[2]).toEqual({ char: 'b', isSpace: false });
		});

		it('treats tabs and newlines as space tokens', () => {
			const out = splitToLetters('x\ty\nz');
			expect(out[1].isSpace).toBe(true);
			expect(out[3].isSpace).toBe(true);
		});

		it('honours surrogate-pair characters as one token (e.g. emoji)', () => {
			// Naive split would yield 2 tokens for a surrogate-pair emoji; we want 1.
			const out = splitToLetters('a🌊b');
			expect(out).toHaveLength(3);
			expect(out[1].char).toBe('🌊');
			expect(out[1].isSpace).toBe(false);
		});
	});
});

describe('VariableProximity component', () => {
	it('renders one letter span per non-space character', () => {
		const { container } = render(VariableProximity, { props: { text: 'abc' } });
		const letters = container.querySelectorAll('.letter');
		expect(letters).toHaveLength(3);
		expect(letters[0].textContent).toBe('a');
		expect(letters[1].textContent).toBe('b');
		expect(letters[2].textContent).toBe('c');
	});

	it('renders dedicated space spans for whitespace, not letter spans', () => {
		const { container } = render(VariableProximity, { props: { text: 'a b' } });
		expect(container.querySelectorAll('.letter')).toHaveLength(2);
		expect(container.querySelectorAll('.space')).toHaveLength(1);
	});

	it('marks the wrapper with the full text as aria-label so screen readers see one string', () => {
		const phrase = 'Welcome aboard';
		const { container } = render(VariableProximity, { props: { text: phrase } });
		const wrapper = container.querySelector('.variable-proximity');
		expect(wrapper?.getAttribute('aria-label')).toBe(phrase);
	});

	it('hides per-letter spans from assistive tech (aria-hidden="true")', () => {
		const { container } = render(VariableProximity, { props: { text: 'hi' } });
		const letters = container.querySelectorAll('.letter');
		for (const el of letters) {
			expect(el.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('makes the wrapper keyboard-focusable (tabindex="0")', () => {
		const { container } = render(VariableProximity, { props: { text: 'focus me' } });
		const wrapper = container.querySelector('.variable-proximity');
		expect(wrapper?.getAttribute('tabindex')).toBe('0');
	});

	it('exposes transitionMs as the --vp-transition-ms CSS custom property', () => {
		const { container } = render(VariableProximity, {
			props: { text: 'x', transitionMs: 250 }
		});
		const wrapper = container.querySelector('.variable-proximity') as HTMLElement;
		expect(wrapper?.getAttribute('style')).toContain('--vp-transition-ms: 250ms');
	});

	it('appends user-supplied class names to the wrapper', () => {
		const { container } = render(VariableProximity, {
			props: { text: 'styled', class: 'hero display-1' }
		});
		const wrapper = container.querySelector('.variable-proximity');
		expect(wrapper?.classList.contains('hero')).toBe(true);
		expect(wrapper?.classList.contains('display-1')).toBe(true);
	});

	it('renders nothing letter-shaped for an empty phrase', () => {
		const { container } = render(VariableProximity, { props: { text: '' } });
		expect(container.querySelectorAll('.letter')).toHaveLength(0);
		expect(container.querySelectorAll('.space')).toHaveLength(0);
	});
});
