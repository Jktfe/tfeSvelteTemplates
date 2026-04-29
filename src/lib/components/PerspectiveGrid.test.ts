import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import {
	pickIntensity,
	pickMode,
	isValidIntensity,
	isValidMode,
	clamp01,
	isReducedMotion
} from './PerspectiveGrid.svelte';
import Harness from './PerspectiveGridTestHarness.test.svelte';

describe('isValidIntensity', () => {
	it('accepts the three named intensities', () => {
		expect(isValidIntensity('calm')).toBe(true);
		expect(isValidIntensity('standard')).toBe(true);
		expect(isValidIntensity('rush')).toBe(true);
	});

	it('rejects unknown / null / undefined / non-strings', () => {
		expect(isValidIntensity('huge')).toBe(false);
		expect(isValidIntensity('')).toBe(false);
		expect(isValidIntensity(undefined)).toBe(false);
		expect(isValidIntensity(null)).toBe(false);
		expect(isValidIntensity(7)).toBe(false);
		expect(isValidIntensity({})).toBe(false);
	});
});

describe('pickIntensity', () => {
	it('returns the calm config for "calm"', () => {
		const cfg = pickIntensity('calm');
		expect(cfg.durationS).toBe(18);
		expect(cfg.cellPx).toBe(80);
		expect(cfg.lineOpacity).toBe(0.35);
	});

	it('returns the standard config for "standard"', () => {
		const cfg = pickIntensity('standard');
		expect(cfg.durationS).toBe(9);
		expect(cfg.cellPx).toBe(60);
		expect(cfg.lineOpacity).toBe(0.55);
	});

	it('returns the rush config for "rush"', () => {
		const cfg = pickIntensity('rush');
		expect(cfg.durationS).toBe(4);
		expect(cfg.cellPx).toBe(50);
		expect(cfg.lineOpacity).toBe(0.85);
	});

	it('falls back to standard for unknown name', () => {
		expect(pickIntensity('huge').durationS).toBe(9);
	});

	it('falls back to standard for null / undefined / empty', () => {
		expect(pickIntensity(undefined).durationS).toBe(9);
		expect(pickIntensity(null).durationS).toBe(9);
		expect(pickIntensity('').durationS).toBe(9);
	});

	it('duration decreases monotonically across calm → standard → rush', () => {
		expect(pickIntensity('calm').durationS).toBeGreaterThan(
			pickIntensity('standard').durationS
		);
		expect(pickIntensity('standard').durationS).toBeGreaterThan(
			pickIntensity('rush').durationS
		);
	});

	it('line opacity increases monotonically across calm → standard → rush', () => {
		expect(pickIntensity('calm').lineOpacity).toBeLessThan(
			pickIntensity('standard').lineOpacity
		);
		expect(pickIntensity('standard').lineOpacity).toBeLessThan(
			pickIntensity('rush').lineOpacity
		);
	});

	it('cell size decreases monotonically across calm → standard → rush', () => {
		expect(pickIntensity('calm').cellPx).toBeGreaterThan(pickIntensity('standard').cellPx);
		expect(pickIntensity('standard').cellPx).toBeGreaterThan(pickIntensity('rush').cellPx);
	});

	it('all three intensities produce positive finite numbers', () => {
		for (const name of ['calm', 'standard', 'rush'] as const) {
			const cfg = pickIntensity(name);
			expect(cfg.durationS).toBeGreaterThan(0);
			expect(cfg.cellPx).toBeGreaterThan(0);
			expect(cfg.lineOpacity).toBeGreaterThan(0);
			expect(cfg.lineOpacity).toBeLessThanOrEqual(1);
		}
	});
});

describe('isValidMode', () => {
	it('accepts the three named modes', () => {
		expect(isValidMode('mono')).toBe(true);
		expect(isValidMode('neon')).toBe(true);
		expect(isValidMode('wireframe')).toBe(true);
	});

	it('rejects unknown / null / undefined / non-strings', () => {
		expect(isValidMode('rainbow')).toBe(false);
		expect(isValidMode('')).toBe(false);
		expect(isValidMode(undefined)).toBe(false);
		expect(isValidMode(null)).toBe(false);
		expect(isValidMode(42)).toBe(false);
		expect(isValidMode({})).toBe(false);
	});
});

describe('pickMode', () => {
	it('returns "mono" for "mono"', () => {
		expect(pickMode('mono')).toBe('mono');
	});

	it('returns "neon" for "neon"', () => {
		expect(pickMode('neon')).toBe('neon');
	});

	it('returns "wireframe" for "wireframe"', () => {
		expect(pickMode('wireframe')).toBe('wireframe');
	});

	it('falls back to "mono" for unknown', () => {
		expect(pickMode('rainbow')).toBe('mono');
	});

	it('falls back to "mono" for null / undefined / empty', () => {
		expect(pickMode(undefined)).toBe('mono');
		expect(pickMode(null)).toBe('mono');
		expect(pickMode('')).toBe('mono');
	});
});

