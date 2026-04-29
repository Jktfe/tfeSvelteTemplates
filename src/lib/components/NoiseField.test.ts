import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import {
	pickIntensity,
	pickMode,
	isValidIntensity,
	isValidMode,
	clamp01,
	nextFilterId,
	isReducedMotion
} from './NoiseField.svelte';
import Harness from './NoiseFieldTestHarness.test.svelte';

describe('isValidIntensity', () => {
	it('accepts the three named intensities', () => {
		expect(isValidIntensity('fine')).toBe(true);
		expect(isValidIntensity('medium')).toBe(true);
		expect(isValidIntensity('coarse')).toBe(true);
	});

	it('rejects unknown / null / undefined', () => {
		expect(isValidIntensity('huge')).toBe(false);
		expect(isValidIntensity('')).toBe(false);
		expect(isValidIntensity(undefined)).toBe(false);
		expect(isValidIntensity(null)).toBe(false);
	});
});

describe('pickIntensity', () => {
	it('returns the fine config for "fine"', () => {
		const cfg = pickIntensity('fine');
		expect(cfg.baseFrequency).toBe(1.6);
		expect(cfg.numOctaves).toBe(2);
	});

	it('returns the medium config for "medium"', () => {
		const cfg = pickIntensity('medium');
		expect(cfg.baseFrequency).toBe(0.85);
		expect(cfg.numOctaves).toBe(3);
	});

	it('returns the coarse config for "coarse"', () => {
		const cfg = pickIntensity('coarse');
		expect(cfg.baseFrequency).toBe(0.4);
		expect(cfg.numOctaves).toBe(4);
	});

	it('falls back to medium for unknown name', () => {
		expect(pickIntensity('huge').baseFrequency).toBe(0.85);
	});

	it('falls back to medium for null/undefined', () => {
		expect(pickIntensity(undefined).baseFrequency).toBe(0.85);
		expect(pickIntensity(null).baseFrequency).toBe(0.85);
		expect(pickIntensity('').baseFrequency).toBe(0.85);
	});

	it('baseFrequency decreases monotonically across fine→medium→coarse', () => {
		expect(pickIntensity('fine').baseFrequency).toBeGreaterThan(pickIntensity('medium').baseFrequency);
		expect(pickIntensity('medium').baseFrequency).toBeGreaterThan(
			pickIntensity('coarse').baseFrequency
		);
	});

	it('numOctaves increases monotonically across fine→medium→coarse', () => {
		expect(pickIntensity('fine').numOctaves).toBeLessThan(pickIntensity('medium').numOctaves);
		expect(pickIntensity('medium').numOctaves).toBeLessThan(pickIntensity('coarse').numOctaves);
	});
});

describe('isValidMode', () => {
	it('accepts the three named modes', () => {
		expect(isValidMode('mono')).toBe(true);
		expect(isValidMode('chroma')).toBe(true);
		expect(isValidMode('retro')).toBe(true);
	});

	it('rejects unknown / null / undefined', () => {
		expect(isValidMode('rainbow')).toBe(false);
		expect(isValidMode('')).toBe(false);
		expect(isValidMode(undefined)).toBe(false);
		expect(isValidMode(null)).toBe(false);
	});
});

describe('pickMode', () => {
	it('returns "mono" for "mono"', () => {
		expect(pickMode('mono')).toBe('mono');
	});

	it('returns "chroma" for "chroma"', () => {
		expect(pickMode('chroma')).toBe('chroma');
	});

	it('returns "retro" for "retro"', () => {
		expect(pickMode('retro')).toBe('retro');
	});

	it('falls back to "mono" for unknown', () => {
		expect(pickMode('rainbow')).toBe('mono');
	});

	it('falls back to "mono" for null/undefined', () => {
		expect(pickMode(undefined)).toBe('mono');
		expect(pickMode(null)).toBe('mono');
		expect(pickMode('')).toBe('mono');
	});
});

describe('clamp01', () => {
	it('clamps below 0 to 0', () => {
		expect(clamp01(-5)).toBe(0);
	});

	it('clamps above 1 to 1', () => {
		expect(clamp01(2.5)).toBe(1);
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
});

describe('nextFilterId', () => {
	it('returns a string starting with the default prefix', () => {
		const id = nextFilterId();
		expect(id.startsWith('nf-')).toBe(true);
	});

	it('honours a custom prefix', () => {
		const id = nextFilterId('test');
		expect(id.startsWith('test-')).toBe(true);
	});

	it('produces unique values across calls', () => {
		const a = nextFilterId();
		const b = nextFilterId();
		const c = nextFilterId();
		expect(new Set([a, b, c]).size).toBe(3);
	});
});

describe('isReducedMotion', () => {
	it('returns a boolean', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('NoiseField render', () => {
	it('renders the wrapper and slotted children', () => {
		const { getByTestId } = render(Harness);
		expect(getByTestId('surface')).toBeTruthy();
		expect(getByTestId('inner-button')).toBeTruthy();
	});

	it('exposes a decorative overlay layer that is aria-hidden', () => {
		const { container } = render(Harness);
		const layer = container.querySelector('.noisefield-overlay');
		expect(layer).toBeTruthy();
		expect(layer?.getAttribute('aria-hidden')).toBe('true');
	});

	it('emits an SVG filter and a filtered rect inside the overlay', () => {
		const { container } = render(Harness);
		const overlay = container.querySelector('.noisefield-overlay');
		expect(overlay?.querySelector('filter')).toBeTruthy();
		expect(overlay?.querySelector('feTurbulence')).toBeTruthy();
		expect(overlay?.querySelector('feColorMatrix')).toBeTruthy();
		expect(overlay?.querySelector('rect')).toBeTruthy();
	});

	it('keeps the slotted child interactive (no pointer-events block on the wrapper itself)', () => {
		const { container } = render(Harness);
		const wrapper = container.querySelector('.noisefield-wrapper') as HTMLElement;
		expect(wrapper).toBeTruthy();
		const style = window.getComputedStyle(wrapper);
		expect(style.pointerEvents).not.toBe('none');
	});

	it('accepts each intensity variant without crashing', () => {
		for (const intensity of ['fine', 'medium', 'coarse'] as const) {
			const { container } = render(Harness, { props: { intensity } });
			expect(container.querySelector('.noisefield-wrapper')).toBeTruthy();
		}
	});

	it('accepts each mode variant without crashing', () => {
		for (const mode of ['mono', 'chroma', 'retro'] as const) {
			const { container } = render(Harness, { props: { mode } });
			expect(container.querySelector('.noisefield-wrapper')).toBeTruthy();
		}
	});

	it('exposes the resolved mode via data-noisefield-mode', () => {
		const { container } = render(Harness, { props: { mode: 'retro' } });
		const wrapper = container.querySelector('.noisefield-wrapper');
		expect(wrapper?.getAttribute('data-noisefield-mode')).toBe('retro');
	});

	it('falls back to mono when given an unknown mode', () => {
		const { container } = render(Harness, {
			// @ts-expect-error — intentionally passing an invalid value to verify the fallback
			props: { mode: 'rainbow' }
		});
		const wrapper = container.querySelector('.noisefield-wrapper');
		expect(wrapper?.getAttribute('data-noisefield-mode')).toBe('mono');
	});
});
