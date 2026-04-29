import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import {
	pickSize,
	pickPalette,
	clamp01,
	clampPositive,
	distanceSquared,
	nextTrailId,
	isReducedMotion
} from './PixelTrail.svelte';
import Harness from './PixelTrailTestHarness.test.svelte';

describe('pickSize', () => {
	it('returns small config (4px) for "small"', () => {
		const cfg = pickSize('small');
		expect(cfg.px).toBe(4);
		expect(cfg.throttlePx).toBe(6);
	});

	it('returns medium config (8px) for "medium"', () => {
		const cfg = pickSize('medium');
		expect(cfg.px).toBe(8);
		expect(cfg.throttlePx).toBe(10);
	});

	it('returns large config (16px) for "large"', () => {
		const cfg = pickSize('large');
		expect(cfg.px).toBe(16);
		expect(cfg.throttlePx).toBe(18);
	});

	it('falls back to medium for unknown name', () => {
		expect(pickSize('huge').px).toBe(8);
	});

	it('falls back to medium for null/undefined', () => {
		expect(pickSize(undefined).px).toBe(8);
		expect(pickSize('').px).toBe(8);
	});

	it('px increases monotonically across sizes', () => {
		expect(pickSize('small').px).toBeLessThan(pickSize('medium').px);
		expect(pickSize('medium').px).toBeLessThan(pickSize('large').px);
	});

	it('throttlePx is always >= px', () => {
		for (const name of ['small', 'medium', 'large']) {
			const cfg = pickSize(name);
			expect(cfg.throttlePx).toBeGreaterThanOrEqual(cfg.px);
		}
	});
});

describe('pickPalette', () => {
	it('returns mono-white palette', () => {
		const p = pickPalette('mono-white');
		expect(p.colors[0]).toBe('#ffffff');
		expect(p.colors.length).toBeGreaterThanOrEqual(2);
	});

	it('returns cyber-cyan palette', () => {
		const p = pickPalette('cyber-cyan');
		expect(p.colors[0]).toBe('#00f0ff');
		expect(p.shadow).toContain('0, 191, 255');
	});

	it('returns sunset-warm palette', () => {
		const p = pickPalette('sunset-warm');
		expect(p.colors[0]).toBe('#ffea00');
	});

	it('falls back to mono-white for unknown name', () => {
		expect(pickPalette('rainbow').colors[0]).toBe('#ffffff');
	});

	it('falls back to mono-white for undefined', () => {
		expect(pickPalette(undefined).colors[0]).toBe('#ffffff');
	});

	it('every palette has at least 2 colors and a shadow', () => {
		for (const name of ['mono-white', 'cyber-cyan', 'sunset-warm']) {
			const p = pickPalette(name);
			expect(p.colors.length).toBeGreaterThanOrEqual(2);
			expect(p.shadow.length).toBeGreaterThan(0);
		}
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
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(0)).toBe(0);
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

describe('clampPositive', () => {
	it('clamps negatives to 0', () => {
		expect(clampPositive(-10)).toBe(0);
	});

	it('clamps to a custom max', () => {
		expect(clampPositive(150, 100)).toBe(100);
	});

	it('passes through values inside [0, max]', () => {
		expect(clampPositive(50, 100)).toBe(50);
	});

	it('treats NaN/Infinity as 0', () => {
		expect(clampPositive(NaN, 100)).toBe(0);
		expect(clampPositive(Infinity, 100)).toBe(0);
		expect(clampPositive(-Infinity, 100)).toBe(0);
	});
});

describe('distanceSquared', () => {
	it('returns 0 for the same point', () => {
		expect(distanceSquared(5, 5, 5, 5)).toBe(0);
	});

	it('returns squared Euclidean distance', () => {
		expect(distanceSquared(0, 0, 3, 4)).toBe(25);
		expect(distanceSquared(0, 0, 6, 8)).toBe(100);
	});

	it('is symmetric', () => {
		expect(distanceSquared(2, 3, 7, 11)).toBe(distanceSquared(7, 11, 2, 3));
	});

	it('handles negative coordinates', () => {
		expect(distanceSquared(-3, -4, 0, 0)).toBe(25);
	});
});

describe('nextTrailId', () => {
	it('returns a string starting with the default prefix', () => {
		const id = nextTrailId();
		expect(id.startsWith('pt-')).toBe(true);
	});

	it('honours a custom prefix', () => {
		const id = nextTrailId('test');
		expect(id.startsWith('test-')).toBe(true);
	});

	it('produces unique values across calls', () => {
		const a = nextTrailId();
		const b = nextTrailId();
		const c = nextTrailId();
		expect(new Set([a, b, c]).size).toBe(3);
	});
});

describe('isReducedMotion', () => {
	it('returns a boolean', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('PixelTrail render', () => {
	it('renders the wrapper and slotted children', () => {
		const { getByTestId } = render(Harness);
		expect(getByTestId('surface')).toBeTruthy();
		expect(getByTestId('inner-button')).toBeTruthy();
	});

	it('exposes a decorative trail layer that is aria-hidden', () => {
		const { container } = render(Harness);
		const layer = container.querySelector('.trail-layer');
		expect(layer).toBeTruthy();
		expect(layer?.getAttribute('aria-hidden')).toBe('true');
	});

	it('keeps the wrapped child interactive (no pointer-events block on the wrapper itself)', () => {
		const { container } = render(Harness);
		const wrapper = container.querySelector('.pixel-trail-wrapper') as HTMLElement;
		expect(wrapper).toBeTruthy();
		const style = window.getComputedStyle(wrapper);
		expect(style.pointerEvents).not.toBe('none');
	});

	it('accepts each size variant without crashing', () => {
		for (const size of ['small', 'medium', 'large'] as const) {
			const { container } = render(Harness, { props: { size } });
			expect(container.querySelector('.pixel-trail-wrapper')).toBeTruthy();
		}
	});

	it('accepts each palette variant without crashing', () => {
		for (const palette of ['mono-white', 'cyber-cyan', 'sunset-warm'] as const) {
			const { container } = render(Harness, { props: { palette } });
			expect(container.querySelector('.pixel-trail-wrapper')).toBeTruthy();
		}
	});
});