describe('clamp01', () => {
	it('clamps below 0 to 0', () => {
		expect(clamp01(-5)).toBe(0);
		expect(clamp01(-0.0001)).toBe(0);
	});

	it('clamps above 1 to 1', () => {
		expect(clamp01(2.5)).toBe(1);
		expect(clamp01(1.0001)).toBe(1);
	});

	it('passes through values inside [0, 1]', () => {
		expect(clamp01(0)).toBe(0);
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(1)).toBe(1);
	});

	it('treats NaN as 0', () => {
		expect(clamp01(NaN)).toBe(0);
	});

	it('treats ±Infinity as 0', () => {
		expect(clamp01(Infinity)).toBe(0);
		expect(clamp01(-Infinity)).toBe(0);
	});

	it('treats non-numeric input as 0', () => {
		expect(clamp01('0.5')).toBe(0);
		expect(clamp01(undefined)).toBe(0);
		expect(clamp01(null)).toBe(0);
		expect(clamp01({})).toBe(0);
	});
});

describe('isReducedMotion', () => {
	it('returns a boolean', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('PerspectiveGrid render', () => {
	it('renders the wrapper and slotted children', () => {
		const { getByTestId } = render(Harness);
		expect(getByTestId('surface')).toBeTruthy();
		expect(getByTestId('inner-button')).toBeTruthy();
	});

	it('exposes a decorative grid layer that is aria-hidden', () => {
		const { container } = render(Harness);
		const stage = container.querySelector('.pg-stage');
		expect(stage).toBeTruthy();
		expect(stage?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders a single floor plane by default (no ceiling)', () => {
		const { container } = render(Harness);
		expect(container.querySelector('.pg-floor')).toBeTruthy();
		expect(container.querySelector('.pg-ceiling')).toBeFalsy();
	});

	it('renders a ceiling plane when the ceiling prop is true', () => {
		const { container } = render(Harness, { props: { ceiling: true } });
		expect(container.querySelector('.pg-floor')).toBeTruthy();
		expect(container.querySelector('.pg-ceiling')).toBeTruthy();
	});

	it('keeps the slotted child interactive (no pointer-events block on the wrapper)', () => {
		const { container } = render(Harness);
		const wrapper = container.querySelector('.pg-wrapper') as HTMLElement;
		expect(wrapper).toBeTruthy();
		const style = window.getComputedStyle(wrapper);
		expect(style.pointerEvents).not.toBe('none');
	});

	it('accepts each intensity variant without crashing', () => {
		for (const intensity of ['calm', 'standard', 'rush'] as const) {
			const { container } = render(Harness, { props: { intensity } });
			expect(container.querySelector('.pg-wrapper')).toBeTruthy();
		}
	});

	it('accepts each mode variant without crashing', () => {
		for (const mode of ['mono', 'neon', 'wireframe'] as const) {
			const { container } = render(Harness, { props: { mode } });
			expect(container.querySelector('.pg-wrapper')).toBeTruthy();
		}
	});

	it('exposes the resolved mode via data-perspectivegrid-mode', () => {
		const { container } = render(Harness, { props: { mode: 'neon' } });
		const wrapper = container.querySelector('.pg-wrapper');
		expect(wrapper?.getAttribute('data-perspectivegrid-mode')).toBe('neon');
	});

	it('falls back to mono on the wrapper when given an unknown mode', () => {
		const { container } = render(Harness, {
			// @ts-expect-error — intentionally passing an invalid value to verify the fallback
			props: { mode: 'rainbow' }
		});
		const wrapper = container.querySelector('.pg-wrapper');
		expect(wrapper?.getAttribute('data-perspectivegrid-mode')).toBe('mono');
	});

	it('exposes the intensity via data-perspectivegrid-intensity', () => {
		const { container } = render(Harness, { props: { intensity: 'rush' } });
		const wrapper = container.querySelector('.pg-wrapper');
		expect(wrapper?.getAttribute('data-perspectivegrid-intensity')).toBe('rush');
	});

	it('writes the cell size and duration to inline custom properties', () => {
		const { container } = render(Harness, { props: { intensity: 'rush' } });
		const stage = container.querySelector('.pg-stage') as HTMLElement;
		expect(stage).toBeTruthy();
		expect(stage.style.getPropertyValue('--pg-cell')).toContain('50');
		expect(stage.style.getPropertyValue('--pg-duration')).toContain('4');
	});

	it('writes the resolved opacity to a CSS custom property', () => {
		const { container } = render(Harness, { props: { opacity: 0.5 } });
		const stage = container.querySelector('.pg-stage') as HTMLElement;
		expect(stage.style.getPropertyValue('--pg-opacity')).toBe('0.5');
	});

	it('clamps opacity above 1 to 1', () => {
		const { container } = render(Harness, { props: { opacity: 4 } });
		const stage = container.querySelector('.pg-stage') as HTMLElement;
		expect(stage.style.getPropertyValue('--pg-opacity')).toBe('1');
	});

	it('clamps opacity below 0 to 0', () => {
		const { container } = render(Harness, { props: { opacity: -2 } });
		const stage = container.querySelector('.pg-stage') as HTMLElement;
		expect(stage.style.getPropertyValue('--pg-opacity')).toBe('0');
	});
});
