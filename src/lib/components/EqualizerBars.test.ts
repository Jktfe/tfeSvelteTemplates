import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import {
	isValidVariant,
	pickVariant,
	clampSpeed,
	clampBars,
	clampHeight,
	seededHeights,
	isReducedMotion
} from './EqualizerBars.svelte';
import Harness from './EqualizerBarsTestHarness.test.svelte';

describe('isValidVariant', () => {
	it('accepts the four named variants', () => {
		expect(isValidVariant('equalizer')).toBe(true);
		expect(isValidVariant('spectrum')).toBe(true);
		expect(isValidVariant('pulse')).toBe(true);
		expect(isValidVariant('heartbeat')).toBe(true);
	});

	it('rejects unknown / null / undefined / non-strings', () => {
		expect(isValidVariant('flatline')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
		expect(isValidVariant(7)).toBe(false);
		expect(isValidVariant({})).toBe(false);
	});
});

describe('pickVariant', () => {
	it('returns the same name for valid variants', () => {
		expect(pickVariant('equalizer')).toBe('equalizer');
		expect(pickVariant('spectrum')).toBe('spectrum');
		expect(pickVariant('pulse')).toBe('pulse');
		expect(pickVariant('heartbeat')).toBe('heartbeat');
	});

	it('falls back to "equalizer" for unknown name', () => {
		expect(pickVariant('flatline')).toBe('equalizer');
	});

	it('falls back to "equalizer" for null / undefined / empty', () => {
		expect(pickVariant(undefined)).toBe('equalizer');
		expect(pickVariant(null)).toBe('equalizer');
		expect(pickVariant('')).toBe('equalizer');
	});
});

describe('clampSpeed', () => {
	it('clamps below 0.25 to 0.25', () => {
		expect(clampSpeed(0)).toBe(0.25);
		expect(clampSpeed(-3)).toBe(0.25);
		expect(clampSpeed(0.1)).toBe(0.25);
	});

	it('clamps above 4 to 4', () => {
		expect(clampSpeed(10)).toBe(4);
		expect(clampSpeed(4.0001)).toBe(4);
	});

	it('passes through values inside [0.25, 4]', () => {
		expect(clampSpeed(0.25)).toBe(0.25);
		expect(clampSpeed(1)).toBe(1);
		expect(clampSpeed(2.5)).toBe(2.5);
		expect(clampSpeed(4)).toBe(4);
	});

	it('treats NaN / ±Infinity / non-numeric as 1', () => {
		expect(clampSpeed(NaN)).toBe(1);
		expect(clampSpeed(Infinity)).toBe(1);
		expect(clampSpeed(-Infinity)).toBe(1);
		expect(clampSpeed('2')).toBe(1);
		expect(clampSpeed(undefined)).toBe(1);
		expect(clampSpeed(null)).toBe(1);
	});
});

describe('clampBars', () => {
	it('clamps below 1 to 1', () => {
		expect(clampBars(0)).toBe(1);
		expect(clampBars(-7)).toBe(1);
	});

	it('clamps above 64 to 64', () => {
		expect(clampBars(100)).toBe(64);
		expect(clampBars(65)).toBe(64);
	});

	it('floors fractional inputs', () => {
		expect(clampBars(12.9)).toBe(12);
		expect(clampBars(1.5)).toBe(1);
	});

	it('passes through integers inside [1, 64]', () => {
		expect(clampBars(1)).toBe(1);
		expect(clampBars(12)).toBe(12);
		expect(clampBars(64)).toBe(64);
	});

	it('treats NaN / ±Infinity / non-numeric as 12', () => {
		expect(clampBars(NaN)).toBe(12);
		expect(clampBars(Infinity)).toBe(12);
		expect(clampBars(-Infinity)).toBe(12);
		expect(clampBars('20')).toBe(12);
		expect(clampBars(undefined)).toBe(12);
		expect(clampBars(null)).toBe(12);
	});
});

describe('clampHeight', () => {
	it('clamps below 16 to 16', () => {
		expect(clampHeight(0)).toBe(16);
		expect(clampHeight(-50)).toBe(16);
		expect(clampHeight(15.9)).toBe(16);
	});

	it('clamps above 256 to 256', () => {
		expect(clampHeight(500)).toBe(256);
		expect(clampHeight(256.1)).toBe(256);
	});

	it('passes through values inside [16, 256]', () => {
		expect(clampHeight(16)).toBe(16);
		expect(clampHeight(48)).toBe(48);
		expect(clampHeight(128)).toBe(128);
		expect(clampHeight(256)).toBe(256);
	});

	it('treats NaN / ±Infinity / non-numeric as 48', () => {
		expect(clampHeight(NaN)).toBe(48);
		expect(clampHeight(Infinity)).toBe(48);
		expect(clampHeight(-Infinity)).toBe(48);
		expect(clampHeight('64')).toBe(48);
		expect(clampHeight(undefined)).toBe(48);
		expect(clampHeight(null)).toBe(48);
	});
});

describe('seededHeights', () => {
	it('returns an array whose length matches the clamped count', () => {
		expect(seededHeights(8, 1).length).toBe(8);
		expect(seededHeights(1, 1).length).toBe(1);
		expect(seededHeights(64, 1).length).toBe(64);
	});

	it('clamps the count into [1, 64] before generating', () => {
		expect(seededHeights(0, 1).length).toBe(1);
		expect(seededHeights(-3, 1).length).toBe(1);
		expect(seededHeights(200, 1).length).toBe(64);
	});

	it('produces values strictly inside [0.15, 1]', () => {
		const heights = seededHeights(64, 42);
		for (const h of heights) {
			expect(h).toBeGreaterThanOrEqual(0.15);
			expect(h).toBeLessThanOrEqual(1);
		}
	});

	it('is deterministic — the same seed yields the same array', () => {
		const a = seededHeights(16, 1234);
		const b = seededHeights(16, 1234);
		expect(a).toEqual(b);
	});

	it('produces different output for different seeds', () => {
		const a = seededHeights(16, 1);
		const b = seededHeights(16, 2);
		expect(a).not.toEqual(b);
	});

	it('is stable across calls with the same parameters', () => {
		const calls = Array.from({ length: 5 }, () => seededHeights(8, 99));
		for (let i = 1; i < calls.length; i++) {
			expect(calls[i]).toEqual(calls[0]);
		}
	});

	it('accepts a seed of 0 without collapsing to a constant array', () => {
		const heights = seededHeights(8, 0);
		expect(heights.length).toBe(8);
		const allEqual = heights.every((h) => h === heights[0]);
		expect(allEqual).toBe(false);
	});
});

describe('isReducedMotion', () => {
	it('returns a boolean', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('EqualizerBars render', () => {
	it('renders the wrapper with role="img" and ariaLabel', () => {
		const { container } = render(Harness, {
			props: { ariaLabel: 'Listening indicator' }
		});
		const wrapper = container.querySelector('.eq-wrapper');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('role')).toBe('img');
		expect(wrapper?.getAttribute('aria-label')).toBe('Listening indicator');
	});

	it('renders one .eq-bar per requested bar count', () => {
		const { container } = render(Harness, { props: { bars: 9 } });
		expect(container.querySelectorAll('.eq-bar').length).toBe(9);
	});

	it('clamps bar counts above 64 down to 64', () => {
		const { container } = render(Harness, { props: { bars: 200 } });
		expect(container.querySelectorAll('.eq-bar').length).toBe(64);
	});

	it('clamps bar counts below 1 up to 1', () => {
		const { container } = render(Harness, { props: { bars: 0 } });
		expect(container.querySelectorAll('.eq-bar').length).toBe(1);
	});

	it('exposes the resolved variant via data-equalizerbars-variant', () => {
		for (const variant of ['equalizer', 'spectrum', 'pulse', 'heartbeat'] as const) {
			const { container } = render(Harness, { props: { variant } });
			const wrapper = container.querySelector('.eq-wrapper');
			expect(wrapper?.getAttribute('data-equalizerbars-variant')).toBe(variant);
		}
	});

	it('falls back to "equalizer" when the variant is unknown', () => {
		const { container } = render(Harness, {
			// @ts-expect-error — intentionally passing an invalid value to verify the fallback
			props: { variant: 'flatline' }
		});
		const wrapper = container.querySelector('.eq-wrapper');
		expect(wrapper?.getAttribute('data-equalizerbars-variant')).toBe('equalizer');
	});

	it('reports active=true on the wrapper when active prop is true', () => {
		const { container } = render(Harness, { props: { active: true } });
		const wrapper = container.querySelector('.eq-wrapper');
		expect(wrapper?.getAttribute('data-equalizerbars-active')).toBe('true');
	});

	it('reports active=false on the wrapper when active prop is false', () => {
		const { container } = render(Harness, { props: { active: false } });
		const wrapper = container.querySelector('.eq-wrapper');
		expect(wrapper?.getAttribute('data-equalizerbars-active')).toBe('false');
	});

	it('writes --eq-color to the wrapper inline style for hex colours', () => {
		const { container } = render(Harness, { props: { color: '#ff3a6e' } });
		const wrapper = container.querySelector('.eq-wrapper') as HTMLElement;
		expect(wrapper.style.getPropertyValue('--eq-color')).toBe('#ff3a6e');
	});

	it('writes --eq-color = currentColor when color is "auto"', () => {
		const { container } = render(Harness, { props: { color: 'auto' } });
		const wrapper = container.querySelector('.eq-wrapper') as HTMLElement;
		expect(wrapper.style.getPropertyValue('--eq-color')).toBe('currentColor');
	});

	it('writes the height to the --eq-height custom property in px', () => {
		const { container } = render(Harness, { props: { height: 96 } });
		const wrapper = container.querySelector('.eq-wrapper') as HTMLElement;
		expect(wrapper.style.getPropertyValue('--eq-height')).toBe('96px');
	});

	it('clamps height above 256 down to 256', () => {
		const { container } = render(Harness, { props: { height: 999 } });
		const wrapper = container.querySelector('.eq-wrapper') as HTMLElement;
		expect(wrapper.style.getPropertyValue('--eq-height')).toBe('256px');
	});

	it('writes --eq-duration that scales inversely with the speed prop', () => {
		const { container: slow } = render(Harness, { props: { speed: 0.5 } });
		const slowStage = slow.querySelector('.eq-wrapper') as HTMLElement;
		const slowDur = parseFloat(slowStage.style.getPropertyValue('--eq-duration'));

		const { container: fast } = render(Harness, { props: { speed: 2 } });
		const fastStage = fast.querySelector('.eq-wrapper') as HTMLElement;
		const fastDur = parseFloat(fastStage.style.getPropertyValue('--eq-duration'));

		expect(slowDur).toBeGreaterThan(fastDur);
	});

	it('writes a per-bar --eq-idx custom property in document order', () => {
		const { container } = render(Harness, { props: { bars: 5 } });
		const bars = container.querySelectorAll<HTMLElement>('.eq-bar');
		bars.forEach((bar, i) => {
			expect(bar.style.getPropertyValue('--eq-idx')).toBe(String(i));
		});
	});

	it('writes a per-bar --eq-static-h custom property as a percentage', () => {
		const { container } = render(Harness, { props: { bars: 8, seed: 7 } });
		const bars = container.querySelectorAll<HTMLElement>('.eq-bar');
		for (const bar of bars) {
			const v = bar.style.getPropertyValue('--eq-static-h');
			expect(v).toMatch(/^\d+(\.\d+)?%$/);
		}
	});

	it('keeps each per-bar --eq-static-h within the seeded fraction range', () => {
		const { container } = render(Harness, { props: { bars: 16, seed: 42 } });
		const bars = container.querySelectorAll<HTMLElement>('.eq-bar');
		for (const bar of bars) {
			const v = parseFloat(bar.style.getPropertyValue('--eq-static-h'));
			expect(v).toBeGreaterThanOrEqual(15);
			expect(v).toBeLessThanOrEqual(100);
		}
	});

	it('marks every bar aria-hidden so screen readers see only the wrapper label', () => {
		const { container } = render(Harness, { props: { bars: 4 } });
		const bars = container.querySelectorAll('.eq-bar');
		for (const bar of bars) {
			expect(bar.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('accepts each variant + extreme speed without crashing', () => {
		for (const variant of ['equalizer', 'spectrum', 'pulse', 'heartbeat'] as const) {
			for (const speed of [0.25, 1, 4]) {
				const { container } = render(Harness, { props: { variant, speed } });
				expect(container.querySelector('.eq-wrapper')).toBeTruthy();
			}
		}
	});

	it('respects an extra class passed via the class prop', () => {
		const { container } = render(Harness, { props: { class: 'custom-eq' } });
		const wrapper = container.querySelector('.eq-wrapper');
		expect(wrapper?.classList.contains('custom-eq')).toBe(true);
	});
});
